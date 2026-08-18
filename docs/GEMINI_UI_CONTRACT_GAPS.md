# Gemini UI Integration Contract Gap Report

## Status

`NO_BLOCKING_CONTRACT_GAPS`

All required features from `POST_ACCEPTANCE_FEATURE_FIX_R1` have been fully integrated:
1. **Quick Add Vocabulary**: Bulk preview, editable term rows, unconfigured enrichment handling, partial bulk create persistence, and after-save summary.
2. **Reading Mini Player**: Dedicated sentence-level `SpeechSynthesis` player with sentence seek slider, seamless Pause/Resume without restarting passage, active sentence highlight, sentence jump on click, and audio overlap prevention.
3. **Translation Availability**: Pre-flight gated Auto Translate panel and selection toolbar with informative inline status and zero raw technical error toasts.
4. **Pronunciation Experience**: Pre-flight gated assessment with full local recording and playback support when external cloud scoring is unavailable.
5. **Responsive Typography & Design**: Streamlined, natural reading typography, tabbed vocabulary creation, and compact responsive layouts across 390px to 1440px viewports.

---

## Non-Blocking Observations & Recommended Follow-ups

### 1. Streak Calculation Timezone Boundary
- **Feature**: Streak calculation (`/api/progress/streak`, `/api/progress/dashboard`)
- **Current Contract**: Dates use UTC at SQLite persistence boundary (`activity_date`).
- **UI Handling**: UI strictly renders the backend-provided streak without local timezone mutation.
- **Severity**: Non-blocking (`STREAK_USES_UTC`).

### 2. External Provider Credentials (Cloud AI)
- **Feature**: Cloud AI Adapters (DeepL/Google Translation, Azure TTS, Azure Speech Assessment, AI Vocabulary Enrichment)
- **Current Contract**: Returns `503 SERVICE_NOT_CONFIGURED` or `{ configured: false, assessmentAvailable: false }`.
- **UI Handling**: UI handles these states gracefully with inline notices, manual entry workflows, local audio playback, and browser SpeechSynthesis fallbacks.
- **Severity**: Non-blocking.
