'use client';

import { useEffect, useRef, useState } from 'react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { Highlighter } from '@/shared/components/ui/highlighter';
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

export function Cta({
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
        'relative overflow-hidden py-16 md:py-20',
        section.className,
        className
      )}
    >
      {/* 粒子背景 */}
      <ParticleBackground />

      <div className="relative z-10 container">
        <div className="mx-auto max-w-4xl">
          <FadeInBox>
            <div className="py-8 md:py-10">
              <div className="text-center">
                <h2 className="animate-text-gradient mb-6 text-4xl font-bold text-balance lg:text-5xl xl:text-6xl">
                  {texts && texts.length > 0 ? (
                    <>
                      <span className="text-gradient-hero">{texts[0]}</span>
                      <Highlighter action="underline" color="#22C55E">
                        {highlightText}
                      </Highlighter>
                      <span className="text-gradient-hero">{texts[1]}</span>
                    </>
                  ) : (
                    <span className="text-gradient-hero">{section.title}</span>
                  )}
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
                        'rounded-lg px-8 py-6 text-lg font-semibold transition-all duration-300',
                        button.variant === 'default' || !button.variant
                          ? 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]'
                          : 'border-primary text-primary hover:bg-primary border-2 bg-transparent hover:text-white'
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
            </div>
          </FadeInBox>
        </div>
      </div>
    </section>
  );
}
