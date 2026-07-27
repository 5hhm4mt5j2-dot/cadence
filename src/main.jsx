import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/ltInteractions.js'
import App from './App.jsx'

// Defaults mirror the Claude Design export's data-props (weatherCondition, usdaApiKey).
// The USDA FoodData Central key comes from the VITE_USDA_API_KEY env var (see
// .env.local) and is embedded at build time — never hardcode it here.
createRoot(document.getElementById('root')).render(
  <App weatherCondition="auto" usdaApiKey={import.meta.env.VITE_USDA_API_KEY || ''} />,
)
