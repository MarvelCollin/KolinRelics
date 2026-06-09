import { useRef, useState } from "react";
import {
  ImageOff,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  X,
} from "lucide-react";
import type { Relic } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  relic: Relic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuy: () => void;
}

const SWIPE_THRESHOLD = 40;

function RelicDetailDialog({ relic, open, onOpenChange, onBuy }: Props) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (!relic) return null;

  const hasImages = relic.images.length > 0;
  const multipleImages = relic.images.length > 1;
  const isSold = relic.status === "sold";

  function prev() {
    setActive((i) => (i === 0 ? relic!.images.length - 1 : i - 1));
  }

  function next() {
    setActive((i) => (i === relic!.images.length - 1 ? 0 : i + 1));
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
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setActive(0);
          setZoom(false);
        }
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6 text-xl leading-tight">
            {relic.name}
          </DialogTitle>
        </DialogHeader>

        <div
          className="group relative aspect-[4/3] w-full select-none overflow-hidden rounded-md bg-muted"
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
              onClick={() => setZoom(true)}
              className={cn(
                "absolute inset-0 block h-full w-full cursor-zoom-in object-cover",
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
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white backdrop-blur transition hover:bg-black/75"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white backdrop-blur transition hover:bg-black/75"
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

        {relic.description && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {relic.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-muted/30 p-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Buy price</p>
            <p className="font-medium">{formatPrice(relic.price_buy)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sell price</p>
            <Badge variant="success" className="text-sm">
              {formatPrice(relic.price_current)}
            </Badge>
          </div>
        </div>

        <Button
          type="button"
          onClick={onBuy}
          disabled={isSold}
          className="w-full"
        >
          <ShoppingBag className="h-4 w-4" />
          {isSold ? "Sold out" : "Buy"}
        </Button>
      </DialogContent>

      {zoom && hasImages && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoom(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setZoom(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>

          <img
            src={relic.images[active]}
            alt={relic.name}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />

          {multipleImages && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                {active + 1}/{relic.images.length}
              </div>
            </>
          )}
        </div>
      )}
    </Dialog>
  );
}

export default RelicDetailDialog;
