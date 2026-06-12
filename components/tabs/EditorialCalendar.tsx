import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Eye
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { DemandCard } from '../../types';

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const EditorialCalendar: React.FC = () => {
  const { cards, brands, isDarkMode, canAccessBrand, setCards, setEditingCard, setIsDemandModalOpen } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragCard, setDragCard] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const accessibleCards = useMemo(() => cards.filter(c => canAccessBrand(c.brandId)), [cards, canAccessBrand]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const getCardsForDate = useCallback((date: Date): DemandCard[] => {
    const dateStr = date.toISOString().split('T')[0];
    return accessibleCards.filter(c => {
      if (c.dueDate) return c.dueDate.split('T')[0] === dateStr;
      return c.createdAt.split('T')[0] === dateStr;
    });
  }, [accessibleCards]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const handleDragStart = (cardId: string) => setDragCard(cardId);
  const handleDrop = (date: Date) => {
    if (!dragCard) return;
    setCards(prev => prev.map(c => c.id === dragCard ? { ...c, dueDate: date.toISOString(), updatedAt: new Date().toISOString() } : c));
    setDragCard(null);
  };

  const openCard = (card: DemandCard) => {
    setEditingCard(card);
    setIsDemandModalOpen(true);
  };

  const today = new Date();
  const isToday = (d: Date) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>Calendário Editorial</h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Arraste cards para agendar publicações</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goToday} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Hoje
          </button>
          <h3 className={`text-sm font-bold min-w-[160px] text-center ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>
            {MONTHS_PT[month]} {year}
          </h3>
          <button onClick={nextMonth} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-zinc-800' : 'border-slate-200'}`}>
        {/* Day headers */}
        <div className={`grid grid-cols-7 ${isDarkMode ? 'bg-zinc-900' : 'bg-slate-50'}`}>
          {DAYS_PT.map(d => (
            <div key={d} className={`py-2 text-center text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dayCards = getCardsForDate(day.date);
            const todayClass = isToday(day.date);

            return (
              <div
                key={i}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(day.date)}
                className={`min-h-[100px] p-1.5 border-t border-r last:border-r-0 transition ${
                  isDarkMode ? 'border-zinc-800' : 'border-slate-100'
                } ${
                  !day.isCurrentMonth ? (isDarkMode ? 'bg-zinc-950/50' : 'bg-slate-50/50') : (isDarkMode ? 'bg-zinc-900/30' : 'bg-white')
                } ${dragCard ? (isDarkMode ? 'hover:bg-indigo-950/20' : 'hover:bg-indigo-50/50') : ''}`}
              >
                <div className={`text-[11px] font-bold mb-1 ${
                  todayClass
                    ? 'text-white bg-indigo-600 w-6 h-6 rounded-full flex items-center justify-center'
                    : !day.isCurrentMonth
                      ? (isDarkMode ? 'text-zinc-700' : 'text-slate-300')
                      : (isDarkMode ? 'text-zinc-400' : 'text-slate-600')
                }`}>
                  {day.date.getDate()}
                </div>

                <div className="space-y-1">
                  {dayCards.slice(0, 3).map(card => {
                    const brand = brands.find(b => b.id === card.brandId);
                    return (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => handleDragStart(card.id)}
                        onClick={() => openCard(card)}
                        className={`px-1.5 py-1 rounded-lg text-[9px] font-semibold truncate cursor-pointer hover:opacity-80 transition border ${
                          isDarkMode ? 'border-zinc-700' : 'border-slate-200'
                        }`}
                        style={{
                          backgroundColor: brand ? `${brand.primaryColor}15` : '#6366f115',
                          color: brand?.primaryColor || '#6366f1',
                          borderLeftWidth: 3,
                          borderLeftColor: brand?.primaryColor || '#6366f1',
                        }}
                      >
                        {card.title}
                      </div>
                    );
                  })}
                  {dayCards.length > 3 && (
                    <span className={`text-[9px] font-bold ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>+{dayCards.length - 3} mais</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming cards without dates */}
      <div className={`rounded-2xl border p-4 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-xs font-bold mb-3 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
          <Clock className="w-3.5 h-3.5 inline mr-1.5" />
          Demandas sem data agendada ({accessibleCards.filter(c => !c.dueDate).length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {accessibleCards.filter(c => !c.dueDate).slice(0, 10).map(card => {
            const brand = brands.find(b => b.id === card.brandId);
            return (
              <div
                key={card.id}
                draggable
                onDragStart={() => handleDragStart(card.id)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold cursor-grab active:cursor-grabbing border transition hover:shadow-sm ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full inline-block mr-1.5 align-middle" style={{ backgroundColor: brand?.primaryColor || '#6366f1' }} />
                {card.title}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
