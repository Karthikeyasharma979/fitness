import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { useGame } from '../context/GameContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useGame();
    const [titleText, setTitleText] = React.useState('');
    const fullTitle = "SOLO LEVELING";

    React.useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setTitleText(fullTitle.slice(0, index + 1));
            index++;
            if (index > fullTitle.length) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const handleStart = () => {
        if (user.isAwakened) {
            navigate('/dashboard');
        } else {
            navigate('/onboarding');
        }
    };

    return (
        <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-blue/10 via-background to-background pointer-events-none" />

            {/* "Gate" Aura Effect */}
            <motion.div
                className="absolute w-[600px] h-[600px] bg-neon-purple/20 rounded-full blur-[120px] -top-64 -right-64"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
                className="absolute w-[600px] h-[600px] bg-neon-blue/20 rounded-full blur-[120px] -bottom-64 -left-64"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />

            {/* Hero Content */}
            <div className="relative z-10 text-center space-y-12 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="relative"
                >
                    {/* System Window Header Effect */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-neon-blue text-xs tracking-[0.5em] font-mono opacity-70">
                        [ SYSTEM NOTIFICATION ]
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-neon-purple drop-shadow-[0_0_30px_rgba(0,240,255,0.5)]">
                        {titleText}
                        <span className="animate-pulse text-neon-blue">_</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="text-xl md:text-3xl text-gray-300 font-light tracking-[0.2em] uppercase drop-shadow-md"
                >
                    You're Not Weak. You're Just <span className="text-neon-purple font-bold">Level 1</span>.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0, type: "spring", stiffness: 100 }}
                    className="pt-12"
                >
                    <div className="relative group inline-block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <Button
                            onClick={handleStart}
                            className="relative text-xl px-16 py-8 rounded-lg bg-black border border-neon-blue/50 text-white font-bold tracking-widest uppercase hover:bg-neon-blue/10 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
                        >
                            <span className="mr-3">{user.isAwakened ? "CONTINUE QUEST" : "Accept Quest"}</span>
                            <span className="text-neon-blue group-hover:text-white transition-colors duration-300">►</span>
                        </Button>

                        {/* Hover "Quest Info" Popup Effect */}
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-48 bg-black/80 border border-neon-blue/30 p-2 rounded text-left hidden group-hover:block backdrop-blur-md">
                            <div className="text-[10px] text-gray-400 uppercase">Reward</div>
                            <div className="text-sm text-neon-blue font-bold">Player Awakening</div>
                            <div className="text-[10px] text-gray-400 mt-1">Difficulty: Class S</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Minimal Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-20" />
        </div>
    );
};

export default LandingPage;
