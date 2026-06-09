import { MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import type { Relic } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  relic: Relic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WHATSAPP_NUMBER = "6285716915343";
const LINE_ID = "kolinpakec";

function buildMessage(relic: Relic) {
  return [
    "bang saya mau ini bang",
    `Item Name : ${relic.name}`,
    `Description : ${relic.description || "-"}`,
    `Buy Price : ${formatPrice(relic.price_buy)}`,
    `Sell Price : ${formatPrice(relic.price_current)}`,
  ].join("\n");
}

function ContactDialog({ relic, open, onOpenChange }: Props) {
  if (!relic) return null;

  const message = buildMessage(relic);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const lineProfileUrl = `https://line.me/R/ti/p/~${LINE_ID}`;

  async function openLine() {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Pesan disalin, paste di chat");
    } catch {}
    window.open(lineProfileUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hubungi penjual</DialogTitle>
          <DialogDescription>
            Pilih platform untuk menghubungi penjual.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            asChild
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Phone className="h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          <Button
            type="button"
            onClick={openLine}
            className="flex-1 bg-[#06C755] text-white hover:bg-[#05a847]"
          >
            <MessageCircle className="h-4 w-4" />
            Line
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ContactDialog;
