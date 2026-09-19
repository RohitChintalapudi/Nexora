import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthSwitchProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
  className?: string;
}

export const AuthSwitch: React.FC<AuthSwitchProps> = ({
  mode,
  onModeChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative grid grid-cols-2 p-1 rounded-2xl bg-neutral-100/90 border border-black/10 select-none',
        className
      )}
    >
      {/* High-contrast solid black active sliding pill */}
      <motion.div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-black shadow-sm pointer-events-none"
        initial={false}
        animate={{
          x: mode === 'signin' ? 4 : 'calc(100% + 4px)',
        }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 32,
          mass: 0.8,
        }}
      />

      <button
        type="button"
        onClick={() => onModeChange('signin')}
        className={cn(
          'relative z-10 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-medium tracking-wide font-mono transition-colors duration-200 cursor-pointer',
          mode === 'signin' ? 'text-white' : 'text-neutral-500 hover:text-black'
        )}
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange('signup')}
        className={cn(
          'relative z-10 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-medium tracking-wide font-mono transition-colors duration-200 cursor-pointer',
          mode === 'signup' ? 'text-white' : 'text-neutral-500 hover:text-black'
        )}
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>Create Account</span>
      </button>
    </div>
  );
};

export default AuthSwitch;
