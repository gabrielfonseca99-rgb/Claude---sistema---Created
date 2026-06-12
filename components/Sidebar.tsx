import React from 'react';
import {
  Layers, CheckSquare, Palette, Image as ImageIcon, FileText,
  History, Home, Sparkles, ChevronRight, ChevronLeft, Menu, X,
  BarChart3, Calendar, Zap
} from 'lucide-react';
import { useApp, TabId } from '../contexts/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeTab, setActiveTab,
    isDarkMode,
    isMainMenuCollapsed, setIsMainMenuCollapsed,
    isMobileMenuOpen, setIsMobileMenuOpen,
    setSelectedClientBrandId
  } = useApp();

  const navItems: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Início', icon: <Home className="w-4 h-4 shrink-0" /> },
    { id: 'painel', label: 'Painel', icon: <CheckSquare className="w-4 h-4 shrink-0" /> },
    { id: 'templates', label: 'Template Creative', icon: <Sparkles className="w-4 h-4 shrink-0" />, badge: 'Stories' },
    { id: 'brands', label: 'Diretrizes de Marca', icon: <Palette className="w-4 h-4 shrink-0" /> },
    { id: 'generator', label: 'Gerador de Capas', icon: <ImageIcon className="w-4 h-4 shrink-0" />, badge: 'Reels' },
    { id: 'analytics', label: 'Dashboard Analytics', icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
    { id: 'calendar', label: 'Calendário Editorial', icon: <Calendar className="w-4 h-4 shrink-0" /> },
    { id: 'automations', label: 'Automações', icon: <Zap className="w-4 h-4 shrink-0" /> },
    { id: 'integrations', label: 'Integrações', icon: <FileText className="w-4 h-4 shrink-0" /> },
    { id: 'logs', label: 'Logs e Auditoria', icon: <History className="w-4 h-4 shrink-0" /> },
  ];

  const handleTabClick = (id: TabId) => {
    setActiveTab(id);
    if (id === 'home') setSelectedClientBrandId(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <header className={`md:hidden flex items-center justify-between border-b px-5 py-3.5 sticky top-0 z-40 backdrop-blur-md ${isDarkMode ? 'bg-[#0c0e14]/90 border-zinc-800 text-zinc-100' : 'bg-white/90 border-slate-200/80 text-slate-800'}`}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className={`text-base font-bold tracking-tight font-mono ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>GCR Creative</h1>
            <p className="text-[9px] text-slate-500 font-medium font-mono">Auto-Branding Hub</p>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-slate-900 p-1 rounded-lg" aria-label="Toggle Menu">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        ${isMainMenuCollapsed ? 'md:w-20 md:min-w-[80px]' : 'md:w-80 md:min-w-[320px]'}
        shrink-0 border-r md:h-screen md:sticky md:top-0
        flex flex-col justify-between overflow-x-hidden overflow-y-auto shadow-sm md:shadow-none
        ${isDarkMode ? 'border-zinc-800 bg-[#0c0e14] text-zinc-200' : 'border-[#e2e8f0]/60 bg-white text-slate-800'}
      `}>
        <div>
          {/* Logo */}
          <div className={`p-6 border-b hidden md:block ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                {!isMainMenuCollapsed && (
                  <div className="transition-all duration-350 opacity-100 max-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <h1 className={`text-base font-bold tracking-tight font-mono whitespace-nowrap ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>GCR Creative</h1>
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100 px-1.5 py-0.2 rounded-full font-mono uppercase">HQ</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Auto-Branding Hub</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="px-4 py-6 space-y-1">
            {!isMainMenuCollapsed && (
              <span className="text-[10px] font-bold text-slate-400 uppercase px-3 tracking-wider block mb-2 font-mono transition-all duration-300">Overview</span>
            )}

            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                    : isDarkMode
                      ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {!isMainMenuCollapsed && (
                  item.badge ? (
                    <div className="flex items-center justify-between w-full transition-all duration-300">
                      <span className="whitespace-nowrap">{item.label}</span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold border border-indigo-100 px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-sm">{item.badge}</span>
                    </div>
                  ) : (
                    <span className="transition-all duration-300 whitespace-nowrap">{item.label}</span>
                  )
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-zinc-800 bg-zinc-950/20' : 'border-slate-100 bg-slate-50/50'} flex flex-col items-center gap-3`}>
          {!isMainMenuCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5 p-1">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono uppercase font-bold">Workspace Segura</p>
                  <p className="text-[9px] text-slate-400 dark:text-zinc-500 leading-none">Criptografia Ativa</p>
                </div>
              </div>
              <button onClick={() => setIsMainMenuCollapsed(true)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-indigo-600 transition shrink-0" title="Recolher menu">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <button onClick={() => setIsMainMenuCollapsed(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-indigo-600 transition shrink-0" title="Expandir menu">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  );
};
