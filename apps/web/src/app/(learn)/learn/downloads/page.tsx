'use client';

import { Download, FileArchive, Loader2, Lock, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSignedMediaUrl } from '@/hooks/use-media';
import { useProductDownloads } from '@/hooks/use-payments';
import { motion } from 'framer-motion';
import Link from 'next/link';

function money(value: number | string, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value));
}

export default function LearnerDownloadsPage() {
  const downloads = useProductDownloads();
  const signedUrl = useSignedMediaUrl();

  async function openDownload(key: string | null) {
    if (!key) return;
    try {
      const result = await signedUrl.mutateAsync(key);
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Download access could not be verified');
    }
  }

  return (
    <div className="space-y-10">
      {/* ── Header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Floppy Drive
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Download your purchased digital assets, guides, and project templates.
          </p>
        </div>
        <Link
          href="/learn"
          className="mt-3 md:mt-0 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:bg-white/[0.08]"
        >
          Back to Hub
        </Link>
      </motion.div>

      {/* ── Downloads Grid ────────────────────────────── */}
      {downloads.isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : downloads.isError ? (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-8 text-center text-sm font-medium text-error">
          Your product library could not be loaded.
        </div>
      ) : downloads.data?.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {downloads.data.map((item, index) => {
            const ready = item.access === 'READY';
            const pending = item.access === 'PENDING_PAYMENT';
            return (
              <motion.div
                key={item.orderId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-violet/20 hover:shadow-[0_0_30px_rgba(255,0,184,0.08)] overflow-hidden transition-all duration-300"
              >
                <div>
                  <div className="bg-gradient-to-r from-violet/10 to-cyan/10 border-b border-white/[0.06] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">CV-Floppy v1.0</span>
                      <div className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
                    </div>
                    <h3 className="flex items-center gap-2 font-display text-base font-bold text-white mt-3">
                      {ready ? <FileArchive className="h-4 w-4 text-violet" /> : <Lock className="h-4 w-4 text-slate-500" />}
                      <span className="line-clamp-1">{item.product.title}</span>
                    </h3>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {item.product.description || 'Digital product asset cartridge.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span className="rounded bg-white/[0.06] border border-white/5 px-2 py-0.5">{item.orderStatus}</span>
                      <span className="rounded bg-white/[0.06] border border-white/5 px-2 py-0.5 text-cyan">{money(item.amount, item.currency)}</span>
                      <span>{new Date(item.purchasedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  {ready ? (
                    <Button 
                      className="w-full rounded-xl bg-gradient-to-r from-violet to-cyan text-white hover:scale-[1.02] transition-transform font-semibold text-xs py-2 h-auto gap-2" 
                      disabled={signedUrl.isPending} 
                      onClick={() => openDownload(item.downloadKey)}
                    >
                      {signedUrl.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      Download Asset
                    </Button>
                  ) : pending ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs uppercase tracking-wide text-slate-500 bg-white/[0.01]">
                      Payment is pending. Complete checkout to activate download drive.
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs uppercase tracking-wide text-slate-500 bg-white/[0.01]">
                      No downloadable resources uploaded by creator.
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-slate-500" />
          <p className="mt-4 font-display text-lg font-bold text-white">Your drive is empty</p>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            You haven&apos;t purchased any digital guides, templates, or media assets yet.
          </p>
        </div>
      )}
    </div>
  );
}
