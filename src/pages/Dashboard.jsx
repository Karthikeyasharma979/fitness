import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Sword, Zap, Shield, Flame, Activity, Settings, X, CheckCircle, Coins, ShoppingBag, Package, AlertTriangle } from 'lucide-react';
import StreakCalendar from '../components/dashboard/StreakCalendar';
import EmergencyAlert from '../components/ui/EmergencyAlert';

const colorStyles = {
    "neon-blue": "bg-neon-blue/10 text-neon-blue border-neon-blue/20",
    "neon-purple": "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
    "accent": "bg-accent/10 text-accent border-accent/20",
    "green": "bg-green-500/10 text-green-500 border-green-500/20"
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="glass-card p-4 rounded-xl flex items-center space-x-4 hover:bg-white/5 transition-colors duration-300">
        <div className={`p-3 rounded-lg border ${colorStyles[color] || colorStyles['neon-blue']}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-bold font-heading">{value}</p>
        </div>
    </div>
);

const SettingsModal = ({ isOpen, onClose, user, onUpdate, onDemoData, onReset }) => {
    const [formData, setFormData] = useState({
        height: user.height || '',
        weight: user.weight || '',
        target_weight: user.target_weight || ''
    });
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-black border ${showResetConfirm ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]' : 'border-neon-blue/50'} p-6 rounded-xl w-full max-w-md space-y-4 relative overflow-hidden transition-all duration-300`}
            >
                {showResetConfirm ? (
                    <div className="text-center space-y-6">
                        <div className="animate-pulse">
                            <AlertTriangle size={64} className="mx-auto text-red-600 mb-4" />
                            <h2 className="text-3xl font-black text-red-600 tracking-wider">SYSTEM WARNING</h2>
                        </div>
                        <p className="text-red-400 font-mono text-sm leading-relaxed border-y border-red-900/50 py-4">
                            IRREVERSIBLE ACTION DETECTED.<br />
                            This will wipe ALL progress (Level, Stats, Items).<br />
                            Are you absolutely sure?
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowResetConfirm(false)}
                                className="border-gray-500 text-gray-400 hover:text-white font-mono"
                            >
                                CANCEL
                            </Button>
                            <Button
                                type="button"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest font-mono shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                                onClick={onReset}
                            >
                                CONFIRM RESET
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-neon-blue">SYSTEM SETTINGS</h2>
                            <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Current Height (cm)</label>
                                <Input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Current Weight (kg)</label>
                                <Input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Target Weight (kg)</label>
                                <Input
                                    type="number"
                                    value={formData.target_weight}
                                    onChange={(e) => setFormData({ ...formData, target_weight: e.target.value })}
                                    placeholder="Set your goal..."
                                />
                            </div>

                            <div className="pt-2 space-y-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-xs text-gray-500 hover:text-white border-gray-800"
                                    onClick={onDemoData}
                                >
                                    [DEV] POPULATE DEMO DATA
                                </Button>

                                <Button type="submit" variant="neon" className="w-full">UPDATE STATS</Button>

                                <Button
                                    type="button"
                                    className="w-full text-xs text-red-600 hover:text-red-400 bg-transparent hover:bg-red-950/30 border border-red-900/50"
                                    onClick={() => setShowResetConfirm(true)}
                                >
                                    [DANGER] RESET PROGRESS
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

const Dashboard = () => {
    const { user, stats, addXp, updateUserProfile, unlockedSkills, loginHistory, triggerEmergencyQuest, activeQuest, generateDemoData, resetGame, claimMysteryGift, addLog, systemLogs, penalties, generateRedemptionQuest, completeQuest, dailyProgress } = useGame();
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);
    // Removed local systemLogs state

    const hasWelcomed = useRef(false);
    const [giftClaimed, setGiftClaimed] = useState(false);

    // Check gift status on mount
    useEffect(() => {
        const today = new Date().toLocaleDateString('en-CA');
        const lastGiftDate = localStorage.getItem('ag_last_gift_date');
        setGiftClaimed(lastGiftDate === today);
    }, []);

    const handleClaimGift = () => {
        const result = claimMysteryGift();
        if (result.success) {
            addLog(`SUPPLY CHEST OPENED: +${result.coins} COINS, +${result.xp} XP`);
            setGiftClaimed(true);
        } else {
            addLog('SUPPLY CHEST EMPTY. REFRESH TOMORROW.');
            setGiftClaimed(true); // Sync local state just in case
        }
    };

    // Random Emergency Quest Trigger
    useEffect(() => {
        if (user.isAwakened && !activeQuest && !penalties.warningMode) {
            // Schedule a random trigger between 2 and 15 minutes
            const minDelay = 2 * 60 * 1000; // 2 minutes
            const maxDelay = 15 * 60 * 1000; // 15 minutes
            const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);

            // console.log(`[SYSTEM] Quest scheduled in ${Math.floor(randomDelay/1000)}s`); 

            const timer = setTimeout(() => {
                triggerEmergencyQuest();
            }, randomDelay);

            return () => clearTimeout(timer);
        }
    }, [user.isAwakened, activeQuest, triggerEmergencyQuest, penalties.warningMode]);

    // Check if daily quest is done (Global)
    const isDailyComplete = useMemo(() => {
        const today = new Date().toLocaleDateString('en-CA');
        const mandatoryIds = [1, 2, 3, 4];
        if (dailyProgress.date !== today) return false;
        return mandatoryIds.every(id => dailyProgress.completedIds.includes(id));
    }, [dailyProgress]);

    const checkQuestDone = (id) => {
        const today = new Date().toLocaleDateString('en-CA');
        if (dailyProgress.date !== today) return false;
        return dailyProgress.completedIds.includes(id);
    };

    useEffect(() => {
        if (!user.isAwakened) {
            navigate('/onboarding');
        }
    }, [user, navigate]);

    // Initial Welcome Log
    useEffect(() => {
        if (user.isAwakened && !hasWelcomed.current) {
            addLog("Welcome back, Player.");
            addLog("System initialized.");
            hasWelcomed.current = true;
        }
    }, [user.isAwakened]);

    const handleStartRedemption = () => {
        generateRedemptionQuest();
        addLog("REDEMPTION ARC STARTED: RECOVER STATUS");
    };

    if (!user.isAwakened) return null;

    const handleStartMission = () => {
        navigate('/workout');
    };

    const handleLogCalories = () => {
        const calories = window.prompt("Enter caloric intake:");
        if (calories) {
            addLog(`Calorie Deficit: ${calories}kcal stored.`);
            addLog("Reward: +30 XP");
            addXp(30);
        }
    };

    const handleSpinMission = () => {
        navigate('/spin-cycle');
    };

    const xpPercentage = (stats.xp / stats.maxXp) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`min-h-screen bg-transparent p-4 md:p-8 pb-24 space-y-8 relative z-10 ${penalties.warningMode ? 'shadow-[inset_0_0_100px_rgba(255,0,0,0.2)]' : ''}`}
        >
            <EmergencyAlert />

            {/* FAILURE MODE BANNER */}
            <AnimatePresence>
                {penalties.warningMode && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        className="bg-red-950/80 border-y border-red-600 text-center py-2 overflow-hidden mb-4"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-2 animate-pulse">
                            <AlertTriangle className="text-red-500" />
                            <p className="text-red-200 font-mono tracking-widest text-sm">
                                SYSTEM WARNING: PERFORMANCE CRITICAL. XP REDUCED.
                            </p>
                            {!activeQuest && (
                                <Button
                                    onClick={handleStartRedemption}
                                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-1 h-auto"
                                >
                                    INITIATE REDEMPTION ARC
                                </Button>
                            )}
                            <AlertTriangle className="text-red-500" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                user={user}
                onUpdate={updateUserProfile}
                onDemoData={generateDemoData}
                onReset={resetGame}
            />

            {/* Header / Player Info */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-20">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-neon-blue to-neon-purple p-[3px] animate-aura group-hover:scale-105 transition-transform duration-300">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Avatar" className="w-full h-full" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-black border border-neon-blue text-neon-blue text-xs font-bold px-2 py-0.5 rounded shadow-[0_0_10px_#00f0ff] animate-pulse">
                            LVL {stats.level}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 italic flex items-center gap-3">
                            {user.name}
                            <Settings
                                size={20}
                                className="text-gray-600 hover:text-neon-blue cursor-pointer transition-colors hover:rotate-90 duration-500"
                                onClick={() => setShowSettings(true)}
                            />
                        </h1>
                        <p className="text-neon-blue font-mono tracking-widest text-sm uppercase flex items-center gap-2">
                            <span className="w-2 h-2 bg-neon-blue rounded-full animate-ping"></span>
                            Rank {stats.rank} Hunter
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-1/3 space-y-2 bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="flex justify-between text-xs text-neon-blue font-mono tracking-wider mb-1">
                        <span>XP PROGRESS</span>
                        <span>{stats.xp} / {stats.maxXp}</span>
                    </div>
                    <div className="relative h-4 bg-gray-900 rounded-full overflow-hidden border border-white/10 shadow-inner mb-3">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-blue to-purple-600 transition-all duration-700 ease-out shadow-[0_0_15px_#00f0ff]"
                            style={{ width: `${xpPercentage}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-xs text-yellow-400 font-mono tracking-wider border-t border-white/10 pt-2">
                        <span className='flex items-center gap-1'><ShoppingBag size={12} /> FUNDS</span>
                        <span className="flex items-center gap-1 text-base font-bold text-yellow-500 shadow-glow"><Coins size={14} className="text-yellow-400" /> {stats.coins || 0}</span>
                    </div>
                </div>
            </header>

            {/* System System Log / Notifications */}
            <AnimatePresence>
                {systemLogs.length > 0 && (
                    <div className="fixed top-24 right-8 z-50 flex flex-col gap-4 pointer-events-none">
                        {systemLogs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className="system-window p-4 w-72 backdrop-blur-md pointer-events-auto"
                            >
                                <div className="flex items-center gap-2 mb-2 border-b border-neon-blue/30 pb-1">
                                    <Activity className="text-neon-blue animate-pulse" size={16} />
                                    <p className="text-neon-blue font-anime text-lg tracking-widest">SYSTEM MESSAGE</p>
                                </div>
                                <p className="text-white font-mono text-sm leading-relaxed text-shadow-glow">{log.text}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <div className="grid lg:grid-cols-3 gap-8 items-start mt-8">
                <div className="hidden">
                    <Button onClick={triggerEmergencyQuest}>Test Quest</Button>
                </div>
                {/* DAILY QUEST & STREAK (LEFT COLUMN) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Streak Calendar */}
                    <StreakCalendar streak={stats.streak || 0} history={loginHistory || []} />

                    {/* Quest Card */}
                    <div className="system-window p-1 rounded-none">
                        <div className="bg-black/80 p-6 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent animate-pulse" />

                            {/* REDEMPTION QUEST ACTIVE */}
                            {activeQuest && activeQuest.title === 'REDEMPTION ARC' && (
                                <div className="bg-red-950/30 border border-red-500/50 p-4 rounded-lg mb-4 animate-pulse">
                                    <h3 className="text-xl font-black text-red-500 italic tracking-widest">{activeQuest.title}</h3>
                                    <p className="text-red-200 font-mono text-xs mb-3">{activeQuest.description}</p>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs text-yellow-500">REWARD: {activeQuest.reward.coins} Gold</span>
                                        <span className="text-xs text-red-400">STATUS: ACTIVE</span>
                                    </div>
                                    <Button
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest"
                                        onClick={() => completeQuest(true)}
                                    >
                                        COMPLETE REDEMPTION
                                    </Button>
                                </div>
                            )}

                            {isDailyComplete ? (
                                <div className="flex flex-col items-center justify-center space-y-6 py-10">
                                    <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse">
                                        <CheckCircle size={48} className="text-green-500" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-3xl font-black font-anime text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 italic tracking-tighter">
                                            MISSION COMPLETE
                                        </h2>
                                        <p className="text-neon-blue font-mono text-sm mt-2">Daily Quests Cleared</p>
                                    </div>
                                    <div className="w-full bg-black/40 border border-white/5 p-4 rounded-lg text-center">
                                        <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Next Reset In</p>
                                        <p className="text-xl font-mono text-white">TOMORROW</p>
                                    </div>
                                    <Button
                                        className="w-full bg-green-500/20 text-green-500 border border-green-500 cursor-not-allowed"
                                        disabled
                                    >
                                        QUEST COMPLETED
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center space-y-2">
                                        <Activity className="mx-auto text-neon-blue animate-spin-slow mb-2" size={32} />
                                        <h2 className="text-4xl font-anime text-white italic tracking-tighter">QUEST INFO</h2>
                                        <p className="text-neon-blue text-sm font-mono border-b border-neon-blue/20 pb-4">Main Character Training Arc</p>
                                    </div>

                                    <div className="space-y-4 font-mono text-sm">
                                        <div className="flex justify-between items-center text-gray-300 hover:text-white transition-colors cursor-pointer group" onClick={() => navigate('/workout')}>
                                            <span className={`group-hover:text-neon-blue ${checkQuestDone(1) ? 'text-green-500 line-through' : ''}`}>[Daily] Shadow Boxing</span>
                                            <span className={checkQuestDone(1) ? 'text-green-500' : 'text-neon-blue'}>{checkQuestDone(1) ? '[COMPLETE]' : '[0/100]'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-300 hover:text-white transition-colors cursor-pointer group" onClick={() => navigate('/workout')}>
                                            <span className={`group-hover:text-neon-blue ${checkQuestDone(2) ? 'text-green-500 line-through' : ''}`}>[Daily] Push-up Barrage</span>
                                            <span className={checkQuestDone(2) ? 'text-green-500' : 'text-neon-blue'}>{checkQuestDone(2) ? '[COMPLETE]' : '[0/100]'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-300 hover:text-white transition-colors cursor-pointer group" onClick={() => navigate('/workout')}>
                                            <span className={`group-hover:text-neon-blue ${checkQuestDone(3) ? 'text-green-500 line-through' : ''}`}>[Daily] Core Crusher</span>
                                            <span className={checkQuestDone(3) ? 'text-green-500' : 'text-neon-blue'}>{checkQuestDone(3) ? '[COMPLETE]' : '[0/100]'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-300 hover:text-white transition-colors cursor-pointer group" onClick={() => navigate('/workout')}>
                                            <span className={`group-hover:text-neon-blue ${checkQuestDone(4) ? 'text-green-500 line-through' : ''}`}>[Daily] Bicycle Burn</span>
                                            <span className={checkQuestDone(4) ? 'text-green-500' : 'text-neon-blue'}>{checkQuestDone(4) ? '[COMPLETE]' : '[10km]'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-300 hover:text-white transition-colors cursor-pointer group" onClick={handleSpinMission}>
                                            <span className="group-hover:text-green-500">[Extra] Spin Cycle Overdrive</span>
                                            <span className="text-green-500">[0/30m]</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-300 hover:text-white transition-colors cursor-pointer group" onClick={handleLogCalories}>
                                            <span className="group-hover:text-purple-500">[Diet] Calorie Deficit</span>
                                            <span className="text-purple-500">[2000kcal]</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-red-900/50">
                                        <p className="text-red-500 text-[10px] uppercase tracking-widest animate-pulse">
                                            Warning: Failure to complete daily quests will result in penalty zone transfer.
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button className="w-full bg-neon-blue/20 hover:bg-neon-blue/40 text-neon-blue border border-neon-blue" onClick={handleStartMission}>ENTER DUNGEON</Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* RANK & STATS */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Rank Hexagons */}
                    <div className="space-y-4">
                        <h3 className="text-3xl font-anime text-white italic border-l-4 border-neon-blue pl-4">HUNTER RANK</h3>
                        <div className="flex flex-wrap gap-4 p-4 bg-black/40 border border-white/5 rounded-xl">
                            {['E', 'D', 'C', 'B', 'A', 'S'].map((r) => (
                                <div key={r} className={`hex-badge ${stats.rank === r ? 'active scale-110' : 'opacity-40 grayscale'}`}>
                                    <span className={`text-3xl font-anime ${stats.rank === r ? 'text-neon-blue text-shadow-glow' : 'text-gray-500'}`}>{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="space-y-4">
                        <h3 className="text-3xl font-anime text-white italic border-l-4 border-neon-purple pl-4">STATUS</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={Sword} label="Strength" value={stats.str} color="neon-blue" />
                            <StatCard icon={Zap} label="Agility" value={stats.agi} color="neon-purple" />
                            <StatCard icon={Shield} label="Endurance" value={stats.endurance} color="accent" />

                            <div className="glass-card p-4 rounded-xl flex items-center space-x-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={handleLogCalories}>
                                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Weight</p>
                                    <p className="text-2xl font-bold font-anime">{user.weight} <span className="text-sm font-normal text-muted-foreground font-sans">kg</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Missions / Extra */}
                    <div className="space-y-4">
                        <h3 className="text-3xl font-anime text-white italic border-l-4 border-green-500 pl-4">SPECIAL DUNGEONS</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="glass-card p-6 border-l-4 border-green-500 relative overflow-hidden cursor-pointer hover:bg-white/5" onClick={handleSpinMission}>
                                <h4 className="font-anime text-2xl text-white">SPIN CYCLE OVERDRIVE</h4>
                                <p className="text-xs text-green-400">CLASS D DUNGEON</p>
                            </div>
                            <div className="glass-card p-6 border-l-4 border-purple-500 relative overflow-hidden cursor-pointer hover:bg-white/5" onClick={handleLogCalories}>
                                <h4 className="font-anime text-2xl text-white">CALORIE DEFICIT</h4>
                                <p className="text-xs text-purple-400">DAILY PROTOCOL</p>
                            </div>

                            <div
                                className={`glass-card p-6 border-l-4 ${giftClaimed ? 'border-gray-600 opacity-50' : 'border-yellow-500 animate-pulse'} relative overflow-hidden cursor-pointer hover:bg-white/5`}
                                onClick={handleClaimGift}
                            >
                                <h4 className={`font-anime text-2xl ${giftClaimed ? 'text-gray-400' : 'text-yellow-400'}`}>MYSTERY BOX</h4>
                                <p className="text-xs text-gray-400">{giftClaimed ? 'CLAIMED' : 'TAP TO OPEN'}</p>
                                {!giftClaimed && <Package className="absolute right-4 bottom-4 text-yellow-500/20 w-16 h-16" />}
                            </div>
                            <div className="glass-card p-6 border-l-4 border-yellow-500 relative overflow-hidden cursor-pointer hover:bg-white/5 col-span-2 md:col-span-1" onClick={() => navigate('/shop')}>
                                <h4 className="font-anime text-2xl text-white">SYSTEM STORE</h4>
                                <p className="text-xs text-yellow-400">EXCHANGE CURRENCY</p>
                            </div>
                            <div className="glass-card p-6 border-l-4 border-blue-500 relative overflow-hidden cursor-pointer hover:bg-white/5 col-span-2 md:col-span-1" onClick={() => navigate('/inventory')}>
                                <h4 className="font-anime text-2xl text-white">ITEM STORAGE</h4>
                                <p className="text-xs text-blue-400">VIEW EQUIPMENT</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SKILLS & ABILITIES */}
                <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-3xl font-anime text-white italic border-l-4 border-yellow-500 pl-4">PLAYER SKILLS</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {unlockedSkills && unlockedSkills.length > 0 ? (
                            unlockedSkills.map((skill) => (
                                <div key={skill.id} className="relative group overflow-hidden bg-black/40 border border-yellow-500/30 p-4 rounded-xl hover:bg-yellow-500/10 transition-colors">
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className="text-[10px] uppercase font-bold text-yellow-500 border border-yellow-500 px-1 rounded">
                                            {skill.type}
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-heading text-white mt-2">{skill.name}</h4>
                                    <p className="text-xs text-gray-400 font-mono mt-1">{skill.desc}</p>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 text-center p-8 bg-black/20 rounded-xl border border-white/5">
                                <p className="text-gray-500 font-mono">No Abilities Unlocked. Level up to awaken powers.</p>
                            </div>
                        )}

                        {/* Locked Skill Placeholder */}
                        <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center space-y-2 opacity-50 grayscale border-dashed border-gray-600">
                            <div className="p-2 rounded-full bg-gray-800">
                                <Shield size={20} className="text-gray-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest">Next Unlock</p>
                                <p className="text-lg font-bold text-gray-500">???</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
