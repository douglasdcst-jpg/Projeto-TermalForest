import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Wind, AlertTriangle, ShieldCheck, Flame, Compass, 
  Send, CheckCircle2, Clock, Filter, Eye, Layers, ChevronRight
} from 'lucide-react';
import { IncidentAlert } from '../types/thermal';

const INITIAL_ALERTS: IncidentAlert[] = [
  {
    id: 'INC-2026-089',
    timestamp: '28/10/2026 10:14',
    latitude: -3.4653,
    longitude: -62.2159,
    locationName: 'Parque Nacional do Jaú (Setor Norte)',
    peakTemp: 485.2,
    frpMW: 26.4,
    severity: 'Extrema',
    status: 'Ativo',
    brigadeDispatched: false,
    windSpeed: 24,
    windDirection: 45,
    riskScore: 94,
  },
  {
    id: 'INC-2026-088',
    timestamp: '28/10/2026 09:42',
    latitude: -3.5122,
    longitude: -62.1804,
    locationName: 'Margem do Rio Unini / Terra Indígena',
    peakTemp: 215.0,
    frpMW: 7.8,
    severity: 'Crítica',
    status: 'Investigando',
    brigadeDispatched: true,
    windSpeed: 18,
    windDirection: 60,
    riskScore: 78,
  },
  {
    id: 'INC-2026-087',
    timestamp: '28/10/2026 08:15',
    latitude: -3.6041,
    longitude: -62.3312,
    locationName: 'Reserva Extrativista Rio Negro',
    peakTemp: 98.4,
    frpMW: 1.9,
    severity: 'Moderada',
    status: 'Contido',
    brigadeDispatched: true,
    windSpeed: 12,
    windDirection: 90,
    riskScore: 42,
  },
  {
    id: 'INC-2026-086',
    timestamp: '27/10/2026 22:30',
    latitude: -3.4211,
    longitude: -62.4055,
    locationName: 'Gleba Estadual Apuí (Área de Amortecimento)',
    peakTemp: 64.2,
    frpMW: 0.6,
    severity: 'Baixa',
    status: 'Extinto',
    brigadeDispatched: true,
    windSpeed: 8,
    windDirection: 120,
    riskScore: 18,
  },
];

export const IncidentMap: React.FC = () => {
  const [alerts, setAlerts] = useState<IncidentAlert[]>(INITIAL_ALERTS);
  const [selectedAlertId, setSelectedAlertId] = useState<string>(INITIAL_ALERTS[0].id);
  const [windSpeed, setWindSpeed] = useState<number>(22);
  const [windDirection, setWindDirection] = useState<number>(45); // NE
  const [showSpreadZone, setShowSpreadZone] = useState<boolean>(true);
  const [showBufferZones, setShowBufferZones] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];

  const handleDispatchBrigade = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, brigadeDispatched: true, status: 'Investigando' } : a
      )
    );
  };

  // Render Interactive GIS Canvas Map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw Forest Canvas Background
    ctx.fillStyle = '#061a12'; // Deep canopy dark green
    ctx.fillRect(0, 0, w, h);

    // Forest canopy texture
    ctx.fillStyle = '#082419';
    for (let i = 0; i < 400; i++) {
      const rx = (i * 137) % w;
      const ry = (i * 241) % h;
      const rad = ((i % 5) + 3);
      ctx.beginPath();
      ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw Meandering River Network
    ctx.strokeStyle = '#0f3854';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, 0);
    ctx.bezierCurveTo(w * 0.3, h * 0.3, w * 0.25, h * 0.6, w * 0.55, h * 0.75);
    ctx.bezierCurveTo(w * 0.75, h * 0.85, w * 0.8, h * 0.95, w * 0.95, h);
    ctx.stroke();

    // River centerline
    ctx.strokeStyle = '#1b5a84';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 3. Draw Protected Reserve Boundary / Buffer Zone
    if (showBufferZones) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(w * 0.2, h * 0.15, w * 0.6, h * 0.7);
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.font = '10px monospace';
      ctx.fillText('PERÍMETRO DE AMORTECIMENTO (BUFFER 5KM)', w * 0.22, h * 0.18);
    }

    // Coordinates mapping for alerts on canvas
    const alertCoords: Record<string, { x: number; y: number }> = {
      'INC-2026-089': { x: w * 0.65, y: h * 0.35 },
      'INC-2026-088': { x: w * 0.5, y: h * 0.55 },
      'INC-2026-087': { x: w * 0.32, y: h * 0.7 },
      'INC-2026-086': { x: w * 0.22, y: h * 0.25 },
    };

    // 4. Draw Wind Progression Cone for Selected Alert
    if (showSpreadZone && selectedAlert) {
      const coord = alertCoords[selectedAlert.id] || { x: w * 0.5, y: h * 0.5 };
      const rad = (windDirection * Math.PI) / 180;
      const spreadDistance = windSpeed * 4.5;
      const coneAngle = 0.45; // Spread cone angle

      const p1x = coord.x + Math.sin(rad - coneAngle) * spreadDistance;
      const p1y = coord.y - Math.cos(rad - coneAngle) * spreadDistance;
      const p2x = coord.x + Math.sin(rad + coneAngle) * spreadDistance;
      const p2y = coord.y - Math.cos(rad + coneAngle) * spreadDistance;

      const grad = ctx.createRadialGradient(coord.x, coord.y, 5, coord.x, coord.y, spreadDistance);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
      grad.addColorStop(0.6, 'rgba(249, 115, 22, 0.25)');
      grad.addColorStop(1, 'rgba(234, 179, 8, 0.02)');

      ctx.beginPath();
      ctx.moveTo(coord.x, coord.y);
      ctx.lineTo(p1x, p1y);
      ctx.arc(coord.x, coord.y, spreadDistance, -Math.PI / 2 + rad - coneAngle, -Math.PI / 2 + rad + coneAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Vector Arrow indicating wind
      const arrowX = coord.x + Math.sin(rad) * (spreadDistance * 0.7);
      const arrowY = coord.y - Math.cos(rad) * (spreadDistance * 0.7);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(coord.x, coord.y);
      ctx.lineTo(arrowX, arrowY);
      ctx.stroke();
    }

    // 5. Draw Hotspot Markers
    alerts.forEach((alert) => {
      const coord = alertCoords[alert.id] || { x: w * 0.5, y: h * 0.5 };
      const isSelected = alert.id === selectedAlertId;

      // Glow effect for active alerts
      if (alert.status === 'Ativo') {
        const glow = ctx.createRadialGradient(coord.x, coord.y, 2, coord.x, coord.y, 20);
        glow.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      // Base marker ring
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, isSelected ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle =
        alert.severity === 'Extrema'
          ? '#ef4444'
          : alert.severity === 'Crítica'
          ? '#f97316'
          : alert.severity === 'Moderada'
          ? '#eab308'
          : '#38bdf8';
      ctx.fill();
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Label
      ctx.font = isSelected ? 'bold 11px monospace' : '10px monospace';
      ctx.fillStyle = isSelected ? '#ffffff' : '#e2e8f0';
      ctx.fillText(`${alert.id} (${alert.peakTemp}°C)`, coord.x + 12, coord.y + 4);
    });
  }, [alerts, selectedAlertId, windSpeed, windDirection, showSpreadZone, showBufferZones]);

  const filteredAlerts = alerts.filter(
    (a) => filterSeverity === 'all' || a.severity.toLowerCase() === filterSeverity.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
          <span>Item 4 do Requisito</span>
          <span>·</span>
          <span>Mapa Interativo & Central de Resposta</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Mapa Geoespacial de Calor, Vetores de Propagação e Gestão de Incidentes
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-4xl">
          Visualização geoespacial contínua de focos térmicos com modelo de propagação pelo vento (Modelo de Rothermel / Huygens),
          zonas de amortecimento ecológico e comando tático para despacho de brigadas florestais e drones de ataque.
        </p>
      </div>

      {/* Main Map & Incident Triage Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive GIS Map & Wind Vector Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            {/* Map Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-300">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>GIS Setor Amazônia Central (WGS84)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSpreadZone(!showSpreadZone)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                    showSpreadZone
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Cone de Vento
                </button>
                <button
                  onClick={() => setShowBufferZones(!showBufferZones)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                    showBufferZones
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Buffers 5km
                </button>
              </div>
            </div>

            {/* Canvas GIS Map Viewport */}
            <div className="relative p-2 bg-slate-950 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={640}
                height={400}
                className="w-full aspect-[16/10] object-contain rounded-lg border border-slate-800"
              />

              {/* Floating Wind Indicator HUD */}
              <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 text-xs shadow-lg space-y-1">
                <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>VETOR ATMOSFÉRICO</span>
                </div>
                <div className="font-mono text-white text-sm font-bold">
                  {windSpeed} km/h <span className="text-xs text-slate-400">· {windDirection}° (NE)</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Umidade Rel.: 32% (Alerta de Seca)
                </div>
              </div>
            </div>

            {/* Environmental & Wind Controllers */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-medium">Velocidade do Vento:</span>
                    <span className="font-mono text-amber-400 font-bold">{windSpeed} km/h</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={windSpeed}
                    onChange={(e) => setWindSpeed(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 font-medium">Direção da Rajada:</span>
                    <span className="font-mono text-cyan-400 font-bold">{windDirection}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={windDirection}
                    onChange={(e) => setWindDirection(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Incident Alert Feed & Dispatch Action (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-white">Central de Alertas em Tempo Real</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {alerts.filter((a) => a.status === 'Ativo').length} focos ativos
              </span>
            </div>

            {/* Alert List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredAlerts.map((alert) => {
                const isSelected = alert.id === selectedAlertId;
                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-slate-100 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">{alert.id}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            alert.severity === 'Extrema'
                              ? 'bg-rose-500/20 text-rose-300'
                              : alert.severity === 'Crítica'
                              ? 'bg-orange-500/20 text-orange-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">{alert.timestamp}</span>
                    </div>

                    <div className="font-medium text-slate-200 mt-1.5 line-clamp-1">
                      {alert.locationName}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                      <div>
                        <span className="text-slate-500 block text-[10px]">PICO:</span>
                        {alert.peakTemp} °C
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">FRP:</span>
                        {alert.frpMW} MW
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">RISCO:</span>
                        {alert.riskScore}/100
                      </div>
                    </div>

                    {/* Dispatch Action */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                      <span
                        className={`text-[11px] font-mono ${
                          alert.brigadeDispatched ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {alert.brigadeDispatched ? '✓ Brigada a Caminho' : 'Aguardando Despacho'}
                      </span>

                      {!alert.brigadeDispatched && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDispatchBrigade(alert.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-900 bg-rose-500 hover:bg-rose-400 rounded transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Despachar Equipe</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Catalog Checklist for App Specs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          Especificação das Telas e Recursos Essenciais para o Aplicativo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Tela 1: Mapa Interativo de Calor
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Camadas WMS/XYZ com imagens de satélite, dados vetoriais de focos em tempo quase real,
              buffers de proteção ambiental e modelagem de dispersão do fogo pelo vento.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              Tela 2: Central de Alertas e Triage
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Triagem automática por risco (FRP, proximidade de aldeias, velocidade de propagação).
              Notificações push imediatas para brigadistas e equipes de comando via WhatsApp/SMS/FCM.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Tela 3: Câmera & Drone Flyover
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Visualizador radiométrico de transmissões de drones com inspeção pontual de temperatura,
              paletas térmicas (Ironbow/White-Hot) e demarcação de Bounding Boxes.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Tela 4: Relatórios & Modo Offline
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Exportação de laudos periciais com área queimada estimada (ha), histórico temporal de focos
              e funcionamento 100% offline em campo através de PWA com sincronização automática.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
