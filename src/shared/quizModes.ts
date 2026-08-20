export type QuizAnswerMode = "MULTIPLE_CHOICE" | "TEXT" | "AUDIO_MULTIPLE_CHOICE";

export interface QuizVocabulary {
  id: string;
  language: "en" | "zh";
  term: string;
  meaningVi: string;
  pronunciation?: string | null;
  example?: string | null;
  metadata?: Record<string, unknown>;
}

export interface GeneratedQuizQuestion {
  id: string;
  type: string;
  prompt: string;
  answer: string;
  options?: string[];
  audioText?: string;
  vocabularyId: string;
  contextText?: string;
  instruction?: string;
  answerMode: QuizAnswerMode;
  feedback: {
    term: string;
    meaningVi: string;
    completedSentence?: string;
  };
}

export interface BuildQuizQuestionsOptions {
  language: "en" | "zh";
  type: string;
  count: number;
  vocabulary: QuizVocabulary[];
  createId: () => string;
  random?: () => number;
}

const normalize = (value: string) => value.normalize("NFKC").trim().toLocaleLowerCase();
const nonEmpty = (value: string | null | undefined): value is string => Boolean(value?.trim());

export function shuffle<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target]!, result[index]!];
  }
  return result;
}

function uniqueValues(values: readonly string[], excluded: string): string[] {
  const known = new Set<string>([normalize(excluded)]);
  return values.filter((value) => {
    if (!value.trim() || known.has(normalize(value))) return false;
    known.add(normalize(value));
    return true;
  });
}

function choices(correct: string, values: readonly string[], random: () => number): string[] {
  const distractors = shuffle(uniqueValues(values, correct), random).slice(0, 3);
  const options = [correct, ...distractors];
  if (options.length < 2) throw new Error("Cần ít nhất hai đáp án khác nhau để tạo quiz trắc nghiệm.");
  return shuffle(options, random);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

/** Replaces the first whole English target only; it never changes substrings. */
export function blankExample(example: string | null | undefined, term: string): string | null {
  if (!example?.trim() || !term.trim()) return null;
  const expression = new RegExp(`(^|[^A-Za-z0-9_])(${escapeRegExp(term)})(?=$|[^A-Za-z0-9_])`, "iu");
  if (!expression.test(example)) return null;
  return example.replace(expression, "$1______");
}

function englishQuestion(item: QuizVocabulary, options: BuildQuizQuestionsOptions, random: () => number): GeneratedQuizQuestion | null {
  const meanings = options.vocabulary.map((value) => value.meaningVi).filter(nonEmpty);
  const terms = options.vocabulary.map((value) => value.term).filter(nonEmpty);
  const base = {
    id: options.createId(),
    type: options.type,
    vocabularyId: item.id,
    feedback: { term: item.term, meaningVi: item.meaningVi },
  };

  switch (options.type) {
    case "TERM_TO_MEANING":
      return { ...base, prompt: item.term, answer: item.meaningVi, options: choices(item.meaningVi, meanings, random), instruction: "Chọn nghĩa đúng", answerMode: "MULTIPLE_CHOICE" };
    case "MEANING_TO_TERM":
      return { ...base, prompt: item.meaningVi, answer: item.term, options: choices(item.term, terms, random), instruction: "Chọn thuật ngữ tiếng Anh đúng", answerMode: "MULTIPLE_CHOICE" };
    case "FILL_BLANK": {
      const prompt = blankExample(item.example, item.term);
      if (!prompt) return null;
      const distinctTerms = uniqueValues(terms, item.term);
      const answerMode: QuizAnswerMode = distinctTerms.length >= 1 ? "MULTIPLE_CHOICE" : "TEXT";
      return {
        ...base,
        prompt,
        answer: item.term,
        options: answerMode === "MULTIPLE_CHOICE" ? choices(item.term, terms, random) : undefined,
        instruction: "Chọn từ phù hợp để điền vào chỗ trống",
        answerMode,
        feedback: { ...base.feedback, completedSentence: item.example!.trim() },
      };
    }
    case "LISTENING":
      return { ...base, prompt: "Nghe và chọn nghĩa đúng", answer: item.meaningVi, options: choices(item.meaningVi, meanings, random), audioText: item.term, instruction: "Nghe và chọn nghĩa đúng", answerMode: "AUDIO_MULTIPLE_CHOICE" };
    case "CONTEXT": {
      if (!blankExample(item.example, item.term)) return null;
      return {
        ...base,
        prompt: `Trong câu trên, '${item.term}' có nghĩa gần nhất là gì?`,
        answer: item.meaningVi,
        options: choices(item.meaningVi, meanings, random),
        contextText: item.example!.trim(),
        instruction: "Dựa vào ngữ cảnh, chọn nghĩa đúng",
        answerMode: "MULTIPLE_CHOICE",
      };
    }
    default:
      return null;
  }
}

function legacyQuestion(item: QuizVocabulary, options: BuildQuizQuestionsOptions): GeneratedQuizQuestion | null {
  const metadata = item.metadata ?? {};
  let prompt = item.term;
  let answer = item.meaningVi;
  let audioText: string | undefined;
  if (["MEANING_TO_HANZI"].includes(options.type)) { prompt = item.meaningVi; answer = item.term; }
  if (options.type === "HANZI_TO_PINYIN") answer = String(metadata.pinyin ?? item.pronunciation ?? "");
  if (options.type === "PINYIN_TO_HANZI") { prompt = String(metadata.pinyin ?? item.pronunciation ?? ""); answer = item.term; }
  if (options.type === "TONE_SELECTION") {
    const tones = Array.isArray(metadata.toneData) ? metadata.toneData.map((tone) => tone === 0 ? "neutral" : String(tone)).join(" ") : undefined;
    answer = String(metadata.tone ?? tones ?? "");
  }
  if (options.type === "LISTENING") { prompt = "Nghe và nhập nghĩa tiếng Việt"; audioText = item.term; }
  if (!answer.trim()) return null;
  return {
    id: options.createId(), type: options.type, prompt, answer, audioText,
    vocabularyId: item.id, answerMode: "TEXT", feedback: { term: item.term, meaningVi: item.meaningVi },
  };
}

export function buildQuizQuestions(options: BuildQuizQuestionsOptions): GeneratedQuizQuestion[] {
  const random = options.random ?? Math.random;
  const candidates = options.vocabulary.filter((item) => item.language === options.language && nonEmpty(item.term) && nonEmpty(item.meaningVi));
  const selected = shuffle(candidates, random);
  const questions: GeneratedQuizQuestion[] = [];
  for (const item of selected) {
    if (questions.length >= Math.max(0, options.count)) break;
    const question = options.language === "en" ? englishQuestion(item, { ...options, vocabulary: candidates }, random) : legacyQuestion(item, options);
    if (question) questions.push(question);
  }
  if (!questions.length) {
    const needsExample = options.language === "en" && ["FILL_BLANK", "CONTEXT"].includes(options.type);
    throw new Error(needsExample ? "Cần từ vựng có câu ví dụ phù hợp để tạo dạng quiz này." : "Không đủ từ vựng hợp lệ để tạo quiz.");
  }
  return questions;
}

export function publicQuizQuestion(question: GeneratedQuizQuestion): Omit<GeneratedQuizQuestion, "answer" | "feedback"> {
  const { answer: _answer, feedback: _feedback, ...publicQuestion } = question;
  return publicQuestion;
}
