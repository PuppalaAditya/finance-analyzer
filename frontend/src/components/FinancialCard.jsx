import { motion } from "framer-motion";

const toneMap = {
  positive: {
    accent: "text-emerald-300",
    icon: "from-emerald-400/[0.18] to-emerald-400/[0.08]",
    pill: "bg-emerald-400/[0.12] text-emerald-200"
  },
  negative: {
    accent: "text-rose-300",
    icon: "from-rose-400/[0.16] to-rose-400/[0.08]",
    pill: "bg-rose-400/[0.12] text-rose-200"
  },
  highlight: {
    accent: "text-accentAmber",
    icon: "from-accentAmber/[0.18] to-accentAmber/[0.08]",
    pill: "bg-accentAmber/[0.12] text-accentAmber"
  },
  neutral: {
    accent: "text-accentBlue",
    icon: "from-accentBlue/20 to-accentTeal/10",
    pill: "bg-white/[0.08] text-textSecondary"
  }
};

const FinancialCard = ({
  title,
  value,
  subtitle,
  tone = "neutral",
  changeLabel,
  icon: Icon
}) => {
  const styles = toneMap[tone] || toneMap.neutral;

  return (
    <motion.div
      className="surface-panel p-5"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-textSecondary">
            {title}
          </p>
          <p className={`mt-3 text-2xl font-semibold ${styles.accent}`}>
            {value}
          </p>
        </div>
        {Icon ? (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${styles.icon} text-white/90`}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {(subtitle || changeLabel) && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-textSecondary">{subtitle}</p>
          {changeLabel ? (
            <span className={`rounded-full px-2.5 py-1 text-xs ${styles.pill}`}>
              {changeLabel}
            </span>
          ) : null}
        </div>
      )}
    </motion.div>
  );
};

export default FinancialCard;
