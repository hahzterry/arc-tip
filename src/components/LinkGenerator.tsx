
"use client";

import React, { useState } from "react";
import { formatAddress } from "@/lib/format";
import { Copy, Check, QrCode, Share2 } from "lucide-react";

interface LinkGeneratorProps {
  currentAccount: string | null;
  onOpenQr: (url: string, address: string) => void;
}

export const LinkGenerator: React.FC<LinkGeneratorProps> = ({
  currentAccount,
  onOpenQr,
}) => {
  const [addressInput, setAddressInput] = useState("");
  const [copied, setCopied] = useState(false);

  const activeAddress = addressInput.trim() || currentAccount || "";
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://arc-tip-phi.vercel.app";

  const shareUrl = activeAddress
    ? `${origin}/tip/${activeAddress}`
    : "";

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Send me a tip 💸",
          text: "Show some love with MonYuny Tip!",
          url: shareUrl,
        });
      } catch {
        // Sharing was cancelled or unavailable.
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <div className="w-full bg-[#121722] border border-[#1E2638] rounded-xl p-5 sm:p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="w-4 h-4 text-[#00D2FF]" />
        <h3 className="text-base font-bold text-white tracking-tight">
          Get Your Tip Link 🔗
        </h3>
      </div>

      <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">
        One link to share anywhere. Put it in your bio, send it to
        friends, or share it with your community.
      </p>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <label className="text-xs text-[#94A3B8]">
              Payment account
            </label>

            {currentAccount && (
              <button
                type="button"
                onClick={() => setAddressInput(currentAccount)}
                className="text-[11px] text-[#00D2FF] hover:underline"
              >
                Use my account
              </button>
            )}
          </div>

          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder={currentAccount ? "Use your connected account" : "Enter payment address"}
            autoComplete="off"
            className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#00D2FF]"
          />
        </div>

        {activeAddress && (
          <div className="p-3 bg-[#0B0E14] border border-[#1E2638] rounded-lg space-y-3">
            <div className="text-[11px] text-[#94A3B8]">
              Your personal tip link
            </div>

            <div className="text-xs text-white break-all bg-[#121722] p-2.5 rounded border border-[#1E2638]">
              {shareUrl}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#182030] hover:bg-[#1E2638] text-xs font-medium text-white transition-all border border-[#1E2638]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#00D2FF]" />
                    <span>Copy link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#182030] hover:bg-[#1E2638] text-xs font-medium text-white transition-all border border-[#1E2638]"
              >
                <Share2 className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenQr(shareUrl, activeAddress)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-[#182030] hover:bg-[#1E2638] text-xs font-medium text-white transition-all border border-[#1E2638]"
              >
                <QrCode className="w-3.5 h-3.5 text-[#00D2FF]" />
                <span>QR code</span>
              </button>
            </div>
          </div>
        )}

        {!activeAddress && (
          <p className="text-xs text-[#64748B]">
            Connect your account or enter a payment address to create your link.
          </p>
        )}
      </div>
    </div>
  );
};
