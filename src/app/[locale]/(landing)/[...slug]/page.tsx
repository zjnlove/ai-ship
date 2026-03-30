import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { loadMessages } from '@/core/i18n/request';
import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import { ImageGenerator, VideoGenerator } from '@/shared/blocks/generator';
import { getLocalPage } from '@/shared/models/post';

export const revalidate = 3600;

// dynamic page metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // metadata values
  let title = '';
  let description = '';
  let canonicalUrl = '';

  // 1. try to get static page metadata from
  // content/pages/**/*.mdx

  // static page slug
  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  // filter invalid slug (files with extensions or dev server paths like @vite/client)
  if (staticPageSlug.includes('.') || staticPageSlug.startsWith('@')) {
    return;
  }

  // build canonical url
  canonicalUrl =
    locale !== envConfigs.locale
      ? `${envConfigs.app_url}/${locale}/${staticPageSlug}`
      : `${envConfigs.app_url}/${staticPageSlug}`;

  // get static page content
  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  // return static page metadata
  if (staticPage) {
    title = staticPage.title || '';
    description = staticPage.description || '';

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  // 2. static page not found, try to get dynamic page metadata from
  // src/config/locale/messages/{locale}/pages/**/*.json or ai/**/*.json

  // dynamic page slug
  const dynamicPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  // convert dots to slashes for file path
  const dynamicPagePath = dynamicPageSlug.replace(/\./g, '/');

  // try pages namespace first
  const pagesMessages = await loadMessages(`pages/${dynamicPagePath}`, locale);
  if (pagesMessages && pagesMessages.metadata) {
    title = pagesMessages.metadata.title || '';
    description = pagesMessages.metadata.description || '';

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  // 3. try ai namespace
  const aiMessages = await loadMessages(`ai/${dynamicPagePath}`, locale);
  if (aiMessages && aiMessages.metadata) {
    title = aiMessages.metadata.title || '';
    description = aiMessages.metadata.description || '';

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  // 4. return common metadata
  const tc = await getTranslations('common.metadata');

  title = tc('title');
  description = tc('description');

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // 1. try to get static page from
  // content/pages/**/*.mdx

  // static page slug
  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  // filter invalid slug (files with extensions or dev server paths like @vite/client)
  if (staticPageSlug.includes('.') || staticPageSlug.startsWith('@')) {
    return notFound();
  }

  // get static page content
  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  // return static page
  if (staticPage) {
    const Page = await getThemePage('static-page');

    return <Page locale={locale} post={staticPage} />;
  }

  // 2. static page not found
  // try to get dynamic page content from
  // src/config/locale/messages/{locale}/pages/**/*.json or ai/**/*.json

  // dynamic page slug
  const dynamicPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  // convert dots to slashes for file path
  const dynamicPagePath = dynamicPageSlug.replace(/\./g, '/');

  // try pages namespace first
  const pagesMessages = await loadMessages(`pages/${dynamicPagePath}`, locale);
  if (pagesMessages && pagesMessages.page) {
    const Page = await getThemePage('dynamic-page');
    return <Page locale={locale} page={pagesMessages.page} />;
  }

  // 3. try ai namespace
  const aiMessages = await loadMessages(`ai/${dynamicPagePath}`, locale);
  if (aiMessages && aiMessages.page) {
    // check if it's ai-image-generator subpage
    if (staticPageSlug.includes('ai-image-generator')) {
      const { hero, ...restSections } = aiMessages.page.sections || {};

      const page = {
        sections: {
          ...(hero && { hero }),
          generator: {
            component: (
              <ImageGenerator
                srOnlyTitle={aiMessages.generator?.title}
                className=""
              />
            ),
          },
          ...restSections,
        },
      };

      const Page = await getThemePage('dynamic-page');
      return <Page locale={locale} page={page} />;
    }

    if (staticPageSlug.includes('ai-video-generator')) {
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

      const Page = await getThemePage('dynamic-page');
      return <Page locale={locale} page={page} />;
    }

    const Page = await getThemePage('dynamic-page');
    return <Page locale={locale} page={aiMessages.page} />;
  }

  // 4. page not found
  return notFound();
}
