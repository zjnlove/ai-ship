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
      <div className="relative z-10 container">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="animate-text-gradient mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
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

        <ScrollAnimation delay={0.2}>
          <div className="mx-auto mt-12 max-w-full">
            <Accordion
              type="single"
              collapsible
              className="border-primary/30 w-full rounded-2xl border p-2"
            >
              {section.items?.map((item, idx) => (
                <div className="group" key={idx}>
                  <AccordionItem
                    value={item.question || item.title || ''}
                    className="peer rounded-xl border-none px-6 py-1 data-[state=open]:border-none"
                  >
                    <AccordionTrigger className="data-[state=open]:text-primary hover:text-primary cursor-pointer text-base font-medium transition-all duration-300 hover:no-underline">
                      <span className="flex items-center gap-3">
                        {/* 左侧指示条 */}
                        <span className="h-6 w-1 rounded-full bg-gradient-to-b from-green-500 to-emerald-500 opacity-0 transition-opacity group-data-[state=open]:opacity-100" />
                        {item.question || item.title || ''}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="data-[state=open]:animate-accordion-open data-[state=closed]:animate-accordion-closed">
                      <p className="text-muted-foreground px-9 pb-4 text-base leading-relaxed">
                        {item.answer || item.description || ''}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <hr className="border-primary/30 mx-6 border-dashed group-last:hidden peer-data-[state=open]:opacity-0" />
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
