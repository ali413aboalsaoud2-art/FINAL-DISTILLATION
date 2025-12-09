import { AntoineParams } from "../types";

// Common substances Antoine Constants (P in mmHg, T in Celsius)
export const SUBSTANCES: AntoineParams[] = [
  { name: 'Water', A: 8.07131, B: 1730.63, C: 233.426 },
  { name: 'Ethanol', A: 8.20417, B: 1642.89, C: 230.300 },
  { name: 'Methanol', A: 7.9705, B: 1521.23, C: 233.97 },
  { name: 'Acetone', A: 7.02447, B: 1161.0, C: 224.0 },
  { name: 'Benzene', A: 6.90565, B: 1211.033, C: 220.790 },
  { name: 'Toluene', A: 6.95334, B: 1343.943, C: 219.377 }
];

// --- Antoine Equation ---
// log10(P) = A - (B / (T + C))
// Returns P in mmHg
export const calculateVaporPressure = (tempC: number, params: AntoineParams): number => {
  const logP = params.A - (params.B / (tempC + params.C));
  return Math.pow(10, logP);
};

export const generateAntoineData = (params: AntoineParams, minT: number, maxT: number) => {
  const data = [];
  const step = (maxT - minT) / 50; 
  for (let t = minT; t <= maxT; t += step) {
    data.push({
      temperature: Number(t.toFixed(1)),
      pressure: Number(calculateVaporPressure(t, params).toFixed(2))
    });
  }
  return data;
};

// --- VLE / McCabe-Thiele ---
// Equilibrium: y = (alpha * x) / (1 + (alpha - 1) * x)
// Rectifying Line: y = (R / (R + 1)) * x + (xD / (R + 1))
export const calculateEquilibriumY = (x: number, alpha: number) => {
  return (alpha * x) / (1 + (alpha - 1) * x);
}

export const generateMcCabeThieleData = (alpha: number, R: number, xD: number) => {
  const data = [];
  // Generate points from x=0 to x=1
  for (let x = 0; x <= 1.0; x += 0.02) {
    const yEq = calculateEquilibriumY(x, alpha);
    
    // Operating Line (Rectifying Section)
    // Only valid up to x = xD (roughly, for simple visual check)
    let yOp = null;
    if (x <= xD) {
      yOp = (R / (R + 1)) * x + (xD / (R + 1));
    }

    data.push({
      x: Number(x.toFixed(2)),
      yEq: Number(yEq.toFixed(3)),
      yOp: yOp !== null ? Number(yOp.toFixed(3)) : null,
      xLine: Number(x.toFixed(2)) // y=x line
    });
  }
  return data;
};

// --- Heating Dynamics (Newton's Law of Heating) ---
// T(t) = T_max - (T_max - T_0) * e^(-k * t)
export const generateHeatingData = (t0: number, tMax: number, k: number, timeMinutes: number = 60) => {
  const data = [];
  for (let t = 0; t <= timeMinutes; t += 1) {
    const temp = tMax - (tMax - t0) * Math.exp(-k * t);
    data.push({
      time: t,
      temperature: Number(temp.toFixed(2))
    });
  }
  return data;
};

// --- Batch Distillation (Rayleigh Simulation) ---
// Simulates the change in residue composition (x_w) as liquid is distilled off.
export const generateRayleighData = (alpha: number, initialF: number, initialXf: number) => {
  const data = [];
  let W = initialF;
  let x = initialXf;
  const step = initialF / 50; // 50 simulation steps

  // Initial Point
  data.push({
    percentDistilled: 0,
    residueComposition: x,
    distillateComposition: calculateEquilibriumY(x, alpha)
  });

  // Iterative Mass Balance (Euler method approximation for integral)
  // Ln(F/W) = Integral(dx / (y-x))
  for (let distilled = step; distilled < initialF * 0.95; distilled += step) {
    // Current Y
    const y = calculateEquilibriumY(x, alpha);
    // Mass Balance: x_new * (W - step) = x * W - y * step
    // x_new = (x * W - y * step) / (W - step)
    const W_new = W - step;
    const x_new = (x * W - y * step) / W_new;
    
    W = W_new;
    x = Math.max(0, x_new); // Clamp to 0

    const percentDistilled = (distilled / initialF) * 100;

    data.push({
      percentDistilled: Number(percentDistilled.toFixed(1)),
      residueComposition: Number(x.toFixed(3)),
      distillateComposition: Number(y.toFixed(3))
    });
  }

  return data;
};

// --- Conductivity (Purity) ---
// Models the cleanup of distillate over time
// C(t) = C_final + (C_initial - C_final) * e^(-k * t)
export const generateConductivityData = (initial: number, final: number, k: number, timeMinutes: number = 60) => {
  const data = [];
  for (let t = 0; t <= timeMinutes; t += 1) {
    const val = final + (initial - final) * Math.exp(-k * t);
    data.push({
      time: t,
      conductivity: Number(val.toFixed(2))
    });
  }
  return data;
};

// --- Flow Rate & Production ---
// Theoretical Water Distillation Rate based on Power
// Energy required to vaporize 1g water = 2260 J (Latent heat) + Sensible heat (~334J) ≈ 2594 J/g
// Rate (g/sec) = Power(W) * Efficiency / 2594
// Rate (mL/min) = (grams/sec) * 60
export const generateFlowData = (powerWatts: number, efficiency: number, timeMinutes: number = 60) => {
  const joulesPerGram = 2594;
  const gramsPerSecond = (powerWatts * efficiency) / joulesPerGram;
  const mLPerMinute = gramsPerSecond * 60;
  
  const data = [];
  let totalVol = 0;
  for (let t = 0; t <= timeMinutes; t += 1) {
    // Simple warm-up curve: flow * (1 - e^(-0.5t))
    const currentFlow = t === 0 ? 0 : mLPerMinute * (1 - Math.exp(-0.5 * t));
    
    // Integrate volume
    if (t > 0) totalVol += currentFlow;

    data.push({
      time: t,
      flowRate: Number(currentFlow.toFixed(1)),
      totalVolume: Number((totalVol / 1000).toFixed(2)) // Liters
    });
  }
  return data;
};

// --- Power Consumption ---
// Cumulative Energy and Cost
export const generatePowerData = (powerWatts: number, costPerKwh: number, timeMinutes: number = 60) => {
  const data = [];
  for (let t = 0; t <= timeMinutes; t += 1) {
    const hours = t / 60;
    const kWh = (powerWatts * hours) / 1000;
    const cost = kWh * costPerKwh;
    
    data.push({
      time: t,
      energy: Number(kWh.toFixed(3)),
      cost: Number(cost.toFixed(2))
    });
  }
  return data;
};