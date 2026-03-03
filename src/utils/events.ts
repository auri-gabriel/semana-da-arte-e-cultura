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

function isSubsequence(needle: string, haystack: string): boolean {
  if (!needle) return true;

  let index = 0;
  for (const char of haystack) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return true;
  }

  return false;
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const previous = new Array<number>(b.length + 1);
  const current = new Array<number>(b.length + 1);

  for (let j = 0; j <= b.length; j += 1) previous[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;

      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + substitutionCost,
      );
    }

    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }

  return previous[b.length];
}

function fuzzyMatchToken(token: string, value: string): boolean {
  if (!token) return true;
  if (!value) return false;
  if (value.includes(token)) return true;
  if (isSubsequence(token, value)) return true;

  const words = value.split(/\s+/).filter(Boolean);
  const maxDistance = token.length <= 4 ? 1 : 2;

  return words.some((word) => {
    if (Math.abs(word.length - token.length) > maxDistance) return false;
    return levenshteinDistance(token, word) <= maxDistance;
  });
}

export function matchesFuzzySearch(
  query: string,
  ...fields: string[]
): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  const values = fields.map((field) => normalize(field));
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return tokens.every((token) =>
    values.some((value) => fuzzyMatchToken(token, value)),
  );
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
