# Frontend Integration Contract

Version: `0.1.0`
Base URL: same origin, paths below start with `/api`
Source schemas: `src/shared/schemas.ts`
Source routes: `src/app.ts`

This file is the source of truth for Gemini UI integration. Backend business state must not be duplicated in the frontend.

## Global rules

### Authentication

All `/api/*` endpoints except `/api/auth/register` and `/api/auth/login` require:

```http
Authorization: Bearer <opaque-session-token>
Content-Type: application/json
```

Tokens are returned once by register/login, stored hashed server-side, expire after `SESSION_TTL_DAYS`, and are revoked by logout. A resource owned by another user returns `NOT_FOUND` to avoid leaking existence.

### Success and async state

Successful JSON responses use:

```json
{ "state": "success", "data": {} }
```

Collection responses with no elements use:

```json
{ "state": "empty", "data": [] }
```

`loading` and `idle` are frontend-only request lifecycle states. The UI should transition `idle -> loading -> success|empty|error`. A successful delete returns `204` without a body.

### Error contract

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": { "issues": [] }
  }
}
```

Supported codes and normal HTTP status: `VALIDATION_ERROR` 400, `UNAUTHORIZED` 401, `NOT_FOUND` 404, `CONFLICT` 409, `RATE_LIMITED` 429, `EXTERNAL_SERVICE_ERROR` 502, `SERVICE_NOT_CONFIGURED` 503, `INTERNAL_ERROR` 500. Production never returns stack traces.

Error presentation has one owner: the API layer parses the canonical error and throws a typed error; the initiating page/action chooses one toast or inline banner. API modules and reusable components must not also emit a toast for the same failure. A request without a body must not send `Content-Type: application/json`; bodyless POST endpoints such as full-reading translation rely on this rule. Malformed JSON transport input returns `400 VALIDATION_ERROR`, while an unavailable provider returns `503 SERVICE_NOT_CONFIGURED`.

### Shared primitives

```ts
type Language = "en" | "zh";
type TargetLanguage = "vi";
type VocabularyStatus = "NEW" | "LEARNING" | "REVIEW" | "MASTERED";
type ReviewAction = "AGAIN" | "HARD" | "GOOD" | "EASY";
type SelectionType = "word" | "phrase" | "sentence";
type ProviderAvailability = "AVAILABLE" | "NOT_CONFIGURED";
type PronunciationWordStatus = "good" | "warning" | "poor";
type Nullable<T> = T | null;
```

Absent optional request fields mean “leave unchanged.” Nullable response fields are explicitly listed below; the UI must not assume optional audio/provider data exists.

## Auth and settings

| Method | Endpoint | Auth | Request | Response data |
|---|---|---:|---|---|
| POST | `/api/auth/register` | No | `{name,email,password}`; password 8–128 chars | `{user,token}` |
| POST | `/api/auth/login` | No | `{email,password}` | `{user,token}` |
| POST | `/api/auth/logout` | Yes | none | `{loggedOut:true}` |
| GET | `/api/me` | Yes | none | `User` |
| GET | `/api/settings` | Yes | none | `UserSettings` |
| PATCH | `/api/settings` | Yes | partial `UserSettings` | updated settings |

```ts
interface User { id:string; name:string; email:string; avatar:string|null }
interface UserSettings {
  nativeLanguage:"vi"; currentLearningLanguage:Language;
  englishEnabled:boolean; chineseEnabled:boolean; dailyGoal:number;
  audioSpeed:0.75|1|1.25; autoPlayAudio:boolean;
  showTranslation:boolean; showPinyin:boolean; showHanzi:boolean; showVietnamese:boolean;
  themePreference:"light"|"dark"|"system";
  englishNewWordsTarget:number; chineseNewWordsTarget:number;
  reviewTarget:number; quizTarget:number; shadowingTarget:number;
}
```

Settings validation errors are `VALIDATION_ERROR`; invalid/expired session is `UNAUTHORIZED`.

## Vocabulary and flashcards

### VocabularyItem

```ts
interface VocabularyItem {
  id:string; userId:string; language:Language; term:string; normalizedTerm:string;
  pronunciation:string|null; meaningVi:string; partOfSpeech:string|null;
  example:string|null; exampleTranslation:string|null; topic:string|null;
  level:string|null; note:string|null;
  source:"MANUAL"|"READING_SELECTION"|"IMPORT";
  sourceReadingId:string|null; audioUrl:string|null; audioAvailable:boolean;
  favorite:boolean; metadata:Record<string,unknown>;
  createdAt:string; updatedAt:string;
  progress:{
    status:VocabularyStatus; ease:number; intervalDays:number; repetitions:number;
    nextReviewAt:string|null; lastReviewedAt:string|null;
    correctCount:number; incorrectCount:number;
  };
}
```

Recommended metadata:

```ts
interface EnglishMetadata { ipa?:string; cefr?:string; toeicLevel?:string; synonyms?:string[] }
interface ChineseMetadata {
  simplified?:string; traditional?:string; pinyin?:string;
  toneData?:Array<1|2|3|4|0>; tone?:1|2|3|4|"neutral";
  hskLevel?:number; strokeCount?:number; sentencePinyin?:string;
}
```

| Method | Endpoint | Request/query | Response/notes |
|---|---|---|---|
| POST | `/api/vocabulary` | `VocabularyInput` | `201 {item,duplicate:false}`; normalized duplicate returns `200 {item,duplicate:true}` |
| GET | `/api/vocabulary` | `language? topic? status? due? random? limit=1..100` | `VocabularyItem[]` |
| GET | `/api/vocabulary/:id` | none | `VocabularyItem` |
| PATCH | `/api/vocabulary/:id` | mutable partial fields | `VocabularyItem`; term/language are immutable |
| DELETE | `/api/vocabulary/:id` | none | `204` |
| PUT | `/api/vocabulary/:id/favorite` | `{favorite:boolean}` | `VocabularyItem` |
| POST | `/api/vocabulary/:id/review` | `{action:ReviewAction}` | item after deterministic SRS update |
| GET | `/api/flashcards` | same filters as vocabulary | deck; `due=true` for due deck, `random=true` for random deck |
| POST | `/api/flashcards/:id/answer` | `{action:ReviewAction}` | same SRS result as review |

`nextReviewAt` is null before the first answer. Missing audio is `audioUrl:null` and `audioAvailable:false`. Never render an audio button based only on language.

Example create:

```json
{
  "language":"zh", "term":"朋友", "pronunciation":"péngyou",
  "meaningVi":"bạn bè", "partOfSpeech":"noun", "level":"HSK1",
  "metadata":{"simplified":"朋友","traditional":"朋友","pinyin":"péngyou","toneData":[2,0],"hskLevel":1}
}
```

### Quick/bulk vocabulary

Quick input is language-aware and splits on commas, semicolons, or line breaks. It does not split on whitespace, so `give up` and `look forward to` remain phrases. Parsing trims values, drops empty values, and deduplicates by the same normalized `(user, language, term)` rule as normal vocabulary creation. Limits are 10,000 input characters, 100 unique terms, and 200 characters per term.

| Method | Endpoint | Request | Response/notes |
|---|---|---|---|
| POST | `/api/vocabulary/bulk-preview` | `{language,input}` | provider status plus preview items; never persists enrichment |
| POST | `/api/vocabulary/bulk` | `{language,items:unknown[]}` | `{mode:"PARTIAL",created,existing,failed}` |

```ts
type EnrichmentStatus = "READY" | "NEEDS_ENRICHMENT" | "EXISTS";
interface ProviderStatus { configured:boolean; provider:string|null }
interface VocabularySenseSuggestion {
  partOfSpeech?:string; meaningVi?:string; synonyms?:string[];
}
interface BulkPreviewItem {
  term:string; normalizedTerm:string; duplicate:boolean; status:EnrichmentStatus;
  suggestion:{
    pronunciation:string|null; ipa:string|null; pinyin:string|null;
    simplified:string|null; traditional:string|null;
    partOfSpeech:string|null; meaningVi:string|null; synonyms:string[];
    example:string|null; exampleTranslation:string|null; topic:string|null;
    cefr:string|null; toeicLevel:string|null; hskLevel:number|null;
    toneData:Array<0|1|2|3|4>; senses:VocabularySenseSuggestion[];
  };
  error?:{code:"SERVICE_NOT_CONFIGURED"|"EXTERNAL_SERVICE_ERROR";message:string};
}
interface BulkPreviewResponse {
  enrichment:ProviderStatus; items:BulkPreviewItem[];
}
```

`VocabularyEnrichmentService` accepts `{language,term,nativeLanguage:"vi"}` and may return a primary suggestion plus `senses`. No production adapter is bundled. When unconfigured, preview still parses and detects duplicates but returns `NEEDS_ENRICHMENT` with only null/empty suggestion fields. Preview is always review-only: it never auto-saves provider output.

Bulk create requires a non-empty user-approved `meaningVi` per item. It supports the common fields plus English IPA/CEFR/TOEIC, Chinese Pinyin/HSK/tone data, synonyms, and optional senses. Each valid item uses the existing transactional `VocabularyService.create`; one duplicate or invalid item does not roll back unrelated items. `failed[index]` identifies validation/create failures, and repeated terms created earlier in the same batch appear in `existing`. The core bulk service also accepts an internal source context, so future multi-selection/passage suggestions can reuse the same validation, duplicate, and persistence path after reading ownership has been checked.

## Readings

```ts
interface Token { text:string; type:"word"|"punctuation"|"space"; clickable:boolean }
interface ReadingSentence {
  id:string; passageId:string; order:number; text:string;
  translationVi:string|null; audioUrl:string|null; tokens:Token[];
}
interface ReadingPassage {
  id:string; userId:string; language:Language; title:string; content:string;
  translationVi:string|null; topic:string|null; level:string|null; wordCount:number;
  createdAt:string; updatedAt:string; sentences:ReadingSentence[];
}
```

| Method | Endpoint | Request/query | Response/notes |
|---|---|---|---|
| POST | `/api/readings` | `{language,title,content,translationVi?,topic?,level?}` | `201 ReadingPassage`; validates, stores raw text and creates ordered sentences atomically |
| GET | `/api/readings` | `language?` | summary array (content/sentences omitted) |
| GET | `/api/readings/:id` | none | full `ReadingPassage` with tokens |
| PATCH | `/api/readings/:id` | partial create request | full passage; changing content/language regenerates sentences atomically |
| DELETE | `/api/readings/:id` | none | `204` |
| POST | `/api/readings/:id/translate` | none | `TranslationResult` and persists `translationVi` |
| GET | `/api/translation/availability` | none | `{configured:boolean,provider:string|null}` |

English tokens follow word/punctuation boundaries. Chinese v0.1 uses a conservative two-Han-character fallback segmenter; always use the returned token list rather than splitting characters in UI. A future segmenter can replace it without changing this shape.

### Full translation

```ts
interface TranslationResult {
  passageId:string; original:string; translation:string;
  sourceLanguage:Language; targetLanguage:"vi";
}
```

The full-translation POST has no request body and therefore must not carry a JSON content type. If no provider adapter exists, translation endpoints return `503 SERVICE_NOT_CONFIGURED`; this is distinct from malformed transport input (`400 VALIDATION_ERROR`) and provider failure (`502 EXTERNAL_SERVICE_ERROR`). Regeneration uses the same endpoint and overwrites only the stored translation.

## Selected-text translation and save

| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/api/translate-selection` | `{text,sourceLanguage,targetLanguage:"vi",readingId?}` | `{original,translation,sourceLanguage,targetLanguage,type}` |
| POST | `/api/vocabulary/from-selection` | translation request + `{meaningVi,pronunciation?,partOfSpeech?}` | `{item,duplicate}` |

Selection text is trimmed and limited to 1,000 characters. `readingId`, when given, must be a passage owned by the caller. The endpoint classifies text into `word`, `phrase`, or `sentence`; classification is deterministic but intentionally approximate. Limit: 30 translation-selection requests per authenticated user per process minute, then `RATE_LIMITED`.

Example:

```json
// request
{"text":"takes time and patience","sourceLanguage":"en","targetLanguage":"vi","readingId":"<uuid>"}
// data
{"original":"takes time and patience","translation":"cần thời gian và sự kiên nhẫn","sourceLanguage":"en","targetLanguage":"vi","type":"phrase"}
```

Single-word provider enrichment such as pronunciation or part of speech can be passed when saving. These values are nullable because not every provider supplies them.

## Text to speech

`POST /api/tts`

```ts
interface TtsRequest { text:string; language:Language; voice?:string; speed:0.75|1|1.25 }
interface TtsResult { status:"READY"; mode:"audio"; audioUrl:string; durationMs?:number; provider:string }
```

Text is limited to 5,000 characters. The same endpoint serves passage, sentence, word, and phrase text. A real provider response always declares `mode:"audio"`; `durationMs` is absent unless the provider supplies a real duration. If the server provider is unavailable, response is `503 SERVICE_NOT_CONFIGURED`; UI may then offer browser SpeechSynthesis as an explicitly labelled fallback. Do not persist a browser-local URL or invent a duration.

### Reading playback session state

Playback position is frontend session state, not database state. Reading sentences have stable IDs and zero-based `order`, which form the semantic seek axis for browser SpeechSynthesis:

```ts
type PlaybackStatus = "idle"|"playing"|"paused"|"completed";
type ReadingPlaybackState =
  | {mode:"speech-synthesis";status:PlaybackStatus;currentSentenceIndex:number;currentSentenceId:string|null;totalSentences:number;speed:0.75|1|1.25}
  | {mode:"audio";status:PlaybackStatus;audioUrl:string;currentTimeMs:number;durationMs:number;speed:0.75|1|1.25;currentSentenceIndex?:number;currentSentenceId?:string|null;totalSentences?:number};
```

For `speech-synthesis`, pause/resume/previous/next/slider operations work by sentence. Seeking cancels the current utterance and starts at the selected sentence, then continues in order; a browser limitation may restart only the current sentence, never the whole passage. For `audio`, use the real `HTMLAudioElement.currentTime` and provider duration.

## Pronunciation and review

| Method | Endpoint | Request/query | Response |
|---|---|---|---|
| GET | `/api/pronunciation/availability` | none | `PronunciationAvailability` |
| POST | `/api/pronunciation/assess` | `PronunciationRequest` | saved `PronunciationResult` with `attemptId`, `createdAt` |
| GET | `/api/pronunciation/recent` | `limit=1..100` | recent attempts |
| GET | `/api/pronunciation/weakest` | `limit=1..100` | `{word,averageScore,attempts}[]`, only averages under 75 |

```ts
interface PronunciationRequest {
  expectedText:string; language:Language; audioBase64:string;
  audioMimeType?:"audio/webm"|"audio/ogg"|"audio/mp4"|"audio/mpeg"|"audio/wav";
  readingId?:string; sentenceId?:string;
}
interface PronunciationAvailability {
  status:ProviderAvailability;
  configured:boolean;
  provider:string|null;
  assessmentAvailable:boolean;
}
interface PronunciationResult {
  status:"READY"; overallScore:number; pronunciationScore:number; fluencyScore:number;
  rhythmScore?:number; toneAccuracy?:number;
  words:Array<{word:string;score:number;status:"good"|"warning"|"poor"}>;
}
```

Audio payload maximum is 15 MB encoded and must be valid base64. `audioMimeType` may include codec parameters after the media type. `sentenceId` requires `readingId`, and both resources must belong to the caller. When `assessmentAvailable` is false, local record/playback may remain enabled but server assessment submission must be disabled. Direct assess still returns `SERVICE_NOT_CONFIGURED`; no attempt or fake score is generated. `rhythmScore` and `toneAccuracy` are absent when the real provider does not support them.

## Shadowing state machine

```text
POST start -> ACTIVE/currentSentenceData
pronunciation assess (with readingId + current sentenceId)
POST advance (with saved attemptId)
repeat until last sentence -> COMPLETED
```

| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/api/shadowing` | `{readingId}` | `201 ShadowingSession` |
| GET | `/api/shadowing/:id` | none | current session and sentence |
| POST | `/api/shadowing/:id/advance` | `{attemptId}` | next/completed session |

`attemptId` must belong to the authenticated user and exactly match the current reading and sentence. The frontend cannot submit its own score or skip sentences. `completedAt` is null while active; `currentSentenceData` becomes null on completion.

## Quiz

English types: `TERM_TO_MEANING`, `MEANING_TO_TERM`, `FILL_BLANK`, `LISTENING`, `CONTEXT`, `READING_COMPREHENSION`.

Chinese types: `HANZI_TO_MEANING`, `MEANING_TO_HANZI`, `HANZI_TO_PINYIN`, `PINYIN_TO_HANZI`, `TONE_SELECTION`, `LISTENING`, `CONTEXT`.

| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/api/quizzes` | `{language,type,count:1..50}` | `201 QuizSession` |
| POST | `/api/quizzes/:id/answer` | `{answer}` | `{correct,expectedAnswer,session}` |

```ts
interface QuizSession {
  id:string; language:Language; type:string; totalQuestions:number; currentIndex:number;
  correct:number; incorrect:number; score:number; status:"ACTIVE"|"COMPLETED";
  startedAt:string; completedAt:string|null;
  currentQuestion:{id:string;prompt:string;audioText?:string;options?:string[];type:string;vocabularyId?:string}|null;
}
```

The correct answer is never present in `currentQuestion`. Listening questions use a non-revealing `prompt`; `audioText` contains only the text that the audio control should speak. Answer comparison normalizes Unicode, surrounding whitespace, and case. Score is integer percentage of all questions.

## Games

Types: `MATCHING`, `MEMORY`, `LISTENING_CHOICE`, `FILL_WORD`, `SPEED_CHALLENGE`.

| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/api/games` | `{language,type,count:2..30,timerSeconds?:10..600}` | `201 GameSession` |
| GET | `/api/games/:id` | none | current state |
| POST | `/api/games/:id/answer` | `{itemId,answer}` | `{correct,expectedAnswer,session}` |

Game state, current index, score, and completion are server-owned. The public current item never contains `answer`; listening-choice items may contain `audioText`. The UI should render the type-specific experience from the generic current item. Timer is configuration metadata in v0.1; authoritative timeout enforcement is a known follow-up.

## Progress, streak, activity, and Today

| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/api/progress/dashboard` | none | one aggregate dashboard response |
| GET | `/api/progress/streak` | none | `{streak}` |
| GET | `/api/today-plan` | none | configured English/Chinese targets and availability |
| POST | `/api/activity` | `{readingMinutes?,shadowingMinutes?,studySeconds?}` | recorded increments for current UTC day |

```ts
interface LanguageProgress {
  totalWords:number; mastered:number; learning:number; new:number; dueToday:number;
  quizAccuracy:number; pronunciationAverage:number; shadowingMinutes:number;
  readingCompleted:number; toneAccuracy?:number; // Chinese only
}
interface Dashboard {
  languages:{en:LanguageProgress;zh:LanguageProgress};
  global:{streak:number;todayGoal:number;todayCompleted:number;totalStudyTimeSeconds:number};
}
```

An active day means at least one vocabulary review, one completed quiz, five reading minutes, three shadowing minutes, or one pronunciation attempt. A current streak may start today or yesterday, so opening the app early in a new day does not erase yesterday's streak. Dates currently use UTC at the persistence boundary.

Today plan:

```ts
interface TodayPlan {
  date:string;
  english:{newWords:{target:number;available:number};dueReviews:{target:number;available:number};quiz:{target:number};shadowing:{targetMinutes:number}};
  chinese:{newWords:{target:number;available:number};dueReviews:{target:number;available:number};quiz:{target:number};shadowing:{targetMinutes:number};pinyin:{target:number}};
}
```

## Health and provider boot behavior

`GET /health` is public and returns service status plus boolean availability for translation, TTS, pronunciation, and vocabulary enrichment. Provider interfaces are stable, but concrete cloud adapters are intentionally absent. Merely setting provider names/API keys does not instantiate an adapter; one must be implemented and injected when composing the application. The default boot path remains healthy and reports all providers unavailable.

## Frontend integration checklist

- Store the opaque bearer token securely and clear it on any `UNAUTHORIZED` response.
- Model `idle/loading/success/empty/error` explicitly; use server `state` for the terminal successful state.
- Use tokens/sentences returned by Reading; do not re-segment Chinese or split it per character.
- Use `audioAvailable`/nullable URL before rendering server audio controls.
- Check translation availability before enabling Auto Translate.
- Keep local pronunciation recording available if useful, but check `assessmentAvailable` before enabling server scoring.
- Keep quick vocabulary preview editable and require explicit confirmation before calling bulk create.
- Advance shadowing only with the `attemptId` returned by pronunciation assess.
- Treat duplicate vocabulary as a successful idempotent outcome, not an error.
- Never calculate SRS, quiz score, streak, Today completion, or game progression in UI.
