"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selectedDate?: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  minDate?: string; // YYYY-MM-DD
  className?: string;
}

export function Calendar({
  selectedDate,
  onSelectDate,
  minDate,
  className,
}: CalendarProps) {
  const initial = selectedDate ? new Date(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initial.getMonth());
  const [currentYear, setCurrentYear] = useState(initial.getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Fast shortcut to End of Current Month (often preferred in Ajo rotations)
  const setEndOfMonth = () => {
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const yyyy = lastDay.getFullYear();
    const mm = String(lastDay.getMonth() + 1).padStart(2, "0");
    const dd = String(lastDay.getDate()).padStart(2, "0");
    onSelectDate(`${yyyy}-${mm}-${dd}`);
  };

  const days = [];
  // Leading empty days
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className={cn("p-3.5 bg-surface dark:bg-[#181C21] rounded-[14px] border border-line dark:border-white/12 shadow-card dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] select-none w-full max-w-[310px]", className)}>
      {/* Month / Year Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="font-heading font-bold text-sm text-ink tracking-tight">
          {monthNames[currentMonth]} {currentYear}
        </h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1 rounded-[6px] hover:bg-canvas dark:hover:bg-white/10 text-muted hover:text-ink transition-colors touch-press"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1 rounded-[6px] hover:bg-canvas dark:hover:bg-white/10 text-muted hover:text-ink transition-colors touch-press"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {daysOfWeek.map((day) => (
          <span key={day} className="text-[11px] font-bold uppercase tracking-wider text-muted py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="w-8 h-8" />;
          }

          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;
          const isPast = minDate && dateStr < minDate;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={!!isPast}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "w-8 h-8 rounded-[7px] text-xs font-semibold flex items-center justify-center transition-all duration-120 touch-press mx-auto",
                isSelected
                  ? "bg-primary text-white dark:bg-indigo-500 dark:text-white font-bold shadow-xs"
                  : isToday
                  ? "border border-primary/40 text-primary dark:text-indigo-400 font-bold hover:bg-primary-tint dark:hover:bg-primary/20"
                  : "text-ink hover:bg-canvas dark:hover:bg-white/10 active:bg-line/40 dark:active:bg-white/15",
                isPast && "opacity-30 pointer-events-none text-muted"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Shortcut Footer */}
      <div className="mt-3 pt-2.5 border-t border-line/60 dark:border-white/10 flex items-center justify-between text-[11px]">
        <span className="text-muted">Tip: Ajo pays end-of-month</span>
        <button
          type="button"
          onClick={setEndOfMonth}
          className="font-bold text-primary hover:underline touch-press"
        >
          Select End of Month
        </button>
      </div>
    </div>
  );
}
