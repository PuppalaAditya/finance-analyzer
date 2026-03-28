import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Activity,
  BadgePercent,
  ChartColumnBig,
  CircleDollarSign,
  ShieldAlert,
  Sparkles,
  Wallet
} from "lucide-react";
import FileUploader from "../components/FileUploader";
import FinancialCard from "../components/FinancialCard";
import InsightCard from "../components/InsightCard";
import SectionHeader from "../components/SectionHeader";
import SkeletonBlock from "../components/SkeletonBlock";
import { uploadReport } from "../services/api";
import {
  formatCompactCurrency,
  formatMultiple,
  formatPercent
} from "../utils/formatters";

const tooltipStyle = {
  backgroundColor: "rgba(11, 18, 32, 0.96)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "18px",
  color: "#E5E7EB",
  boxShadow: "0 20px 45px rgba(2,6,23,0.42)"
};

const workflowSteps = [
  {
    title: "Extract tables and narratives",
    description: "Read the filing and structure key financial disclosures."
  },
  {
    title: "Compute metrics and ratios",
    description: "Assemble top-line, leverage, margin, and liquidity signals."
  },
  {
    title: "Generate AI insights",
    description: "Produce concise, auditable investor-focused commentary."
  }
];

const AnalyzerSkeleton = () => (
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
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="surface-panel p-6">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="mt-5 h-72 w-full" />
      </div>
      <div className="surface-panel p-6">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="mt-5 h-6 w-3/4" />
        <SkeletonBlock className="mt-3 h-6 w-5/6" />
        <SkeletonBlock className="mt-3 h-6 w-4/6" />
      </div>
    </div>
  </div>
);

const Analyzer = () => {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (selectedFile) => {
    setFile(selectedFile);
    setError("");
    setUploadResult(null);
    setAnalysis(null);

    try {
      setLoading(true);
      const upload = await uploadReport(selectedFile);
      setUploadResult(upload);
      setAnalysis(upload.analysis || null);
    } catch {
      setError("Failed to analyze report. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const metrics = uploadResult?.metrics || {};
  const parsed = analysis || null;

  const metricCards = useMemo(
    () => [
      {
        title: "Revenue",
        value: formatCompactCurrency(metrics.revenue),
        subtitle: "Latest reported topline",
        tone: "neutral",
        changeLabel:
          metrics.revenue_growth_pct != null
            ? `${formatPercent(metrics.revenue_growth_pct)} YoY`
            : "Awaiting trend data",
        icon: CircleDollarSign
      },
      {
        title: "EBITDA Margin",
        value: formatPercent(metrics.ebitda_margin_pct),
        subtitle: "Operating profitability",
        tone: "highlight",
        changeLabel: "Margin profile",
        icon: BadgePercent
      },
      {
        title: "Debt / Equity",
        value: formatMultiple(metrics.debt_to_equity),
        subtitle: "Leverage posture",
        tone:
          metrics.debt_to_equity != null && metrics.debt_to_equity > 1
            ? "negative"
            : "positive",
        changeLabel: "Capital structure",
        icon: Wallet
      },
      {
        title: "Current Ratio",
        value: formatMultiple(metrics.current_ratio),
        subtitle: "Near-term liquidity",
        tone: "positive",
        changeLabel: "Liquidity",
        icon: Activity
      }
    ],
    [
      metrics.current_ratio,
      metrics.debt_to_equity,
      metrics.ebitda_margin_pct,
      metrics.revenue,
      metrics.revenue_growth_pct
    ]
  );

  const chartData = useMemo(
    () =>
      [
        { label: "Revenue", value: metrics.revenue },
        { label: "Net Income", value: metrics.net_income },
        { label: "Assets", value: metrics.assets },
        { label: "Liabilities", value: metrics.liabilities },
        { label: "Total Debt", value: metrics.total_debt },
        { label: "Cash Flow", value: metrics.cash_flow }
      ].filter((item) => item.value != null && Number(item.value) > 0),
    [
      metrics.assets,
      metrics.cash_flow,
      metrics.liabilities,
      metrics.net_income,
      metrics.revenue,
      metrics.total_debt
    ]
  );

  const ratioSignals = [
    {
      label: "Revenue Growth",
      value: formatPercent(metrics.revenue_growth_pct),
      width: `${Math.min(Math.max(metrics.revenue_growth_pct || 0, 0), 100)}%`
    },
    {
      label: "EBITDA Margin",
      value: formatPercent(metrics.ebitda_margin_pct),
      width: `${Math.min(Math.max(metrics.ebitda_margin_pct || 0, 0), 100)}%`
    },
    {
      label: "ROE",
      value: formatPercent(metrics.roe_pct),
      width: `${Math.min(Math.max(metrics.roe_pct || 0, 0), 100)}%`
    }
  ].filter((item) => item.value !== "—");

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Analyzer"
        title="Upload a report and generate an investor-grade readout."
        description="The analyzer organizes long-form filings into a financial summary, key metrics, charts, and AI-backed commentary."
        action={
          <span className="metric-chip">
            <Sparkles className="h-3.5 w-3.5" />
            {loading ? "Analysis running" : parsed ? "Report analyzed" : "Ready"}
          </span>
        }
      />

      <div className="mt-10 grid gap-6 xl:grid-cols-[0.94fr_1.36fr]">
        <div className="space-y-6">
          <FileUploader
            onFileSelected={handleFile}
            label="Upload financial report"
            description="Select an annual report PDF to extract metrics, structure the filings, and generate AI financial commentary."
            buttonLabel="Upload report"
          />

          {file ? (
            <div className="surface-panel p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
                Selected file
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
            <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
              Analysis workflow
            </p>
            <div className="mt-5 space-y-4">
              {workflowSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-textSecondary">
                      {step.description}
                    </p>
                  </div>
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

        <div className="space-y-6">
          {loading ? (
            <AnalyzerSkeleton />
          ) : (
            <>
              <div className="surface-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
                      Financial Summary
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {uploadResult?.filename || "Awaiting financial report"}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accentBlue/[0.18] to-accentTeal/[0.14] text-accentBlue">
                    <ChartColumnBig className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-6 max-w-3xl text-sm leading-8 text-textSecondary">
                  {parsed?.summary ||
                    "Upload a report to generate a concise financial summary, including performance drivers, balance-sheet interpretation, and the investment case."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metricCards.map((card) => (
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

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="surface-panel p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
                        Charts
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        Parsed scale metrics from the uploaded report.
                      </p>
                    </div>
                    <Activity className="h-5 w-5 text-accentTeal" />
                  </div>

                  {chartData.length ? (
                    <div className="mt-6 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid
                            stroke="rgba(148,163,184,0.08)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="label"
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
                          <Bar
                            dataKey="value"
                            fill="#3B82F6"
                            radius={[10, 10, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="surface-panel-muted mt-6 px-6 py-10 text-center text-sm leading-7 text-textSecondary">
                      Charts appear once the parser can recover structured scale
                      metrics from the uploaded document.
                    </div>
                  )}
                </div>

                <div className="surface-panel p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
                        Signal Monitor
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        Quick view of growth, margin, and return metrics.
                      </p>
                    </div>
                    <BadgePercent className="h-5 w-5 text-accentAmber" />
                  </div>

                  {ratioSignals.length ? (
                    <div className="mt-6 space-y-5">
                      {ratioSignals.map((item) => (
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
                  ) : (
                    <div className="surface-panel-muted mt-6 px-6 py-10 text-center text-sm leading-7 text-textSecondary">
                      Ratio monitors populate after growth and profitability
                      fields are extracted.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InsightCard
                  title="Key Metrics"
                  items={
                    parsed?.key_insights?.length
                      ? parsed.key_insights
                      : [
                          "Revenue scale, margin quality, and capital structure signals will appear here after upload."
                        ]
                  }
                  tone="blue"
                  icon={CircleDollarSign}
                />
                <InsightCard
                  title="AI Insights"
                  items={
                    parsed?.recommendations?.length
                      ? parsed.recommendations
                      : [
                          "Action-oriented recommendations will appear once the model completes analysis."
                        ]
                  }
                  tone="teal"
                  icon={Sparkles}
                />
                <InsightCard
                  title="Risk Flags"
                  items={
                    parsed?.risks?.length
                      ? parsed.risks
                      : [
                          "Risk monitoring will surface leverage, liquidity, and narrative red flags from the filing."
                        ]
                  }
                  tone="amber"
                  icon={ShieldAlert}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyzer;
