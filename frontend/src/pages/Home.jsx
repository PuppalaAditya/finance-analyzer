import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgePercent,
  BotMessageSquare,
  ChartColumnBig,
  CircleDollarSign,
  GitCompareArrows,
  LayoutDashboard,
  MessagesSquare,
  ScanSearch,
  ShieldAlert,
  TrendingUp,
  Upload,
  Wallet
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import FinancialCard from "../components/FinancialCard";
import SectionHeader from "../components/SectionHeader";

const heroSeries = [
  { period: "FY20", signal: 124 },
  { period: "FY21", signal: 141 },
  { period: "FY22", signal: 173 },
  { period: "FY23", signal: 224 },
  { period: "FY24", signal: 278 }
];

const signalCards = [
  {
    title: "Revenue Momentum",
    value: "+21.4%",
    note: "Three-year CAGR surfaced automatically from filings.",
    accent: "text-accentBlue"
  },
  {
    title: "Debt / Equity",
    value: "0.42x",
    note: "Leverage remains below sector trigger thresholds.",
    accent: "text-accentTeal"
  },
  {
    title: "Liquidity Watch",
    value: "Stable",
    note: "Current ratio and working capital buffers are improving.",
    accent: "text-accentAmber"
  }
];

const workflowSteps = [
  {
    id: "upload",
    title: "Upload Annual Report",
    description:
      "Drop NSE/BSE filings, earnings decks, or PDF annual reports into a secure workspace.",
    icon: Upload
  },
  {
    id: "extract",
    title: "AI Extracts Financial Data",
    description:
      "Financial Decoder parses tables, notes, leverage, liquidity, and management commentary into a structured model.",
    icon: BotMessageSquare
  },
  {
    id: "insights",
    title: "Get Instant Insights",
    description:
      "Surface revenue trends, risk flags, ratio shifts, and investment signals in seconds instead of hours.",
    icon: Activity
  }
];

const featureCards = [
  {
    id: "analyzer",
    title: "Financial Statement Analyzer",
    description:
      "Extract financial summaries, headline metrics, and ratio snapshots from long-form filings.",
    icon: ScanSearch
  },
  {
    id: "chat",
    title: "AI Chat With Reports",
    description:
      "Ask grounded questions about margins, debt, risks, and management commentary without leaving the workspace.",
    icon: MessagesSquare
  },
  {
    id: "compare",
    title: "Company Comparison Engine",
    description:
      "Benchmark two companies side by side on profitability, leverage, and the investment narrative.",
    icon: GitCompareArrows
  },
  {
    id: "dashboard",
    title: "Risk & Ratio Dashboard",
    description:
      "Track profitability, capital structure, and balance-sheet quality across uploaded statements.",
    icon: LayoutDashboard
  }
];

const exampleInsights = [
  {
    title: "Revenue Growth",
    value: "18.4%",
    subtitle: "Three-year CAGR extracted from annual reports.",
    tone: "positive",
    changeLabel: "Acceleration detected",
    icon: TrendingUp
  },
  {
    title: "Debt to Equity",
    value: "0.48x",
    subtitle: "Leverage remains within conservative thresholds.",
    tone: "neutral",
    changeLabel: "Balance sheet resilient",
    icon: Wallet
  },
  {
    title: "EBITDA Margin",
    value: "22.7%",
    subtitle: "Margin expansion supported by operating leverage.",
    tone: "highlight",
    changeLabel: "Pricing power intact",
    icon: BadgePercent
  },
  {
    title: "Liquidity Risk",
    value: "Low",
    subtitle: "Current ratio and cash buffers remain supportive.",
    tone: "positive",
    changeLabel: "Monitor receivables",
    icon: ShieldAlert
  }
];

const insightFeed = [
  "Revenue mix is shifting toward higher-margin domestic segments.",
  "Debt service capacity improves under stable RBI policy assumptions.",
  "Management commentary flags capex discipline and working-capital focus."
];

const tooltipStyle = {
  backgroundColor: "rgba(11, 18, 32, 0.96)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "18px",
  color: "#E5E7EB",
  boxShadow: "0 20px 45px rgba(2,6,23,0.42)"
};

const Home = () => {
  return (
    <div className="page-shell">
      <section className="grid gap-10 pt-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className="section-kicker">
            Annual report intelligence for public market investors
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            AI-Powered Financial Report Intelligence
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-textSecondary sm:text-lg">
            Turn 300-page annual reports into actionable financial insights.
            Upload NSE/BSE annual reports and instantly extract revenue trends,
            leverage ratios, risks and investment signals.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/analyzer" className="fin-button">
              Analyze Financial Report
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/chat" className="fin-button-secondary">
              Try AI Chat
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="surface-panel-muted px-4 py-4">
              <p className="text-2xl font-semibold text-white">300+</p>
              <p className="mt-2 text-sm text-textSecondary">
                pages compressed into a single analysis pass
              </p>
            </div>
            <div className="surface-panel-muted px-4 py-4">
              <p className="text-2xl font-semibold text-white">&lt; 60 sec</p>
              <p className="mt-2 text-sm text-textSecondary">
                to extract tables, metrics, and headline signals
              </p>
            </div>
            <div className="surface-panel-muted px-4 py-4">
              <p className="text-2xl font-semibold text-white">Audit-ready</p>
              <p className="mt-2 text-sm text-textSecondary">
                grounded Q&amp;A and report-backed insight summaries
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="surface-panel data-grid relative overflow-hidden p-6 sm:p-8"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.45 }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accentBlue/80 to-transparent" />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-textSecondary">
                Insight Workspace
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                Live annual report intelligence stack
              </p>
            </div>
            <span className="metric-chip">
              <span
                className="h-2 w-2 rounded-full bg-accentTeal"
                style={{ animation: "pulse-dot 1.8s infinite" }}
              />
              Live extraction
            </span>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[24px] border border-white/5 bg-background/50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-textSecondary">
                    Financial signal curve
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Revenue and profitability are strengthening faster than
                    leverage is rising.
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accentBlue/[0.12] text-accentBlue">
                  <ChartColumnBig className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={heroSeries}>
                    <defs>
                      <linearGradient id="heroSignal" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.38} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="rgba(148,163,184,0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="period"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 11 }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="signal"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      fill="url(#heroSignal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              {signalCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[24px] border border-white/5 bg-background/40 px-5 py-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-textSecondary">
                    {card.title}
                  </p>
                  <p className={`mt-3 text-2xl font-semibold ${card.accent}`}>
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {card.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[24px] border border-white/5 bg-background/40 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-textSecondary">
                    Scorecard
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    High-conviction indicators extracted from the filing.
                  </p>
                </div>
                <CircleDollarSign className="h-5 w-5 text-accentAmber" />
              </div>
              <div className="mt-5 space-y-4">
                {[
                  { label: "Revenue durability", value: "82 / 100", width: "82%" },
                  { label: "Margin quality", value: "74 / 100", width: "74%" },
                  { label: "Balance-sheet resilience", value: "79 / 100", width: "79%" }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-200">{item.label}</span>
                      <span className="text-textSecondary">{item.value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/5">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-accentBlue to-accentTeal"
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/5 bg-background/40 px-5 py-5">
              <p className="text-xs uppercase tracking-[0.2em] text-textSecondary">
                Example insights
              </p>
              <div className="mt-4 space-y-4">
                {insightFeed.map((item) => (
                  <div key={item} className="flex gap-3">
                    <div className="mt-2 h-2 w-2 rounded-full bg-accentTeal" />
                    <p className="text-sm leading-7 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mt-24">
        <SectionHeader
          eyebrow="How it Works"
          title="From raw filings to investor-ready intelligence."
          description="The workflow is designed for annual reports, board-approved results, and long-form investor disclosures."
          align="center"
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                className="surface-panel p-6"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accentBlue/20 to-accentTeal/20 text-accentBlue">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-textSecondary">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-6 text-xl font-semibold text-white">
                  {step.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-textSecondary">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mt-24">
        <SectionHeader
          eyebrow="Core Features"
          title="Everything needed for a serious financial research workflow."
          description="A cleaner product surface for parsing filings, benchmarking companies, and interrogating the investment case."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.id}
                className="surface-panel p-6"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accentBlue/[0.18] to-accentTeal/[0.14] text-accentBlue">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-6 text-lg font-semibold text-white">
                  {feature.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-textSecondary">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mt-24">
        <SectionHeader
          eyebrow="Example Insights"
          title="The kinds of signals surfaced from each report."
          description="These cards mirror the output style across the analyzer, dashboard, and AI co-pilot."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {exampleInsights.map((card) => (
            <FinancialCard
              key={card.title}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              tone={card.tone}
              changeLabel={card.changeLabel}
              icon={card.icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
