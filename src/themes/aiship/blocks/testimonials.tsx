'use client';

import { useEffect, useState } from 'react';

import { LazyImage } from '@/shared/blocks/common';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Marquee } from '@/shared/components/ui/marquee';
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
  const [randomHour, setRandomHour] = useState<number | null>(null);

  useEffect(() => {
    setRandomHour(Math.floor(Math.random() * 24) + 1);
  }, []);

  const TestimonialCard = ({ item }: { item: SectionItem }) => {
    return (
      <Card
        className={cn(
          'group card-hover relative flex w-[350px] shrink-0 flex-col gap-4 transition-all duration-300'
        )}
      >
        <CardContent className="p-6">
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
          <div className="mt-4 flex items-center gap-3">
            <div className="relative">
              {/* 彩色模糊背景 */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-75 blur-sm" />
              <div className="from-primary absolute -inset-0.5 rounded-full bg-gradient-to-r via-blue-500 to-purple-500 opacity-50 blur" />
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
                @{item.role ?? item.title ?? ''}
              </p>
            </div>

            {/* 时间戳 */}
            <div className="text-muted-foreground text-xs">
              {randomHour !== null ? `${randomHour}h` : ''}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 将 items 分成两组用于不同的滚动行
  const items = section.items || [];
  const firstRow = items.slice(0, Math.ceil(items.length / 2));
  const secondRow = items.slice(Math.ceil(items.length / 2));

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
        <div className="bg-primary/5 absolute top-1/2 right-0 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container">
        <ScrollAnimation>
          <div className="mx-auto mb-12 max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
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

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          {/* 第一行 - 正向滚动 */}
          <Marquee pauseOnHover className="[--duration:40s]">
            {firstRow.map((item, index) => (
              <TestimonialCard key={`first-${index}`} item={item} />
            ))}
          </Marquee>

          {/* 第二行 - 反向滚动 */}
          {secondRow.length > 0 && (
            <Marquee reverse pauseOnHover className="mt-4 [--duration:40s]">
              {secondRow.map((item, index) => (
                <TestimonialCard key={`second-${index}`} item={item} />
              ))}
            </Marquee>
          )}

          {/* 渐变遮罩 - 左侧 */}
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
          {/* 渐变遮罩 - 右侧 */}
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
        </div>
      </div>
    </section>
  );
}
