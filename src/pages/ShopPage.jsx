import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Coins, ShoppingBag, Zap, Shield, Sword, Sparkles, Lock, AlertTriangle, Box, Skull, Heart, Gift } from 'lucide-react';

const SHOP_ITEMS = [
    {
        id: 'box_cursed',
        name: "Random Box (Cursed)",
        desc: 'Open for a chance at greatness or despair.',
        cost: 100,
        type: 'Rare',
        icon: Box,
        rank: '?'
    },
    {
        id: 'potion_stamina',
        name: 'Stamina Potion',
        desc: 'Restore 50% Energy instantly.',
        cost: 50,
        type: 'Consumable',
        icon: Zap,
        rank: 'E'
    },
    {
        id: 'potion_xp',
        name: 'XP Booster',
        desc: 'Double XP for next workout.',
        cost: 100,
        type: 'Consumable',
        icon: Sparkles,
        rank: 'D'
    },
    {
        id: 'item_freeze',
        name: 'Streak Freeze',
        desc: 'Prevent streak reset for 1 day.',
        cost: 150,
        type: 'Rare',
        icon: Lock,
        rank: 'A'
    },
    {
        id: 'upgrade_sprint',
        name: 'Sprint Mastery',
        desc: 'Increase Sprint Efficiency (LVL 2).',
        cost: 200,
        type: 'Upgrade',
        icon: Sword,
        rank: 'C'
    },
    {
        id: 'consumable_rasaka',
        name: "Rasaka's Venom",
        desc: 'High Risk: +5 STR, -10% HP for workout.',
        cost: 300,
        type: 'Consumable',
        icon: Skull,
        rank: 'C'
    },
    {
        id: 'bundle_starter',
        name: 'Starter Hunter Pack',
        desc: 'Bundle: 2x Stamina Potion, 1x XP Boost.',
        cost: 500,
        type: 'Bundle',
        icon: Gift,
        rank: 'E'
    },
    {
        id: 'gear_wrist_weights',
        name: 'Gravity Wrist Weights',
        desc: '+5% Strength Gain per workout.',
        cost: 500,
        type: 'Equipment',
        icon: Shield,
        rank: 'B'
    },
    {
        id: 'key_dungeon',
        name: 'Dungeon Key (Red)',
        desc: 'Unlock S-Rank Instant Dungeon.',
        cost: 1000,
        type: 'Rare',
        icon: Lock,
        rank: 'S'
    },
    {
        id: 'weapon_kasaka',
        name: "Kasaka's Venom Fang",
        desc: 'C-Rank Dagger. Effect: Paralyze + Bleed.',
        cost: 1500,
        type: 'Weapon',
        icon: Sword,
        rank: 'C'
    },
    {
        id: 'weapon_knight_killer',
        name: "Knight Killer",
        desc: 'B-Rank Dagger. Effect: Armor Pierce.',
        cost: 2500,
        type: 'Weapon',
        icon: Sword,
        rank: 'B'
    },
    {
        id: 'consumable_elixir',
        name: "Elixir of Life",
        desc: 'Cure all status effects & reset daily limits.',
        cost: 5000,
        type: 'Consumable',
        icon: Heart,
        rank: 'S'
    }
];

const ShopPage = () => {
    const navigate = useNavigate();
    const { stats, addCoins, addToInventory } = useGame(); // We use addCoins(-cost) to deduct
    const [filter, setFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState(null);
    const [purchaseStatus, setPurchaseStatus] = useState(null); // 'success', 'error'
    const [message, setMessage] = useState('');

    const filteredItems = filter === 'All'
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter(item => item.type === filter);

    const handleBuy = (item) => {
        if (stats.coins >= item.cost) {
            addCoins(-item.cost);

            if (item.id === 'box_cursed') {
                const isLucky = Math.random() > 0.9;
                const reward = isLucky ? 1000 : 1;
                addCoins(reward);
                setMessage(isLucky ? `JACKPOT! FOUND ${reward} COINS!` : `CURSED! Found ${reward} Coin...`);
            } else {
                addToInventory(item);
                setMessage('PURCHASE SUCCESSFUL');
            }

            setPurchaseStatus('success');

            setTimeout(() => {
                setPurchaseStatus(null);
                setSelectedItem(null);
                setMessage('');
            }, 2000);
        } else {
            setPurchaseStatus('error');
            setTimeout(() => setPurchaseStatus(null), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 pb-20">
            <header className="flex items-center justify-between mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
                        <ShoppingBag className="text-yellow-500" /> SYSTEM STORE
                    </h1>
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
                    <Coins className="text-yellow-400" size={18} />
                    <span className="font-mono font-bold text-yellow-500">{stats.coins || 0}</span>
                </div>
            </header>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                {['All', 'Bundle', 'Consumable', 'Weapon', 'Upgrade', 'Equipment', 'Rare'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${filter === cat
                            ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-4 rounded-xl relative group overflow-hidden border-l-4"
                        style={{ borderLeftColor: item.type === 'Rare' ? '#ef4444' : '#eab308' }}
                        onClick={() => setSelectedItem(item)}
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-lg ${item.type === 'Rare' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                <item.icon size={24} />
                            </div>
                            <span className="text-xs font-mono text-gray-500 border border-white/5 px-2 py-1 rounded">
                                {item.type}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold font-heading text-white mt-4">{item.name}</h3>
                        <p className="text-sm text-gray-400 mb-4 h-10">{item.desc}</p>

                        <div className="flex justify-between items-center mt-2">
                            <div className="text-yellow-400 font-mono font-bold flex items-center gap-1">
                                <Coins size={14} /> {item.cost}
                            </div>
                            <button className="text-xs uppercase font-bold tracking-wider text-neon-blue px-3 py-1 bg-neon-blue/10 rounded hover:bg-neon-blue/20 transition-colors">
                                INSPECT
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Purchase Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => !purchaseStatus && setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-black border border-yellow-500 p-6 rounded-2xl w-full max-w-sm relative overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>

                            <div className="text-center mb-6">
                                <div className="w-20 h-20 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 border border-yellow-500/30">
                                    <selectedItem.icon size={40} className="text-yellow-500" />
                                </div>
                                <h2 className="text-2xl font-bold font-heading text-white">{selectedItem.name}</h2>
                                <p className="text-gray-400 text-sm mt-2">{selectedItem.desc}</p>
                            </div>

                            <div className="flex justify-center mb-8">
                                <div className={`text-2xl font-bold font-mono flex items-center gap-2 ${stats.coins >= selectedItem.cost ? 'text-green-400' : 'text-red-500'}`}>
                                    <Coins size={24} /> {selectedItem.cost}
                                </div>
                            </div>

                            {purchaseStatus === 'success' ? (
                                <div className="text-center py-4">
                                    <h3 className="text-green-500 font-bold text-xl animate-pulse">{message}</h3>
                                </div>
                            ) : purchaseStatus === 'error' ? (
                                <div className="text-center py-4">
                                    <h3 className="text-red-500 font-bold text-xl flex items-center justify-center gap-2">
                                        <AlertTriangle size={20} /> INSUFFICIENT FUNDS
                                    </h3>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Button
                                        className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                                        onClick={() => handleBuy(selectedItem)}
                                    >
                                        CONFIRM PURCHASE
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-gray-500 hover:text-white"
                                        onClick={() => setSelectedItem(null)}
                                    >
                                        CANCEL
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShopPage;
