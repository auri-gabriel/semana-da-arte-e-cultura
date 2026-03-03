import { formatCalendarCell, formatDatePt } from '../../utils/events.ts';

type WeekCalendarProps = {
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
};

export function WeekCalendar({
  days,
  selectedDay,
  onSelectDay,
}: WeekCalendarProps) {
  return (
    <div class='week-calendar' role='tablist' aria-label='Seleção de dia'>
      {days.map((day) => {
        const { weekday, dayMonth } = formatCalendarCell(day);

        return (
          <button
            type='button'
            key={day}
            class={`week-calendar-day ${selectedDay === day ? 'is-active' : ''}`}
            onClick={() => onSelectDay(day)}
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
  );
}
