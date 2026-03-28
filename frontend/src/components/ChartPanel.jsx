import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { motion } from "framer-motion";

const ACCENT_COLORS = ["#3B82F6", "#14B8A6", "#F59E0B", "#94A3B8", "#64748B"];
const axisStyle = { fill: "#94A3B8", fontSize: 11 };
const tooltipStyle = {
  backgroundColor: "rgba(11, 18, 32, 0.96)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "18px",
  color: "#E5E7EB",
  boxShadow: "0 20px 45px rgba(2,6,23,0.42)"
};

const ChartCard = ({ title, description, children }) => (
  <motion.div
    className="surface-panel p-5"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="mb-5 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-textSecondary">
          {title}
        </p>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      </div>
    </div>
    {children}
  </motion.div>
);

const EmptyChart = ({ message }) => (
  <div className="flex h-64 items-center justify-center rounded-[24px] border border-white/5 bg-background/[0.35] px-6 text-center text-sm leading-7 text-textSecondary">
    {message}
  </div>
);

const ChartPanel = ({ data }) => {
  if (!data) return null;

  const { profit_and_loss, balance_sheet } = data;
  const plSeries = profit_and_loss?.series || [];
  const marginTrend = profit_and_loss?.margin_trend || [];
  const assetsComp = balance_sheet?.assets_composition || [];
  const liabStruct = balance_sheet?.liabilities_structure || [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartCard
        title="P&L Momentum"
        description="Revenue, expenses, and net profit across uploaded statements."
      >
        {plSeries.length ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plSeries} barGap={8}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={axisStyle}
                />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                <Bar
                  dataKey="net_profit"
                  name="Net Profit"
                  fill="#14B8A6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart message="Upload reports to unlock P&L trend tracking." />
        )}
      </ChartCard>

      <ChartCard
        title="Profit Margin Trend"
        description="Margin trajectory highlights operating leverage across periods."
      >
        {marginTrend.length ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marginTrend}>
                <defs>
                  <linearGradient id="marginFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={axisStyle}
                />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="profit_margin"
                  stroke="#14B8A6"
                  strokeWidth={2.5}
                  fill="url(#marginFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart message="Margin visuals appear once parsed statements are available." />
        )}
      </ChartCard>

      <ChartCard
        title="Capital Structure"
        description="Asset composition by equity, debt, and other liabilities."
      >
        {assetsComp.length ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetsComp}
                    dataKey="value"
                    nameKey="segment"
                    cx="50%"
                    cy="50%"
                    outerRadius={84}
                    innerRadius={52}
                    paddingAngle={4}
                  >
                    {assetsComp.map((entry, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Cell
                        key={`asset-${index}`}
                        fill={ACCENT_COLORS[index % ACCENT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {assetsComp.map((item) => (
                <div
                  key={item.segment}
                  className="rounded-2xl border border-white/5 bg-background/30 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-textSecondary">
                    {item.segment}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {item.value?.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyChart message="Balance sheet composition will render when asset and liability data is available." />
        )}
      </ChartCard>

      <ChartCard
        title="Liability Structure"
        description="Debt versus other liabilities in the most recent statement."
      >
        {liabStruct.length ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={liabStruct}>
                <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={axisStyle}
                />
                <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart message="Liability mix appears after the latest filing is parsed." />
        )}
      </ChartCard>
    </div>
  );
};

export default ChartPanel;
