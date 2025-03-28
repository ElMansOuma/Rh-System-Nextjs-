import React from 'react';
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({
                                            children,
                                            className,
                                            ...props
                                          }) => {
  return (
    <div
      className={cn(
        'bg-white shadow-md rounded-lg border border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};