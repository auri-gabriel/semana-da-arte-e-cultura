import { useEffect, useRef, useState } from 'preact/hooks';
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
  const calendarRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;

    const updateScrollControls = () => {
      const maxScroll = Math.max(
        calendar.scrollWidth - calendar.clientWidth,
        0,
      );
      const currentScroll = calendar.scrollLeft;

      setHasOverflow(maxScroll > 4);
      setCanScrollPrev(currentScroll > 4);
      setCanScrollNext(currentScroll < maxScroll - 4);
    };

    updateScrollControls();

    calendar.addEventListener('scroll', updateScrollControls, {
      passive: true,
    });
    window.addEventListener('resize', updateScrollControls);

    const resizeObserver = new ResizeObserver(updateScrollControls);
    resizeObserver.observe(calendar);

    return () => {
      calendar.removeEventListener('scroll', updateScrollControls);
      window.removeEventListener('resize', updateScrollControls);
      resizeObserver.disconnect();
    };
  }, [days]);

  const scrollCalendar = (direction: -1 | 1) => {
    const calendar = calendarRef.current;
    if (!calendar) return;

    const step = Math.max(calendar.clientWidth * 0.65, 180);
    calendar.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    });
  };

  return (
    <div class='week-calendar-carousel'>
      <button
        type='button'
        class={`week-calendar-scroll-btn is-left ${hasOverflow ? 'is-visible' : ''}`}
        onClick={() => scrollCalendar(-1)}
        disabled={!canScrollPrev}
        aria-label='Rolar calendário para a esquerda'
      >
        <i class='bi bi-chevron-left' aria-hidden='true' />
      </button>

      <div
        ref={calendarRef}
        class='week-calendar'
        role='tablist'
        aria-label='Seleção de dia'
      >
        <button
          type='button'
          class={`week-calendar-day ${selectedDay === allDaysValue ? 'is-active' : ''}`}
          onClick={() => onSelectDay(allDaysValue)}
          role='tab'
          aria-selected={selectedDay === allDaysValue}
        >
          <span class='week-calendar-weekday'>Todos os</span>
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

      <button
        type='button'
        class={`week-calendar-scroll-btn is-right ${hasOverflow ? 'is-visible' : ''}`}
        onClick={() => scrollCalendar(1)}
        disabled={!canScrollNext}
        aria-label='Rolar calendário para a direita'
      >
        <i class='bi bi-chevron-right' aria-hidden='true' />
      </button>
    </div>
  );
}
