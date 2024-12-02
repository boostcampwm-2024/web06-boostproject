import { ReactNode } from 'react';

function Header({ children }: { children: ReactNode }) {
  return (
    <header className="px-6">
      <nav className="flex h-16 items-center justify-between">{children}</nav>
    </header>
  );
}

function Left({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-4">{children}</div>;
}

function Right({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

Header.Left = Left;
Header.Right = Right;

export default Header;
