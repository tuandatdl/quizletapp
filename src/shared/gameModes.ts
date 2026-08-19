export const GAME_TYPES = ["MATCHING", "MEMORY", "LISTENING_CHOICE", "FILL_WORD", "SPEED_CHALLENGE"] as const;

export type GameType = (typeof GAME_TYPES)[number];

export interface GameVocabularySource {
  id: string;
  term: string;
  meaningVi: string;
}

export interface GeneratedGameItem {
  id: string;
  vocabularyId: string;
  prompt: string;
  answer: string;
  answered: boolean;
  audioText?: string;
  choices?: string[];
  hint?: string;
  revealText?: string;
}

export function isGameType(value: unknown): value is GameType {
  return typeof value === "string" && (GAME_TYPES as readonly string[]).includes(value);
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target]!, result[index]!];
  }
  return result;
}

function maskTerm(term: string): string {
  const characters = [...term];
  if (characters.length <= 2) return characters.map(() => "_").join(" ");
  return characters.map((character, index) => index === 0 || index === characters.length - 1 || !/[\p{L}\p{N}]/u.test(character) ? character : "_").join(" ");
}

export function buildGameItems(type: GameType, vocabulary: readonly GameVocabularySource[], createId: () => string): GeneratedGameItem[] {
  const meanings = vocabulary.map((item) => item.meaningVi);
  const terms = vocabulary.map((item) => item.term);
  return vocabulary.map((item) => {
    const base = { id: createId(), vocabularyId: item.id, answered: false };
    if (type === "MATCHING") return { ...base, prompt: item.term, answer: item.meaningVi, choices: shuffle(meanings) };
    if (type === "MEMORY") return { ...base, prompt: "Lật thẻ để xem từ", answer: item.term, revealText: item.term, hint: item.meaningVi };
    if (type === "LISTENING_CHOICE") return { ...base, prompt: "Nghe phát âm và chọn nghĩa đúng", answer: item.meaningVi, audioText: item.term, choices: shuffle(meanings) };
    if (type === "FILL_WORD") return { ...base, prompt: maskTerm(item.term), answer: item.term, hint: `Nghĩa tiếng Việt: ${item.meaningVi}` };
    return { ...base, prompt: item.meaningVi, answer: item.term, hint: "Nhập từ/cụm từ tương ứng nhanh nhất có thể", choices: shuffle(terms) };
  });
}

export function publicGameItem(item: GeneratedGameItem) {
  const { answer: _answer, ...publicItem } = item;
  return publicItem;
}

export function scoreGameAnswer(expected: string, actual: string): boolean {
  return expected.normalize("NFKC").trim().toLocaleLowerCase() === actual.normalize("NFKC").trim().toLocaleLowerCase();
}
