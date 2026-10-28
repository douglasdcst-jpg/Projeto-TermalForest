import React, { useState } from 'react';
import { 
  Radio, Satellite, Plane, Database, Clock, RefreshCw, 
  ExternalLink, Layers, ShieldCheck, ArrowRight, Check, AlertCircle
} from 'lucide-react';
import { SatelliteSource } from '../types/thermal';

const SATELLITE_SOURCES: SatelliteSource[] = [
  {
    id: 'inpe',
    name: 'INPE BDQueimadas (Brasil)',
    agency: 'Instituto Nacional de Pesquisas Espaciais',
    resolution: '375m a 2km (Órbita e Geoestacionário)',
    latency: '15 min (GOES-16) / 2h (Órbita Polar)',
    bands: 'GOES-16 ABI (Banda 7 3.9µm / Banda 14 11.2µm), AQUA/TERRA MODIS, NOAA-20',
    idealUse: 'Monitoramento nacional de referência oficial no Brasil, geração de estatísticas e séries históricas.',
    dataFormat: 'GeoJSON, Shapefile, WFS, CSV e API REST',
    coverage: 'América do Sul e Brasil com foco em Amazônia, Cerrado e Pantanal',
  },
  {
    id: 'firms',
    name: 'NASA FIRMS NRT (LANCE)',
    agency: 'NASA EOSDIS',
    resolution: '375m (VIIRS I-Bands) / 1km (MODIS)',
    latency: '60 a 180 minutos após passagem orbital',
    bands: 'VIIRS I4 (3.74µm MWIR) e I5 (11.45µm LWIR)',
    idealUse: 'Detecção de focos ativos com alta resolução e cálculo padronizado de Potência Radiativa (FRP).',
    dataFormat: 'API REST NRT, GeoJSON, KML, WMS/WMTS',
    coverage: 'Global contínuo (2 passagens diárias por satélite polar)',
  },
  {
    id: 'sentinel',
    name: 'Copernicus Sentinel-2 MSI',
    agency: 'ESA (European Space Agency)',
    resolution: '20 metros (Bandas SWIR) / 10 metros (VNIR)',
    latency: '2 a 6 horas após aquisição (Revisita a cada 5 dias)',
    bands: 'B12 (2190nm SWIR2), B11 (1610nm SWIR1), B8A (865nm NIR)',
    idealUse: 'Mapeamento de alta precisão do perímetro cicatricial, frentes de fogo e índice de severidade de queima (dNBR).',
    dataFormat: 'Cloud-Optimized GeoTIFF (COG), SAFE, STAC API',
    coverage: 'Global terrestre',
  },
  {
    id: 'landsat',
    name: 'Landsat 8/9 TIRS (Thermal)',
    agency: 'USGS / NASA',
    resolution: '100m (Sensor TIRS reamostrado para 30m)',
    latency: '4 a 12 horas (Revisita a cada 8 dias)',
    bands: 'Banda 10 (10.6µm a 11.19µm LWIR)',
    idealUse: 'Mapeamento térmico absoluto calibrado e estudos científicos de temperatura de superfície (LST).',
    dataFormat: 'GeoTIFF Level-1 / Level-2 Surface Temperature',
    coverage: 'Global contínuo',
  },
  {
    id: 'drones',
    name: 'Drones & UAVs (FLIR Boson / Zenmuse H20T)',
    agency: 'Operação Tática Local / Brigadas',
    resolution: '5cm a 20cm por pixel (GSD)',
    latency: '< 50 milissegundos (Processamento Edge AI)',
    bands: 'LWIR 7.5µm a 13.5µm (Microbolômetro não resfriado)',
    idealUse: 'Inspeção tática de frentes ativas sob copa densa, guiagem de equipes de combate e eliminação de reignições.',
    dataFormat: 'Radiometric RJPEG, TIFF 14/16-bit, RTSP/H.264 stream',
    coverage: 'Raio tático de 5 a 15 km por missão de voo',
  },
];

export const DataSourcesPipeline: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<SatelliteSource>(SATELLITE_SOURCES[0]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
          <span>Item 2 do Requisito</span>
          <span>·</span>
          <span>Sensoriamento Remoto & Ingestão NRT</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Fontes de Dados de Satélite, Drones e Pipeline de Ingestão em Tempo Quase Real
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-4xl">
          Estratégia integrada de sensoriamento multinível: macro-monitoramento orbital de alta frequência (INPE / FIRMS)
          combinado com detalhamento de média resolução (Sentinel-2) e resposta tática de altíssima resolução via drones térmicos (FLIR/UAV).
        </p>
      </div>

      {/* Satellite Sources Cards & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            Sensores & Plataformas de Monitoramento
          </h3>
          {SATELLITE_SOURCES.map((source) => {
            const isSelected = selectedSource.id === source.id;
            const isDrone = source.id === 'drones';
            return (
              <div
                key={source.id}
                onClick={() => setSelectedSource(source)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isDrone ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {isDrone ? <Plane className="w-4 h-4" /> : <Satellite className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{source.name}</h4>
                      <span className="text-[10px] text-slate-500">{source.agency}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                    {source.resolution.split('(')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Source Deep-Dive (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs font-mono text-amber-400">{selectedSource.agency}</div>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedSource.name}</h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                {selectedSource.dataFormat.split(',')[0]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Resolução Espacial</span>
                <span className="font-semibold text-slate-200 mt-1 block">{selectedSource.resolution}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Latência de Ingestão</span>
                <span className="font-semibold text-amber-400 mt-1 block">{selectedSource.latency}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <strong className="text-slate-400 block text-[11px] uppercase font-mono mb-1">Bandas Espectrais & Comprimentos de Onda:</strong>
                <p className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-cyan-300">
                  {selectedSource.bands}
                </p>
              </div>

              <div>
                <strong className="text-slate-400 block text-[11px] uppercase font-mono mb-1">Aplicação Recomendada no App:</strong>
                <p className="text-slate-300 leading-relaxed">
                  {selectedSource.idealUse}
                </p>
              </div>

              <div>
                <strong className="text-slate-400 block text-[11px] uppercase font-mono mb-1">Área de Cobertura:</strong>
                <p className="text-slate-400">
                  {selectedSource.coverage}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Near Real Time Ingestion Pipeline Architecture Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div>
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">Especificação de Engenharia</div>
          <h3 className="text-base font-bold text-white mt-0.5">
            Estruturação do Pipeline de Ingestão NRT (Near Real-Time)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Como processar terabytes de imagens orbitais e transmissões de drones com latência de ponta a ponta inferior a 3 minutos.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              step: '01',
              title: 'Ingestão e Desacoplamento Assíncrono (Event-Driven)',
              desc: 'Poller em workers Celery ou webhooks S3 conectados aos serviços LANCE da NASA e APIs do INPE. Transmissões de drones utilizam protocolo MQTT sobre rede celular 4G ou Starlink para streaming de telemetria e imagens térmicas brutas.',
              tech: 'AWS S3 Events / Apache Kafka / MQTT Broker Mosquitto',
            },
            {
              step: '02',
              title: 'Calibração Radiométrica e Normalização Atmosférica',
              desc: 'Conversão dos números digitais brutos (DN 14-bit ou 16-bit) para radiância no topo da atmosfera (TOA) e temperatura de brilho em Kelvin / Celsius via inversão da equação de Planck e correção da emissividade da biomassa florestal (ε ≈ 0.95 - 0.98).',
              tech: 'Python NumPy / Rasterio / GDAL C-Bindings',
            },
            {
              step: '03',
              title: 'Máscara de Nuvens, Corpos Hídricos e Rejeição Solar',
              desc: 'Filtros prévios removem pixels encobertos por nuvens densas (bandas visuais/cirrus), máscaras hidrológicas pré-compiladas (HydroSHEDS) ignoram margens de rios e testes de ângulo zenital solar descartam reflexos solares em superfícies minerais.',
              tech: 'Shapely Polygons / SciPy / Normalized Difference Water Index (NDWI)',
            },
            {
              step: '04',
              title: 'Motor de Detecção de Anomalias & Bounding Box',
              desc: 'Execução do algoritmo contextual (comparação da janela móvel 21x21 com o dossel circundante) seguido de inferência YOLOv8-Thermal para validação de forma e contornos com rotulação de componentes conectados.',
              tech: 'OpenCV cv2.findContours / TensorRT / ONNX Runtime',
            },
            {
              step: '05',
              title: 'Enriquecimento Geoespacial & Cruzamento com Terras Protegidas',
              desc: 'Transformação dos pixels detectados em geometrias poligonais geo-referenciadas (WGS84 EPSG:4326). Consulta PostGIS imediata cruzando com bases de Unidades de Conservação (ICMBio), Terras Indígenas (FUNAI) e propriedades rurais (CAR).',
              tech: 'PostgreSQL + PostGIS (ST_MakePolygon, ST_Intersects, ST_Distance)',
            },
            {
              step: '06',
              title: 'Dispersão de Alertas Multicanal e Disparo de Brigadas',
              desc: 'Se o FRP for superior a 10 MW ou estiver a menos de 5 km de uma comunidade, gera alerta sonoro instantâneo via WebSockets para a central de operações e despacha push notifications (FCM) e mensagens automáticas via WhatsApp/Telegram com coordenadas GPS para equipes de campo.',
              tech: 'WebSockets / Firebase Cloud Messaging (FCM) / Twilio API',
            },
          ].map((item) => (
            <div key={item.step} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <span className="font-mono text-base font-bold text-amber-400 shrink-0">
                  {item.step}
                </span>
                <div>
                  <h4 className="font-bold text-slate-100">{item.title}</h4>
                  <p className="text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <div className="self-start md:self-center shrink-0">
                <span className="font-mono text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md block">
                  {item.tech}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
