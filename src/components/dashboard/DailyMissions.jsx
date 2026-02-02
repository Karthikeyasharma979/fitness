import React, { useState } from 'react';
import Card from '../ui/Card';
import { CheckCircle, Circle } from 'lucide-react'; // Assuming we have lucide-react

const DailyMissions = () => {
    const [missions, setMissions] = useState([
        { id: 1, title: 'Push-ups: 100 reps', completed: false, xp: 10 },
        { id: 2, title: 'Sit-ups: 100 reps', completed: false, xp: 10 },
        { id: 3, title: 'Squats: 100 reps', completed: false, xp: 10 },
        { id: 4, title: 'Running: 10km', completed: false, xp: 20 },
    ]);

    const toggleMission = (id) => {
        setMissions(missions.map(m =>
            m.id === id ? { ...m, completed: !m.completed } : m
        ));
    };

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Daily Tasks</h3>
                <span style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--accent-primary)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    fontWeight: 600,
                    letterSpacing: '0.05em'
                }}>
                    TODAY
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {missions.map(mission => (
                    <div
                        key={mission.id}
                        onClick={() => toggleMission(mission.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '16px',
                            background: mission.completed ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                            border: mission.completed ? '1px solid var(--accent-primary)' : '1px solid transparent',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {mission.completed ? <CheckCircle size={20} color="var(--accent-primary)" /> : <Circle size={20} color="var(--text-muted)" />}
                        <div style={{ flex: 1 }}>
                            <span style={{
                                textDecoration: mission.completed ? 'none' : 'none',
                                color: mission.completed ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontWeight: mission.completed ? 500 : 400
                            }}>
                                {mission.title}
                            </span>
                        </div>
                        <span style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>+{mission.xp} PT</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default DailyMissions;
