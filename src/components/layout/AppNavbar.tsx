import { useState } from 'preact/hooks';
import type { ThemeMode } from '../../types/theme.ts';

type AppNavbarProps = {
  themeMode: ThemeMode;
  navbarLogoSrc: string;
  onThemeModeChange: (mode: ThemeMode) => void;
};

export function AppNavbar({
  themeMode,
  navbarLogoSrc,
  onThemeModeChange,
}: AppNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleThemeModeChange = (mode: ThemeMode) => {
    onThemeModeChange(mode);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav class='navbar navbar-expand-md sticky-top border-bottom app-navbar'>
      <div class='container-fluid board-layout py-2'>
        <div class='d-flex align-items-center justify-content-between w-100'>
          <img
            src={navbarLogoSrc}
            alt='UNIPAMPA'
            class='brand-logo brand-logo-navbar'
            loading='eager'
          />
          <button
            class='navbar-toggler'
            type='button'
            aria-label='Abrir menu'
            aria-controls='app-navbar-menu'
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            <span class='navbar-toggler-icon' />
          </button>
        </div>

        <div
          id='app-navbar-menu'
          class={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}
        >
          <div class='d-flex align-items-center gap-2 navbar-theme-control ms-md-auto'>
            <i class='bi bi-circle-half' aria-hidden='true' />
            <label class='visually-hidden' for='theme-mode'>
              Tema
            </label>
            <select
              id='theme-mode'
              class='form-select form-select-sm theme-select'
              value={themeMode}
              onChange={(event) =>
                handleThemeModeChange(
                  (event.target as HTMLSelectElement).value as ThemeMode,
                )
              }
            >
              <option value='auto'>Tema: Automático</option>
              <option value='light'>Tema: Claro</option>
              <option value='dark'>Tema: Escuro</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
