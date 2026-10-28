export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  peakTemp: number; // °C
  avgTemp: number;  // °C
  areaPixels: number;
  estimatedAreaM2: number;
  frpMW: number; // Fire Radiative Power in MegaWatts
  severity: 'Baixa' | 'Moderada' | 'Crítica' | 'Extrema';
  confidence: number; // 0 - 100%
  contour?: [number, number][];
}

export type ColorPalette = 'ironbow' | 'inferno' | 'whiteHot' | 'blackHot' | 'rainbow';

export type ThresholdMethod = 'absolute' | 'otsu' | 'contextual' | 'anomaly';

export interface ThermalPreset {
  id: string;
  name: string;
  description: string;
  resolution: [number, number];
  sensorType: 'Drone FLIR Radiométrico' | 'Sentinel-2 SWIR/TIRS' | 'VIIRS NRT 375m' | 'Dossel Sub-bosque Amazônico';
  groundSamplingDistance: number; // meters per pixel
  ambientTemp: number; // °C
  hotspotCount: number;
}

export interface SatelliteSource {
  id: string;
  name: string;
  agency: string;
  resolution: string;
  latency: string;
  bands: string;
  idealUse: string;
  dataFormat: string;
  coverage: string;
}

export interface IncidentAlert {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  locationName: string;
  peakTemp: number;
  frpMW: number;
  severity: 'Baixa' | 'Moderada' | 'Crítica' | 'Extrema';
  status: 'Ativo' | 'Investigando' | 'Contido' | 'Extinto';
  brigadeDispatched: boolean;
  windSpeed: number; // km/h
  windDirection: number; // degrees
  riskScore: number; // 1-100
}
