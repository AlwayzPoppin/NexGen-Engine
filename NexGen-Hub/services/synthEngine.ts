
import { createImpulseResponse } from "./audioUtils";

/**
 * Symphonic Audio Engine v14.0 - Advanced Physical Modeling & Texture Suite
 * Features: Inharmonic Glass Banks, Ballistics Modeling, Organic Squelch
 */

export interface MusicalNote {
  pitch: number;
  time: number;
  duration: number;
  velocity: number;
}

export interface SynthStep {
  type: 'sequence' | 'sample' | 'fx' | 'noise' | 'tone' | 'texture' | 'layer' | 'granular';
  instrument?: 'VCO_LEAD' | 'POLY_KEYS' | 'SUB_BASS' | 'FM_BELLS' | 'PLASMA_NOISE' | 'DRUM_HIT';
  bpm?: number;
  notes?: MusicalNote[];
  startTime: number;
  duration?: number;
  sampleName?: string;
  pitch?: number;
  pitchEnd?: number;
  gain?: number;
  reverbWet?: number;
  delayWet?: number;
  frequency?: number;
  resonance?: number;
  grit?: number;
  density?: number;
  grainSize?: number;
}

function toFinite(val: any, fallback: number = 0): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Generates a set of inharmonic frequencies for physical modeling.
 */
function getInharmonicBank(base: number, complexity: number = 5): number[] {
  const bank = [base];
  for (let i = 1; i < complexity; i++) {
    bank.push(base * (1.1 + Math.random() * 2.5 * i));
  }
  return bank;
}

export async function renderNeuralSequence(steps: SynthStep[], variationSeed: number = 0): Promise<Uint8Array> {
  const sampleRate = 24000;
  let maxTime = 1.0;

  steps.forEach(s => {
    const end = toFinite(s.startTime, 0) + toFinite(s.duration, 1.5);
    if (end > maxTime) maxTime = end;
  });

  const totalFrames = Math.max(1, Math.floor(sampleRate * (maxTime + 1.5)));
  const offlineCtx = new OfflineAudioContext(1, totalFrames, sampleRate);
  const mainMix = offlineCtx.createGain();

  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.value = -12;
  compressor.ratio.value = 15;
  compressor.attack.value = 0.0005; // Critical for sharp transients

  mainMix.connect(compressor);
  compressor.connect(offlineCtx.destination);

  steps.forEach(step => {
    const drift = (Math.sin(variationSeed * 1.5 + step.startTime) * 0.05);
    const start = toFinite(step.startTime, 0);
    const dur = toFinite(step.duration, 0.5);
    const gain = toFinite(step.gain, 0.5) * (1 + drift);
    const basePitch = toFinite(step.pitch, 1.0) * (1 + drift);

    if (step.type === 'granular') {
      const density = toFinite(step.density, 120);
      const grainSize = toFinite(step.grainSize, 0.03);
      const freq = toFinite(step.frequency, 800) * basePitch;

      for (let i = 0; i < density * dur; i++) {
        const gStart = start + (i / density) + (Math.random() * 0.02);
        const gDur = grainSize * (0.3 + Math.random() * 0.7);

        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(0, gStart);
        g.gain.linearRampToValueAtTime(gain / 6, gStart + gDur / 2);
        g.gain.linearRampToValueAtTime(0, gStart + gDur);

        const osc = offlineCtx.createOscillator();
        osc.type = Math.random() > 0.7 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq * (0.5 + Math.random() * 2.0), gStart);

        const f = offlineCtx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = freq;
        f.Q.value = 10;

        osc.connect(f); f.connect(g); g.connect(mainMix);
        osc.start(gStart); osc.stop(gStart + gDur);
      }
    }
    else if (step.type === 'sample' || step.type === 'layer') {
      const name = step.sampleName || 'impact_metal';

      // Check if this is a Sample Bank reference (sample:id format)
      if (name.startsWith('sample:')) {
        // Sample Bank playback is handled externally via AudioForge
        // The synth engine logs this for the UI to process
        console.log(`[SynthEngine] Sample Bank reference: ${name} (processed by AudioForge)`);
        // Create a silent placeholder for timing purposes
        const silentGain = offlineCtx.createGain();
        silentGain.gain.value = 0;
        silentGain.connect(mainMix);
        // The actual sample will be layered by AudioForge's sample player
      }
      else if (name === 'impact_glass' || name === 'shatter_vial') {
        const bank = getInharmonicBank(3000 * basePitch, 12);
        bank.forEach((f, idx) => {
          const sTime = start + (idx * 0.005 * Math.random());
          const sDur = 0.05 + Math.random() * (name === 'shatter_vial' ? 0.2 : 0.6);
          const sG = offlineCtx.createGain();
          sG.gain.setValueAtTime(gain / bank.length, sTime);
          sG.gain.exponentialRampToValueAtTime(0.001, sTime + sDur);

          const osc = offlineCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, sTime);
          osc.connect(sG); sG.connect(mainMix);
          osc.start(sTime); osc.stop(sTime + sDur);
        });
      }
      else if (name === 'gun_shot_kick' || name === 'shotgun_blast') {
        // Multi-stage blast
        const burstCount = name === 'shotgun_blast' ? 8 : 1;
        for (let b = 0; b < burstCount; b++) {
          const bStart = start + (b * 0.002);
          const kick = offlineCtx.createOscillator();
          kick.type = 'sine';
          kick.frequency.setValueAtTime(300 * basePitch, bStart);
          kick.frequency.exponentialRampToValueAtTime(30, bStart + 0.08);

          const kG = offlineCtx.createGain();
          kG.gain.setValueAtTime(gain * 2, bStart);
          kG.gain.exponentialRampToValueAtTime(0.001, bStart + 0.1);

          kick.connect(kG); kG.connect(mainMix);
          kick.start(bStart); kick.stop(bStart + 0.15);
        }

        // Noise crack
        const buf = offlineCtx.createBuffer(1, sampleRate * 0.15, sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const noise = offlineCtx.createBufferSource();
        noise.buffer = buf;
        const nG = offlineCtx.createGain();
        nG.gain.setValueAtTime(gain, start);
        nG.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
        noise.connect(nG); nG.connect(mainMix);
        noise.start(start);
      }
      else if (name === 'laser_zap' || name === 'plasma_noise') {
        const freq = toFinite(step.frequency, 1200) * basePitch;
        const osc = offlineCtx.createOscillator();
        osc.type = name === 'laser_zap' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, start);
        if (name === 'laser_zap') {
          osc.frequency.exponentialRampToValueAtTime(50, start + 0.1);
        } else {
          osc.frequency.linearRampToValueAtTime(freq * 1.5, start + dur);
        }

        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(gain, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);

        if (name === 'plasma_noise') {
          const lfo = offlineCtx.createOscillator();
          lfo.frequency.value = 8 + Math.random() * 20;
          const lfoG = offlineCtx.createGain();
          lfoG.gain.value = gain * 0.5;
          lfo.connect(lfoG);
          lfoG.connect(g.gain);
          lfo.start(start); lfo.stop(start + dur);
        }

        osc.connect(g); g.connect(mainMix);
        osc.start(start); osc.stop(start + dur);
      }
      else if (name === 'magnetic_hum') {
        const freq = toFinite(step.frequency, 60) * basePitch;
        const osc1 = offlineCtx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, start);

        const osc2 = offlineCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 1.5, start);

        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(gain, start + 0.1);
        g.gain.linearRampToValueAtTime(0, start + dur);

        osc1.connect(g); osc2.connect(g);
        g.connect(mainMix);
        osc1.start(start); osc1.stop(start + dur);
        osc2.start(start); osc2.stop(start + dur);
      }
      else if (name === 'metal_stress' || name === 'flesh_impact') {
        const isMetal = name === 'metal_stress';
        const freq = isMetal ? 2000 * basePitch : 100 * basePitch;
        const buf = offlineCtx.createBuffer(1, sampleRate * dur, sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
        }
        const noise = offlineCtx.createBufferSource();
        noise.buffer = buf;

        const f = offlineCtx.createBiquadFilter();
        f.type = isMetal ? 'highpass' : 'lowpass';
        f.frequency.setValueAtTime(freq, start);

        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(gain, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);

        noise.connect(f); f.connect(g); g.connect(mainMix);
        noise.start(start);
      }
      else if (name === 'ui_click') {
        const osc = offlineCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3000 * basePitch, start);
        osc.frequency.exponentialRampToValueAtTime(8000 * basePitch, start + 0.005);

        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(gain, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.01);

        osc.connect(g); g.connect(mainMix);
        osc.start(start); osc.stop(start + 0.01);
      }
      else if (name === 'organic_squelch') {
        const buf = offlineCtx.createBuffer(1, sampleRate * dur, sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const noise = offlineCtx.createBufferSource();
        noise.buffer = buf;

        const f = offlineCtx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(2000 * basePitch, start);
        f.frequency.exponentialRampToValueAtTime(200, start + dur);
        f.Q.value = 15;

        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(gain, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);

        noise.connect(f); f.connect(g); g.connect(mainMix);
        noise.start(start);
      }
      else if (name === 'mechanical_clunk' || name === 'servo_whir') {
        const osc = offlineCtx.createOscillator();
        osc.type = name === 'servo_whir' ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(name === 'servo_whir' ? 800 * basePitch : 120 * basePitch, start);
        if (name === 'servo_whir') {
          osc.frequency.linearRampToValueAtTime(1200 * basePitch, start + dur * 0.8);
        }

        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(gain, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(g); g.connect(mainMix);
        osc.start(start); osc.stop(start + dur);
      }
      else if (name === 'wind_noise' || name === 'paper_crumble') {
        // Elemental texture tools
        const isWind = name === 'wind_noise';
        const buf = offlineCtx.createBuffer(1, sampleRate * dur, sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
          d[i] = (Math.random() * 2 - 1) * (isWind ? 0.8 : 0.4);
        }
        const noise = offlineCtx.createBufferSource();
        noise.buffer = buf;

        const f = offlineCtx.createBiquadFilter();
        f.type = isWind ? 'lowpass' : 'highpass';
        f.frequency.setValueAtTime(isWind ? 800 * basePitch : 3000 * basePitch, start);
        if (isWind) {
          f.frequency.setValueAtTime(400, start + dur * 0.3);
          f.frequency.linearRampToValueAtTime(1200, start + dur);
        }

        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(0, start);
        g.gain.linearRampToValueAtTime(gain, start + 0.05);
        g.gain.linearRampToValueAtTime(gain * 0.8, start + dur * 0.8);
        g.gain.linearRampToValueAtTime(0, start + dur);

        noise.connect(f); f.connect(g); g.connect(mainMix);
        noise.start(start); noise.stop(start + dur);
      }
      else if (name === 'fire_crackle') {
        // Compound tool: wind_noise base + paper_crumble texture
        // Wind layer (low rumble)
        const windBuf = offlineCtx.createBuffer(1, sampleRate * dur, sampleRate);
        const windData = windBuf.getChannelData(0);
        for (let i = 0; i < windData.length; i++) windData[i] = (Math.random() * 2 - 1) * 0.6;
        const windNoise = offlineCtx.createBufferSource();
        windNoise.buffer = windBuf;
        const windFilter = offlineCtx.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.setValueAtTime(600 * basePitch, start);
        const windGain = offlineCtx.createGain();
        windGain.gain.setValueAtTime(gain * 0.5, start);
        windNoise.connect(windFilter); windFilter.connect(windGain); windGain.connect(mainMix);
        windNoise.start(start); windNoise.stop(start + dur);

        // Paper crackle layer (high-frequency pops)
        const crackleCount = Math.floor(dur * 40);
        for (let c = 0; c < crackleCount; c++) {
          const cStart = start + (Math.random() * dur);
          const cDur = 0.01 + Math.random() * 0.03;
          const cBuf = offlineCtx.createBuffer(1, sampleRate * cDur, sampleRate);
          const cData = cBuf.getChannelData(0);
          for (let i = 0; i < cData.length; i++) cData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / cData.length, 3);
          const cNoise = offlineCtx.createBufferSource();
          cNoise.buffer = cBuf;
          const cFilter = offlineCtx.createBiquadFilter();
          cFilter.type = 'highpass';
          cFilter.frequency.value = 2500 + Math.random() * 2000;
          const cGain = offlineCtx.createGain();
          cGain.gain.setValueAtTime(gain * (0.3 + Math.random() * 0.4), cStart);
          cNoise.connect(cFilter); cFilter.connect(cGain); cGain.connect(mainMix);
          cNoise.start(cStart);
        }
      }
      else if (name === 'footstep' || name === 'footstep_dirt' || name === 'footstep_stone') {
        const isStone = name === 'footstep_stone';
        const freq = isStone ? 200 * basePitch : 80 * basePitch;
        const osc = offlineCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(30, start + 0.08);

        const nBuf = offlineCtx.createBuffer(1, sampleRate * 0.1, sampleRate);
        const nData = nBuf.getChannelData(0);
        for (let i = 0; i < nData.length; i++) nData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nData.length, 2);
        const noise = offlineCtx.createBufferSource();
        noise.buffer = nBuf;
        const nFilter = offlineCtx.createBiquadFilter();
        nFilter.type = isStone ? 'highpass' : 'lowpass';
        nFilter.frequency.value = isStone ? 1500 : 400;

        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(gain, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(g); noise.connect(nFilter); nFilter.connect(g); g.connect(mainMix);
        osc.start(start); osc.stop(start + 0.15);
        noise.start(start);
      }
      else if (name === 'explosion' || name === 'boom') {
        // Deep transient + debris tail
        const osc = offlineCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150 * basePitch, start);
        osc.frequency.exponentialRampToValueAtTime(20, start + 0.2);

        const nBuf = offlineCtx.createBuffer(1, sampleRate * dur, sampleRate);
        const nData = nBuf.getChannelData(0);
        for (let i = 0; i < nData.length; i++) nData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nData.length, 1.5);
        const noise = offlineCtx.createBufferSource();
        noise.buffer = nBuf;

        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(gain * 1.5, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(g); noise.connect(g); g.connect(mainMix);
        osc.start(start); osc.stop(start + dur);
        noise.start(start);
      }
      else {
        // Generic impact logic for metal/wood/stone
        const osc = offlineCtx.createOscillator();
        osc.type = name.includes('metal') ? 'square' : 'sine';
        osc.frequency.setValueAtTime(name.includes('metal') ? 2500 : 150, start);
        osc.frequency.exponentialRampToValueAtTime(40, start + 0.1);
        const g = offlineCtx.createGain();
        g.gain.setValueAtTime(gain, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(g); g.connect(mainMix);
        osc.start(start); osc.stop(start + dur);
      }
    }
  });

  const buffer = await offlineCtx.startRendering();
  const data = buffer.getChannelData(0);
  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
  }
  return new Uint8Array(int16.buffer);
}
