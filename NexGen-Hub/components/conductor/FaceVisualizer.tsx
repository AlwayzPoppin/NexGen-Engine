
import React, { useEffect, useState, useRef } from 'react';
import { Viseme, VisemeCode } from '../types';

interface FaceVisualizerProps {
  visemes?: Viseme[];
  isPlaying: boolean;
  startTime: number;
  color?: string;
  scale?: number;
}

const VISEME_MAP: Record<VisemeCode, string> = {
  'neutral': 'M 10 50 Q 50 50 90 50',
  'A': 'M 20 50 Q 50 90 80 50 Q 50 20 20 50',
  'E': 'M 15 50 Q 50 70 85 50 Q 50 40 15 50',
  'I': 'M 30 50 Q 50 60 70 50 Q 50 45 30 50',
  'O': 'M 35 50 Q 50 80 65 50 Q 50 20 35 50',
  'U': 'M 40 50 Q 50 65 60 50 Q 50 35 40 50',
  'M': 'M 10 50 Q 50 51 90 50',
  'L': 'M 20 45 Q 50 55 80 45 L 50 65 Z',
  'F': 'M 15 48 Q 50 52 85 48 L 50 55 Z',
  'S': 'M 10 49 Q 50 50 90 49 L 50 51 Z',
};

export const FaceVisualizer: React.FC<FaceVisualizerProps> = ({ 
  visemes, 
  isPlaying, 
  startTime, 
  color = '#6366f1',
  scale = 1
}) => {
  const [currentPath, setCurrentPath] = useState(VISEME_MAP['neutral']);
  const requestRef = useRef<number>(null);

  useEffect(() => {
    if (!isPlaying || !visemes || visemes.length === 0) {
      setCurrentPath(VISEME_MAP['neutral']);
      return;
    }

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const currentViseme = [...visemes]
        .reverse()
        .find(v => v.time <= elapsed);
      
      if (currentViseme) {
        setCurrentPath(VISEME_MAP[currentViseme.code] || VISEME_MAP['neutral']);
      } else {
        setCurrentPath(VISEME_MAP['neutral']);
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, visemes, startTime]);

  return (
    <div className="flex items-center justify-center pointer-events-none" style={{ transform: `scale(${scale})` }}>
      <svg width="100" height="100" viewBox="0 0 100 100" className="filter drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">
        <path 
          d={currentPath} 
          fill="none" 
          stroke={color} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-all duration-75 ease-in-out"
        />
        {/* Glow behind the mouth */}
        <path 
          d={currentPath} 
          fill="none" 
          stroke={color} 
          strokeWidth="12" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="opacity-10 transition-all duration-75 ease-in-out blur-md"
        />
      </svg>
    </div>
  );
};
