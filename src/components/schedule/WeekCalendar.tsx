import { formatCalendarCell, formatDatePt } from '../../utils/events.ts';

type WeekCalendarProps = {
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
  allDaysValue: string;
};

export function WeekCalendar({
  days,
  selectedDay,
  onSelectDay,
  allDaysValue,
}: WeekCalendarProps) {
  return (
    <div class='week-calendar' role='tablist' aria-label='Seleção de dia'>
      <button
        type='button'
        class={`week-calendar-day ${selectedDay === allDaysValue ? 'is-active' : ''}`}
        onClick={() => onSelectDay(allDaysValue)}
        role='tab'
        aria-selected={selectedDay === allDaysValue}
      >
        <span class='week-calendar-weekday'>Todos</span>
        <span class='week-calendar-date'>dias</span>
        <span class='week-calendar-full'>Todos os dias</span>
      </button>
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
