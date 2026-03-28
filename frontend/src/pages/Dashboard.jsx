import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgePercent,
  CircleDollarSign,
  LayoutDashboard,
  ShieldAlert,
  Wallet
} from "lucide-react";
import ChartPanel from "../components/ChartPanel";
import FinancialCard from "../components/FinancialCard";
import InsightCard from "../components/InsightCard";
import SectionHeader from "../components/SectionHeader";
import SkeletonBlock from "../components/SkeletonBlock";
import { fetchDashboard } from "../services/api";
import {
  formatCompactCurrency,
  formatMultiple,
  formatPercent
} from "../utils/formatters";

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="surface-panel p-6">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="mt-4 h-10 w-4/5" />
      <SkeletonBlock className="mt-4 h-24 w-full" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {["a", "b", "c", "d"].map((key) => (
        <div key={key} className="surface-panel p-5">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-4 h-10 w-28" />
          <SkeletonBlock className="mt-4 h-4 w-3/4" />
        </div>
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="surface-panel p-6">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="mt-5 h-72 w-full" />
      </div>
      <div className="surface-panel p-6">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="mt-5 h-72 w-full" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetchDashboard();
        setData(res);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const cards = data?.has_data
    ? [
        {
          title: "Revenue",
          value: formatCompactCurrency(data.kpis?.revenue),
          subtitle: "Latest reported topline",
          tone: "neutral",
          changeLabel: "Scale",
          icon: CircleDollarSign
        },
        {
          title: "Net Profit",
          value: formatCompactCurrency(data.kpis?.net_profit),
          subtitle: "After-tax profitability",
          tone: "positive",
          changeLabel: "Profitability",
          icon: Activity
        },
        {
          title: "ROE",
          value: formatPercent(data.ratios?.roe),
          subtitle: "Return on equity",
          tone: "highlight",
          changeLabel: "Return quality",
          icon: BadgePercent
        },
        {
          title: "Debt / Equity",
          value: formatMultiple(data.ratios?.debt_to_equity),
          subtitle: "Leverage position",
          tone:
            data.ratios?.debt_to_equity != null && data.ratios.debt_to_equity > 1
              ? "negative"
              : "positive",
          changeLabel: "Capital structure",
          icon: Wallet
        }
      ]
    : [];

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Dashboard"
        title="A persistent view of financial performance and risk."
        description="Track the latest uploaded filings across profitability, capital structure, and AI commentary."
        action={
          <span className="metric-chip">
            <LayoutDashboard className="h-3.5 w-3.5" />
            {data?.has_data ? "Dashboard populated" : "Awaiting uploads"}
          </span>
        }
      />

      <div className="mt-10 space-y-6">
        {loading ? <DashboardSkeleton /> : null}

        {error ? (
          <div className="surface-panel border border-rose-400/20 bg-rose-400/5 p-5 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {!loading && !error && !data?.has_data ? (
          <div className="surface-panel p-8 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
              No dashboard data yet
            </p>
            <p className="mt-4 text-2xl font-semibold text-white">
              Upload a financial report to populate the analytics dashboard.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-textSecondary">
              Once a filing is processed, the dashboard will display KPI cards,
              chart panels, and AI-generated financial insights.
            </p>
            <Link to="/analyzer" className="fin-button mt-8">
              Go to Analyzer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}

        {!loading && data?.has_data ? (
          <>
            <div className="surface-panel p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
                    AI Financial Summary
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    Live statement intelligence
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accentBlue/[0.18] to-accentTeal/[0.14] text-accentBlue">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-6 text-sm leading-8 text-textSecondary">
                {data.ai_insights?.summary ||
                  "Upload a financial statement to see AI commentary."}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
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

            <ChartPanel data={data} />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InsightCard
                title="Key Insights"
                items={data.ai_insights?.key_insights || []}
                tone="blue"
                icon={CircleDollarSign}
              />
              <InsightCard
                title="Risks"
                items={data.ai_insights?.risks || []}
                tone="amber"
                icon={ShieldAlert}
              />
              <InsightCard
                title="Recommendations"
                items={data.ai_insights?.recommendations || []}
                tone="teal"
                icon={Activity}
              />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;
