import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, ExternalLink, Key, RefreshCw, FolderOpen, Trash2, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import {
  getFigmaToken, setFigmaToken, clearFigmaToken,
  isFigmaConnected, validateToken,
  parseFigmaUrl, getFileInfo, getFileFrames, exportFrames,
  FigmaFile, FigmaNode, FigmaExportResult,
} from '../../services/figmaApi';
import {
  getFolderMappings, setFolderForBrand, removeFolderMapping,
  getUploadRecords, BrandFolderMapping, DriveUploadRecord,
} from '../../services/driveService';

// ==========================================
// FIGMA CONNECTION CARD
// ==========================================
const FigmaConnectionCard: React.FC = () => {
  const { isDarkMode } = useApp();
  const [token, setToken] = useState(getFigmaToken());
  const [isConnected, setIsConnected] = useState(isFigmaConnected());
  const [userName, setUserName] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    setIsValidating(true);
    setError(null);
    const result = await validateToken();
    setIsValidating(false);
    if (result.valid) {
      setIsConnected(true);
      setUserName(result.userName || null);
    } else {
      setIsConnected(false);
      setUserName(null);
      setError('Token inválido ou expirado');
    }
  };

  const handleConnect = async () => {
    if (!token.trim()) { setError('Insira um token'); return; }
    setFigmaToken(token.trim());
    await checkConnection();
  };

  const handleDisconnect = () => {
    clearFigmaToken();
    setToken('');
    setIsConnected(false);
    setUserName(null);
    setError(null);
  };

  const cardBg = isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
  const borderB = isDarkMode ? 'border-zinc-800' : 'border-slate-100';
  const inputBg = isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';
  const labelCls = isDarkMode ? 'text-zinc-500' : 'text-slate-400';
  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-slate-800';
  const textSecondary = isDarkMode ? 'text-zinc-500' : 'text-slate-500';
  const textMuted = isDarkMode ? 'text-zinc-400' : 'text-slate-500';
  const btnSecondary = isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-500';

  return (
    <div className={`${cardBg} border rounded-xl overflow-hidden`}>
      <div className={`p-5 border-b ${borderB} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5zM12 2h3.5a3.5 3.5 0 1 1 0 7H12V2zm0 12.5V9h3.5a3.5 3.5 0 1 1 0 7H12v-3.5zm-7 0A3.5 3.5 0 0 1 8.5 11H12v7H8.5A3.5 3.5 0 0 1 5 14.5zM5 12a3.5 3.5 0 0 0 3.5 3.5H12V9H8.5A3.5 3.5 0 0 0 5 12z"/>
            </svg>
          </div>
          <div>
            <h3 className={`text-sm font-bold ${textPrimary}`}>Figma API</h3>
            <p className={`text-xs ${textSecondary}`}>Conexão direta via Personal Access Token</p>
          </div>
        </div>
        {isConnected && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-600/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <Check className="w-3 h-3" /> Conectado{userName ? ` — ${userName}` : ''}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {!isConnected ? (
          <>
            <div>
              <label className={`block text-[10px] font-semibold ${labelCls} uppercase tracking-wider mb-1.5`}>
                Personal Access Token
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Key className={`absolute left-3 top-2.5 w-3.5 h-3.5 ${labelCls}`} />
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="figd_xxxxxxxxxxxx"
                    className={`w-full pl-9 pr-3 py-2 ${inputBg} border rounded-lg text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none`}
                  />
                </div>
                <button
                  onClick={handleConnect}
                  disabled={isValidating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  {isValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Conectar
                </button>
              </div>
              {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
            </div>
            <div className={`text-xs ${textSecondary} space-y-1.5`}>
              <p className={`font-semibold ${textMuted}`}>Como obter o token:</p>
              <ol className="list-decimal list-inside space-y-1 text-[11px]">
                <li>Acesse <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">figma.com/developers</a></li>
                <li>Clique em "Generate a personal access token"</li>
                <li>Copie o token e cole acima</li>
              </ol>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className={`text-xs ${textMuted}`}>
              Sua conta Figma está conectada. Agora você pode colar links do Figma em qualquer demanda para ver thumbnails renderizados automaticamente e exportar frames como PNG.
            </p>
            <button
              onClick={handleDisconnect}
              className={`px-3 py-1.5 ${btnSecondary} text-xs rounded-lg transition`}
            >
              Desconectar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// FIGMA FILE EXPLORER
// ==========================================
const FigmaFileExplorer: React.FC = () => {
  const { cards, setCards, registerLog, isDarkMode } = useApp();
  const [fileUrl, setFileUrl] = useState('');
  const [fileInfo, setFileInfo] = useState<FigmaFile | null>(null);
  const [frames, setFrames] = useState<FigmaNode[]>([]);
  const [selectedFrames, setSelectedFrames] = useState<Set<string>>(new Set());
  const [exports, setExports] = useState<FigmaExportResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isFigmaConnected()) return null;

  const cardBg = isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
  const borderB = isDarkMode ? 'border-zinc-800' : 'border-slate-100';
  const inputBg = isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';
  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-slate-800';
  const textSecondary = isDarkMode ? 'text-zinc-500' : 'text-slate-500';
  const labelCls = isDarkMode ? 'text-zinc-500' : 'text-slate-400';
  const itemBg = isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200';

  const handleLoadFile = async () => {
    const parsed = parseFigmaUrl(fileUrl);
    if (!parsed) { setError('URL do Figma inválida'); return; }

    setLoading(true);
    setError(null);
    setFrames([]);
    setExports([]);
    setSelectedFrames(new Set());

    try {
      const [info, fileFrames] = await Promise.all([
        getFileInfo(parsed.fileKey),
        getFileFrames(parsed.fileKey),
      ]);
      setFileInfo(info);
      setFrames(fileFrames);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (selectedFrames.size === 0) return;
    const parsed = parseFigmaUrl(fileUrl);
    if (!parsed) return;

    setExporting(true);
    try {
      const results = await exportFrames(parsed.fileKey, Array.from(selectedFrames));
      setExports(results);
      registerLog('figma', `Exportou ${results.length} frame(s) do Figma: ${fileInfo?.name || parsed.fileKey}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao exportar');
    } finally {
      setExporting(false);
    }
  };

  const handleAttachToCard = (cardId: string, imageUrl: string) => {
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, artUrl: imageUrl, updatedAt: new Date().toISOString() } : c
    ));
    registerLog(cardId, 'Anexou frame exportado do Figma como arte da demanda.');
  };

  const toggleFrame = (id: string) => {
    setSelectedFrames(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className={`${cardBg} border rounded-xl overflow-hidden`}>
      <div className={`p-5 border-b ${borderB}`}>
        <h3 className={`text-sm font-bold ${textPrimary} mb-1`}>Explorador de Arquivos Figma</h3>
        <p className={`text-xs ${textSecondary}`}>Cole a URL de um arquivo Figma para visualizar e exportar frames.</p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://www.figma.com/design/abc123/MeuProjeto"
            className={`flex-1 px-3 py-2 ${inputBg} border rounded-lg text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none`}
          />
          <button
            onClick={handleLoadFile}
            disabled={loading || !fileUrl.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Carregar
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {fileInfo && (
          <div className={`flex items-center gap-3 p-3 ${itemBg} rounded-lg border`}>
            {fileInfo.thumbnailUrl && (
              <img src={fileInfo.thumbnailUrl} alt="" className={`w-16 h-12 object-cover rounded-md border ${isDarkMode ? 'border-zinc-700' : 'border-slate-200'}`} />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${textPrimary} truncate`}>{fileInfo.name}</p>
              <p className={`text-[10px] ${labelCls} font-mono`}>Atualizado: {new Date(fileInfo.lastModified).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        )}

        {frames.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-semibold ${labelCls} uppercase tracking-wider`}>{frames.length} Frames encontrados</span>
              <button
                onClick={handleExport}
                disabled={exporting || selectedFrames.size === 0}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1"
              >
                {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Exportar {selectedFrames.size > 0 ? `(${selectedFrames.size})` : ''} como PNG
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {frames.map(frame => (
                <button
                  key={frame.id}
                  onClick={() => toggleFrame(frame.id)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition ${
                    selectedFrames.has(frame.id)
                      ? 'bg-purple-600/15 border-purple-500/30 text-purple-300'
                      : `${itemBg} ${isDarkMode ? 'text-zinc-400 hover:border-zinc-700' : 'text-slate-500 hover:border-slate-300'}`
                  }`}
                >
                  <span className="font-semibold truncate block">{frame.name}</span>
                  <span className={`text-[9px] ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'} font-mono`}>{frame.type} · {frame.id}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {exports.length > 0 && (
          <div>
            <span className={`text-[10px] font-semibold ${labelCls} uppercase tracking-wider block mb-2`}>Frames exportados</span>
            <div className="grid grid-cols-3 gap-3">
              {exports.map(exp => (
                <div key={exp.nodeId} className="space-y-2">
                  <img
                    src={exp.imageUrl}
                    alt={exp.nodeId}
                    className={`w-full aspect-video object-cover rounded-lg border ${isDarkMode ? 'border-zinc-700' : 'border-slate-200'}`}
                  />
                  <div className="flex gap-1">
                    <a
                      href={exp.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 text-center px-2 py-1 ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} text-[9px] rounded transition`}
                    >
                      Abrir
                    </a>
                    <select
                      onChange={e => { if (e.target.value) handleAttachToCard(e.target.value, exp.imageUrl); }}
                      defaultValue=""
                      className={`flex-1 px-1 py-1 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-600'} border rounded text-[9px] focus:outline-none`}
                    >
                      <option value="" disabled>Anexar...</option>
                      {cards.map(c => <option key={c.id} value={c.id}>{c.title.substring(0, 30)}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// GOOGLE DRIVE CONFIG CARD
// ==========================================
const GoogleDriveCard: React.FC = () => {
  const { brands, isDarkMode } = useApp();
  const [mappings, setMappings] = useState<BrandFolderMapping[]>(getFolderMappings());
  const [uploads, setUploads] = useState<DriveUploadRecord[]>(getUploadRecords());
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [folderInput, setFolderInput] = useState({ folderId: '', folderName: '' });

  const cardBg = isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200';
  const borderB = isDarkMode ? 'border-zinc-800' : 'border-slate-100';
  const inputBg = isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400';
  const textPrimary = isDarkMode ? 'text-zinc-100' : 'text-slate-800';
  const textSecondary = isDarkMode ? 'text-zinc-500' : 'text-slate-500';
  const textMuted = isDarkMode ? 'text-zinc-400' : 'text-slate-500';
  const itemBg = isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200';
  const btnSecondary = isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500';

  const refreshData = () => {
    setMappings(getFolderMappings());
    setUploads(getUploadRecords());
  };

  const handleSaveFolder = (brandId: string) => {
    if (!folderInput.folderId.trim() || !folderInput.folderName.trim()) return;
    setFolderForBrand({
      brandId,
      folderId: folderInput.folderId.trim(),
      folderName: folderInput.folderName.trim(),
      folderUrl: `https://drive.google.com/drive/folders/${folderInput.folderId.trim()}`,
    });
    setEditingBrandId(null);
    setFolderInput({ folderId: '', folderName: '' });
    refreshData();
  };

  const handleRemove = (brandId: string) => {
    removeFolderMapping(brandId);
    refreshData();
  };

  const configuredCount = mappings.length;
  const recentUploads = uploads.slice(0, 5);

  return (
    <div className={`${cardBg} border rounded-xl overflow-hidden`}>
      <div className={`p-5 border-b ${borderB} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.71 3.5l-5.5 9.5h6.79l5.5-9.5H7.71zm9.29 0l-5.5 9.5H22L16.5 3.5h-5.5zM3 14.5l3.5 6h11l3.5-6H3z"/>
            </svg>
          </div>
          <div>
            <h3 className={`text-sm font-bold ${textPrimary}`}>Google Drive</h3>
            <p className={`text-xs ${textSecondary}`}>Upload automático de artes aprovadas por marca</p>
          </div>
        </div>
        {configuredCount > 0 && (
          <span className="text-[10px] font-bold text-blue-400 bg-blue-600/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
            {configuredCount}/{brands.length} marcas configuradas
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <p className={`text-xs ${textMuted}`}>
          Configure uma pasta do Google Drive para cada marca. Quando uma demanda for aprovada, o asset será automaticamente enviado para a pasta correspondente.
        </p>

        <div className="space-y-2">
          {brands.map(brand => {
            const mapping = mappings.find(m => m.brandId === brand.id);
            const isEditing = editingBrandId === brand.id;

            return (
              <div key={brand.id} className={`p-3 ${itemBg} border rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white" style={{ backgroundColor: brand.primaryColor }}>
                      {brand.name.charAt(0)}
                    </div>
                    <span className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>{brand.name}</span>
                  </div>

                  {mapping && !isEditing ? (
                    <div className="flex items-center gap-2">
                      <a href={mapping.folderUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
                        <FolderOpen className="w-3 h-3" /> {mapping.folderName}
                      </a>
                      <button onClick={() => handleRemove(brand.id)} className={`${isDarkMode ? 'text-zinc-600' : 'text-slate-300'} hover:text-red-400 transition`}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : !isEditing ? (
                    <button
                      onClick={() => { setEditingBrandId(brand.id); setFolderInput({ folderId: '', folderName: '' }); }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      + Configurar pasta
                    </button>
                  ) : null}
                </div>

                {isEditing && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Nome da pasta (ex: GG - Artes Aprovadas)"
                      value={folderInput.folderName}
                      onChange={e => setFolderInput(p => ({ ...p, folderName: e.target.value }))}
                      className={`w-full px-3 py-1.5 ${inputBg} border rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none`}
                    />
                    <input
                      type="text"
                      placeholder="ID da pasta do Drive (da URL)"
                      value={folderInput.folderId}
                      onChange={e => setFolderInput(p => ({ ...p, folderId: e.target.value }))}
                      className={`w-full px-3 py-1.5 ${inputBg} border rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono`}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveFolder(brand.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition">
                        Salvar
                      </button>
                      <button onClick={() => setEditingBrandId(null)}
                        className={`px-3 py-1.5 ${btnSecondary} text-[10px] rounded-lg transition`}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {recentUploads.length > 0 && (
          <div>
            <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'} uppercase tracking-wider block mb-2`}>Uploads recentes</span>
            <div className="space-y-1.5">
              {recentUploads.map(u => (
                <div key={u.id} className={`flex items-center justify-between p-2 ${itemBg} rounded-lg text-[10px]`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Upload className={`w-3 h-3 shrink-0 ${u.status === 'uploaded' ? 'text-emerald-400' : u.status === 'error' ? 'text-red-400' : 'text-amber-400'}`} />
                    <span className={`${isDarkMode ? 'text-zinc-300' : 'text-slate-600'} truncate`}>{u.cardTitle}</span>
                    <span className={`${isDarkMode ? 'text-zinc-600' : 'text-slate-400'}`}>→ {u.folderName}</span>
                  </div>
                  <span className={`${isDarkMode ? 'text-zinc-600' : 'text-slate-400'} font-mono shrink-0`}>{new Date(u.uploadedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN INTEGRATIONS PANEL
// ==========================================
export const IntegrationsPanel: React.FC = () => {
  const { isDarkMode } = useApp();

  return (
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>Integrações</h2>
        <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'} mt-1`}>
          Conecte o CreaFlow a serviços externos para automatizar seu fluxo criativo.
        </p>
      </div>

      <div className="space-y-6">
        <FigmaConnectionCard />
        <FigmaFileExplorer />
        <GoogleDriveCard />
      </div>
    </div>
  );
};
