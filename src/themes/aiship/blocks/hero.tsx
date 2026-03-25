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
function ArcMediaGallery({
  media,
}: {
  media?: Array<{ type: 'image' | 'video'; src: string; alt?: string }>;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 默认媒体数据（如果没有提供）
  const defaultMedia = [
    { type: 'image' as const, src: '/imgs/features/1.png', alt: 'Feature 1' },
    { type: 'image' as const, src: '/imgs/features/2.png', alt: 'Feature 2' },
    { type: 'image' as const, src: '/imgs/features/3.png', alt: 'Feature 3' },
    { type: 'image' as const, src: '/imgs/features/4.png', alt: 'Feature 4' },
    { type: 'image' as const, src: '/imgs/features/5.png', alt: 'Feature 5' },
    { type: 'image' as const, src: '/imgs/features/6.png', alt: 'Feature 6' },
  ];

  const mediaItems = media || defaultMedia;

  // 弧线位置配置
  const positions = [
    // 左侧两个（靠近中间）
    { top: '20%', left: '5%', rotate: -15, delay: 100 },
    { top: '50%', left: '3%', rotate: -25, delay: 200 },
    // 右侧两个（靠近中间）
    { top: '20%', right: '5%', rotate: 15, delay: 300 },
    { top: '50%', right: '3%', rotate: 25, delay: 400 },
    // 底部两个（弧线排列）
    { bottom: '5%', left: '25%', rotate: -10, delay: 500 },
    { bottom: '5%', right: '25%', rotate: 10, delay: 600 },
  ];

  const renderMedia = (item: (typeof mediaItems)[0], index: number) => {
    const pos = positions[index];
    if (!pos) return null;

    const positionStyle: React.CSSProperties = {
      position: 'absolute',
      top: pos.top,
      bottom: pos.bottom,
      left: pos.left,
      right: pos.right,
      transform: `rotate(${pos.rotate}deg) scale(${isVisible ? 1 : 0.8})`,
      transition: `all 0.8s ease-out ${pos.delay}ms`,
      opacity: isVisible ? 1 : 0,
    };

    return (
      <div
        key={index}
        style={positionStyle}
        className="group z-20 hidden md:block"
      >
        <div className="border-border/30 bg-background/80 hover:border-primary/50 relative h-24 w-32 overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl lg:h-28 lg:w-40">
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
              alt={item.alt || `Media ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 0vw, 160px"
              loading="lazy"
            />
          )}
          {/* 悬停时的光晕效果 */}
          <div className="from-primary/20 absolute inset-0 rounded-xl bg-gradient-to-tr to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      {mediaItems.slice(0, 6).map((item, index) => renderMedia(item, index))}
    </div>
  );
}

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

// 粒子背景组件
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
        ctx.fillStyle = `rgba(34, 197, 94, ${particle.opacity})`;
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
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.1 * (1 - distance / 150)})`;
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

  return (
    <section
      id={section.id}
      className={cn(
        `relative overflow-hidden pt-24 pb-32 md:pt-36 md:pb-48`,
        section.className,
        className
      )}
    >
      {/* 粒子背景 */}
      <ParticleBackground />

      {/* 弧线布局媒体画廊 */}
      <ArcMediaGallery media={section.media} />

      {/* 渐变背景光晕 */}
      {/* <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-green-500/20 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div> */}
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
            <h1 className="animate-text-gradient text-4xl font-bold text-balance sm:mt-12 sm:text-6xl lg:text-7xl">
              <span className="text-gradient-hero">{texts[0]}</span>
              <Highlighter action="underline" color="#22C55E">
                {highlightText}
              </Highlighter>
              <span className="text-gradient-hero">{texts[1]}</span>
            </h1>
          ) : (
            <h1 className="animate-text-gradient text-4xl font-bold text-balance sm:mt-12 sm:text-6xl lg:text-7xl">
              <span className="text-gradient-hero">{section.title}</span>
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
                    'btn-glow px-6 text-base font-medium transition-all duration-300',
                    button.variant === 'default' || !button.variant
                      ? 'animate-glow bg-gradient-primary hover:scale-105 hover:shadow-xl'
                      : 'border-primary/50 hover:border-primary hover:bg-primary/10'
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
          <SocialAvatars tip={section.avatars_tip || ''} />
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
    </section>
  );
}
