import { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SignUser } from '@/shared/blocks/common';
import { DashboardLayout } from '@/shared/blocks/dashboard/layout';
import { getAllConfigs } from '@/shared/models/config';
import { Sidebar as SidebarType } from '@/shared/types/blocks/dashboard';
import { Footer } from '@/themes/aiship/blocks/footer';

export default async function ActivityLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('activity');

  const sidebar: SidebarType = t.raw('sidebar');

  const configs = await getAllConfigs();
  if (configs.app_name) {
    sidebar.header!.brand!.title = configs.app_name;
    sidebar.header!.brand!.logo!.alt = configs.app_name;
  }
  if (configs.app_logo) {
    sidebar.header!.brand!.logo!.src = configs.app_logo;
  }
  if (configs.version) {
    sidebar.header!.version = configs.version;
  }

  // Theme Footer component with starry sky effect
  const footer = (
    <Footer
      footer={{
        brand: {
          title: configs.app_name,
          logo: {
            src: configs.app_logo,
            alt: configs.app_name,
          },
          description: configs.app_description,
        },
        copyright: `© ${new Date().getFullYear()} ${configs.app_name}`,
        agreement: {
          items: [
            { title: '使用条款', url: '/terms' },
            { title: '隐私政策', url: '/privacy' },
            { title: '帮助中心', url: '/help' },
            { title: '联系我们', url: '/contact' },
          ],
        },
        show_built_with: false,
        show_theme: true,
        show_locale: true,
      }}
    />
  );

  // Header bar with credits and user info
  const header = (
    <>
      <div className="flex items-center gap-3">
        <span className="font-medium">Dashboard</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm font-medium text-green-600">
          🪙 970 Credits
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-xs font-medium text-white">
          <SignUser userNav={sidebar.user_nav} />
        </div>
      </div>
    </>
  );

  return (
    <DashboardLayout sidebar={sidebar} header={header} footer={footer}>
      {children}
    </DashboardLayout>
  );
}
