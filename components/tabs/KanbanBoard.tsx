import React, { useState } from 'react';
import {
  Plus, Settings, User, ArrowLeft, ArrowRight, Trash2, ChevronRight, ChevronDown
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { TaskComponent } from '../TaskComponent';
import { USERS } from '../../data/seedData';
import { DemandCard, KanbanColumn } from '../../types';

export const KanbanBoard: React.FC = () => {
  const {
    isDarkMode,
    cards,
    setCards,
    kanbanColumns,
    setKanbanColumns,
    viewMode,
    setViewMode,
    isKanbanEditMode,
    setIsKanbanEditMode,
    isDemandModalOpen,
    setIsDemandModalOpen,
    editingCard,
    setEditingCard,
    selectedFilterUser,
    setSelectedFilterUser,
    moveColumnLeft,
    moveColumnRight,
    deleteColumn,
    handleMoveStage,
    canAccessBrand,
    allUsers,
    activeProjectId,
    registerLog,
    handleAddSubtask,
    brands
  } = useApp();

  // Local state
  const [activeParameterBarPopover, setActiveParameterBarPopover] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Helper: get column color
  const getColumnColor = (colId: string): string => {
    switch (colId) {
      case 'a_fazer': return '#6b7280';
      case 'em_aprovacao': return '#eab308';
      case 'alteracoes': return '#f43f5e';
      default: return '#10b981';
    }
  };

  // Filter cards for a given column
  const getFilteredCards = (columnId: string): DemandCard[] => {
    return cards.filter(card => {
      if (card.stage !== columnId) return false;
      if (!canAccessBrand(card.brandId)) return false;
      if (activeProjectId !== 'all' && card.projectId !== activeProjectId) return false;
      if (selectedFilterUser && card.assignedTo && !card.assignedTo.includes(selectedFilterUser.name)) return false;
      if (selectedFilterUser && !card.assignedTo) return false;
      return true;
    });
  };

  // Stage column renderer
  const stageColumn = (col: KanbanColumn, colIndex: number) => {
    const colColor = getColumnColor(col.id);
    const filteredCards = getFilteredCards(col.id);

    return (
      <div
        key={col.id}
        className="flex-shrink-0 w-[320px] flex flex-col bg-slate-50 dark:bg-[#10121a] rounded-2xl border border-slate-200 dark:border-zinc-800"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const cardId = e.dataTransfer.getData('cardId');
          if (cardId) {
            handleMoveStage(cardId, col.id);
          }
        }}
      >
        {/* Column Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: colColor }}
              />
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide">
                {col.title}
              </h3>
              <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold px-1.5 py-0.5 rounded-full">
                {filteredCards.length}
              </span>
            </div>
          </div>
          {col.subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-zinc-500 ml-5">
              {col.subtitle}
            </p>
          )}

          {/* Edit mode controls */}
          {isKanbanEditMode && (
            <div className="flex items-center gap-1 mt-2 ml-5">
              <button
                type="button"
                onClick={() => moveColumnLeft(colIndex)}
                disabled={colIndex === 0}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 disabled:opacity-30 transition"
                title="Mover para esquerda"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveColumnRight(colIndex)}
                disabled={colIndex === kanbanColumns.length - 1}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 disabled:opacity-30 transition"
                title="Mover para direita"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => deleteColumn(col.id)}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950 text-red-500 dark:text-red-400 transition ml-auto"
                title="Excluir coluna"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Cards List */}
        <div className="flex-1 overflow-y-auto p-3 pt-1 space-y-3">
          {filteredCards.map(card => (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('cardId', card.id);
                setDraggedCardId(card.id);
              }}
              onDragEnd={() => setDraggedCardId(null)}
            >
              <TaskComponent
                card={card}
                brands={brands}
                onEdit={(c) => {
                  setEditingCard(c);
                  setIsDemandModalOpen(true);
                }}
                onDelete={(cardId) => {
                  setCards(prev => prev.filter(c => c.id !== cardId));
                  registerLog(cardId, 'Removeu o card de demanda.');
                }}
                onAddSubtask={handleAddSubtask}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* ACTION BAR */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-zinc-800 flex-wrap">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
            }`}
          >
            Quadro
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
            }`}
          >
            Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
            }`}
          >
            Calend&aacute;rio
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* User Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveParameterBarPopover(
                  activeParameterBarPopover === 'userFilter' ? null : 'userFilter'
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                selectedFilterUser
                  ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              {selectedFilterUser ? selectedFilterUser.name.split(' ')[0] : 'Filtrar'}
            </button>

            {activeParameterBarPopover === 'userFilter' && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl p-2 min-w-[200px]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilterUser(null);
                    setActiveParameterBarPopover(null);
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition"
                >
                  Todos os usu&aacute;rios
                </button>
                {USERS.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedFilterUser(user);
                      setActiveParameterBarPopover(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center gap-2 ${
                      selectedFilterUser?.id === user.id
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <span className={`w-5 h-5 rounded-full ${user.avatarColor} flex items-center justify-center text-[9px] text-white font-bold`}>
                        {user.name.charAt(0)}
                      </span>
                    )}
                    {user.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Edit Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsKanbanEditMode(!isKanbanEditMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              isKanbanEditMode
                ? 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            {isKanbanEditMode ? 'Editando' : 'Editar'}
          </button>

          {/* Nova Demanda Button */}
          <button
            type="button"
            onClick={() => {
              setEditingCard(null);
              setIsDemandModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Demanda
          </button>
        </div>
      </div>

      {/* ========== KANBAN VIEW ========== */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
          <div className="flex gap-4 h-full min-w-max">
            {kanbanColumns.map((col, idx) => stageColumn(col, idx))}

            {/* Add Column Card (edit mode) */}
            {isKanbanEditMode && (
              <div
                className="flex-shrink-0 w-[320px] flex items-center justify-center bg-slate-50/50 dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition"
                onClick={() => {
                  const newId = `col_${Date.now()}`;
                  setKanbanColumns(prev => [
                    ...prev,
                    { id: newId, title: 'Nova Coluna', subtitle: 'Clique para editar' }
                  ]);
                }}
              >
                <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-zinc-500">
                  <Plus className="w-8 h-8" />
                  <span className="text-xs font-bold">Adicionar Coluna</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== LIST VIEW ========== */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {kanbanColumns.map(col => {
            const filteredCards = getFilteredCards(col.id);
            const isExpanded = expandedStages[col.id] !== false; // default expanded
            const colColor = getColumnColor(col.id);

            return (
              <div
                key={col.id}
                className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden"
              >
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedStages(prev => ({ ...prev, [col.id]: !isExpanded }))
                  }
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-[#10121a] hover:bg-slate-100 dark:hover:bg-zinc-900 transition text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  )}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: colColor }}
                  />
                  <span className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                    {col.title}
                  </span>
                  <span className="text-[10px] bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold px-1.5 py-0.5 rounded-full">
                    {filteredCards.length}
                  </span>
                </button>

                {/* Rows */}
                {isExpanded && (
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {filteredCards.map(card => {
                      const matchedUsers = USERS.filter(
                        u => card.assignedTo && card.assignedTo.includes(u.name)
                      );
                      return (
                        <div
                          key={card.id}
                          onClick={() => {
                            setEditingCard(card);
                            setIsDemandModalOpen(true);
                          }}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-900/50 cursor-pointer transition"
                        >
                          {/* Title */}
                          <span className="flex-1 text-sm font-medium text-slate-800 dark:text-zinc-200 truncate">
                            {card.title}
                          </span>

                          {/* Assigned Users Avatars */}
                          <div className="flex -space-x-1.5 shrink-0">
                            {matchedUsers.length > 0 ? (
                              matchedUsers.map(u => (
                                <img
                                  key={u.id}
                                  src={u.avatarUrl}
                                  alt={u.name}
                                  className="w-5 h-5 rounded-full object-cover border border-white dark:border-zinc-800"
                                  title={u.name}
                                />
                              ))
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-zinc-400">
                                ?
                              </span>
                            )}
                          </div>

                          {/* Due Date */}
                          {card.dueDate && (
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 shrink-0">
                              {card.dueDate.split('-').reverse().join('/')}
                            </span>
                          )}

                          {/* Priority Badge */}
                          {card.priorityName && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 text-white"
                              style={{ backgroundColor: card.priorityColor || '#3b82f6' }}
                            >
                              {card.priorityName}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {filteredCards.length === 0 && (
                      <div className="px-4 py-6 text-center text-xs text-slate-400 dark:text-zinc-600">
                        Nenhuma demanda nesta etapa.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========== CALENDAR VIEW ========== */}
      {viewMode === 'calendar' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-zinc-800 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800">
            {/* Day Headers */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div
                key={day}
                className="bg-slate-100 dark:bg-zinc-900 px-3 py-2 text-center text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}

            {/* 30 Day Cells */}
            {Array.from({ length: 30 }, (_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#151926] min-h-[90px] p-2"
              >
                <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
