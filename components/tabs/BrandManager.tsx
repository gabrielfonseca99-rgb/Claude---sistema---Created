import React, { useState, useCallback } from 'react';
import {
  Palette, Type, MessageSquare, CheckCircle2, AlertTriangle, Info,
  Plus, Trash2, ChevronDown, ChevronRight, Edit3, Save, X,
  Shield, Hash, Sparkles
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Brand, BrandColorToken, ReviewIssue } from '../../types';
import { generateId } from '../../utils/helpers';

// ==========================================
// REVISOR IA — Brand Compliance Checker
// ==========================================
function runBrandReview(brand: Brand, copyText: string): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const enabledChecks = brand.checklist.filter(c => c.enabled);

  for (const check of enabledChecks) {
    let triggered = false;
    const lower = copyText.toLowerCase();

    // Text rules
    if (check.category === 'texto') {
      if (check.rule.includes('hashtag') && copyText.includes('#')) {
        const hashes = copyText.match(/#\w+/g) || [];
        const maxStr = brand.hashtagRules?.match(/Máximo (\d+)/);
        if (maxStr && hashes.length > parseInt(maxStr[1])) triggered = true;
      }
      if (check.rule.includes('numéricos') && /\d{4,}/.test(copyText) && !/R\$\s?\d/.test(copyText)) triggered = true;
      if (check.rule.includes('base legal') && /lei|norma|resolução|artigo/i.test(copyText) && !/nº|art\./i.test(copyText)) triggered = true;
      if (check.rule.includes('localização') && !/(são paulo|rio|lisboa|dubai|miami|londre)/i.test(lower)) triggered = true;
    }
    // Tone rules
    if (check.category === 'tom') {
      if (check.rule.includes('informal') && /(vc|pra |blz|haha|kk|tá |né )/i.test(copyText)) triggered = true;
      if (check.rule.includes('1ª pessoa do plural') && /\b(eu |meu |minha )/i.test(copyText)) triggered = true;
      if (check.rule.includes('formal') && /(vc|pra |blz|valeu|falou)/i.test(copyText)) triggered = true;
      if (check.rule.includes('aspiracional') && /(urgente|última chance|não perca|corra)/i.test(lower)) triggered = true;
      if (check.rule.includes('técnica aeronáutica') && /(aviãozinho|brinquedo voador)/i.test(lower)) triggered = true;
    }

    if (triggered) {
      issues.push({
        id: generateId('rev'),
        type: check.category,
        severity: check.severity,
        rule: check.rule,
        description: `Regra violada: "${check.rule}"`,
        autoFixable: false,
      });
    }
  }

  // Check voice examples
  for (const ex of brand.voiceExamples) {
    const dontWords = ex.dont.toLowerCase().split(' ').filter(w => w.length > 4);
    for (const w of dontWords) {
      if (copyText.toLowerCase().includes(w) && w.length > 5) {
        issues.push({
          id: generateId('rev'),
          type: 'tom',
          severity: 'aviso',
          rule: `Evitar linguagem como: "${ex.dont}"`,
          description: `O texto contém termos próximos ao exemplo negativo: "${ex.dont}" (contexto: ${ex.context})`,
          autoFixable: false,
        });
        break;
      }
    }
  }

  return issues;
}

// ==========================================
// COLOR TOKEN EDITOR
// ==========================================
const ColorTokenEditor: React.FC<{
  tokens: BrandColorToken[];
  onChange: (tokens: BrandColorToken[]) => void;
  isDarkMode: boolean;
  isAdmin: boolean;
}> = ({ tokens, onChange, isDarkMode, isAdmin }) => {
  const addToken = () => onChange([...tokens, { name: 'Nova Cor', hex: '#888888', usage: 'Descrição do uso' }]);
  const removeToken = (i: number) => onChange(tokens.filter((_, idx) => idx !== i));
  const updateToken = (i: number, field: keyof BrandColorToken, val: string) => {
    const next = [...tokens];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
          <Palette className="w-3 h-3 inline mr-1" />Paleta de Cores ({tokens.length})
        </span>
        {isAdmin && (
          <button onClick={addToken} className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Adicionar
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tokens.map((token, i) => (
          <div key={i} className={`rounded-xl p-3 border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg border shadow-sm shrink-0" style={{ backgroundColor: token.hex, borderColor: isDarkMode ? '#3f3f46' : '#e2e8f0' }} />
              {isAdmin ? (
                <input
                  value={token.hex}
                  onChange={e => updateToken(i, 'hex', e.target.value)}
                  className={`text-xs font-mono w-20 px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-zinc-700 text-zinc-200' : 'bg-white text-slate-700 border border-slate-200'}`}
                />
              ) : (
                <span className={`text-xs font-mono ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{token.hex}</span>
              )}
              {isAdmin && (
                <button onClick={() => removeToken(i)} className="text-red-400 hover:text-red-300 ml-auto"><Trash2 className="w-3 h-3" /></button>
              )}
            </div>
            {isAdmin ? (
              <>
                <input value={token.name} onChange={e => updateToken(i, 'name', e.target.value)}
                  className={`text-[10px] font-bold w-full mb-1 px-1 py-0.5 rounded ${isDarkMode ? 'bg-zinc-700 text-zinc-200' : 'bg-white text-slate-700 border border-slate-200'}`} />
                <input value={token.usage} onChange={e => updateToken(i, 'usage', e.target.value)}
                  className={`text-[10px] w-full px-1 py-0.5 rounded ${isDarkMode ? 'bg-zinc-700 text-zinc-400' : 'bg-white text-slate-500 border border-slate-200'}`} />
              </>
            ) : (
              <>
                <p className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{token.name}</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{token.usage}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// BRAND DETAIL PANEL
// ==========================================
const BrandDetailPanel: React.FC<{ brand: Brand }> = ({ brand }) => {
  const { handleSaveBrandGuideline, isDarkMode, currentUser, cards, canAccessBrand } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    colors: true, typography: true, voice: true, checklist: true, social: true
  });
  const [reviewText, setReviewText] = useState('');
  const [reviewResults, setReviewResults] = useState<ReviewIssue[] | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  const toggle = (s: string) => setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }));

  const save = useCallback((field: string, value: any) => {
    handleSaveBrandGuideline(brand.id, { [field]: value } as Partial<Brand>);
    setEditingField(null);
  }, [brand.id, handleSaveBrandGuideline]);

  const startEdit = (field: string, val: string) => { setEditingField(field); setTempValue(val); };

  const runReview = () => {
    const text = reviewText || cards.filter(c => c.brandId === brand.id && canAccessBrand(c.brandId)).map(c => c.copyText).join('\n');
    if (!text.trim()) return;
    setReviewResults(runBrandReview(brand, text));
  };

  const SectionHeader: React.FC<{ id: string; icon: React.ReactNode; title: string }> = ({ id, icon, title }) => (
    <button onClick={() => toggle(id)} className={`flex items-center gap-2 w-full text-left py-2 ${isDarkMode ? 'text-zinc-300 hover:text-zinc-100' : 'text-slate-700 hover:text-slate-900'}`}>
      {expandedSections[id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
    </button>
  );

  const sevIcon = (s: string) => s === 'erro' ? <AlertTriangle className="w-3 h-3 text-red-400" /> : s === 'aviso' ? <Info className="w-3 h-3 text-amber-400" /> : <Info className="w-3 h-3 text-blue-400" />;
  const sevColor = (s: string) => s === 'erro' ? 'border-red-500/30 bg-red-500/5' : s === 'aviso' ? 'border-amber-500/30 bg-amber-500/5' : 'border-blue-500/30 bg-blue-500/5';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`flex items-center gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg" style={{ backgroundColor: brand.primaryColor }}>
          {brand.id.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className={`text-base font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>{brand.name}</h3>
          <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{brand.tagline}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: brand.primaryColor }} />
          <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: brand.secondaryColor }} />
          <div className="w-6 h-6 rounded-lg border" style={{ backgroundColor: brand.backgroundColor, borderColor: isDarkMode ? '#3f3f46' : '#e2e8f0' }} />
        </div>
      </div>

      {/* Colors */}
      <div>
        <SectionHeader id="colors" icon={<Palette className="w-3.5 h-3.5" />} title="Paleta de Cores" />
        {expandedSections.colors && (
          <ColorTokenEditor
            tokens={brand.colorTokens || []}
            onChange={tokens => save('colorTokens', tokens)}
            isDarkMode={isDarkMode}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Typography */}
      <div>
        <SectionHeader id="typography" icon={<Type className="w-3.5 h-3.5" />} title="Tipografia" />
        {expandedSections.typography && (
          <div className="space-y-2">
            {(brand.typographyTokens || []).map((t, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{t.role}</span>
                  <p className={`text-sm ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`} style={{ fontFamily: t.fontFamily, fontSize: t.fontSize, fontWeight: Number(t.fontWeight) }}>
                    Exemplo de texto
                  </p>
                </div>
                <div className={`text-[10px] font-mono text-right ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  <p>{t.fontFamily.split(',')[0]}</p>
                  <p>{t.fontSize} / {t.fontWeight} / {t.lineHeight}</p>
                  {t.letterSpacing && <p>ls: {t.letterSpacing}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice & Tone */}
      <div>
        <SectionHeader id="voice" icon={<MessageSquare className="w-3.5 h-3.5" />} title="Voz e Tom" />
        {expandedSections.voice && (
          <div className="space-y-3">
            {/* Main guidelines */}
            <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Diretrizes Gerais</span>
                {isAdmin && editingField !== 'voiceGuidelines' && (
                  <button onClick={() => startEdit('voiceGuidelines', brand.voiceGuidelines)} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
              {editingField === 'voiceGuidelines' ? (
                <div className="flex gap-2">
                  <textarea value={tempValue} onChange={e => setTempValue(e.target.value)} rows={3}
                    className={`flex-1 text-xs rounded-lg p-2 ${isDarkMode ? 'bg-zinc-700 text-zinc-200 border-zinc-600' : 'bg-white text-slate-700 border-slate-200'} border`} />
                  <div className="flex flex-col gap-1">
                    <button onClick={() => save('voiceGuidelines', tempValue)} className="p-1 text-green-400 hover:text-green-300"><Save className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingField(null)} className="p-1 text-red-400 hover:text-red-300"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ) : (
                <blockquote className={`text-xs italic border-l-2 pl-3 ${isDarkMode ? 'text-zinc-400 border-zinc-700' : 'text-slate-500 border-slate-300'}`}>
                  "{brand.voiceGuidelines}"
                </blockquote>
              )}
            </div>

            {/* Voice examples */}
            <div className="space-y-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Exemplos de Tom</span>
              {(brand.voiceExamples || []).map((ex, i) => (
                <div key={i} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-[10px] font-bold mb-1.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{ex.context}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-green-900/10 border-green-800/30' : 'bg-green-50 border-green-200'}`}>
                      <span className="text-[9px] font-bold text-green-500 uppercase">Fazer</span>
                      <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{ex.do}</p>
                    </div>
                    <div className={`p-2 rounded-lg border ${isDarkMode ? 'bg-red-900/10 border-red-800/30' : 'bg-red-50 border-red-200'}`}>
                      <span className="text-[9px] font-bold text-red-500 uppercase">Evitar</span>
                      <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{ex.dont}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compliance Checklist */}
      <div>
        <SectionHeader id="checklist" icon={<CheckCircle2 className="w-3.5 h-3.5" />} title="Checklist de Conformidade" />
        {expandedSections.checklist && (
          <div className="space-y-1.5">
            {(brand.checklist || []).map((item) => (
              <div key={item.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                {isAdmin ? (
                  <input type="checkbox" checked={item.enabled} onChange={() => {
                    const updated = (brand.checklist || []).map(c => c.id === item.id ? { ...c, enabled: !c.enabled } : c);
                    save('checklist', updated);
                  }} className="rounded" />
                ) : (
                  <div className={`w-4 h-4 rounded flex items-center justify-center ${item.enabled ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700'}`}>
                    {item.enabled && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                )}
                {sevIcon(item.severity)}
                <span className={`text-xs flex-1 ${item.enabled ? (isDarkMode ? 'text-zinc-300' : 'text-slate-700') : (isDarkMode ? 'text-zinc-600 line-through' : 'text-slate-400 line-through')}`}>
                  {item.rule}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase ${
                  item.category === 'texto' ? 'bg-blue-500/10 text-blue-400' :
                  item.category === 'visual' ? 'bg-purple-500/10 text-purple-400' :
                  item.category === 'tom' ? 'bg-amber-500/10 text-amber-400' :
                  item.category === 'logo' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-pink-500/10 text-pink-400'
                }`}>{item.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Social Rules */}
      <div>
        <SectionHeader id="social" icon={<Hash className="w-3.5 h-3.5" />} title="Regras de Redes Sociais" />
        {expandedSections.social && (
          <div className="space-y-2">
            {brand.hashtagRules && (
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Hashtags</span>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{brand.hashtagRules}</p>
              </div>
            )}
            {brand.captionStyle && (
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Estilo de Caption</span>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{brand.captionStyle}</p>
              </div>
            )}
            {brand.logoUsageNotes && (
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Uso de Logo</span>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{brand.logoUsageNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* REVISOR IA */}
      <div className={`p-4 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-indigo-500/30 bg-indigo-950/10' : 'border-indigo-200 bg-indigo-50/30'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h4 className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>Revisor IA</h4>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">BETA</span>
        </div>
        <p className={`text-[11px] mb-3 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
          Cole um texto de copy para verificar conformidade com as diretrizes de marca.
        </p>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          placeholder="Cole aqui a copy para revisão, ou clique em Revisar para analisar todos os cards da marca..."
          rows={3}
          className={`w-full text-xs rounded-lg p-3 mb-2 border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200 placeholder-zinc-600' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-300'}`}
        />
        <button onClick={runReview} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" /> Revisar Conformidade
        </button>

        {reviewResults !== null && (
          <div className="mt-3 space-y-2">
            {reviewResults.length === 0 ? (
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-green-900/10 border-green-800/30' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Nenhum problema encontrado!</span>
                </div>
                <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>O texto está em conformidade com as diretrizes da marca.</p>
              </div>
            ) : (
              <>
                <div className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                  {reviewResults.length} problema{reviewResults.length > 1 ? 's' : ''} encontrado{reviewResults.length > 1 ? 's' : ''}
                </div>
                {reviewResults.map(issue => (
                  <div key={issue.id} className={`p-3 rounded-lg border ${sevColor(issue.severity)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {sevIcon(issue.severity)}
                      <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>{issue.rule}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase ml-auto ${
                        issue.severity === 'erro' ? 'bg-red-500/20 text-red-400' : issue.severity === 'aviso' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>{issue.severity}</span>
                    </div>
                    <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{issue.description}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Logo Preview */}
      <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'border-zinc-700' : 'border-slate-200'}`}>
        <div className="h-20 flex items-center justify-center text-xl font-bold" style={{ backgroundColor: brand.backgroundColor, color: brand.textColor, fontFamily: brand.fontFamily }}>
          {brand.logoPlaceholder}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN BRAND MANAGER
// ==========================================
export const BrandManager: React.FC = () => {
  const { brands, isDarkMode, canAccessBrand } = useApp();
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?.id || '');

  const accessibleBrands = brands.filter(b => canAccessBrand(b.id));
  const selectedBrand = brands.find(b => b.id === selectedBrandId);

  return (
    <div className="flex gap-6 h-full min-h-[600px]">
      {/* Brand List */}
      <div className={`w-64 shrink-0 rounded-xl border overflow-y-auto ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-zinc-800' : 'border-slate-200'}`}>
          <h2 className={`text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>Marcas</h2>
          <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{accessibleBrands.length} marcas gerenciadas</p>
        </div>
        <div className="p-2 space-y-1">
          {accessibleBrands.map(brand => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrandId(brand.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
                selectedBrandId === brand.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: brand.primaryColor }}>
                {brand.id.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{brand.name}</p>
                <p className={`text-[10px] truncate ${selectedBrandId === brand.id ? 'text-indigo-200' : isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{brand.tagline}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 overflow-y-auto pr-1">
        {selectedBrand ? (
          <BrandDetailPanel brand={selectedBrand} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className={`text-sm ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Selecione uma marca</p>
          </div>
        )}
      </div>
    </div>
  );
};
