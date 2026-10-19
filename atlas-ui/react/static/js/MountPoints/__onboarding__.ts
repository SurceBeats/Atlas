// atlas-ui/react/static/js/MountPoints/__onboarding__.ts
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import OnboardingLayout from '../Layouts/__onboarding__.tsx';
import { loadLanguage } from '../i18n/i18n.ts';

interface OnboardingData {
  version: string;
  versionHash: string;
}

const versionMeta = document.querySelector('meta[name="atlas-version"]');
const versionHashMeta = document.querySelector('meta[name="atlas-version-hash"]');

const onboardingData: OnboardingData = {
  version: versionMeta ? versionMeta.getAttribute('content') || '1.0.0' : '1.0.0',
  versionHash: versionHashMeta ? versionHashMeta.getAttribute('content') || '' : ''
};

const container = document.getElementById('atlas-react-root');

if (container) {
  loadLanguage().then(() => {
    const root = createRoot(container);
    root.render(createElement(OnboardingLayout, onboardingData));
  });
}