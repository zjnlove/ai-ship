'use client';

import { Link } from '@/core/i18n/navigation';
import { LazyImage, SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
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
  return (
    <section
      className={cn(
        'relative overflow-hidden py-16 md:py-24',
        section.className,
        className
      )}
    >
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/4 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-1/4 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 container overflow-x-hidden">
        <div className="flex flex-wrap items-center gap-8 pb-12 md:gap-24">
          <ScrollAnimation direction="left">
            <div className="mx-auto w-full max-w-[500px] flex-shrink-0 md:mx-0">
              <div className="group card-hover overflow-hidden rounded-2xl border border-white/10 shadow-xl">
                <LazyImage
                  src={section.image?.src ?? ''}
                  alt={section.image?.alt ?? ''}
                  className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </ScrollAnimation>
          <div className="w-full min-w-0 flex-1">
            <ScrollAnimation delay={0.1}>
              <h2 className="animate-text-gradient text-4xl font-bold text-balance break-words lg:text-5xl">
                <span className="text-gradient-primary">{section.title}</span>
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
              <div
                className="group card-hover glass hover:border-primary/30 min-w-0 space-y-4 rounded-2xl border border-white/10 p-6 break-words transition-all duration-300"
                key={idx}
              >
                {/* 图标容器 */}
                <div className="bg-gradient-primary flex h-12 w-12 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110">
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
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
