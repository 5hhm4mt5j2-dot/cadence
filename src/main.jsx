import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/ltInteractions.js'
import App from './App.jsx'

// Portrait lock, layer 1 of 3: the Screen Orientation API, which only resolves in an
// installed/fullscreen context (Android PWA) and rejects everywhere else — hence the
// manifest's "orientation": "portrait" and the #lt-rotate CSS fallback in index.css.
try {
  const so = window.screen && window.screen.orientation;
  if (so && so.lock) so.lock('portrait').catch(() => {});
} catch (e) { /* unsupported — the CSS fallback covers it */ }

// Defaults mirror the Claude Design export's data-props (weatherCondition, usdaApiKey).
// The USDA FoodData Central key comes from the VITE_USDA_API_KEY env var (see
// .env.local) and is embedded at build time — never hardcode it here.
createRoot(document.getElementById('root')).render(
  <App weatherCondition="auto" usdaApiKey={import.meta.env.VITE_USDA_API_KEY || ''} />,
)
