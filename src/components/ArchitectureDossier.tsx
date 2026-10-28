import React, { useState } from 'react';
import { 
  Server, Smartphone, Cpu, Database, Network, ShieldCheck, 
  Terminal, Layers, ChevronRight, Zap, CheckCircle2, ArrowRight
} from 'lucide-react';

export const ArchitectureDossier: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stack' | 'algorithms' | 'math'>('stack');

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
          <span>Item 1 do Requisito</span>
          <span>·</span>
          <span>Engenharia de Software & IA</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Arquitetura Geral do Sistema e Algoritmos de Visão Computacional
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-4xl">
          Solução distribuída de alta disponibilidade e baixa latência, projetada para monitoramento contínuo de florestas densas.
          Combina processamento radiométrico clássico determinístico com redes neurais profundas para eliminação de falsos positivos
          e operação offline em áreas remotas.
        </p>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
          {[
            { id: 'stack', label: 'Stack Tecnológica (Front & Back)' },
            { id: 'algorithms', label: 'Algoritmos de IA & Visão Computacional' },
            { id: 'math', label: 'Equações Físicas & Modelagem Térmica' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                  : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Stack Tecnológica */}
      {activeTab === 'stack' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Front-End Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-white font-semibold">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Front-End (Web & Mobile PWA)</h3>
                  <span className="text-[11px] text-slate-500 font-mono">React / Next.js / PWA</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interface unificada responsiva e instalável em campo por brigadistas sem internet.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>MapLibre GL / Leaflet:</strong> Renderização vetorial e raster de camadas GIS com GeoJSON e COG (Cloud-Optimized GeoTIFF).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>HTML5 Canvas / WebGL:</strong> Colorização em tempo real de matrizes térmicas brutas (Ironbow, White-Hot) a 60 FPS.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Dexie.js / IndexedDB:</strong> Sincronização offline-first para equipes de solo registrarem contenção sem sinal de torre.</span>
                </li>
              </ul>
            </div>

            {/* Back-End Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-white font-semibold">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Back-End & Processamento Geo</h3>
                  <span className="text-[11px] text-slate-500 font-mono">Python FastAPI / Celery / Kafka</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Motor assíncrono de alto rendimento especializado em manipulação de rasters orbitais e telemetria de drones.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>FastAPI (Python 3.11+):</strong> Endpoints REST/GeoJSON ultrarrápidos e WebSockets para streaming de alertas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>GDAL, Rasterio & Shapely:</strong> Reprojeção cartográfica (WGS84 para UTM SIRGAS 2000), recorte e fusão de bandas térmicas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Celery + Redis / Apache Kafka:</strong> Fila distribuída de processamento para ingestão simultânea de satélites e drones.</span>
                </li>
              </ul>
            </div>

            {/* Storage & DB Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-white font-semibold">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Armazenamento Geoespacial</h3>
                  <span className="text-[11px] text-slate-500 font-mono">PostGIS / MinIO S3 / Redis</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Banco relacional espacial e storage de objetos nativo para dados raster e telemetria temporal.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>PostgreSQL + PostGIS:</strong> Consultas de proximidade espacial (<code className="text-amber-300">ST_DWithin</code>, <code className="text-amber-300">ST_Intersects</code> com Terras Indígenas e UCs).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>AWS S3 / MinIO:</strong> Repositório de imagens brutas RJPEG/TIFF térmicos comprimidos sem perda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Redis TimeSeries:</strong> Armazenamento volátil em memória dos focos ativos das últimas 48 horas.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Architecture Dataflow Flowchart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-amber-400" />
              Fluxo Arquitetural de Dados (End-to-End)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="font-mono text-[10px] text-amber-400 uppercase font-bold">1. Ingestão</div>
                <div className="font-semibold text-slate-200 mt-1">Fontes Sensores</div>
                <p className="text-slate-400 text-[11px] mt-1">Drones (MQTT/4G) + Satélites INPE/NASA (Webhooks/S3).</p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="font-mono text-[10px] text-cyan-400 uppercase font-bold">2. Pré-processamento</div>
                <div className="font-semibold text-slate-200 mt-1">Calibração Radiométrica</div>
                <p className="text-slate-400 text-[11px] mt-1">Conversão DN → Radiância → Kelvin/Celsius via Lei de Planck.</p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="font-mono text-[10px] text-rose-400 uppercase font-bold">3. Inferência CV/IA</div>
                <div className="font-semibold text-slate-200 mt-1">Detecção & Filtro</div>
                <p className="text-slate-400 text-[11px] mt-1">Otsu dinâmico + Modelo Contextual + YOLOv8-Thermal.</p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="font-mono text-[10px] text-emerald-400 uppercase font-bold">4. Indexação GIS</div>
                <div className="font-semibold text-slate-200 mt-1">Poligonização PostGIS</div>
                <p className="text-slate-400 text-[11px] mt-1">Cálculo de BBox, área (ha), FRP (MW) e cruzamento territorial.</p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <div className="font-mono text-[10px] text-purple-400 uppercase font-bold">5. Dispersão</div>
                <div className="font-semibold text-slate-200 mt-1">Alertas em Tempo Real</div>
                <p className="text-slate-400 text-[11px] mt-1">WebSockets no painel Web + Push Notification aos brigadistas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Algoritmos de IA & CV */}
      {activeTab === 'algorithms' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Algorithm 1: Contextual Fire Detection */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 font-semibold uppercase">Padrão OMM / NASA / INPE</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">DETERMINÍSTICO</span>
              </div>
              <h3 className="text-base font-bold text-white">Algoritmo Contextual de Detecção de Fogo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Algoritmo padrão ouro da ciência de sensoriamento remoto para sensores MODIS, VIIRS e GOES-16. 
                Em vez de usar um limiar de corte estático (que falha devido à variação sazonal da floresta), 
                ele examina uma janela deslizante (ex: 21×21 pixels em torno do candidato).
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-slate-500">// Critério de Ativação do Foco:</div>
                <div>T_pixel &gt; Média_fundo + 3.0 · DesvioPadrão_fundo</div>
                <div>ΔT(MIR - TIR) &gt; ΔT_médio_fundo + 3.0 · DesvioPadrão_ΔT</div>
                <div>T_pixel &gt; 310 K (36.85°C) no Infravermelho Médio (3.9µm)</div>
              </div>
              <p className="text-xs text-slate-400">
                <strong>Vantagem em florestas densas:</strong> Como a copa florestal úmida possui desvio padrão térmico muito baixo (0.8°C a 1.5°C), 
                qualquer pequeno foco sub-bosque que eleve o dossel em 4°C a 6°C gera um Z-score altíssimo (&gt; 4.0), disparando a detecção com precisão.
              </p>
            </div>

            {/* Algorithm 2: YOLOv8 / YOLOv11 Thermal */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">Redes Neurais Convolucionais</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">DEEP LEARNING</span>
              </div>
              <h3 className="text-base font-bold text-white">YOLOv8-Thermal / YOLOv11 Especializado</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rede neural de detecção de objetos de estágio único adaptada para tensores de 1 ou 4 canais 
                (LWIR monocromático de 14-bit ou fusão RGB + Térmico com alinhamento por homografia).
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-slate-500">// Classes de Classificação do Modelo:</div>
                <div>[0] Foco_Incêndio_Ativo (Chamas abertas)</div>
                <div>[1] Brasa_Subbosque (Smoldering / Fumaça quente)</div>
                <div>[2] Falso_Positivo_Rocha (Solo aquecido por radiação solar)</div>
                <div>[3] Falso_Positivo_Gado/Veículo (Corpos biológicos ou motores)</div>
              </div>
              <p className="text-xs text-slate-400">
                <strong>Vantagem em drones:</strong> Consegue discriminar pelo formato morfológico e contexto textural se a anomalia 
                é uma clareira com pedras quentes ou uma brasa real prestes a deflagrar a vegetação.
              </p>
            </div>

            {/* Algorithm 3: Autoencoders Convolucionais */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 font-semibold uppercase">Não-supervisionado</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">AUTOENCODER</span>
              </div>
              <h3 className="text-base font-bold text-white">Autoencoders Convolucionais para Anomalias</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Em florestas primárias intocadas, dados anotados de incêndio podem ser escassos. 
                Treina-se um autoencoder apenas com imagens normais da copa florestal sadia e fresca.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
                <div>Erro de Reconstrução: Anomalia(x, y) = || X - f_dec(f_enc(X)) ||²</div>
                <div className="text-slate-500">// Onde a rede não consegue reconstruir o padrão frio,</div>
                <div className="text-slate-500">// o erro explode: destaca anomalias térmicas invisíveis.</div>
              </div>
              <p className="text-xs text-slate-400">
                Perfeito para detectar início de combustão espontânea em turfeiras e matéria orgânica úmida sob o dossel.
              </p>
            </div>

            {/* Algorithm 4: Morfologia Matemática & Otsu */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-semibold uppercase">OpenCV / NumPy</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">BAIXA LATÊNCIA</span>
              </div>
              <h3 className="text-base font-bold text-white">Morfologia Matemática & Análise de Contornos</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operações de erosão e dilatação espacial (<code className="text-amber-300">cv2.morphologyEx</code> com kernel elíptico 3×3 ou 5×5)
                eliminam ruídos térmicos de pixel isolado (salt-and-pepper) gerados por reflexos solares ou sensores não resfriados (microbolômetros).
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
                <div>Máscara_Limpa = Dilation(Erosion(Máscara_Binária, K), K)</div>
                <div>Contornos, BBoxes = cv2.findContours(Máscara_Limpa)</div>
                <div>Filtro: Área_Contorno &gt; Min_Pixels && FRP &gt; 0.1 MW</div>
              </div>
              <p className="text-xs text-slate-400">
                Execução em menos de <strong>3 milissegundos</strong> por frame de 640×512, viabilizando execução em tempo real na própria borda (Edge AI onboard no drone).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Modelagem Física */}
      {activeTab === 'math' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white">Modelagem Físico-Matemática da Radiação Térmica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <span className="font-mono text-amber-400 font-bold uppercase">1. Inversão da Lei de Planck (Radiância → Temperatura)</span>
                <p className="text-slate-400">
                  Os sensores térmicos captam radiância espectral $L_\lambda$ no comprimento de onda do infravermelho termal ($\approx 10.8\mu m$ a $12\mu m$).
                  A temperatura de brilho $T_B$ em Kelvin é obtida isolando $T$:
                </p>
                <div className="bg-slate-900 p-2.5 rounded font-mono text-cyan-300 text-center my-2">
                  T_B = c₂ / [ λ · ln( 1 + (c₁ / (λ⁵ · L_λ)) ) ]
                </div>
                <p className="text-[11px] text-slate-500">
                  Onde $c_1 = 1.191 \times 10^8 W \cdot \mu m^4 \cdot m^{-2} \cdot sr^{-1}$ e $c_2 = 1.439 \times 10^4 \mu m \cdot K$.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <span className="font-mono text-rose-400 font-bold uppercase">2. Potência Radiativa do Fogo (FRP - Fire Radiative Power)</span>
                <p className="text-slate-400">
                  Calcula a taxa de energia térmica liberada pela queima de biomassa viva em MegaWatts (MW).
                  Formulação empírica de Wooster (2003) para sensores no infravermelho médio (MIR ~ 4µm):
                </p>
                <div className="bg-slate-900 p-2.5 rounded font-mono text-rose-300 text-center my-2">
                  FRP = (A_pixel / a) · (L_MIR,fogo - L_MIR,fundo)
                </div>
                <p className="text-[11px] text-slate-500">
                  Permite estimar diretamente a taxa de queima de biomassa seca (kg/s) e emissão de CO₂ atmosférico.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
