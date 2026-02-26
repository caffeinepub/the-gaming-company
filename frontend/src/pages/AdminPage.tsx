import { useState } from 'react';
import {
  useAllProducts,
  useAllSponsors,
  useAddProduct,
  useEditProduct,
  useDeleteProduct,
  useAddSponsor,
  useEditSponsor,
  useDeleteSponsor,
  useOrders,
  BACKEND_TO_FRONTEND_CATEGORY,
} from '../hooks/useQueries';
import type { Product, Sponsor, BackendOrder } from '../backend';
import ProductForm from '../components/ProductForm';
import SponsorForm from '../components/SponsorForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Pencil,
  Trash2,
  Plus,
  Lock,
  Loader2,
  AlertCircle,
  ShoppingBag,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  PackageOpen,
} from 'lucide-react';

// ─── Password Gate ────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = '6280';

function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminUnlocked', 'true');
      onUnlock();
    } else {
      setError('Incorrect password');
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div
        className={`bg-card border border-border rounded-lg p-8 w-full max-w-sm text-center ${shake ? 'animate-shake' : ''}`}
      >
        <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
        <h2 className="font-display text-xl text-foreground mb-1 tracking-wide">Admin Access</h2>
        <p className="text-sm text-muted-foreground mb-6">Enter the admin password to continue</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            placeholder="Password"
            className="w-full px-4 py-2 rounded border border-border bg-background text-foreground text-center tracking-widest focus:outline-none focus:border-primary"
            autoFocus
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button type="submit" className="w-full">
            Unlock
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const { data: products = [], isLoading } = useAllProducts();
  const addProduct = useAddProduct();
  const editProduct = useEditProduct();
  const deleteProduct = useDeleteProduct();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');

  const handleAdd = async (data: {
    name: string;
    price: bigint;
    description: string;
    imageUrl: string;
    category: string;
  }) => {
    setAddError('');
    try {
      await addProduct.mutateAsync(data);
      setShowAddDialog(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add product. Please try again.';
      setAddError(msg);
    }
  };

  const handleEdit = async (data: {
    name: string;
    price: bigint;
    description: string;
    imageUrl: string;
    category: string;
  }) => {
    if (!editingProduct) return;
    setEditError('');
    try {
      await editProduct.mutateAsync({ id: editingProduct.id, ...data });
      setEditingProduct(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update product. Please try again.';
      setEditError(msg);
    }
  };

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteProduct.mutateAsync({ id });
    } finally {
      setDeletingId(null);
    }
  };

  const getEditCategory = (product: Product): string => {
    const cat = product.category as unknown as string;
    return BACKEND_TO_FRONTEND_CATEGORY[cat] ?? 'games';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-foreground tracking-wide">Products</h3>
        <Button size="sm" onClick={() => { setShowAddDialog(true); setAddError(''); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No products yet. Add one!</p>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={String(product.id)}
              className="flex items-center gap-3 p-3 rounded border border-border bg-card/50 hover:border-primary/30 transition-colors"
            >
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {getEditCategory(product)} · €{(Number(product.price) / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => { setEditingProduct(product); setEditError(''); }}
                  className="w-8 h-8"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="w-8 h-8 text-destructive hover:text-destructive"
                >
                  {deletingId === product.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) setAddError(''); }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
          <div className="px-6 pt-6 pb-2 shrink-0">
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
              <DialogDescription>Fill in the product details below.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            {addError && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded border border-destructive/40 bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}
            <ProductForm
              onSubmit={handleAdd}
              isLoading={addProduct.isPending}
              onCancel={() => { setShowAddDialog(false); setAddError(''); }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => { if (!open) { setEditingProduct(null); setEditError(''); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
          <div className="px-6 pt-6 pb-2 shrink-0">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update the product details below.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            {editError && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded border border-destructive/40 bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}
            {editingProduct && (
              <ProductForm
                initialData={{ product: editingProduct, category: getEditCategory(editingProduct) }}
                onSubmit={handleEdit}
                isLoading={editProduct.isPending}
                onCancel={() => { setEditingProduct(null); setEditError(''); }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sponsors Tab ─────────────────────────────────────────────────────────────

function SponsorsTab() {
  const { data: sponsors = [], isLoading } = useAllSponsors();
  const addSponsor = useAddSponsor();
  const editSponsor = useEditSponsor();
  const deleteSponsor = useDeleteSponsor();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleAdd = async (data: { name: string; logoUrl: string; description: string }) => {
    await addSponsor.mutateAsync(data);
    setShowAddDialog(false);
  };

  const handleEdit = async (data: { name: string; logoUrl: string; description: string }) => {
    if (!editingSponsor) return;
    await editSponsor.mutateAsync({ id: editingSponsor.id, ...data });
    setEditingSponsor(null);
  };

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteSponsor.mutateAsync({ id });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-foreground tracking-wide">Sponsors</h3>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Sponsor
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded" />
          ))}
        </div>
      ) : sponsors.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No sponsors yet. Add one!</p>
      ) : (
        <div className="space-y-2">
          {sponsors.map((sponsor) => (
            <div
              key={String(sponsor.id)}
              className="flex items-center gap-3 p-3 rounded border border-border bg-card/50 hover:border-primary/30 transition-colors"
            >
              {sponsor.logoUrl && (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  className="w-12 h-12 object-cover rounded shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{sponsor.name}</p>
                <p className="text-xs text-muted-foreground truncate">{sponsor.description}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingSponsor(sponsor)}
                  className="w-8 h-8"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(sponsor.id)}
                  disabled={deletingId === sponsor.id}
                  className="w-8 h-8 text-destructive hover:text-destructive"
                >
                  {deletingId === sponsor.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
          <div className="px-6 pt-6 pb-2 shrink-0">
            <DialogHeader>
              <DialogTitle>Add Sponsor</DialogTitle>
              <DialogDescription>Fill in the sponsor details below.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            <SponsorForm
              onSubmit={handleAdd}
              isLoading={addSponsor.isPending}
              onCancel={() => setShowAddDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSponsor} onOpenChange={(open) => { if (!open) setEditingSponsor(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
          <div className="px-6 pt-6 pb-2 shrink-0">
            <DialogHeader>
              <DialogTitle>Edit Sponsor</DialogTitle>
              <DialogDescription>Update the sponsor details below.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            {editingSponsor && (
              <SponsorForm
                initialData={editingSponsor}
                onSubmit={handleEdit}
                isLoading={editSponsor.isPending}
                onCancel={() => setEditingSponsor(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function formatTimestamp(timestamp: bigint): string {
  try {
    // ICP timestamps are in nanoseconds
    const ms = Number(timestamp / BigInt(1_000_000));
    const date = new Date(ms);
    return date.toLocaleString('en-IE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown date';
  }
}

function OrderCard({ order, index }: { order: BackendOrder; index: number }) {
  const { deliveryDetails, items, total, timestamp } = order;

  return (
    <div className="rounded-lg border border-border bg-card/50 hover:border-primary/20 transition-colors p-4 space-y-3">
      {/* Order header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-display text-sm text-foreground tracking-wide">Order #{index + 1}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatTimestamp(timestamp)}</span>
        </div>
      </div>

      {/* Customer details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <User className="w-3 h-3 text-primary/70 shrink-0" />
          <span className="truncate">{deliveryDetails.fullName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Mail className="w-3 h-3 text-primary/70 shrink-0" />
          <span className="truncate">{deliveryDetails.email}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Phone className="w-3 h-3 text-primary/70 shrink-0" />
          <span>{deliveryDetails.phoneNumber}</span>
        </div>
        <div className="flex items-start gap-1.5 text-muted-foreground">
          <MapPin className="w-3 h-3 text-primary/70 shrink-0 mt-0.5" />
          <span className="break-words">{deliveryDetails.address}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Line items */}
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-muted-foreground truncate mr-2">
              {item.productName} ×{String(item.quantity)}
            </span>
            <span className="shrink-0 text-foreground">
              €{(Number(item.unitPrice * item.quantity) / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-1 border-t border-border/60">
        <span className="text-xs font-semibold text-foreground">Total</span>
        <span className="text-sm font-bold text-primary">
          €{(Number(total) / 100).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function OrdersTab() {
  const { data: orders = [], isLoading, isError } = useOrders();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded border border-destructive/40 bg-destructive/10 text-destructive text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>Failed to load orders. Please try again.</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-muted/30 border border-border flex items-center justify-center">
          <PackageOpen className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="font-display text-base text-foreground tracking-wide">No orders yet</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Orders placed by customers will appear here with their delivery details.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-foreground tracking-wide">
          Orders
          <span className="ml-2 text-sm font-normal text-muted-foreground">({orders.length})</span>
        </h3>
      </div>
      <ScrollArea className="h-[calc(100vh-280px)] pr-2">
        <div className="space-y-3 pb-4">
          {[...orders].reverse().map((order, i) => (
            <OrderCard key={i} order={order} index={orders.length - 1 - i} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem('adminUnlocked') === 'true'
  );

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-display text-2xl text-foreground tracking-wide">Admin Panel</h2>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6 w-full grid grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="sponsors">
          <SponsorsTab />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
