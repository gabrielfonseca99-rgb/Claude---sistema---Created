import React, { useMemo, useState } from 'react';
import {
  BarChart3, TrendingUp, Clock, Users, CheckCircle2, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const AnalyticsDashboard: React.FC = () => {
  const { cards, brands, kanbanColumns, isDarkMode, canAccessBrand, allUsers } = useApp();
  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | 'all'>('all');

  const accessibleCards = useMemo(() => cards.filter(c => canAccessBrand(c.brandId)), [cards, canAccessBrand]);

  const now = Date.now();
  const filtered = useMemo(() => {
    if (periodFilter === 'all') return accessibleCards;
    const days = periodFilter === '7d' ? 7 : 30;
    const cutoff = now - days * 86400000;
    return accessibleCards.filter(c => new Date(c.createdAt).getTime() >= cutoff);
  }, [accessibleCards, periodFilter, now]);

  // Metrics
  const totalCards = filtered.length;
  const approved = filtered.filter(c => c.approvalStatus === 'aprovado').length;
  const pending = filtered.filter(c => c.approvalStatus === 'pendente').length;
  const rejected = filtered.filter(c => c.approvalStatus === 'revisar').length;
  const approvalRate = totalCards > 0 ? Math.round((approved / totalCards) * 100) : 0;

  // By stage
  const byStage = useMemo(() => {
    const map: Record<string, number> = {};
    for (const col of kanbanColumns) map[col.title] = 0;
    for (const c of filtered) {
      const col = kanbanColumns.find(k => k.id === c.stage);
      if (col) map[col.title] = (map[col.title] || 0) + 1;
    }
    return Object.entries(map);
  }, [filtered, kanbanColumns]);

  // By brand
  const byBrand = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of brands) if (canAccessBrand(b.id)) map[b.name] = 0;
    for (const c of filtered) {
      const b = brands.find(br => br.id === c.brandId);
      if (b) map[b.name] = (map[b.name] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered, brands, canAccessBrand]);

  // By assignee
  const byAssignee = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of filtered) {
      for (const a of (c.assignedTo || [])) {
        map[a] = (map[a] || 0) + 1;
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  // Average time (days from created to updated for completed cards)
  const avgDays = useMemo(() => {
    const completed = filtered.filter(c => c.approvalStatus === 'aprovado');
    if (completed.length === 0) return 0;
    const total = completed.reduce((sum, c) => {
      const diff = new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime();
      return sum + diff / 86400000;
    }, 0);
    return (total / completed.length).toFixed(1);
  }, [filtered]);

  const maxStage = Math.max(...byStage.map(([, v]) => v), 1);
  const maxBrand = Math.max(...byBrand.map(([, v]) => v), 1);

  const cardClass = `rounded-2xl p-5 border shadow-sm ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100'}`;
  const labelClass = `text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`;
  const valueClass = `text-2xl font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>Dashboard de Analytics</h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Métricas de produtividade e demandas</p>
        </div>
        <div className="flex gap-1.5">
          {(['7d', '30d', 'all'] as const).map(p => (
            <button key={p} onClick={() => setPeriodFilter(p)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition ${
                periodFilter === p
                  ? 'bg-indigo-600 text-white'
                  : isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}>
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-indigo-400" /></div>
            <span className={labelClass}>Total</span>
          </div>
          <p className={valueClass}>{totalCards}</p>
          <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>demandas no período</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-green-400" /></div>
            <span className={labelClass}>Aprovadas</span>
          </div>
          <p className={valueClass}>{approved}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-green-400 font-bold">{approvalRate}% taxa de aprovação</span>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center"><Clock className="w-4 h-4 text-amber-400" /></div>
            <span className={labelClass}>Pendentes</span>
          </div>
          <p className={valueClass}>{pending}</p>
          <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>aguardando ação</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-purple-400" /></div>
            <span className={labelClass}>Tempo Médio</span>
          </div>
          <p className={valueClass}>{avgDays}d</p>
          <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>criação até aprovação</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Stage */}
        <div className={`${cardClass} space-y-4`}>
          <h3 className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>Demandas por Estágio</h3>
          <div className="space-y-3">
            {byStage.map(([stage, count]) => (
              <div key={stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{stage}</span>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>{count}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${(count / maxStage) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Brand */}
        <div className={`${cardClass} space-y-4`}>
          <h3 className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>Demandas por Marca</h3>
          <div className="space-y-3">
            {byBrand.map(([brand, count]) => {
              const b = brands.find(br => br.name === brand);
              return (
                <div key={brand}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: b?.primaryColor || '#6366f1' }} />
                      <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{brand}</span>
                    </div>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>{count}</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(count / maxBrand) * 100}%`, backgroundColor: b?.primaryColor || '#6366f1' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Assignee */}
        <div className={`${cardClass} space-y-3`}>
          <h3 className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
            <Users className="w-3.5 h-3.5 inline mr-1.5" />Carga por Colaborador
          </h3>
          {byAssignee.length === 0 ? (
            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Nenhuma atribuição encontrada</p>
          ) : byAssignee.map(([name, count]) => (
            <div key={name} className="flex items-center justify-between">
              <span className={`text-[11px] truncate ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{name}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-600'}`}>{count}</span>
            </div>
          ))}
        </div>

        {/* Status Breakdown */}
        <div className={`${cardClass} space-y-3`}>
          <h3 className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>Status de Aprovação</h3>
          <div className="flex gap-4">
            {[
              { label: 'Aprovadas', val: approved, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Pendentes', val: pending, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Em Revisão', val: rejected, color: 'text-red-400', bg: 'bg-red-500/10' },
            ].map(s => (
              <div key={s.label} className="flex-1 text-center">
                <div className={`w-12 h-12 mx-auto rounded-2xl ${s.bg} flex items-center justify-center mb-1.5`}>
                  <span className={`text-lg font-bold ${s.color}`}>{s.val}</span>
                </div>
                <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{s.label}</span>
              </div>
            ))}
          </div>
          {/* Mini bar */}
          {totalCards > 0 && (
            <div className="h-3 rounded-full overflow-hidden flex">
              <div className="bg-green-500 transition-all" style={{ width: `${(approved / totalCards) * 100}%` }} />
              <div className="bg-amber-500 transition-all" style={{ width: `${(pending / totalCards) * 100}%` }} />
              <div className="bg-red-500 transition-all" style={{ width: `${(rejected / totalCards) * 100}%` }} />
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className={`${cardClass} space-y-3`}>
          <h3 className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>Atividade Recente</h3>
          {filtered.slice(0, 5).map(c => {
            const b = brands.find(br => br.id === c.brandId);
            return (
              <div key={c.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b?.primaryColor || '#6366f1' }} />
                <span className={`text-[11px] truncate flex-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{c.title}</span>
                <span className={`text-[9px] font-mono ${isDarkMode ? 'text-zinc-600' : 'text-slate-300'}`}>
                  {new Date(c.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
