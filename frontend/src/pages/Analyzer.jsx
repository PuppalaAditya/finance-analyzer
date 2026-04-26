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
import ChartPanel from "../components/ChartPanel";
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
        title: metrics.ebitda_margin_pct ? "EBITDA Margin" : "Profit Margin",
        value: formatPercent(metrics.ebitda_margin_pct || metrics.net_profit_margin_pct),
        subtitle: metrics.ebitda_margin_pct ? "Operating profitability" : "Net profitability",
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
      metrics.net_profit_margin_pct,
      metrics.revenue,
      metrics.revenue_growth_pct
    ]
  );

  const chartPanelData = useMemo(() => {
    if (!metrics || Object.keys(metrics).length === 0) return null;
    
    const rev = metrics.revenue || 0;
    const ni = metrics.net_income || 0;
    const expenses = (rev && ni) ? rev - ni : null;
    const margin = metrics.net_profit_margin_pct;

    let assets = metrics.assets || 0;
    let liabilities = metrics.liabilities || 0;
    let equity = metrics.total_equity || (assets - liabilities);
    const debt_val = metrics.total_debt || 0;

    if (!assets && liabilities && equity) assets = liabilities + equity;
    if (!liabilities && assets && equity) liabilities = Math.max(assets - equity, 0);

    let assets_comp = [];
    if (assets || equity || debt_val) {
      const calc_liab = liabilities ? liabilities : debt_val;
      const other_liab = Math.max(calc_liab - debt_val, 0);
      assets_comp = [
        { segment: "Equity", value: Math.max(equity, 0) },
        { segment: "Debt", value: Math.max(debt_val, 0) },
        { segment: "Other Liabilities", value: other_liab }
      ];
      if (assets_comp.reduce((sum, item) => sum + item.value, 0) === 0) {
        assets_comp = [];
      }
    }

    let liab_struct = [];
    const total_liab = liabilities || (equity + debt_val);
    if (total_liab || debt_val) {
      const other = Math.max((liabilities || debt_val) - debt_val, 0);
      liab_struct = [
        { category: "Debt", value: debt_val },
        { category: "Other Liabilities", value: other }
      ];
      if (liab_struct.reduce((sum, item) => sum + item.value, 0) === 0) {
        liab_struct = [];
      }
    }

    return {
      profit_and_loss: {
        series: [{ label: "Latest", revenue: rev || null, expenses: expenses, net_profit: ni || null }],
        margin_trend: [{ label: "Latest", profit_margin: margin }]
      },
      balance_sheet: {
        assets_composition: assets_comp,
        liabilities_structure: liab_struct
      }
    };
  }, [metrics]);

  const ratioSignals = [
    {
      label: "Revenue Growth",
      value: formatPercent(metrics.revenue_growth_pct),
      width: `${Math.min(Math.max(metrics.revenue_growth_pct || 0, 0), 100)}%`
    },
    {
      label: metrics.ebitda_margin_pct ? "EBITDA Margin" : "Net Margin",
      value: formatPercent(metrics.ebitda_margin_pct || metrics.net_profit_margin_pct),
      width: `${Math.min(Math.max((metrics.ebitda_margin_pct || metrics.net_profit_margin_pct) || 0, 0), 100)}%`
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

              {chartPanelData ? (
                <ChartPanel data={chartPanelData} />
              ) : (
                <div className="surface-panel p-6">
                  <div className="surface-panel-muted mt-6 px-6 py-10 text-center text-sm leading-7 text-textSecondary">
                    Charts appear once the parser can recover structured scale metrics from the uploaded document.
                  </div>
                </div>
              )}

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
