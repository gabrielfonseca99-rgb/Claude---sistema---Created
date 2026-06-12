import React from 'react';
import { useApp } from '../../contexts/AppContext';

export const LogsPanel: React.FC = () => {
  const { logs, isDarkMode } = useApp();

  const handleClearLogs = () => {
    localStorage.removeItem('creaflow_logs');
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>Logs de Auditoria</h2>
          <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'} mt-1`}>
            Historico completo de operacoes realizadas no sistema.
          </p>
        </div>
        <button
          onClick={handleClearLogs}
          className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 text-xs font-medium rounded-lg transition"
        >
          Limpar Historico
        </button>
      </div>

      <div className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} border rounded-xl overflow-hidden`}>
        {/* Table Header */}
        <div className={`grid grid-cols-12 gap-4 px-5 py-3 border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-950/50' : 'border-slate-100 bg-slate-50'}`}>
          <div className="col-span-3">
            <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'} uppercase tracking-wider`}>Timestamp</span>
          </div>
          <div className="col-span-2">
            <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'} uppercase tracking-wider`}>Operador</span>
          </div>
          <div className="col-span-7">
            <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'} uppercase tracking-wider`}>Acao</span>
          </div>
        </div>

        {/* Table Body */}
        {logs.length === 0 ? (
          <div className={`px-5 py-10 text-center ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'} text-sm`}>
            Nenhum log registrado.
          </div>
        ) : (
          <div className={`divide-y ${isDarkMode ? 'divide-zinc-800/50' : 'divide-slate-100'} max-h-[65vh] overflow-y-auto`}>
            {logs.map(log => (
              <div key={log.id} className={`grid grid-cols-12 gap-4 px-5 py-3 ${isDarkMode ? 'hover:bg-zinc-800/30' : 'hover:bg-slate-50'} transition`}>
                <div className="col-span-3">
                  <span className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'} font-mono`}>{log.timestamp}</span>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{log.userName}</span>
                </div>
                <div className="col-span-7">
                  <span className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {log.action}
                    {log.cardId && (
                      <span className={`${isDarkMode ? 'text-zinc-600' : 'text-slate-300'} ml-1`}>({log.cardId})</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
