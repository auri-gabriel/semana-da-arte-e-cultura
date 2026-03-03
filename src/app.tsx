import { useEffect, useMemo, useState } from 'preact/hooks';
import { AppFooter } from './components/layout/AppFooter.tsx';
import { AppNavbar } from './components/layout/AppNavbar.tsx';
import { EventDetailsPanel } from './components/schedule/EventDetailsPanel.tsx';
import { EventsListPanel } from './components/schedule/EventsListPanel.tsx';
import { FiltersPanel } from './components/schedule/FiltersPanel.tsx';
import { WeekCalendar } from './components/schedule/WeekCalendar.tsx';
import type { EventItem } from './types/event.ts';
import type { ThemeMode } from './types/theme.ts';
import { loadEvents, matchesFuzzySearch } from './utils/events.ts';
import {
  THEME_STORAGE_KEY,
  getInitialThemeMode,
  getSystemTheme,
} from './utils/theme.ts';

const ALL_DAYS = '__all__';

export function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    getSystemTheme,
  );
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedDay, setSelectedDay] = useState(ALL_DAYS);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [search, setSearch] = useState('');
  const [turno, setTurno] = useState('');
  const [proponente, setProponente] = useState('');
  const [local, setLocal] = useState('');

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemThemeChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    media.addEventListener('change', onSystemThemeChange);
    return () => {
      media.removeEventListener('change', onSystemThemeChange);
    };
  }, []);

  const effectiveTheme = themeMode === 'auto' ? systemTheme : themeMode;

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {}
  }, [themeMode]);

  useEffect(() => {
    const load = async () => {
      const parsed = await loadEvents(import.meta.env.BASE_URL);

      setEvents(parsed);
    };

    load().catch((error) => {
      console.error('Erro ao carregar CSV de oficinas:', error);
      setEvents([]);
    });
  }, []);

  const days = useMemo(
    () => Array.from(new Set(events.map((event) => event.dateKey))).sort(),
    [events],
  );

  const dayEvents = useMemo(
    () =>
      selectedDay === ALL_DAYS
        ? events
        : events.filter((event) => event.dateKey === selectedDay),
    [events, selectedDay],
  );

  const turnos = useMemo(
    () =>
      Array.from(new Set(dayEvents.map((event) => event.turno)))
        .filter(Boolean)
        .sort(),
    [dayEvents],
  );

  const proponentes = useMemo(
    () =>
      Array.from(new Set(dayEvents.map((event) => event.proponente)))
        .filter(Boolean)
        .sort(),
    [dayEvents],
  );

  const locais = useMemo(
    () =>
      Array.from(new Set(dayEvents.map((event) => event.local)))
        .filter(Boolean)
        .sort(),
    [dayEvents],
  );

  const filteredEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      const matchesSearch = matchesFuzzySearch(
        search,
        event.titulo,
        event.proponente,
        event.local,
      );

      const matchesTurno = !turno || event.turno === turno;
      const matchesProponente = !proponente || event.proponente === proponente;
      const matchesLocal = !local || event.local === local;

      return matchesSearch && matchesTurno && matchesProponente && matchesLocal;
    });
  }, [dayEvents, search, turno, proponente, local]);

  useEffect(() => {
    if (!filteredEvents.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(filteredEvents[0]?.id ?? '');
    }
  }, [filteredEvents, selectedEventId]);

  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedEventId) ??
    filteredEvents[0];
  const navbarLogoFile =
    effectiveTheme === 'dark'
      ? 'RGB__SVG_assinat_horizontal_cor_NEGATIVO.svg'
      : 'RGB__SVG_assinat_horizontal_cor.svg';
  const footerLogoFile =
    effectiveTheme === 'dark'
      ? 'RGB__SVG_assinat_vertical_cor_NEGATIVO.svg'
      : 'RGB__SVG_assinat_vertical_cor.svg';
  const navbarLogoSrc = `${import.meta.env.BASE_URL}logos/${navbarLogoFile}`;
  const footerLogoSrc = `${import.meta.env.BASE_URL}logos/${footerLogoFile}`;

  return (
    <div class='app-shell'>
      <AppNavbar
        themeMode={themeMode}
        navbarLogoSrc={navbarLogoSrc}
        onThemeModeChange={setThemeMode}
      />

      <header class='bg-body border-bottom app-header'>
        <div class='container-fluid board-layout py-3'>
          <h1 class='h5 mb-1'>II Semana de Arte e Cultura de Alegrete</h1>
          <p class='text-body-secondary mb-3'>Programação de Oficinas</p>
          <WeekCalendar
            days={days}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            allDaysValue={ALL_DAYS}
          />
        </div>
      </header>

      <main class='container-fluid board-layout py-3'>
        <div class='row g-3'>
          <aside class='col-12 col-xl-4'>
            <FiltersPanel
              search={search}
              turno={turno}
              proponente={proponente}
              local={local}
              turnos={turnos}
              proponentes={proponentes}
              locais={locais}
              onSearchChange={setSearch}
              onTurnoChange={setTurno}
              onProponenteChange={setProponente}
              onLocalChange={setLocal}
            />
            <EventsListPanel
              events={filteredEvents}
              selectedEventId={selectedEvent?.id ?? ''}
              showDate={selectedDay === ALL_DAYS}
              onSelectEvent={setSelectedEventId}
            />
          </aside>

          <section class='col-12 col-xl-8'>
            <EventDetailsPanel event={selectedEvent} />
          </section>
        </div>
      </main>

      <AppFooter footerLogoSrc={footerLogoSrc} />
    </div>
  );
}
