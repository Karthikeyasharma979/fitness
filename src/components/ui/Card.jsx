import React from 'react';
import { motion } from 'framer-motion';
import styles from './Card.module.css';

const Card = ({ children, className = '', ...props }) => {
    return (
        <motion.div
            className={`${styles.card} ${className}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
