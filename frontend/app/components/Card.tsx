'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  className?: string;
  hoverEffect?: boolean;
  borderColor?: 'coral' | 'royal' | 'none';
}

export default function Card({
  children,
  icon,
  title,
  className = '',
  hoverEffect = true,
  borderColor = 'none',
}: CardProps) {
  const borderColors = {
    coral: 'hover:border-coral-red',
    royal: 'hover:border-royal-blue',
    none: '',
  };

  return (
    <motion.div
      className={`
        bg-white p-8 rounded-xl shadow-card
        ${hoverEffect ? 'hover:-translate-y-2 hover:shadow-card-hover' : ''}
        ${borderColor !== 'none' ? `border-2 border-transparent ${borderColors[borderColor]}` : ''}
        transition-all duration-300 ease-out
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {icon && (
        <motion.div
          className="text-5xl mb-4"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {icon}
        </motion.div>
      )}
      {title && (
        <h4 className="text-xl font-bold mb-3 text-navy-blue">{title}</h4>
      )}
      <div className="text-dark-gray">{children}</div>
    </motion.div>
  );
}
