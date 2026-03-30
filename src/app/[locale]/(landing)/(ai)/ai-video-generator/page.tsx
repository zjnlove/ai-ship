import { getTranslations, setRequestLocale } from 'next-intl/server';
import { V } from 'node_modules/framer-motion/dist/types.d-Cjd591yU';

import { loadMessages } from '@/core/i18n/request';
import { getThemePage } from '@/core/theme';
import { VideoGenerator } from '@/shared/blocks/generator';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'ai.video.metadata',
  canonicalUrl: '/ai-video-generator',
});

export default async function AiVideoGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // // get ai video data
  // const t = await getTranslations('ai.video');

  // // build page sections
  // const page: DynamicPage = {
  //   sections: {
  //     hero: {
  //       title: t.raw('page.title'),
  //       description: t.raw('page.description'),
  //       background_image: {
  //         src: '/imgs/bg/tree.jpg',
  //         alt: 'hero background',
  //       },
  //     },
  //     generator: {
  //       component: <VideoGenerator srOnlyTitle={t.raw('generator.title')} />,
  //     },
  //   },
  // };

  const aiMessages = await loadMessages(`ai/video`, locale);
  const { hero, ...restSections } = aiMessages.page.sections || {};

  const page = {
    sections: {
      ...(hero && { hero }),
      generator: {
        component: (
          <VideoGenerator
            srOnlyTitle={aiMessages.generator?.title}
            className=""
          />
        ),
      },
      ...restSections,
    },
  };
  // load page component
  const Page = await getThemePage('dynamic-page');

  return <Page locale={locale} page={page} />;
}
