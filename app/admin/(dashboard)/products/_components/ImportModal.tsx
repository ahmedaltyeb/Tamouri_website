"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface RowError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  total: number;
  valid: number;
  invalid: number;
  created: number;
  updated: number;
  skipped: number;
  errors: RowError[];
}

type Step = "idle" | "uploading" | "dryResult" | "importing" | "done" | "error";
type ImportMode = "create" | "update" | "skip";

interface Props {
  onClose: () => void;
}

export default function ImportModal({ onClose }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>("create");
  const [step, setStep] = useState<Step>("idle");
  const [dryResult, setDryResult] = useState<ImportResult | null>(null);
  const [finalResult, setFinalResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const acceptFile = (f: File) => {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".csv") && !name.endsWith(".xls")) {
      setErrorMsg("Only .xlsx, .xls, and .csv files are supported.");
      return;
    }
    setErrorMsg("");
    setFile(f);
    setStep("idle");
    setDryResult(null);
    setFinalResult(null);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function runImport(isDry: boolean) {
    if (!file) return;
    setStep(isDry ? "uploading" : "importing");
    setErrorMsg("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", mode);
    fd.append("dryRun", isDry ? "true" : "false");

    try {
      const res = await fetch("/api/admin/products/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || "Import failed");
        setStep("error");
        return;
      }
      if (isDry) {
        setDryResult(json as ImportResult);
        setStep("dryResult");
      } else {
        setFinalResult(json as ImportResult);
        setStep("done");
        router.refresh();
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStep("error");
    }
  }

  function downloadTemplate(format: "xlsx" | "csv") {
    const a = document.createElement("a");
    a.href = `/api/admin/products/template?format=${format}`;
    a.download = "";
    a.click();
  }

  const isLoading = step === "uploading" || step === "importing";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <UploadIcon className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">Import Products</h2>
              <p className="text-xs text-stone-500">Upload Excel or CSV file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer p-1"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Template download */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-2">Download Template First</p>
            <div className="flex gap-2">
              <button
                onClick={() => downloadTemplate("xlsx")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 border border-amber-300 bg-white hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <ExcelIcon className="w-4 h-4" />
                Excel Template
              </button>
              <button
                onClick={() => downloadTemplate("csv")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 border border-amber-300 bg-white hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <CsvIcon className="w-4 h-4" />
                CSV Template
              </button>
            </div>
          </div>

          {/* File drop zone */}
          <div
            ref={dropRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-150 ${
              isDragging
                ? "border-amber-400 bg-amber-50"
                : file
                ? "border-green-400 bg-green-50"
                : "border-stone-200 hover:border-amber-300 hover:bg-stone-50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) acceptFile(f);
              }}
            />
            {file ? (
              <>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-stone-800 text-sm">{file.name}</p>
                <p className="text-xs text-stone-500 mt-1">{(file.size / 1024).toFixed(1)} KB — click to change</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UploadIcon className="w-5 h-5 text-stone-400" />
                </div>
                <p className="font-semibold text-stone-700 text-sm">Drag & drop or click to upload</p>
                <p className="text-xs text-stone-400 mt-1">Supports .xlsx, .xls, .csv</p>
              </>
            )}
          </div>

          {/* Options */}
          {(step === "idle" || step === "error") && file && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">
                Import Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["create", "update", "skip"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                      mode === m
                        ? "border-amber-500 bg-amber-50 text-amber-800"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    <div className="font-bold capitalize mb-0.5">{m}</div>
                    <div className="font-normal text-stone-500 text-[10px] leading-tight">
                      {m === "create" && "Create new. Skip existing."}
                      {m === "update" && "Create new + update by SKU/name"}
                      {m === "skip" && "Skip if name already exists"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-stone-500">
                {step === "uploading" ? "Validating file…" : "Importing products…"}
              </p>
            </div>
          )}

          {/* Dry run result */}
          {step === "dryResult" && dryResult && (
            <ValidationReport result={dryResult} />
          )}

          {/* Final result */}
          {step === "done" && finalResult && (
            <FinalReport result={finalResult} />
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-sm text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
          >
            {step === "done" ? "Close" : "Cancel"}
          </button>

          <div className="flex gap-2">
            {(step === "idle" || step === "error") && file && (
              <>
                <button
                  onClick={() => runImport(true)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-semibold text-stone-700 border border-stone-200 rounded-lg hover:border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Validate (Dry Run)
                </button>
                <button
                  onClick={() => runImport(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Import Now
                </button>
              </>
            )}

            {step === "dryResult" && dryResult && (
              <>
                <button
                  onClick={() => { setStep("idle"); setDryResult(null); }}
                  className="px-4 py-2 text-sm font-semibold text-stone-700 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
                {dryResult.valid > 0 && (
                  <button
                    onClick={() => runImport(false)}
                    className="px-4 py-2 text-sm font-semibold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
                  >
                    Confirm Import ({dryResult.valid} rows)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ValidationReport({ result }: { result: ImportResult }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Rows" value={result.total} color="stone" />
        <StatCard label="Valid" value={result.valid} color="green" />
        <StatCard label="Invalid" value={result.invalid} color="red" />
      </div>

      {result.errors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide mb-2">
            Validation Errors ({result.errors.length})
          </p>
          <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
            {result.errors.slice(0, 50).map((err, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 border-b border-red-100 last:border-0 text-xs">
                <span className="font-mono text-red-400 shrink-0">Row {err.row}</span>
                <span className="text-red-600 font-medium shrink-0">[{err.field}]</span>
                <span className="text-red-700">{err.message}</span>
              </div>
            ))}
            {result.errors.length > 50 && (
              <p className="text-xs text-red-500 px-3 py-2">
                ... and {result.errors.length - 50} more errors
              </p>
            )}
          </div>
        </div>
      )}

      {result.valid === 0 && (
        <p className="text-sm text-red-600 text-center">Fix all errors before importing.</p>
      )}
      {result.valid > 0 && result.invalid === 0 && (
        <p className="text-sm text-green-600 text-center font-semibold">
          All {result.valid} rows are valid. Ready to import!
        </p>
      )}
      {result.valid > 0 && result.invalid > 0 && (
        <p className="text-sm text-amber-700 text-center">
          {result.valid} valid rows will be imported. {result.invalid} invalid rows will be skipped.
        </p>
      )}
    </div>
  );
}

function FinalReport({ result }: { result: ImportResult }) {
  return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckIcon className="w-7 h-7 text-green-600" />
        </div>
        <p className="font-bold text-stone-900">Import Complete!</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="Total" value={result.total} color="stone" />
        <StatCard label="Created" value={result.created} color="green" />
        <StatCard label="Updated" value={result.updated} color="blue" />
        <StatCard label="Skipped" value={result.skipped} color="amber" />
      </div>
      {result.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 max-h-40 overflow-y-auto">
          <p className="text-xs font-semibold text-red-700 mb-2">Errors ({result.errors.length})</p>
          {result.errors.map((err, i) => (
            <div key={i} className="text-xs text-red-600 mb-1">
              {err.row > 0 ? `Row ${err.row}: ` : ""}{err.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    stone: "bg-stone-50 border-stone-200 text-stone-700",
    green: "bg-green-50 border-green-200 text-green-700",
    red: "bg-red-50 border-red-200 text-red-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };
  return (
    <div className={`border rounded-xl p-3 text-center ${colors[color] ?? colors.stone}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mt-0.5">{label}</p>
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ExcelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  );
}

function CsvIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
