import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock } from 'lucide-react';
import { useGame } from '../../context/GameContext';

const EmergencyAlert = () => {
    const { activeQuest, completeQuest } = useGame();
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (activeQuest && activeQuest.deadline) {
            const updateTimer = () => {
                const now = Date.now();
                const deadline = new Date(activeQuest.deadline).getTime();
                const diff = Math.max(0, Math.floor((deadline - now) / 1000));
                setTimeLeft(diff);

                if (diff === 0) {
                    // Time's up! Logic could go here (auto-fail).
                    // For now, let's keep it manual or visual.
                }
            };

            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }, [activeQuest]);

    if (!activeQuest) return null;
    if (activeQuest.title === 'REDEMPTION ARC') return null;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                {/* Red Glitch Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-900 mix-blend-overlay animate-pulse"
                />

                {/* Content */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-black/90 border-2 border-red-600 p-8 rounded-xl max-w-md w-full text-center relative pointer-events-auto shadow-[0_0_50px_rgba(220,38,38,0.5)]"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 animate-pulse" />

                    <div className="flex justify-center mb-4">
                        <AlertTriangle size={64} className="text-red-500 animate-bounce" />
                    </div>

                    <h2 className="text-3xl font-bold font-heading text-red-500 mb-2 tracking-widest uppercase glitch-text">
                        {activeQuest.title}
                    </h2>

                    <p className="text-red-300 font-mono mb-6 text-lg border-y border-red-500/30 py-4">
                        {activeQuest.description}
                    </p>

                    <div className="flex justify-between items-center bg-red-950/50 p-4 rounded mb-6 border border-red-500/30">
                        <div className="text-left">
                            <span className="text-xs text-red-400 uppercase block">Goal</span>
                            <span className="text-xl font-bold text-white">{activeQuest.target} Reps</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-red-400 uppercase block">Time Remaining</span>
                            <span className="text-2xl font-mono font-bold text-white flex items-center gap-2 justify-end">
                                <Clock size={16} /> {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs text-gray-500 italic">
                            Failure Penalty: {Math.abs(activeQuest.penalty.coins)} Coins deducted.
                        </p>

                        <button
                            onClick={() => completeQuest(true)} // Mock Success for Button
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded relative overflow-hidden group transition-colors"
                        >
                            <span className="relative z-10">ACCEPT QUEST</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EmergencyAlert;
