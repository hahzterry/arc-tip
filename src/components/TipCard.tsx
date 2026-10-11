"use client";
import React, { useState, useEffect } from "react";
import {
  formatAddress,
  formatUsdc,
  parseUsdc,
  getTxUrl,
} from "@/lib/format";
import {
  Send,
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Zap,
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
  ) => Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }>;
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
    if (initialRecipient) {
      setRecipient(initialRecipient);
    }
  }, [initialRecipient]);
  const handlePreset = (val: string) => {
    setAmount(val);
    setStatusMessage(null);
  };
  const handleMax = () => {
    if (senderBalance === null || senderBalance <= 0n) return;
    // Keep a small balance reserve for transaction fees.
    const reserve = parseUsdc("0.002");
    if (senderBalance > reserve) {
      setAmount(
        formatUsdc(senderBalance - reserve, 4).replace(/,/g, "")
      );
    } else {
      setAmount("0.0");
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
          text: `Tip sent! You sent $${amount} to ${formatAddress(
            cleanRecipient
          )}. Show that love! 💙`,
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
          text:
            res.error ||
            "Your tip didn't go through. Check your balance and payment details, then try again.",
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setStatusMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[#1E2638] bg-[#121722] p-5 shadow-2xl sm:p-6">
      <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D2FF] to-transparent opacity-80" />
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            Send a Tip 💸
          </h2>
          <p className="mt-1 text-xs text-[#94A3B8]">
            A little love goes a long way.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="tip-recipient"
              className="text-xs font-medium text-[#94A3B8]"
            >
              Who are you tipping?
            </label>
            {initialRecipient && (
              <span className="text-[11px] text-[#00D2FF]">
                Link opened ✓
              </span>
            )}
          </div>
          <input
            id="tip-recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter payment address"
            autoComplete="off"
            className="w-full rounded-lg border border-[#1E2638] bg-[#0B0E14] px-3.5 py-2.5 text-sm text-white transition-all placeholder:text-[#475569] focus:border-[#00D2FF] focus:outline-none"
            required
          />
        </div>
        {/* Amount */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="tip-amount"
              className="text-xs font-medium text-[#94A3B8]"
            >
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
              id="tip-amount"
              type="number"
              step="any"
              min="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.00"
              className="w-full rounded-lg border border-[#1E2638] bg-[#0B0E14] py-3 pl-8 pr-4 text-lg font-semibold text-white transition-all placeholder:text-[#475569] focus:border-[#00D2FF] focus:outline-none"
              required
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePreset(preset)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-all ${
                  amount === preset
                    ? "border-[#00D2FF] bg-[#00D2FF]/10 font-medium text-[#00D2FF]"
                    : "border-[#1E2638] bg-[#0B0E14] text-[#94A3B8] hover:border-[#334155] hover:text-white"
                }`}
              >
                ${Number(preset).toFixed(2)}
              </button>
            ))}
          </div>
        </div>
        {/* Optional note */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="tip-memo"
              className="text-xs font-medium text-[#94A3B8]"
            >
              Add a note
              <span className="ml-1 text-[#64748B]">(optional)</span>
            </label>
            <span className="text-[10px] text-[#64748B]">
              {memo.length}/280
            </span>
          </div>
          <input
            id="tip-memo"
            type="text"
            maxLength={280}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="You're amazing! Keep going 💙"
            className="w-full rounded-lg border border-[#1E2638] bg-[#0B0E14] px-3.5 py-2.5 text-sm text-white transition-all placeholder:text-[#475569] focus:border-[#00D2FF] focus:outline-none"
          />
        </div>
        {/* Payment method */}
        <div className="pt-1">
          <div className="flex items-start justify-between gap-3 rounded-lg border border-[#1E2638] bg-[#0B0E14] p-3">
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#00D2FF]" />
              <div>
                <span className="block text-xs font-medium text-white">
                  {useContract
                    ? "Tip with a public note"
                    : "Standard payment"}
                </span>
                <span className="mt-1 block text-[10px] leading-relaxed text-[#64748B]">
                  {useContract
                    ? "Uses the tip contract. Your note may be publicly visible."
                    : "Sends a direct payment without the tip contract note."}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUseContract((current) => !current)}
              aria-pressed={useContract}
              className="shrink-0 rounded border border-[#1E2638] bg-[#182030] px-2.5 py-1 text-[11px] text-[#00D2FF] transition-colors hover:bg-[#1E2638]"
            >
              Switch
            </button>
          </div>
        </div>
        {/* Payment disclosure */}
        <div className="flex items-start gap-2.5 rounded-lg border border-[#1E2638]/70 bg-[#0B0E14]/60 p-3 text-[11px] text-[#94A3B8]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#00D2FF]" />
          <p>
            Check the recipient and amount before sending. Network fees may
            apply. Notes sent with a public payment may be visible to others.
          </p>
        </div>
        {/* Status */}
        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
              statusMessage.type === "success"
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                : statusMessage.type === "error"
                  ? "border-red-500/40 bg-red-950/40 text-red-300"
                  : "border-[#00D2FF]/40 bg-cyan-950/40 text-[#00D2FF]"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : statusMessage.type === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
            )}
            <div className="space-y-1">
              <div>{statusMessage.text}</div>
              {statusMessage.txHash && (
                <a
                  href={getTxUrl(statusMessage.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 pt-0.5 text-[11px] text-white hover:underline"
                >
                  <span>View payment details</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
            loading
              ? "cursor-not-allowed bg-[#1E2638] text-[#94A3B8]"
              : "bg-gradient-to-r from-[#00D2FF] to-[#2775CA] font-bold text-[#0B0E14] shadow-lg shadow-[#00D2FF]/20 hover:opacity-95 active:scale-[0.99]"
          }`}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#94A3B8] border-t-transparent" />
              <span>Sending your tip...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send ${amount} {memo ? "💙" : "Tip 💸"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
