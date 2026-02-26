import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';

interface CartPageProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export default function CartPage({ onCheckout, onContinueShopping }: CartPageProps) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  const formatPrice = (price: bigint) => {
    try {
      return `€${(Number(price) / 100).toFixed(2)}`;
    } catch {
      return '€—';
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <ShoppingCart className="w-16 h-16 text-muted-foreground opacity-30" />
        <h2 className="font-display text-2xl text-foreground tracking-wide">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm">Add some products to get started.</p>
        <Button onClick={onContinueShopping} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onContinueShopping}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-display text-2xl text-foreground tracking-wide">Shopping Cart</h2>
        <span className="text-muted-foreground text-sm">({items.length} item{items.length !== 1 ? 's' : ''})</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const subtotal = item.product.price * BigInt(item.quantity);
            return (
              <div
                key={String(item.product.id)}
                className="flex gap-4 p-4 rounded-lg border border-border bg-card"
              >
                {item.product.imageUrl && (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{item.product.category}</p>
                  <p className="text-primary font-bold text-sm mt-1">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-7 h-7"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-7 h-7"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-destructive hover:text-destructive"
                    onClick={() => removeItem(item.product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <p className="text-sm font-bold text-foreground">{formatPrice(subtotal)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-card p-5 sticky top-24">
            <h3 className="font-display text-lg text-foreground mb-4 tracking-wide">Order Summary</h3>
            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div key={String(item.product.id)} className="flex justify-between text-muted-foreground">
                  <span className="truncate mr-2">{item.product.name} ×{item.quantity}</span>
                  <span className="shrink-0">{formatPrice(item.product.price * BigInt(item.quantity))}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <Button className="w-full mt-4" onClick={onCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
