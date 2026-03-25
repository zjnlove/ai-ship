'use client';

import { motion } from 'framer-motion';

import { LazyImage, SmartIcon } from '@/shared/blocks/common';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function FeaturesMedia({ section }: { section: Section }) {
  const imagePosition = section.image_position || 'left';
  const isImageRight = imagePosition === 'right';

  return (
    <section
      id={section.id || section.name}
      className={cn(
        'relative overflow-hidden py-16 md:py-24',
        section.className
      )}
    >
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 container flex flex-col items-center justify-center space-y-8 px-6 md:space-y-16">
        <motion.div
          className={cn(
            'grid items-center gap-8 sm:grid-cols-2 md:gap-12 lg:gap-24',
            isImageRight &&
              'sm:[&>*:first-child]:order-2 sm:[&>*:last-child]:order-1'
          )}
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          >
            <div className="group card-hover overflow-hidden rounded-2xl border border-white/10 shadow-xl">
              <LazyImage
                src={section.image?.src ?? ''}
                className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={section.image?.alt ?? ''}
              />
            </div>
          </motion.div>

          <motion.div
            className="relative space-y-6"
            initial={{ opacity: 0, x: isImageRight ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          >
            <h2 className="animate-text-gradient text-2xl font-bold md:text-3xl">
              <span className="text-gradient-primary">{section.title}</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {section.description}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {section.items?.map((item, idx) => (
                <div
                  key={item.title}
                  className="group/item glass hover:border-primary/30 rounded-xl border border-white/10 p-4 transition-all duration-300"
                >
                  <div className="bg-gradient-primary mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
                    <SmartIcon
                      name={item.icon as string}
                      size={20}
                      className="text-white"
                    />
                  </div>
                  <h3 className="mb-2 font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
