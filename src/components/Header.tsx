
"use client";

import React from "react";
import { formatAddress, formatUsdc } from "@/lib/format";
import { Wallet } from "lucide-react";

interface HeaderProps {
  account: string | null;
  balance: bigint | null;
  chainId: number | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchNetwork: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  account,
  balance,
  chainId,
  onConnect,
  onDisconnect,
  onSwitchNetwork,
}) => {
  const isArc = chainId === 5042;

  return (
    <header className="w-full border-b border-[#1E2638] bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 min-h-16 flex items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-[#00D2FF] to-[#2775CA] flex items-center justify-center shadow-lg shadow-[#00D2FF]/20">
            <span className="text-[#0B0E14] font-black text-lg">💸</span>
          </div>
          <div className="min-w-0">
            <span className="font-bold text-lg tracking-tight text-white">
              MonYuny Tip
            </span>
            <p className="text-[11px] text-[#94A3B8]">
              Send love. Get tipped.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {account ? (
            <>
              <button
                type="button"
                onClick={onSwitchNetwork}
                title="Update payment connection"
                className={`hidden sm:flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-all ${
                  isArc
                    ? "bg-[#121722] border-[#1E2638] text-white"
                    : "bg-amber-950/40 border-amber-600/50 text-amber-300"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  isArc ? "bg-emerald-400" : "bg-amber-400"
                }`} />
                {isArc ? "Payments ready" : "Fix payment setup"}
              </button>

              <div className="flex items-center gap-2 bg-[#121722] border border-[#1E2638] rounded-lg p-1 pl-2 sm:pl-3">
                <div className="flex flex-col items-end pr-1">
                  <span className="text-xs font-semibold text-white">
                    ${formatUsdc(balance)}
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">
                    {formatAddress(account)}
                  </span>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-2 py-1.5 text-xs rounded bg-[#182030] hover:bg-red-950/40 hover:text-red-400 text-[#94A3B8] transition-colors"
                  title="Disconnect account"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onConnect}
              className="flex items-center gap-2 bg-[#00D2FF] hover:bg-[#38bdf8] text-[#0B0E14] font-semibold text-xs px-3 sm:px-4 py-2.5 rounded-lg transition-all active:scale-95 shadow-md shadow-[#00D2FF]/20"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
