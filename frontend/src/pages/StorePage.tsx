import { useAllProducts, useAllSponsors, BACKEND_TO_FRONTEND_CATEGORY } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';
import SponsorCard from '../components/SponsorCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Sword, Gamepad2, Cpu, Wrench, Trophy } from 'lucide-react';
import type { Product } from '../backend';

interface StorePageProps {
  category: string;
  onCategoryChange: (category: string) => void;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  games: {
    label: 'Games',
    icon: <Sword className="w-5 h-5" />,
    description: 'Latest titles across all platforms',
  },
  controllers: {
    label: 'Controllers',
    icon: <Gamepad2 className="w-5 h-5" />,
    description: 'Pro-grade controllers for every playstyle',
  },
  consoles: {
    label: 'Consoles',
    icon: <Cpu className="w-5 h-5" />,
    description: 'Next-gen and classic gaming consoles',
  },
  accessories: {
    label: 'Accessories',
    icon: <Wrench className="w-5 h-5" />,
    description: 'Headsets, stands, cables and more',
  },
  sponsors: {
    label: 'Sponsors',
    icon: <Trophy className="w-5 h-5" />,
    description: 'Our official partners and sponsors',
  },
};

function ProductSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
      <Skeleton className="w-full h-48 rounded" />
      <Skeleton className="w-1/3 h-4 rounded" />
      <Skeleton className="w-2/3 h-5 rounded" />
      <Skeleton className="w-full h-4 rounded" />
      <Skeleton className="w-1/4 h-6 rounded" />
      <Skeleton className="w-full h-9 rounded" />
    </div>
  );
}

export default function StorePage({ category, onCategoryChange }: StorePageProps) {
  const isSponsors = category === 'sponsors';

  // Fetch all products and filter client-side by frontend category
  const {
    data: allProducts = [],
    isLoading: productsLoading,
    isError: productsError,
  } = useAllProducts();

  const {
    data: sponsors = [],
    isLoading: sponsorsLoading,
    isError: sponsorsError,
  } = useAllSponsors();

  // Filter products by the current frontend category using the backend→frontend mapping
  const products: Product[] = isSponsors
    ? []
    : allProducts.filter((p) => {
        const frontendCat = BACKEND_TO_FRONTEND_CATEGORY[p.category as unknown as string] ?? 'games';
        return frontendCat === category;
      });

  const meta = CATEGORY_META[category] ?? CATEGORY_META['games'];
  const isLoading = isSponsors ? sponsorsLoading : productsLoading;
  const isError = isSponsors ? sponsorsError : productsError;

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ maxHeight: 300 }}>
        <img
          src="/assets/generated/store-hero-banner.dim_1200x300.png"
          alt="The Gaming Company Banner"
          className="w-full object-cover"
          style={{ maxHeight: 300 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent flex items-center px-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-primary tracking-widest uppercase">
              The Gaming Company™
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Your ultimate gaming destination
            </p>
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="px-6 pt-6 pb-2 flex items-center gap-3 border-b border-border">
        <span className="text-primary">{meta.icon}</span>
        <div>
          <h2 className="font-display text-lg text-foreground tracking-wide">{meta.label}</h2>
          <p className="text-xs text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      {/* Mobile category tabs */}
      <div className="flex md:hidden gap-2 px-4 py-3 overflow-x-auto border-b border-border">
        {Object.entries(CATEGORY_META).map(([cat, m]) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-muted-foreground border border-border hover:text-foreground'
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {isError && (
          <div className="text-center py-12 text-destructive">
            <p className="text-lg font-semibold">Failed to load {meta.label.toLowerCase()}</p>
            <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
          </div>
        )}

        {isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading && !isError && isSponsors && (
          <>
            {sponsors.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-semibold">No sponsors yet</p>
                <p className="text-sm mt-1">Check back soon for our official partners.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsors.map((sponsor) => (
                  <SponsorCard key={String(sponsor.id)} sponsor={sponsor} />
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && !isError && !isSponsors && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-semibold">No {meta.label.toLowerCase()} yet</p>
                <p className="text-sm mt-1">Products will appear here once added by an admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={String(product.id)} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
