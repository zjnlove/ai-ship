'use client';

import { LazyImage } from '@/shared/blocks/common';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section, SectionItem } from '@/shared/types/blocks/landing';

export function Testimonials({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const highlightText = section.highlight_text ?? '';
  let texts = null;
  if (highlightText) {
    texts = section.title?.split(highlightText, 2);
  }
  const TestimonialCard = ({
    item,
    index,
  }: {
    item: SectionItem;
    index: number;
  }) => {
    // 推特风格：错落有致的布局
    const isLarge = index === 0 || index === 3;
    const isMedium = index === 1 || index === 4;

    return (
      <Card
        className={cn(
          'group card-hover relative flex flex-col gap-4 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10',
          isLarge && 'row-span-2',
          isMedium && ''
        )}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <CardContent className={cn('p-6', isLarge && 'p-8', isMedium && 'p-7')}>
          {/* 推特图标装饰 */}
          <div className="text-primary/20 group-hover:text-primary/40 absolute top-4 right-4 transition-colors">
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>

          {/* 引用内容 */}
          <p className="text-foreground relative z-10 flex-1 text-base leading-relaxed">
            {item.quote || item.description}
          </p>

          {/* 用户信息 - 推特风格 */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* 圆形头像 */}
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-30" />
              <div className="relative size-10 overflow-hidden rounded-full border-2 border-white/20 shadow-lg">
                <LazyImage
                  src={item.image?.src || item.avatar?.src || ''}
                  alt={item.image?.alt || item.avatar?.alt || item.name || ''}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-sm font-bold">
                  {item.name}
                </h3>
                {/* 认证图标 */}
                <svg
                  className="text-primary size-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-xs">
                @{item.role || item.title}
              </p>
            </div>

            {/* 时间戳 */}
            <div className="text-muted-foreground text-xs">
              {Math.floor(Math.random() * 24) + 1}h
            </div>
          </div>

          {/* 互动图标 */}
          <div className="flex items-center gap-6 border-t border-white/10 pt-3">
            <button className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs transition-colors">
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {Math.floor(Math.random() * 50) + 5}
            </button>
            <button className="text-muted-foreground flex items-center gap-1 text-xs transition-colors hover:text-green-500">
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {Math.floor(Math.random() * 20) + 2}
            </button>
            <button className="text-muted-foreground flex items-center gap-1 text-xs transition-colors hover:text-red-500">
              <svg
                className="size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {Math.floor(Math.random() * 100) + 10}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section
      id={section.id}
      className={cn(
        'relative overflow-hidden py-16 md:py-24',
        section.className,
        className
      )}
    >
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 container">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="animate-text-gradient mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {' '}
              {texts && texts.length > 0 ? (
                <>
                  <span className="text-black dark:text-white">{texts[0]}</span>
                  <span className="animate-gradient-text from-primary bg-gradient-to-r via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {highlightText}
                  </span>
                  <span className="text-black dark:text-white">{texts[1]}</span>
                </>
              ) : (
                <span className="text-black dark:text-white">
                  {section.title}
                </span>
              )}
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="relative mx-auto mt-12 grid auto-rows-auto gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {section.items?.map((item, index) => (
              <TestimonialCard key={index} item={item} index={index} />
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
