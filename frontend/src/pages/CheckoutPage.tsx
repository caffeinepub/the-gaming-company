import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { usePlaceOrder } from '../hooks/useQueries';
import type { OrderItem } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle, MapPin, User, Mail, Phone } from 'lucide-react';

interface CheckoutPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

interface CustomerDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  postcode: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  postcode?: string;
}

const emptyDetails: CustomerDetails = {
  fullName: '',
  email: '',
  phoneNumber: '',
  streetAddress: '',
  city: '',
  postcode: '',
};

export default function CheckoutPage({ onBack, onSuccess }: CheckoutPageProps) {
  const { items, totalPrice, clearCart } = useCart();
  const placeOrder = usePlaceOrder();

  const [details, setDetails] = useState<CustomerDetails>(emptyDetails);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [confirmedAddress, setConfirmedAddress] = useState('');
  const [success, setSuccess] = useState(false);

  const formatPrice = (price: bigint) => {
    try {
      return `€${(Number(price) / 100).toFixed(2)}`;
    } catch {
      return '€—';
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!details.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!details.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!details.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!details.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!details.city.trim()) newErrors.city = 'City is required';
    if (!details.postcode.trim()) newErrors.postcode = 'Postcode is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CustomerDetails) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    const fullAddress = `${details.streetAddress}, ${details.city}, ${details.postcode}`;

    const orderItems: OrderItem[] = items.map((item) => ({
      productName: item.product.name,
      quantity: BigInt(item.quantity),
      unitPrice: item.product.price,
    }));

    try {
      await placeOrder.mutateAsync({
        fullName: details.fullName.trim(),
        email: details.email.trim(),
        phoneNumber: details.phoneNumber.trim(),
        address: fullAddress,
        items: orderItems,
        total: totalPrice,
      });
      setConfirmedAddress(fullAddress);
      clearCart();
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setSubmitError(msg);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-foreground tracking-wide mb-2">Order Placed!</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Thank you for your purchase. Your order is on its way to:
          </p>
        </div>
        <div className="flex items-start gap-2 bg-card border border-border rounded-lg px-5 py-3 text-sm max-w-sm w-full">
          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <span className="text-foreground">{confirmedAddress}</span>
        </div>
        <Button onClick={onSuccess} className="mt-2">Back to Store</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-display text-2xl text-foreground tracking-wide">Checkout</h2>
      </div>

      {/* Order Summary */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <h3 className="font-display text-base text-foreground mb-3 tracking-wide">Order Summary</h3>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={String(item.product.id)} className="flex justify-between">
              <span className="text-muted-foreground truncate mr-2">
                {item.product.name} ×{item.quantity}
              </span>
              <span className="shrink-0 font-medium">
                {formatPrice(item.product.price * BigInt(item.quantity))}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="text-primary">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {/* Customer Details Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="rounded-lg border border-border bg-card p-5 mb-4">
          <h3 className="font-display text-base text-foreground mb-4 tracking-wide flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Delivery Details
          </h3>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm text-foreground">
                Full Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Smith"
                value={details.fullName}
                onChange={handleChange('fullName')}
                className={errors.fullName ? 'border-destructive focus-visible:ring-destructive' : ''}
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Email Address <span className="text-primary">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={details.email}
                onChange={handleChange('email')}
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-sm text-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                Phone Number <span className="text-primary">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+353 87 123 4567"
                value={details.phoneNumber}
                onChange={handleChange('phoneNumber')}
                className={errors.phoneNumber ? 'border-destructive focus-visible:ring-destructive' : ''}
                autoComplete="tel"
              />
              {errors.phoneNumber && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Street Address */}
            <div className="space-y-1.5">
              <Label htmlFor="streetAddress" className="text-sm text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                Street Address <span className="text-primary">*</span>
              </Label>
              <Input
                id="streetAddress"
                type="text"
                placeholder="123 Main Street"
                value={details.streetAddress}
                onChange={handleChange('streetAddress')}
                className={errors.streetAddress ? 'border-destructive focus-visible:ring-destructive' : ''}
                autoComplete="street-address"
              />
              {errors.streetAddress && (
                <p className="text-destructive text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.streetAddress}
                </p>
              )}
            </div>

            {/* City + Postcode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-sm text-foreground">
                  City <span className="text-primary">*</span>
                </Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="Dublin"
                  value={details.city}
                  onChange={handleChange('city')}
                  className={errors.city ? 'border-destructive focus-visible:ring-destructive' : ''}
                  autoComplete="address-level2"
                />
                {errors.city && (
                  <p className="text-destructive text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.city}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postcode" className="text-sm text-foreground">
                  Postcode <span className="text-primary">*</span>
                </Label>
                <Input
                  id="postcode"
                  type="text"
                  placeholder="D01 AB12"
                  value={details.postcode}
                  onChange={handleChange('postcode')}
                  className={errors.postcode ? 'border-destructive focus-visible:ring-destructive' : ''}
                  autoComplete="postal-code"
                />
                {errors.postcode && (
                  <p className="text-destructive text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.postcode}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded border border-destructive/40 bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={placeOrder.isPending || items.length === 0}
        >
          {placeOrder.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order…
            </>
          ) : (
            'Place Order'
          )}
        </Button>
      </form>
    </div>
  );
}
