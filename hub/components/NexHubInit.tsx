import React, { useState, useEffect } from 'react';
import { Zap, Activity } from 'lucide-react';
import BackgroundVideo from './BackgroundVideo';

interface NexHubInitProps {
    onInitialize: () => void;
}

const NexHubInit: React.FC<NexHubInitProps> = ({ onInitialize }) => {
    const [pulse, setPulse] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setPulse(p => !p), 2000);
        return () => clearInterval(interval);
    }, []);

    const handleHandshake = () => {
        setLoading(true);
        setTimeout(() => {
            onInitialize();
        }, 1500);
    };

    return (
        <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
            <BackgroundVideo isInitialized={false} />

            <div className={`z-10 transition-all duration-1000 ${loading ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100'}`}>
                <div className="relative group cursor-pointer mb-12">
                    {/* Logo Glow */}
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full scale-150 animate-pulse" />

                    <div className="relative flex flex-col items-center">
                        <div className="w-24 h-24 bg-cyan-500 rounded-[2rem] flex items-center justify-center text-slate-950 shadow-[0_0_80px_rgba(6,182,212,0.4)] mb-8 transition-transform group-hover:scale-110 duration-500">
                            <Zap size={48} fill="currentColor" />
                        </div>

                        <h1 className="font-orbitron text-7xl font-black tracking-tighter text-white select-none">
                            NEXGEN<span className="text-cyan-400">HUB</span>
                        </h1>

                        <div className="flex items-center gap-4 mt-6">
                            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-500/50" />
                            <div className="flex items-center gap-2 text-cyan-400/60 font-mono text-[10px] tracking-[0.4em] uppercase font-black">
                                <Activity size={12} className="animate-pulse" />
                                <span>NexGen Engine Core v1.0.0 // Neural Sync Active</span>
                            </div>
                            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-500/50" />
                        </div>
                    </div>
                </div>

                <div className="mt-16 relative">
                    <button
                        onClick={handleHandshake}
                        disabled={loading}
                        className="group relative px-16 py-6 bg-transparent border border-cyan-500/30 hover:border-cyan-400 rounded-2xl overflow-hidden transition-all active:scale-95 shadow-[0_0_60px_rgba(6,182,212,0.1)] hover:shadow-[0_0_80px_rgba(6,182,212,0.2)]"
                    >
                        {/* Inner Glow Background */}
                        <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />

                        {/* Animated Border/Glow effect */}
                        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />

                        <span className="relative z-10 text-cyan-400 group-hover:text-white font-orbitron font-black tracking-[0.3em] text-sm flex items-center gap-4">
                            OPEN HUB
                        </span>
                    </button>

                    <div className="mt-8 flex flex-col items-center gap-2">
                        <p className="text-[9px] text-slate-700 font-mono uppercase tracking-[0.5em] animate-pulse">
                            Encryption Protocol: NGE-v1-Alpha
                        </p>
                        <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-cyan-500/30 w-1/3 animate-[loading_2s_infinite_linear]"
                                style={{
                                    backgroundImage: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
                                    backgroundSize: '200% 100%'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
};

export default NexHubInit;
