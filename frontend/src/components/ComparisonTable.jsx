import { motion } from "framer-motion";

const ComparisonTable = ({
  rows,
  companyLabels = ["Company A", "Company B"],
  title = "Comparison Matrix",
  description = "Side-by-side benchmark of the two selected companies."
}) => {
  if (!rows || !rows.length) return null;

  return (
    <motion.div
      className="surface-panel overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-textSecondary">
            {title}
          </p>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <span className="metric-chip">{companyLabels[0]}</span>
          <span className="metric-chip">{companyLabels[1]}</span>
        </div>
      </div>

      <div className="max-h-[430px] overflow-auto text-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-backgroundSecondary/80 text-textSecondary">
            <tr>
              <th className="border-b border-white/5 px-5 py-3 text-left font-medium uppercase tracking-[0.18em]">
                Metric
              </th>
              <th className="border-b border-white/5 px-5 py-3 text-left font-medium uppercase tracking-[0.18em]">
                {companyLabels[0]}
              </th>
              <th className="border-b border-white/5 px-5 py-3 text-left font-medium uppercase tracking-[0.18em]">
                {companyLabels[1]}
              </th>
              <th className="border-b border-white/5 px-5 py-3 text-left font-medium uppercase tracking-[0.18em]">
                Insight
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr
                key={idx}
                className="border-b border-white/5 transition hover:bg-white/[0.03]"
              >
                <td className="px-5 py-4 align-top font-semibold text-white">
                  {row.metric || row.aspect}
                </td>
                <td className="px-5 py-4 align-top text-slate-200">
                  {row.company_a}
                </td>
                <td className="px-5 py-4 align-top text-slate-200">
                  {row.company_b}
                </td>
                <td className="px-5 py-4 align-top leading-7 text-textSecondary">
                  {row.insight}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ComparisonTable;
