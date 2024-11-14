function TabView({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>;
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b">
      <div className="mx-auto max-w-[1280px] px-6">
        <h1 className="flex h-[120px] items-center text-3xl font-medium">{children}</h1>
      </div>
    </div>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1280px] px-6 py-8">{children}</div>;
}

TabView.Title = Title;
TabView.Content = Content;

export default TabView;
