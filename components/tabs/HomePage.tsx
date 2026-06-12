import React from 'react';
import { Bell, Check, X, Lock, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { USERS } from '../../data/seedData';
import { DemandCard } from '../../types';

export const HomePage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isDarkMode,
    currentUser,
    brands,
    cards,
    setCards,
    notifications,
    setNotifications,
    registerLog,
    canAccessBrand,
    selectedClientBrandId,
    setSelectedClientBrandId,
    storyBrandId,
    setStoryBrandId,
    generatorBrandId,
    setGeneratorBrandId,
    handleSaveDemand,
  } = useApp();

  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 text-left animate-in fade-in" id="module-home-page">

      {/* ==========================================
          NOTIFICATION BANNER
          ========================================== */}
      <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-2xl flex flex-col gap-4" id="home-notifications-container">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 animate-bounce" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 font-mono">Avisos e Notificações</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full font-mono">
                {unreadCount} Novas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n));
                registerLog('system', 'Marcou todas as notificações de usuário como lidas.');
              }}
              className="text-[10px] text-indigo-600 hover:text-indigo-850 font-bold px-2 py-1 rounded bg-indigo-50/70 transition"
            >
              Marcar todas como lidas
            </button>
            <button
              type="button"
              onClick={() => {
                setNotifications(prev => prev.filter(n => n.userId !== currentUser.id));
                registerLog('system', 'Limpou todas as notificações pessoais.');
              }}
              className="text-[10px] text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:text-zinc-300 font-bold transition"
            >
              Limpar tudo
            </button>
          </div>
        </div>

        {userNotifications.length === 0 ? (
          <div className="py-4 text-center text-slate-400 dark:text-zinc-500 text-xs">
            <span>Tudo limpo! Nenhuma menção ou nova herança associada a @{currentUser.name} até agora.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userNotifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  notif.read ? 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 opacity-75' : 'bg-[#eef2ff]/80 dark:bg-indigo-950/30 border-indigo-150 dark:border-indigo-900/50 shadow-sm'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-sm shrink-0">
                  {notif.avatarText}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-tight">
                    <strong className="font-bold text-slate-900 dark:text-zinc-100">{notif.senderName}</strong> {notif.message}
                  </p>
                  {notif.targetCardTitle && (
                    <p className="text-[10px] text-indigo-700 font-bold mt-1 uppercase font-mono truncate">
                      ↳ Demanda: {notif.targetCardTitle}
                    </p>
                  )}
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono mt-1 block">{notif.timeAgo}</span>
                </div>
                <div className="flex flex-col gap-1.5 justify-center shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                      title="Marcar como lida"
                      className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                    title="Dispensar"
                    className="p-1 rounded-md text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-700 bg-white dark:bg-zinc-800 border border-slate-150 dark:border-zinc-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==========================================
          BRAND SELECTION GRID / CLIENT DASHBOARD
          ========================================== */}
      {!selectedClientBrandId ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 uppercase tracking-wide font-mono">Empresas do Grupo</h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500">Clique em qualquer empresa abaixo para abrir a Central de Demandas focada exclusivamente naquele cliente.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {brands.map(brand => {
              const numDemands = cards.filter(c => c.brandId === brand.id && c.stage === 'a_fazer').length;
              const myScope = canAccessBrand(brand.id);
              return (
                <div
                  key={brand.id}
                  onClick={() => {
                    if (myScope) {
                      setSelectedClientBrandId(brand.id);
                    } else {
                      alert(`Sua permissão multi-tenancy (${currentUser.role}) não concede acesso focal à marca ${brand.name}.`);
                    }
                  }}
                  className={`bg-[#033625] text-white rounded-2xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer relative flex flex-col justify-center items-center text-center h-36 border-2 border-emerald-950 hover:border-emerald-700/50 hover:scale-[1.015] ${
                    !myScope ? 'opacity-60 grayscale hover:opacity-100' : ''
                  }`}
                  id={`group-brand-card-${brand.id}`}
                >
                  {/* Active demand counter */}
                  <div className="absolute top-3 right-4 flex items-center gap-1.5 opacity-80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-mono tracking-wider text-emerald-300/80 font-bold">
                      {numDemands} {numDemands === 1 ? 'ativa' : 'ativas'}
                    </span>
                  </div>

                  {/* Company name */}
                  <h4 className="font-extrabold text-lg md:text-xl tracking-wide uppercase text-white font-sans">
                    {brand.name}
                  </h4>

                  {!myScope && (
                    <div className="absolute bottom-3 left-4 text-[9px] text-emerald-400/60 font-mono uppercase tracking-widest flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400/60" /> Bloqueado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==========================================
           FOCUSED CLIENT DASHBOARD
           ========================================== */
        (() => {
          const selectedBrand = brands.find(b => b.id === selectedClientBrandId)!;
          const brandDemands = cards.filter(c => c.brandId === selectedClientBrandId);

          return (
            <div className="space-y-6 animate-in fade-in" id="focused-client-dashboard">
              {/* Header with back button and quick links */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 dark:bg-zinc-900 p-4 rounded-2xl border border-slate-150 dark:border-zinc-800 gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedClientBrandId(null)}
                    className="bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 p-2 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm transition flex items-center gap-1.5 text-xs font-bold"
                  >
                    ← Voltar para Início
                  </button>
                  <div className="h-8 w-0.5 bg-slate-200 dark:bg-zinc-700 hidden sm:block"></div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 flex items-center gap-2 font-mono">
                      🏢 {selectedBrand.name} <span className="text-xs text-slate-400 dark:text-zinc-500 font-sans font-normal">({selectedBrand.tagline})</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Visualização exclusiva de conformidade e demandas.</p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setStoryBrandId(selectedBrand.id);
                      setActiveTab('templates');
                    }}
                    className="flex-1 sm:flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 rounded-xl text-xs font-bold border border-indigo-100 transition text-center"
                  >
                    Stories 9:16
                  </button>
                  <button
                    onClick={() => {
                      setGeneratorBrandId(selectedBrand.id);
                      setActiveTab('generator');
                    }}
                    className="flex-1 sm:flex-none bg-purple-50 hover:bg-purple-100 text-purple-700 px-3.5 py-2 rounded-xl text-xs font-bold border border-purple-100 transition text-center"
                  >
                    Capa Reels
                  </button>
                </div>
              </div>

              {/* Quick demand creation form */}
              <div className="bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-150 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
                <h4 className="text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400 font-mono tracking-wide">Abrir Nova Demanda para {selectedBrand.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mb-1">Título do Post ou Card</label>
                    <input
                      type="text"
                      id="client-new-card-title"
                      placeholder="Ex: Mudança tributária explicada simples"
                      className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-2 text-xs rounded-xl text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 mb-1">Briefing de Redação ou Objetivos</label>
                    <input
                      type="text"
                      id="client-new-card-theme"
                      placeholder="Abordar a ementa jurídica estrita corporativa..."
                      className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-2 text-xs rounded-xl text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const tInput = document.getElementById('client-new-card-title') as HTMLInputElement;
                      const thInput = document.getElementById('client-new-card-theme') as HTMLInputElement;
                      if (!tInput?.value) {
                        alert('Por favor, defina um título para registrar a demanda criativa.');
                        return;
                      }
                      const newId = `card-${Date.now()}`;
                      const newC: DemandCard = {
                        id: newId,
                        brandId: selectedBrand.id,
                        title: tInput.value,
                        theme: thInput ? thInput.value : '',
                        copyText: '',
                        artUrl: '',
                        stage: 'redacao',
                        approvalStatus: 'pendente',
                        createdBy: currentUser.name,
                        assignedTo: ['Thiago Silva (Designer)'],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      setCards(prev => [newC, ...prev]);
                      registerLog(newId, `Criou nova demanda focalizada em ${selectedBrand.name}.`);

                      // Notify designer (usr-3 = Thiago Silva)
                      const notifId = `notif-${Date.now()}`;
                      setNotifications(prev => [
                        {
                          id: notifId,
                          userId: 'usr-3',
                          senderName: currentUser.name,
                          avatarText: '👑',
                          message: `criou uma demanda rápida focada para ${selectedBrand.name}`,
                          targetCardTitle: tInput.value,
                          timeAgo: 'Agora mesmo',
                          type: 'demand',
                          read: false,
                        },
                        ...prev,
                      ]);

                      tInput.value = '';
                      if (thInput) thInput.value = '';
                      alert('Demanda agendada com sucesso! Você pode visualizá-la na coluna de Redação no Painel Kanban do topo.');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                    Adicionar no Kanban do Cliente
                  </button>
                </div>
              </div>

              {/* Brand demands list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-zinc-400 font-mono">Demandas Ativas ({brandDemands.length})</h4>
                {brandDemands.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                    Nenhuma demanda em andamento para esta empresa. Registre sua primeira demanda utilizando o painel acima!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {brandDemands.map(card => (
                      <div
                        key={card.id}
                        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-2xl p-4 cursor-pointer hover:shadow-md transition flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 font-bold uppercase rounded font-mono">
                              {card.stage === 'redacao' ? '✍️ Redação' :
                               card.stage === 'design' ? '🎨 Produção' :
                               card.stage === 'aprovacao' ? '⏳ Avaliação' : '✅ Finalizado'}
                            </span>
                            {card.approvalStatus === 'aprovado' ? (
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-1.5 py-0.5 rounded">✓ Aprovado</span>
                            ) : card.approvalStatus === 'revisar' ? (
                              <span className="text-[9px] bg-amber-50 text-amber-700 font-bold border border-amber-100 px-1.5 py-0.5 rounded animate-pulse">Ajustes</span>
                            ) : (
                              <span className="text-[9px] bg-slate-50 text-slate-400 dark:text-zinc-500 px-1.5 py-0.5 rounded border">Pendente</span>
                            )}
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-slate-800 dark:text-zinc-100 leading-snug">{card.title}</h5>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">{card.theme}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-zinc-800 text-[10px] text-slate-400 dark:text-zinc-500">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveDemand({ id: card.id, stage: 'concluido' });
                              }}
                              className="w-4 h-4 rounded border border-slate-300 dark:border-zinc-600 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500 transition"
                            >
                              <span className="opacity-0 hover:opacity-100 text-emerald-600 font-bold">✓</span>
                            </button>
                            <span>Responsável: <strong className="font-semibold text-slate-600 dark:text-zinc-300">{Array.isArray(card.assignedTo) ? card.assignedTo.join(', ') : card.assignedTo}</strong></span>
                          </div>
                          <span className="text-indigo-600 font-bold font-mono">Ver e regular →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};
