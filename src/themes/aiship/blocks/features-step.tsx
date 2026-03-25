'use client';

import { ArrowBigRight } from 'lucide-react';

import { SmartIcon } from '@/shared/blocks/common';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function FeaturesStep({
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
        <div className="absolute top-1/3 left-0 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 m-4 rounded-[2rem]">
        <div className="@container relative container">
          <ScrollAnimation>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-primary font-medium">{section.label}</span>
              <h2 className="animate-text-gradient mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                {texts && texts.length > 0 ? (
                  <>
                    <span className="text-black dark:text-white">
                      {texts[0]}
                    </span>
                    <span className="animate-gradient-text from-primary bg-gradient-to-r via-blue-500 to-purple-500 bg-clip-text text-transparent">
                      {highlightText}
                    </span>
                    <span className="text-black dark:text-white">
                      {texts[1]}
                    </span>
                  </>
                ) : (
                  <span className="text-black dark:text-white">
                    {section.title}
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground mt-4 text-lg text-balance md:text-xl">
                {section.description}
              </p>
            </div>
          </ScrollAnimation>

          <ScrollAnimation delay={0.2}>
            <div className="mt-20 grid gap-10 @3xl:grid-cols-4">
              {section.items?.map((item, idx) => (
                <div className="relative" key={idx}>
                  <div className="text-center">
                    {/* 渐变圆形 + 内置数字 */}
                    <div className="relative mx-auto mb-8">
                      <div className="bg-gradient-primary mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-xl">
                        <span className="text-2xl font-bold text-white">
                          {idx + 1}
                        </span>
                      </div>
                    </div>

                    {/* 箭头连接 - 位于右侧 */}
                    {idx < (section.items?.length ?? 0) - 1 && (
                      <div className="absolute top-8 right-0 hidden translate-x-1/2 @3xl:block">
                        <div className="flex items-center">
                          <div className="from-primary/50 to-primary h-px w-8 bg-gradient-to-r" />
                          <ArrowBigRight className="fill-primary stroke-primary -ml-1 size-6" />
                        </div>
                      </div>
                    )}

                    <h3 className="text-foreground mb-3 text-xl font-bold">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
