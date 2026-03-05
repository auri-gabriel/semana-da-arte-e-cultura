import type { EventItem } from '../../types/event.ts';
import { formatHour } from '../../utils/events.ts';

type EventDetailsPanelProps = {
  event?: EventItem;
};

export function EventDetailsPanel({ event }: EventDetailsPanelProps) {
  const mapQuery = event?.local
    ? `${event.local}, Alegrete, RS, Brasil`
    : 'Alegrete, RS, Brasil';
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=${event ? '15' : '12'}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div class='board-panel h-100 d-flex flex-column gap-3 event-details-panel'>
      <div class='event-details-header'>
        <h2 class='h5 mb-1'>{event?.titulo ?? 'Selecione um evento'}</h2>
        {event ? (
          <p class='mb-0 text-body-secondary small'>
            <i class='bi bi-calendar me-1' aria-hidden='true' />
            {event.dateRaw} · {formatHour(event.start)}–{formatHour(event.end)}{' '}
            · {event.turno}
          </p>
        ) : (
          <p class='mb-0 text-body-secondary small'>
            Escolha um item da lista para visualizar as informações completas da
            oficina.
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

      {event ? (
        <div class='small event-details-content'>
          <div class='event-details-item'>
            <i class='bi bi-tags me-2' aria-hidden='true' />
            <strong>Modalidade:</strong>
            <span class='ms-1'>{event.modalidade || 'A definir'}</span>
          </div>
          <div class='event-details-item'>
            <i class='bi bi-geo-alt me-2' aria-hidden='true' />
            <strong>Local:</strong>
            <span class='ms-1'>{event.local || 'A definir'}</span>
          </div>
          <div class='event-details-item'>
            <i class='bi bi-person-badge me-2' aria-hidden='true' />
            <strong>Proponente:</strong>
            <span class='ms-1'>{event.proponente}</span>
          </div>

          <a
            class='btn btn-primary text-white mt-2 px-3 py-2 d-inline-flex align-items-center justify-content-center gap-1 event-details-map-link'
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
            target='_blank'
            rel='noreferrer'
          >
            <i class='bi bi-box-arrow-up-right' aria-hidden='true' />
            Abrir no mapa
          </a>
        </div>
      ) : (
        <div class='event-details-empty text-body-secondary small'>
          <i class='bi bi-info-circle me-2' aria-hidden='true' />O mapa mostra
          uma visão geral da cidade até que um evento seja selecionado.
        </div>
      )}
    </div>
  );
}
