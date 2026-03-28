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
  ArrowRight,
  Building2,
  GitCompareArrows,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import FileUploader from "../components/FileUploader";
import ComparisonTable from "../components/ComparisonTable";
import InsightCard from "../components/InsightCard";
import SectionHeader from "../components/SectionHeader";
import SkeletonBlock from "../components/SkeletonBlock";
import { compareReports } from "../services/api";
import { parseNumericValue, riskToScore } from "../utils/formatters";

const metricDefinitions = [
  {
    metric: "Revenue",
    keywords: ["revenue", "sales", "top line"],
    fallbackInsight: "Scale and topline growth populate after report analysis."
  },
  {
    metric: "Profit",
    keywords: ["profit", "net income", "net profit", "earnings"],
    fallbackInsight: "Profitability comparisons appear after both reports are parsed."
  },
  {
    metric: "ROE",
    keywords: ["roe", "return on equity"],
    fallbackInsight: "Return metrics are highlighted when ratio disclosures are found."
  },
  {
    metric: "Debt/Equity",
    keywords: ["debt", "leverage", "debt/equity", "debt to equity"],
    fallbackInsight: "Capital structure signals will appear in the live comparison."
  },
  {
    metric: "Market Cap",
    keywords: ["market cap", "market capitalization"],
    fallbackInsight:
      "Market cap is usually sourced from live market data, so filings may not always include it."
  }
];

const tooltipStyle = {
  backgroundColor: "rgba(11, 18, 32, 0.96)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "18px",
  color: "#E5E7EB",
  boxShadow: "0 20px 45px rgba(2,6,23,0.42)"
};

const ComparisonSkeleton = () => (
  <div className="space-y-6">
    <div className="surface-panel p-6">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="mt-4 h-10 w-4/5" />
      <SkeletonBlock className="mt-4 h-24 w-full" />
    </div>
    <div className="surface-panel p-6">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="mt-5 h-72 w-full" />
    </div>
  </div>
);

const Compare = () => {
  const [companyA, setCompanyA] = useState("");
  const [companyB, setCompanyB] = useState("");
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const canCompare = companyA && companyB && fileA && fileB;

  const handleCompare = async () => {
    if (!canCompare) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await compareReports(companyA, fileA, companyB, fileB);
      setResult(res);
    } catch {
      setError("Comparison failed. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  let parsed;
  try {
    parsed = result?.comparison_raw ? JSON.parse(result.comparison_raw) : null;
  } catch {
    parsed = null;
  }

  const companyLabels = [companyA || "Company A", companyB || "Company B"];
  const parsedRows = parsed?.comparison_table || [];

  const comparisonRows = useMemo(
    () =>
      metricDefinitions.map((definition) => {
        const match = parsedRows.find((row) =>
          definition.keywords.some((keyword) =>
            String(row.aspect || "")
              .toLowerCase()
              .includes(keyword)
          )
        );

        return {
          metric: definition.metric,
          company_a: match?.company_a || "Pending analysis",
          company_b: match?.company_b || "Pending analysis",
          insight: match?.insight || definition.fallbackInsight
        };
      }),
    [parsedRows]
  );

  const numericChartData = useMemo(
    () =>
      comparisonRows
        .map((row) => ({
          metric: row.metric,
          companyA: parseNumericValue(row.company_a),
          companyB: parseNumericValue(row.company_b)
        }))
        .filter((row) => row.companyA != null && row.companyB != null),
    [comparisonRows]
  );

  const riskChartData = parsed
    ? [
        {
          metric: "Risk Score",
          companyA: riskToScore(parsed.risk_comparison?.company_a_risk),
          companyB: riskToScore(parsed.risk_comparison?.company_b_risk)
        }
      ].filter((row) => row.companyA != null && row.companyB != null)
    : [];

  const chartData = numericChartData.length ? numericChartData : riskChartData;
  const chartTitle = numericChartData.length
    ? "Metric Comparison"
    : "Risk Comparison";

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Compare"
        title="Benchmark two companies in a single financial intelligence view."
        description="Upload two reports, run the AI comparison engine, and review a premium side-by-side decision surface."
        action={
          <span className="metric-chip">
            <GitCompareArrows className="h-3.5 w-3.5" />
            {parsed ? "Comparison ready" : "Configure comparison"}
          </span>
        }
      />

      <div className="mt-10 grid gap-6 xl:grid-cols-[0.94fr_1.36fr]">
        <div className="space-y-6">
          <div className="surface-panel p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
              Companies
            </p>
            <div className="mt-5 grid gap-4">
              <div>
                <label className="text-sm font-medium text-slate-200">
                  Company A
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-[22px] border border-white/5 bg-background/45 px-4 py-3">
                  <Building2 className="h-4 w-4 text-accentBlue" />
                  <input
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-textSecondary"
                    placeholder="e.g. HDFC Bank"
                    value={companyA}
                    onChange={(event) => setCompanyA(event.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200">
                  Company B
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-[22px] border border-white/5 bg-background/45 px-4 py-3">
                  <Building2 className="h-4 w-4 text-accentTeal" />
                  <input
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-textSecondary"
                    placeholder="e.g. ICICI Bank"
                    value={companyB}
                    onChange={(event) => setCompanyB(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <FileUploader
            onFileSelected={setFileA}
            label="Upload Company A report"
            description="Select the annual report or investor filing for the first company in the comparison."
            buttonLabel="Upload Company A"
          />

          <FileUploader
            onFileSelected={setFileB}
            label="Upload Company B report"
            description="Select the annual report or investor filing for the second company in the comparison."
            buttonLabel="Upload Company B"
          />

          <button
            type="button"
            onClick={handleCompare}
            disabled={!canCompare || loading}
            className="fin-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Running comparison" : "Run AI Comparison"}
            <ArrowRight className="h-4 w-4" />
          </button>

          {error ? (
            <div className="surface-panel border border-rose-400/20 bg-rose-400/5 p-5 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          {loading ? (
            <ComparisonSkeleton />
          ) : (
            <>
              <div className="surface-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
                      Investment Recommendation
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {parsed ? "AI Comparison Summary" : "Awaiting company reports"}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accentBlue/[0.18] to-accentTeal/[0.14] text-accentBlue">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-6 text-sm leading-8 text-textSecondary">
                  {parsed?.investment_recommendation ||
                    "Upload two financial reports and run the comparison engine to generate a side-by-side investment recommendation, risk differential, and strengths matrix."}
                </p>

                {parsed ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="surface-panel-muted px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-textSecondary">
                        {companyLabels[0]} risk
                      </p>
                      <p className="mt-3 text-xl font-semibold text-white">
                        {parsed.risk_comparison?.company_a_risk || "—"}
                      </p>
                    </div>
                    <div className="surface-panel-muted px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-textSecondary">
                        {companyLabels[1]} risk
                      </p>
                      <p className="mt-3 text-xl font-semibold text-white">
                        {parsed.risk_comparison?.company_b_risk || "—"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <ComparisonTable
                rows={comparisonRows}
                companyLabels={companyLabels}
                title="Comparison Table"
                description="Revenue, profit, ROE, debt/equity, and market-cap context in a single benchmark view."
              />

              <div className="surface-panel p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-textSecondary">
                      {chartTitle}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Visual comparison of the extracted numeric metrics.
                    </p>
                  </div>
                  <ShieldAlert className="h-5 w-5 text-accentAmber" />
                </div>

                {chartData.length ? (
                  <div className="mt-6 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barGap={10}>
                        <CartesianGrid
                          stroke="rgba(148,163,184,0.08)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="metric"
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
                          dataKey="companyA"
                          name={companyLabels[0]}
                          fill="#3B82F6"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar
                          dataKey="companyB"
                          name={companyLabels[1]}
                          fill="#14B8A6"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="surface-panel-muted mt-6 px-6 py-10 text-center text-sm leading-7 text-textSecondary">
                    The comparison chart will populate when the AI response
                    contains numeric values that can be benchmarked visually.
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InsightCard
                  title={`Strengths: ${companyLabels[0]}`}
                  items={
                    parsed?.financial_strengths?.company_a?.length
                      ? parsed.financial_strengths.company_a
                      : [
                          "Strengths for the first company will appear once the comparison completes."
                        ]
                  }
                  tone="blue"
                  icon={Building2}
                />
                <InsightCard
                  title={`Strengths: ${companyLabels[1]}`}
                  items={
                    parsed?.financial_strengths?.company_b?.length
                      ? parsed.financial_strengths.company_b
                      : [
                          "Strengths for the second company will appear once the comparison completes."
                        ]
                  }
                  tone="teal"
                  icon={Building2}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compare;
