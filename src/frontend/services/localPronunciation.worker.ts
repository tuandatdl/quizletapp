/// <reference lib="webworker" />

import { env, pipeline, type AutomaticSpeechRecognitionPipeline, type ProgressInfo } from "@huggingface/transformers";
import type { LocalPronunciationModelConfig, LocalPronunciationProgress } from "./localPronunciation.js";

type RequestMessage = { id: number; type: "transcribe"; audio: Float32Array; config: LocalPronunciationModelConfig };

let session: AutomaticSpeechRecognitionPipeline | null = null;
let sessionVersion: string | null = null;

function report(id: number, progress: LocalPronunciationProgress): void {
  self.postMessage({ id, type: "progress", progress });
}

function progressFromHubEvent(id: number, event: ProgressInfo): void {
  const loaded = "loaded" in event && typeof (event as { loaded?: unknown }).loaded === "number" ? (event as { loaded: number }).loaded : undefined;
  const total = "total" in event && typeof (event as { total?: unknown }).total === "number" ? (event as { total: number }).total : undefined;
  if (loaded !== undefined || total !== undefined) report(id, { phase: "download", loaded, total });
}

async function getSession(id: number, config: LocalPronunciationModelConfig): Promise<any> {
  if (session && sessionVersion === config.version) return session;
  env.useBrowserCache = true;
  report(id, { phase: "load" });
  session = (await (pipeline as any)("automatic-speech-recognition", config.id, {
    revision: config.revision,
    dtype: config.dtype,
    progress_callback: (event: ProgressInfo) => progressFromHubEvent(id, event),
  })) as AutomaticSpeechRecognitionPipeline;
  sessionVersion = config.version;
  report(id, { phase: "ready" });
  return session;
}

self.onmessage = async (event: MessageEvent<RequestMessage>) => {
  const { id, audio, config } = event.data;
  try {
    const transcriber = await getSession(id, config);
    report(id, { phase: "analyze" });
    const result: any = await transcriber(audio);
    const text = typeof result === "object" && result && typeof result.text === "string" ? result.text : "";
    self.postMessage({ id, type: "result", text });
  } catch (error) {
    self.postMessage({ id, type: "error", message: error instanceof Error ? error.message : "Không thể nhận dạng giọng nói cục bộ." });
  }
};
