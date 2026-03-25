'use client';

import { LazyImage } from '@/shared/blocks/common';
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
  const TestimonialCard = ({
    item,
    index,
  }: {
    item: SectionItem;
    index: number;
  }) => {
    return (
      <div
        className="group card-hover glass hover:border-primary/30 flex flex-col justify-end gap-6 rounded-2xl border border-white/10 p-8 transition-all duration-300"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* 引号装饰 */}
        <div className="text-primary/10 group-hover:text-primary/20 absolute top-4 right-4 text-6xl font-bold transition-colors">
          "
        </div>

        <p className="text-foreground relative z-10 text-lg leading-relaxed">
          {item.quote || item.description}
        </p>

        <div className="flex items-center gap-4">
          <div className="relative">
            {/* 头像发光边框 */}
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 blur transition-opacity duration-300 group-hover:opacity-50" />
            <div className="relative aspect-square size-12 overflow-hidden rounded-xl border border-white/20 shadow-lg">
              <LazyImage
                src={item.image?.src || item.avatar?.src || ''}
                alt={item.image?.alt || item.avatar?.alt || item.name || ''}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div>
            <h3 className="text-foreground text-sm font-semibold">
              {item.name}
            </h3>
            <p className="text-muted-foreground text-xs">
              {item.role || item.title}
            </p>
          </div>
        </div>
      </div>
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
        <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 container">
        <ScrollAnimation>
          <div className="mx-auto max-w-2xl text-center text-balance">
            <h2 className="animate-text-gradient mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              <span className="text-gradient-primary">{section.title}</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="relative mx-auto mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {section.items?.map((item, index) => (
              <TestimonialCard key={index} item={item} index={index} />
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
