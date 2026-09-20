import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePassword, type PasswordStrengthCategory } from '../../lib/auth-validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  theme?: 'light' | 'dark';
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  theme = 'light',
}) => {
  const analysis = analyzePassword(password);
  const { score, category } = analysis;

  if (!password) {
    return null;
  }

  // 3-Section Colors: Solid Red for Easy, Solid Green for Medium & Hard (No glow)
  const getCategoryConfig = (cat: PasswordStrengthCategory | null) => {
    switch (cat) {
      case 'Easy':
        return {
          label: 'Easy',
          dotColor: 'bg-red-500',
          textColor: theme === 'light' ? 'text-red-600' : 'text-red-500',
        };
      case 'Medium':
        return {
          label: 'Medium',
          dotColor: 'bg-emerald-500',
          textColor: theme === 'light' ? 'text-emerald-600' : 'text-emerald-500',
        };
      case 'Hard':
        return {
          label: 'Hard',
          dotColor: 'bg-emerald-500',
          textColor: theme === 'light' ? 'text-emerald-600' : 'text-emerald-500',
        };
      default:
        return {
          label: 'Easy',
          dotColor: 'bg-red-500',
          textColor: theme === 'light' ? 'text-red-600' : 'text-red-500',
        };
    }
  };

  const currentConfig = getCategoryConfig(category);
  const isLight = theme === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-2 mt-1.5 px-0.5"
    >
      {/* 3 Solid Dots (Red for Easy, Green for Medium/Hard) */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3].map((dotIndex) => {
          const isActive = score >= dotIndex;
          return (
            <motion.div
              key={dotIndex}
              animate={{
                scale: isActive ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.18 }}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                isActive
                  ? currentConfig.dotColor
                  : isLight
                  ? 'bg-neutral-200 border border-neutral-300/80'
                  : 'bg-white/15 border border-white/20'
              }`}
            />
          );
        })}
      </div>

      {/* Strength Label and Dynamic Category */}
      <div className="flex items-center gap-1 text-[11px] font-mono">
        <span className={isLight ? 'text-neutral-500' : 'text-neutral-400'}>
          Strength:
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={category || 'Easy'}
            initial={{ opacity: 0, x: -2 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 2 }}
            transition={{ duration: 0.12 }}
            className={`font-semibold tracking-wide ${currentConfig.textColor}`}
          >
            {currentConfig.label}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
