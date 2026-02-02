import React from 'react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';

const Avatar = () => {
    return (
        <Card className="avatar-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--gradient-main)',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: '600',
                    color: '#fff'
                }}>
                    P
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.02rem' }}>Player Name</h2>
                    <p style={{ color: 'var(--accent-secondary)', margin: '0.25rem 0 0 0', fontWeight: '500', fontSize: '0.9rem' }}>Elite Member</p>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <ProgressBar value={350} max={1000} label="Progress to Level 2" color="blue" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Class: <span style={{ color: 'var(--text-primary)' }}>Athlete</span></span>
                <span>Title: <span style={{ color: 'var(--text-primary)' }}>Rookie</span></span>
            </div>
        </Card>
    );
};

export default Avatar;
