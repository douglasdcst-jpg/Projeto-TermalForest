import React, { useState } from 'react';
import { 
  Flame, Satellite, Radio, Cpu, Layers, ShieldCheck, 
  MapPin, Code2, Download, ArrowRight, Activity, Thermometer
} from 'lucide-react';
import { Header } from './components/Header';
import { ThermalSimulator } from './components/ThermalSimulator';
import { ArchitectureDossier } from './components/ArchitectureDossier';
import { DataSourcesPipeline } from './components/DataSourcesPipeline';
import { IncidentMap } from './components/IncidentMap';
import { PythonMvpStudio } from './components/PythonMvpStudio';
import { ReportModal } from './components/ReportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Hero Showcase Strip */}
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 py-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Context & Executive Summary */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-amber-400 font-semibold uppercase">Engenharia de Sensoriamento Remoto & IA</span>
                <span aria-hidden="true">·</span>
                <span>Visão Computacional Aplicada</span>
                <span aria-hidden="true">·</span>
                <span>Floresta Tropical Densa</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight text-balance leading-tight">
                Detecção de Manchas de Calor e Anomalias Térmicas em Florestas Densas
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Plataforma de alta precisão projetada para monitoramento de dosséis florestais densos.
                Combina modelagem estatística contextual (MODIS/VIIRS), processamento radiométrico de drones (FLIR)
                e redes neurais convolucionais (YOLOv8-Thermal) para isolar focos sub-bosque ocultos com rejeição estrita de falsos positivos.
              </p>

              {/* Quick Tab Jump Bar */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { id: 'simulator', label: '1. Simulador & CV Térmico' },
                  { id: 'architecture', label: '2. Arquitetura do Sistema' },
                  { id: 'sources', label: '3. Ingestão NRT & Satélites' },
                  { id: 'map', label: '4. Mapa & Alertas' },
                  { id: 'python', label: '5. Código Python (MVP)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Authentic Radiometric Satellite / Aerial Imagery */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl group bg-slate-900">
                <img
                  src="/src/assets/images/aerial_thermal_forest_fire_1793194122882.jpg"
                  alt="Radiometria termográfica aérea de dossel florestal com anomalias de calor na paleta FLIR Ironbow"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to styled CSS gradient container if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>FLIR Ironbow · LWIR 10.8µm</span>
                  </div>
                  <span className="text-amber-400 font-semibold">T_max: 520°C (Fogo Ativo)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {activeTab === 'simulator' && <ThermalSimulator />}
        {activeTab === 'architecture' && <ArchitectureDossier />}
        {activeTab === 'sources' && <DataSourcesPipeline />}
        {activeTab === 'map' && <IncidentMap />}
        {activeTab === 'python' && <PythonMvpStudio />}
      </main>

      {/* Clean Technical Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 lg:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PyroThermal Vision</span>
            <span>—</span>
            <span>Sistema Especialista em Sensoriamento Remoto e IA Florestal</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>INPE BDQueimadas</span>
            <span>·</span>
            <span>NASA FIRMS LANCE</span>
            <span>·</span>
            <span>Copernicus Sentinel-2</span>
            <span>·</span>
            <span>FLIR Boson Radiometric</span>
          </div>
        </div>
      </footer>

      {/* Technical Report Export Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
