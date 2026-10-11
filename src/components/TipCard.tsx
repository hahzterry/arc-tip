
"use client";

import React, { useState, useEffect } from "react";
import { formatAddress, formatUsdc, parseUsdc, getTxUrl } from "@/lib/format";
import {
  Send,
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TipCardProps {
  initialRecipient?: string;
  senderAddress: string | null;
  senderBalance: bigint | null;
  onSendTip: (
    recipient: string,
    amountUsdc: string,
    memo: string,
    useContract: boolean
  ) => Promise<{ success: boolean; txHash?: string; error?: string }>;
}

const PRESET_AMOUNTS = ["0.5", "1.0", "2.5", "5.0", "10.0"];

export const TipCard: React.FC<TipCardProps> = ({
  initialRecipient = "",
  senderAddress,
  senderBalance,
  onSendTip,
}) => {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState("1.0");
  const [memo, setMemo] = useState("");
  const [useContract, setUseContract] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
    txHash?: string;
  } | null>(null);

  useEffect(() => {
    if (initialRecipient) setRecipient(initialRecipient);
  }, [initialRecipient]);

  const handlePreset = (val: string) => {
    setAmount(val);
    setStatusMessage(null);
  };

  const handleMax = () => {
    if (!senderBalance || senderBalance <= 0n) return;

    const reserve = parseUsdc("0.002");

    if (senderBalance > reserve) {
      setAmount(formatUsdc(senderBalance - reserve, 4).replace(/,/g, ""));
    } else {
      setAmount("0.0");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanRecipient = recipient.trim();

    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanRecipient)) {
      setStatusMessage({
        type: "error",
        text: "That payment address doesn't look right. Double-check it and try again.",
      });
      return;
    }

    const numAmount = Number(amount);

    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setStatusMessage({
        type: "error",
        text: "Enter an amount greater than $0.",
      });
      return;
    }

    if (!senderAddress) {
      setStatusMessage({
        type: "error",
        text: "Connect your account before sending a tip.",
      });
      return;
    }

    setLoading(true);
    setStatusMessage({
      type: "info",
      text: "One sec! Confirm your tip in your wallet.",
    });

    try {
      const res = await onSendTip(
        cleanRecipient,
        amount,
        memo,
        useContract
      );

      if (res.success && res.txHash) {
        setStatusMessage({
          type: "success",
          text: `Tip sent! You sent $${amount} to ${formatAddress(cleanRecipient)}. Show that love! 💙`,
          txHash: res.txHash,
        });

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#00D2FF", "#2775CA", "#10B981", "#ffffff"],
          });
        } catch {
          // Ignore animation errors.
        }

        setMemo("");
      } else {
        setStatusMessage({
          type: "error",
          text: "Your tip didn't go through. Check your balance and payment details, then try again.",
        });
      }
    } catch (err: unknown) {
      setStatusMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#121722] border border-[#1E2638] rounded-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D2FF] to-transparent opacity-80" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Send a Tip 💸
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            A little love goes a long way.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">
              Who are you tipping?
            </label>
            {initialRecipient && (
              <span className="text-[11px] text-[#00D2FF]">
                Link opened ✓
              </span>
            )}
          </div>

          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter payment address"
            autoComplete="off"
            className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#00D2FF] transition-all"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">
              How much? 
            </label>
            {senderBalance !== null && (
              <button
                type="button"
                onClick={handleMax}
                className="text-[11px] text-[#00D2FF] hover:underline"
              >
                Available: ${formatUsdc(senderBalance)}
              </button>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#00D2FF]">
              $
            </span>
            <input
              type="number"
              step="any"
              min="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.00"
              className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg pl-8 pr-4 py-3 text-lg font-semibold text-white placeholder-[#475569] focus:outline-none focus:border-[#00D2FF] transition-all"
              required
            />
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePreset(preset)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  amount === preset
                    ? "bg-[#00D2FF]/10 border-[#00D2FF] text-[#00D2FF] font-medium"
                    : "bg-[#0B0E14] border-[#1E2638] text-[#94A3B8] hover:text-white hover:border-[#334155]"
                }`}
              >
                ${Number(preset).toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">
              Add a note
              <span className="text-[#64748B] ml-1">(optional)</span>
            </label>
            <span className="text-[10px] text-[#64748B]">
              {memo.length}/280
            </span>
          </div>

          <input
            type="text"
            maxLength={280}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="You're amazing! Keep going 💙"
            className="w-full bg-[#0B0E14] border border-[#1E2638] rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#00D2FF] transition-all"
          />
        </div>

        <details className="group pt-1">
          <summary className="cursor-pointer text-xs text-[#64748B] hover:text-[#94A3B8]">
            More payment options
          </summary>
          <div className="mt-2 p-3 rounded-lg bg-[#0B0E14] border border-[#1E2638]">
            <p className="text-xs text-[#94A3B8] mb-2">
              Choose how your tip is sent.
            </p>
            <button
              type="button"
              onClick={() => setUseContract(!useContract)}
              className="text-xs text-[#00D2FF] hover:underline"
            >
              {useContract
                ? "Use standard payment instead"
                : "Include a public tip note"}
            </button>
          </div>
        </details>

        <div className="p-3 rounded-lg bg-[#0B0E14]/60 border border-[#1E2638]/70 flex items-start gap-2.5 text-[11px] text-[#94A3B8]">
          <Info className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" />
          <p>
            Check the recipient and amount before sending. Network
            fees may apply. Notes sent with a public payment may be
            visible to others.
          </p>
        </div>

        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : statusMessage.type === "error"
                ? "bg-red-950/40 border-red-500/40 text-red-300"
                : "bg-cyan-950/40 border-[#00D2FF]/40 text-[#00D2FF]"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : statusMessage.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />
            )}

            <div className="space-y-1">
              <div>{statusMessage.text}</div>
              {statusMessage.txHash && (
                <a
                  href={getTxUrl(statusMessage.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-white hover:underline pt-0.5"
                >
                  <span>View payment details</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            loading
              ? "bg-[#1E2638] text-[#94A3B8] cursor-not-allowed"
              : "bg-gradient-to-r from-[#00D2FF] to-[#2775CA] hover:opacity-95 text-[#0B0E14] font-bold active:scale-[0.99] shadow-lg shadow-[#00D2FF]/20"
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#94A3B8] border-t-transparent rounded-full animate-spin" />
              <span>Sending your tip...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send ${amount} {memo ? "💙" : "Tip 💸"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
