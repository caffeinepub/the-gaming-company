import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Sponsor } from '../backend';

interface SponsorFormProps {
  initialData?: Sponsor | null;
  onSubmit: (data: { name: string; logoUrl: string; description: string; id?: bigint }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function SponsorForm({ initialData, onSubmit, onCancel, isLoading }: SponsorFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
  const [description, setDescription] = useState(initialData?.description || '');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setLogoUrl(initialData.logoUrl);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      logoUrl: logoUrl.trim(),
      description: description.trim(),
      ...(initialData ? { id: initialData.id } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="font-heading text-sm uppercase tracking-wider text-muted-foreground">Sponsor Name *</Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. NVIDIA"
          required
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-heading text-sm uppercase tracking-wider text-muted-foreground">Logo URL</Label>
        <Input
          value={logoUrl}
          onChange={e => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-heading text-sm uppercase tracking-wider text-muted-foreground">Description</Label>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="About this sponsor..."
          rows={3}
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading uppercase tracking-wider"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Sponsor' : 'Add Sponsor'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-border text-foreground hover:bg-muted font-heading uppercase tracking-wider"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
