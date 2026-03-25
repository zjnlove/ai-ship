'use client';

import { useEffect, useRef, useState } from 'react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

// 简单渐进式入场动画组件
function FadeInBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
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
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
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
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
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
        ctx.fillStyle = `rgba(108, 92, 231, ${particle.opacity})`;
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
            ctx.strokeStyle = `rgba(108, 92, 231, ${0.1 * (1 - distance / 150)})`;
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

export function Cta({
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
        'relative overflow-hidden py-24 md:py-32',
        section.className,
        className
      )}
    >
      {/* 背景设计 - 上半部分透明，下半部分有背景色 */}
      <div className="absolute inset-0 z-0">
        {/* 上半部分：透明 */}
        <div className="absolute top-0 right-0 left-0 h-1/2 bg-transparent" />
        {/* 下半部分：紫色渐变背景 */}
        <div className="absolute right-0 bottom-0 left-0 h-1/2 bg-gradient-to-b from-purple-900/30 via-purple-800/40 to-purple-900/50" />
      </div>

      {/* 粒子背景 */}
      <ParticleBackground />

      {/* 与 Hero 一致的三色光晕 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 container">
        <div className="mx-auto max-w-4xl">
          {/* 简单渐进式入场的矩形边框容器 */}
          <FadeInBox>
            <div className="relative rounded-3xl border border-white/20 bg-white/5 p-12 backdrop-blur-sm md:p-16">
              {/* 内容 - 跟随渐进入场 */}
              <FadeInBox className="delay-200">
                <div className="text-center">
                  <h2 className="animate-text-gradient mb-6 text-4xl font-bold text-balance lg:text-5xl xl:text-6xl">
                    <span className="text-gradient-hero">{section.title}</span>
                  </h2>

                  <p
                    className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg md:text-xl"
                    dangerouslySetInnerHTML={{
                      __html: section.description ?? '',
                    }}
                  />

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {section.buttons?.map((button, idx) => (
                      <Button
                        asChild
                        size="lg"
                        variant={button.variant || 'default'}
                        className={cn(
                          'btn-glow px-8 py-6 text-lg font-semibold transition-all duration-300',
                          button.variant === 'default' || !button.variant
                            ? 'animate-glow bg-gradient-primary hover:scale-105 hover:shadow-2xl'
                            : 'border-2 border-white/30 hover:border-white/50 hover:bg-white/10'
                        )}
                        key={idx}
                      >
                        <Link
                          href={button.url || ''}
                          target={button.target || '_self'}
                        >
                          {button.icon && (
                            <SmartIcon
                              name={button.icon as string}
                              className="mr-2 size-5"
                            />
                          )}
                          <span>{button.title}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </FadeInBox>
            </div>
          </FadeInBox>
        </div>
      </div>
    </section>
  );
}
