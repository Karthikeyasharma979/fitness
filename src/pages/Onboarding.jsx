import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Onboarding = () => {
    const navigate = useNavigate();
    const { initializeStats, login, session } = useGame();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        height: '',
        weight: '',
        goal: 'weight_loss'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => {
        if (!formData.name || !formData.age) {
            alert("Please identify yourself and state your age, Hunter.");
            return;
        }
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Full validation
        if (!formData.name || !formData.age || !formData.weight || !formData.height) {
            alert("All stats must be calibrated before awakening.");
            return;
        }

        try {
            let activeSession = session;
            // ... (rest of logic remains same, but we are just replacing the top part of handleSubmit if we can't context match easily)
            if (!activeSession) {
                const { data, error } = await login();
                if (error) throw error;
                activeSession = data.session;
            }

            await initializeStats(formData, activeSession);
            navigate('/dashboard');
        } catch (error) {
            console.error("Initialization failed:", error);
            // Ideally show a toast here
        }
    };



    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-blue/5 to-transparent pointer-events-none" />

            <div className="absolute w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl -top-20 -right-20 animate-pulse" />
            <div className="absolute w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl -bottom-20 -left-20 animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 glass-card p-10 rounded-2xl relative z-10"
            >
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
                        SYSTEM INITIALIZATION
                    </h2>
                    <p className="text-muted-foreground">Calibrating User Stats...</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#00f0ff] tracking-wide">Identify Yourself</label>
                                <Input
                                    name="name"
                                    placeholder="Player Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#00f0ff] tracking-wide">Age</label>
                                <Input
                                    name="age"
                                    type="number"
                                    placeholder="Years"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>
                            <Button type="button" onClick={nextStep} className="w-full" variant="neon">
                                NEXT PHASE
                            </Button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#00f0ff] tracking-wide">Height (cm)</label>
                                    <Input
                                        name="height"
                                        type="number"
                                        placeholder="175"
                                        value={formData.height}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#00f0ff] tracking-wide">Weight (kg)</label>
                                    <Input
                                        name="weight"
                                        type="number"
                                        placeholder="70"
                                        value={formData.weight}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#00f0ff] tracking-wide">Mission Objective</label>
                                <select
                                    name="goal"
                                    value={formData.goal}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-zinc-950 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-neon-blue focus:outline-none"
                                >
                                    <option value="weight_loss" className="bg-zinc-950 text-white">Weight Loss (Agility)</option>
                                    <option value="muscle_gain" className="bg-zinc-950 text-white">Muscle Gain (Strength)</option>
                                    <option value="endurance" className="bg-zinc-950 text-white">Endurance (Stamina)</option>
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <Button type="button" onClick={prevStep} variant="ghost" className="w-1/3">
                                    BACK
                                </Button>
                                <Button type="submit" variant="neon" className="w-2/3">
                                    AWAKEN
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </form>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-4">
                    <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-neon-blue' : 'bg-white/20'}`} />
                    <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-neon-blue' : 'bg-white/20'}`} />
                </div>

            </motion.div>
        </div>
    );
};

export default Onboarding;
