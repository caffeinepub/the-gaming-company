import type { Sponsor } from '../backend';
import { ExternalLink } from 'lucide-react';

interface SponsorCardProps {
  sponsor: Sponsor;
}

const FALLBACK_LOGO = 'https://placehold.co/200x100/1a1a2e/e63946?text=Sponsor';

export default function SponsorCard({ sponsor }: SponsorCardProps) {
  return (
    <div className="bg-card border border-border rounded card-hover p-6 flex flex-col items-center text-center gap-4 group">
      <div className="w-32 h-16 flex items-center justify-center overflow-hidden rounded bg-muted">
        <img
          src={sponsor.logoUrl || FALLBACK_LOGO}
          alt={sponsor.name}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_LOGO;
          }}
        />
      </div>
      <div>
        <h3 className="font-heading text-xl font-bold text-foreground">{sponsor.name}</h3>
        {sponsor.description && (
          <p className="text-muted-foreground text-sm mt-1 font-body line-clamp-3">
            {sponsor.description}
          </p>
        )}
      </div>
      <div className="mt-auto">
        <span className="inline-flex items-center gap-1 text-primary text-xs font-heading uppercase tracking-wider">
          <ExternalLink className="w-3 h-3" />
          Official Sponsor
        </span>
      </div>
    </div>
  );
}
