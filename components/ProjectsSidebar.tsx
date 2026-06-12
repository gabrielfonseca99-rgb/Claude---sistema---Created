import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ChevronRight, ChevronDown, Edit3, Trash2, Star, PlusSquare, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { USERS } from '../data/seedData';
import { ProjectItem } from '../types';

export const ProjectsSidebar: React.FC = () => {
  const {
    isDarkMode, activeTab,
    projects, setProjects,
    activeProjectId, setActiveProjectId,
    brands,
    isMainMenuCollapsed,
    isSidebarLocked, setIsSidebarLocked
  } = useApp();

  const [projectSearch, setProjectSearch] = useState('');
  const [panelWidth, setPanelWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
  const [showFavorites, setShowFavorites] = useState(true);

  // New project form
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<'folder' | 'project'>('project');
  const [newProjectParentId, setNewProjectParentId] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectLeader, setNewProjectLeader] = useState(USERS[0].name);
  const [newProjectBrandScoped, setNewProjectBrandScoped] = useState('all');

  // Resize logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const offset = isMainMenuCollapsed ? 80 : 320;
      const newWidth = e.clientX - offset;
      if (newWidth > 180 && newWidth < 500) setPanelWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isMainMenuCollapsed]);

  // Close context menu on any click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      // Small delay to allow menu button clicks to register first
      setTimeout(() => setContextMenu(null), 0);
    };
    // Use mousedown so it fires before the context menu button's onClick
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [contextMenu]);

  // Only show on painel tab
  if (activeTab !== 'painel') return null;

  const favorites = projects.filter(p => p.isFavorite);

  const toggleFavorite = (id: string) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const renameProject = (id: string) => {
    const current = projects.find(p => p.id === id);
    const newName = prompt("Novo nome:", current?.name || '');
    if (newName && newName.trim()) {
      setProjects(prev => prev.map(p =>
        p.id === id ? { ...p, name: newName.trim() } : p
      ));
    }
  };

  const deleteProject = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir? Subpastas também serão removidas.")) return;
    const getIds = (targetId: string): string[] => {
      const children = projects.filter(p => p.parentId === targetId);
      let ids = [targetId];
      for (const c of children) ids = [...ids, ...getIds(c.id)];
      return ids;
    };
    const idsToDelete = getIds(id);
    setProjects(prev => prev.filter(p => !idsToDelete.includes(p.id)));
    if (activeProjectId === id) setActiveProjectId('all');
  };

  const renderProjectItem = (item: ProjectItem, depth = 0): React.ReactNode => {
    const matchesSearch = item.name.toLowerCase().includes(projectSearch.toLowerCase());
    const isSelected = activeProjectId === item.id;
    const isExpanded = item.isExpanded;

    if (projectSearch.trim() !== '') {
      const hasMatchingChild = projects.some(p => p.parentId === item.id && p.name.toLowerCase().includes(projectSearch.toLowerCase()));
      if (!matchesSearch && !hasMatchingChild) return null;
    }

    return (
      <div key={item.id} className="flex flex-col select-none">
        <div
          className={`group flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition ${
            isSelected
              ? 'bg-indigo-600/15 text-indigo-600 dark:text-white border border-indigo-150 dark:border-indigo-500/20 shadow-sm font-bold'
              : isDarkMode
                ? 'hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                : 'hover:bg-slate-100/70 text-slate-500 hover:text-slate-800'
          }`}
          style={{ paddingLeft: `${depth * 10 + 8}px`, backgroundColor: item.color ? `${item.color}20` : undefined }}
          onClick={(e) => {
            e.stopPropagation();
            if (item.type === 'folder') {
              setProjects(prev => prev.map(p => p.id === item.id ? { ...p, isExpanded: !p.isExpanded } : p));
            } else {
              setActiveProjectId(item.id);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({ x: e.clientX, y: e.clientY, itemId: item.id });
          }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {item.type === 'folder' ? (
              <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 shrink-0 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`} />
            ) : (
              <span className="text-[10px] text-zinc-400 shrink-0 ml-1">↳</span>
            )}
            <span className="text-xs shrink-0">{item.type === 'folder' ? '📁' : '📄'}</span>
            <span className="text-xs font-semibold truncate">
              {item.name}
            </span>
            {item.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
          </div>

          {/* Hover actions */}
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
              className={`p-0.5 rounded ${item.isFavorite ? 'text-amber-500' : 'text-zinc-500 hover:text-amber-400'}`}
              title={item.isFavorite ? 'Remover favorito' : 'Favoritar'}
            >
              <Star className={`w-3 h-3 ${item.isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); renameProject(item.id); }}
              className="p-0.5 rounded text-zinc-500 hover:text-zinc-300"
              title="Renomear"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteProject(item.id); }}
              className="p-0.5 rounded text-zinc-500 hover:text-red-400"
              title="Excluir"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {item.type === 'folder' && isExpanded && (
          <div className={`flex flex-col border-l ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'} ml-3 pl-1 my-0.5`}>
            {projects.filter(p => p.parentId === item.id).map(child => renderProjectItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newElem: ProjectItem = {
      id: `p-${Date.now()}`,
      name: newProjectName,
      type: newProjectType,
      parentId: newProjectParentId || undefined,
      isExpanded: true,
      description: newProjectDescription,
      leader: newProjectLeader,
      brandId: newProjectBrandScoped === 'all' ? undefined : newProjectBrandScoped
    };
    setProjects(prev => [...prev, newElem]);
    if (newProjectType === 'project') setActiveProjectId(newElem.id);
    setNewProjectName('');
    setNewProjectDescription('');
    setShowCreateModal(false);
  };

  if (isPanelCollapsed) {
    return (
      <div className={`w-10 shrink-0 border-r flex flex-col items-center pt-4 ${isDarkMode ? 'border-zinc-800 bg-[#0c0e14]' : 'border-slate-100 bg-white'}`}>
        <button onClick={() => setIsPanelCollapsed(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`hidden md:flex shrink-0 border-r flex-col h-screen sticky top-0 overflow-y-auto relative ${isDarkMode ? 'border-zinc-800 bg-[#0c0e14] text-zinc-200' : 'border-slate-100 bg-white text-slate-800'}`}
        style={{ width: panelWidth }}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'} font-mono`}>Projetos</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCreateModal(true)}
                className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-400'}`}
                title="Novo Projeto"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPanelCollapsed(true)}
                className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-400'}`}
                title="Recolher painel"
              >
                <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'}`}
            />
          </div>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className={`px-3 pt-3 pb-1 border-b ${isDarkMode ? 'border-zinc-800/50' : 'border-slate-100/50'}`}>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center gap-1.5 mb-2 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-500/70' : 'text-amber-600/70'}`}
            >
              <Star className="w-3 h-3 fill-current" />
              Favoritos ({favorites.length})
              {showFavorites ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
            {showFavorites && (
              <div className="space-y-0.5 mb-2">
                {favorites.map(fav => (
                  <div
                    key={`fav-${fav.id}`}
                    className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition text-xs ${
                      activeProjectId === fav.id
                        ? 'bg-indigo-600/15 text-indigo-600 dark:text-white font-bold'
                        : isDarkMode ? 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200' : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-800'
                    }`}
                    onClick={() => {
                      if (fav.type === 'folder') {
                        setProjects(prev => prev.map(p => p.id === fav.id ? { ...p, isExpanded: !p.isExpanded } : p));
                      } else {
                        setActiveProjectId(fav.id);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setContextMenu({ x: e.clientX, y: e.clientY, itemId: fav.id });
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span>{fav.type === 'folder' ? '📁' : '📄'}</span>
                      <span className="font-semibold truncate">{fav.name}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(fav.id); }}
                      className="text-amber-500 hover:text-amber-400 p-0.5 shrink-0"
                      title="Remover dos favoritos"
                    >
                      <Star className="w-3 h-3 fill-amber-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* "All" filter */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setActiveProjectId('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition ${
              activeProjectId === 'all'
                ? 'bg-indigo-600/15 text-indigo-600 dark:text-white'
                : isDarkMode ? 'text-zinc-400 hover:bg-zinc-900' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            📋 Todos os Projetos
          </button>
        </div>

        {/* Tree */}
        <div className="px-3 py-2 flex-1 space-y-0.5 overflow-y-auto">
          {projects.filter(p => !p.parentId).map(item => renderProjectItem(item))}
        </div>

        {/* Resize Handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500/30 transition"
          onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-xl rounded-xl py-1.5 z-[9999] w-52 text-sm"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300"
            onMouseDown={(e) => {
              e.stopPropagation();
              const item = projects.find(p => p.id === contextMenu.itemId);
              toggleFavorite(contextMenu.itemId);
              setContextMenu(null);
            }}
          >
            <Star className={`w-3.5 h-3.5 ${projects.find(p => p.id === contextMenu.itemId)?.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`} />
            {projects.find(p => p.id === contextMenu.itemId)?.isFavorite ? 'Remover Favorito' : 'Favoritar'}
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300"
            onMouseDown={(e) => {
              e.stopPropagation();
              renameProject(contextMenu.itemId);
              setContextMenu(null);
            }}
          >
            <Edit3 className="w-3.5 h-3.5" /> Renomear
          </button>
          <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />
          <button
            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 text-xs text-red-500"
            onMouseDown={(e) => {
              e.stopPropagation();
              deleteProject(contextMenu.itemId);
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Excluir
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden`}>
            <div className={`flex items-center justify-between border-b p-5 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-500">
                  <PlusSquare className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className={`font-bold text-base font-mono ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Nova Pasta / Projeto</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Configure as informações básicas.</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className={`p-2 rounded-xl ${isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`overflow-y-auto p-6 space-y-4 flex-1 ${isDarkMode ? 'bg-slate-950/40' : 'bg-slate-50/50'}`}>
              <div>
                <label className={`block text-[11px] uppercase font-bold mb-2 tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['folder', 'project'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setNewProjectType(t)}
                      className={`py-3 px-4 rounded-xl text-left border flex items-center gap-2.5 transition-all ${
                        newProjectType === t
                          ? isDarkMode ? 'bg-slate-800 border-indigo-500 text-white shadow-md' : 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-md'
                          : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>
                      <span className="text-xl">{t === 'folder' ? '📁' : '📄'}</span>
                      <span className="text-xs font-bold">{t === 'folder' ? 'Pasta' : 'Projeto / Quadro'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[11px] uppercase font-bold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Nome</label>
                <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Ex: Tráfego Pago / Lançamentos Q3"
                  className={`w-full px-4 py-2.5 text-xs rounded-xl outline-none border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-400'}`} />
              </div>

              <div>
                <label className={`block text-[11px] uppercase font-bold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Descrição</label>
                <textarea value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} rows={3} placeholder="Objetivos do projeto"
                  className={`w-full px-4 py-3 text-xs rounded-xl outline-none border leading-relaxed ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-400'}`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[11px] uppercase font-bold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pasta Pai</label>
                  <select value={newProjectParentId} onChange={(e) => setNewProjectParentId(e.target.value)}
                    className={`w-full text-xs px-3 py-2.5 rounded-xl outline-none border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <option value="">Nenhum (Raiz)</option>
                    {projects.filter(p => p.type === 'folder').map(f => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-[11px] uppercase font-bold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Líder</label>
                  <select value={newProjectLeader} onChange={(e) => setNewProjectLeader(e.target.value)}
                    className={`w-full text-xs px-3 py-2.5 rounded-xl outline-none border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                    {USERS.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-[11px] uppercase font-bold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Empresa</label>
                <select value={newProjectBrandScoped} onChange={(e) => setNewProjectBrandScoped(e.target.value)}
                  className={`w-full text-xs px-3 py-2.5 rounded-xl outline-none border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                  <option value="all">Todas (Transversal)</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className={`flex justify-end gap-3 border-t p-5 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <button onClick={() => setShowCreateModal(false)} className={`px-4 py-2 text-xs rounded-xl border ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'}`}>Cancelar</button>
              <button onClick={handleCreateProject} className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg border border-indigo-500">Criar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
