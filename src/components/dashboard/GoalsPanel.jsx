import React from 'react';
import Card from '../ui/Card';
import { Target, TrendingUp, Calendar, Zap } from 'lucide-react';

const GoalsPanel = () => {
    const goals = [
        {
            id: 1,
            title: "Target Weight",
            current: "74.5 kg",
            target: "70.0 kg",
            progress: 65,
            icon: <Target size={20} />,
            color: "var(--accent-primary)"
        },
        {
            id: 2,
            title: "Weekly Workouts",
            current: "3",
            target: "5",
            progress: 60,
            icon: <Calendar size={20} />,
            color: "var(--accent-success)"
        },
        {
            id: 3,
            title: "Daily Calorie Burn",
            current: "1,850",
            target: "2,500",
            progress: 74,
            icon: <Zap size={20} />,
            color: "var(--accent-alert)"
        }
    ];

    return (
        <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} color="var(--accent-secondary)" />
                    Active Goals
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {goals.map((goal) => (
                    <div key={goal.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Circular Progress (Simplified Visual) */}
                        <div style={{
                            position: 'relative',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: `conic-gradient(${goal.color} ${goal.progress}%, rgba(255,255,255,0.05) 0)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 15px ${goal.color}30`
                        }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                background: 'var(--bg-card)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{ color: goal.color, opacity: 0.9 }}>
                                    {goal.icon}
                                </span>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{goal.title}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{goal.progress}%</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{goal.current}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {goal.target}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center'
            }}>
                <button style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    fontWeight: 500
                }}>
                    View All Goals
                </button>
            </div>
        </Card>
    );
};

export default GoalsPanel;
