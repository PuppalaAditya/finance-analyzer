import { motion } from "framer-motion";

const colors = ["#3B82F6", "#14B8A6", "#F59E0B"];

const Loader = ({ label = "Processing", compact = false }) => {
  return (
    <div
      className={`flex items-center gap-3 text-textSecondary ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          // eslint-disable-next-line react/no-array-index-key
          <motion.span
            key={i}
            className={compact ? "h-1.5 w-1.5 rounded-full" : "h-2 w-2 rounded-full"}
            style={{ backgroundColor: colors[i] }}
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              delay: i * 0.15,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      <span>{label}…</span>
    </div>
  );
};

export default Loader;
