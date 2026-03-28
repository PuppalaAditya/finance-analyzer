import { useState } from "react";
import {
  BotMessageSquare,
  ChevronRight,
  FileText,
  MessageSquareText,
  ShieldAlert
} from "lucide-react";
import FileUploader from "../components/FileUploader";
import ChatWindow from "../components/ChatWindow";
import SectionHeader from "../components/SectionHeader";
import { chatWithDocument } from "../services/api";

const promptSuggestions = [
  {
    id: "revenue",
    label: "Revenue quality",
    prompt:
      "Summarize revenue growth, segment drivers, and whether the topline trajectory looks durable."
  },
  {
    id: "leverage",
    label: "Leverage check",
    prompt:
      "How leveraged is the balance sheet and what should I watch in debt service coverage or refinancing risk?"
  },
  {
    id: "risks",
    label: "Management risks",
    prompt:
      "What are the top three risks management calls out in the report and how material do they seem?"
  },
  {
    id: "cash",
    label: "Cash generation",
    prompt:
      "Explain the company’s cash flow profile and whether earnings quality looks strong."
  }
];

const guidance = [
  "Answers are grounded in the uploaded report rather than general market commentary.",
  "Use it to interrogate profitability, liquidity, debt, management tone, and risk disclosures.",
  "Keep prompts specific to extract more decision-useful responses."
];

const Chat = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draftPrompt, setDraftPrompt] = useState("");

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    setError("");
  };

  const handleSend = async (question) => {
    if (!file) {
      setError("Upload a PDF first.");
      return "";
    }

    setLoading(true);
    setError("");

    try {
      const res = await chatWithDocument(file, question);
      return res.answer;
    } catch {
      setError("Chat failed. Check backend logs.");
      return "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="AI Chat"
        title="Ask grounded questions about any annual report."
        description="Use the chat workspace to interrogate a filing, pressure-test the investment case, and extract precise financial answers."
        action={
          <span className="metric-chip">
            <BotMessageSquare className="h-3.5 w-3.5" />
            {file ? "Report loaded" : "Waiting for upload"}
          </span>
        }
      />

      <div className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.35fr]">
        <div className="space-y-6">
          <FileUploader
            onFileSelected={handleFile}
            label="Upload report for AI chat"
            description="Load a report and ask targeted questions about margins, capital allocation, risk factors, and management commentary."
            buttonLabel="Upload for chat"
          />

          {file ? (
            <div className="surface-panel p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
                Active report
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {file.name}
              </p>
              <p className="mt-2 text-sm text-textSecondary">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : null}

          <div className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accentBlue/20 to-accentTeal/[0.14] text-accentBlue">
                <MessageSquareText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
                  Suggested prompts
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Seed the conversation with high-signal questions.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {promptSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDraftPrompt(item.prompt)}
                  className="flex w-full items-center justify-between gap-3 rounded-[22px] border border-white/5 bg-background/40 px-4 py-4 text-left transition hover:border-accentBlue/25 hover:bg-white/[0.04]"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-textSecondary">
                      {item.prompt}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-textSecondary" />
                </button>
              ))}
            </div>
          </div>

          <div className="surface-panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accentAmber/[0.12] text-accentAmber">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
                  Chat guidance
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  Best practices for grounded answers.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {guidance.map((item) => (
                <div key={item} className="flex gap-3">
                  <FileText className="mt-1 h-4 w-4 flex-shrink-0 text-accentTeal" />
                  <p className="text-sm leading-7 text-textSecondary">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {error ? (
            <div className="surface-panel border border-rose-400/20 bg-rose-400/5 p-5 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </div>

        <ChatWindow
          onSend={handleSend}
          loading={loading}
          reportName={file?.name}
          draftPrompt={draftPrompt}
          onPromptConsumed={() => setDraftPrompt("")}
        />
      </div>
    </div>
  );
};

export default Chat;
