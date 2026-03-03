import type { EventItem } from '../types/event.ts';

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

export function formatDatePt(dateKey: string): string {
  if (!dateKey) return '';
  const date = new Date(`${dateKey}T00:00:00`);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

export function formatCalendarCell(dateKey: string): {
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

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

export function formatHour(value: string): string {
  return value?.slice(0, 5) ?? '';
}

export async function loadEvents(baseUrl: string): Promise<EventItem[]> {
  const url = `${baseUrl}Programação-Oficinas.csv`;
  const text = await fetch(url).then((response) => response.text());
  const rows = parseCsv(text);
  const [headers, ...body] = rows;

  const index = new Map(headers.map((header, i) => [header.trim(), i]));
  const get = (record: string[], col: string) =>
    record[index.get(col) ?? -1]?.trim() ?? '';

  return body
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
}
