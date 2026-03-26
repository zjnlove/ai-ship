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
      <div className="relative z-10 container space-y-12 md:space-y-16">
        <ScrollAnimation>
          <div className="text-center">
            <h2 className="mb-6 text-4xl font-bold text-balance lg:text-5xl">
              {texts && texts.length > 0 ? (
                <>
                  <span className="text-black dark:text-white">{texts[0]}</span>
                  <span className="from-primary bg-gradient-to-r via-blue-500 to-purple-500 bg-clip-text text-transparent">
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
          <div className="grid gap-8 md:grid-cols-3">
            {section.items?.map((item, idx) => (
              <div
                key={idx}
                className="group card-hover relative overflow-hidden rounded-2xl bg-transparent p-8 text-center transition-all duration-300"
              >
                {/* 装饰圆环 */}
                <div className="border-primary/30 pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full border transition-transform duration-500 group-hover:scale-110" />
                <div className="border-primary/30 pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full border transition-transform duration-500 group-hover:scale-110" />

                <div className="relative z-10 space-y-4">
                  {/* 数字 */}
                  <div className="text-5xl font-bold md:text-6xl">
                    <span className="text-primary">{item.title}</span>
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
