import React, { useState } from 'react';
import {
  Zap, Plus, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronRight,
  Bell, ArrowRight, Upload, UserPlus, MessageSquare, Clock
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { AutomationRule } from '../../types';
import { generateId } from '../../utils/helpers';

const EVENT_LABELS: Record<string, string> = {
  stage_change: 'Mudança de estágio',
  approval: 'Aprovação/Rejeição',
  card_created: 'Card criado',
  due_date_near: 'Data de entrega próxima',
};

const ACTION_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  notify: { label: 'Enviar notificação', icon: <Bell className="w-3.5 h-3.5" /> },
  move_stage: { label: 'Mover para estágio', icon: <ArrowRight className="w-3.5 h-3.5" /> },
  upload_drive: { label: 'Upload ao Drive', icon: <Upload className="w-3.5 h-3.5" /> },
  assign_user: { label: 'Atribuir usuário', icon: <UserPlus className="w-3.5 h-3.5" /> },
  add_comment: { label: 'Adicionar comentário', icon: <MessageSquare className="w-3.5 h-3.5" /> },
};

export const AutomationsPanel: React.FC = () => {
  const { automations, setAutomations, isDarkMode, currentUser } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // New automation form state
  const [newName, setNewName] = useState('');
  const [newEvent, setNewEvent] = useState<string>('stage_change');
  const [newActionType, setNewActionType] = useState<string>('notify');

  const toggleEnabled = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
  };

  const createAutomation = () => {
    if (!newName.trim()) return;
    const rule: AutomationRule = {
      id: generateId('auto'),
      name: newName.trim(),
      enabled: true,
      trigger: { event: newEvent as AutomationRule['trigger']['event'] },
      actions: [{ type: newActionType as any, params: {} }],
      createdAt: new Date().toISOString(),
    };
    setAutomations(prev => [...prev, rule]);
    setNewName('');
    setShowCreate(false);
  };

  const cardClass = `rounded-xl border transition ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
            <Zap className="w-5 h-5 inline mr-2 text-amber-400" />Automações
          </h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
            Regras automáticas para notificações, uploads e atribuições
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 transition flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Nova Automação
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className={`${cardClass} p-5 space-y-4`}>
          <h3 className={`text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>Criar Automação</h3>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Nome</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Notificar ao aprovar"
              className={`w-full text-xs rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Quando (Trigger)</label>
              <select value={newEvent} onChange={e => setNewEvent(e.target.value)}
                className={`w-full text-xs rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                {Object.entries(EVENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Então (Ação)</label>
              <select value={newActionType} onChange={e => setNewActionType(e.target.value)}
                className={`w-full text-xs rounded-lg px-3 py-2 border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={createAutomation} className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500 transition">Criar</button>
            <button onClick={() => setShowCreate(false)} className={`px-4 py-2 text-xs font-bold rounded-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Automations List */}
      <div className="space-y-3">
        {automations.length === 0 ? (
          <div className={`${cardClass} p-8 text-center`}>
            <Zap className={`w-8 h-8 mx-auto mb-3 ${isDarkMode ? 'text-zinc-700' : 'text-slate-300'}`} />
            <p className={`text-sm font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Nenhuma automação configurada</p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>Crie regras para automatizar fluxos de trabalho</p>
          </div>
        ) : automations.map(auto => (
          <div key={auto.id} className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center gap-3 p-4">
              {/* Toggle */}
              <button onClick={() => toggleEnabled(auto.id)} className="shrink-0">
                {auto.enabled ? (
                  <ToggleRight className="w-6 h-6 text-green-400" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-zinc-500" />
                )}
              </button>

              {/* Info */}
              <button onClick={() => setExpandedId(expandedId === auto.id ? null : auto.id)} className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${auto.enabled ? (isDarkMode ? 'text-zinc-200' : 'text-slate-700') : (isDarkMode ? 'text-zinc-500' : 'text-slate-400')}`}>
                    {auto.name}
                  </span>
                  {!auto.enabled && <span className="text-[9px] bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full">Desativada</span>}
                </div>
                <div className={`flex items-center gap-2 mt-1 text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {EVENT_LABELS[auto.trigger.event] || auto.trigger.event}
                  </span>
                  <ArrowRight className="w-3 h-3" />
                  {auto.actions.map((a, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {ACTION_LABELS[a.type]?.icon}
                      {ACTION_LABELS[a.type]?.label || a.type}
                    </span>
                  ))}
                </div>
              </button>

              {/* Expand/Delete */}
              <div className="flex items-center gap-1">
                <button onClick={() => setExpandedId(expandedId === auto.id ? null : auto.id)}
                  className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-500' : 'hover:bg-slate-100 text-slate-400'}`}>
                  {expandedId === auto.id ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {isAdmin && (
                  <button onClick={() => deleteAutomation(auto.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === auto.id && (
              <div className={`px-4 pb-4 pt-0 border-t ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
                <div className="pt-3 space-y-2">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Trigger</span>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
                      {EVENT_LABELS[auto.trigger.event]}
                      {auto.trigger.condition && <span className="font-mono"> ({JSON.stringify(auto.trigger.condition)})</span>}
                    </p>
                  </div>
                  {auto.actions.map((action, i) => (
                    <div key={i} className={`p-3 rounded-lg ${isDarkMode ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Ação {i + 1}</span>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
                        {ACTION_LABELS[action.type]?.label || action.type}
                        {Object.keys(action.params).length > 0 && (
                          <span className="font-mono"> ({JSON.stringify(action.params)})</span>
                        )}
                      </p>
                    </div>
                  ))}
                  <p className={`text-[10px] ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>
                    Criada em {new Date(auto.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
