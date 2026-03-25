'use client';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Features({
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
        <div className="absolute top-1/4 left-0 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 container space-y-8 md:space-y-16">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
            <h2 className="animate-text-gradient mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              <span className="text-gradient-primary">{section.title}</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="relative mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {section.items?.map((item, idx) => (
              <div
                className="group card-hover glass hover:border-primary/30 rounded-2xl border border-white/10 p-8 transition-all duration-300"
                key={idx}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* 图标容器 */}
                <div className="bg-gradient-primary mb-6 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <SmartIcon
                    name={item.icon as string}
                    size={28}
                    className="text-white"
                  />
                </div>

                {/* 标题 */}
                <h3 className="text-foreground group-hover:text-primary mb-3 text-xl font-semibold transition-colors">
                  {item.title}
                </h3>

                {/* 描述 */}
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {/* 悬浮时的光效 */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5" />
                </div>
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
