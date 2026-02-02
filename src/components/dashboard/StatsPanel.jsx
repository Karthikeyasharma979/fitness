import React from 'react';
import Card from '../ui/Card';

const StatsPanel = () => {
    const stats = [
        { name: 'Strength (STR)', value: 45, max: 100, color: 'var(--accent-alert)' },
        { name: 'Agility (AGI)', value: 62, max: 100, color: 'var(--accent-success)' },
        { name: 'Endurance (END)', value: 38, max: 100, color: 'var(--accent-secondary)' },
        { name: 'Intelligence (INT)', value: 74, max: 100, color: 'var(--accent-primary)' },
    ];

    return (
        <Card>
            <h3 style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                Performance Metrics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {stats.map((stat) => (
                    <div key={stat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{stat.name}</span>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{stat.value}</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${(stat.value / stat.max) * 100}%`,
                                height: '100%',
                                background: stat.color,
                                boxShadow: `0 0 10px ${stat.color}40`,
                                borderRadius: '3px',
                                transition: 'width 1s ease-out'
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default StatsPanel;
