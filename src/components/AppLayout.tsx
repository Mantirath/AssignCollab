import { TopNav } from "@/components/TopNav";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav title={title} subtitle={subtitle} />
      <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
