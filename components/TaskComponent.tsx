import React, { useState } from 'react';
import { 
  FileText, Image as ImageIcon, Calendar, User, ChevronDown, ChevronRight, Plus, Trash2, Edit2
} from 'lucide-react';
import { DemandCard, Brand } from '../types';

interface TaskComponentProps {
  card: DemandCard;
  brands: Brand[];
  isSubtask?: boolean;
  onEdit: (card: DemandCard) => void;
  onDelete?: (cardId: string) => void;
  onAddSubtask?: (parentId: string, subtaskTitle: string) => void;
}

const USERS_LIST = [
  { id: 'usr-1', name: 'Gabriel Fonseca (Admin)', email: 'gabrielfonseca99@gmail.com', role: 'admin', avatarColor: 'bg-indigo-600', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr-2', name: 'Ana Clara (Social Media)', email: 'anaclara@grupo.com', role: 'criativo', avatarColor: 'bg-rose-500', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr-3', name: 'Thiago Silva (Designer)', email: 'thiago.designer@grupo.com', role: 'criativo', avatarColor: 'bg-emerald-500', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr-4', name: 'Dr. Tavares (Cliente/Gestor)', email: 'tavares@tavares.adv.br', role: 'cliente', brandScope: 'tavares', avatarColor: 'bg-amber-600', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' }
];

export const TaskComponent: React.FC<TaskComponentProps> = ({
  card,
  brands,
  isSubtask = false,
  onEdit,
  onDelete,
  onAddSubtask
}) => {
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const brand = brands.find(b => b.id === card.brandId) || brands[0];
  const matchedUsers = USERS_LIST.filter(u => 
    card.assignedTo && card.assignedTo.includes(u.name)
  );

  // Map priority colors
  const priorityColor = card.priorityColor || '#3b82f6';

  const handleDragStart = (e: React.DragEvent) => {
    // Only allow dragging if it is not a nested subtask or if it supports nesting
    e.dataTransfer.setData('text/plain', card.id);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !onAddSubtask) return;
    onAddSubtask(card.id, newSubtaskTitle);
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      id={`card-widget-${card.id}`}
      draggable={!isSubtask}
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(card);
      }}
      className={`border rounded-xl space-y-3 cursor-grab active:cursor-grabbing hover:shadow-xl transition-all duration-150 relative overflow-hidden group select-none ${
        isSubtask 
          ? 'p-2.5 border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#0d0f17] scale-98 hover:bg-zinc-100 dark:hover:bg-[#11131c]' 
          : 'p-4 border-slate-200 bg-white dark:bg-[#151926] dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700/80 shadow-md'
      } text-slate-800 dark:text-zinc-100`}
      style={{
        borderTop: `4px solid ${priorityColor}`,
        boxShadow: card.priorityName === 'Urgente' ? '0 0 16px rgba(239, 68, 68, 0.15)' : 
                   card.priorityName === 'Alta' ? '0 0 12px rgba(249, 115, 22, 0.1)' : 'none'
      }}
    >
      {/* Top row */}
      {!isSubtask && (
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Círculo indicador com a cor da empresa selecionada */}
            <span 
              className="w-3 h-3 rounded-full shrink-0 border border-black/20" 
              style={{ backgroundColor: brand?.primaryColor || '#3b82f6' }}
              title={brand?.name || 'Empresa'}
            />
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-400 tracking-wider truncate">
              {brand?.name || card.brandId}
            </span>
          </div>

          {/* Approval status badge */}
          {!isSubtask && (
            <div className="flex items-center gap-1">
              {card.approvalStatus === 'aprovado' ? (
                <span className="text-[8px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-900 px-1.5 py-0.5 rounded">
                  ✓ Aprovado
                </span>
              ) : card.approvalStatus === 'revisar' ? (
                <span className="text-[8px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-bold border border-red-200 dark:border-red-900 px-1.5 py-0.5 rounded animate-pulse">
                  ! Alterações
                </span>
              ) : (
                <span className="text-[8px] bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                  Pendente
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Task Title */}
      <div className="space-y-1 text-left">
        <h4 className={`font-bold text-slate-900 dark:text-zinc-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors leading-snug break-words ${
          isSubtask ? 'text-xs' : 'text-sm'
        }`}>
          {card.title}
        </h4>
        {card.theme && !isSubtask && (
          <p className="text-[11px] text-slate-500 dark:text-zinc-500 line-clamp-2 leading-tight">
            🏷️ {card.theme}
          </p>
        )}
      </div>

      {/* Attachments / Meta Info Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-zinc-800/50 text-[10px] text-slate-500 dark:text-zinc-500">
        {/* Responsible user photos + Due date */}
        <div className="flex items-center gap-2">
          {matchedUsers.length > 0 ? (
            <div className="flex -space-x-1.5">
              {matchedUsers.map(user => (
                <img 
                  key={user.id}
                  src={user.avatarUrl} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  className="w-5.5 h-5.5 rounded-full object-cover border border-white dark:border-zinc-800 shrink-0" 
                  title={user.name}
                />
              ))}
            </div>
          ) : (
            <div className="w-5.5 h-5.5 rounded-full bg-slate-300 dark:bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-white uppercase shrink-0">
              ??
            </div>
          )}

          {card.dueDate && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-zinc-400 font-sans">
              <Calendar className="w-3 h-3 text-indigo-500/85 dark:text-indigo-400/85" />
              <span>{formatDate(card.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Attachment/Detail cues */}
        {!isSubtask && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-500 font-mono text-[9px]">
            {card.copyText && (
              <FileText className="w-3 h-3 text-indigo-600 dark:text-indigo-400" title="Contém Copy" />
            )}
            {card.artUrl && (
              <ImageIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" title="Contém Arte" />
            )}
            <span className="text-slate-500 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400">Editar →</span>
          </div>
        )}
      </div>

      {/* Subtasks Section - Recursive Render */}
      {!isSubtask && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-zinc-800/60" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1.5">
            <button 
              type="button"
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest hover:text-slate-800 dark:hover:text-zinc-200 transition"
            >
              {showSubtasks ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Subtarefas ({card.subtasks?.length || 0})</span>
            </button>
            
            <button
              type="button"
              onClick={() => setIsAddingSubtask(!isAddingSubtask)}
              className="p-1 rounded-md bg-slate-200 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-300 dark:hover:bg-zinc-800 transition"
              title="Adicionar Subtarefa"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isAddingSubtask && (
            <form onSubmit={handleAddSubtaskSubmit} className="mt-2 flex gap-1 animate-in fade-in slide-in-from-top-1 duration-100">
              <input
                type="text"
                required
                placeholder="Nova subtarefa..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 focus:border-indigo-500 text-xs text-slate-800 dark:text-white rounded-lg px-2.5 py-1.5 outline-none font-sans"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-1.5 rounded-lg text-xs transition"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubtask(false)}
                className="bg-slate-300 dark:bg-zinc-800 hover:bg-slate-400 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-100 p-1.5 rounded-lg text-xs transition"
              >
                ✕
              </button>
            </form>
          )}

          {showSubtasks && card.subtasks && card.subtasks.length > 0 && (
            <div className="mt-2 space-y-2 pl-2 border-l border-slate-300 dark:border-zinc-800/80 max-h-56 overflow-y-auto">
              {card.subtasks.map((subtask) => (
                <TaskComponent
                  key={subtask.id}
                  card={subtask}
                  brands={brands}
                  isSubtask={true}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddSubtask={onAddSubtask}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
