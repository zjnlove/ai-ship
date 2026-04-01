'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { Highlighter } from '@/shared/components/ui/highlighter';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

import { SocialAvatars } from './social-avatars';

// 弧线布局媒体画廊组件
// function ArcMediaGallery({
//   media,
// }: {
//   media?: Array<{ type: 'image' | 'video'; src: string; alt?: string }>;
// }) {
//   const [isVisible, setIsVisible] = useState(false);
//   const [scrollProgress, setScrollProgress] = useState(0);
//   const [animatedItems, setAnimatedItems] = useState<Set<number>>(new Set());
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//           // 逐个触发图片进场动画
//           mediaItems.forEach((_, index) => {
//             setTimeout(
//               () => {
//                 setAnimatedItems((prev) => new Set([...prev, index]));
//               },
//               index * 200 // 每张图片间隔200ms
//             );
//           });
//         }
//       },
//       { threshold: 0.1 }
//     );

//     if (containerRef.current) {
//       observer.observe(containerRef.current);
//     }

//     return () => observer.disconnect();
//   }, []);

//   // 监听滚动事件
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollY = window.scrollY;
//       const windowHeight = window.innerHeight;
//       // 计算滚动进度（0-1），在滚动一个屏幕高度内完成动画
//       const progress = Math.min(scrollY / windowHeight, 1);
//       setScrollProgress(progress);
//     };

//     window.addEventListener('scroll', handleScroll, { passive: true });
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const mediaItems = media || [];

//   // 弧线位置配置（不同形状）
//   const positions = [
//     // 左侧两个（靠近中间）
//     { top: '18%', left: '20%', rotate: -15, delay: 100, shape: 'rounded-3xl' },
//     { top: '50%', left: '10%', rotate: -25, delay: 200, shape: 'rounded-3xl' },
//     // 右侧两个（靠近中间）
//     { top: '15%', right: '20%', rotate: 15, delay: 300, shape: 'rounded-3xl' },
//     { top: '50%', right: '10%', rotate: 25, delay: 400, shape: 'rounded-3xl' },
//     // 底部两个（弧线排列）
//     {
//       bottom: '6%',
//       left: '25%',
//       rotate: -10,
//       delay: 500,
//       shape: 'rounded-3xl',
//     },
//     {
//       bottom: '6%',
//       right: '30%',
//       rotate: 10,
//       delay: 600,
//       shape: 'rounded-3xl',
//     },
//   ];

//   const renderMedia = (item: (typeof mediaItems)[0], index: number) => {
//     const pos = positions[index];
//     if (!pos) return null;

//     // 目标位置：左侧 button 区域
//     const targetLeft = '12%';
//     const targetTop = '65%';

//     // 根据滚动进度计算当前位置
//     const currentTop = pos.top
//       ? `${parseFloat(pos.top) + (parseFloat(targetTop) - parseFloat(pos.top)) * scrollProgress}%`
//       : undefined;
//     const currentBottom = pos.bottom
//       ? `${parseFloat(pos.bottom) - scrollProgress * parseFloat(pos.bottom)}%`
//       : undefined;
//     const currentLeft = pos.left
//       ? `${parseFloat(pos.left) + (parseFloat(targetLeft) - parseFloat(pos.left)) * scrollProgress}%`
//       : undefined;
//     const currentRight = pos.right
//       ? `${parseFloat(pos.right) - scrollProgress * parseFloat(pos.right)}%`
//       : undefined;

//     // 旋转角度逐渐归零
//     const currentRotate = pos.rotate * (1 - scrollProgress);

//     // 缩放逐渐变小
//     const currentScale = isVisible ? 1 - scrollProgress * 0.3 : 0.8;

//     // 进场动画效果
//     const isAnimated = animatedItems.has(index);
//     const getInitialTransform = () => {
//       if (isAnimated) return '';
//       switch (index) {
//         case 0:
//           return 'translate-x-[-200px] translate-y-[-100px] scale(0.3) rotate(-45deg)';
//         case 1:
//           return 'translate-y-[-200px] scale(0.2) rotate(90deg)';
//         case 2:
//           return 'translate-x-[200px] translate-y-[-100px] scale(0.3) rotate(45deg)';
//         case 3:
//           return 'translate-x-[-150px] translate-y-[100px] scale(0.2) rotate(-90deg)';
//         case 4:
//           return 'translate-y-[200px] scale(0.3) rotate(120deg)';
//         case 5:
//           return 'translate-x-[150px] translate-y-[100px] scale(0.2) rotate(90deg)';
//         default:
//           return 'translate-y-[-200px] scale(0.3) rotate(45deg)';
//       }
//     };

//     // 使用 CSS 变量减少内联样式大小
//     const positionStyle: React.CSSProperties = {
//       position: 'absolute',
//       top: currentTop,
//       bottom: currentBottom,
//       left: currentLeft,
//       right: currentRight,
//       '--rotate': `${currentRotate}deg`,
//       '--scale': currentScale,
//       '--initial-transform': getInitialTransform(),
//       '--opacity': isVisible ? (isAnimated ? 1 - scrollProgress * 0.5 : 0) : 0,
//       transform: `rotate(var(--rotate)) scale(var(--scale)) var(--initial-transform)`,
//       transition: isAnimated
//         ? 'all 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
//         : 'all 0.3s ease-out',
//       opacity: 'var(--opacity)',
//     } as React.CSSProperties;

//     return (
//       <div
//         key={index}
//         style={positionStyle}
//         className="group gallery-item z-20 hidden md:block"
//       >
//         <div
//           className={`border-border/30 bg-background/80 hover:border-primary/50 relative h-24 w-24 overflow-hidden ${pos.shape} border shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl lg:h-32 lg:w-32`}
//         >
//           {item.type === 'video' ? (
//             <video
//               src={item.src}
//               autoPlay
//               loop
//               muted
//               playsInline
//               className="h-full w-full object-cover"
//             />
//           ) : (
//             <Image
//               src={item.src}
//               alt={item.alt || `Media ${index + 1}`}
//               fill
//               className="object-cover"
//               sizes="(max-width: 768px) 0vw, 160px"
//               loading="lazy"
//             />
//           )}
//           {/* 悬停时的光晕效果 */}
//           <div className="from-primary/20 absolute inset-0 rounded-xl bg-gradient-to-tr to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div
//       ref={containerRef}
//       className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
//     >
//       {mediaItems.slice(0, 6).map((item, index) => renderMedia(item, index))}
//     </div>
//   );
// }

// 渐进式入场动画组件（左右方向）
function FadeInDirection({
  children,
  direction = 'left',
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible
          ? 'translate-x-0 opacity-100'
          : direction === 'left'
            ? 'translate-x-[-30px] opacity-0'
            : 'translate-x-[30px] opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
}

// 渐进式入场动画组件（从下到上）
function FadeInUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-[20px] opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
}

// 渐进式入场动画组件（从上到下）
function FadeInDown({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-[-20px] opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
}

// 无限循环滚动卡片画廊组件
function InfiniteScrollGallery({
  items,
}: {
  items: Array<{
    type: 'image' | 'video';
    src: string;
    alt?: string;
    title?: string;
    text?: string;
  }>;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* 渐变遮罩 */}
      <div className="from-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-32 bg-gradient-to-r to-transparent" />
      <div className="from-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-32 bg-gradient-to-l to-transparent" />

      {/* 滚动容器 */}
      <div
        className="animate-scroll-thumbnails flex gap-4"
        style={{
          width: `${items.length * 2 * 280}px`, // 264px + 16px gap
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = 'paused';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = 'running';
        }}
      >
        {/* 第一份卡片 */}
        {items.map((item, idx) => (
          <div
            key={`first-${idx}`}
            className="group border-border/30 bg-background/80 relative flex-shrink-0 overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{ width: '280px', height: '450px' }}
          >
            {item.type === 'video' ? (
              <video
                src={item.src}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt || `Gallery item ${idx + 1}`}
                fill
                className="object-cover"
                sizes="264px"
                loading="lazy"
              />
            )}
            {/* 左下角文字覆盖层 */}
            <div className="absolute right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
              {item.text && (
                <div className="mb-1 text-xs font-medium tracking-wider text-white/80 uppercase">
                  {item.text}
                </div>
              )}
              {item.title && (
                <div className="text-lg leading-tight font-bold text-white">
                  {item.title}
                </div>
              )}
            </div>
            {/* 悬停时的光晕效果 */}
            <div className="from-primary/20 absolute inset-0 bg-gradient-to-tr to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ))}
        {/* 第二份卡片（实现无缝循环） */}
        {items.map((item, idx) => (
          <div
            key={`second-${idx}`}
            className="group border-border/30 bg-background/80 relative flex-shrink-0 overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{ width: '280px', height: '450px' }}
          >
            {item.type === 'video' ? (
              <video
                src={item.src}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={item.src}
                alt={item.alt || `Gallery item ${idx + 1}`}
                fill
                className="object-cover"
                sizes="264px"
                loading="lazy"
              />
            )}
            {/* 左下角文字覆盖层 */}
            <div className="absolute right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
              {item.text && (
                <div className="mb-1 text-xs font-medium tracking-wider text-white/80 uppercase">
                  {item.text}
                </div>
              )}
              {item.title && (
                <div className="text-lg leading-tight font-bold text-white">
                  {item.title}
                </div>
              )}
            </div>
            {/* 悬停时的光晕效果 */}
            <div className="from-primary/20 absolute inset-0 bg-gradient-to-tr to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 粒子背景组件
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 获取主题色
    const getPrimaryColor = () => {
      const primary = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim();
      // oklch 格式: oklch(0.65 0.18 45)
      // 转换为 rgb
      const match = primary.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
      if (match) {
        const l = parseFloat(match[1]);
        const c = parseFloat(match[2]);
        const h = parseFloat(match[3]);
        // oklch 转 rgb 的简化计算
        const a = c * Math.cos((h * Math.PI) / 180);
        const b = c * Math.sin((h * Math.PI) / 180);
        const r = Math.round(
          Math.max(0, Math.min(255, (l + 0.3963 * a + 0.2158 * b) * 255))
        );
        const g = Math.round(
          Math.max(0, Math.min(255, (l - 0.1055 * a - 0.0638 * b) * 255))
        );
        const blue = Math.round(
          Math.max(0, Math.min(255, (l - 0.0894 * a - 1.2914 * b) * 255))
        );
        return { r, g, b: blue };
      }
      // 默认橙金色
      return { r: 255, g: 180, b: 50 };
    };

    const primaryColor = getPrimaryColor();

    // 设置画布大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 粒子数组
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      opacity: number;
    }> = [];

    // 创建粒子
    const createParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };
    createParticles();

    // 动画循环
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制粒子
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 边界检测
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${particle.opacity})`;
        ctx.fill();
      });

      // 绘制连线
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

export function Hero({
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

  const mediaItems =
    section.items
      ?.filter((item) => item.image?.src)
      .map((item) => ({
        type: 'image' as const,
        src: item.image!.src as string,
        alt: item.image?.alt,
        title: item.title,
        text: item.text,
      })) || [];

  return (
    <section
      id={section.id}
      className={cn(
        `relative overflow-hidden pt-38 pb-24 md:pt-42 md:pb-32`,
        section.className,
        className
      )}
    >
      {section.announcement && (
        <FadeInDown delay={0}>
          <Link
            href={section.announcement.url || ''}
            target={section.announcement.target || '_self'}
            className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto mb-8 flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
          >
            <span className="text-foreground text-sm">
              {section.announcement.title}
            </span>
            <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

            <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
              <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                <span className="flex size-6">
                  <ArrowRight className="m-auto size-3" />
                </span>
                <span className="flex size-6">
                  <ArrowRight className="m-auto size-3" />
                </span>
              </div>
            </div>
          </Link>
        </FadeInDown>
      )}

      <div className="relative z-10 mx-auto max-w-full px-4 text-center md:max-w-5xl">
        {/* 标题 - 从左到右 */}
        <FadeInDirection direction="left" delay={0}>
          {texts && texts.length > 0 ? (
            <h1 className="text-3xl font-bold sm:mt-12 sm:text-5xl lg:text-6xl">
              <>
                <span className="text-black dark:text-white">{texts[0]}</span>
                <span className="from-primary to-secondary bg-gradient-to-r bg-clip-text text-transparent">
                  {highlightText}
                </span>
                <span className="text-black dark:text-white">{texts[1]}</span>
              </>
            </h1>
          ) : (
            <h1 className="text-3xl font-bold text-balance sm:mt-12 sm:text-5xl lg:text-6xl">
              <span>{section.title}</span>
            </h1>
          )}
        </FadeInDirection>

        {/* 描述 - 从左到右，延迟 */}
        <FadeInDirection direction="left" delay={200}>
          <p
            className="text-muted-foreground mt-8 mb-8 text-lg text-balance"
            dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
          />
        </FadeInDirection>

        {/* 按钮 - 从右到左 */}
        {section.buttons && (
          <FadeInDirection direction="right" delay={400}>
            <div className="mt-8 flex items-center justify-center gap-4">
              {section.buttons.map((button, idx) => (
                <Button
                  asChild
                  size={button.size || 'lg'}
                  variant={button.variant || 'default'}
                  className={cn(
                    'rounded-full px-8 py-7 text-lg font-semibold transition-all duration-300',
                    button.variant === 'default' || !button.variant
                      ? 'bg-primary hover:bg-primary/90 shadow-primary/40 hover:shadow-primary/60 text-white shadow-[0_0_20px] hover:scale-105 hover:text-black hover:shadow-[0_0_30px] dark:text-black hover:dark:text-white'
                      : 'border-primary text-primary hover:bg-primary border-2 bg-transparent hover:scale-105 hover:text-black hover:dark:text-white'
                  )}
                  key={idx}
                >
                  <Link
                    href={button.url ?? ''}
                    target={button.target ?? '_self'}
                  >
                    {button.icon && <SmartIcon name={button.icon as string} />}
                    <span>{button.title}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </FadeInDirection>
        )}

        {section.tip && (
          <FadeInUp delay={600}>
            <p
              className="text-muted-foreground mt-6 block text-center text-sm"
              dangerouslySetInnerHTML={{ __html: section.tip ?? '' }}
            />
          </FadeInUp>
        )}

        {section.show_avatars && (
          <FadeInUp delay={600}>
            <SocialAvatars tip={section.avatars_tip || ''} />
          </FadeInUp>
        )}
      </div>

      {(section.image?.src || section.image_invert?.src) && (
        <div className="border-foreground/10 relative mt-8 border-y sm:mt-16">
          <div className="relative z-10 mx-auto max-w-6xl border-x px-3">
            <div className="border-x">
              <div
                aria-hidden
                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
              />
              {section.image_invert?.src && (
                <Image
                  className="border-border/25 relative z-2 hidden w-full border dark:block"
                  src={section.image_invert.src}
                  alt={section.image_invert.alt || section.image?.alt || ''}
                  width={
                    section.image_invert.width || section.image?.width || 1200
                  }
                  height={
                    section.image_invert.height || section.image?.height || 630
                  }
                  sizes="(max-width: 768px) 100vw, 1200px"
                  loading="lazy"
                  fetchPriority="high"
                  quality={75}
                  unoptimized={section.image_invert.src.startsWith('http')}
                />
              )}
              {section.image?.src && (
                <Image
                  className="border-border/25 relative z-2 block w-full border dark:hidden"
                  src={section.image.src}
                  alt={section.image.alt || section.image_invert?.alt || ''}
                  width={
                    section.image.width || section.image_invert?.width || 1200
                  }
                  height={
                    section.image.height || section.image_invert?.height || 630
                  }
                  sizes="(max-width: 768px) 100vw, 1200px"
                  loading="lazy"
                  fetchPriority="high"
                  quality={75}
                  unoptimized={section.image.src.startsWith('http')}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* {section.background_image?.src && (
        <div className="absolute inset-0 -z-10 hidden h-full w-full overflow-hidden md:block">
          <div className="from-background/80 via-background/80 to-background absolute inset-0 z-10 bg-gradient-to-b" />
          <Image
            src={section.background_image.src}
            alt={section.background_image.alt || ''}
            className="object-cover opacity-60 blur-[0px]"
            fill
            loading="lazy"
            sizes="(max-width: 768px) 0vw, 100vw"
            quality={70}
            unoptimized={section.background_image.src.startsWith('http')}
          />
        </div>
      )} */}

      {/* 底部循环滚动卡片画廊 */}
      {mediaItems.length > 0 && (
        <div className="relative z-20 mt-24 md:mt-34">
          <FadeInUp delay={1000}>
            <InfiniteScrollGallery items={mediaItems} />
          </FadeInUp>
        </div>
      )}
    </section>
  );
}
