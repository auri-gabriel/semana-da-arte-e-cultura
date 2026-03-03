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
  return (
    <nav class='sticky-top bg-white border-bottom app-navbar'>
      <div class='container-fluid board-layout py-2 d-flex align-items-center justify-content-between gap-2 flex-wrap'>
        <div class='d-flex align-items-center gap-3 flex-wrap'>
          <img
            src={navbarLogoSrc}
            alt='UNIPAMPA'
            class='brand-logo brand-logo-navbar'
            loading='eager'
          />
        </div>
        <div class='d-flex align-items-center gap-2'>
          <label class='visually-hidden' for='theme-mode'>
            Tema
          </label>
          <select
            id='theme-mode'
            class='form-select form-select-sm theme-select'
            value={themeMode}
            onChange={(event) =>
              onThemeModeChange(
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
    </nav>
  );
}
