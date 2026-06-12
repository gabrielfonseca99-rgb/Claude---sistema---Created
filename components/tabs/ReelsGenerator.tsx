import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { darkenColor, wrapText, generateId } from '../../utils/helpers';

const LAYOUT_OPTIONS = [
  { id: 'gradient', label: 'Gradiente' },
  { id: 'geometric', label: 'Geometrico' },
  { id: 'split', label: 'Dividido' },
] as const;

const TITLE_PRESETS = [
  'Descubra agora',
  'Novidade para voce',
  'Dica profissional',
  'Resultado real',
];

const POSITION_OPTIONS = [
  { id: 'top', label: 'Topo' },
  { id: 'center', label: 'Centro' },
  { id: 'bottom', label: 'Base' },
] as const;

type LayoutType = (typeof LAYOUT_OPTIONS)[number]['id'];
type PositionType = (typeof POSITION_OPTIONS)[number]['id'];

const CANVAS_W = 540;
const CANVAS_H = 960;

export const ReelsGenerator: React.FC = () => {
  const { brands, generatorBrandId, setGeneratorBrandId, cards, setCards, registerLog, isDarkMode } = useApp();

  const [generatorLayout, setGeneratorLayout] = useState<LayoutType>('gradient');
  const [generatorTitle, setGeneratorTitle] = useState('5 Estratégias Para Acelerar o Seu Rendimento Anual');
  const [generatorSubtitle, setGeneratorSubtitle] = useState('Clique no Link da Bio Para Entender o Passo a Passo');
  const [generatorTitlePos, setGeneratorTitlePos] = useState<PositionType>('center');
  const [generatorBgImage, setGeneratorBgImage] = useState('');
  const [hasNoiseScanline, setHasNoiseScanline] = useState(true);
  const coverCanvasRef = useRef<HTMLCanvasElement>(null);

  const selectedBrand = brands.find(b => b.id === generatorBrandId) || brands[0];

  // Theme helpers
  const labelCls = `block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} text-xs font-semibold`;
  const inputCls = `w-full px-3 py-2 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'} border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none`;
  const inactiveBtnCls = isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200';

  useEffect(() => {
    const canvas = coverCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    if (generatorLayout === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
      grad.addColorStop(0, selectedBrand.primaryColor);
      grad.addColorStop(1, darkenColor(selectedBrand.primaryColor, 40));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else if (generatorLayout === 'geometric') {
      ctx.fillStyle = selectedBrand.backgroundColor;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = selectedBrand.primaryColor + '33';
      for (let i = 0; i < 6; i++) {
        const x = (i * 120) % CANVAS_W;
        const y = (i * 180) % CANVAS_H;
        ctx.beginPath();
        ctx.arc(x, y, 80 + i * 20, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = selectedBrand.secondaryColor + '22';
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H * 0.6);
      ctx.lineTo(CANVAS_W, CANVAS_H * 0.3);
      ctx.lineTo(CANVAS_W, CANVAS_H);
      ctx.lineTo(0, CANVAS_H);
      ctx.fill();
    } else {
      const grad1 = ctx.createLinearGradient(0, 0, 0, CANVAS_H / 2);
      grad1.addColorStop(0, selectedBrand.primaryColor);
      grad1.addColorStop(1, selectedBrand.secondaryColor);
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H / 2);
      ctx.fillStyle = selectedBrand.backgroundColor;
      ctx.fillRect(0, CANVAS_H / 2, CANVAS_W, CANVAS_H / 2);
    }

    if (hasNoiseScanline) {
      const imageData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 30;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      ctx.putImageData(imageData, 0, 0);
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      for (let y = 0; y < CANVAS_H; y += 4) {
        ctx.fillRect(0, y, CANVAS_W, 2);
      }
    }

    ctx.font = '600 14px ' + selectedBrand.fontFamily;
    ctx.fillStyle = selectedBrand.textColor + 'AA';
    ctx.fillText(selectedBrand.logoPlaceholder, 30, 50);

    const titleY =
      generatorTitlePos === 'top' ? 160
      : generatorTitlePos === 'center' ? CANVAS_H / 2 - 40
      : CANVAS_H - 260;

    ctx.font = 'bold 42px ' + selectedBrand.fontFamily;
    ctx.fillStyle = selectedBrand.textColor;
    const titleLines = wrapText(ctx, generatorTitle, CANVAS_W - 80);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, 40, titleY + i * 52);
    });

    if (generatorSubtitle) {
      ctx.font = '300 20px ' + selectedBrand.fontFamily;
      ctx.fillStyle = selectedBrand.textColor + 'BB';
      const subY = titleY + titleLines.length * 52 + 20;
      ctx.fillText(generatorSubtitle, 40, subY);
    }

    const badgeY = CANVAS_H - 80;
    const badgeW = 200;
    const badgeH = 40;
    const badgeX = (CANVAS_W - badgeW) / 2;
    ctx.fillStyle = selectedBrand.primaryColor;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 20);
    ctx.fill();
    ctx.font = 'bold 14px system-ui';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('SAIBA MAIS', CANVAS_W / 2, badgeY + 26);
    ctx.textAlign = 'start';
  }, [generatorLayout, generatorTitle, generatorSubtitle, generatorTitlePos, hasNoiseScanline, selectedBrand]);

  const handleDownload = () => {
    const canvas = coverCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `reels-cover-${generatorBrandId}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleReset = () => {
    setGeneratorLayout('gradient');
    setGeneratorTitle('Titulo do Reels');
    setGeneratorSubtitle('Subtitulo');
    setGeneratorTitlePos('center');
    setGeneratorBgImage('');
    setHasNoiseScanline(false);
  };

  const handleAttachToCard = (cardId: string) => {
    const canvas = coverCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, artUrl: dataUrl, updatedAt: new Date().toISOString() } : c
    ));
    registerLog(cardId, 'Anexou capa de Reels gerada via Design-as-Code.');
  };

  const brandCards = cards.filter(c => c.brandId === generatorBrandId);

  return (
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>Gerador de Capas Reels</h2>
        <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'} mt-1`}>Design-as-Code engine para covers 9:16.</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Form Panel */}
        <div className="col-span-7 space-y-4">
          {/* Brand Select */}
          <div>
            <label className={`${labelCls} mb-2`}>MARCA</label>
            <div className="flex gap-2">
              {brands.map(b => (
                <button
                  key={b.id}
                  onClick={() => setGeneratorBrandId(b.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    generatorBrandId === b.id
                      ? `text-white ring-2 ring-offset-1 ${isDarkMode ? 'ring-offset-zinc-900' : 'ring-offset-white'}`
                      : inactiveBtnCls
                  }`}
                  style={generatorBrandId === b.id ? { backgroundColor: b.primaryColor } : {}}
                >
                  {b.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className={`${labelCls} mb-2`}>LAYOUT</label>
            <div className="flex gap-2">
              {LAYOUT_OPTIONS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setGeneratorLayout(l.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
                    generatorLayout === l.id ? 'bg-indigo-600 text-white' : inactiveBtnCls
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input + Presets */}
          <div>
            <label className={`${labelCls} mb-1`}>TITULO</label>
            <input type="text" value={generatorTitle} onChange={e => setGeneratorTitle(e.target.value)} className={inputCls} />
            <div className="flex gap-1 mt-2 flex-wrap">
              {TITLE_PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => setGeneratorTitle(preset)}
                  className={`${isDarkMode ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'} px-2 py-1 text-[10px] rounded transition`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className={`${labelCls} mb-1`}>SUBTITULO</label>
            <input type="text" value={generatorSubtitle} onChange={e => setGeneratorSubtitle(e.target.value)} className={inputCls} />
          </div>

          {/* Title Position */}
          <div>
            <label className={`${labelCls} mb-2`}>POSICAO DO TITULO</label>
            <div className="flex gap-2">
              {POSITION_OPTIONS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setGeneratorTitlePos(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    generatorTitlePos === p.id ? 'bg-indigo-600 text-white' : inactiveBtnCls
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Noise Toggle */}
          <div className="flex items-center gap-3">
            <label className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} text-xs font-semibold`}>NOISE / SCANLINE</label>
            <button
              onClick={() => setHasNoiseScanline(!hasNoiseScanline)}
              className={`w-10 h-5 rounded-full transition ${hasNoiseScanline ? 'bg-indigo-600' : isDarkMode ? 'bg-zinc-700' : 'bg-slate-300'} relative`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${hasNoiseScanline ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Background URL */}
          <div>
            <label className={`${labelCls} mb-1`}>IMAGEM DE FUNDO (URL)</label>
            <input type="text" value={generatorBgImage} onChange={e => setGeneratorBgImage(e.target.value)} placeholder="https://..." className={inputCls} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 flex-wrap">
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition">
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button onClick={handleReset} className={`px-4 py-2 ${isDarkMode ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'} text-sm rounded-lg transition`}>
              Reset
            </button>

            {brandCards.length > 0 && (
              <select
                onChange={e => { if (e.target.value) handleAttachToCard(e.target.value); }}
                defaultValue=""
                className={`px-3 py-2 ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-600'} border rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none`}
              >
                <option value="" disabled>Anexar a card...</option>
                {brandCards.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Canvas Preview */}
        <div className="col-span-5 flex justify-center">
          <canvas
            ref={coverCanvasRef}
            className={`rounded-xl shadow-2xl border ${isDarkMode ? 'border-zinc-700' : 'border-slate-200'}`}
            style={{ width: 270, height: 480 }}
          />
        </div>
      </div>
    </div>
  );
};
