import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState({
        name: '',
        age: '',
        height: '',
        weight: '',
        target_weight: '', // New field
        goal: 'weight_loss',
        isAwakened: false,
    });

    const [stats, setStats] = useState({
        level: 1,
        xp: 0,
        maxXp: 100,
        str: 10,
        agi: 10,
        endurance: 10,
        rank: 'E',
        streak: 0,
        coins: 0, // System Currency
    });

    const [weightHistory, setWeightHistory] = useState([]);
    const [loginHistory, setLoginHistory] = useState([]); // Array of 'YYYY-MM-DD'
    const [inventory, setInventory] = useState([]);
    const [activeQuest, setActiveQuest] = useState(null); // { id, title, target, deadline... }
    const [loading, setLoading] = useState(true);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    // New: Global System Logs
    const [systemLogs, setSystemLogs] = useState([]);

    // New: Penalty System
    const [penalties, setPenalties] = useState({
        active: false,
        warningMode: false,
        streakFrozen: false,
        xpPenalty: 1.0, // 1.0 = Normal, 0.5 = 50% gain
        consecutiveMisses: 0
    });

    const [dailyProgress, setDailyProgress] = useState({
        date: new Date().toLocaleDateString('en-CA'),
        completedIds: []
    });

    // Helper: Load from LocalStorage
    const loadFromLocalStorage = () => {
        const localUser = localStorage.getItem('ag_user');
        const localStats = localStorage.getItem('ag_stats');
        const localHistory = localStorage.getItem('ag_history');
        const localLoginHistory = localStorage.getItem('ag_login_history');
        const localInventory = localStorage.getItem('ag_inventory');
        const localQuest = localStorage.getItem('ag_quest');
        const localSession = localStorage.getItem('ag_session');
        const localPenalties = localStorage.getItem('ag_penalties');
        const localDailyProgress = localStorage.getItem('ag_daily_progress');

        if (localUser) setUser(JSON.parse(localUser));
        if (localStats) setStats(JSON.parse(localStats));
        if (localHistory) setWeightHistory(JSON.parse(localHistory));
        if (localLoginHistory) setLoginHistory(JSON.parse(localLoginHistory));
        if (localInventory) setInventory(JSON.parse(localInventory));
        if (localQuest) setActiveQuest(JSON.parse(localQuest));
        if (localSession && !session) setSession(JSON.parse(localSession));
        if (localPenalties) setPenalties(JSON.parse(localPenalties));

        if (localDailyProgress) {
            const parsed = JSON.parse(localDailyProgress);
            // Verify date matches today, else reset
            const today = new Date().toLocaleDateString('en-CA');
            if (parsed.date === today) {
                setDailyProgress(parsed);
            }
        }
    };

    // System Log Helper
    const addLog = (text) => {
        const id = Date.now() + Math.random();
        setSystemLogs(prev => [{ id, text, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));

        // Auto-dismiss
        setTimeout(() => {
            setSystemLogs(prev => prev.filter(log => log.id !== id));
        }, 5000);
    };


    useEffect(() => {
        if (isSupabaseConfigured && !isOfflineMode) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setSession(session);
                if (session) fetchProfile(session.user.id);
                else setLoading(false);
            });

            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((_event, session) => {
                setSession(session);
                if (session) fetchProfile(session.user.id);
                else setLoading(false);
            });

            return () => subscription.unsubscribe();
        } else {
            // DEMO MODE: Load from localStorage
            loadFromLocalStorage();
            setLoading(false);
        }
    }, [isOfflineMode]);

    // Daily Checks & Penalties
    const performDailyChecks = () => {
        const today = new Date().toLocaleDateString('en-CA');
        const lastLogin = localStorage.getItem('ag_last_login');
        const lastWorkout = localStorage.getItem('ag_last_workout_date');
        const localLoginHistory = JSON.parse(localStorage.getItem('ag_login_history') || '[]');

        // 1. Update Login History
        let newHistory = [...localLoginHistory];
        if (!newHistory.includes(today)) {
            newHistory.push(today);
            localStorage.setItem('ag_login_history', JSON.stringify(newHistory));
            setLoginHistory(newHistory);
        }

        // 2. Check Daily Streak & Misses
        if (lastLogin === today) {
            // Already processed daily logic today, check quest expiry only
            checkQuestExpiry();
            return;
        }

        let newStreak = stats.streak || 0;
        let currentMisses = penalties.consecutiveMisses || 0;
        let newWarningMode = penalties.warningMode;
        let newXpPenalty = penalties.streakFrozen ? 0.8 : 1.0; // Persist penalty if frozen

        // Check if we missed YESTERDAY
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');

        // Did we work out yesterday?
        const missedYesterday = lastWorkout !== yesterdayStr && lastWorkout !== today;

        if (missedYesterday && newStreak > 0) {
            // STREAK BROKEN
            if (penalties.streakFrozen) {
                addLog("STREAK FROZEN: PROTECTION ACTIVE");
                // Unfreeze for tomorrow
                setPenalties(p => ({ ...p, streakFrozen: false }));
            } else {
                newStreak = 0;
                currentMisses += 1;
                addLog("DAILY QUEST MISSED: STREAK RESET");

                if (currentMisses >= 2) {
                    newWarningMode = true;
                    newXpPenalty = 0.5; // 50% XP Reduction
                    addLog("WARNING MODE ACTIVATED: REDUCED REWARDS");
                }
            }
        } else if (!missedYesterday) {
            currentMisses = 0;
            newWarningMode = false;
            newXpPenalty = 1.0;
        }

        // Check Active Quest Expiry
        checkQuestExpiry();

        // Save Updates
        const newStats = { ...stats, streak: newStreak };
        const newPenalties = { ...penalties, consecutiveMisses: currentMisses, warningMode: newWarningMode, xpPenalty: newXpPenalty };

        setStats(newStats);
        setPenalties(newPenalties);

        localStorage.setItem('ag_stats', JSON.stringify(newStats));
        localStorage.setItem('ag_penalties', JSON.stringify(newPenalties));
        localStorage.setItem('ag_last_login', today);
    };

    const checkQuestExpiry = () => {
        const storedQuestStr = localStorage.getItem('ag_quest');
        if (storedQuestStr) {
            const q = JSON.parse(storedQuestStr);
            const now = new Date();
            const deadline = new Date(q.deadline);

            if (now > deadline) {
                // Quest Expired
                failQuest(q);
            }
        }
    };

    useEffect(() => {
        if (!loading && user.name) {
            performDailyChecks();

            // Interval to check for quest expiry in real-time
            const interval = setInterval(checkQuestExpiry, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [loading, user.name]);

    const fetchProfile = async (userId) => {
        if (!isSupabaseConfigured || isOfflineMode) {
            loadFromLocalStorage();
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // If table missing (PGRST205) or other critical error, fallback to offline
                if (error.code === 'PGRST205' || error.code === '42P01') {
                    console.warn("Supabase Tables Missing. Switching to Offline Demo Mode.");
                    setIsOfflineMode(true);
                    loadFromLocalStorage();
                    return;
                }
                if (error.code !== 'PGRST116') throw error;
            }

            if (data) {
                setUser({
                    name: data.name,
                    age: data.age,
                    height: data.height,
                    weight: data.current_weight,
                    target_weight: data.target_weight,
                    goal: data.goal,
                    isAwakened: data.is_awakened
                });
                setStats({
                    level: data.level,
                    xp: data.xp,
                    maxXp: data.max_xp,
                    str: data.str,
                    agi: data.agi,
                    endurance: data.endurance,
                    rank: data.rank
                });

                // Fetch History
                const { data: history } = await supabase
                    .from('weight_logs')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: true });

                if (history) {
                    setWeightHistory(history.map(h => ({
                        date: new Date(h.created_at).toISOString().split('T')[0],
                        weight: h.weight
                    })));
                }
            }
        } catch (error) {
            console.error('Critical Error fetching profile:', error);
            setIsOfflineMode(true);
            loadFromLocalStorage();
        } finally {
            setLoading(false);
        }
    };

    // Helper to check if we are using a fake session
    const isDemoSession = (s) => s?.user?.id?.startsWith('demo-user-');

    // Initialize Stats (Onboarding)
    const initializeStats = async (userData, explicitSession = null) => {
        let baseStr = 10;
        let baseAgi = 10;
        let baseEnd = 10;

        if (userData.goal === 'muscle_gain') baseStr += 5;
        if (userData.goal === 'weight_loss') baseAgi += 5;
        if (userData.goal === 'endurance') baseEnd += 5;

        const newStats = {
            level: 1, xp: 0, maxXp: 100, rank: 'E',
            str: baseStr, agi: baseAgi, endurance: baseEnd,
            streak: 0, coins: 0
        };

        const activeSession = explicitSession || session;
        if (!activeSession) return;

        // Check if we should use Supabase or Demo mode
        const useSupabase = isSupabaseConfigured && !isDemoSession(activeSession);

        if (useSupabase) {
            const updates = {
                name: userData.name,
                age: parseInt(userData.age),
                height: parseFloat(userData.height),
                current_weight: parseFloat(userData.weight),
                goal: userData.goal,
                str: baseStr,
                agi: baseAgi,
                endurance: baseEnd,
                is_awakened: true,
                updated_at: new Date(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert({ id: activeSession.user.id, ...updates });

            if (!error) {
                setUser({ ...userData, isAwakened: true });
                setStats(prev => ({ ...prev, ...newStats }));
                await updateWeight(userData.weight);
            }
        } else {
            // DEMO MODE (LocalStorage)
            const newUser = { ...userData, isAwakened: true };

            setUser(newUser);
            setStats(newStats); // Reset stats on init

            localStorage.setItem('ag_user', JSON.stringify(newUser));
            localStorage.setItem('ag_stats', JSON.stringify(newStats));

            // We need to call updateWeight but manually since the helper also checks session
            await updateWeight(userData.weight);
        }
    };

    const addXp = async (amount) => {
        if (!session) return;

        // Apply XP Penalty if active
        let adjustedAmount = Math.floor(amount * penalties.xpPenalty);
        let newXp = stats.xp + adjustedAmount;

        if (penalties.warningMode) {
            // Capped gains
            // Log handled by UI
        }
        let newLevel = stats.level;
        let newMaxXp = stats.maxXp;

        if (newXp >= stats.maxXp) {
            newLevel += 1;
            newXp -= stats.maxXp;
            newMaxXp = Math.floor(newMaxXp * 1.2);
        }

        const updates = {
            xp: newXp,
            level: newLevel,
            max_xp: newMaxXp,
            updated_at: new Date()
        };

        const useSupabase = isSupabaseConfigured && !isDemoSession(session);

        if (useSupabase) {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', session.user.id);

            if (!error) {
                setStats(prev => ({ ...prev, level: newLevel, xp: newXp, maxXp: newMaxXp }));
            }
        } else {
            // DEMO MODE
            const newStatsState = { ...stats, level: newLevel, xp: newXp, maxXp: newMaxXp };
            setStats(newStatsState);
            localStorage.setItem('ag_stats', JSON.stringify(newStatsState));
        }
    };

    const addCoins = async (amount) => {
        const newCoins = (stats.coins || 0) + amount;

        const useSupabase = isSupabaseConfigured && !isDemoSession(session);

        if (useSupabase) {
            const { error } = await supabase
                .from('profiles')
                .update({ coins: newCoins, updated_at: new Date() })
                .eq('id', session.user.id);

            if (!error) {
                setStats(prev => ({ ...prev, coins: newCoins }));
            }
        } else {
            const newStats = { ...stats, coins: newCoins };
            setStats(newStats);
            localStorage.setItem('ag_stats', JSON.stringify(newStats));
        }
    };

    const addToInventory = (item, quantity = 1) => {
        let newInventory = [...inventory];
        const existingItemIndex = newInventory.findIndex(i => i.id === item.id);

        if (existingItemIndex > -1) {
            newInventory[existingItemIndex].quantity += quantity;
        } else {
            // Exclude Icon component from storage to avoid issues
            const { icon, ...itemData } = item;
            newInventory.push({ ...itemData, quantity, acquiredAt: new Date().toISOString() });
        }

        setInventory(newInventory);
        localStorage.setItem('ag_inventory', JSON.stringify(newInventory));
    };

    const triggerEmergencyQuest = () => {
        const types = [
            { title: 'PENALTY QUEST', desc: '[EMERGENCY] Complete 20 Pushups to survive.', target: 20, reward: 500, penalty: 1000, duration: 600 },
            { title: 'DAILY QUEST', desc: '[DAILY] Run 2km today.', target: 2000, reward: 300, penalty: 0, duration: 86400 },
            { title: 'SUDDEN QUEST', desc: '[SURVIVAL] Hold Plank for 60 seconds.', target: 60, reward: 800, penalty: 500, duration: 300 },
            { title: 'BOSS QUEST', desc: '[BOSS] Defeat the Shadow Monarch.', target: 1, reward: 5000, penalty: 0, duration: 3600 },
            { title: 'SECRET QUEST', desc: '[HIDDEN] Meditate for 5 minutes.', target: 300, reward: 1000, penalty: 0, duration: 1200 }
        ];

        const randomType = types[Math.floor(Math.random() * types.length)];

        const quest = {
            id: Date.now(),
            title: randomType.title,
            description: randomType.desc,
            target: randomType.target,
            current: 0,
            deadline: new Date(Date.now() + randomType.duration * 1000).toISOString(),
            reward: { coins: randomType.reward, xp: 100 },
            penalty: { coins: -randomType.penalty },
            isActive: true
        };

        setActiveQuest(quest);
        localStorage.setItem('ag_quest', JSON.stringify(quest));
        return quest;
    };

    const failQuest = (quest) => {
        if (!quest) return;

        // Calculate Consequences
        const isEmergency = quest.title.includes('PENALTY') || quest.title.includes('SUDDEN');
        const isBoss = quest.title.includes('BOSS');

        let penaltyCoins = 0;
        let penaltyMsg = "QUEST FAILED";

        if (isEmergency) {
            // Lose 10-20% Coins
            const lossPercent = (Math.random() * 0.1) + 0.1; // 0.1 to 0.2
            penaltyCoins = Math.floor(stats.coins * lossPercent);

            // Freeze Streak
            setPenalties(prev => {
                const next = { ...prev, streakFrozen: true, xpPenalty: 0.8 };
                localStorage.setItem('ag_penalties', JSON.stringify(next));
                return next;
            });

            penaltyMsg = `EMERGENCY FAILURE: -${penaltyCoins} COINS | STREAK FROZEN`;
            addCoins(-penaltyCoins);
        } else if (isBoss) {
            penaltyMsg = "BOSS RAID FAILED: REWARDS FORFEITED";
        }

        addLog(penaltyMsg);
        setActiveQuest(null);
        localStorage.removeItem('ag_quest');
    };

    const completeQuest = (success = true) => {
        if (!activeQuest) return;

        if (success) {
            addCoins(activeQuest.reward.coins);
            addXp(activeQuest.reward.xp);
            addLog("QUEST COMPLETE: REWARDS CLAIMED");

            // Clear Warning Mode on success
            if (activeQuest.title === 'REDEMPTION ARC') {
                setPenalties(prev => {
                    const next = { ...prev, warningMode: false, consecutiveMisses: 0, xpPenalty: 1.0 };
                    localStorage.setItem('ag_penalties', JSON.stringify(next));
                    return next;
                });
                addLog("SYSTEM RESTORED: PENALTIES CLEARED");
            }
        } else {
            failQuest(activeQuest);
        }

        setActiveQuest(null);
        localStorage.removeItem('ag_quest');
    };

    const generateRedemptionQuest = () => {
        const quest = {
            id: Date.now(),
            title: 'REDEMPTION ARC',
            description: '[RECOVERY] Complete a full 20min workout to restore status.',
            target: 1,
            current: 0,
            deadline: new Date(Date.now() + 86400 * 1000).toISOString(), // 24h
            reward: { coins: 500, xp: 200 },
            penalty: { coins: 0 },
            isActive: true
        };
        setActiveQuest(quest);
        localStorage.setItem('ag_quest', JSON.stringify(quest));
        return quest;
    };

    const completeDailyWorkout = (workoutId) => {
        const today = new Date().toLocaleDateString('en-CA');
        let currentProgress = { ...dailyProgress };

        // Reset if date mismatch
        if (currentProgress.date !== today) {
            currentProgress = { date: today, completedIds: [] };
        }

        // Add ID if not present and valid (assuming IDs are numeric)
        if (workoutId && !currentProgress.completedIds.includes(workoutId)) {
            currentProgress.completedIds.push(workoutId);
            setDailyProgress(currentProgress);
            localStorage.setItem('ag_daily_progress', JSON.stringify(currentProgress));
            addLog("QUEST PHASE COMPLETE");
        }

        // Check if ALL mandatory quests (1, 2, 3, 4) are done
        const mandatoryIds = [1, 2, 3, 4];
        const allDone = mandatoryIds.every(id => currentProgress.completedIds.includes(id));

        const lastWorkout = localStorage.getItem('ag_last_workout_date');

        if (allDone && lastWorkout !== today) {
            // Always update the date
            localStorage.setItem('ag_last_workout_date', today);

            const newStreak = (stats.streak || 0) + 1;
            const newStats = { ...stats, streak: newStreak };
            setStats(newStats);
            localStorage.setItem('ag_stats', JSON.stringify(newStats));
            addLog(`ALL DAILY QUESTS CLEARED! STREAK +1`);
        }
    };

    const updateWeight = async (newWeight) => {
        if (!session) return;
        const weight = parseFloat(newWeight);
        const date = new Date().toISOString().split('T')[0];

        const useSupabase = isSupabaseConfigured && !isDemoSession(session);

        if (useSupabase) {
            // Log to history
            await supabase.from('weight_logs').insert({ user_id: session.user.id, weight });
            // Update profile
            await supabase.from('profiles').update({ current_weight: weight }).eq('id', session.user.id);
            setWeightHistory(prev => [...prev, { date, weight }]);
            setUser(prev => ({ ...prev, weight }));
            addXp(20);
        } else {
            // DEMO MODE
            const newHistory = [...weightHistory, { date, weight }];
            const newUser = { ...user, weight };

            setWeightHistory(newHistory);
            setUser(newUser);

            localStorage.setItem('ag_history', JSON.stringify(newHistory));
            localStorage.setItem('ag_user', JSON.stringify(newUser));

            addXp(20);
        }
    };

    // Demo Helper
    const generateDemoData = () => {
        const fakeHistory = [];
        const today = new Date();

        // Generate random history for last 60 days
        for (let i = 0; i < 60; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // 70% chance of login
            if (Math.random() > 0.3) {
                fakeHistory.push(date.toLocaleDateString('en-CA'));
            }
        }
        setLoginHistory(fakeHistory);
        setStats(prev => ({ ...prev, streak: 7 }));
        localStorage.setItem('ag_login_history', JSON.stringify(fakeHistory));
    };

    const claimMysteryGift = () => {
        const today = new Date().toLocaleDateString('en-CA');
        const lastGiftDate = localStorage.getItem('ag_last_gift_date');

        if (lastGiftDate === today) {
            return { success: false, message: 'Already claimed today.' };
        }

        const rewardCoins = Math.floor(Math.random() * 200) + 50;
        const rewardXp = Math.floor(Math.random() * 30) + 10;

        addCoins(rewardCoins);
        addXp(rewardXp);

        localStorage.setItem('ag_last_gift_date', today);

        return { success: true, coins: rewardCoins, xp: rewardXp };
    };

    const resetGame = () => {
        // Factory Reset: Clear EVERYTHING
        localStorage.clear();

        // Reload to force reset
        window.location.reload();
    };

    const login = async () => {
        if (isSupabaseConfigured) {
            const { data, error } = await supabase.auth.signInAnonymously();

            // If anonymous sign-in fails (e.g. disabled in Supabase), fallback to demo mode
            if (error) {
                console.warn("Supabase Auth Error (falling back to Demo Mode):", error.message);
                const fakeSession = { user: { id: 'demo-user-' + Date.now() } };
                setSession(fakeSession);
                localStorage.setItem('ag_session', JSON.stringify(fakeSession));
                return { data: { session: fakeSession }, error: null }; // Return success for demo
            }

            return { data, error };
        } else {
            // DEMO MODE: Create fake session
            const fakeSession = { user: { id: 'demo-user-' + Date.now() } };
            setSession(fakeSession);
            localStorage.setItem('ag_session', JSON.stringify(fakeSession));
            return { data: { session: fakeSession }, error: null };
        }
    };

    // New Function: Generic Profile Update
    const updateUserProfile = async (updates) => {
        if (!session) return;

        // Prepare DB payload
        const dbUpdates = { updated_at: new Date() };
        if (updates.height) dbUpdates.height = parseFloat(updates.height);
        // Note: Weight updates should ideally go through updateWeight for history, 
        // but for profile settings we might just update the current value or call updateWeight.
        // Let's call updateWeight if weight is present to keep history in sync.
        if (updates.target_weight) dbUpdates.target_weight = parseFloat(updates.target_weight);

        // Update Local State
        setUser(prev => ({ ...prev, ...updates }));

        const useSupabase = isSupabaseConfigured && !isDemoSession(session) && !isOfflineMode;

        if (useSupabase) {
            // If weight is being updated, do it via the specific function to log it
            if (updates.weight) {
                await updateWeight(updates.weight);
                delete updates.weight; // Remove to avoid double update if we continue below
            }

            const { error } = await supabase
                .from('profiles')
                .update(dbUpdates)
                .eq('id', session.user.id);

            if (error) console.error("Update failed:", error);
        } else {
            // Local Storage Update
            if (updates.weight) {
                await updateWeight(updates.weight);
            }

            const newUser = { ...user, ...updates }; // Re-merge in case updateWeight didn't catch non-weight fields
            setUser(newUser);
            localStorage.setItem('ag_user', JSON.stringify(newUser));
        }
    };

    // Skill Tree Definition
    const SKILL_TREE = [
        { level: 1, id: 'sprint', name: 'Sprint', type: 'Passive', desc: 'Running Efficiency +10%' },
        { level: 5, id: 'stealth', name: 'Stealth', type: 'Active', desc: 'Hide presence (Dim UI)' },
        { level: 10, id: 'bloodlust', name: 'Bloodlust', type: 'Active', desc: 'Intimidation Aura (Red Theme)' },
        { level: 15, id: 'shadow_extract', name: 'Shadow Extraction', type: 'Special', desc: 'Unlock Shadow Army Tab' },
        { level: 25, id: 'monarch_domain', name: 'Domain of the Monarch', type: 'Ultimate', desc: 'Boost all stats visuals' },
        { level: 50, id: 'rulers_authority', name: 'Ruler\'s Authority', type: 'God-Tier', desc: 'Telekinesis (Auto-scroll)' }
    ];

    // Derive unlocked skills from current level
    const unlockedSkills = SKILL_TREE.filter(skill => stats.level >= skill.level);

    const value = {
        user,
        stats,
        weightHistory,
        session,
        loading,
        unlockedSkills, // Expose derived skills
        inventory,
        loginHistory,
        initializeStats,
        addXp,
        addCoins,
        addToInventory,
        activeQuest,
        triggerEmergencyQuest,
        completeQuest,
        updateWeight,
        updateUserProfile,
        login,
        generateDemoData,
        resetGame,
        addLog,
        systemLogs,
        penalties,
        generateRedemptionQuest,
        claimMysteryGift,
        completeDailyWorkout,
        dailyProgress
    };

    return (
        <GameContext.Provider value={value}>
            {!loading && children}
        </GameContext.Provider>
    );
};
