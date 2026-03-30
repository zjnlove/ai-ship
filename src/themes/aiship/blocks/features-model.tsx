'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

// 检测文件是否为视频
const isVideo = (src?: string): boolean => {
  if (!src) return false;
  return (
    src.toLowerCase().endsWith('.mp4') ||
    src.toLowerCase().endsWith('.webm') ||
    src.toLowerCase().endsWith('.mov')
  );
};

export function FeaturesModel({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const highlightText = section.highlight_text ?? '';
  let texts = null;
  if (highlightText) {
    texts = section.title?.split(highlightText, 2);
  }

  const selectedItem = section.items?.[selectedIndex];
  const itemsLength = section.items?.length ?? 0;

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || !itemsLength) return;

    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % itemsLength);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, itemsLength]);

  // 处理缩略图点击
  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setIsAutoPlaying(false);
    // 3秒后恢复自动播放
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  // 处理左右切换
  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? itemsLength - 1 : prev - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === itemsLength - 1 ? 0 : prev + 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
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
        <div className="bg-primary/5 absolute top-1/4 right-0 h-96 w-96 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 container space-y-8 md:space-y-12">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
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
          <div className="mx-auto max-w-6xl space-y-6">
            {/* 大图展示区域 */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-2xl">
              {selectedItem?.image?.src &&
                (isVideo(selectedItem.image.src) ? (
                  <video
                    key={selectedIndex}
                    src={selectedItem.image.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="animate-slow-fade-in-scale h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    key={selectedIndex}
                    src={selectedItem.image.src}
                    alt={selectedItem.image?.alt ?? selectedItem.title ?? ''}
                    fill
                    className="animate-slow-fade-in-scale object-cover"
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    priority
                  />
                ))}

              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* 模型信息（左下角） */}
              <div className="absolute right-0 bottom-0 left-0 p-6 md:p-10">
                <p className="mb-2 text-sm font-medium tracking-wide text-white/70 uppercase">
                  {selectedItem?.text}
                </p>
                <h3 className="mb-3 text-2xl font-bold text-white md:text-4xl">
                  {selectedItem?.title}
                </h3>
                <p className="max-w-2xl text-sm leading-relaxed text-white/90 md:text-base">
                  {selectedItem?.description}
                </p>
              </div>

              {/* 左右切换按钮 */}
              <button
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev === 0 ? (section.items?.length ?? 1) - 1 : prev - 1
                  )
                }
                className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40"
                aria-label="Previous"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              <button
                onClick={() =>
                  setSelectedIndex((prev) =>
                    prev === (section.items?.length ?? 1) - 1 ? 0 : prev + 1
                  )
                }
                className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/40"
                aria-label="Next"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>

            {/* 缩略图列表 - 无限循环滚动 */}
            <div className="relative w-full overflow-hidden">
              {/* 渐变遮罩 */}
              <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-20 bg-gradient-to-r to-transparent" />
              <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-20 bg-gradient-to-l to-transparent" />

              {/* 滚动容器 */}
              <div
                className="animate-scroll-thumbnails flex gap-3 py-2"
                style={{
                  width: `${(section.items?.length ?? 0) * 2 * 172}px`, // 160px + 12px gap
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = 'paused';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = 'running';
                }}
              >
                {/* 第一份缩略图 */}
                {section.items?.map((item, idx) => (
                  <button
                    key={`first-${idx}`}
                    onClick={() => handleThumbnailClick(idx)}
                    className={cn(
                      'relative flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300',
                      'h-20 w-40 md:h-24 md:w-40',
                      selectedIndex === idx
                        ? 'ring-primary scale-105 ring-2'
                        : 'opacity-60 hover:scale-102 hover:opacity-100'
                    )}
                  >
                    {item.image?.src &&
                      (isVideo(item.image.src) ? (
                        <video
                          src={item.image.src}
                          muted
                          loop
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={item.image.src}
                          alt={item.image?.alt ?? item.title ?? ''}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      ))}
                    {selectedIndex === idx && (
                      <div className="bg-primary/10 absolute inset-0" />
                    )}
                  </button>
                ))}
                {/* 第二份缩略图（实现无缝循环） */}
                {section.items?.map((item, idx) => (
                  <button
                    key={`second-${idx}`}
                    onClick={() => handleThumbnailClick(idx)}
                    className={cn(
                      'relative flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300',
                      'h-20 w-40 md:h-24 md:w-40',
                      selectedIndex === idx
                        ? 'ring-primary scale-105 ring-2'
                        : 'opacity-60 hover:scale-102 hover:opacity-100'
                    )}
                  >
                    {item.image?.src &&
                      (isVideo(item.image.src) ? (
                        <video
                          src={item.image.src}
                          muted
                          loop
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={item.image.src}
                          alt={item.image?.alt ?? item.title ?? ''}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      ))}
                    {selectedIndex === idx && (
                      <div className="bg-primary/10 absolute inset-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
