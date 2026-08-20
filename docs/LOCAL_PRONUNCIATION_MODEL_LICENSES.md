# Local pronunciation model delivery

The static English coach uses `@huggingface/transformers` in a Web Worker with
`onnx-community/whisper-tiny.en` revision
`2575352d61be1bf7225cf8f8b268a4678025fc58`. This ONNX repository explicitly
documents Transformers.js pipeline usage and identifies `openai/whisper-tiny.en`
as its base model.

The base model card declares **Apache-2.0**. The ONNX conversion repository does
not declare a separate license in its card, so this integration preserves the
base-model attribution and does not redistribute any model artifact.

Runtime selection is `dtype: "q4"` for browser WASM use. Current published
artifacts are approximately 86.7 MB for the q4 merged decoder and 9 MB for the
q4 encoder, plus roughly 4 MB of tokenizer/config files. Product download copy
therefore describes this as an approximately 100 MB first-use download. Model
files are downloaded by the browser only when the learner first requests local
analysis, cached by Transformers.js browser cache, and never committed to Git.

The static build also ships ONNX Runtime WASM assets in the ASR Worker (about
48 MB uncompressed in the current Pages build). They are requested only when
the Worker is created for local analysis. In a cold browser the total first-use
transfer can therefore be materially larger than the 100 MB model payload;
subsequent analyses reuse browser cache where the browser permits it.

The model is ASR only. The product presents transcript alignment as “Điểm luyện
đọc” / “Độ khớp lời đọc”; it does not claim phoneme accuracy, accent quality, or
Chinese tone assessment.

Sources:

- https://huggingface.co/onnx-community/whisper-tiny.en
- https://huggingface.co/openai/whisper-tiny.en
- https://huggingface.co/onnx-community/whisper-tiny.en/tree/main
