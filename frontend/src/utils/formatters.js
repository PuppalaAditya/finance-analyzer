const isValidNumber = (value) =>
  value != null && value !== "" && Number.isFinite(Number(value));

export const formatCompactCurrency = (value) => {
  if (!isValidNumber(value)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(value));
};

export const formatCompactNumber = (value) => {
  if (!isValidNumber(value)) return "—";

  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(value));
};

export const formatPercent = (value, digits = 1) => {
  if (!isValidNumber(value)) return "—";
  return `${Number(value).toFixed(digits)}%`;
};

export const formatMultiple = (value, digits = 2) => {
  if (!isValidNumber(value)) return "—";
  return `${Number(value).toFixed(digits)}x`;
};

export const formatChatTime = (value) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
};

export const parseNumericValue = (value) => {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const normalized = String(value)
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .replace(/cr|crore|million|billion|mn|bn|x|%/gi, " ")
    .trim();
  const match = normalized.match(/-?\d+(\.\d+)?/);

  return match ? Number(match[0]) : null;
};

export const riskToScore = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (normalized.includes("low")) return 25;
  if (normalized.includes("moderate")) return 55;
  if (normalized.includes("high")) return 85;

  return null;
};
