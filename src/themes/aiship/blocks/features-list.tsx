'use client';

import { Link } from '@/core/i18n/navigation';
import { LazyImage, SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function FeaturesList({
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
      className={cn(
        'relative overflow-hidden py-16 md:py-24',
        section.className,
        className
      )}
    >
      <div className="relative z-10 container overflow-x-hidden">
        <div className="flex flex-wrap items-center gap-8 pb-12 md:gap-24">
          <ScrollAnimation direction="left">
            <div className="mx-auto w-full max-w-[500px] flex-shrink-0 md:mx-8">
              <div className="group card-hover overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                {section.image?.src?.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video
                    src={section.image.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <LazyImage
                    src={section.image?.src ?? ''}
                    alt={section.image?.alt ?? ''}
                    className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
            </div>
          </ScrollAnimation>
          <div className="w-full min-w-0 flex-1">
            <ScrollAnimation delay={0.1}>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
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
            </ScrollAnimation>
            <ScrollAnimation delay={0.2}>
              <p className="text-muted-foreground my-6 text-lg text-balance break-words md:text-xl">
                {section.description}
              </p>
            </ScrollAnimation>

            {section.buttons && section.buttons.length > 0 && (
              <ScrollAnimation delay={0.3}>
                <div className="flex flex-wrap items-center justify-start gap-2">
                  {section.buttons?.map((button, idx) => (
                    <Button
                      asChild
                      key={idx}
                      variant={button.variant || 'default'}
                      size={button.size || 'default'}
                    >
                      <Link
                        href={button.url ?? ''}
                        target={button.target ?? '_self'}
                        className={cn(
                          'focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                          'h-9 px-4 py-2',
                          'bg-background ring-foreground/10 hover:bg-muted/50 dark:ring-foreground/15 dark:hover:bg-muted/50 border border-transparent shadow-sm ring-1 shadow-black/15 duration-200'
                        )}
                      >
                        {button.icon && (
                          <SmartIcon name={button.icon as string} size={24} />
                        )}
                        {button.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              </ScrollAnimation>
            )}
          </div>
        </div>

        <ScrollAnimation delay={0.1}>
          <div className="relative grid min-w-0 grid-cols-1 gap-6 border-t border-white/10 pt-12 break-words sm:grid-cols-2 lg:grid-cols-4">
            {section.items?.map((item, idx) => (
              <Card
                className="group card-hover min-w-0 break-words transition-all duration-300"
                key={idx}
              >
                <CardContent className="space-y-4">
                  {/* 图标容器 */}
                  <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110">
                    {item.icon && (
                      <SmartIcon
                        name={item.icon as string}
                        size={24}
                        className="text-white"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-foreground font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description ?? ''}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
