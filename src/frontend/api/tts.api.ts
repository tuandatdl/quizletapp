import { api } from "./client";
import type { Language, TtsResult } from "../types/api";

export interface TtsRequest {
  text: string;
  language: Language;
  voice?: string;
  speed: 0.75 | 1 | 1.25;
}

export const ttsApi = {
  synthesize: (data: TtsRequest, signal?: AbortSignal) =>
    api.post<TtsResult>("/api/tts", data, { signal }),
};
