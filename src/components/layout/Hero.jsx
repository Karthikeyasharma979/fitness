import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import styles from './Hero.module.css';

const Hero = ({ onStart }) => {
    return (
        <section className={styles.hero}>
            <motion.div
                className={styles.content}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
                <h1 className={styles.headline}>
                    Elevate Your <br />
                    <span className={styles.highlight}>Potential.</span>
                </h1>

                <p className={styles.subheadline}>
                    Precision tracking for elite performance. Master your fitness journey with data-driven insights.
                </p>

                <Button
                    variant="primary"
                    onClick={onStart}
                    style={{ fontSize: '1.1rem', padding: '1.2rem 3rem' }}
                >
                    Enter Dashboard
                </Button>
            </motion.div>
        </section>
    );
};

export default Hero;
