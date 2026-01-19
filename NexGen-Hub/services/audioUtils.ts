
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: BaseAudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Ensure we are reading the correct number of samples from the Uint8Array view
  const actualByteLength = data.byteLength;
  const numSamples = Math.floor(actualByteLength / 2);
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, numSamples);
  
  // Enforce a minimum of 1 frame to prevent "The number of frames provided (0) is less than or equal to minimum bound (0)"
  const frameCount = Math.max(1, Math.floor(numSamples / numChannels));
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    // Only copy if we actually have samples
    if (numSamples > 0) {
      for (let i = 0; i < frameCount; i++) {
        const idx = i * numChannels + channel;
        if (idx < dataInt16.length) {
          channelData[i] = dataInt16[idx] / 32768.0;
        }
      }
    }
  }
  return buffer;
}

/**
 * Procedurally generates an impulse response for a reverb effect.
 */
export function createImpulseResponse(ctx: BaseAudioContext, duration: number, decay: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  // Ensure length is at least 1 to prevent "Frames provided (0) is less than or equal to minimum bound" error
  const length = Math.max(1, Math.floor(sampleRate * Math.max(0.01, duration)));
  const impulse = ctx.createBuffer(2, length, sampleRate);
  
  for (let i = 0; i < 2; i++) {
    const channelData = impulse.getChannelData(i);
    for (let j = 0; j < length; j++) {
      channelData[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, Math.max(0.1, decay));
    }
  }
  return impulse;
}

export function pcmToWav(pcmData: Uint8Array, sampleRate: number): Blob {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  view.setUint32(0, 0x52494646, false); // RIFF
  view.setUint32(4, 36 + pcmData.length, true); // size
  view.setUint32(8, 0x57415645, false); // WAVE
  view.setUint32(12, 0x666d7420, false); // fmt 
  view.setUint32(16, 16, true); // subchunk size
  view.setUint16(20, 1, true); // format (PCM)
  view.setUint16(22, 1, true); // channels
  view.setUint32(24, sampleRate, true); // rate
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  view.setUint32(36, 0x64617461, false); // data
  view.setUint32(40, pcmData.length, true); // data size
  return new Blob([header, pcmData], { type: 'audio/wav' });
}
