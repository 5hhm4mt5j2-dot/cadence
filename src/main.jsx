import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/ltInteractions.js'
import App from './App.jsx'

// Defaults mirror the Claude Design export's data-props (weatherCondition, usdaApiKey).
createRoot(document.getElementById('root')).render(
  <App weatherCondition="auto" usdaApiKey="" />,
)
