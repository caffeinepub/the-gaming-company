import { useState, useEffect } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product } from '../backend';

export const CATEGORIES = [
  { value: 'games', label: 'Games' },
  { value: 'controllers', label: 'Controllers' },
  { value: 'consoles', label: 'Consoles' },
  { value: 'accessories', label: 'Accessories' },
];

// Smart auto-fill lookup table for popular consoles and games
interface AutoFillEntry {
  imageUrl: string;
  description: string;
  category: string;
  defaultPrice: string;
}

const PRODUCT_LOOKUP: Record<string, AutoFillEntry> = {
  'nintendo switch': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/NintendoSwitchRedBlue.jpg/1200px-NintendoSwitchRedBlue.jpg',
    description: 'The Nintendo Switch is a hybrid gaming console that can be played at home on a TV or taken on the go as a handheld device. Features detachable Joy-Con controllers.',
    category: 'consoles',
    defaultPrice: '299.99',
  },
  'nintendo switch oled': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Nintendo_Switch_%28OLED_model%29_white_set.jpg/1200px-Nintendo_Switch_%28OLED_model%29_white_set.jpg',
    description: 'The Nintendo Switch OLED model features a vibrant 7-inch OLED screen, a wide adjustable stand, and enhanced audio for an upgraded gaming experience.',
    category: 'consoles',
    defaultPrice: '349.99',
  },
  'playstation 5': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/PlayStation_5_and_DualSense_with_transparent_background.png/1200px-PlayStation_5_and_DualSense_with_transparent_background.png',
    description: 'Sony\'s PlayStation 5 delivers lightning-fast loading with its custom SSD, deeper immersion with the DualSense controller, and stunning 4K gaming at up to 120fps.',
    category: 'consoles',
    defaultPrice: '499.99',
  },
  'ps5': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/PlayStation_5_and_DualSense_with_transparent_background.png/1200px-PlayStation_5_and_DualSense_with_transparent_background.png',
    description: 'Sony\'s PlayStation 5 delivers lightning-fast loading with its custom SSD, deeper immersion with the DualSense controller, and stunning 4K gaming at up to 120fps.',
    category: 'consoles',
    defaultPrice: '499.99',
  },
  'xbox series x': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Xbox_Series_X_and_controller.jpg/1200px-Xbox_Series_X_and_controller.jpg',
    description: 'Microsoft\'s most powerful Xbox ever. The Xbox Series X delivers 4K gaming at up to 120fps, with Quick Resume and Xbox Game Pass compatibility.',
    category: 'consoles',
    defaultPrice: '499.99',
  },
  'xbox series s': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Xbox_Series_S.jpg/1200px-Xbox_Series_S.jpg',
    description: 'The smallest, most affordable next-gen Xbox. The Xbox Series S delivers next-gen performance in a compact all-digital design at 1440p.',
    category: 'consoles',
    defaultPrice: '299.99',
  },
  'game boy': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Game-Boy-FL.jpg/800px-Game-Boy-FL.jpg',
    description: 'The iconic Nintendo Game Boy handheld console that defined portable gaming. Features a 2.6-inch dot-matrix display and legendary battery life.',
    category: 'consoles',
    defaultPrice: '89.99',
  },
  'game boy advance': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Game-Boy-Advance-Purple-FL.jpg/800px-Game-Boy-Advance-Purple-FL.jpg',
    description: 'Nintendo\'s Game Boy Advance features a 32-bit ARM processor and a wide landscape screen, bringing console-quality gaming to your pocket.',
    category: 'consoles',
    defaultPrice: '79.99',
  },
  'nintendo 64': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/N64-Console-Set.jpg/1200px-N64-Console-Set.jpg',
    description: 'The Nintendo 64 revolutionized gaming with 3D graphics and iconic titles. Includes the classic trident-shaped controller and cartridge-based games.',
    category: 'consoles',
    defaultPrice: '149.99',
  },
  'sega genesis': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Sega-Genesis-Mod1-Set.jpg/1200px-Sega-Genesis-Mod1-Set.jpg',
    description: 'The Sega Genesis (Mega Drive) is a classic 16-bit home video game console that brought arcade-quality gaming home with its blast processing power.',
    category: 'consoles',
    defaultPrice: '99.99',
  },
  'playstation 4': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/PlayStation_4_-_1200px.jpg/1200px-PlayStation_4_-_1200px.jpg',
    description: 'Sony\'s PlayStation 4 offers an incredible library of games, seamless social features, and stunning HD gaming experiences.',
    category: 'consoles',
    defaultPrice: '299.99',
  },
  'minecraft': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png',
    description: 'Minecraft is a sandbox video game where players explore, build, and survive in a procedurally generated world made of blocks. One of the best-selling games of all time.',
    category: 'games',
    defaultPrice: '29.99',
  },
  'mario kart': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/78/Mario_Kart_8_Deluxe_icon.png',
    description: 'Mario Kart 8 Deluxe is the definitive kart racing game featuring 48 courses, 42 characters, and frantic multiplayer action for up to 4 players locally.',
    category: 'games',
    defaultPrice: '59.99',
  },
  'mario kart 8': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/78/Mario_Kart_8_Deluxe_icon.png',
    description: 'Mario Kart 8 Deluxe is the definitive kart racing game featuring 48 courses, 42 characters, and frantic multiplayer action for up to 4 players locally.',
    category: 'games',
    defaultPrice: '59.99',
  },
  'call of duty': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/Call_of_Duty_Modern_Warfare_III_cover.jpg/220px-Call_of_Duty_Modern_Warfare_III_cover.jpg',
    description: 'Call of Duty is the iconic first-person shooter franchise featuring intense multiplayer battles, cinematic campaigns, and the popular Warzone battle royale mode.',
    category: 'games',
    defaultPrice: '69.99',
  },
  'fortnite': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Fortnite_chapter_5_season_1_cover_art.jpg/220px-Fortnite_chapter_5_season_1_cover_art.jpg',
    description: 'Fortnite is the free-to-play battle royale phenomenon by Epic Games. Drop in, build, and be the last one standing in this ever-evolving pop-culture experience.',
    category: 'games',
    defaultPrice: '0.00',
  },
  'fifa': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/FIFA_23_Cover.jpg/220px-FIFA_23_Cover.jpg',
    description: 'EA Sports FIFA is the world\'s most popular football simulation game, featuring authentic leagues, clubs, and players with stunning next-gen visuals.',
    category: 'games',
    defaultPrice: '59.99',
  },
  'the legend of zelda': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/The_Legend_of_Zelda_Breath_of_the_Wild.jpg/220px-The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
    description: 'The Legend of Zelda: Breath of the Wild is an open-world masterpiece. Explore the vast kingdom of Hyrule, solve puzzles, and defeat Calamity Ganon.',
    category: 'games',
    defaultPrice: '59.99',
  },
  'zelda': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/The_Legend_of_Zelda_Breath_of_the_Wild.jpg/220px-The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
    description: 'The Legend of Zelda: Breath of the Wild is an open-world masterpiece. Explore the vast kingdom of Hyrule, solve puzzles, and defeat Calamity Ganon.',
    category: 'games',
    defaultPrice: '59.99',
  },
  'grand theft auto': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/GTA_V_cover_art.jpg/220px-GTA_V_cover_art.jpg',
    description: 'Grand Theft Auto V is Rockstar\'s open-world crime epic set in the sprawling city of Los Santos. Features a massive story mode and the ever-evolving GTA Online.',
    category: 'games',
    defaultPrice: '39.99',
  },
  'gta': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/GTA_V_cover_art.jpg/220px-GTA_V_cover_art.jpg',
    description: 'Grand Theft Auto V is Rockstar\'s open-world crime epic set in the sprawling city of Los Santos. Features a massive story mode and the ever-evolving GTA Online.',
    category: 'games',
    defaultPrice: '39.99',
  },
  'super mario': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0d/Super_Mario_Odyssey.jpg/220px-Super_Mario_Odyssey.jpg',
    description: 'Super Mario Odyssey is a globe-trotting 3D platformer adventure. Join Mario and his new ally Cappy as they journey across incredible kingdoms to rescue Princess Peach.',
    category: 'games',
    defaultPrice: '59.99',
  },
  'pokemon': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/af/Pokemon_scarlet_en_boxart.jpg/220px-Pokemon_scarlet_en_boxart.jpg',
    description: 'Pokémon Scarlet and Violet bring an open-world adventure to the Paldea region. Catch, train, and battle hundreds of Pokémon in a fully explorable world.',
    category: 'games',
    defaultPrice: '59.99',
  },
  'nintendo': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/NintendoSwitchRedBlue.jpg/1200px-NintendoSwitchRedBlue.jpg',
    description: 'Nintendo Switch — the hybrid gaming console you can play at home or on the go. Enjoy a massive library of first-party and third-party titles.',
    category: 'consoles',
    defaultPrice: '299.99',
  },
  'playstation': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/PlayStation_5_and_DualSense_with_transparent_background.png/1200px-PlayStation_5_and_DualSense_with_transparent_background.png',
    description: 'Sony PlayStation 5 — the next generation of gaming with ultra-fast SSD, ray tracing, 4K visuals, and the innovative DualSense haptic feedback controller.',
    category: 'consoles',
    defaultPrice: '499.99',
  },
  'xbox': {
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Xbox_Series_X_and_controller.jpg/1200px-Xbox_Series_X_and_controller.jpg',
    description: 'Xbox Series X — Microsoft\'s most powerful console with 4K gaming, Quick Resume, and access to hundreds of games via Xbox Game Pass.',
    category: 'consoles',
    defaultPrice: '499.99',
  },
};

function findAutoFill(name: string): AutoFillEntry | null {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  // Exact match first
  if (PRODUCT_LOOKUP[key]) return PRODUCT_LOOKUP[key];
  // Partial match — check if any lookup key starts with or is contained in the typed name
  for (const [lookupKey, entry] of Object.entries(PRODUCT_LOOKUP)) {
    if (key.startsWith(lookupKey) || lookupKey.startsWith(key)) {
      return entry;
    }
  }
  return null;
}

interface ProductFormProps {
  initialData?: { product: Product; category: string } | null;
  onSubmit: (data: { category: string; name: string; price: bigint; description: string; imageUrl: string; id?: bigint }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductForm({ initialData, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [category, setCategory] = useState(initialData?.category || 'games');
  const [name, setName] = useState(initialData?.product.name || '');
  const [price, setPrice] = useState(initialData ? Number(initialData.product.price).toString() : '');
  const [description, setDescription] = useState(initialData?.product.description || '');
  const [imageUrl, setImageUrl] = useState(initialData?.product.imageUrl || '');
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setName(initialData.product.name);
      setPrice(Number(initialData.product.price).toString());
      setDescription(initialData.product.description);
      setImageUrl(initialData.product.imageUrl);
      setAutoFilled(false);
    }
  }, [initialData]);

  // Auto-fill effect when name changes
  useEffect(() => {
    if (initialData) return; // Don't auto-fill when editing existing products
    const match = findAutoFill(name);
    if (match) {
      setCategory(match.category);
      setDescription(match.description);
      setImageUrl(match.imageUrl);
      if (!price) setPrice(match.defaultPrice);
      setAutoFilled(true);
    } else {
      setAutoFilled(false);
    }
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (!name.trim() || isNaN(priceNum) || priceNum < 0) return;
    onSubmit({
      category,
      name: name.trim(),
      price: BigInt(Math.round(priceNum * 100)),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      ...(initialData ? { id: initialData.product.id } : {}),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Auto-fill indicator */}
      {autoFilled && (
        <div className="flex items-center gap-2 px-3 py-2 rounded border border-primary/40 bg-primary/10 text-primary text-xs font-heading uppercase tracking-wider">
          <Wand2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Auto-filled from product database — fields are editable</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="font-heading text-sm uppercase tracking-wider text-muted-foreground">Category</Label>
        <Select value={category} onValueChange={(v) => { setCategory(v); setAutoFilled(false); }}>
          <SelectTrigger className="bg-muted border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value} className="text-foreground hover:bg-muted">
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="font-heading text-sm uppercase tracking-wider text-muted-foreground">
          Product Name *
          {!initialData && (
            <span className="ml-2 text-muted-foreground normal-case tracking-normal font-body text-xs opacity-70">
              (try "Nintendo Switch", "PS5", "Minecraft"…)
            </span>
          )}
        </Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. PlayStation 5, Nintendo Switch, Minecraft"
          required
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-heading text-sm uppercase tracking-wider text-muted-foreground">Price (USD) *</Label>
        <Input
          type="number"
          value={price}
          onChange={e => { setPrice(e.target.value); setAutoFilled(false); }}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-heading text-sm uppercase tracking-wider text-muted-foreground">Description</Label>
        <Textarea
          value={description}
          onChange={e => { setDescription(e.target.value); setAutoFilled(false); }}
          placeholder="Product description..."
          rows={3}
          className={`bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none ${autoFilled ? 'border-primary/50 ring-1 ring-primary/30' : ''}`}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-heading text-sm uppercase tracking-wider text-muted-foreground">Image URL</Label>
        <Input
          value={imageUrl}
          onChange={e => { setImageUrl(e.target.value); setAutoFilled(false); }}
          placeholder="https://example.com/image.jpg"
          className={`bg-muted border-border text-foreground placeholder:text-muted-foreground ${autoFilled ? 'border-primary/50 ring-1 ring-primary/30' : ''}`}
        />
        {/* Image preview when URL is set */}
        {imageUrl && (
          <div className="mt-2 rounded overflow-hidden border border-border bg-muted h-32 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Product preview"
              className="h-full w-full object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading uppercase tracking-wider"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Add Product'}
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
