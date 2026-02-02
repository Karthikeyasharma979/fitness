import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingDown } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ProgressPage = () => {
    const navigate = useNavigate();
    const { weightHistory, updateWeight, user } = useGame();
    const [newWeight, setNewWeight] = useState('');

    const handleUpdate = (e) => {
        e.preventDefault();
        if (newWeight) {
            updateWeight(newWeight);
            setNewWeight('');
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <header className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold font-heading">EVOLUTION LOG</h1>
            </header>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="md:col-span-2 glass-card p-6 rounded-xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingDown className="text-neon-blue" /> Weight Trajectory
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weightHistory}>
                                <defs>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis domain={['auto', 'auto']} stroke="#666" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                    itemStyle={{ color: '#00f0ff' }}
                                />
                                <Area type="monotone" dataKey="weight" stroke="#00f0ff" fillOpacity={1} fill="url(#colorWeight)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Input Section */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-xl space-y-4">
                        <h3 className="font-bold text-lg">Update Current Status</h3>
                        <p className="text-sm text-gray-400">Current Weight: {user.weight} kg</p>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neon-blue">New Weight (kg)</label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                    placeholder="e.g. 73.5"
                                />
                            </div>
                            <Button type="submit" variant="neon" className="w-full">
                                LOG RECORD (+20 XP)
                            </Button>
                        </form>
                    </div>

                    <div className="glass-card p-6 rounded-xl">
                        <h3 className="font-bold text-lg mb-2">Analysis</h3>
                        <div className="space-y-2 text-sm text-gray-400">
                            <p>• BMI: {((user.weight / ((user.height / 100) ** 2)) || 0).toFixed(1)}</p>
                            <p>• Total Loss: -{(weightHistory[0].weight - user.weight).toFixed(1)} kg</p>
                            <p>• Consistency Streak: 3 Days</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressPage;
