import { useRef, useState } from "react";
import { ImageOff, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import type { Relic } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContactDialog from "@/components/ContactDialog";
import RelicDetailDialog from "@/components/RelicDetailDialog";

interface Props {
  relic: Relic;
}

const SWIPE_THRESHOLD = 40;

function RelicCard({ relic }: Props) {
  const [active, setActive] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  function handleBuyClick(e: React.MouseEvent) {
    e.stopPropagation();
    setContactOpen(true);
  }

  function handleBuyFromDetail() {
    setDetailOpen(false);
    setTimeout(() => setContactOpen(true), 120);
  }
  const hasImages = relic.images.length > 0;
  const multipleImages = relic.images.length > 1;
  const isSold = relic.status === "sold";

  function prev() {
    setActive((i) => (i === 0 ? relic.images.length - 1 : i - 1));
  }

  function next() {
    setActive((i) => (i === relic.images.length - 1 ? 0 : i + 1));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (!multipleImages) return;
    if (delta > SWIPE_THRESHOLD) prev();
    else if (delta < -SWIPE_THRESHOLD) next();
  }

  return (
    <>
      <Card className="overflow-hidden flex flex-col transition-shadow hover:shadow-lg hover:shadow-black/20">
        <div
          className="group relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden bg-muted"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {hasImages ? (
            <img
              src={relic.images[active]}
              alt={relic.name}
              loading="lazy"
              decoding="async"
              draggable={false}
              width={800}
              height={600}
              onClick={() => setDetailOpen(true)}
              className={cn(
                "absolute inset-0 block h-full w-full cursor-pointer object-cover",
                isSold && "grayscale"
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <ImageOff className="h-10 w-10" />
            </div>
          )}

          <div className="absolute left-2 top-2">
            <Badge variant={isSold ? "muted" : "info"} className="uppercase">
              {relic.status}
            </Badge>
          </div>

          {multipleImages && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white backdrop-blur transition hover:bg-black/75 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white backdrop-blur transition hover:bg-black/75 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white backdrop-blur">
                {active + 1}/{relic.images.length}
              </div>
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
            </>
          )}
        </div>

        <CardContent
          role="button"
          tabIndex={0}
          onClick={() => setDetailOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setDetailOpen(true);
            }
          }}
          className="flex flex-1 cursor-pointer flex-col gap-3 p-4 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40"
        >
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
          <Button
            type="button"
            onClick={handleBuyClick}
            disabled={isSold}
            className="w-full"
          >
            <ShoppingBag className="h-4 w-4" />
            {isSold ? "Sold out" : "Buy"}
          </Button>
        </CardContent>
      </Card>

      <RelicDetailDialog
        relic={relic}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onBuy={handleBuyFromDetail}
      />

      <ContactDialog
        relic={relic}
        open={contactOpen}
        onOpenChange={setContactOpen}
      />
    </>
  );
}

export default RelicCard;
