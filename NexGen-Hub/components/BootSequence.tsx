import React, { useState, useEffect } from 'react';
import { BrainCircuit, Cpu, Database, Wifi, Shield, Activity, Lock, Unlock, Zap } from 'lucide-react';

interface BootSequenceProps {
    onComplete: () => void;
}

const BootSequence: React.FC<BootSequenceProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [log, setLog] = useState<string[]>([]);

    // BIOS Boot Logs
    const bootLogs = [
        "BIOS DATE 01/12/26 22:33:11 VER 9.0.2",
        "NEXGEN PRO KERNEL... OK",
        "MEM CHECK: 64TB QUANTUM RAM... OK",
        "LOADING VIRTUAL DOM... OK",
        "INITIALIZING REACT FIBER... OK",
        "MOUNTING LUCIDE ICONS... OK",
        "CONNECTING TO NEURAL CLOUD... [ESTABLISHED]",
        "SYNCING ASSET PIPELINE... [READY]",
        "SYSTEM INTEGRITY VERIFIED.",
        "ACCESS GRANTED."
    ];

    useEffect(() => {
        // Log Scrolling Effect
        if (step === 0) {
            let logIndex = 0;
            const interval = setInterval(() => {
                if (logIndex >= bootLogs.length) {
                    clearInterval(interval);
                    setTimeout(() => setStep(1), 500); // Move to Logo
                    return;
                }
                setLog(prev => [...prev, bootLogs[logIndex]]);
                logIndex++;
            }, 100); // Speed of logs
            return () => clearInterval(interval);
        }

        // Logo Reveal & Unlock
        if (step === 1) {
            setTimeout(() => setStep(2), 2000); // Hold Logo
        }

        // Completion
        if (step === 2) {
            setTimeout(onComplete, 800); // Fade out
        }
    }, [step]);

    return (
        <div className={`absolute inset-0 z-[100] bg-black text-cyan-500 font-mono flex flex-col items-center justify-center transition-opacity duration-1000 ${step === 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Scanline */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-20" />

            {/* STAGE 0: BIOS LOGS */}
            {step === 0 && (
                <div className="w-full max-w-2xl p-10 z-20">
                    <div className="flex items-center gap-4 mb-8 border-b border-cyan-500/30 pb-4">
                        <Cpu className="animate-pulse" />
                        <h1 className="text-xl font-black tracking-[0.5em] text-white">NEXGEN BIOS v9.0</h1>
                    </div>
                    <div className="space-y-1">
                        {log.map((line, i) => (
                            <p key={i} className="text-xs md:text-sm text-cyan-400/80 font-bold tracking-wider">
                                <span className="text-slate-500 mr-2">{`>`}</span>
                                {line}
                            </p>
                        ))}
                        <p className="text-xs md:text-sm text-cyan-400 font-bold animate-pulse">_</p>
                    </div>
                </div>
            )}

            {/* STAGE 1: LOGO FORM */}
            {step >= 1 && (
                <div className="relative z-20 flex flex-col items-center animate-in zoom-in duration-500">
                    <div className="relative w-32 h-32 mb-8">
                        {/* Spinning Rings */}
                        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-2 border-2 border-cyan-500/40 rounded-full animate-[spin_2s_linear_infinite_reverse]" />

                        {/* Central Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BrainCircuit size={64} className="text-cyan-400 animate-pulse drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black tracking-[0.5em] text-white mb-2 animate-in slide-in-from-bottom-5 duration-700">
                        NEXGEN
                    </h1>
                    <div className="flex items-center gap-2 text-cyan-400 text-xs tracking-[0.3em] font-bold uppercase animate-in slide-in-from-bottom-5 duration-1000 delay-200">
                        <Lock size={12} />
                        <span>System Unlocked</span>
                    </div>
                </div>
            )}

            {/* Skip Button */}
            <button
                onClick={onComplete}
                className="absolute bottom-8 right-8 text-[10px] text-slate-600 hover:text-white uppercase tracking-widest font-bold z-50 transition-colors"
            >
                [Esc] Skip Initialization
            </button>
        </div>
    );
};

export default BootSequence;
