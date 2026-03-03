import type { EventItem } from '../../types/event.ts';
import { formatHour } from '../../utils/events.ts';

type EventsListPanelProps = {
  events: EventItem[];
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
};

export function EventsListPanel({
  events,
  selectedEventId,
  onSelectEvent,
}: EventsListPanelProps) {
  return (
    <section class='board-panel'>
      <div class='d-flex justify-content-between align-items-center mb-2'>
        <h2 class='h6 mb-0'>Eventos do dia</h2>
        <span class='badge text-bg-secondary'>{events.length}</span>
      </div>

      <div class='events-list'>
        {events.length === 0 ? (
          <p class='text-body-secondary small mb-0'>
            Nenhum evento com os filtros atuais.
          </p>
        ) : (
          <div class='list-group'>
            {events.map((event) => {
              const isSelected = selectedEventId === event.id;

              return (
                <button
                  key={event.id}
                  type='button'
                  class={`list-group-item list-group-item-action ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectEvent(event.id)}
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
  );
}
