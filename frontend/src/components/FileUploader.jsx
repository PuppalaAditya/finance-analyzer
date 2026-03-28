import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, Upload } from "lucide-react";

const FileUploader = ({
  onFileSelected,
  label = "Upload annual report",
  description = "Drop an annual report PDF, earnings release, or investor deck. The platform extracts financial tables, ratios, and management commentary in one pass.",
  buttonLabel = "Select PDF"
}) => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files) => {
    const file = files?.[0];

    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <motion.div
      className={`surface-panel relative overflow-hidden p-6 ${
        dragActive ? "ring-1 ring-accentBlue/60" : ""
      }`}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        handleFiles(event.dataTransfer.files);
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accentBlue/80 to-transparent" />

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accentBlue/20 to-accentTeal/20 text-accentBlue">
          <Upload className="h-5 w-5" />
        </div>
        <span className="metric-chip">
          <Sparkles className="h-3.5 w-3.5" />
          Secure PDF intake
        </span>
      </div>

      <p className="mt-6 text-xl font-semibold text-white">{label}</p>
      <p className="mt-3 max-w-xl text-sm leading-7 text-textSecondary">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="fin-button"
        >
          <Upload className="h-4 w-4" />
          {buttonLabel}
        </button>
        <span className="metric-chip">
          <FileText className="h-3.5 w-3.5" />
          PDF only, drag and drop supported
        </span>
      </div>

      <div className="surface-panel-muted mt-6 px-4 py-3 text-xs leading-6 text-textSecondary">
        Reports are processed for table extraction, ratio computation, and AI
        financial commentary. For best results, use clean annual report PDFs or
        investor filings.
      </div>
    </motion.div>
  );
};

export default FileUploader;
