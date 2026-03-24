'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Globe, Languages } from 'lucide-react';
import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/core/i18n/navigation';
import { localeNames } from '@/config/locale';
import { Button } from '@/shared/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/shared/components/ui/hover-card';
import { cacheSet } from '@/shared/lib/cache';

export function LocaleSelector({
  type = 'icon',
}: {
  type?: 'icon' | 'button';
}) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSwitchLanguage = (value: string) => {
    if (value !== currentLocale) {
      // Update localStorage to sync with locale detector
      cacheSet('locale', value);
      const query = searchParams?.toString?.() ?? '';
      const href = query ? `${pathname}?${query}` : pathname;
      router.push(href, {
        locale: value,
      });
    }
  };

  // Return a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant={type === 'icon' ? 'ghost' : 'outline'}
        size={type === 'icon' ? 'icon' : 'sm'}
        className={
          type === 'icon' ? 'h-auto w-auto p-0' : 'hover:bg-primary/10'
        }
        disabled
      >
        {type === 'icon' ? (
          <Globe className="size-6" />
        ) : (
          <>
            <Globe size={16} />
            {localeNames[currentLocale]}
          </>
        )}
      </Button>
    );
  }

  return (
    <HoverCard openDelay={0} closeDelay={100}>
      <HoverCardTrigger asChild>
        {type === 'icon' ? (
          <Button
            variant="ghost"
            size="icon"
            className="mr-[-8px] h-auto w-auto p-0"
          >
            <Globe className="size-6" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="hover:bg-primary/10">
            <Globe size={16} />
            {localeNames[currentLocale]}
          </Button>
        )}
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-1" align="end">
        <div className="flex flex-col">
          {Object.keys(localeNames).map((locale) => (
            <button
              key={locale}
              onClick={() => handleSwitchLanguage(locale)}
              className="hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm"
            >
              <span>{localeNames[locale]}</span>
              {locale === currentLocale && (
                <Check size={16} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
