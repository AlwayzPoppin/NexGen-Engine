
import React, { useRef, useEffect } from 'react';

interface WaveformDisplayProps {
  pcmData: Uint8Array;
  color?: string;
  height?: number;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ pcmData, color = '#6366f1', height = 40 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !pcmData) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength / 2);
    const width = canvas.width;
    const step = Math.ceil(data.length / width);
    const amp = canvas.height / 2;

    ctx.clearRect(0, 0, width, canvas.height);
    
    // Create a vibrant gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, color);

    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j] / 32768;
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      // Add a subtle bloom effect
      ctx.shadowBlur = 4;
      ctx.shadowColor = color;
      
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();
  }, [pcmData, color]);

  return <canvas ref={canvasRef} width={400} height={height} className="w-full h-full" />;
};
