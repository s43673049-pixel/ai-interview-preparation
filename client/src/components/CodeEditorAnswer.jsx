import Editor from "@monaco-editor/react";

const LANGUAGES = ["javascript", "python", "java", "cpp", "sql", "typescript"];

export default function CodeEditorAnswer({ value, onChange, language, onLanguageChange, disabled }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
        <span className="text-xs font-medium text-slate-500">Code Answer</span>
        <select
          value={language}
          disabled={disabled}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs capitalize outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>
      <Editor
        height="280px"
        language={language}
        value={value}
        onChange={(v) => onChange(v || "")}
        theme="vs-dark"
        options={{
          readOnly: disabled,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          padding: { top: 12 },
          automaticLayout: true,
        }}
      />
    </div>
  );
}