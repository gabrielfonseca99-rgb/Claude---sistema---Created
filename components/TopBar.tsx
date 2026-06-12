import React from 'react';
import { Search, Mail, Bell, Sun, Moon, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const TopBar: React.FC = () => {
  const { isDarkMode, setIsDarkMode, currentUser } = useApp();

  return (
    <>
      <header className={`hidden md:flex items-center justify-between px-8 py-4 border-b static md:sticky md:top-0 z-20 ${isDarkMode ? 'bg-[#0c0e14] border-zinc-800 text-zinc-100' : 'bg-white border-b border-slate-200/50 text-slate-850'}`} id="primary-header">
        <div className="w-96 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar demandas, diretrizes ou logs de auditoria..."
            className={`w-full pl-10 pr-4 py-2 rounded-full text-xs transition ${isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-1 focus:ring-indigo-500' : 'bg-slate-50 border border-slate-100 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white'}`}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-yellow-400 hover:text-yellow-300 hover:bg-zinc-900' : 'text-slate-450 hover:text-indigo-600 hover:bg-slate-100'}`}
            title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro / Dark"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button className={`p-2 rounded-full relative ${isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} title="Mensagens de Suporte">
            <Mail className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600"></span>
          </button>
          <button className={`p-2 rounded-full relative ${isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} title="Central de Notificações de Compliance">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
          </button>

          <div className={`h-6 w-px ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-200'}`}></div>

          <div className={`flex items-center gap-3 rounded-full pl-3 pr-4 py-1.5 relative overflow-hidden ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-slate-50 border border-slate-100'}`}>
            <span className={`w-2 h-2 rounded-full ${currentUser.avatarColor}`} />
            <div className="text-[11px] leading-tight flex flex-col items-start text-left">
              <p className={`font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>{currentUser.name.split(' ')[0]} <span className="text-[9px] text-indigo-600 font-mono uppercase bg-indigo-50 px-1 rounded">({currentUser.role})</span></p>
              <p className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} font-mono font-medium`}>{currentUser.email}</p>
            </div>
          </div>
        </div>
      </header>

      {currentUser.role === 'cliente' && (
        <div className="bg-amber-50 border-b border-amber-100 text-amber-800 text-xs py-2.5 px-8 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="font-medium text-[11.5px] text-left">Filtro de Multi-tenancy Ativo: Como <strong className="font-bold">{currentUser.name}</strong>, você vê exclusivamente a marca <strong className="uppercase font-mono bg-amber-100 text-amber-900 border border-amber-200/60 px-1.5 py-0.5 rounded">{currentUser.brandScope} (Tavares e Schalch)</strong>.</span>
        </div>
      )}
    </>
  );
};
