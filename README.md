# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Testing the meal photo flow

The meal **Photo** tab recognises a plate on-device with TensorFlow.js
(`public/models/food_v1.tflite`) and then looks up macros — USDA FoodData
Central first, with Open Food Facts as a fallback for foods USDA doesn't have.

**Prerequisite:** a USDA API key must be set before search/lookup will work.
Get a free one at <https://fdc.nal.usda.gov/api-key-signup> and put it in
`.env.local` (gitignored) as `VITE_USDA_API_KEY=...` — it is embedded at build
time, so it must be present before `npm run build`. See `.env.example`.

**Manual end-to-end check:**

1. `npm run dev`, open the app, go to **Meals → + Add Meal → Photo**.
2. Upload a clear photo of a single, common dish (e.g. a burger).
3. Expect: a brief "Estimating your meal…" state, then a **This meal** row with
   the recognised food and its macros, plus a **Meal total** and **Log meal**.

Notes:
- Classification is fully local (no rate limit); only the macro lookup hits the
  network, so a missing/rate-limited USDA key shows up as a failed lookup, not a
  failed classification.
- The model's label set skews toward common Western dishes; very exotic or
  international foods may not resolve in either database and will fall through to
  manual entry rather than logging a wrong match.
