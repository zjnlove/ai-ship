'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { Link, usePathname } from '@/core/i18n/navigation';
import {
  BrandLogo,
  LocaleSelector,
  SignUser,
  SmartIcon,
  ThemeToggler,
} from '@/shared/blocks/common';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/shared/components/ui/navigation-menu';
import { useMedia } from '@/shared/hooks/use-media';
import { cn } from '@/shared/lib/utils';
import { NavItem } from '@/shared/types/blocks/common';
import { Header as HeaderType } from '@/shared/types/blocks/landing';

export function Header({ header }: { header: HeaderType }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isScrolledRef = useRef(false);
  const scrollRafRef = useRef<number | null>(null);
  const isLarge = useMedia('(min-width: 64rem)');
  const pathname = usePathname();

  useEffect(() => {
    // Set mounted state to trigger entrance animation
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Listen to scroll event to enable header styles on scroll
    const handleScroll = () => {
      // Coalesce high-frequency scroll events & only update state when value changes.
      if (scrollRafRef.current != null) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        const next = window.scrollY > 50;
        if (next === isScrolledRef.current) return;
        isScrolledRef.current = next;
        setIsScrolled(next);
      });
    };

    // Initialize once on mount.
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current != null) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  // Navigation menu for large screens using NavigationMenu
  const NavMenu = () => {
    return (
      <NavigationMenu className="hidden lg:flex" viewport={false}>
        <NavigationMenuList>
          {header.nav?.items?.map((item, idx) => {
            // Simple link without children
            if (!item.children || item.children.length === 0) {
              return (
                <NavigationMenuItem key={idx}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.url || ''}
                      target={item.target || '_self'}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'relative',
                        (item.is_active ||
                          pathname.endsWith(item.url as string)) &&
                          'bg-muted/40 text-muted-foreground'
                      )}
                    >
                      {item.icon && <SmartIcon name={item.icon as string} />}
                      {item.title}
                      {item.tip && (
                        <span
                          className={`${item.tip_color || 'bg-primary'} absolute -top-3 -right-0 rounded-full px-2 py-0.5 text-[12px] leading-none font-medium text-white`}
                        >
                          {item.tip}
                        </span>
                      )}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            }

            // Link with children - use NavigationMenu
            return (
              <NavigationMenuItem key={idx}>
                <NavigationMenuTrigger className="group relative [&_svg]:!transition-transform [&_svg]:!duration-200 [&>svg:last-child]:group-data-[state=open]:rotate-180">
                  {item.icon && (
                    <SmartIcon name={item.icon as string} className="h-4 w-4" />
                  )}
                  {item.title}
                  {item.tip && (
                    <span
                      className={`${item.tip_color || 'bg-primary'} absolute -top-3 -right-0 rounded-full px-2 py-0.5 text-[12px] leading-none font-medium text-white`}
                    >
                      {item.tip}
                    </span>
                  )}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul
                    className="grid gap-3 p-2"
                    style={{
                      gridTemplateColumns: `repeat(${Math.ceil(item.children.length / 6)}, minmax(0, 1fr))`,
                      width: `${Math.ceil(item.children.length / 6) * 230}px`,
                    }}
                  >
                    {' '}
                    {item.children?.map((subItem: NavItem, index: number) => (
                      <li key={index}>
                        {subItem.children && subItem.children.length > 0 ? (
                          <div className="space-y-1">
                            <Link
                              href={subItem.url || ''}
                              target={subItem.target || '_self'}
                              className="hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md p-3 transition-colors"
                            >
                              {subItem.icon && (
                                <div className="bg-background ring-foreground/10 relative flex size-9 items-center justify-center rounded border border-transparent shadow-sm ring-1">
                                  <SmartIcon name={subItem.icon as string} />
                                </div>
                              )}
                              <div className="space-y-1">
                                <div className="text-sm leading-none font-medium">
                                  {subItem.title}
                                  {subItem.tip && (
                                    <span
                                      className={`${subItem.tip_color || 'bg-primary'} ml-2 rounded-full px-2 py-0.5 text-[10px] leading-none font-medium text-white`}
                                    >
                                      {subItem.tip}
                                    </span>
                                  )}
                                </div>
                                {subItem.description && (
                                  <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                    {subItem.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                            <ul className="ml-4 space-y-1 border-l pl-3">
                              {subItem.children.map(
                                (thirdItem: NavItem, thirdIndex: number) => (
                                  <li key={thirdIndex}>
                                    <Link
                                      href={thirdItem.url || ''}
                                      target={thirdItem.target || '_self'}
                                      className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md p-2 text-sm transition-colors"
                                    >
                                      {thirdItem.icon && (
                                        <SmartIcon
                                          name={thirdItem.icon as string}
                                          className="h-4 w-4"
                                        />
                                      )}
                                      <span>{thirdItem.title}</span>
                                    </Link>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        ) : (
                          <NavigationMenuLink asChild>
                            <Link
                              href={subItem.url || ''}
                              target={subItem.target || '_self'}
                              className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                            >
                              <div className="flex items-center gap-3">
                                {subItem.icon && (
                                  // <div className="bg-background ring-foreground/10 relative flex size-9 items-center justify-center rounded border border-transparent shadow-sm ring-1">
                                  <SmartIcon name={subItem.icon as string} />
                                  // </div>
                                )}
                                <div className="space-y-1">
                                  <div className="text-sm leading-none font-medium">
                                    {subItem.title}
                                    {subItem.tip && (
                                      <span
                                        className={`${subItem.tip_color || 'bg-primary'} ml-2 rounded-full px-2 py-0.5 text-[10px] leading-none font-medium text-white`}
                                      >
                                        {subItem.tip}
                                      </span>
                                    )}
                                  </div>
                                  {subItem.description && (
                                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                                      {subItem.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        )}
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  // Mobile menu using Accordion, shown on small screens
  const MobileMenu = ({ closeMenu }: { closeMenu: () => void }) => {
    return (
      <nav
        role="navigation"
        className="bg-background/95 w-full backdrop-blur [--color-border:--alpha(var(--color-foreground)/5%)] [--color-muted:--alpha(var(--color-foreground)/5%)]"
      >
        <Accordion
          type="single"
          collapsible
          className="mt-0.5 space-y-0.5 **:hover:no-underline"
        >
          {header.nav?.items?.map((item, idx) => {
            return (
              <AccordionItem
                key={idx}
                value={item.title || ''}
                className="group relative border-b-0 before:pointer-events-none before:absolute before:inset-x-4 before:bottom-0 before:border-b"
              >
                {item.children && item.children.length > 0 ? (
                  <>
                    <AccordionTrigger className="data-[state=open]:bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-between px-4 py-3 text-lg transition-colors **:!font-normal">
                      <div className="flex items-center gap-2">
                        {item.title}
                        {item.tip && (
                          <span
                            className={`${item.tip_color || 'bg-primary'} rounded px-1.5 py-0.5 text-[10px] leading-none font-medium text-white`}
                          >
                            {item.tip}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                      <ul>
                        {item.children?.map((subItem: NavItem, iidx) => (
                          <li key={iidx}>
                            {subItem.children && subItem.children.length > 0 ? (
                              <div>
                                <div className="flex items-center">
                                  <Link
                                    href={subItem.url || ''}
                                    onClick={closeMenu}
                                    className="hover:bg-primary/10 hover:text-primary flex flex-1 items-center gap-2.5 px-4 py-2 transition-colors"
                                  >
                                    {subItem.icon && (
                                      <div
                                        aria-hidden
                                        className="flex items-center justify-center *:size-4"
                                      >
                                        <SmartIcon
                                          name={subItem.icon as string}
                                        />
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 text-base">
                                      {subItem.title}
                                      {subItem.tip && (
                                        <span
                                          className={`${subItem.tip_color || 'bg-primary'} rounded px-1.5 py-0.5 text-[10px] leading-none font-medium text-white`}
                                        >
                                          {subItem.tip}
                                        </span>
                                      )}
                                    </div>
                                  </Link>
                                  <Accordion type="single" collapsible>
                                    <AccordionItem
                                      value={subItem.title || ''}
                                      className="border-b-0"
                                    >
                                      <AccordionTrigger className="hover:bg-primary/10 hover:text-primary justify-center px-4 py-2 transition-colors **:!font-normal" />
                                      <AccordionContent>
                                        <ul className="ml-4 space-y-1">
                                          {subItem.children.map(
                                            (
                                              thirdItem: NavItem,
                                              thirdIdx: number
                                            ) => (
                                              <li key={thirdIdx}>
                                                <Link
                                                  href={thirdItem.url || ''}
                                                  onClick={closeMenu}
                                                  className="hover:bg-primary/10 hover:text-primary flex items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                                                >
                                                  {thirdItem.icon && (
                                                    <div
                                                      aria-hidden
                                                      className="flex items-center justify-center *:size-4"
                                                    >
                                                      <SmartIcon
                                                        name={
                                                          thirdItem.icon as string
                                                        }
                                                      />
                                                    </div>
                                                  )}
                                                  <span>{thirdItem.title}</span>
                                                </Link>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                </div>
                              </div>
                            ) : (
                              <Link
                                href={subItem.url || ''}
                                onClick={closeMenu}
                                className="hover:bg-primary/10 hover:text-primary grid grid-cols-[auto_1fr] items-center gap-2.5 px-4 py-2 transition-colors"
                              >
                                {subItem.icon && (
                                  // <div
                                  //   aria-hidden
                                  //   className="flex items-center justify-center *:size-4"
                                  // >
                                  <SmartIcon name={subItem.icon as string} />
                                  // </div>
                                )}
                                <div className="flex items-center gap-2 text-base">
                                  {subItem.title}
                                  {subItem.tip && (
                                    <span
                                      className={`${subItem.tip_color || 'bg-primary'} rounded px-1.5 py-0.5 text-[10px] leading-none font-medium text-white`}
                                    >
                                      {subItem.tip}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </>
                ) : (
                  <Link
                    href={item.url || ''}
                    onClick={closeMenu}
                    className="data-[state=open]:bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-between px-4 py-3 text-lg transition-colors **:!font-normal"
                  >
                    <div className="flex items-center gap-2">
                      {item.title}
                      {item.tip && (
                        <span
                          className={`${item.tip_color || 'bg-primary'} rounded px-1.5 py-0.5 text-[10px] leading-none font-medium text-white`}
                        >
                          {item.tip}
                        </span>
                      )}
                    </div>
                  </Link>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Mobile menu footer: theme toggler, locale selector, sign */}
        <div className="flex items-center justify-center gap-4 border-t px-4 py-4">
          {header.show_theme ? <ThemeToggler /> : null}
          {header.show_locale ? <LocaleSelector /> : null}
          {header.show_sign ? <SignUser userNav={header.user_nav} /> : null}
        </div>
      </nav>
    );
  };

  return (
    <>
      <header
        data-state={isMobileMenuOpen ? 'active' : 'inactive'}
        {...(isScrolled && { 'data-scrolled': true })}
        className={cn(
          'fixed inset-x-0 top-0 z-50',
          isMounted
            ? 'animate-in slide-in-from-top-full fade-in-0 duration-500'
            : 'opacity-0'
        )}
      >
        <div
          className={cn(
            'border-foreground/10 absolute inset-x-0 top-0 z-50 h-18 ring-1 ring-transparent transition-all duration-300',
            'in-data-scrolled:border-foreground/5 in-data-scrolled:bg-background/75 in-data-scrolled:backdrop-blur',
            'max-lg:in-data-[state=active]:bg-background/75 max-lg:min-h-14 max-lg:in-data-[state=active]:backdrop-blur'
          )}
        >
          <div className="container">
            <div className="relative flex items-center justify-between pt-5">
              {/* Brand Logo */}
              <div
                className={cn(
                  'flex-shrink-0',
                  isMounted
                    ? 'animate-in slide-in-from-left-4 fade-in-0 delay-100 duration-500'
                    : 'opacity-0'
                )}
              >
                {header.brand && <BrandLogo brand={header.brand} />}
              </div>

              {/* Desktop Navigation Menu - Centered */}
              {isLarge && (
                <div
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2',
                    isMounted
                      ? 'animate-in slide-in-from-top-4 fade-in-0 delay-200 duration-500'
                      : 'opacity-0'
                  )}
                >
                  <NavMenu />
                </div>
              )}

              {/* Header right section: theme toggler, locale selector, sign, buttons */}
              <div
                className={cn(
                  'hidden items-center gap-4 lg:flex',
                  isMounted
                    ? 'animate-in slide-in-from-right-4 fade-in-0 delay-300 duration-500'
                    : 'opacity-0'
                )}
              >
                {header.buttons &&
                  header.buttons.map((button, idx) => (
                    <Link
                      key={idx}
                      href={button.url || ''}
                      target={button.target || '_self'}
                      className={cn(
                        'focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
                        'h-7 px-3 ring-0',
                        button.variant === 'outline'
                          ? 'bg-background border-primary ring-foreground/10 hover:bg-muted/50 dark:ring-foreground/15 dark:hover:bg-muted/50 border border-transparent shadow-sm ring-1 shadow-black/15 duration-200'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 border-[0.5px] border-white/25 shadow-md ring-1 shadow-black/20 ring-(--ring-color) [--ring-color:color-mix(in_oklab,var(--color-foreground)15%,var(--color-primary))]'
                      )}
                    >
                      {button.icon && (
                        <SmartIcon
                          name={button.icon as string}
                          className="size-4"
                        />
                      )}
                      <span>{button.title}</span>
                    </Link>
                  ))}

                {header.show_theme ? <ThemeToggler /> : null}
                {header.show_locale ? <LocaleSelector /> : null}
                {header.show_sign ? (
                  <SignUser userNav={header.user_nav} />
                ) : null}
              </div>

              {/* Hamburger menu button for mobile navigation */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={
                  isMobileMenuOpen == true ? 'Close Menu' : 'Open Menu'
                }
                className="relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="m-auto size-5 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
                <X className="absolute inset-0 m-auto size-5 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
              </button>
            </div>
          </div>
        </div>

        {/* Show mobile menu if needed */}
        {!isLarge && isMobileMenuOpen && (
          <div className="animate-in slide-in-from-top-2 fade-in-0 fixed inset-0 top-14 z-50 duration-300">
            <div className="bg-background/95 h-full backdrop-blur">
              <MobileMenu closeMenu={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
