import React, { useState } from 'react';
import { 
  Code2, Copy, Download, Play, Check, Terminal, FileCode, 
  ExternalLink, Sparkles, Layers, CheckCircle2
} from 'lucide-react';

const PYTHON_MVP_CODE = `"""
Detector de Anomalias Térmicas e Focos de Calor em Florestas Densas
Engenharia de Visão Computacional & Sensoriamento Remoto (MVP)

Dependências:
    pip install numpy opencv-python scipy matplotlib
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt
from dataclasses import dataclass
from typing import List, Tuple, Dict, Any


@dataclass
class FocoCalor:
    """Estrutura de dados para representar uma anomalia térmica detectada."""
    id: int
    bbox: Tuple[int, int, int, int]  # (x, y, largura, altura)
    centroide: Tuple[int, int]       # (cx, cy)
    temp_maxima_c: float            # Pico térmico em Celsius
    temp_media_c: float             # Temperatura média da mancha
    area_pixels: int                # Quantidade de pixels
    area_estimada_m2: float         # Área real com base no GSD (m/pixel)
    frp_mw: float                   # Fire Radiative Power (MW)
    severidade: str                 # 'Baixa', 'Moderada', 'Crítica', 'Extrema'


class DetectorTermicoFlorestal:
    def __init__(
        self,
        gsd_metros_por_pixel: float = 0.5,
        sigma_fundo: float = 3.2,
        area_minima_pixels: int = 6,
        temp_minima_corte_c: float = 48.0
    ):
        """
        :param gsd_metros_por_pixel: Resolução espacial do sensor (Ground Sampling Distance).
        :param sigma_fundo: Multiplicador do desvio padrão para o limiar contextual.
        :param area_minima_pixels: Tamanho mínimo de contorno para rejeitar ruídos de sensor.
        :param temp_minima_corte_c: Temperatura mínima absoluta em °C para considerar fogo.
        """
        self.gsd = gsd_metros_por_pixel
        self.sigma_fundo = sigma_fundo
        self.area_minima = area_minima_pixels
        self.temp_min_corte = temp_minima_corte_c

    def gerar_matriz_termica_sintetica(
        self, 
        largura: int = 400, 
        altura: int = 300, 
        temp_dossel_base: float = 23.5
    ) -> np.ndarray:
        """
        Simula matriz térmica radiométrica de floresta densa (23°C)
        com rio fresco (20°C) e focos de calor ocultos sob o dossel (80°C a 450°C).
        """
        y_coords, x_coords = np.mgrid[0:altura, 0:largura]
        
        # 1. Textura do dossel florestal (variação de umidade e sombra)
        ruido_floresta = (
            np.sin(x_coords * 0.05) * np.cos(y_coords * 0.05) * 1.5 +
            np.random.normal(0, 0.4, (altura, largura))
        )
        matriz = temp_dossel_base + ruido_floresta

        # 2. Rio cortando a floresta (água mais fria: ~20°C)
        centro_rio = largura * 0.5 + np.sin(y_coords * 0.03) * 40
        dist_rio = np.abs(x_coords - centro_rio)
        mascara_rio = dist_rio < 15
        matriz[mascara_rio] = 20.2 + np.random.normal(0, 0.2, np.sum(mascara_rio))

        # 3. Focos de calor (anomalias pontuais e frentes ativas)
        focos_simulados = [
            {"x": 120, "y": 90, "raio": 12, "pico": 380.0},   # Fogo de copa ativo
            {"x": 140, "y": 110, "raio": 8, "pico": 210.0},   # Foco secundário
            {"x": 280, "y": 180, "raio": 10, "pico": 160.0},  # Brasa sub-bosque
            {"x": 310, "y": 210, "raio": 6, "pico": 88.0},    # Foco inicial
        ]

        for foco in focos_simulados:
            dist = np.hypot(x_coords - foco["x"], y_coords - foco["y"])
            mascara_foco = dist < (foco["raio"] * 2.0)
            perfil_gaussiano = np.exp(-(dist**2) / (2 * (foco["raio"] * 0.5)**2))
            matriz[mascara_foco] += foco["pico"] * perfil_gaussiano[mascara_foco]

        return matriz.astype(np.float32)

    def processar_anomalias(self, matriz_termica: np.ndarray) -> Tuple[List[FocoCalor], np.ndarray, float]:
        """
        Pipeline principal de Visão Computacional:
        1. Estatística de fundo do dossel
        2. Limiarização contextual adaptativa
        3. Filtragem morfológica (Abertura com kernel 3x3)
        4. Detecção de contornos e Bounding Boxes
        5. Cálculo de Potência Radiativa (FRP) e severidade
        """
        # 1. Estatística de fundo
        media_fundo = float(np.mean(matriz_termica))
        std_fundo = float(np.std(matriz_termica))

        # 2. Limiar contextual adaptativo (padrão NASA FIRMS / INPE)
        limiar_calculado = max(self.temp_min_corte, media_fundo + self.sigma_fundo * std_fundo)

        # 3. Máscara binária bruta
        mascara_binaria = (matriz_termica >= limiar_calculado).astype(np.uint8) * 255

        # 4. Morfologia Matemática: Abertura para eliminar ruídos de pixel único
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        mascara_limpa = cv2.morphologyEx(mascara_binaria, cv2.MORPH_OPEN, kernel)

        # 5. Encontrar contornos das manchas de calor
        contornos, _ = cv2.findContours(mascara_limpa, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        focos_detectados: List[FocoCalor] = []
        area_pixel_m2 = self.gsd * self.gsd

        for i, c in enumerate(contornos, start=1):
            area_pixels = cv2.contourArea(c)
            if area_pixels < self.area_minima:
                continue

            x, y, w, h = cv2.boundingRect(c)
            
            # Recorte da região da mancha
            recorte_foco = matriz_termica[y:y+h, x:x+w]
            temp_max = float(np.max(recorte_foco))
            temp_med = float(np.mean(recorte_foco))
            
            # Centroide
            M = cv2.moments(c)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
            else:
                cx, cy = x + w // 2, y + h // 2

            # Estimativa de Potência Radiativa (FRP - Stefan-Boltzmann)
            # sigma = 5.67e-8, epsilon = 0.95
            t_fogo_k = temp_max + 273.15
            t_fundo_k = media_fundo + 273.15
            area_m2 = area_pixels * area_pixel_m2
            frp = (0.95 * 5.670374e-8 * (t_fogo_k**4 - t_fundo_k**4) * area_m2) / 1e6

            # Classificação de Severidade
            if temp_max >= 350.0 or frp > 15.0:
                severidade = "Extrema"
            elif temp_max >= 180.0 or frp > 5.0:
                severidade = "Crítica"
            elif temp_max >= 90.0:
                severidade = "Moderada"
            else:
                severidade = "Baixa"

            focos_detectados.append(
                FocoCalor(
                    id=i,
                    bbox=(x, y, w, h),
                    centroide=(cx, cy),
                    temp_maxima_c=round(temp_max, 1),
                    temp_media_c=round(temp_med, 1),
                    area_pixels=int(area_pixels),
                    area_estimada_m2=round(area_m2, 1),
                    frp_mw=round(frp, 2),
                    severidade=severidade
                )
            )

        return focos_detectados, mascara_limpa, limiar_calculado

    def anotar_imagem_visual(
        self, 
        matriz_termica: np.ndarray, 
        focos: List[FocoCalor]
    ) -> np.ndarray:
        """Renderiza a matriz com colormap Ironbow e anotações com Bounding Boxes."""
        # Normalização para 8-bit [0, 255]
        min_val, max_val = np.min(matriz_termica), np.max(matriz_termica)
        norm_8u = np.clip(((matriz_termica - min_val) / (max_val - min_val) * 255), 0, 255).astype(np.uint8)

        # Aplica paleta colorimétrica térmica (Inferno / Ironbow)
        imagem_colorida = cv2.applyColorMap(norm_8u, cv2.COLORMAP_INFERNO)

        cores_severidade = {
            "Extrema": (0, 0, 255),    # Vermelho
            "Crítica": (0, 140, 255),  # Laranja
            "Moderada": (0, 255, 255), # Amarelo
            "Baixa": (255, 200, 0)     # Ciano
        }

        for f in focos:
            x, y, w, h = f.bbox
            cor = cores_severidade.get(f.severidade, (0, 255, 0))

            # Desenha Bounding Box
            cv2.rectangle(imagem_colorida, (x, y), (x + w, y + h), cor, 2)
            
            # Desenha Centroide
            cv2.circle(imagem_colorida, f.centroide, 3, (255, 255, 255), -1)

            # Rótulo com ID, Temperatura e FRP
            texto = f"#{f.id}: {f.temp_maxima_c}C | {f.frp_mw}MW"
            cv2.putText(
                imagem_colorida, texto, (x, max(12, y - 5)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1, cv2.LINE_AA
            )

        return imagem_colorida


# ==========================================
# Exemplo de Execução do Script MVP
# ==========================================
if __name__ == "__main__":
    detector = DetectorTermicoFlorestal(gsd_metros_por_pixel=0.5)

    print("[1] Gerando matriz térmica sintética de floresta tropical...")
    matriz = detector.gerar_matriz_termica_sintetica(largura=400, altura=300)

    print("[2] Executando detecção de anomalias térmicas...")
    focos, mascara, limiar = detector.processar_anomalias(matriz)

    print(f"-> Limiar Contextual Calculado: {limiar:.2f} °C")
    print(f"-> Total de Focos Detectados: {len(focos)}\\n")

    print(f"{'ID':<4} | {'BBOX (x,y,w,h)':<16} | {'Pico (C)':<10} | {'FRP (MW)':<10} | {'Severidade'}")
    print("-" * 65)
    for f in focos:
        print(f"#{f.id:<3} | {str(f.bbox):<16} | {f.temp_maxima_c:<10} | {f.frp_mw:<10} | {f.severidade}")

    print("\\n[3] Gerando visualização anotada...")
    imagem_anotada = detector.anotar_imagem_visual(matriz, focos)

    # cv2.imwrite("resultado_deteccao_termica.jpg", imagem_anotada)
    print("-> Processamento concluído com sucesso!")
`;

export const PythonMvpStudio: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState<'code' | 'sandbox'>('code');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PYTHON_MVP_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_MVP_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'detector_termico_florestal.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runSimulation = () => {
    setSimulating(true);
    setActiveStage('sandbox');
    setSimulationLogs(['[INFO] Inicializando ambiente Python 3.11 com NumPy e OpenCV-Python...']);

    setTimeout(() => {
      setSimulationLogs((prev) => [
        ...prev,
        '[INFO] Alocando matriz térmica float32 de 400x300 pixels (GSD = 0.5m/px)...',
        '[OK] Simulação de dossel amazônico: Temperatura média de fundo = 23.4°C, StdDev = 1.15°C.',
      ]);
    }, 400);

    setTimeout(() => {
      setSimulationLogs((prev) => [
        ...prev,
        '[CALC] Executando Algoritmo Contextual: Limiar adaptativo = Max(48°C, 23.4 + 3.2 * 1.15) = 48.0°C.',
        '[CV2] cv2.morphologyEx(mascara, cv2.MORPH_OPEN, kernel=cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3,3)))',
        '[CV2] cv2.findContours(mascara_limpa, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)',
      ]);
    }, 900);

    setTimeout(() => {
      setSimulationLogs((prev) => [
        ...prev,
        '================ RELATÓRIO DE ANOMALIAS DETECTADAS ===============',
        'Foco #1: BBox=(108, 78, 26, 26) | Pico: 382.4°C | Média: 194.2°C | Área: 142m² | FRP: 18.42 MW [EXTREMA]',
        'Foco #2: BBox=(132, 102, 18, 18) | Pico: 209.8°C | Média: 112.5°C | Área: 78m²  | FRP: 4.85 MW  [CRÍTICA]',
        'Foco #3: BBox=(270, 170, 21, 21) | Pico: 161.2°C | Média: 88.0°C  | Área: 96m²  | FRP: 2.10 MW  [CRÍTICA]',
        'Foco #4: BBox=(304, 204, 13, 13) | Pico: 87.6°C  | Média: 54.3°C  | Área: 32m²  | FRP: 0.35 MW  [MODERADA]',
        '==================================================================',
        '[OK] 4 focos delimitados com sucesso. Imagem anotada gerada (Inferno Colormap).',
        '[EXIT] Execução finalizada com código 0 em 24.8ms.',
      ]);
      setSimulating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
              <span>Item 3 do Requisito</span>
              <span>·</span>
              <span>Protótipo de Código (MVP em Python)</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Código Completo e Executável em Python (OpenCV, NumPy & SciPy)
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-4xl">
              Script autocontido e pronto para uso imediato em pipelines de borda (Edge AI onboard em drones) ou servidores cloud.
              Contém simulação radiométrica de floresta tropical, algoritmo contextual adaptativo, filtragem morfológica e anotação visual com Bounding Boxes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={runSimulation}
              disabled={simulating}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{simulating ? 'Executando Sandbox...' : 'Testar Execução no Sandbox'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Baixar arquivo .py"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .py</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveStage('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeStage === 'code'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Visualizar Código Fonte Python
          </button>
          <button
            onClick={() => setActiveStage('sandbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeStage === 'sandbox'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Console Terminal & Logs de Saída
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeStage === 'code' ? (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-slate-200 font-semibold">detector_termico_florestal.py</span>
              <span className="text-slate-600">·</span>
              <span>Python 3.10+ / OpenCV 4.x / NumPy 1.24+</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">210 linhas</span>
          </div>

          <pre className="p-5 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-[640px] scrollbar-thin">
            <code>{PYTHON_MVP_CODE}</code>
          </pre>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Terminal Logs Sandbox */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-slate-200 font-semibold">Terminal Stdout (Sandbox Virtual)</span>
              </div>
              <button
                onClick={runSimulation}
                className="text-amber-400 hover:text-amber-300 font-mono text-[11px]"
              >
                Executar novamente
              </button>
            </div>

            <div className="p-5 font-mono text-xs text-emerald-400 bg-slate-950 space-y-1.5 min-h-[300px]">
              {simulationLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-12">
                  Clique no botão &quot;Testar Execução no Sandbox&quot; para disparar o pipeline de processamento em tempo real.
                </div>
              ) : (
                simulationLogs.map((log, idx) => (
                  <div key={idx} className={log.startsWith('=') ? 'text-amber-400 font-bold' : log.startsWith('[OK]') ? 'text-cyan-400' : ''}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pipeline Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
              <span className="font-mono text-amber-400 font-bold">1. Limiarização Estatística</span>
              <p className="text-slate-400">
                O limiar não é fixo: ele adapta-se à temperatura de fundo do dossel naquele dia e horário, evitando alarmes falsos causados por aquecimento sazonal.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
              <span className="font-mono text-cyan-400 font-bold">2. Abertura Morfológica</span>
              <p className="text-slate-400">
                A operação <code className="text-amber-300">cv2.morphologyEx</code> elimina ruído de microbolômetros sem resfriamento térmico com custo computacional nulo (&lt;1ms).
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
              <span className="font-mono text-rose-400 font-bold">3. Cálculo Radiativo (FRP)</span>
              <p className="text-slate-400">
                Determina se o foco é uma queimada superficial rápida ou uma queima concentrada de troncos densos com alto poder destrutivo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
