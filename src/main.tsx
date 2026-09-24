import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AutoHealingErrorBoundary } from './components/AutoHealingErrorBoundary';
import { initGlobalAutoHealer } from './utils/autoHealer';

// Initialize self-healing listeners immediately before React bootstrap
initGlobalAutoHealer();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AutoHealingErrorBoundary>
      <App />
    </AutoHealingErrorBoundary>
  </StrictMode>,
);
