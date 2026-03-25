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
  const highlightText = section.highlight_text ?? '';
  let texts = null;
  if (highlightText) {
    texts = section.title?.split(highlightText, 2);
  }

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
      <div className="relative z-10 container space-y-8 overflow-x-hidden px-2 sm:px-6 md:space-y-16 lg:space-y-20">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
            <h2 className="animate-text-gradient mb-6 text-4xl font-bold text-balance lg:text-5xl">
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

        {/* grid: clamp min-w-0 and fix px padding/breakpoints */}
        <div className="grid min-w-0 gap-12 sm:px-6 md:grid-cols-2 lg:gap-20 lg:px-0">
          <ScrollAnimation delay={0.1} direction="left">
            <Accordion
              type="single"
              value={activeItem}
              onValueChange={(value) => setActiveItem(value as string)}
              className="border-primary/30 bg-primary/10 w-full rounded-2xl border p-4"
            >
              {section.items?.map((item, idx) => (
                <AccordionItem
                  value={`item-${idx + 1}`}
                  key={idx}
                  className="rounded-xl border-none px-4 py-1 data-[state=open]:bg-white/5"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <motion.div
                      className="flex items-center gap-3 text-base"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={false}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {item.icon && (
                        <motion.div
                          className="bg-gradient-primary flex h-10 w-10 items-center justify-center rounded-lg"
                          whileHover={{ rotate: 5 }}
                          initial={false}
                          animate={{
                            scale: activeItem === `item-${idx + 1}` ? 1.1 : 1,
                            rotate: activeItem === `item-${idx + 1}` ? 5 : 0,
                          }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <SmartIcon
                            name={item.icon as string}
                            size={20}
                            className="text-white"
                          />
                        </motion.div>
                      )}
                      <motion.span
                        className="data-[state=open]:text-primary font-medium transition-colors duration-300"
                        initial={false}
                        animate={{
                          color:
                            activeItem === `item-${idx + 1}`
                              ? 'var(--primary)'
                              : 'inherit',
                          opacity: activeItem === `item-${idx + 1}` ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.title}
                      </motion.span>
                    </motion.div>
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
