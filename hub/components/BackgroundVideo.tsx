
import React, { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  isInitialized?: boolean;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ isInitialized = true }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioPlayed = useRef(false);

  useEffect(() => {
    if (isInitialized && !audioPlayed.current && audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play()
        .then(() => {
          audioPlayed.current = true;
        })
        .catch(e => console.debug("Audio play deferred or blocked"));
    }
  }, [isInitialized]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950">
      {/* Cinematic Abstract Digital Backdrop */}
      <img 
        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
        alt="NEXGEN 2D Dev Backdrop"
        className={`w-full h-full object-cover transition-all duration-[2000ms] ease-out ${
          isInitialized 
            ? 'brightness-[0.4] saturate-[1.1] blur-[1px] scale-105' 
            : 'brightness-[0.2] saturate-[0.8] blur-xl scale-125'
        }`}
      />
      
      {/* Startup Sound Element */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" preload="auto" />

      {/* Depth and Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.9)_100%)]" />
      
      {/* Development Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
             backgroundSize: '100px 100px'
           }} 
      />

      {/* Cybernetic Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
        style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} 
      />

      {/* Scanline Texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
      
      {/* Tech Tint - Adjusted to deep indigo/cyan for the new image */}
      <div className="absolute inset-0 bg-indigo-950/20 mix-blend-overlay" />
    </div>
  );
};

export default BackgroundVideo;
