import { useCart } from '../context/CartContext';
import type { Product } from '../backend';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  let priceDisplay = '—';
  try {
    priceDisplay = `€${(Number(product.price) / 100).toFixed(2)}`;
  } catch {
    // fallback already set
  }

  return (
    <div className="group rounded-lg border border-border bg-card flex flex-col overflow-hidden hover:border-primary/50 hover:shadow-glow transition-all duration-200">
      {/* Image */}
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name ?? 'Product'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
        {product.category && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-semibold bg-primary/80 text-primary-foreground capitalize">
            {product.category}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
          {product.name ?? 'Unnamed Product'}
        </h3>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="font-display text-primary text-base font-bold">{priceDisplay}</span>
          <Button
            size="sm"
            onClick={() => {
              try {
                addItem(product);
              } catch (err) {
                console.error('Failed to add item to cart:', err);
              }
            }}
            className="flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
