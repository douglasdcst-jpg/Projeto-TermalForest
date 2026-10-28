import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const reportMarkdown = `# DOSSIÊ DE ENGENHARIA DE SOFTWARE & VISÃO COMPUTACIONAL
PROJETO: PYROTHERMAL VISION - SISTEMA DE DETECÇÃO DE MANCHAS DE CALOR EM FLORESTAS DENSAS

## 1. ARQUITETURA GERAL DO SISTEMA
- Front-end: React / Next.js com PWA (Progressive Web App) para brigadas de campo offline (IndexedDB/Dexie.js), MapLibre GL para camadas vetoriais e HTML5 Canvas/WebGL para colorização radiométrica a 60 FPS.
- Back-end: Python FastAPI (assíncrono), Celery + Redis / Apache Kafka para filas de processamento distribuído de rasters térmicos, C-bindings GDAL/Rasterio para reprojeção WGS84 -> UTM/SIRGAS 2000.
- Banco de Dados Geoespacial: PostgreSQL com extensão PostGIS para consultas espaciais (ST_Intersects, ST_DWithin) cruzando dados com Terras Indígenas e Unidades de Conservação (ICMBio/FUNAI). Storage em MinIO / S3 para GeoTIFFs (COG).
- Algoritmos de IA & Visão Computacional:
  * Algoritmo Contextual de Detecção de Fogo (padrão MODIS/VIIRS/INPE): Compara candidato térmico contra janela móvel 21x21 do dossel circundante (T > Média + 3.2*StdDev).
  * YOLOv8-Thermal / YOLOv11: Rede neural treinada em infravermelho de 14-bit para discriminar focos reais de falsos positivos (rochas ensolaradas, gado, clareiras).
  * Autoencoders Convolucionais para Detecção de Anomalias Não-Supervisionadas em florestas primárias.
  * Morfologia Matemática (Abertura 3x3) e Análise de Componentes Conectados (cv2.findContours/cv2.boundingRect).

## 2. FONTES DE DADOS E PIPELINE DE INGESTÃO NRT
- Satélites de Órbita Polar:
  * NASA FIRMS (VIIRS S-NPP e NOAA-20 a 375m, bandas I4 3.74µm e I5 11.45µm).
  * Copernicus Sentinel-2 MSI (Bandas B12 SWIR2, B11 SWIR1, B8A NIR a 20m de resolução) para mapeamento cicatricial e severidade dNBR.
  * INPE BDQueimadas: Satélite de referência oficial AQUA e TERRA MODIS.
- Satélites Geoestacionários:
  * GOES-16 ABI (Banda 7 3.9µm e Banda 14 11.2µm) com atualização a cada 10 a 15 minutos.
- Drones Táticos (UAVs):
  * Câmeras radiométricas FLIR Boson / DJI Zenmuse H20T gerando RJPEG com matriz térmica em Celsius e GSD de 5cm a 15cm por pixel.
- Pipeline de Ingestão:
  Event Trigger -> Calibração Radiométrica (Planck) -> Máscara de Nuvens e Corpos Hídricos -> Motor de Detecção CV/IA -> Indexação Espacial PostGIS -> Dispersão de Alertas WebSockets / Push FCM.

## 3. PROTÓTIPO DE CÓDIGO PYTHON (MVP)
Disponibilizado na íntegra no aplicativo com funções completas para geração sintética de matriz térmica de dossel tropical, limiarização contextual adaptativa, eliminação de ruídos morfológicos, extração de contornos e bounding boxes e cálculo de Potência Radiativa (FRP em MW).

## 4. TELAS E RECURSOS ESSENCIAIS DO APP
- Tela 1: Mapa Interativo de Calor com Vetores de Propagação do Vento (Modelo de Rothermel).
- Tela 2: Central de Triagem e Alertas em Tempo Real com Notificação Multicanal.
- Tela 3: Inspeção Térmica Radiométrica e Drone Flyover com Paletas FLIR Ironbow.
- Tela 4: Relatórios de Severidade, Histórico Temporal e Modo de Coleta Offline para Brigadas.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dossie_arquitetura_pyrothermal.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Dossiê Técnico de Engenharia & Arquitetura</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-4 bg-slate-950/50">
          <pre className="whitespace-pre-wrap font-mono text-slate-300">{reportMarkdown}</pre>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <span className="text-xs text-slate-400">Documento pronto para especificação e implementação de engenharia.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Markdown'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Relatório .MD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
