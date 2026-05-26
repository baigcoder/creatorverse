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
            // Default — solid saffron orange (mapped from violet)
            'bg-violet text-white neo-btn':
              variant === 'default',
            // Gradient — hero CTA
            'gradient-cta text-white neo-btn':
              variant === 'gradient',
            // Destructive
            'bg-error text-white neo-btn':
              variant === 'destructive',
            // Outline
            'border-2 border-foreground bg-transparent text-foreground hover:bg-violet/5 duration-150 shadow-flat-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-flat-md active:translate-x-[1px] active:translate-y-[1px] active:shadow-flat-sm':
              variant === 'outline',
            // Secondary
            'bg-muted text-foreground neo-btn':
              variant === 'secondary',
            // Ghost
            'text-foreground hover:bg-muted duration-150':
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
