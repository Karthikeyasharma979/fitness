import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/button';
import { ArrowLeft, Timer, Trophy, Flame, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WORKOUTS = [
    { id: 1, title: 'Shadow Boxing', rank: 'E', time: '10 min', xp: 50, type: 'AGI' },
    { id: 2, title: 'Push-up Barrage', rank: 'D', time: '15 min', xp: 100, type: 'STR' },
    { id: 3, title: 'Core Crusher', rank: 'C', time: '20 min', xp: 150, type: 'END' },
    { id: 4, title: 'Bicycle Burn', rank: 'B', time: '15 min', xp: 120, type: 'END' },
    { id: 5, title: 'Limit Break HIIT', rank: 'S', time: '45 min', xp: 500, type: 'ALL' },
];

const WARM_UP_EXERCISES = [
    { name: "Arm Swings", duration: "1 min" },
    { name: "Side Rotations", duration: "1 min" },
    { name: "Hip Rotations", duration: "1 min" },
    { name: "Knee Rotations", duration: "30s" },
    { name: "Ankle Rotations", duration: "30s" },
    { name: "Wrist Rotations", duration: "30s" }
];

const WORKOUT_EXERCISES = {
    1: { // Shadow Boxing
        "Agility & Cardio": ["Arm Swings", "Side Rotations", "Side Legs", "Jumping Jacks", "Standing Crunches"]
    },
    2: { // Push-up Barrage
        "Strength": ["Pushups", "Squats", "Calf Raises"]
    },
    3: { // Core Crusher
        "Core Destruction": ["Knee Touches", "Russian Twists", "Elbow Plank"]
    },
    4: { // Bicycle Burn
        "Endurance Burn": ["Bicycles"]
    },
    5: { // Limit Break HIIT
        "Upper Body": ["Pushups", "Dumbbell Rows", "Shoulder Press", "Front Raises", "Lateral Raises", "Bicep Curls", "Tricep Kickbacks"],
        "Lower Body & Core": ["Squats", "Knee Touches", "Russian Twists", "Elbow Plank"]
    }
};

const RankBadge = ({ rank }) => {
    const colors = {
        'E': 'text-gray-400 border-gray-400',
        'D': 'text-green-400 border-green-400',
        'C': 'text-blue-400 border-blue-400',
        'B': 'text-purple-400 border-purple-400',
        'A': 'text-orange-400 border-orange-400',
        'S': 'text-red-500 border-red-500 animate-pulse shadow-[0_0_10px_red]'
    };
    return (
        <span className={`w-8 h-8 flex items-center justify-center border font-bold rounded ${colors[rank] || colors['E']}`}>
            {rank}
        </span>
    );
};

// Sub-component for individual exercise timers
const ExerciseItem = ({ name, target }) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <li className="flex items-center justify-between text-lg p-2 hover:bg-white/5 rounded transition-colors">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`p-2 rounded-full border ${isRunning ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-neon-blue text-neon-blue hover:bg-neon-blue/10'}`}
                >
                    {isRunning ? <span className="font-mono text-xs">STOP</span> : <Timer size={16} />}
                </button>
                <div className="flex flex-col">
                    <span>{name}</span>
                    {time > 0 && <span className="text-xs font-mono text-neon-blue">{formatTime(time)}</span>}
                </div>
            </div>
            <span className="text-white/50 text-sm font-mono">{target}</span>
        </li>
    );
};

const WorkoutPage = () => {
    const navigate = useNavigate();
    const { addXp, addCoins, completeDailyWorkout, dailyProgress, stats } = useGame();

    const COIN_REWARDS = { E: 20, D: 40, C: 70, B: 100, S: 250 };

    // State
    const [activePhase, setActivePhase] = useState('IDLE'); // IDLE, WARMUP, WORKOUT, COMPLETE
    const [activeWorkout, setActiveWorkout] = useState(null);
    const [roundNumber, setRoundNumber] = useState(1);
    const [showReward, setShowReward] = useState(null);

    // Derived Global Completion State
    const isAllDailyComplete = useMemo(() => {
        const today = new Date().toLocaleDateString('en-CA');
        const mandatoryIds = [1, 2, 3, 4];
        if (dailyProgress.date !== today) return false;
        return mandatoryIds.every(id => dailyProgress.completedIds.includes(id));
    }, [dailyProgress]);

    // Global Timer State
    const [elapsedTime, setElapsedTime] = useState(0);

    const SETS_BY_RANK = { 'E': 1, 'D': 2, 'C': 3, 'B': 4, 'A': 4, 'S': 4 };
    // Sets are determined by the Hunter's Rank (Player Level), scaling difficulty with the player.
    const maxSets = stats.rank ? SETS_BY_RANK[stats.rank] || 1 : 1;

    // Derived State
    const currentReps = 10 + (roundNumber - 1) * 5;
    const currentExercises = activeWorkout ? WORKOUT_EXERCISES[activeWorkout.id] : {};

    // Global Timer Effect
    useEffect(() => {
        let interval;
        if (activePhase === 'WORKOUT') {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activePhase]);

    const formatMainTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStart = (workout) => {
        setActiveWorkout(workout);
        setRoundNumber(1);
        setElapsedTime(0); // Reset timer

        // Only Shadow Boxing (ID: 1) has a mandatory Warm-up phase
        if (workout.id === 1) {
            setActivePhase('WARMUP');
        } else {
            setActivePhase('WORKOUT');
        }
    };

    const handleCompleteWarmup = () => {
        setActivePhase('WORKOUT');
    };

    const handleCompleteRound = () => {
        const nextRound = roundNumber + 1;

        if (roundNumber >= maxSets) {
            finishWorkout();
        } else {
            setRoundNumber(nextRound);
            window.scrollTo(0, 0);
        }
    };

    const finishWorkout = () => {
        const coins = COIN_REWARDS[activeWorkout.rank] || 20;
        addXp(activeWorkout.xp);
        addCoins(coins);
        setShowReward({ ...activeWorkout, coinsEarned: coins });

        setShowReward({ ...activeWorkout, coinsEarned: coins });

        // Mark as complete for today via Context
        completeDailyWorkout(activeWorkout.id);

        setActivePhase('IDLE'); // Reset phase but show reward
        setActiveWorkout(null);
    };

    const handleBack = () => {
        if (activePhase === 'IDLE') {
            navigate('/dashboard');
        } else {
            setActivePhase('IDLE');
            setActiveWorkout(null);
        }
    };

    // If daily limit reached and no active valid workout (just in case)
    // We render the "All Complete" view.
    if (isAllDailyComplete && !showReward && activePhase === 'IDLE') {
        return (
            <div className="min-h-screen bg-background p-4 pb-20 flex flex-col items-center justify-center text-center space-y-6">
                <header className="absolute top-4 left-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft />
                    </Button>
                </header>

                <div className="p-8 border border-neon-blue/30 bg-black/50 rounded-2xl backdrop-blur-md max-w-md w-full relative overflow-hidden">
                    {/* System Window Header */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-neon-blue/50 shadow-[0_0_10px_#00f0ff]"></div>

                    <CheckCircle size={64} className="mx-auto text-green-500 mb-4 animate-pulse" />
                    <h2 className="text-3xl font-heading text-white mb-2">DAILY QUEST COMPLETE</h2>
                    <p className="text-gray-400">You have completed your training for today.</p>
                    <div className="my-6 p-4 bg-neon-blue/10 rounded-lg border border-neon-blue/20">
                        <p className="text-neon-blue font-bold tracking-widest uppercase text-sm">Next Quest Available In</p>
                        <p className="text-2xl font-mono text-white mt-1">TOMORROW</p>
                    </div>
                    <Button variant="neon" className="w-full" onClick={() => navigate('/dashboard')}>
                        RETURN TO LOBBY
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-4 pb-20">
            <header className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold font-heading">
                    {activeWorkout ? activeWorkout.title : "DUNGEON: HOME GYM"}
                </h1>
            </header>

            {/* IDLE PHASE */}
            {activePhase === 'IDLE' && (
                <div className="grid md:grid-cols-2 gap-4">
                    {WORKOUTS.map(workout => {
                        const isComplete = dailyProgress.completedIds.includes(workout.id);
                        return (
                            <motion.div
                                key={workout.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`glass-card p-6 rounded-xl relative overflow-hidden group transition-all ${isComplete ? 'opacity-60 border-green-900/50' : 'hover:border-neon-blue/50'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className={`text-xl font-bold ${isComplete ? 'text-green-500 line-through' : ''}`}>{workout.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Timer size={14} /> <span>{workout.time}</span>
                                            <span className="text-neon-blue ml-2">{workout.type} +1</span>
                                        </div>
                                    </div>
                                    <RankBadge rank={workout.rank} />
                                </div>

                                <div className="flex justify-between items-center mt-6">
                                    <div className="text-xs bg-white/5 px-2 py-1 rounded text-white/50">
                                        REWARD: <span className="text-white font-bold">{workout.xp} XP</span>
                                    </div>

                                    {isComplete ? (
                                        <Button
                                            variant="ghost"
                                            disabled
                                            className="text-green-500 border border-green-900/50 bg-green-900/20"
                                        >
                                            <CheckCircle size={16} className="mr-2" /> CLEARED
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="neon"
                                            onClick={() => handleStart(workout)}
                                        >
                                            START RAID
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* WARMUP PHASE */}
            {activePhase === 'WARMUP' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl mx-auto border border-neon-blue/30 bg-black/50 p-6 rounded-xl backdrop-blur-md relative overflow-hidden"
                >
                    {/* System Window Header */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-neon-blue/50 shadow-[0_0_10px_#00f0ff]"></div>

                    <h2 className="text-3xl font-heading text-neon-blue mb-6 text-center tracking-wider">WARM UP PHASE</h2>

                    <div className="space-y-3 mb-8">
                        {WARM_UP_EXERCISES.map((exercise, index) => (
                            <ExerciseItem
                                key={index}
                                name={exercise.name}
                                target={exercise.duration}
                            />
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 text-gray-400 border-gray-600 hover:text-white"
                            onClick={handleCompleteWarmup}
                        >
                            SKIP
                        </Button>
                        <Button
                            variant="neon"
                            className="flex-[2] text-lg py-6"
                            onClick={handleCompleteWarmup}
                        >
                            COMPLETE WARM-UP
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* WORKOUT PHASE */}
            {activePhase === 'WORKOUT' && (
                <motion.div
                    key={roundNumber}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-2xl mx-auto space-y-6"
                >
                    <div className="flex justify-between items-end border-b border-white/10 pb-4">
                        <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-widest">Current Phase</p>
                            <h2 className="text-4xl font-black font-heading text-white">ROUND {roundNumber} <span className="text-gray-500 text-2xl">/ {maxSets}</span></h2>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-neon-blue uppercase tracking-widest">Time Elapsed</p>
                            <h2 className="text-4xl font-black font-heading text-neon-blue font-mono">{formatMainTime(elapsedTime)}</h2>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {Object.entries(currentExercises).map(([category, exercises]) => (
                            <div key={category} className="bg-white/5 border border-white/10 p-5 rounded-xl">
                                <h3 className="text-neon-purple font-bold mb-3 uppercase text-sm tracking-wider">{category}</h3>
                                <ul className="space-y-2">
                                    {exercises.map((ex, i) => (
                                        <ExerciseItem
                                            key={i}
                                            name={ex}
                                            target={ex.includes('(Secs)') ? `${currentReps}s` : `x ${currentReps}`}
                                        />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <Button
                        variant="neon"
                        className="w-full text-xl py-8 mt-8 animate-pulse"
                        onClick={handleCompleteRound}
                    >
                        {roundNumber >= maxSets ? "COMPLETE DUNGEON" : `COMPLETE ROUND ${roundNumber}`}
                    </Button>
                </motion.div>
            )}

            {/* Level Up / Reward Modal Overlay */}
            <AnimatePresence>
                {showReward && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowReward(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 100 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.5, y: 100 }}
                            className="text-center space-y-4 p-8 rounded-2xl bg-black border border-neon-blue box-glow"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Trophy size={64} className="mx-auto text-yellow-400 animate-bounce" />
                            <div>
                                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                    QUEST COMPLETE
                                </h2>
                                <p className="text-xl mt-2 text-white">
                                    {showReward.title} Cleared
                                </p>
                            </div>
                            <div className="text-4xl font-bold text-neon-blue text-neon-blue-glow">
                                +{showReward.xp} XP
                            </div>
                            <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-2 mt-2">
                                <span className="text-yellow-400">+{showReward.coinsEarned} Coins</span>
                            </div>
                            <Button className="w-full" variant="outline" onClick={() => setShowReward(null)}>
                                CLAIM REWARD
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkoutPage;
