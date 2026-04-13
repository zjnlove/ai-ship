import { Link } from '@/core/i18n/navigation';
import {
  BrandLogo,
  BuiltWith,
  Copyright,
  LocaleSelector,
  ThemeToggler,
} from '@/shared/blocks/common';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { cn } from '@/shared/lib/utils';
import { NavItem } from '@/shared/types/blocks/common';
import { Footer as FooterType } from '@/shared/types/blocks/landing';

export function Footer({ footer }: { footer: FooterType }) {
  return (
    <footer
      id={footer.id}
      className={cn(
        'relative overflow-hidden py-12 sm:py-16',
        footer.className
      )}
    >
      {/* 星空背景效果 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* 渐变背景 */}
        <div className="from-primary/20 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

        {/* 星星装饰 */}
        <div className="animate-sparkle absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-white" />
        <div
          className="animate-sparkle absolute top-1/3 left-1/3 h-1 w-1 rounded-full bg-white"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="animate-sparkle absolute top-1/4 right-1/4 h-2 w-2 rounded-full bg-white"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="animate-sparkle absolute top-1/3 right-1/3 h-1 w-1 rounded-full bg-white"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="animate-sparkle absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full bg-white"
          style={{ animationDelay: '2s' }}
        />
      </div>
      <div className="container space-y-8 overflow-x-hidden">
        <div className="grid min-w-0 gap-12 md:grid-cols-5">
          <div className="min-w-0 space-y-4 break-words md:col-span-2 md:space-y-6">
            {footer.brand ? <BrandLogo brand={footer.brand} /> : null}

            {footer.brand?.description ? (
              <p
                className="text-muted-foreground text-sm text-balance break-words"
                dangerouslySetInnerHTML={{ __html: footer.brand.description }}
              />
            ) : null}
          </div>

          <div className="col-span-3 grid min-w-0 gap-6 sm:grid-cols-3">
            {footer.nav?.items.map((item, idx) => (
              <div key={idx} className="min-w-0 space-y-4 text-sm break-words">
                <span className="block font-medium break-words">
                  {item.title}
                </span>

                <div className="flex min-w-0 flex-wrap gap-4 sm:flex-col">
                  {item.children?.map((subItem, iidx) => (
                    <Link
                      key={iidx}
                      href={subItem.url || ''}
                      target={subItem.target || ''}
                      className="text-muted-foreground hover:text-primary block break-words duration-150"
                    >
                      <span className="break-words">{subItem.title || ''}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-4 sm:gap-8">
          {footer.show_built_with !== false ? <BuiltWith /> : null}
          <div className="min-w-0 flex-1" />
          {footer.show_theme !== false ? <ThemeToggler type="toggle" /> : null}
          {footer.show_locale !== false ? (
            <LocaleSelector type="button" />
          ) : null}
        </div>

        <div
          aria-hidden
          className="h-px min-w-0 [background-image:linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] bg-[length:6px_1px] bg-repeat-x opacity-25"
        />
        <div className="flex min-w-0 flex-wrap justify-between gap-8">
          {footer.copyright ? (
            <p
              className="text-muted-foreground text-sm text-balance break-words"
              dangerouslySetInnerHTML={{ __html: footer.copyright }}
            />
          ) : footer.brand ? (
            <Copyright brand={footer.brand} />
          ) : null}

          <div className="min-w-0 flex-1"></div>

          {footer.agreement ? (
            <div className="flex min-w-0 flex-wrap items-center gap-4">
              {footer.agreement?.items.map((item: NavItem, index: number) => (
                <Link
                  key={index}
                  href={item.url || ''}
                  target={item.target || ''}
                  className="text-muted-foreground hover:text-primary block text-xs break-words underline duration-150"
                >
                  {item.title || ''}
                </Link>
              ))}
            </div>
          ) : null}

          {footer.social ? (
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              {footer.social?.items.map((item: NavItem, index) => (
                <Link
                  key={index}
                  href={item.url || ''}
                  target={item.target || ''}
                  className="group text-muted-foreground hover:text-primary glass hover:border-primary/30 block cursor-pointer rounded-full p-2.5 transition-all duration-300 hover:scale-110"
                  aria-label={item.title || 'Social media link'}
                >
                  {item.icon && (
                    <SmartIcon
                      name={item.icon as string}
                      size={18}
                      className="transition-transform group-hover:rotate-12"
                    />
                  )}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
