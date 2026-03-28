import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowUpRight, BotMessageSquare, Clock3 } from "lucide-react";
import Loader from "./Loader";
import { formatChatTime } from "../utils/formatters";

const createMessage = (role, content) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
  timestamp: new Date().toISOString()
});

const ChatWindow = ({
  onSend,
  loading,
  reportName,
  draftPrompt,
  onPromptConsumed
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!draftPrompt) return;

    setInput(draftPrompt);
    onPromptConsumed?.();
    inputRef.current?.focus();
  }, [draftPrompt, onPromptConsumed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = createMessage("user", input.trim());
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const reply = await onSend(userMessage.content);

    if (reply) {
      setMessages((prev) => [...prev, createMessage("assistant", reply)]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSubmit(event);
    }
  };

  return (
    <div className="surface-panel flex min-h-[640px] flex-col overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accentBlue/20 to-accentTeal/20 text-accentBlue">
              <BotMessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Report Conversation Workspace
              </p>
              <p className="mt-1 text-xs text-textSecondary">
                {reportName
                  ? `Grounded on ${reportName}`
                  : "Upload a report to start a grounded conversation."}
              </p>
            </div>
          </div>
          <span className="metric-chip">
            <span
              className="h-2 w-2 rounded-full bg-accentTeal"
              style={{ animation: "pulse-dot 1.8s infinite" }}
            />
            {loading ? "Analyzing" : "Ready"}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-5 py-5 text-sm"
      >
        {!messages.length && (
          <div className="surface-panel-muted mt-10 rounded-[24px] px-6 py-8 text-center">
            <p className="text-base font-medium text-white">
              Ask targeted questions about revenue, leverage, cash generation,
              liquidity, or the management commentary.
            </p>
            <p className="mt-3 text-sm leading-7 text-textSecondary">
              The assistant stays grounded in the uploaded report so the answers
              remain auditable and tied to source context.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <motion.div
            key={message.id}
            className={`max-w-[85%] rounded-[24px] px-4 py-4 ${
              message.role === "user"
                ? "ml-auto bg-gradient-to-br from-accentBlue/[0.18] to-accentTeal/[0.12] text-white"
                : "mr-auto border border-white/5 bg-backgroundSecondary/80 text-slate-100"
            }`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-textSecondary">
                {message.role === "user" ? "Analyst" : "Financial Decoder AI"}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-textSecondary">
                <Clock3 className="h-3 w-3" />
                {formatChatTime(message.timestamp)}
              </span>
            </div>

            {message.role === "assistant" ? (
              <div className="markdown-chat mt-3">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="mt-3 whitespace-pre-wrap leading-7 text-white">
                {message.content}
              </p>
            )}
          </motion.div>
        ))}

        <AnimatePresence>
          {loading ? (
            <motion.div
              key="typing"
              className="mr-auto max-w-[70%] rounded-[24px] border border-white/5 bg-backgroundSecondary/80 px-4 py-4"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-textSecondary">
                Financial Decoder AI
              </p>
              <div className="mt-3">
                <Loader label="Reviewing the filing" compact />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/5 px-5 py-4">
        <div className="w-full rounded-[24px] border border-white/5 bg-background/45 px-4 py-3">
          <textarea
            ref={inputRef}
            className="min-h-[72px] w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-textSecondary"
            placeholder="Ask a question about this financial report..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-textSecondary">
              Press Enter to send. Use Shift+Enter for a new line.
            </p>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="fin-button px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
