'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Faq({
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
      </div>

      <div className="relative z-10 mx-auto max-w-full px-4 md:max-w-3xl md:px-8">
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
          <div className="mx-auto mt-12 max-w-full">
            <Accordion
              type="single"
              collapsible
              className="glass w-full rounded-2xl border border-white/10 p-2"
            >
              {section.items?.map((item, idx) => (
                <div className="group" key={idx}>
                  <AccordionItem
                    value={item.question || item.title || ''}
                    className="peer rounded-xl border-none px-6 py-1 data-[state=open]:border-none"
                  >
                    <AccordionTrigger className="data-[state=open]:text-primary cursor-pointer text-base font-medium hover:no-underline">
                      <span className="flex items-center gap-3">
                        {/* 左侧指示条 */}
                        <span className="h-6 w-1 rounded-full bg-gradient-to-b from-purple-500 to-pink-500 opacity-0 transition-opacity group-data-[state=open]:opacity-100" />
                        {item.question || item.title || ''}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="relative overflow-hidden">
                      {/* 展开时的光效 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5 opacity-0 transition-opacity duration-500 data-[state=open]:opacity-100" />
                      <p className="text-muted-foreground relative z-10 px-9 text-base leading-relaxed">
                        {item.answer || item.description || ''}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <hr className="mx-6 border-dashed border-white/10 group-last:hidden peer-data-[state=open]:opacity-0" />
                </div>
              ))}
            </Accordion>

            {section.tip && (
              <p
                className="text-muted-foreground mt-8 px-8 text-center"
                dangerouslySetInnerHTML={{ __html: section.tip }}
              />
            )}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
