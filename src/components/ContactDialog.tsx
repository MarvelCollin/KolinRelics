import { MessageCircle, Phone, Copy, Check } from "lucide-react";
import { useState } from "react";
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
  const [copied, setCopied] = useState(false);
  if (!relic) return null;

  const message = buildMessage(relic);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  const lineShareUrl = `https://line.me/R/msg/text/?${encodedMessage}`;
  const lineProfileUrl = `https://line.me/R/ti/p/~${LINE_ID}`;

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Pesan disalin");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin");
    }
  }

  async function openLine() {
    try {
      await navigator.clipboard.writeText(message);
    } catch {}
    window.open(lineShareUrl, "_blank", "noopener,noreferrer");
    toast.message("Pilih @" + LINE_ID + " di daftar kontak Line");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hubungi penjual</DialogTitle>
          <DialogDescription>
            Pilih platform. Pesan sudah terisi otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border bg-muted/40 p-3">
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{message}</pre>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyMessage}
            className="mt-2 w-full"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Disalin" : "Salin pesan"}
          </Button>
        </div>

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

        <a
          href={lineProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Belum add Line @{LINE_ID}? Buka profil
        </a>
      </DialogContent>
    </Dialog>
  );
}

export default ContactDialog;
