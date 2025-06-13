import  { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { LandingPageAppView } from './LandingPageAppView';
import type { LandingPageViewModel } from '../../types/landing';

// Inicjalizacja React aplikacji w przeglądarce
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('landing-page');
  const viewModelData = container?.getAttribute('data-view-model');
  
  if (container && viewModelData) {
    try {
      const viewModel: LandingPageViewModel = JSON.parse(viewModelData);
      const root = createRoot(container);
      
      root.render(
        createElement(StrictMode, null,
          createElement(LandingPageAppView, { viewModel })
        )
      );
    } catch (error) {
      console.error('Błąd podczas inicjalizacji aplikacji landing page:', error);
    }
  }
}); 