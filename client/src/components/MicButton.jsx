import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export default function MicButton({ onTranscript, disabled }) {
  const { listening, supported, toggle } = useSpeechRecognition({
    onResult: (text) => onTranscript(text),
  });

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      title={listening ? "Stop recording" : "Answer with your voice"}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition
        ${listening
          ? "animate-pulse border-red-300 bg-red-50 text-red-600"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}
        disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {listening ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
}