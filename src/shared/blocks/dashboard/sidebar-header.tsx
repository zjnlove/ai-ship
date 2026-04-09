import { Link } from '@/core/i18n/navigation';
import { LazyImage } from '@/shared/blocks/common';
import { Badge } from '@/shared/components/ui/badge';
import {
  SidebarHeader as SidebarHeaderComponent,
  SidebarTrigger,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import { SidebarHeader as SidebarHeaderType } from '@/shared/types/blocks/dashboard';

export function SidebarHeader({ header }: { header: SidebarHeaderType }) {
  const { open } = useSidebar();
  return (
    <SidebarHeaderComponent className="mb-0 py-2">
      <div className="flex h-full items-center justify-center">
        {header.brand && (
          <Link
            href={header.brand.url || ''}
            className="flex items-center gap-3"
          >
            {header.brand.logo && (
              <img
                src={header.brand.logo.src}
                alt={header.brand.logo.alt || ''}
                className="h-auto w-14 shrink-0 rounded-md"
              />
            )}
            <div className="relative text-lg font-semibold">
              {header.brand.title}
              {header.version && (
                <Badge
                  variant="secondary"
                  className="absolute -top-0 -right-16 scale-100 px-1 py-0"
                >
                  v{header.version}
                </Badge>
              )}
            </div>
          </Link>
        )}
      </div>
    </SidebarHeaderComponent>
  );
}
