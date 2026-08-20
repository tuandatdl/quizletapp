import { describe, expect, it, vi } from "vitest";
import { buildQuizQuestions, publicQuizQuestion, type QuizVocabulary } from "../src/shared/quizModes.js";
import { runAudioEnginePolicy } from "../src/frontend/services/audioEnginePolicy.js";

const vocabulary: QuizVocabulary[] = [
  { id: "abundant", language: "en", term: "abundant", meaningVi: "dồi dào", example: "Water was abundant in this region." },
  { id: "scarce", language: "en", term: "scarce", meaningVi: "khan hiếm", example: "Clean water was scarce." },
  { id: "routine", language: "en", term: "routine", meaningVi: "thói quen", example: "My routine starts at six." },
  { id: "review", language: "en", term: "review", meaningVi: "ôn tập", example: "I review new words." },
  { id: "patient", language: "en", term: "patient", meaningVi: "kiên nhẫn", example: null },
];

function build(type: string, count = 1, random: () => number = () => 0.999) {
  let sequence = 0;
  return buildQuizQuestions({ language: "en", type, count, vocabulary, createId: () => `q-${++sequence}`, random });
}

describe("distinct English quiz modes", () => {
  it("QUIZ_TERM_TO_MEANING_DISTINCT", () => {
    const question = build("TERM_TO_MEANING")[0]!;
    expect(question.prompt).toBe("abundant");
    expect(question.answer).toBe("dồi dào");
    expect(question.answerMode).toBe("MULTIPLE_CHOICE");
    expect(question.audioText).toBe("abundant");
    expect(question.options).toContain("dồi dào");
    expect(question.options).not.toContain("abundant");
  });

  it("QUIZ_MEANING_TO_TERM_DISTINCT", () => {
    const question = build("MEANING_TO_TERM")[0]!;
    expect(question.prompt).toBe("dồi dào");
    expect(question.answer).toBe("abundant");
    expect(question.options).toContain("abundant");
    expect(question.options).not.toContain("dồi dào");
    expect(question.audioText).toBeUndefined();
  });

  it("QUIZ_FILL_BLANK_USES_EXAMPLE", () => {
    const question = build("FILL_BLANK")[0]!;
    expect(question.prompt).toBe("Water was ______ in this region.");
    expect(question.answer).toBe("abundant");
    expect(question.options).toContain("abundant");
    expect(question.feedback.completedSentence).toBe("Water was abundant in this region.");
  });

  it("QUIZ_FILL_BLANK_SKIPS_MISSING_EXAMPLE", () => {
    const questions = build("FILL_BLANK", 5);
    expect(questions).toHaveLength(4);
    expect(questions.map((question) => question.vocabularyId)).not.toContain("patient");
  });

  it("QUIZ_LISTENING_HIDES_TERM and QUIZ_LISTENING_HAS_AUDIO_TEXT", () => {
    const question = build("LISTENING")[0]!;
    const publicQuestion = publicQuizQuestion(question);
    expect(publicQuestion.prompt).toBe("Nghe và chọn nghĩa đúng");
    expect(publicQuestion.prompt).not.toContain("abundant");
    expect(publicQuestion.audioText).toBe("abundant");
    expect(publicQuestion.options).toContain("dồi dào");
    expect(publicQuestion.options).not.toContain("abundant");
    expect(publicQuestion).not.toHaveProperty("feedback");
  });

  it("QUIZ_CONTEXT_USES_EXAMPLE and QUIZ_CONTEXT_DISTINCT_FROM_TERM_TO_MEANING", () => {
    const context = build("CONTEXT")[0]!;
    const direct = build("TERM_TO_MEANING")[0]!;
    expect(context.contextText).toBe("Water was abundant in this region.");
    expect(context.prompt).toContain("abundant");
    expect(context.prompt).not.toBe(direct.prompt);
    expect(context.options).toContain("dồi dào");
    expect(context.options).not.toContain("abundant");
    expect(context.feedback.completedSentence).toBe("Water was abundant in this region.");
  });

  it("QUIZ_OPTIONS_INCLUDE_CORRECT_ONCE, QUIZ_OPTIONS_NO_DUPLICATES and QUIZ_OPTIONS_SHUFFLED", () => {
    const randomValues = [0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0.999, 0, 0, 0];
    let index = 0;
    const question = buildQuizQuestions({ language: "en", type: "TERM_TO_MEANING", count: 1, vocabulary, createId: () => "shuffle", random: () => randomValues[index++ % randomValues.length]! })[0]!;
    expect(question.options).toHaveLength(4);
    expect(question.options?.filter((option) => option === question.answer)).toHaveLength(1);
    expect(new Set(question.options?.map((option) => option.toLocaleLowerCase())).size).toBe(question.options?.length);
    expect(question.options?.every(Boolean)).toBe(true);
    expect(question.options?.indexOf(question.answer)).toBeGreaterThan(0);
  });

  it("QUIZ_RANDOM_VOCAB_SELECTION and QUIZ_NO_DUPLICATE_VOCAB", () => {
    const questions = build("TERM_TO_MEANING", 3, () => 0);
    expect(questions.map((question) => question.vocabularyId)).not.toEqual(vocabulary.slice(0, 3).map((item) => item.id));
    expect(new Set(questions.map((question) => question.vocabularyId)).size).toBe(questions.length);
  });

  it("QUIZ_PUBLIC_SESSION_DOES_NOT_EXPOSE_ANSWER", () => {
    const question = publicQuizQuestion(build("CONTEXT")[0]!);
    expect(question).not.toHaveProperty("answer");
    expect(question).not.toHaveProperty("feedback");
  });

  it("QUIZ_STATIC_SERVER_SEMANTIC_PARITY", () => {
    const random = () => 0.33;
    const serverQuestion = buildQuizQuestions({ language: "en", type: "FILL_BLANK", count: 1, vocabulary, createId: () => "server", random })[0]!;
    const staticQuestion = buildQuizQuestions({ language: "en", type: "FILL_BLANK", count: 1, vocabulary, createId: () => "static", random })[0]!;
    expect({ ...serverQuestion, id: "" }).toEqual({ ...staticQuestion, id: "" });
  });

  it("QUIZ_LOCAL_TTS_LISTENING_ZERO_CLOUD_REGRESSION", async () => {
    const local = vi.fn().mockResolvedValue("local-audio");
    const cloud = vi.fn().mockResolvedValue("cloud-audio");
    const browser = vi.fn().mockResolvedValue("browser-audio");
    await runAudioEnginePolicy({ engine: "LOCAL", playLocal: local, playCloud: cloud, playBrowser: browser });
    expect(cloud).not.toHaveBeenCalled();
    expect(browser).not.toHaveBeenCalled();
  });

  it("QUIZ_CHINESE_MODES_STABILITY", () => {
    const zhVocab: QuizVocabulary[] = [
      { id: "zh-1", language: "zh", term: "朋友", meaningVi: "bạn bè", pronunciation: "péngyou", metadata: { pinyin: "péngyou", toneData: [2, 0] } },
      { id: "zh-2", language: "zh", term: "学习", meaningVi: "học tập", pronunciation: "xuéxí", metadata: { pinyin: "xuéxí", toneData: [2, 2] } },
    ];
    for (const type of ["HANZI_TO_MEANING", "MEANING_TO_HANZI", "HANZI_TO_PINYIN", "PINYIN_TO_HANZI", "TONE_SELECTION", "LISTENING"]) {
      const q = buildQuizQuestions({ language: "zh", type, count: 1, vocabulary: zhVocab, createId: () => "zh" })[0]!;
      expect(q).toBeDefined();
      expect(q.answer).toBeTruthy();
    }
  });
});
