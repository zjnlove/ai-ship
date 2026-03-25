'use client';

import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Stats({
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
        'relative overflow-hidden py-16 md:py-24',
        section.className,
        className
      )}
    >
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 container space-y-12 md:space-y-16">
        <ScrollAnimation>
          <div className="mx-auto max-w-xl space-y-6 text-center">
            <h2 className="animate-text-gradient text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              <span className="text-gradient-primary">{section.title}</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="grid gap-8 md:grid-cols-3">
            {section.items?.map((item, idx) => (
              <div
                key={idx}
                className="group card-hover glass hover:border-primary/30 relative overflow-hidden rounded-2xl border border-white/10 p-8 text-center transition-all duration-300"
              >
                {/* 背景渐变 */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* 装饰圆环 */}
                <div className="border-primary/10 pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full border transition-transform duration-500 group-hover:scale-110" />
                <div className="border-primary/10 pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full border transition-transform duration-500 group-hover:scale-110" />

                <div className="relative z-10 space-y-4">
                  {/* 数字 */}
                  <div className="animate-text-gradient text-5xl font-bold md:text-6xl">
                    <span className="text-gradient-primary">{item.title}</span>
                  </div>

                  {/* 描述 */}
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {item.description}
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
