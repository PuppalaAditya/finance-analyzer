import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const toneMap = {
  blue: "text-accentBlue",
  teal: "text-accentTeal",
  amber: "text-accentAmber",
  rose: "text-rose-300"
};

const InsightCard = ({ title, items, tone = "blue", icon: Icon = Sparkles }) => {
  if (!items || !items.length) return null;

  return (
    <motion.div
      className="surface-panel p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ${toneMap[tone] || toneMap.blue}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-textSecondary">
            {title}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Grounded highlights extracted from the report.
          </p>
        </div>
      </div>
      <ul className="mt-5 space-y-3 text-sm text-textSecondary">
        {items.map((item, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={idx} className="flex gap-3">
            <span
              className={`mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full ${toneMap[tone] || toneMap.blue} bg-current`}
            />
            <span className="leading-7">{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default InsightCard;
