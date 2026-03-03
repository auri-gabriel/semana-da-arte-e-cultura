import { render } from 'preact';
import './styles/main.scss';
import { App } from './app.tsx';

const THEME_STORAGE_KEY = 'unipampa-theme-mode';

const getInitialTheme = (): 'light' | 'dark' => {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}

  return systemTheme;
};

document.documentElement.setAttribute('data-bs-theme', getInitialTheme());

render(<App />, document.getElementById('app')!);
