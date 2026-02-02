import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, ChevronRight, ChevronLeft } from 'lucide-react';

const StreakCalendar = ({ streak, history }) => {
    const today = new Date(); // Keep track of actual today
    const [currentDate, setCurrentDate] = useState(new Date()); // Track viewable month

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-indexed

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    // Generate days for the current month
    const daysInMonth = useMemo(() => {
        const date = new Date(currentYear, currentMonth, 1);
        const days = [];
        while (date.getMonth() === currentMonth) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentYear, currentMonth]);

    // Helpers
    const isToday = (date) => date.toDateString() === today.toDateString();

    const isActive = (date) => {
        const dateStr = date.toLocaleDateString('en-CA');
        return history.includes(dateStr);
    };

    const hasPassed = (date) => date < today && !isToday(date);

    return (
        <div className="bg-[#1a1b1e] rounded-2xl p-6 w-full max-w-sm relative overflow-hidden border border-white/5 shadow-2xl">

            {/* Header Section with Streak */}
            <div className="flex justify-between items-start mb-6 z-10 relative">
                <div>
                    <h3 className="text-gray-400 text-sm">Day {streak} <span className="text-xs text-gray-600">streak</span></h3>
                    <div className="flex items-center gap-1 mt-1">
                        <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={24} />
                        <span className="text-3xl font-bold text-white">{streak}</span>
                    </div>
                </div>

                {/* 3D Badge / Stamp Effect */}
                <div className="absolute top-0 right-0">
                    <div className="w-16 h-16 relative">
                        {/* Simulate the hexagonal badge from reference */}
                        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/20 to-purple-500/20 clip-path-hexagon blur-sm animate-pulse"></div>
                        <div className="absolute inset-[2px] bg-black clip-path-hexagon flex flex-col items-center justify-center border border-neon-blue/50 text-neon-blue">
                            <span className="text-lg font-bold">{today.getDate()}</span>
                            <span className="text-[8px] uppercase">{today.toLocaleString('default', { month: 'short' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-white font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <div className="flex gap-2">
                        <ChevronLeft size={16} className="text-gray-600 cursor-pointer hover:text-white" onClick={handlePrevMonth} />
                        <ChevronRight size={16} className="text-gray-600 cursor-pointer hover:text-white" onClick={handleNextMonth} />
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <span key={d} className="text-gray-600 text-xs">{d}</span>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {/* Padding for start day (simplified for now, assumes Mon start or similar if needed, but standard US Sun start here) */}
                    {Array(daysInMonth[0].getDay()).fill(null).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {daysInMonth.map((date) => {
                        const active = isActive(date);
                        const todayActive = isToday(date);

                        return (
                            <div
                                key={date.toString()}
                                className={`
                                    h-8 w-8 rounded-full flex items-center justify-center text-xs relative
                                    ${todayActive ? 'bg-green-500 text-black font-bold shadow-[0_0_10px_#22c55e]' : ''}
                                    ${active && !todayActive ? 'text-green-500 border border-green-500/30 bg-green-500/10' : ''}
                                    ${!active && !todayActive ? 'text-gray-500 hover:bg-white/5' : ''}
                                `}
                            >
                                {active ? (
                                    todayActive ? date.getDate() : <Check size={12} strokeWidth={4} />
                                ) : (
                                    date.getDate()
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Reward / Footer Section */}
            <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-4 rounded-xl border border-orange-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                    <Flame size={48} className="text-orange-500" />
                </div>

                <div className="flex justify-between items-end relative z-10">
                    <div>
                        <p className="text-orange-400 font-bold text-sm mb-1">Weekly Premium</p>
                        <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4].map((wk) => {
                                const currentWeek = Math.ceil(today.getDate() / 7);
                                const isActive = wk === currentWeek;
                                return (
                                    <div key={wk} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'bg-black/50 text-gray-600 border border-white/5'}`}>
                                        W{wk}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">{new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate()} days left</p>
                        <p className="text-xs text-gray-400">Rules</p>
                    </div>
                </div>
            </div>



        </div>
    );
};

export default StreakCalendar;
