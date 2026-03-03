import type { EventItem } from '../../types/event.ts';
import { formatHour } from '../../utils/events.ts';

type EventDetailsPanelProps = {
  event?: EventItem;
};

export function EventDetailsPanel({ event }: EventDetailsPanelProps) {
  const mapQuery = event?.local
    ? `${event.local}, Alegrete, RS, Brasil`
    : 'Alegrete, RS, Brasil';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div class='board-panel h-100 d-flex flex-column gap-3'>
      <div>
        <h2 class='h5 mb-1'>{event?.titulo ?? 'Selecione um evento'}</h2>
        {event && (
          <p class='mb-0 text-body-secondary'>
            <i class='bi bi-calendar-date me-1' aria-hidden='true' />
            {event.dateRaw} · {formatHour(event.start)}–{formatHour(event.end)}{' '}
            · {event.turno}
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

      {event && (
        <div class='small'>
          <div>
            <i class='bi bi-geo-alt me-1' aria-hidden='true' />
            <strong>Local:</strong> {event.local || 'A definir'}
          </div>
          <div>
            <i class='bi bi-person-badge me-1' aria-hidden='true' />
            <strong>Proponente:</strong> {event.proponente}
          </div>
          <a
            class='btn btn-sm btn-outline-primary mt-2 d-inline-flex align-items-center gap-1'
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
            target='_blank'
            rel='noreferrer'
          >
            <i class='bi bi-box-arrow-up-right' aria-hidden='true' />
            Abrir no mapa
          </a>
        </div>
      )}
    </div>
  );
}
