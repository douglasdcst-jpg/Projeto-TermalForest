import React from 'react';
import { Flame, Download, Layers, Cpu, Radio, MapPin, Code2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenReport }) => {
  const navItems = [
    { id: 'simulator', label: 'Simulador CV Térmico', icon: Layers },
    { id: 'architecture', label: 'Arquitetura & IA', icon: Cpu },
    { id: 'sources', label: 'Fontes & Ingestão NRT', icon: Radio },
    { id: 'map', label: 'Mapa & Alertas', icon: MapPin },
    { id: 'python', label: 'Código Python (MVP)', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Single Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-base lg:text-lg font-bold tracking-tight text-white whitespace-nowrap">
            PyroThermal Vision
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs lg:text-sm transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Dossiê</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer strip */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto pt-2.5 mt-2 border-t border-slate-800/60 pb-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap shrink-0 ${
                isActive ? 'bg-amber-500/20 text-amber-400 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
