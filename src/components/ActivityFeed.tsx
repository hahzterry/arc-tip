
"use client";

import React from "react";
import { formatAddress, formatUsdc, getTxUrl } from "@/lib/format";
import { TipEvent, ArcNetworkStats } from "@/lib/rpc";
import {
  Activity,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Gift,
} from "lucide-react";

interface ActivityFeedProps {
  stats: ArcNetworkStats | null;
  totalTipsCount: bigint | null;
  tips: TipEvent[];
  loading: boolean;
  onRefresh: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  totalTipsCount,
  tips,
  loading,
  onRefresh,
}) => {
  return (
    <div className="w-full bg-[#121722] border border-[#1E2638] rounded-xl p-5 sm:p-6 shadow-xl space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00D2FF]" />
            <h3 className="text-base font-bold text-white tracking-tight">
              The Love Feed 💙
            </h3>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh recent tips"
            aria-label="Refresh recent tips"
            className="p-1.5 rounded-lg bg-[#0B0E14] text-[#94A3B8] hover:text-white hover:bg-[#1E2638] transition-all border border-[#1E2638]"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-[#0B0E14] rounded-lg border border-[#1E2638]">
            <span className="text-xs text-[#94A3B8] block">
              Tips sent
            </span>
            <span className="text-2xl font-bold text-white block mt-1">
              {totalTipsCount !== null
                ? totalTipsCount.toString()
                : "—"}
            </span>
          </div>

          <div className="p-4 bg-[#0B0E14] rounded-lg border border-[#1E2638]">
            <span className="text-xs text-[#94A3B8] block">
              Recent activity
            </span>
            <span className="text-2xl font-bold text-[#00D2FF] block mt-1">
              {tips.length}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-[#94A3B8]">
            Recent tips
          </h4>
          <span className="text-[10px] text-[#64748B]">
            {loading ? "Updating..." : "Latest activity"}
          </span>
        </div>

        {tips.length === 0 ? (
          <div className="text-center py-8 bg-[#0B0E14] border border-[#1E2638] rounded-lg">
            <Gift className="w-8 h-8 text-[#334155] mx-auto mb-2" />
            <p className="text-sm text-white font-medium">
              No tips yet
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Be the first to show some love! 💸
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {tips.map((tip, idx) => (
              <div
                key={tip.txHash || idx}
                className="p-3 bg-[#0B0E14] border border-[#1E2638] hover:border-[#2775CA]/60 rounded-lg transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="text-xs text-[#94A3B8] block">
                      From {formatAddress(tip.from)}
                    </span>
                    <span className="text-xs text-[#00D2FF] block mt-1">
                      To {formatAddress(tip.to)}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                    +${formatUsdc(tip.amount)}
                  </span>
                </div>

                {tip.memo && (
                  <div className="flex items-start gap-1.5 text-xs text-[#CBD5E1] bg-[#121722] p-2 rounded border border-[#1E2638]/60 my-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#00D2FF] shrink-0 mt-0.5" />
                    <span className="break-words italic">
                      &quot;{tip.memo}&quot;
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-2 border-t border-[#1E2638]/40">
                  <span>
                    {tip.timestamp
                      ? new Date(tip.timestamp).toLocaleString()
                      : "Recent tip"}
                  </span>

                  {tip.txHash && (
                    <a
                      href={getTxUrl(tip.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#94A3B8] hover:text-[#00D2FF] flex items-center gap-1 transition-colors"
                    >
                      <span>Payment details</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
