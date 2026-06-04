import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { Relic } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  relic: Relic;
}

function RelicCard({ relic }: Props) {
  const [active, setActive] = useState(0);
  const hasImages = relic.images.length > 0;

  return (
    <Card className="overflow-hidden flex flex-col transition-shadow hover:shadow-lg hover:shadow-black/20">
      <div className="relative aspect-[4/3] bg-muted">
        {hasImages ? (
          <img
            src={relic.images[active]}
            alt={relic.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        {relic.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/50 px-2 py-1 backdrop-blur">
            {relic.images.map((url, index) => (
              <button
                key={url}
                type="button"
                aria-label={`Image ${index + 1}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all",
                  index === active ? "w-4 bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold leading-tight">{relic.name}</h2>
          {relic.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {relic.description}
            </p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Buy {formatPrice(relic.price_buy)}
          </span>
          <Badge variant="success" className="text-sm">
            {formatPrice(relic.price_current)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default RelicCard;
