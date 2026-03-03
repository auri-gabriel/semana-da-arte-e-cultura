import type { EventItem } from '../../types/event.ts';
import { formatHour } from '../../utils/events.ts';

type EventsListPanelProps = {
  events: EventItem[];
  selectedEventId: string;
  showDate: boolean;
  onSelectEvent: (eventId: string) => void;
};

export function EventsListPanel({
  events,
  selectedEventId,
  showDate,
  onSelectEvent,
}: EventsListPanelProps) {
  return (
    <section class='board-panel'>
      <div class='d-flex justify-content-between align-items-center mb-2'>
        <h2 class='h6 mb-0 d-flex align-items-center gap-1'>
          <i class='bi bi-calendar-event' aria-hidden='true' />
          Eventos do dia
        </h2>
        <span class='badge text-bg-secondary'>{events.length}</span>
      </div>

      <div class='events-list'>
        {events.length === 0 ? (
          <p class='text-body-secondary small mb-0'>
            <i class='bi bi-info-circle me-1' aria-hidden='true' />
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
                    {showDate && (
                      <>
                        <i
                          class='bi bi-calendar-date me-1'
                          aria-hidden='true'
                        />
                        {event.dateRaw} ·{' '}
                      </>
                    )}
                    <i class='bi bi-clock me-1' aria-hidden='true' />
                    {formatHour(event.start)}–{formatHour(event.end)} ·{' '}
                    {event.turno}
                  </div>
                  <div class='small text-truncate'>
                    <i class='bi bi-geo-alt me-1' aria-hidden='true' />
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
