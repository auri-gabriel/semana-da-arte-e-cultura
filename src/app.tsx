import { useEffect, useMemo, useState } from 'preact/hooks';
import { EventDetailsPanel } from './components/schedule/EventDetailsPanel.tsx';
import { EventsListPanel } from './components/schedule/EventsListPanel.tsx';
import { FiltersPanel } from './components/schedule/FiltersPanel.tsx';
import { WeekCalendar } from './components/schedule/WeekCalendar.tsx';
import type { EventItem } from './types/event.ts';
import { loadEvents, matchesFuzzySearch } from './utils/events.ts';

const ALL_DAYS = '__all__';
const EVENTS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1YFds-uLG-KyqgGe79ZEPXHIsZeKg9GmCQ-O-G57e67M/export?format=csv';

const withSelectedValue = (values: string[], selectedValue: string) => {
  if (!selectedValue || values.includes(selectedValue)) {
    return values;
  }

  return [...values, selectedValue].sort();
};

export function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedDay, setSelectedDay] = useState(ALL_DAYS);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [search, setSearch] = useState('');
  const [turno, setTurno] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [proponente, setProponente] = useState('');
  const [local, setLocal] = useState('');

  useEffect(() => {
    const load = async () => {
      const parsed = await loadEvents(EVENTS_CSV_URL);

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

  const turnos = useMemo(() => {
    const values = Array.from(new Set(dayEvents.map((event) => event.turno)))
      .filter(Boolean)
      .sort();

    return withSelectedValue(values, turno);
  }, [dayEvents, turno]);

  const modalidades = useMemo(() => {
    const values = Array.from(
      new Set(dayEvents.map((event) => event.modalidade)),
    )
      .filter(Boolean)
      .sort();

    return withSelectedValue(values, modalidade);
  }, [dayEvents, modalidade]);

  const proponentes = useMemo(() => {
    const values = Array.from(
      new Set(dayEvents.map((event) => event.proponente)),
    )
      .filter(Boolean)
      .sort();

    return withSelectedValue(values, proponente);
  }, [dayEvents, proponente]);

  const locais = useMemo(() => {
    const values = Array.from(new Set(dayEvents.map((event) => event.local)))
      .filter(Boolean)
      .sort();

    return withSelectedValue(values, local);
  }, [dayEvents, local]);

  const filteredEvents = useMemo(() => {
    return dayEvents.filter((event) => {
      const matchesSearch = matchesFuzzySearch(
        search,
        event.titulo,
        event.modalidade,
        event.proponente,
        event.local,
      );

      const matchesTurno = !turno || event.turno === turno;
      const matchesModalidade = !modalidade || event.modalidade === modalidade;
      const matchesProponente = !proponente || event.proponente === proponente;
      const matchesLocal = !local || event.local === local;

      return (
        matchesSearch &&
        matchesTurno &&
        matchesModalidade &&
        matchesProponente &&
        matchesLocal
      );
    });
  }, [dayEvents, search, turno, modalidade, proponente, local]);

  useEffect(() => {
    if (!filteredEvents.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(filteredEvents[0]?.id ?? '');
    }
  }, [filteredEvents, selectedEventId]);

  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedEventId) ??
    filteredEvents[0];

  return (
    <div class='app-shell'>
      <header class='border-bottom app-header'>
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
              modalidade={modalidade}
              proponente={proponente}
              local={local}
              turnos={turnos}
              modalidades={modalidades}
              proponentes={proponentes}
              locais={locais}
              onSearchChange={setSearch}
              onTurnoChange={setTurno}
              onModalidadeChange={setModalidade}
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
    </div>
  );
}
