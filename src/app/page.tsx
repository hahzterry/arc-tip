
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { TipCard } from "@/components/TipCard";
import { LinkGenerator } from "@/components/LinkGenerator";
import { ActivityFeed } from "@/components/ActivityFeed";
import { NetworkModal } from "@/components/NetworkModal";
import { QrModal } from "@/components/QrModal";
import { useArcWallet } from "@/lib/useArcWallet";
import {
  getArcNetworkStats,
  getGlobalTotalTips,
  getRecentTips,
  ArcNetworkStats,
  TipEvent,
} from "@/lib/rpc";
import { Zap } from "lucide-react";

export default function Home() {
  const {
    account,
    balance,
    chainId,
    connect,
    disconnect,
    switchNetwork,
    sendTip,
    refreshBalance,
  } = useArcWallet();

  const [stats, setStats] = useState<ArcNetworkStats | null>(null);
  const [totalTipsCount, setTotalTipsCount] = useState<bigint | null>(null);
  const [tips, setTips] = useState<TipEvent[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState({
    url: "",
    address: "",
  });

  const loadNetworkData = useCallback(async () => {
    setLoadingFeed(true);

    try {
      const [netStats, totalTips, recentTips] = await Promise.all([
        getArcNetworkStats(),
        getGlobalTotalTips(),
        getRecentTips(10),
      ]);

      setStats(netStats);
      setTotalTipsCount(totalTips);

      let localSessionTips: TipEvent[] = [];

      try {
        const stored = localStorage.getItem("arc_tip_local_history");

        if (stored) {
          localSessionTips = JSON.parse(stored);
        }
      } catch {
        // Ignore local history errors.
      }

      const seen = new Set<string>();
      const combined: TipEvent[] = [];

      for (const tip of [...localSessionTips, ...recentTips]) {
        if (!seen.has(tip.txHash.toLowerCase())) {
          seen.add(tip.txHash.toLowerCase());
          combined.push(tip);
        }
      }

      setTips(combined.slice(0, 15));
    } catch (err) {
      console.error("Error loading activity:", err);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    loadNetworkData();

    const interval = setInterval(loadNetworkData, 15_000);

    return () => clearInterval(interval);
  }, [loadNetworkData]);

  const handleOpenQr = (url: string, address: string) => {
    setQrData({ url, address });
    setQrModalOpen(true);
  };

  const handleSendTip = async (
    recipient: string,
    amountUsdc: string,
    memo: string,
    useContract: boolean
  ) => {
    const res = await sendTip(
      recipient,
      amountUsdc,
      memo,
      useContract
    );

    if (res.success && res.txHash && account) {
      const newTip: TipEvent = {
        from: account,
        to: recipient,
        amount: BigInt(
          Math.floor(parseFloat(amountUsdc) * 1e18)
        ),
        memo,
        txHash: res.txHash,
        blockNumber: stats?.blockNumber || 0n,
        timestamp: Date.now(),
      };

      try {
        const existing = JSON.parse(
          localStorage.getItem("arc_tip_local_history") || "[]"
        );

        const updated = [newTip, ...existing].slice(0, 20);

        localStorage.setItem(
          "arc_tip_local_history",
          JSON.stringify(updated, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        );
      } catch {
        // Ignore local history errors.
      }

      loadNetworkData();
      refreshBalance();
    }

    return res;
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col font-sans selection:bg-[#00D2FF]/20 selection:text-[#00D2FF]">
      <Header
        account={account}
        balance={balance}
        chainId={chainId}
        onConnect={connect}
        onDisconnect={disconnect}
        onSwitchNetwork={() => setNetworkModalOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121722] border border-[#1E2638] text-xs font-semibold text-[#00D2FF]">
            <Zap className="w-3.5 h-3.5" />
            <span>Small tips. Big love. 💸</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Send a Tip.
            <br />
            Get Paid.
            <br />
            Keep It Simple.
          </h1>

          <p className="text-sm sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Show love to your favorite creators, friends, and
            people doing their thing. Send a tip or make your
            own payment link in just a few taps.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
            <div className="p-4 rounded-xl bg-[#121722]/80 border border-[#1E2638]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#00D2FF]" />
                <span className="text-xs font-bold text-white uppercase">
                  Easy to Send
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Send a little something to someone who deserves it.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#121722]/80 border border-[#1E2638]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-white uppercase">
                  Your Own Link
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Make a link people can use to send you a tip.
                Share it anywhere.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#121722]/80 border border-[#1E2638]">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#2775CA]" />
                <span className="text-xs font-bold text-white uppercase">
                  See the Love
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Keep up with the latest tips and show some love
                back.
              </p>
            </div>
          </div>
        </section>

        {/* Send tips and create links */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <TipCard
              senderAddress={account}
              senderBalance={balance}
              onSendTip={handleSendTip}
            />

            <LinkGenerator
              currentAccount={account}
              onOpenQr={handleOpenQr}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <ActivityFeed
              stats={stats}
              totalTipsCount={totalTipsCount}
              tips={tips}
              loading={loadingFeed}
              onRefresh={loadNetworkData}
            />

            <div className="p-5 rounded-xl bg-[#121722] border border-[#1E2638] space-y-3">
              <h2 className="font-bold text-white text-sm">
                Made for Sharing 💙
              </h2>

              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Creators create. Friends show love. Everyone
                deserves an easy way to give and receive a little
                extra. MonYuny Tip makes it simple to send a tip
                or share a link to get one.
              </p>

              <p className="text-xs text-[#64748B] leading-relaxed">
                Before sending, check the recipient and amount.
                Payment availability, fees, and processing times
                may depend on your account and payment method.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Simple customer-facing footer */}
      <footer className="w-full border-t border-[#1E2638] bg-[#0B0E14] py-8 text-xs text-[#94A3B8]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-white tracking-tight text-sm">
            MonYuny Tip 💸
          </span>

          <span className="text-center">
            A little love goes a long way.
          </span>
        </div>
      </footer>

      {/* Existing payment configuration and QR modals */}
      <NetworkModal
        isOpen={networkModalOpen}
        onClose={() => setNetworkModalOpen(false)}
        onSwitch={switchNetwork}
      />

      <QrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={qrData.url}
        address={qrData.address}
      />
    </div>
  );
}
