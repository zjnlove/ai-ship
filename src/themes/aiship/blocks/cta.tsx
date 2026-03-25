'use client';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Cta({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn(
        'relative overflow-hidden py-24 md:py-32',
        section.className,
        className
      )}
    >
      {/* 全屏渐变背景 */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-cyan-600/20" />

      {/* 动态光效 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="animate-pulse-glow absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div
          className="animate-pulse-glow absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-pink-500/30 blur-3xl"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="animate-pulse-glow absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* 网格背景 */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(108, 92, 231, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108, 92, 231, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 container">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollAnimation>
            <h2 className="animate-text-gradient mb-6 text-4xl font-bold text-balance lg:text-5xl xl:text-6xl">
              <span className="text-gradient-hero">{section.title}</span>
            </h2>
          </ScrollAnimation>

          <ScrollAnimation delay={0.15}>
            <p
              className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg md:text-xl"
              dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
            />
          </ScrollAnimation>

          <ScrollAnimation delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {section.buttons?.map((button, idx) => (
                <Button
                  asChild
                  size="lg"
                  variant={button.variant || 'default'}
                  className={cn(
                    'btn-glow px-8 py-6 text-lg font-semibold transition-all duration-300',
                    button.variant === 'default' || !button.variant
                      ? 'animate-glow bg-gradient-primary hover:scale-105 hover:shadow-2xl'
                      : 'border-2 border-white/30 hover:border-white/50 hover:bg-white/10'
                  )}
                  key={idx}
                >
                  <Link
                    href={button.url || ''}
                    target={button.target || '_self'}
                  >
                    {button.icon && (
                      <SmartIcon
                        name={button.icon as string}
                        className="mr-2 size-5"
                      />
                    )}
                    <span>{button.title}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
