import { useEffect, useMemo, useState } from 'preact/hooks';

type EventItem = {
  id: string;
  dateRaw: string;
  dateKey: string;
  turno: string;
  start: string;
  end: string;
  local: string;
  proponente: string;
  titulo: string;
};

type ThemeMode = 'auto' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'unipampa-theme-mode';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'auto' || value === 'light' || value === 'dark';
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'auto';

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);

  return rows;
}

function toDateKey(dateBr: string): string {
  const [dd = '', mm = '', yyyy = ''] = dateBr.split('/');
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

function formatDatePt(dateKey: string): string {
  if (!dateKey) return '';
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

function formatCalendarCell(dateKey: string): {
  weekday: string;
  dayMonth: string;
} {
  if (!dateKey) return { weekday: '', dayMonth: '' };

  const date = new Date(`${dateKey}T00:00:00`);
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
    .format(date)
    .replace('.', '');
  const dayMonth = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);

  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    dayMonth,
  };
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function formatHour(value: string): string {
  return value?.slice(0, 5) ?? '';
}

export function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    getSystemTheme,
  );
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
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
      const url = `${import.meta.env.BASE_URL}Programação-Oficinas.csv`;
      const text = await fetch(url).then((response) => response.text());
      const rows = parseCsv(text);
      const [headers, ...body] = rows;

      const index = new Map(headers.map((header, i) => [header.trim(), i]));
      const get = (record: string[], col: string) =>
        record[index.get(col) ?? -1]?.trim() ?? '';

      const parsed = body
        .map((record, i) => {
          const dateRaw = get(record, 'Data');
          const dateKey = toDateKey(dateRaw);

          return {
            id: `evt-${i}`,
            dateRaw,
            dateKey,
            turno: get(record, 'Turno'),
            start: get(record, 'Início'),
            end: get(record, 'Fim'),
            local: get(record, 'Local'),
            proponente: get(record, 'Proponente'),
            titulo: get(record, 'Título'),
          } satisfies EventItem;
        })
        .filter((event) => event.dateKey)
        .sort((a, b) => {
          const byDate = a.dateKey.localeCompare(b.dateKey);
          if (byDate !== 0) return byDate;

          const byStart = a.start.localeCompare(b.start);
          if (byStart !== 0) return byStart;

          return a.titulo.localeCompare(b.titulo);
        });

      setEvents(parsed);
      if (parsed.length > 0) setSelectedDay(parsed[0].dateKey);
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
    () => events.filter((event) => event.dateKey === selectedDay),
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
    const normalizedSearch = normalize(search);
    return dayEvents.filter((event) => {
      const matchesSearch =
        !normalizedSearch ||
        normalize(event.titulo).includes(normalizedSearch) ||
        normalize(event.proponente).includes(normalizedSearch) ||
        normalize(event.local).includes(normalizedSearch);

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

  const mapQuery = selectedEvent?.local
    ? `${selectedEvent.local}, Alegrete, RS, Brasil`
    : 'Alegrete, RS, Brasil';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
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
      <nav class='sticky-top bg-body border-bottom app-navbar'>
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
                setThemeMode(
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

      <header class='bg-body border-bottom app-header'>
        <div class='container-fluid board-layout py-3'>
          <h1 class='h5 mb-3'>Programação de Oficinas</h1>

          <div class='week-calendar' role='tablist' aria-label='Seleção de dia'>
            {days.map((day) => {
              const { weekday, dayMonth } = formatCalendarCell(day);

              return (
                <button
                  type='button'
                  key={day}
                  class={`week-calendar-day ${selectedDay === day ? 'is-active' : ''}`}
                  onClick={() => setSelectedDay(day)}
                  role='tab'
                  aria-selected={selectedDay === day}
                >
                  <span class='week-calendar-weekday'>{weekday}</span>
                  <span class='week-calendar-date'>{dayMonth}</span>
                  <span class='week-calendar-full'>{formatDatePt(day)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main class='container-fluid board-layout py-3'>
        <div class='row g-3'>
          <aside class='col-12 col-xl-4'>
            <section class='board-panel mb-3'>
              <h2 class='h6 mb-3'>Filtros</h2>
              <div class='row g-2'>
                <div class='col-12'>
                  <label class='form-label'>Busca</label>
                  <input
                    class='form-control'
                    placeholder='Título, local ou proponente'
                    value={search}
                    onInput={(event) =>
                      setSearch((event.target as HTMLInputElement).value)
                    }
                  />
                </div>

                <div class='col-12 col-md-4 col-xl-12'>
                  <label class='form-label'>Turno</label>
                  <select
                    class='form-select'
                    value={turno}
                    onChange={(event) =>
                      setTurno((event.target as HTMLSelectElement).value)
                    }
                  >
                    <option value=''>Todos</option>
                    {turnos.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div class='col-12 col-md-8 col-xl-12'>
                  <label class='form-label'>Proponente</label>
                  <select
                    class='form-select'
                    value={proponente}
                    onChange={(event) =>
                      setProponente((event.target as HTMLSelectElement).value)
                    }
                  >
                    <option value=''>Todos</option>
                    {proponentes.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div class='col-12'>
                  <label class='form-label'>Local</label>
                  <select
                    class='form-select'
                    value={local}
                    onChange={(event) =>
                      setLocal((event.target as HTMLSelectElement).value)
                    }
                  >
                    <option value=''>Todos</option>
                    {locais.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section class='board-panel'>
              <div class='d-flex justify-content-between align-items-center mb-2'>
                <h2 class='h6 mb-0'>Eventos do dia</h2>
                <span class='badge text-bg-secondary'>
                  {filteredEvents.length}
                </span>
              </div>

              <div class='events-list'>
                {filteredEvents.length === 0 ? (
                  <p class='text-body-secondary small mb-0'>
                    Nenhum evento com os filtros atuais.
                  </p>
                ) : (
                  <div class='list-group'>
                    {filteredEvents.map((event) => {
                      const isSelected = selectedEvent?.id === event.id;

                      return (
                        <button
                          key={event.id}
                          type='button'
                          class={`list-group-item list-group-item-action ${isSelected ? 'active' : ''}`}
                          onClick={() => setSelectedEventId(event.id)}
                        >
                          <div class='fw-semibold'>{event.titulo}</div>
                          <div class='small'>
                            {formatHour(event.start)}–{formatHour(event.end)} ·{' '}
                            {event.turno}
                          </div>
                          <div class='small text-truncate'>
                            {event.local || 'Local a definir'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </aside>

          <section class='col-12 col-xl-8'>
            <div class='board-panel h-100 d-flex flex-column gap-3'>
              <div>
                <h2 class='h5 mb-1'>
                  {selectedEvent?.titulo ?? 'Selecione um evento'}
                </h2>
                {selectedEvent && (
                  <p class='mb-0 text-body-secondary'>
                    {selectedEvent.dateRaw} · {formatHour(selectedEvent.start)}–
                    {formatHour(selectedEvent.end)} · {selectedEvent.turno}
                  </p>
                )}
              </div>

              <div class='ratio ratio-16x9 border'>
                <iframe
                  title='Mapa do evento'
                  src={mapSrc}
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                />
              </div>

              {selectedEvent && (
                <div class='small'>
                  <div>
                    <strong>Local:</strong> {selectedEvent.local || 'A definir'}
                  </div>
                  <div>
                    <strong>Proponente:</strong> {selectedEvent.proponente}
                  </div>
                  <a
                    class='btn btn-sm btn-outline-primary mt-2'
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                    target='_blank'
                    rel='noreferrer'
                  >
                    Abrir no mapa
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer class='border-top bg-body-tertiary app-footer'>
        <div class='container-fluid board-layout py-3 d-flex flex-wrap align-items-center justify-content-between gap-2'>
          <span class='small text-body-secondary'>
            Semana da Arte e Cultura · UNIPAMPA
          </span>
          <img
            src={footerLogoSrc}
            alt='UNIPAMPA'
            class='brand-logo brand-logo-footer'
            loading='lazy'
          />
        </div>
      </footer>
    </div>
  );
}
