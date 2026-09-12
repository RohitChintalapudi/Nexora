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
        'relative grid grid-cols-2 p-1 rounded-xl bg-neutral-100/80 border border-black/[0.06] shadow-inner select-none',
        className
      )}
    >
      {/* Apple Light active sliding pill */}
      <motion.div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08),_0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.04] pointer-events-none"
        initial={false}
        animate={{
          x: mode === 'signin' ? 4 : 'calc(100% + 4px)',
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
          mass: 0.8,
        }}
      />

      <button
        type="button"
        onClick={() => onModeChange('signin')}
        className={cn(
          'relative z-10 flex items-center justify-center gap-2.5 py-2.5 text-sm sm:text-base font-medium transition-colors duration-200 cursor-pointer font-serif',
          mode === 'signin' ? 'text-neutral-900 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
        )}
      >
        <LogIn className="w-4 h-4" />
        <span>Sign In</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange('signup')}
        className={cn(
          'relative z-10 flex items-center justify-center gap-2.5 py-2.5 text-sm sm:text-base font-medium transition-colors duration-200 cursor-pointer font-serif',
          mode === 'signup' ? 'text-neutral-900 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
        )}
      >
        <UserPlus className="w-4 h-4" />
        <span>Create Account</span>
      </button>
    </div>
  );
};

export default AuthSwitch;
