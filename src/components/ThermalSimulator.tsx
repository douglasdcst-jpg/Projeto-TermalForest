import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, RotateCcw, Sliders, Eye, EyeOff, Crosshair, 
  Flame, AlertTriangle, ShieldCheck, Info, Sparkles,
  Maximize2, Activity, ZoomIn
} from 'lucide-react';
import { ColorPalette, Hotspot, ThermalPreset, ThresholdMethod } from '../types/thermal';
import { generateThermalMatrix, getPaletteColor, processThermalAnomalies } from '../utils/thermalMath';

const PRESETS: ThermalPreset[] = [
  {
    id: 'amazon_subcanopy',
    name: 'Amazônia: Focos Sub-bosque Encobertos',
    description: 'Dossel denso (23°C) com focos de calor ocultos sob a copa das árvores (70°C a 230°C). Alta dificuldade de detecção em bandas visuais.',
    resolution: [360, 240],
    sensorType: 'Dossel Sub-bosque Amazônico',
    groundSamplingDistance: 0.5,
    ambientTemp: 23.5,
    hotspotCount: 5,
  },
  {
    id: 'active_front_river',
    name: 'Frente de Fogo Ativa com Barreira Fluvial',
    description: 'Linha de fogo vigorosa (até 520°C) avançando em direção ao rio (20°C). Pluma térmica convectiva e ventos moderados.',
    resolution: [360, 240],
    sensorType: 'Sentinel-2 SWIR/TIRS',
    groundSamplingDistance: 2.0,
    ambientTemp: 25.0,
    hotspotCount: 5,
  },
  {
    id: 'drone_inspection',
    name: 'Drone FLIR Boson Radiométrico (UAV 120m)',
    description: 'Voo tático de drone sobre copa florestal. Alta resolução espacial (GSD 0.15m), permitindo isolar brasas individuais e início de queimadas.',
    resolution: [360, 240],
    sensorType: 'Drone FLIR Radiométrico',
    groundSamplingDistance: 0.15,
    ambientTemp: 26.0,
    hotspotCount: 4,
  },
  {
    id: 'orbital_viirs',
    name: 'Macro-sensoriamento Orbital (VIIRS NRT)',
    description: 'Detecção em larga escala com sensor VIIRS 375m (bandas térmicas I4 3.74µm e I5 11.45µm) calculando FRP e anomalias de fundo.',
    resolution: [360, 240],
    sensorType: 'VIIRS NRT 375m',
    groundSamplingDistance: 15.0,
    ambientTemp: 24.5,
    hotspotCount: 2,
  },
];

export const ThermalSimulator: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<ThermalPreset>(PRESETS[0]);
  const [palette, setPalette] = useState<ColorPalette>('ironbow');
  const [thresholdMethod, setThresholdMethod] = useState<ThresholdMethod>('contextual');
  const [customThreshold, setCustomThreshold] = useState<number>(65);
  const [minContourPixels, setMinContourPixels] = useState<number>(6);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showMaskOnly, setShowMaskOnly] = useState<boolean>(false);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  // Probe hovering state
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate matrix based on preset
  const [matrixData, setMatrixData] = useState(() => {
    return generateThermalMatrix(PRESETS[0].resolution[0], PRESETS[0].resolution[1], PRESETS[0].id);
  });

  const handlePresetChange = (preset: ThermalPreset) => {
    setSelectedPreset(preset);
    setSelectedHotspotId(null);
    setHoverCoord(null);
    const newData = generateThermalMatrix(preset.resolution[0], preset.resolution[1], preset.id);
    setMatrixData(newData);
  };

  const regenerateData = () => {
    const newData = generateThermalMatrix(selectedPreset.resolution[0], selectedPreset.resolution[1], selectedPreset.id);
    setMatrixData(newData);
    setSelectedHotspotId(null);
  };

  // Run CV anomaly detection algorithm
  const cvResults = useMemo(() => {
    const [w, h] = selectedPreset.resolution;
    return processThermalAnomalies(matrixData.matrix, w, h, {
      thresholdMethod,
      customThresholdC: customThreshold,
      minContourPixels,
      ambientTemp: matrixData.ambientTemp,
      gsdMeters: selectedPreset.groundSamplingDistance,
    });
  }, [matrixData, selectedPreset, thresholdMethod, customThreshold, minContourPixels]);

  // Render canvas whenever matrix, palette, mask, or display options change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const [w, h] = selectedPreset.resolution;
    canvas.width = w;
    canvas.height = h;

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;
    const { matrix, minTemp, maxTemp } = matrixData;
    const range = Math.max(1, maxTemp - minTemp);
    const { mask } = cvResults;

    for (let i = 0; i < w * h; i++) {
      const pIdx = i * 4;

      if (showMaskOnly) {
        // Binary Mask visualization
        const isHot = mask[i] === 255;
        data[pIdx] = isHot ? 255 : 15;
        data[pIdx + 1] = isHot ? 60 : 23;
        data[pIdx + 2] = isHot ? 20 : 42;
        data[pIdx + 3] = 255;
      } else {
        // Radiometric pseudocolor
        const temp = matrix[i];
        const normalized = (temp - minTemp) / range;
        const [r, g, b] = getPaletteColor(normalized, palette);

        data[pIdx] = r;
        data[pIdx + 1] = g;
        data[pIdx + 2] = b;
        data[pIdx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Overlay Bounding Boxes and Labels if enabled
    if (showBoundingBoxes) {
      cvResults.hotspots.forEach((hs) => {
        const isSelected = hs.id === selectedHotspotId;

        // Bounding Box stroke
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        if (hs.severity === 'Extrema') {
          ctx.strokeStyle = isSelected ? '#ffffff' : '#ef4444'; // Red
        } else if (hs.severity === 'Crítica') {
          ctx.strokeStyle = isSelected ? '#ffffff' : '#f97316'; // Orange
        } else if (hs.severity === 'Moderada') {
          ctx.strokeStyle = isSelected ? '#ffffff' : '#eab308'; // Yellow
        } else {
          ctx.strokeStyle = isSelected ? '#ffffff' : '#38bdf8'; // Blue
        }

        ctx.strokeRect(hs.x - 1, hs.y - 1, hs.width + 2, hs.height + 2);

        // Centroid Crosshair
        const cx = hs.x + hs.width / 2;
        const cy = hs.y + hs.height / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();

        // Label above bbox
        const labelText = `${hs.id}: ${hs.peakTemp}°C`;
        ctx.font = 'bold 9px monospace';
        const textWidth = ctx.measureText(labelText).width;
        
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.fillRect(hs.x - 1, Math.max(0, hs.y - 13), textWidth + 6, 11);
        
        ctx.fillStyle = isSelected ? '#38bdf8' : '#f8fafc';
        ctx.fillText(labelText, hs.x + 2, Math.max(9, hs.y - 4));
      });
    }

    // Overlay hovering probe crosshair if inside canvas
    if (hoverCoord) {
      const { x, y } = hoverCoord;
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [matrixData, selectedPreset, palette, showMaskOnly, showBoundingBoxes, cvResults, selectedHotspotId, hoverCoord]);

  // Handle Canvas mouse move for radiometric probe
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      setHoverCoord({ x, y });
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoverCoord(null);
  };

  // Inspect hovered pixel stats
  const hoveredStats = useMemo(() => {
    if (!hoverCoord) return null;
    const { x, y } = hoverCoord;
    const [w] = selectedPreset.resolution;
    const idx = y * w + x;
    const temp = matrixData.matrix[idx] || 0;
    const delta = temp - matrixData.ambientTemp;
    
    // Convert to Radiance approximation via Planck law / 14-bit DN (Digital Number)
    const rawDN = Math.round(8192 + (temp + 50) * 80);

    let classification = 'Dossel Vegetativo Frio';
    if (temp >= 250) classification = 'Incêndio Ativo de Copa (Fogo em Linha)';
    else if (temp >= 120) classification = 'Anomalia Térmica Sub-bosque / Brasas';
    else if (temp >= 60) classification = 'Foco Quente Inicial / Aquecimento Local';
    else if (temp >= 35) classification = 'Superfície Exposta / Rocha / Solo Seco';
    else if (temp <= 22) classification = 'Corpo Hídrico (Rio / Lago)';

    return {
      x,
      y,
      temp: Math.round(temp * 10) / 10,
      tempK: Math.round((temp + 273.15) * 10) / 10,
      delta: Math.round(delta * 10) / 10,
      rawDN,
      classification,
    };
  }, [hoverCoord, matrixData, selectedPreset]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Scenario Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Módulo de Visão Computacional</span>
              <span>·</span>
              <span>Pipeline Radiométrico & Segmentação</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Processador de Matrizes Térmicas e Detecção de Anomalias
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Simule a análise de imagens infravermelhas termais (LWIR / MWIR) obtidas por drones ou sensores orbitais.
              O algoritmo aplica modelagem estatística de fundo (Contextual FIRMS/INPE), limiarização dinâmica,
              filtros morfológicos contra ruído térmico e extrai delimitadores visuais (bounding boxes) com cálculo de Potência Radiativa (FRP).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={regenerateData}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerar Ruído Térmico</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800/80">
          {PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPreset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/70 hover:border-slate-700 hover:bg-slate-800/30'
                }`}
              >
                <div className="text-xs font-semibold text-slate-200 line-clamp-1">{preset.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.description}</div>
                <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-500">
                  <span>GSD: {preset.groundSamplingDistance}m</span>
                  <span>·</span>
                  <span>Fundo: {preset.ambientTemp}°C</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio: Canvas Viewport & CV Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Thermal Canvas Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            {/* Canvas Toolbar Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/60 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-300">Visualizador Radiométrico</span>
                <span className="text-slate-600">|</span>
                <span className="font-mono text-slate-400">
                  {selectedPreset.resolution[0]} × {selectedPreset.resolution[1]} px
                </span>
                <span className="text-slate-600">|</span>
                <span className="font-mono text-amber-400">
                  {cvResults.hotspots.length} focos detectados
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                    showBoundingBoxes
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Alternar Bounding Boxes"
                >
                  {showBoundingBoxes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>Bounding Boxes</span>
                </button>

                <button
                  onClick={() => setShowMaskOnly(!showMaskOnly)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                    showMaskOnly
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Ver Máscara Binária Segmentada"
                >
                  <Activity className="w-3 h-3" />
                  <span>{showMaskOnly ? 'Máscara Ativa' : 'Matriz Termal'}</span>
                </button>
              </div>
            </div>

            {/* Canvas Stage */}
            <div className="relative p-2 bg-slate-950 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
                className="w-full aspect-[3/2] max-h-[460px] object-contain rounded-lg border border-slate-800 cursor-crosshair shadow-inner"
              />

              {/* Floating Probe HUD in Top-Right Corner */}
              {hoveredStats && (
                <div className="absolute top-4 right-4 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 text-xs shadow-2xl pointer-events-none space-y-1.5 min-w-[210px]">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] border-b border-slate-800 pb-1">
                    <span className="flex items-center gap-1">
                      <Crosshair className="w-3 h-3 text-cyan-400" />
                      SONDA TÉRMICA
                    </span>
                    <span>X: {hoveredStats.x} · Y: {hoveredStats.y}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-400">Temperatura:</span>
                    <span className="font-mono text-base font-bold text-amber-400">
                      {hoveredStats.temp} °C
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Absoluta: {hoveredStats.tempK} K</span>
                    <span className="text-cyan-400 font-semibold">Δ +{hoveredStats.delta}°C</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>RAW DN: {hoveredStats.rawDN}</span>
                    <span>14-bit FLIR</span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-300 pt-1 border-t border-slate-800/80">
                    {hoveredStats.classification}
                  </div>
                </div>
              )}
            </div>

            {/* Color Ramp Scale Bar */}
            <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">Escala Térmica:</span>
                <span className="font-mono text-slate-300">{Math.round(matrixData.minTemp)}°C</span>
              </div>
              
              {/* Dynamic Gradient Bar */}
              <div className="flex-1 mx-4 h-3 rounded-sm border border-slate-800 relative overflow-hidden">
                <div 
                  className="w-full h-full"
                  style={{
                    background: palette === 'ironbow'
                      ? 'linear-gradient(to right, rgb(0,5,50), rgb(150,15,150), rgb(245,115,10), rgb(255,240,150), rgb(255,255,255))'
                      : palette === 'inferno'
                      ? 'linear-gradient(to right, #000004, #57106e, #bb3754, #f98e09, #fcffa4)'
                      : palette === 'whiteHot'
                      ? 'linear-gradient(to right, #000000, #ffffff)'
                      : palette === 'blackHot'
                      ? 'linear-gradient(to right, #ffffff, #000000)'
                      : 'linear-gradient(to right, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)'
                  }}
                />
                {/* Marker for effective threshold */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow"
                  style={{
                    left: `${Math.min(100, Math.max(0, ((cvResults.computedThreshold - matrixData.minTemp) / (matrixData.maxTemp - matrixData.minTemp)) * 100))}%`
                  }}
                  title={`Limiar de corte: ${cvResults.computedThreshold}°C`}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-amber-400 font-semibold">{Math.round(matrixData.maxTemp)}°C</span>
              </div>
            </div>
          </div>

          {/* KPI Telemetry Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Focos Detectados</div>
              <div className="text-2xl font-mono font-bold text-white mt-1">
                {cvResults.hotspots.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {cvResults.hotspots.filter(h => h.severity === 'Extrema' || h.severity === 'Crítica').length} de alta prioridade
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Pico Térmico</div>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                {cvResults.stats.maxTemp} <span className="text-sm font-normal text-slate-400">°C</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Δ +{(cvResults.stats.maxTemp - matrixData.ambientTemp).toFixed(1)}°C sobre o fundo
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Potência Radiativa (FRP)</div>
              <div className="text-2xl font-mono font-bold text-rose-400 mt-1">
                {cvResults.stats.totalFrpMW} <span className="text-sm font-normal text-slate-400">MW</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Stefan-Boltzmann / Wooster
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Área Afetada Est.</div>
              <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
                {cvResults.stats.totalHotspotAreaHa} <span className="text-sm font-normal text-slate-400">ha</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {(cvResults.stats.totalHotspotAreaHa * 10000).toLocaleString('pt-BR')} m² mapeados
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CV Controls & Hotspot List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Algorithm & Pipeline Parameters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Parâmetros do Pipeline de IA & CV</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">OpenCV / NumPy</span>
            </div>

            {/* Colormap Palette Selector */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Paleta Termográfica (Pseudocolor)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'ironbow', label: 'Ironbow (FLIR)' },
                  { id: 'inferno', label: 'Inferno' },
                  { id: 'whiteHot', label: 'White-Hot' },
                  { id: 'blackHot', label: 'Black-Hot' },
                  { id: 'rainbow', label: 'Rainbow HC' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPalette(p.id as ColorPalette)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      palette === p.id
                        ? 'bg-slate-800 text-amber-400 border-amber-500/50 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thresholding Method Selector */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Método de Detecção de Anomalias
              </label>
              <div className="space-y-1.5">
                {[
                  {
                    id: 'contextual',
                    title: 'Contextual Estatístico (Padrão INPE / FIRMS)',
                    desc: 'Limiar dinâmico: T_foco > Média_fundo + 3.2 · σ_fundo. Rejeita aquecimento solar de solo.',
                  },
                  {
                    id: 'otsu',
                    title: 'Otsu Dinâmico Bimodal',
                    desc: 'Calcula a variância interclasses ótima separando fundo florestal frio e frentes quentes.',
                  },
                  {
                    id: 'anomaly',
                    title: 'Anomalia Estatística Extrema (Z-Score > 4.0)',
                    desc: 'Sensibilidade estrita para ignorar ruído de sensor e focar apenas em frentes descontroladas.',
                  },
                  {
                    id: 'absolute',
                    title: 'Limiar Manual Fixo (°C)',
                    desc: 'Permite calibrar ponto de corte empírico com o controle deslizante abaixo.',
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setThresholdMethod(m.id as ThresholdMethod)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                      thresholdMethod === m.id
                        ? 'bg-amber-500/10 border-amber-500/50 text-slate-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-slate-200 flex items-center justify-between">
                      <span>{m.title}</span>
                      {thresholdMethod === m.id && (
                        <span className="text-[10px] font-mono text-amber-400">Ativo</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Threshold Slider (if absolute or visual tuning) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Limiar de Temperatura Efetivo:</span>
                <span className="font-mono text-amber-400 font-bold">{cvResults.computedThreshold} °C</span>
              </div>
              <input
                type="range"
                min="35"
                max="250"
                step="1"
                value={customThreshold}
                onChange={(e) => {
                  setCustomThreshold(Number(e.target.value));
                  if (thresholdMethod !== 'absolute') {
                    setThresholdMethod('absolute');
                  }
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>35°C (Sensível)</span>
                <span>Média Fundo: {cvResults.stats.mean}°C</span>
                <span>250°C (Restritivo)</span>
              </div>
            </div>

            {/* Min Contour Pixel Size */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Filtro de Área Mínima (Falso Positivo):</span>
                <span className="font-mono text-slate-300">{minContourPixels} pixels</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={minContourPixels}
                onChange={(e) => setMinContourPixels(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400 mt-1">
                Rejeita reflexos especulares solares e ruídos térmicos de pixel isolado via morfologia matemática (Abertura 3×3).
              </div>
            </div>
          </div>

          {/* Detected Hotspots List Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Anomalias Delimitadas (Tabela de Focos)</h3>
              <span className="text-xs text-slate-400 font-mono">
                {cvResults.hotspots.length} polígonos
              </span>
            </div>

            {cvResults.hotspots.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Nenhum foco de calor detectado acima do limiar atual de {cvResults.computedThreshold}°C.
                Experimente reduzir o limiar ou trocar o cenário.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {cvResults.hotspots.map((hs) => {
                  const isSelected = selectedHotspotId === hs.id;
                  return (
                    <div
                      key={hs.id}
                      onClick={() => setSelectedHotspotId(isSelected ? null : hs.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-slate-100 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">{hs.id}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              hs.severity === 'Extrema'
                                ? 'bg-rose-500/20 text-rose-300'
                                : hs.severity === 'Crítica'
                                ? 'bg-orange-500/20 text-orange-300'
                                : hs.severity === 'Moderada'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-sky-500/20 text-sky-300'
                            }`}
                          >
                            {hs.severity}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-slate-100">{hs.peakTemp} °C</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-2 pt-1.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                        <div>
                          <span className="text-slate-500 block text-[10px]">BBOX:</span>
                          [{hs.x},{hs.y},{hs.width},{hs.height}]
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">FRP:</span>
                          {hs.frpMW} MW
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">CONFIANÇA:</span>
                          {hs.confidence}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
