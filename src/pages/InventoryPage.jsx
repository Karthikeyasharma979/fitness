import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/button';
import { ArrowLeft, Package, Shield, Sword, Zap, Sparkles, Star, Gift, Box } from 'lucide-react';

const InventoryPage = () => {
    const navigate = useNavigate();
    const { inventory, stats } = useGame();

    const getIcon = (type) => {
        switch (type) {
            case 'Consumable': return Zap;
            case 'Upgrade': return Sparkles;
            case 'Equipment': return Shield;
            case 'Weapon': return Sword;
            case 'Rare': return Star;
            case 'Bundle': return Gift;
            default: return Box;
        }
    };

    const getRarityColor = (rank) => {
        switch (rank) {
            case 'E': return 'text-gray-400 border-gray-400';
            case 'D': return 'text-green-400 border-green-400';
            case 'C': return 'text-blue-400 border-blue-400';
            case 'B': return 'text-purple-400 border-purple-400';
            case 'A': return 'text-orange-400 border-orange-400';
            case 'S': return 'text-red-500 border-red-500';
            default: return 'text-white border-white';
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 pb-20">
            <header className="flex items-center gap-4 mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b border-white/5">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft />
                </Button>
                <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
                    <Package className="text-neon-blue" /> INVENTORY
                </h1>
            </header>

            {inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <Box size={48} className="mb-4 text-gray-500" />
                    <p className="text-xl">Storage is Empty</p>
                    <Button variant="link" className="text-yellow-400 mt-2" onClick={() => navigate('/shop')}>
                        Go to System Store
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inventory.map((item, index) => {
                        const Icon = getIcon(item.type);
                        const rarityColor = getRarityColor(item.rank);

                        return (
                            <motion.div
                                key={`${item.id}-${index}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-4 rounded-xl flex gap-4 items-start relative group"
                            >
                                <div className={`p-3 rounded-lg bg-white/5 border border-white/10 ${rarityColor.split(' ')[0]}`}>
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <span className={`text-xs font-mono border px-1 rounded ${rarityColor}`}>
                                            {item.rank}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                                    <div className="mt-3 flex justify-between items-center text-xs font-mono text-neon-blue">
                                        <span>QTY: {item.quantity}</span>
                                        <span>{item.type.toUpperCase()}</span>
                                    </div>
                                </div>
                                {/* Selection/Equip Indicator (Future) */}
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
