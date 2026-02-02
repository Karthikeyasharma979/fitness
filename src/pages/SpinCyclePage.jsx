import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Timer, Trophy, Bike, Flame, Activity } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/button';

const SpinCyclePage = () => {
    const navigate = useNavigate();
    const { addXp } = useGame();

    // States: SETUP, ACTIVE, PAUSED, COMPLETE
    const [phase, setPhase] = useState('SETUP');
    const [targetTime, setTargetTime] = useState(30); // minutes
    const [timeLeft, setTimeLeft] = useState(30 * 60);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showReward, setShowReward] = useState(false);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (phase === 'ACTIVE' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleFinish();
                        return 0;
                    }
                    return prev - 1;
                });
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [phase, timeLeft]);

    const handleStart = () => {
        setTimeLeft(targetTime * 60);
        setPhase('ACTIVE');
    };

    const handlePause = () => {
        setPhase(prev => prev === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
    };

    const handleFinish = () => {
        setPhase('COMPLETE');
        const xpEarned = Math.floor(elapsedTime / 60) * 5; // 5 XP per minute
        addXp(xpEarned > 75 ? xpEarned : 75); // Minimum 75 XP for completion
        setShowReward(true);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate simulated stats
    const caloriesBurned = Math.floor(elapsedTime * 0.15); // Approx 9 kcal/min
    const distanceKm = (elapsedTime / 3600 * 25).toFixed(2); // Approx 25 km/h avg

    return (
        <div className="min-h-screen bg-background p-4 pb-20 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
            </div>

            <header className="flex items-center gap-4 mb-8 relative z-10">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold font-heading italic text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                    DUNGEON: CYCLONE PATH
                </h1>
            </header>

            <div className="max-w-md mx-auto relative z-10">

                {/* SETUP PHASE */}
                {phase === 'SETUP' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 rounded-2xl space-y-8 border-green-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                    >
                        <div className="text-center space-y-2">
                            <Bike size={48} className="mx-auto text-green-500 mb-4" />
                            <h2 className="text-3xl font-black font-heading text-white">CONFIGURE RIDE</h2>
                            <p className="text-emerald-400 font-mono text-sm">Select duration protocol</p>
                        </div>

                        <div className="space-y-4">
                            {[15, 30, 45, 60].map(time => (
                                <button
                                    key={time}
                                    onClick={() => setTargetTime(time)}
                                    className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all duration-300 ${targetTime === time
                                            ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="font-bold text-xl">{time} MIN</span>
                                    <span className="text-xs font-mono opacity-70">TARGET</span>
                                </button>
                            ))}
                        </div>

                        <Button
                            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-6 text-xl tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                            onClick={handleStart}
                        >
                            INITIATE
                        </Button>
                    </motion.div>
                )}

                {/* ACTIVE / PAUSED PHASE */}
                {(phase === 'ACTIVE' || phase === 'PAUSED') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8 text-center"
                    >
                        {/* Main Timer Circle */}
                        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                            {/* Animated SVG Ring */}
                            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                                <circle
                                    cx="128" cy="128" r="120"
                                    stroke="#1f2937" strokeWidth="8" fill="none"
                                />
                                <motion.circle
                                    cx="128" cy="128" r="120"
                                    stroke="#22c55e" strokeWidth="8" fill="none"
                                    strokeLinecap="round"
                                    strokeDasharray="754"
                                    animate={{
                                        strokeDashoffset: 754 - (754 * timeLeft / (targetTime * 60))
                                    }}
                                    transition={{ duration: 1, ease: "linear" }}
                                />
                            </svg>

                            <div className="relative z-10 flex flex-col items-center">
                                <span className="text-xs text-green-500 uppercase tracking-[0.2em] mb-2">{phase === 'PAUSED' ? 'SYSTEM PAUSED' : 'TIME REMAINING'}</span>
                                <span className={`text-6xl font-black font-mono tracking-tighter ${phase === 'PAUSED' ? 'animate-pulse text-gray-500' : 'text-white'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* Live Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/40 p-4 rounded-xl border border-green-500/20 backdrop-blur-sm">
                                <div className="flex items-center justify-center gap-2 mb-1 text-emerald-400">
                                    <Flame size={16} /> <span className="text-xs font-bold uppercase">Energy</span>
                                </div>
                                <p className="text-2xl font-bold text-white font-mono">{caloriesBurned}</p>
                                <p className="text-[10px] text-gray-500 uppercase">kcal burned</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl border border-green-500/20 backdrop-blur-sm">
                                <div className="flex items-center justify-center gap-2 mb-1 text-emerald-400">
                                    <Activity size={16} /> <span className="text-xs font-bold uppercase">Distance</span>
                                </div>
                                <p className="text-2xl font-bold text-white font-mono">{distanceKm}</p>
                                <p className="text-[10px] text-gray-500 uppercase">km est.</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1 border-white/20 hover:bg-white/10 py-6"
                                onClick={handlePause}
                            >
                                {phase === 'ACTIVE' ? 'PAUSE' : 'RESUME'}
                            </Button>
                            <Button
                                className="flex-1 bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500/40 py-6"
                                onClick={handleFinish}
                            >
                                FINISH
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* COMPLETE PHASE / REWARD */}
                <AnimatePresence>
                    {showReward && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.5, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                className="glass-card max-w-sm w-full p-8 text-center space-y-6 border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.2)]"
                            >
                                <div className="w-24 h-24 rounded-full bg-green-500/20 mx-auto flex items-center justify-center border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                                    <Trophy size={48} className="text-green-400" />
                                </div>

                                <div>
                                    <h2 className="text-3xl font-black italic text-white mb-2">DUNGEON CLEARED</h2>
                                    <p className="text-green-400 font-mono text-sm">Cyclone Path Conquered</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-left bg-black/40 p-4 rounded-lg border border-white/5">
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase block">Duration</span>
                                        <span className="text-white font-mono">{Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase block">Distance</span>
                                        <span className="text-white font-mono">{distanceKm} km</span>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-white/10 mt-2">
                                        <span className="text-xs text-gray-500 uppercase block">Rewards</span>
                                        <div className="flex items-center gap-2 text-green-400 font-bold">
                                            <span>+{Math.floor(elapsedTime / 60) * 5 > 75 ? Math.floor(elapsedTime / 60) * 5 : 75} XP</span>
                                            <span>+1 Leg Strength</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    CLAIM & RETURN
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SpinCyclePage;
