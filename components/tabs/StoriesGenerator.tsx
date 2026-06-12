import React, { useState } from 'react';
import { Sparkles, Download, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { generateId, formatTimestamp } from '../../utils/helpers';

const BRAND_INITIALS: Record<string, string> = {
  gcr: 'GG',
  copicont: 'GC',
  tavares: 'TS',
  lcr: 'LCR',
  lopes: 'LM',
};

const STYLE_OPTIONS = [
  { id: 'text-bg-color', label: 'Texto + Cor' },
  { id: 'bg-image', label: 'Imagem Fundo' },
  { id: 'brand-colors', label: 'Cores da Marca' },
  { id: 'minimalist', label: 'Minimalista' },
] as const;

const PRESET_COLORS = ['#FFFFFF', '#000000', '#EF4444', '#3B82F6', '#10B981'];

const STICKER_TYPES = [
  { id: 'none', label: 'Nenhum' },
  { id: 'box', label: 'Caixa' },
  { id: 'poll', label: 'Enquete' },
  { id: 'slider', label: 'Slider' },
  { id: 'countdown', label: 'Contagem' },
] as const;

type StickerType = (typeof STICKER_TYPES)[number]['id'];

export const StoriesGenerator: React.FC = () => {
  const { brands, storyBrandId, setStoryBrandId, cards, setCards, currentUser, registerLog, isDarkMode } = useApp();

  const [storyStyle, setStoryStyle] = useState('text-bg-color');
  const [storyTitle, setStoryTitle] = useState('Seu texto aqui');
  const [storySubtitle, setStorySubtitle] = useState('');
  const [storySticker, setStorySticker] = useState<StickerType>('none');
  const [storyStickerText, setStoryStickerText] = useState('');
  const [storyPollTitle, setStoryPollTitle] = useState('Qual opção?');
  const [storyPollYes, setStoryPollYes] = useState('Sim');
  const [storyPollNo, setStoryPollNo] = useState('Não');
  const [storySliderLabel, setStorySliderLabel] = useState('Quanto?');
  const [storySliderVal, setStorySliderVal] = useState(50);
  const [storyCountdownTitle, setStoryCountdownTitle] = useState('Evento especial');
  const [storyTitleSize, setStoryTitleSize] = useState(22);
  const [storyTitleColor, setStoryTitleColor] = useState('#FFFFFF');

  const selectedBrand = brands.find(b => b.id === storyBrandId) || brands[0];

  // Theme helpers
  const labelCls = `block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} text-xs font-semibold`;
  const inputCls = `w-full px-3 py-2 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none`;
  const inputPinkCls = `w-full px-3 py-2 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-lg text-sm focus:ring-1 focus:ring-pink-500 focus:outline-none`;
  const halfInputPinkCls = `flex-1 px-3 py-2 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-lg text-sm focus:ring-1 focus:ring-pink-500 focus:outline-none`;
  const inactiveBtnCls = isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200';

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (storyStyle) {
      case 'brand-colors':
        return { background: `linear-gradient(135deg, ${selectedBrand.primaryColor}, ${selectedBrand.secondaryColor})` };
      case 'minimalist':
        return { background: '#f8f9fa', color: '#111' };
      case 'bg-image':
        return { background: `linear-gradient(180deg, ${selectedBrand.primaryColor}99, ${selectedBrand.backgroundColor})` };
      case 'text-bg-color':
      default:
        return { background: selectedBrand.backgroundColor };
    }
  };

  const handleSendToPanel = () => {
    const newCard = {
      id: generateId('card'),
      brandId: storyBrandId,
      title: `[Story] ${storyTitle}`,
      theme: 'Instagram Stories',
      copyText: storySubtitle || storyTitle,
      artUrl: '',
      stage: 'em_aprovacao',
      approvalStatus: 'pendente' as const,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priorityName: 'Média',
      priorityColor: '#3b82f6',
      subtasks: [],
    };
    setCards(prev => [newCard, ...prev]);
    registerLog(newCard.id, `Criou story "${storyTitle}" e enviou para aprovação.`);
  };

  const handleDownload = () => {
    alert('Download do Story será implementado com html2canvas.');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-pink-500" />
        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>Gerador de Stories (9:16)</h2>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Controls Panel */}
        <div className="col-span-7 space-y-5">
          {/* Brand Selector */}
          <div>
            <label className={`${labelCls} mb-2`}>MARCA</label>
            <div className="flex gap-2">
              {brands.map(b => (
                <button
                  key={b.id}
                  onClick={() => setStoryBrandId(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    storyBrandId === b.id
                      ? `ring-2 ring-offset-1 ${isDarkMode ? 'ring-offset-zinc-900' : 'ring-offset-white'} text-white`
                      : inactiveBtnCls
                  }`}
                  style={storyBrandId === b.id ? { backgroundColor: b.primaryColor, ringColor: b.primaryColor } : {}}
                >
                  {BRAND_INITIALS[b.id] || b.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className={`${labelCls} mb-2`}>ESTILO</label>
            <div className="flex gap-2 flex-wrap">
              {STYLE_OPTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStoryStyle(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    storyStyle === s.id ? 'bg-indigo-600 text-white' : inactiveBtnCls
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className={`${labelCls} mb-1`}>TITULO</label>
            <input type="text" value={storyTitle} onChange={e => setStoryTitle(e.target.value)} className={inputCls} />
          </div>

          {/* Title Size Slider */}
          <div>
            <label className={`${labelCls} mb-1`}>TAMANHO DO TITULO: {storyTitleSize}px</label>
            <input type="range" min={14} max={32} value={storyTitleSize} onChange={e => setStoryTitleSize(Number(e.target.value))} className="w-full accent-indigo-500" />
          </div>

          {/* Title Color Picker */}
          <div>
            <label className={`${labelCls} mb-2`}>COR DO TITULO</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setStoryTitleColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition ${
                    storyTitleColor === c ? 'border-indigo-400 scale-110' : isDarkMode ? 'border-zinc-600' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Subtitle / CTA */}
          <div>
            <label className={`${labelCls} mb-1`}>SUBTITULO / CTA</label>
            <input type="text" value={storySubtitle} onChange={e => setStorySubtitle(e.target.value)} placeholder="Arraste para cima, Saiba mais..." className={inputCls} />
          </div>

          {/* Sticker Selector */}
          <div>
            <label className={`${labelCls} mb-2`}>STICKER</label>
            <div className="flex gap-2 flex-wrap">
              {STICKER_TYPES.map(st => (
                <button
                  key={st.id}
                  onClick={() => setStorySticker(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    storySticker === st.id ? 'bg-pink-600 text-white' : inactiveBtnCls
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              {storySticker === 'box' && (
                <input type="text" value={storyStickerText} onChange={e => setStoryStickerText(e.target.value)} placeholder="Texto da caixa..." className={inputPinkCls} />
              )}
              {storySticker === 'poll' && (
                <>
                  <input type="text" value={storyPollTitle} onChange={e => setStoryPollTitle(e.target.value)} placeholder="Pergunta da enquete" className={inputPinkCls} />
                  <div className="flex gap-2">
                    <input type="text" value={storyPollYes} onChange={e => setStoryPollYes(e.target.value)} className={halfInputPinkCls} />
                    <input type="text" value={storyPollNo} onChange={e => setStoryPollNo(e.target.value)} className={halfInputPinkCls} />
                  </div>
                </>
              )}
              {storySticker === 'slider' && (
                <div className="space-y-2">
                  <input type="text" value={storySliderLabel} onChange={e => setStorySliderLabel(e.target.value)} placeholder="Label do slider" className={inputPinkCls} />
                  <input type="range" min={0} max={100} value={storySliderVal} onChange={e => setStorySliderVal(Number(e.target.value))} className="w-full accent-pink-500" />
                </div>
              )}
              {storySticker === 'countdown' && (
                <input type="text" value={storyCountdownTitle} onChange={e => setStoryCountdownTitle(e.target.value)} placeholder="Titulo do countdown" className={inputPinkCls} />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDownload}
              className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} text-sm rounded-lg transition`}
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={handleSendToPanel}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Enviar para Painel
            </button>
          </div>
        </div>

        {/* Mobile Preview */}
        <div className="col-span-5 flex justify-center">
          <div className="relative">
            <div className="w-[260px] h-[460px] rounded-[28px] border-4 border-zinc-700 bg-zinc-900 overflow-hidden shadow-2xl">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-b-xl z-10" />
              <div
                className="w-full h-full flex flex-col items-center justify-center px-5 text-center relative"
                style={{ ...getBackgroundStyle(), fontFamily: selectedBrand.fontFamily }}
              >
                <div className="absolute top-8 left-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: selectedBrand.primaryColor }}>
                    {BRAND_INITIALS[selectedBrand.id] || '?'}
                  </div>
                  <span className="text-[10px] text-white/70 font-medium">{selectedBrand.name}</span>
                </div>

                <p className="font-bold leading-tight max-w-[200px] break-words" style={{ fontSize: `${storyTitleSize}px`, color: storyTitleColor }}>
                  {storyTitle}
                </p>

                {storySubtitle && <p className="text-white/70 text-xs mt-2 max-w-[180px]">{storySubtitle}</p>}

                {storySticker === 'box' && storyStickerText && (
                  <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-xs">{storyStickerText}</div>
                )}
                {storySticker === 'poll' && (
                  <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 w-[180px]">
                    <p className="text-white text-[10px] font-bold mb-2">{storyPollTitle}</p>
                    <div className="flex gap-1">
                      <div className="flex-1 bg-white/30 rounded-lg py-1 text-center text-white text-[10px]">{storyPollYes}</div>
                      <div className="flex-1 bg-white/30 rounded-lg py-1 text-center text-white text-[10px]">{storyPollNo}</div>
                    </div>
                  </div>
                )}
                {storySticker === 'slider' && (
                  <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 w-[180px]">
                    <p className="text-white text-[10px] font-bold mb-1">{storySliderLabel}</p>
                    <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${storySliderVal}%` }} />
                    </div>
                  </div>
                )}
                {storySticker === 'countdown' && (
                  <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                    <p className="text-white text-[10px] font-bold">{storyCountdownTitle}</p>
                    <div className="flex gap-2 mt-1 justify-center">
                      {['02', '14', '30'].map((v, i) => (
                        <div key={i} className="bg-white/30 rounded px-2 py-1">
                          <span className="text-white text-sm font-bold">{v}</span>
                          <span className="text-white/60 text-[8px] block">{['D', 'H', 'M'][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {storySubtitle && (
                  <div className="absolute bottom-8 flex flex-col items-center">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-white/50 rotate-45 transform -translate-y-1" />
                    <span className="text-white/50 text-[9px] mt-1">Arraste para cima</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
