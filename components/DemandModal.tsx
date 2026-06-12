import React, { useState, useEffect } from 'react';
import {
  X, PlusSquare, FileText, Sparkles, Loader2, Calendar, ChevronRight, Lock, Trash2, Send, MessageSquare, ExternalLink, Image as ImageIcon,
  Play, Pause, Clock, History, Eye
} from 'lucide-react';
import { DemandCard, Brand, UserProfile, KanbanColumn, ProjectItem } from '../types';
import { isFigmaConnected, parseFigmaUrl, getNodeThumbnail, getFileInfo, FigmaFile } from '../services/figmaApi';

interface DemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  kanbanColumns: KanbanColumn[];
  editingCard: DemandCard | null;
  onSaveDemand: (cardData: Partial<DemandCard>) => void;
  currentUser: UserProfile;
  comments: { id: string; cardId: string; author: string; text: string; timestamp: string }[];
  onAddComment: (cardId: string, text: string) => void;
  projects?: ProjectItem[];
  isDarkMode?: boolean;
}

const USERS_LIST: UserProfile[] = [
  { id: 'usr-1', name: 'Gabriel Fonseca (Admin)', email: 'gabrielfonseca99@gmail.com', role: 'admin', avatarColor: 'bg-indigo-600', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr-2', name: 'Ana Clara (Social Media)', email: 'anaclara@grupo.com', role: 'criativo', avatarColor: 'bg-rose-500', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr-3', name: 'Thiago Silva (Designer)', email: 'thiago.designer@grupo.com', role: 'criativo', avatarColor: 'bg-emerald-500', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { id: 'usr-4', name: 'Dr. Tavares (Cliente/Gestor)', email: 'tavares@tavares.adv.br', role: 'cliente', brandScope: 'tavares', avatarColor: 'bg-amber-600', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' }
];

const PRIORITIES = [
  { name: 'Baixa', color: '#10b981' },
  { name: 'Média', color: '#3b82f6' },
  { name: 'Alta', color: '#f97316' },
  { name: 'Urgente', color: '#ef4444' }
];

export const DemandModal: React.FC<DemandModalProps> = ({
  isOpen,
  onClose,
  brands,
  kanbanColumns,
  editingCard,
  onSaveDemand,
  currentUser,
  comments,
  onAddComment,
  projects,
  isDarkMode = true
}) => {
  // Core demand attributes
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [theme, setTheme] = useState('');
  
  const [brandId, setBrandId] = useState('gcr');
  const [stage, setStage] = useState('a_fazer');
  const [assignedTo, setAssignedTo] = useState<string[]>(['Thiago Silva (Designer)']);
  const [priorityName, setPriorityName] = useState('Média');
  const [priorityColor, setPriorityColor] = useState('#3b82f6');
  const [dueDate, setDueDate] = useState('');
  
  // Single document link or text field (replaces briefing section)
  const [docLinkOrText, setDocLinkOrText] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaThumb, setFigmaThumb] = useState<string | null>(null);
  const [figmaFileInfo, setFigmaFileInfo] = useState<FigmaFile | null>(null);
  const [figmaLoading, setFigmaLoading] = useState(false);

  // Dialog status states
  const [activePopover, setActivePopover] = useState<'brand' | 'assignee' | 'status' | 'priority' | null>(null);
  
  // Comments input state
  const [newCommentText, setNewCommentText] = useState('');

  // Simulation loading state
  const [isSimulatingDocs, setIsSimulatingDocs] = useState(false);

  // Synchronize state when the editingCard changes or modal is opened
  useEffect(() => {
    if (editingCard) {
      setTitle(editingCard.title || '');
      setTheme(editingCard.theme || '');
      setBrandId(editingCard.brandId || 'gcr');
      setStage(editingCard.stage || 'a_fazer');
      setAssignedTo(Array.isArray(editingCard.assignedTo) ? editingCard.assignedTo : (editingCard.assignedTo ? [editingCard.assignedTo] : ['Thiago Silva (Designer)']));
      setPriorityName(editingCard.priorityName || 'Média');
      setPriorityColor(editingCard.priorityColor || '#3b82f6');
      setDueDate(editingCard.dueDate || '');
      setDocLinkOrText(editingCard.description || editingCard.docsUrl || '');
      setFigmaUrl(editingCard.figmaUrl || '');
    } else {
      // Clear fields for CREATE mode
      setTitle('Pauta Sem Título');
      setTheme('');
      setBrandId(brands[0]?.id || 'gcr');
      setStage(kanbanColumns[0]?.id || 'a_fazer');
      setAssignedTo(['Thiago Silva (Designer)']);
      setPriorityName('Média');
      setPriorityColor('#3b82f6');
      setDueDate('');
      setDocLinkOrText('');
      setFigmaUrl('');
    }
    setIsEditingTitle(false);
  }, [editingCard, isOpen, brands, kanbanColumns]);

  if (!isOpen) return null;

  // Helpers to parse figma url and extract ID and Node ID
  const getFigmaEmbedUrl = (urlStr: string) => {
    if (!urlStr) return '';
    
    // Check if it's an iframe tag and extract src
    if (urlStr.trim().startsWith('<iframe')) {
       const srcMatch = urlStr.match(/src="([^"]+)"/);
       return srcMatch ? srcMatch[1] : urlStr;
    }

    try {
      // If it's already an embed link, return as is (or enhance)
      if (urlStr.includes('embed.figma.com')) return urlStr;
      
      // Otherwise, convert standard figma link to embed
      // Regex to extract file ID and optional node ID
      const fileMatch = urlStr.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
      if (!fileMatch) return '';
      const fileId = fileMatch[1];
      
      const url = new URL(urlStr.includes('http') ? urlStr : `https://${urlStr}`);
      const nodeId = url.searchParams.get('node-id');
      
      let embedUrl = `https://embed.figma.com/design/${fileId}?embed-host=share`;
      if (nodeId) {
        embedUrl += `&node-id=${nodeId}`;
      }
      return embedUrl;
    } catch {
      return urlStr; // Fallback
    }
  };

  const figmaEmbedSrc = getFigmaEmbedUrl(figmaUrl);

  // Auto-fetch Figma thumbnail when URL changes and token is available
  useEffect(() => {
    if (!figmaUrl || !isFigmaConnected()) {
      setFigmaThumb(null);
      setFigmaFileInfo(null);
      return;
    }
    const parsed = parseFigmaUrl(figmaUrl);
    if (!parsed) return;

    let cancelled = false;
    setFigmaLoading(true);

    (async () => {
      try {
        const info = await getFileInfo(parsed.fileKey);
        if (cancelled) return;
        setFigmaFileInfo(info);

        if (parsed.nodeId) {
          const thumb = await getNodeThumbnail(parsed.fileKey, parsed.nodeId);
          if (!cancelled) setFigmaThumb(thumb);
        } else if (info.thumbnailUrl) {
          if (!cancelled) setFigmaThumb(info.thumbnailUrl);
        }
      } catch {
        // Silently fail — embed iframe still works as fallback
      } finally {
        if (!cancelled) setFigmaLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [figmaUrl]);

  const getPath = (projectId?: string, projects: ProjectItem[] = []): string => {
    if (!projectId) return 'Dashboard';
    
    const findItem = (id: string) => projects.find(p => p.id === id);
    
    const path: string[] = [];
    let currentId: string | undefined = projectId;
    
    while (currentId) {
      const item = findItem(currentId);
      if (!item) break;
      path.unshift(item.name);
      currentId = item.parentId;
    }
    
    return path.join(' - ');
  };


  const isUrl = (str: string) => {
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('www.');
  };

  const handleSimulateUrlText = () => {
    if (!docLinkOrText.trim()) return;
    if (isUrl(docLinkOrText)) {
      setIsSimulatingDocs(true);
      setTimeout(() => {
        setIsSimulatingDocs(false);
        setDocLinkOrText(prev => `${prev}\n\n[Texto automático extraído do Google Docs]: Campanha de posicionamento de governança corporativa, destacando transparência financeira, integridade de compliance e proteção estatutária de acionistas para holding.`);
      }, 1200);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Por favor, informe um título válido para a demanda.');
      return;
    }

    onSaveDemand({
      id: editingCard?.id,
      title,
      theme,
      brandId,
      stage,
      assignedTo,
      priorityName,
      priorityColor,
      dueDate: dueDate || undefined,
      description: docLinkOrText,
      figmaUrl: figmaUrl || undefined,
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !editingCard) return;
    onAddComment(editingCard.id, newCommentText);
    setNewCommentText('');
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto text-left animate-in fade-in duration-200 ${isDarkMode ? 'bg-slate-950/75' : 'bg-black/40'}`}>

      {/* Container */}
      <div
        className={`w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-4 relative animate-in zoom-in-95 duration-200 border ${
          isDarkMode ? 'bg-[#0f111a] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
        style={{ borderTop: `6px solid ${priorityColor}` }}
      >
        
        {/* Header section */}
        <div className={`flex flex-col border-b p-5 sticky top-0 z-20 ${isDarkMode ? 'border-zinc-800 bg-[#151926]/90' : 'border-slate-200 bg-slate-50/90'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                <PlusSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-indigo-400 font-mono tracking-wider uppercase mb-1">
                  {getPath(editingCard?.projectId, projects)}
                </div>
                <h3 className="font-extrabold text-sm uppercase tracking-widest text-[#a5b4fc]">
                  {editingCard ? 'Gerenciador e Edição de Demanda' : 'Criar Nova Demanda'}
                </h3>
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={onClose} 
              className="p-2 rounded-xl transition text-zinc-400 hover:text-white hover:bg-zinc-800"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TÍTULO INTELIGENTE (Double-click to transform to input, onBlur to save as text) */}
          <div className="mt-4">
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-1.5 text-indigo-400">
              Título da Tarefa / Demanda Acadêmica e Comercial
            </label>
            
            {isEditingTitle ? (
              <input 
                type="text" 
                autoFocus
                placeholder="Ex: Pauta de Campanhas GCR"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                className="w-full bg-[#090b12] border-2 border-indigo-500 text-lg font-bold outline-none px-3 py-1.5 rounded-xl text-white transition-colors"
              />
            ) : (
              <div 
                onDoubleClick={() => setIsEditingTitle(true)}
                title="Clique duplo para editar o título"
                className="group flex items-center justify-between gap-3 p-2.5 rounded-xl border border-zinc-850 bg-[#090b12] hover:bg-zinc-900 cursor-pointer min-h-[44px] transition duration-150"
              >
                <span className="text-lg font-extrabold tracking-tight text-white select-none">
                  {title || 'Pauta Sem Título (Clique duplo para preencher)'}
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono group-hover:text-indigo-400 whitespace-nowrap">
                  Double Click para Editar ✏️
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className={`overflow-y-auto p-6 space-y-6 flex-1 ${isDarkMode ? 'bg-[#090b12]' : 'bg-white'}`}>
          
          {/* INLINE SPECIFIC PARAMETERS BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 relative z-30" id="parameters-dashboard-panel">
            
            {/* 1. Empresa */}
            <div className="space-y-1 relative text-left">
              <label className="block text-[10.5px] uppercase font-bold text-purple-300 tracking-wider">Empresa</label>
              <button
                type="button"
                onClick={() => setActivePopover(activePopover === 'brand' ? null : 'brand')}
                className="w-full flex items-center justify-between gap-1.5 px-3 py-2 border border-zinc-800 rounded-xl text-xs bg-zinc-950 text-zinc-100 hover:border-indigo-500 transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: brands.find(b => b.id === brandId)?.primaryColor || '#6366f1' }} />
                  <span className="truncate font-semibold">{brands.find(b => b.id === brandId)?.name || 'Empresa'}</span>
                </div>
                <span className="text-zinc-500">▼</span>
              </button>

              {activePopover === 'brand' && (
                <div className="absolute top-full left-0 mt-1.5 z-40 w-56 border border-zinc-800 rounded-xl shadow-2xl p-1 bg-[#0f111a] text-zinc-105">
                  {brands.map(b => (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => {
                        setBrandId(b.id);
                        setActivePopover(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between hover:bg-zinc-900 text-zinc-200"
                    >
                      <span className="font-semibold">{b.name}</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.primaryColor }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Responsável */}
            <div className="space-y-1 relative text-left">
              <label className="block text-[10.5px] uppercase font-bold text-emerald-300 tracking-wider">Responsável</label>
              <button
                type="button"
                onClick={() => setActivePopover(activePopover === 'assignee' ? null : 'assignee')}
                className="w-full flex items-center justify-between gap-1.5 px-2.5 py-2 border border-zinc-800 rounded-xl text-xs bg-zinc-950 text-zinc-100 hover:border-indigo-500 transition"
              >
                <div className="flex -space-x-1.5 min-w-0">
                  {assignedTo.length > 0 ? (
                    assignedTo.map(name => {
                      const user = USERS_LIST.find(u => u.name === name);
                      if (!user) return null;
                      return (
                        <img 
                          key={user.id}
                          src={user.avatarUrl} 
                          alt={user.name} 
                          referrerPolicy="no-referrer"
                          className="w-5.5 h-5.5 rounded-full object-cover border border-zinc-850 shrink-0" 
                        />
                      );
                    })
                  ) : (
                    <span className="text-[10px] text-zinc-500">Sem</span>
                  )}
                </div>
                <span className="text-zinc-500">▼</span>
              </button>

              {activePopover === 'assignee' && (
                <div className="absolute top-full left-0 mt-1.5 z-40 w-64 border border-zinc-800 rounded-xl shadow-2xl p-1 bg-[#0f111a] text-zinc-105">
                  <div className="px-2.5 py-1 text-[9px] uppercase font-semibold tracking-wider text-zinc-500 border-b border-zinc-850">Integrantes</div>
                  {USERS_LIST.map(usr => (
                    <button
                      type="button"
                      key={usr.id}
                      onClick={() => {
                        setAssignedTo(prev => prev.includes(usr.name) ? prev.filter(n => n !== usr.name) : [...prev, usr.name]);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg transition flex items-center gap-2 text-xs mt-0.5 hover:bg-zinc-900 ${assignedTo.includes(usr.name) ? 'bg-indigo-900/50 text-indigo-200' : 'text-zinc-200'}`}
                    >
                      <img src={usr.avatarUrl} referrerPolicy="no-referrer" className="w-5.5 h-5.5 rounded-full object-cover shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold leading-tight">{usr.name.split(' (')[0]}</p>
                        <p className="text-[9px] text-zinc-500 leading-none mt-0.5 capitalize">{usr.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Status Fila Kanban */}
            <div className="space-y-1 relative text-left">
              <label className="block text-[10.5px] uppercase font-bold text-amber-300 tracking-wider">Status</label>
              <button
                type="button"
                onClick={() => setActivePopover(activePopover === 'status' ? null : 'status')}
                className="w-full flex items-center justify-between gap-1.5 px-3 py-2 border border-zinc-800 rounded-xl text-xs bg-zinc-950 text-zinc-100 hover:border-indigo-500 transition"
              >
                <span className="font-semibold truncate">
                  {kanbanColumns.find(c => c.id === stage)?.title || stage}
                </span>
                <span className="text-zinc-500">▼</span>
              </button>

              {activePopover === 'status' && (
                <div className="absolute top-full left-0 mt-1.5 z-40 w-56 border border-zinc-800 rounded-xl shadow-2xl p-1 bg-[#0f111a] text-zinc-105">
                  {kanbanColumns.map(col => (
                    <button
                      type="button"
                      key={col.id}
                      onClick={() => {
                        setStage(col.id);
                        setActivePopover(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between hover:bg-zinc-900 text-zinc-200"
                    >
                      <span className="font-semibold">{col.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Prazo Entrega */}
            <div className="space-y-1 relative text-left">
              <label className="block text-[10.5px] uppercase font-bold text-blue-300 tracking-wider">Prazo Entrega</label>
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-800 rounded-xl text-xs outline-none focus:border-indigo-500 transition bg-zinc-950 text-zinc-200"
              />
            </div>

            {/* 5. Prioridade */}
            <div className="space-y-1 relative text-left">
              <label className="block text-[10.5px] uppercase font-bold text-red-300 tracking-wider">Prioridade</label>
              <button
                type="button"
                onClick={() => setActivePopover(activePopover === 'priority' ? null : 'priority')}
                className="w-full flex items-center justify-between gap-1.5 px-3 py-2 border border-zinc-800 rounded-xl text-xs bg-zinc-950 text-zinc-100 hover:border-indigo-500 transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: priorityColor }} />
                  <span className="truncate font-semibold">{priorityName}</span>
                </div>
                <span className="text-zinc-500">▼</span>
              </button>

              {activePopover === 'priority' && (
                <div className="absolute top-full left-0 mt-1.5 z-40 w-48 border border-zinc-800 rounded-xl shadow-2xl p-1 bg-[#0f111a] text-zinc-105">
                  {PRIORITIES.map(p => (
                    <button
                      type="button"
                      key={p.name}
                      onClick={() => {
                        setPriorityName(p.name);
                        setPriorityColor(p.color);
                        setActivePopover(null);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg transition flex items-center justify-between hover:bg-zinc-900 text-zinc-200"
                    >
                      <span className="font-semibold">{p.name}</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* GRID: BRIEFING & INTEGRATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            
            {/* LEFT COLUMN: DESCRIPTION */}
            <div className="lg:col-span-12 space-y-6">
              <div className="bg-[#12141c] border border-zinc-800 p-5 rounded-xl space-y-4 shadow-md">

                
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h4 className="text-xs font-bold font-mono uppercase text-[#818cf8] tracking-widest flex items-center gap-1.5">
                    <span>✏️</span> Descrição da Demanda
                  </h4>
                </div>

                {/* Combined Field Area */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <textarea 
                      id="unified-document-input"
                      placeholder="adicione uma descrição..." 
                      value={docLinkOrText}
                      onChange={(e) => setDocLinkOrText(e.target.value)}
                      rows={6}
                      className="flex-1 w-full px-3 py-2.5 text-xs rounded-xl outline-none leading-relaxed border border-zinc-800 font-sans bg-zinc-950 text-zinc-100 focus:border-indigo-500 transition"
                    />

                    
                    {isUrl(docLinkOrText) && (
                      <button 
                        type="button"
                        onClick={handleSimulateUrlText}
                        disabled={isSimulatingDocs}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 rounded-xl text-xs flex flex-col items-center justify-center gap-1 transition whitespace-nowrap shrink-0 max-h-[46px]"
                        title="Simular Extração do Google Docs"
                      >
                        {isSimulatingDocs ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span className="text-[9px]">Extrair</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isUrl(docLinkOrText) && (
                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="text-[10px] text-zinc-400">Link de Apoio detectado:</span>
                      <a 
                        href={docLinkOrText} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] font-semibold text-indigo-400 hover:underline truncate"
                      >
                        {docLinkOrText}
                      </a>
                    </div>
                  )}
                </div>


              </div>
            </div>

            {/* SECOND: FIGMA CANVAS EMBED INTEGRATION */}
            <div className="lg:col-span-12 space-y-6">
              
              <div className="bg-[#12141c] border border-zinc-800 p-5 rounded-xl space-y-4 shadow-md">

                
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h4 className="text-xs font-bold font-mono uppercase text-[#38bdf8] tracking-widest flex items-center gap-1.5">
                    Design:
                  </h4>
                </div>

                <input 
                  type="text"
                  placeholder="<iframe src=..."
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className="w-full text-xs font-mono px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 outline-none focus:border-cyan-400 transition"
                />

                {/* Figma API Info Bar */}
                {figmaFileInfo && isFigmaConnected() && (
                  <div className="flex items-center gap-2 p-2.5 bg-purple-600/10 border border-purple-500/20 rounded-lg">
                    {figmaLoading && <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
                    <span className="text-[10px] font-bold text-purple-300 truncate">{figmaFileInfo.name}</span>
                    <span className="text-[9px] text-purple-400/60 font-mono ml-auto shrink-0">
                      {new Date(figmaFileInfo.lastModified).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                {/* Figma Embed / Thumbnail */}
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-slate-950 h-[300px] flex items-center justify-center relative shadow-inner">
                  {figmaThumb && isFigmaConnected() ? (
                    <img
                      src={figmaThumb}
                      alt="Figma frame thumbnail"
                      className="w-full h-full object-contain bg-[#1e1e1e]"
                    />
                  ) : figmaEmbedSrc ? (
                    <iframe
                      src={figmaEmbedSrc}
                      allowFullScreen
                      style={{ border: '1px solid rgba(0,0,0,0.1)' }}
                      className="w-full h-full border-none bg-[#1e1e1e]"
                      title="Figma Layout Live Mirror"
                    />
                  ) : (
                    <div className="text-center p-6 text-zinc-500">
                      <p className="text-xs font-mono text-cyan-400 mb-1.5 uppercase font-bold tracking-wider">Aguardando Vinculação do Figma</p>
                      <p className="text-[11px] max-w-[280px] mx-auto text-zinc-500 leading-relaxed font-sans">
                        Adicione um link válido do Figma acima (que inclua o id do design ou file) para carregar o visualizador ao vivo do projeto de branding.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
            
            {/* TIME TRACKING */}
            {editingCard && (
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-[#12141c] border border-zinc-800 p-5 rounded-xl space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <h4 className="text-xs font-bold font-mono uppercase text-[#34d399] tracking-widest flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" /> Time Tracking
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (editingCard.isTimerRunning) {
                          onSaveDemand({
                            id: editingCard.id,
                            isTimerRunning: false,
                            timerStartedAt: undefined,
                            timeEntries: [
                              ...(editingCard.timeEntries || []),
                              { stage: stage, startedAt: editingCard.timerStartedAt || new Date().toISOString(), endedAt: new Date().toISOString() }
                            ]
                          });
                        } else {
                          onSaveDemand({
                            id: editingCard.id,
                            isTimerRunning: true,
                            timerStartedAt: new Date().toISOString()
                          });
                        }
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition ${
                        editingCard.isTimerRunning
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {editingCard.isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {editingCard.isTimerRunning ? 'Pausar' : 'Iniciar Timer'}
                    </button>

                    {editingCard.isTimerRunning && editingCard.timerStartedAt && (
                      <span className="text-xs text-emerald-400 font-mono animate-pulse">
                        Em andamento desde {new Date(editingCard.timerStartedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {(editingCard.timeEntries || []).length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {(editingCard.timeEntries || []).map((entry, i) => {
                        const start = new Date(entry.startedAt);
                        const end = entry.endedAt ? new Date(entry.endedAt) : new Date();
                        const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
                        const hours = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        return (
                          <div key={i} className="flex items-center justify-between p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                            <span className="text-[10px] text-zinc-400">{entry.stage}</span>
                            <span className="text-[10px] font-mono text-zinc-300">{hours > 0 ? `${hours}h ` : ''}{mins}min</span>
                            <span className="text-[9px] text-zinc-600">{start.toLocaleDateString('pt-BR')}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Total time */}
                  {(editingCard.timeEntries || []).length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Total</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {(() => {
                          const total = (editingCard.timeEntries || []).reduce((sum, e) => {
                            const s = new Date(e.startedAt).getTime();
                            const en = e.endedAt ? new Date(e.endedAt).getTime() : Date.now();
                            return sum + (en - s);
                          }, 0);
                          const h = Math.floor(total / 3600000);
                          const m = Math.round((total % 3600000) / 60000);
                          return `${h}h ${m}min`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VERSION HISTORY */}
            {editingCard && (
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-[#12141c] border border-zinc-800 p-5 rounded-xl space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <h4 className="text-xs font-bold font-mono uppercase text-[#c084fc] tracking-widest flex items-center gap-1.5">
                      <History className="w-4 h-4 text-purple-400" /> Histórico de Versões
                    </h4>
                  </div>

                  {(editingCard.versions || []).length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4 italic">
                      Nenhuma versão anterior registrada.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(editingCard.versions || []).map((ver, i) => (
                        <div key={ver.id} className="flex items-center gap-3 p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                            {ver.artUrl ? (
                              <img src={ver.artUrl} alt={`v${i + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-600">N/A</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-zinc-300">Versão {i + 1}</p>
                            <p className="text-[9px] text-zinc-500 truncate">{ver.note || 'Sem observação'}</p>
                          </div>
                          <span className="text-[9px] text-zinc-600 font-mono shrink-0">
                            {new Date(ver.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* COMMENTS MANAGER */}
            {editingCard && (
              <div className="lg:col-span-12 space-y-6">
                <div className="bg-[#12141c] border border-zinc-800 p-5 rounded-xl space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                    <h4 className="text-xs font-bold font-mono uppercase text-[#a5b4fc] tracking-widest flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-400" /> Central de Comentários
                    </h4>
                    <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded font-mono uppercase font-bold">
                      SQL Ativo
                    </span>
                  </div>

                  {/* Scopes Comments list */}
                  <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                    {comments.filter(c => c.cardId === editingCard.id).length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-4 italic">
                        Nenhum feedback cadastrado para este card. Escreva abaixo!
                      </p>
                    ) : (
                      comments
                        .filter(c => c.cardId === editingCard.id)
                        .map(comt => {
                          const simpleAuthorInitials = comt.author.substring(0, 2).toUpperCase();
                          return (
                            <div key={comt.id} className="bg-[#090b12] border border-zinc-850 p-2.5 rounded-lg space-y-1 text-xs text-left">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[9px] font-mono shadow border border-indigo-500/15">
                                    {simpleAuthorInitials}
                                  </div>
                                  <span className="font-bold text-zinc-300 text-[11px] font-sans">{comt.author}</span>
                                </div>
                                <span className="text-[9px] text-zinc-500 font-mono tracking-tighter">{comt.timestamp}</span>
                              </div>
                              <p className="pl-7 text-[11px] text-zinc-400 leading-relaxed font-sans">{comt.text}</p>
                            </div>
                          );
                        })
                    )}
                  </div>

                  {/* Comment Insertion form */}
                  <form onSubmit={handleSubmitComment} className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      placeholder="Solicitar alterações ou sugerir melhorias..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-white rounded-xl px-3 py-2 outline-none font-sans focus:border-indigo-500"
                    />
                    <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition whitespace-nowrap shrink-0"
                    >
                      Enviar
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className={`p-5 border-t flex items-center justify-end gap-3 sticky bottom-0 z-20 ${isDarkMode ? 'border-zinc-800 bg-[#151926]/90' : 'border-slate-200 bg-slate-50/90'}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-extrabold rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 text-xs font-extrabold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15 hover:shadow-indigo-500/25 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>{editingCard ? 'Salvar Alterações \u2713' : 'Criar Demanda \u271a'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
