import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function Logo({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className={cn('flex items-center gap-2', className)} {...props}>
          <span className="font-headline text-3xl font-extrabold tracking-tight text-white">
            Dinletiyo
          </span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
            aria-hidden="true"
            suppressHydrationWarning
          >
            <path
              d="M19.5 13.3045C18.3312 14.331 16.8285 15 15.202 15C11.2241 15 8 11.7759 8 7.798C8 6.17148 8.66904 4.66878 9.69553 3.5C6.46473 4.96102 4 7.95703 4 11.5C4 16.1944 7.80558 20 12.5 20C16.043 20 18.961 17.5353 20 14.5C19.829 14.093 19.6633 13.6965 19.5 13.3045Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              suppressHydrationWarning
            />
          </svg>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <span>Test Context Menu</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
