'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { LazyImage, SmartIcon } from '@/shared/blocks/common';
import { BorderBeam } from '@/shared/components/magicui/border-beam';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function FeaturesAccordion({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const [activeItem, setActiveItem] = useState<string>('item-1');

  const images: any = {};
  section.items?.forEach((item, idx) => {
    images[`item-${idx + 1}`] = {
      image: item.image?.src ?? '',
      alt: item.image?.alt || item.title || '',
    };
  });

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
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 container space-y-8 overflow-x-hidden px-2 sm:px-6 md:space-y-16 lg:space-y-20">
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

        {/* grid: clamp min-w-0 and fix px padding/breakpoints */}
        <div className="grid min-w-0 gap-12 sm:px-6 md:grid-cols-2 lg:gap-20 lg:px-0">
          <ScrollAnimation delay={0.1} direction="left">
            <Accordion
              type="single"
              value={activeItem}
              onValueChange={(value) => setActiveItem(value as string)}
              className="glass w-full rounded-2xl border border-white/10 p-4"
            >
              {section.items?.map((item, idx) => (
                <AccordionItem
                  value={`item-${idx + 1}`}
                  key={idx}
                  className="rounded-xl border-none px-4 py-1 data-[state=open]:bg-white/5"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-base">
                      {item.icon && (
                        <div className="bg-gradient-primary flex h-10 w-10 items-center justify-center rounded-lg">
                          <SmartIcon
                            name={item.icon as string}
                            size={20}
                            className="text-white"
                          />
                        </div>
                      )}
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground px-13">
                    {item.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollAnimation>

          <ScrollAnimation delay={0.2} direction="right">
            {/* min-w-0/flex-shrink to prevent overflow */}
            <div className="bg-background relative flex min-w-0 flex-shrink overflow-hidden rounded-3xl border p-2">
              <div className="absolute inset-0 right-0 ml-auto w-15 border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
              <div className="bg-background relative aspect-76/59 w-full min-w-0 rounded-2xl sm:w-[calc(3/4*100%+3rem)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeItem}-id`}
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="size-full overflow-hidden rounded-2xl border shadow-md"
                  >
                    <LazyImage
                      src={images[activeItem].image}
                      className="size-full object-cover object-left-top dark:mix-blend-lighten"
                      alt={images[activeItem].alt}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              <BorderBeam
                duration={6}
                size={200}
                className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
              />
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
