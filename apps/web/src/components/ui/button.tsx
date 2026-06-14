import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
          {
            // Default — modern premium violet solid
            'bg-violet hover:bg-violet/90 text-white rounded-xl shadow-[0_2px_12px_rgba(255,0,184,0.35)] hover:shadow-[0_4px_20px_rgba(255,0,184,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200':
              variant === 'default',
            // Gradient — hero CTA
            'gradient-cta text-white rounded-xl shadow-[0_4px_16px_rgba(255,0,184,0.25)] hover:shadow-[0_6px_24px_rgba(0,228,255,0.35)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200':
              variant === 'gradient',
            // Destructive
            'bg-error hover:bg-error/90 text-white rounded-xl shadow-[0_2px_12px_rgba(255,59,48,0.2)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-200':
              variant === 'destructive',
            // Outline — modern glass stroke
            'border border-white/15 bg-transparent text-white hover:bg-white/5 active:scale-[0.98] transition-all duration-150':
              variant === 'outline',
            // Secondary
            'bg-midnight-raised hover:bg-midnight-soft text-white rounded-xl border border-white/10 active:scale-[0.98] transition-all duration-200':
              variant === 'secondary',
            // Ghost
            'text-slate-300 hover:bg-white/5 hover:text-white duration-150':
              variant === 'ghost',
            // Link
            'text-violet underline-offset-4 hover:underline font-bold':
              variant === 'link',
          },
          {
            'h-10 rounded-xl px-5 text-sm': size === 'default',
            'h-9 rounded-lg px-3 text-sm': size === 'sm',
            'h-12 rounded-xl px-8 text-base': size === 'lg',
            'h-14 rounded-2xl px-10 text-base': size === 'xl',
            'h-10 w-10 rounded-xl': size === 'icon',
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
