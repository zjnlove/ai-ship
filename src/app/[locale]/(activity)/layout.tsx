import { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemeBlock } from '@/core/theme';
import { SignUser } from '@/shared/blocks/common';
import { DashboardLayout } from '@/shared/blocks/dashboard/layout';
import { getAllConfigs } from '@/shared/models/config';
import { getUserInfo } from '@/shared/models/user';
import { Sidebar as SidebarType } from '@/shared/types/blocks/dashboard';

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
  const tLanding = await getTranslations('landing');

  const sidebar: SidebarType = t.raw('sidebar');
  const footerConfig = tLanding.raw('footer');

  const configs = await getAllConfigs();
  const user = await getUserInfo();

  if (configs.app_name) {
    sidebar.header!.brand!.title = configs.app_name;
    sidebar.header!.brand!.logo!.alt = configs.app_name;
  }
  if (configs.app_logo) {
    sidebar.header!.brand!.logo!.src = configs.app_logo;
  }
  const Footer = await getThemeBlock('footer');

  // Theme Footer component with starry sky effect
  const footer = <Footer footer={footerConfig} />;

  // Header bar with credits and user info
  const header = (
    <>
      <div className="flex items-center gap-3">
        <span className="font-medium"></span>
      </div>

      <div className="ml-auto flex items-center">
        <SignUser userNav={sidebar.user_nav} showCredits />
      </div>
    </>
  );

  return (
    <div
      style={{ scrollbarGutter: 'stable', height: '100vh', overflowY: 'auto' }}
    >
      <DashboardLayout sidebar={sidebar} header={header} footer={footer}>
        {children}
      </DashboardLayout>
    </div>
  );
}
