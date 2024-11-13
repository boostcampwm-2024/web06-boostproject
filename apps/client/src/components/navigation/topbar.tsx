interface TopbarProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

export function Topbar({ leftContent, rightContent }: TopbarProps) {
  return (
    <header className="px-6">
      <nav className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">{leftContent}</div>
        <div className="flex items-center gap-2">{rightContent}</div>
      </nav>
    </header>
  );
}
