import { ReactNode } from 'react';

interface NavigationProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export function Navigation({ leftContent, rightContent }: NavigationProps) {
  return (
    <header className="px-6">
      <nav className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">{leftContent}</div>
        <div className="flex items-center gap-2">{rightContent}</div>
      </nav>
    </header>
  );
}
