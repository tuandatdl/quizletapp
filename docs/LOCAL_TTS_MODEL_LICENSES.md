# Local TTS model and license review

## English model selected for this release

- Model ID: `en_US-lessac-medium`
- Runtime: Piper through `@pbji/piper-tts-web` (ONNX/WASM in a browser Web Worker)
- Approximate download: 63.2 MB (the published voice manifest lists 63,201,294 bytes)
- Audio: English (US), one speaker, 22,050 Hz
- Delivery: external, configurable URLs only. The `.onnx` and `.onnx.json` files are deliberately not committed, mirrored, or bundled in this repository.

The Piper voice repository reports an MIT repository license, but Piper's own
documentation says each voice model card must be reviewed because its training
data can have separate restrictions. The Lessac model card identifies the
Blizzard 2013 Lessac dataset and links to that dataset's license. We therefore
use the upstream model URL only and require product/legal approval before any
redistribution or mirroring of the binary.

Runtime configuration (all optional; defaults use the canonical upstream
model):

```text
VITE_LOCAL_TTS_EN_MODEL_URL
VITE_LOCAL_TTS_EN_CONFIG_URL
VITE_LOCAL_TTS_EN_MODEL_VERSION
VITE_LOCAL_TTS_EN_MODEL_SHA256
```

The model cache key includes the configured model version. A URL/version
change therefore cannot reuse an older model. The Worker checks size and JSON
configuration before use, retries one failed/corrupt download, and only then
starts the single Piper inference session.

## Chinese is intentionally deferred

No Chinese model binary is included or enabled in this phase. Candidate Piper
voices such as `zh_CN-huayan-medium` and `zh_CN-huayan-x_low` need an
independent MODEL_CARD and dataset-license review before adoption. Until then,
Chinese preserves the existing Cloud/BROWSER behavior.

## Sources to review

- Piper voices project and its per-voice licensing guidance: <https://github.com/rhasspy/piper/blob/master/VOICES.md>
- Lessac model card: <https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/lessac/medium/MODEL_CARD>
- Published voice manifest: <https://huggingface.co/rhasspy/piper-voices/blob/main/voices.json>
