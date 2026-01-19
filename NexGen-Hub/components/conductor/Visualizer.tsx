
import React, { useRef, useEffect } from 'react';

interface VisualizerProps {
  analyser?: AnalyserNode | null;
  color?: string;
  height?: number;
}

export const Visualizer: React.FC<VisualizerProps> = ({ analyser, color = '#6366f1', height = 100 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationId: number;

    const render = () => {
      animationId = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [analyser, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={height} 
      className="w-full h-full opacity-60"
    />
  );
};
