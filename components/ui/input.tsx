import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-10 w-full border border-hairline rounded-sm bg-canvas px-base py-md text-body placeholder:text-muted transition-colors outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
}

export { Input };
