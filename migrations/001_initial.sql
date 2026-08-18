PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  native_language TEXT NOT NULL DEFAULT 'vi',
  current_learning_language TEXT NOT NULL DEFAULT 'en',
  english_enabled INTEGER NOT NULL DEFAULT 1,
  chinese_enabled INTEGER NOT NULL DEFAULT 1,
  daily_goal INTEGER NOT NULL DEFAULT 20,
  audio_speed REAL NOT NULL DEFAULT 1,
  auto_play_audio INTEGER NOT NULL DEFAULT 0,
  show_translation INTEGER NOT NULL DEFAULT 1,
  show_pinyin INTEGER NOT NULL DEFAULT 1,
  show_hanzi INTEGER NOT NULL DEFAULT 1,
  show_vietnamese INTEGER NOT NULL DEFAULT 1,
  theme_preference TEXT NOT NULL DEFAULT 'system',
  english_new_words_target INTEGER NOT NULL DEFAULT 5,
  chinese_new_words_target INTEGER NOT NULL DEFAULT 3,
  review_target INTEGER NOT NULL DEFAULT 10,
  quiz_target INTEGER NOT NULL DEFAULT 5,
  shadowing_target INTEGER NOT NULL DEFAULT 5
);

CREATE TABLE IF NOT EXISTS readings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK(language IN ('en','zh')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  translation_vi TEXT,
  topic TEXT,
  level TEXT,
  word_count INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reading_sentences (
  id TEXT PRIMARY KEY,
  passage_id TEXT NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  sentence_order INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation_vi TEXT,
  audio_url TEXT,
  UNIQUE(passage_id, sentence_order)
);

CREATE TABLE IF NOT EXISTS vocabulary_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK(language IN ('en','zh')),
  term TEXT NOT NULL,
  normalized_term TEXT NOT NULL,
  pronunciation TEXT,
  meaning_vi TEXT NOT NULL,
  part_of_speech TEXT,
  example TEXT,
  example_translation TEXT,
  topic TEXT,
  level TEXT,
  note TEXT,
  source TEXT NOT NULL DEFAULT 'MANUAL',
  source_reading_id TEXT REFERENCES readings(id) ON DELETE SET NULL,
  audio_url TEXT,
  favorite INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, language, normalized_term)
);

CREATE TABLE IF NOT EXISTS vocabulary_progress (
  vocabulary_id TEXT PRIMARY KEY REFERENCES vocabulary_items(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW','LEARNING','REVIEW','MASTERED')),
  ease REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  next_review_at TEXT,
  last_reviewed_at TEXT,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pronunciation_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  reading_id TEXT REFERENCES readings(id) ON DELETE SET NULL,
  sentence_id TEXT REFERENCES reading_sentences(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  score REAL NOT NULL,
  pronunciation_score REAL NOT NULL,
  fluency_score REAL NOT NULL,
  rhythm_score REAL,
  tone_accuracy REAL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pronunciation_word_results (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES pronunciation_attempts(id) ON DELETE CASCADE,
  vocabulary_id TEXT REFERENCES vocabulary_items(id) ON DELETE SET NULL,
  word TEXT NOT NULL,
  score REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('good','warning','poor'))
);

CREATE TABLE IF NOT EXISTS shadowing_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_id TEXT NOT NULL REFERENCES readings(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  current_sentence INTEGER NOT NULL DEFAULT 0,
  completed_count INTEGER NOT NULL DEFAULT 0,
  score_total REAL NOT NULL DEFAULT 0,
  average_score REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','COMPLETED')),
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  type TEXT NOT NULL,
  questions_json TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  current_index INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  incorrect INTEGER NOT NULL DEFAULT 0,
  score REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','COMPLETED')),
  started_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  type TEXT NOT NULL,
  state_json TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  timer_seconds INTEGER,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','COMPLETED')),
  started_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS study_activities (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date TEXT NOT NULL,
  vocabulary_reviews INTEGER NOT NULL DEFAULT 0,
  quizzes INTEGER NOT NULL DEFAULT 0,
  reading_minutes INTEGER NOT NULL DEFAULT 0,
  shadowing_minutes INTEGER NOT NULL DEFAULT 0,
  pronunciation_attempts INTEGER NOT NULL DEFAULT 0,
  study_seconds INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_vocab_user_language ON vocabulary_items(user_id, language);
CREATE INDEX IF NOT EXISTS idx_vocab_progress_due ON vocabulary_progress(next_review_at, status);
CREATE INDEX IF NOT EXISTS idx_readings_user_language ON readings(user_id, language);
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON study_activities(user_id, activity_date);
