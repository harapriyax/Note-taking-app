import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarWidget() {
  const [viewDate, setViewDate] = useState(() => new Date())
  const today = new Date()

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthName = viewDate.toLocaleString('en-US', { month: 'short' })
  
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const days = Array.from({ length: firstDayIndex + daysInMonth }, (_, i) => 
    i >= firstDayIndex ? i - firstDayIndex + 1 : null
  )

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1))
  }

  const isToday = (day) => {
    if (!day) return false
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  return (
    <section className="dash-calendar">
      <div className="calendar-heading">
        <b>{monthName} {year}</b>
        <div className="calendar-controls">
          <button type="button" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={14} />
          </button>
          <button type="button" onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="calendar-days">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="calendar-weekday">{d}</span>
        ))}
        {days.map((day, index) => (
          <span
            key={`${day}-${index}`}
            className={`calendar-date ${isToday(day) ? 'today' : ''} ${!day ? 'empty' : ''}`}
          >
            {day || ''}
          </span>
        ))}
      </div>
    </section>
  )
}
