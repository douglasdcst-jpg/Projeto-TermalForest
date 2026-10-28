import { ColorPalette, Hotspot, ThresholdMethod } from '../types/thermal';

// Colormap approximations for FLIR thermal palettes
export function getPaletteColor(normalizedValue: number, palette: ColorPalette): [number, number, number] {
  // normalizedValue: 0.0 to 1.0
  const t = Math.max(0, Math.min(1, normalizedValue));

  switch (palette) {
    case 'ironbow': {
      // Classic FLIR Ironbow: Black -> Dark Purple -> Magenta -> Orange -> Yellow -> White
      if (t < 0.2) {
        const u = t / 0.2;
        return [Math.round(20 * u), Math.round(5 * u), Math.round(50 * u + 20)];
      } else if (t < 0.45) {
        const u = (t - 0.2) / 0.25;
        return [Math.round(20 + 130 * u), Math.round(5 + 10 * u), Math.round(70 + 80 * u)];
      } else if (t < 0.7) {
        const u = (t - 0.45) / 0.25;
        return [Math.round(150 + 95 * u), Math.round(15 + 100 * u), Math.round(150 * (1 - u))];
      } else if (t < 0.9) {
        const u = (t - 0.7) / 0.2;
        return [245, Math.round(115 + 120 * u), Math.round(10 * u)];
      } else {
        const u = (t - 0.9) / 0.1;
        return [255, 235 + Math.round(20 * u), Math.round(255 * u)];
      }
    }

    case 'inferno': {
      // Perceptually uniform inferno colormap
      const r = Math.min(255, Math.max(0, Math.round(255 * Math.pow(t, 0.7))));
      const g = Math.min(255, Math.max(0, Math.round(255 * Math.pow(Math.max(0, t - 0.2) / 0.8, 1.4))));
      const b = Math.min(255, Math.max(0, Math.round(255 * Math.sin(t * Math.PI * 0.7) * (t < 0.6 ? 1 : (1 - (t - 0.6) / 0.4)))));
      return [r, g, b];
    }

    case 'whiteHot': {
      const v = Math.round(255 * t);
      return [v, v, v];
    }

    case 'blackHot': {
      const v = Math.round(255 * (1 - t));
      return [v, v, v];
    }

    case 'rainbow': {
      // Jet / Rainbow spectrum
      const h = (1 - t) * 240; // 240 (blue) down to 0 (red)
      return hslToRgb(h / 360, 1.0, 0.5);
    }
  }
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

// Generate high-fidelity thermal radiometric matrix representing dense forest canopy
export function generateThermalMatrix(
  width: number,
  height: number,
  presetId: string
): { matrix: Float32Array; minTemp: number; maxTemp: number; ambientTemp: number } {
  const size = width * height;
  const matrix = new Float32Array(size);

  let baseTemp = 24.0; // Cool tropical canopy baseline (°C)
  let firePeaks: { x: number; y: number; maxTemp: number; radius: number; shape: 'front' | 'circular' | 'smoldering' }[] = [];

  if (presetId === 'amazon_subcanopy') {
    // Dense canopy with smoldering understory hotspots (hard to detect, 70°C - 180°C)
    baseTemp = 23.5;
    firePeaks = [
      { x: Math.floor(width * 0.35), y: Math.floor(height * 0.4), maxTemp: 185, radius: 14, shape: 'circular' },
      { x: Math.floor(width * 0.42), y: Math.floor(height * 0.48), maxTemp: 145, radius: 9, shape: 'smoldering' },
      { x: Math.floor(width * 0.72), y: Math.floor(height * 0.65), maxTemp: 230, radius: 18, shape: 'front' },
      { x: Math.floor(width * 0.78), y: Math.floor(height * 0.7), maxTemp: 160, radius: 11, shape: 'circular' },
      { x: Math.floor(width * 0.2), y: Math.floor(height * 0.75), maxTemp: 95, radius: 7, shape: 'smoldering' },
    ];
  } else if (presetId === 'active_front_river') {
    // Severe active fire front marching toward a river buffer
    baseTemp = 25.0;
    firePeaks = [
      { x: Math.floor(width * 0.6), y: Math.floor(height * 0.35), maxTemp: 480, radius: 24, shape: 'front' },
      { x: Math.floor(width * 0.68), y: Math.floor(height * 0.45), maxTemp: 520, radius: 26, shape: 'front' },
      { x: Math.floor(width * 0.72), y: Math.floor(height * 0.58), maxTemp: 440, radius: 22, shape: 'front' },
      { x: Math.floor(width * 0.55), y: Math.floor(height * 0.62), maxTemp: 310, radius: 16, shape: 'circular' },
      { x: Math.floor(width * 0.3), y: Math.floor(height * 0.25), maxTemp: 120, radius: 8, shape: 'smoldering' },
    ];
  } else if (presetId === 'drone_inspection') {
    // High-resolution UAV view (close-up spot hotspots)
    baseTemp = 26.0;
    firePeaks = [
      { x: Math.floor(width * 0.5), y: Math.floor(height * 0.45), maxTemp: 380, radius: 20, shape: 'circular' },
      { x: Math.floor(width * 0.53), y: Math.floor(height * 0.52), maxTemp: 290, radius: 15, shape: 'smoldering' },
      { x: Math.floor(width * 0.25), y: Math.floor(height * 0.3), maxTemp: 140, radius: 10, shape: 'circular' },
      { x: Math.floor(width * 0.82), y: Math.floor(height * 0.75), maxTemp: 210, radius: 12, shape: 'circular' },
    ];
  } else {
    // Sentinel/VIIRS coarse simulation
    baseTemp = 24.5;
    firePeaks = [
      { x: Math.floor(width * 0.45), y: Math.floor(height * 0.5), maxTemp: 350, radius: 16, shape: 'front' },
      { x: Math.floor(width * 0.7), y: Math.floor(height * 0.3), maxTemp: 260, radius: 14, shape: 'circular' },
    ];
  }

  // Generate background canopy with micro-gradients, tree crowns, and river
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      // Canopy micro-variation (leaves, tree crowns, shade)
      const noise1 = Math.sin(x * 0.08) * Math.cos(y * 0.08);
      const noise2 = Math.sin(x * 0.2 + y * 0.15) * 0.5;
      const crownNoise = ((x * 13 + y * 37) % 17) / 17.0 - 0.5; // High freq texture

      let temp = baseTemp + noise1 * 1.8 + noise2 * 1.2 + crownNoise * 1.5;

      // Add cool river meandering across canopy (water is cooler: 20-22°C)
      const riverCenter = width * 0.45 + Math.sin(y * 0.03) * (width * 0.15);
      const distToRiver = Math.abs(x - riverCenter);
      if (distToRiver < width * 0.04) {
        temp = 20.5 + Math.sin(x * 0.2) * 0.8;
      } else if (distToRiver < width * 0.08) {
        // Riparian transition zone
        const factor = (distToRiver - width * 0.04) / (width * 0.04);
        temp = 21.0 * (1 - factor) + temp * factor;
      }

      // Add occasional sunlit dry clearing / rocky outcrop (warm non-fire: 36-40°C)
      const distToRock = Math.hypot(x - width * 0.85, y - height * 0.2);
      if (distToRock < width * 0.06) {
        temp += Math.max(0, 14 * (1 - distToRock / (width * 0.06)));
      }

      matrix[idx] = temp;
    }
  }

  // Overlay Fire Peaks with thermal diffusion and convective plume attenuation
  for (const peak of firePeaks) {
    const r = peak.radius;
    const xMin = Math.max(0, Math.floor(peak.x - r * 2.5));
    const xMax = Math.min(width - 1, Math.ceil(peak.x + r * 2.5));
    const yMin = Math.max(0, Math.floor(peak.y - r * 2.5));
    const yMax = Math.min(height - 1, Math.ceil(peak.y + r * 2.5));

    for (let y = yMin; y <= yMax; y++) {
      for (let x = xMin; x <= xMax; x++) {
        const dx = x - peak.x;
        const dy = y - peak.y;
        let d = Math.hypot(dx, dy);

        if (peak.shape === 'front') {
          // Elongated along wind angle (30 deg)
          const rotX = dx * 0.866 + dy * 0.5;
          const rotY = -dx * 0.5 + dy * 0.866;
          d = Math.hypot(rotX * 0.6, rotY * 1.3);
        }

        if (d < r * 2.0) {
          // Non-linear Gaussian thermal profile
          const intensity = Math.exp(-(d * d) / (2 * (r * 0.5) * (r * 0.5)));
          const fireTemp = peak.maxTemp * intensity;
          const idx = y * width + x;
          matrix[idx] = Math.max(matrix[idx], matrix[idx] + fireTemp);
        }
      }
    }
  }

  let minTemp = Infinity;
  let maxTemp = -Infinity;
  for (let i = 0; i < size; i++) {
    const val = matrix[i];
    if (val < minTemp) minTemp = val;
    if (val > maxTemp) maxTemp = val;
  }

  return { matrix, minTemp, maxTemp, ambientTemp: baseTemp };
}

// Computer Vision processing: Segment hotspots and extract bounding boxes
export function processThermalAnomalies(
  matrix: Float32Array,
  width: number,
  height: number,
  options: {
    thresholdMethod: ThresholdMethod;
    customThresholdC: number;
    minContourPixels: number;
    ambientTemp: number;
    gsdMeters: number; // Ground Sampling Distance in meters
  }
): {
  hotspots: Hotspot[];
  mask: Uint8Array;
  computedThreshold: number;
  stats: {
    mean: number;
    stdDev: number;
    totalHotspotAreaHa: number;
    totalFrpMW: number;
    maxTemp: number;
  };
} {
  const size = width * height;
  const mask = new Uint8Array(size);

  // Compute background statistics (mean and std dev)
  let sum = 0;
  let maxTemp = -Infinity;
  for (let i = 0; i < size; i++) {
    const t = matrix[i];
    sum += t;
    if (t > maxTemp) maxTemp = t;
  }
  const mean = sum / size;

  let varianceSum = 0;
  for (let i = 0; i < size; i++) {
    const diff = matrix[i] - mean;
    varianceSum += diff * diff;
  }
  const stdDev = Math.sqrt(varianceSum / size);

  // Determine effective threshold based on method
  let threshold = options.customThresholdC;

  if (options.thresholdMethod === 'otsu') {
    // Dynamic Otsu on normalized values
    threshold = computeOtsuThreshold(matrix, size, mean, maxTemp);
  } else if (options.thresholdMethod === 'contextual') {
    // NASA/INPE Contextual Fire Detection standard:
    // Candidate pixel must exceed Mean_bg + 3.0 * StdDev_bg AND exceed absolute minimum (e.g. 50°C)
    threshold = Math.max(48, mean + 3.2 * stdDev);
  } else if (options.thresholdMethod === 'anomaly') {
    // High-confidence statistical anomaly: Z-Score > 4.0
    threshold = mean + 4.0 * stdDev;
  }

  // Create binary mask
  for (let i = 0; i < size; i++) {
    if (matrix[i] >= threshold) {
      mask[i] = 255;
    }
  }

  // Morphological Opening (Erosion followed by Dilation) to suppress single-pixel thermal noise (e.g. sensor salt-and-pepper)
  const cleanedMask = applyMorphologicalOpening(mask, width, height);

  // Connected Component Analysis (Grassfire / BFS labeling) to extract distinct Hotspots & Bounding Boxes
  const visited = new Uint8Array(size);
  const hotspots: Hotspot[] = [];
  let totalAreaPixels = 0;
  let totalFrpMW = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (cleanedMask[idx] === 255 && visited[idx] === 0) {
        // Run BFS connected component
        const queue: [number, number][] = [[x, y]];
        visited[idx] = 1;

        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;
        let pixelCount = 0;
        let componentMaxTemp = -Infinity;
        let componentTempSum = 0;
        const componentPixels: [number, number][] = [];

        while (queue.length > 0) {
          const [cx, cy] = queue.pop()!;
          const cIdx = cy * width + cx;
          pixelCount++;
          componentPixels.push([cx, cy]);

          const tVal = matrix[cIdx];
          if (tVal > componentMaxTemp) componentMaxTemp = tVal;
          componentTempSum += tVal;

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // Check 4-connected neighbors
          const neighbors: [number, number][] = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1],
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (cleanedMask[nIdx] === 255 && visited[nIdx] === 0) {
                visited[nIdx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }

        // Filter out tiny noise clusters below minContourPixels
        if (pixelCount >= options.minContourPixels) {
          const avgTemp = componentTempSum / pixelCount;
          const pixelAreaM2 = options.gsdMeters * options.gsdMeters;
          const estimatedAreaM2 = pixelCount * pixelAreaM2;

          // Stefan-Boltzmann / Wooster empirical Fire Radiative Power (MW)
          // FRP = A_pixel * sigma * epsilon * (T_fire^4 - T_bg^4) * 1e-6 MW
          // Stefan-Boltzmann constant sigma = 5.670374e-8 W/(m^2 * K^4)
          // emissivity epsilon ≈ 0.95 for biomass fire
          const sigma = 5.670374e-8;
          const epsilon = 0.95;
          const tFireK = componentMaxTemp + 273.15;
          const tBgK = options.ambientTemp + 273.15;
          const radiativeFluxDensity = epsilon * sigma * (Math.pow(tFireK, 4) - Math.pow(tBgK, 4));
          const frpMW = Math.max(0.05, Number(((radiativeFluxDensity * estimatedAreaM2) / 1e6).toFixed(2)));

          // Severity grading
          let severity: Hotspot['severity'] = 'Baixa';
          if (componentMaxTemp >= 350 || frpMW > 25) {
            severity = 'Extrema';
          } else if (componentMaxTemp >= 180 || frpMW > 8) {
            severity = 'Crítica';
          } else if (componentMaxTemp >= 90 || frpMW > 2) {
            severity = 'Moderada';
          }

          // Calculate confidence (function of temperature contrast over ambient and size)
          const tempContrast = componentMaxTemp - options.ambientTemp;
          const confidence = Math.min(99, Math.max(45, Math.round(50 + (tempContrast / 300) * 35 + Math.min(14, pixelCount * 0.8))));

          totalAreaPixels += pixelCount;
          totalFrpMW += frpMW;

          hotspots.push({
            id: `HS-${hotspots.length + 1}`,
            x: minX,
            y: minY,
            width: Math.max(2, maxX - minX + 1),
            height: Math.max(2, maxY - minY + 1),
            peakTemp: Math.round(componentMaxTemp * 10) / 10,
            avgTemp: Math.round(avgTemp * 10) / 10,
            areaPixels: pixelCount,
            estimatedAreaM2: Math.round(estimatedAreaM2),
            frpMW,
            severity,
            confidence,
          });
        }
      }
    }
  }

  // Sort hotspots by peak temperature descending
  hotspots.sort((a, b) => b.peakTemp - a.peakTemp);

  const totalHotspotAreaHa = Number(((totalAreaPixels * options.gsdMeters * options.gsdMeters) / 10000).toFixed(2));

  return {
    hotspots,
    mask: cleanedMask,
    computedThreshold: Math.round(threshold * 10) / 10,
    stats: {
      mean: Math.round(mean * 10) / 10,
      stdDev: Math.round(stdDev * 10) / 10,
      totalHotspotAreaHa,
      totalFrpMW: Math.round(totalFrpMW * 10) / 10,
      maxTemp: Math.round(maxTemp * 10) / 10,
    },
  };
}

// Otsu's thresholding implementation for thermal distributions
function computeOtsuThreshold(matrix: Float32Array, size: number, min: number, max: number): number {
  const bins = 256;
  const hist = new Int32Array(bins);
  const range = max - min;
  if (range <= 0.001) return min;

  for (let i = 0; i < size; i++) {
    const val = matrix[i];
    const bin = Math.min(bins - 1, Math.max(0, Math.floor(((val - min) / range) * (bins - 1))));
    hist[bin]++;
  }

  let total = size;
  let sum = 0;
  for (let i = 0; i < bins; i++) sum += i * hist[i];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let thresholdBin = 0;

  for (let t = 0; t < bins; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > varMax) {
      varMax = varBetween;
      thresholdBin = t;
    }
  }

  return min + (thresholdBin / (bins - 1)) * range;
}

// Morphological opening: Erosion then Dilation with 3x3 structuring element
function applyMorphologicalOpening(input: Uint8Array, width: number, height: number): Uint8Array {
  const eroded = new Uint8Array(width * height);
  const opened = new Uint8Array(width * height);

  // Erosion
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (
        input[idx] === 255 &&
        input[idx - 1] === 255 &&
        input[idx + 1] === 255 &&
        input[idx - width] === 255 &&
        input[idx + width] === 255
      ) {
        eroded[idx] = 255;
      }
    }
  }

  // Dilation
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (
        eroded[idx] === 255 ||
        eroded[idx - 1] === 255 ||
        eroded[idx + 1] === 255 ||
        eroded[idx - width] === 255 ||
        eroded[idx + width] === 255
      ) {
        opened[idx] = 255;
      }
    }
  }

  return opened;
}
