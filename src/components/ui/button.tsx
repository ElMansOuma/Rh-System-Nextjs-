import React from 'react';
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'subtle';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
                                                children,
                                                variant = 'default',
                                                className,
                                                ...props
                                              }) => {
  const variantStyles = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    subtle: 'text-gray-600 hover:bg-gray-100'
  };

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};