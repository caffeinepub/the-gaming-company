import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './context/CartContext';
import { useCart } from './context/CartContext';
import StorePage from './pages/StorePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import ErrorBoundary from './components/ErrorBoundary';
import {
  Gamepad2,
  ShoppingCart,
  Sword,
  Trophy,
  Cpu,
  Wrench,
  Settings,
  Heart,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

type View = 'store' | 'cart' | 'checkout' | 'admin';
type Category = 'games' | 'controllers' | 'consoles' | 'accessories' | 'sponsors';

const NAV_ITEMS: { label: string; category: Category; icon: React.ReactNode }[] = [
  { label: 'Games', category: 'games', icon: <Sword className="w-5 h-5" /> },
  { label: 'Controllers', category: 'controllers', icon: <Gamepad2 className="w-5 h-5" /> },
  { label: 'Consoles', category: 'consoles', icon: <Cpu className="w-5 h-5" /> },
  { label: 'Accessories', category: 'accessories', icon: <Wrench className="w-5 h-5" /> },
  { label: 'Sponsors', category: 'sponsors', icon: <Trophy className="w-5 h-5" /> },
];

function AppShell() {
  const [view, setView] = useState<View>('store');
  const [category, setCategory] = useState<Category>('games');
  const { totalItems } = useCart();

  const handleNavClick = (cat: Category) => {
    setCategory(cat);
    setView('store');
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border shadow-glow-sm">
          <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
            <button
              onClick={() => { setView('store'); setCategory('games'); }}
              className="flex items-center gap-3 group"
            >
              <img
                src="/assets/generated/brand-logo.dim_256x256.png"
                alt="The Gaming Company Logo"
                className="w-10 h-10 rounded object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="font-gaming text-lg text-primary tracking-widest uppercase group-hover:glow-red-text transition-all">
                The Gaming Company™
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('cart')}
                className="relative flex items-center gap-2 px-4 py-2 rounded border border-border hover:border-primary hover:text-primary transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-20 shrink-0 border-r border-border bg-card/50 py-6 px-2 items-center">
            {/* Nav items */}
            <nav className="flex flex-col gap-1 w-full items-center">
              {NAV_ITEMS.map((item) => {
                const isActive = view === 'store' && category === item.category;
                return (
                  <Tooltip key={item.category}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleNavClick(item.category)}
                        className={`flex flex-col items-center justify-center gap-1 w-full py-3 px-1 rounded text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/30 shadow-glow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent'
                        }`}
                      >
                        {item.icon}
                        <span className="text-[10px] leading-tight">{item.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>

            {/* Admin gear at bottom */}
            <div className="mt-auto pt-4 border-t border-border w-full flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setView('admin')}
                    className={`flex flex-col items-center justify-center gap-1 w-full py-3 px-1 rounded text-xs font-medium transition-all ${
                      view === 'admin'
                        ? 'bg-primary/10 text-primary border border-primary/30 shadow-glow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-[10px] leading-tight">Admin</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Admin Panel</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 pb-16 md:pb-0">
            <ErrorBoundary>
              {view === 'store' && (
                <StorePage
                  category={category}
                  onCategoryChange={(cat) => setCategory(cat as Category)}
                />
              )}
              {view === 'cart' && (
                <CartPage
                  onCheckout={() => setView('checkout')}
                  onContinueShopping={() => setView('store')}
                />
              )}
              {view === 'checkout' && (
                <CheckoutPage
                  onBack={() => setView('cart')}
                  onSuccess={() => setView('store')}
                />
              )}
              {view === 'admin' && <AdminPage />}
            </ErrorBoundary>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex items-center justify-around px-1 py-1">
          {NAV_ITEMS.map((item) => {
            const isActive = view === 'store' && category === item.category;
            return (
              <button
                key={item.category}
                onClick={() => handleNavClick(item.category)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 rounded text-[10px] font-medium transition-all ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className={isActive ? 'text-primary' : ''}>{item.icon}</span>
                <span className="leading-tight">{item.label}</span>
              </button>
            );
          })}
          {/* Admin button in mobile nav */}
          <button
            onClick={() => setView('admin')}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 rounded text-[10px] font-medium transition-all ${
              view === 'admin'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="leading-tight">Admin</span>
          </button>
        </nav>

        {/* Footer */}
        <footer className="hidden md:block border-t border-border bg-card/50 py-4 px-6 text-center text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} The Gaming Company™. Built with{' '}
            <Heart className="inline w-3 h-3 text-primary fill-primary" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'the-gaming-company')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </footer>
      </div>
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
