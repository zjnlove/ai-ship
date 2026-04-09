import { ReactNode } from 'react';

import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { Sidebar as SidebarType } from '@/shared/types/blocks/dashboard';

import { Sidebar } from './sidebar';

export function DashboardLayout({
  children,
  sidebar,
  header,
  footer,
}: {
  children: ReactNode;
  sidebar: SidebarType;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 14)',
        } as React.CSSProperties
      }
    >
      {sidebar && (
        <Sidebar variant={sidebar.variant || 'inset'} sidebar={sidebar} />
      )}
      <SidebarInset>
        <div className="flex min-h-screen flex-col">
          {/* Sticky Header Bar */}
          {header && (
            <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 h-14 border-b backdrop-blur">
              <div className="flex h-full items-center justify-between px-6">
                {header}
              </div>
            </header>
          )}

          <main className="flex-1">{children}</main>

          {footer && <footer className="mt-auto">{footer}</footer>}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
