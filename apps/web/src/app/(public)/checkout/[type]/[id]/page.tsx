'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Tag, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCourse } from '@/hooks/use-courses';
import { useMembership, useProduct, useCheckout, useValidateCoupon } from '@/hooks/use-payments';
import { useWorkshop } from '@/hooks/use-workshops';
import { normalizeCheckoutType } from '@/lib/checkout';

function money(value: number | string | undefined, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value ?? 0));
}

export default function CheckoutPage() {
  const params = useParams<{ type: string; id: string }>();
  const orderType = normalizeCheckoutType(params.type);
  const id = params.id;
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discountType: string; discountValue: number } | null>(null);

  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = Ready, 1 = Processing, 2 = Complete
  const [pendingMessage, setPendingMessage] = useState('');

  const course = useCourse(orderType === 'COURSE' ? id : '');
  const workshop = useWorkshop(orderType === 'WORKSHOP' ? id : '');
  const membership = useMembership(orderType === 'MEMBERSHIP' ? id : '');
  const product = useProduct(orderType === 'PRODUCT' ? id : '');
  const validateCoupon = useValidateCoupon();
  const checkout = useCheckout();

  const item = useMemo(() => {
    const source = orderType === 'COURSE' ? course.data : orderType === 'WORKSHOP' ? workshop.data : orderType === 'MEMBERSHIP' ? membership.data : product.data;
    if (!source) return null;
    return {
      title: 'title' in source ? source.title : source.name,
      description: source.description,
      price: Number(source.price ?? 0),
      currency: source.currency ?? 'USD',
    };
  }, [course.data, membership.data, orderType, product.data, workshop.data]);

  const isLoading = course.isLoading || workshop.isLoading || membership.isLoading || product.isLoading;
  const isError = course.isError || workshop.isError || membership.isError || product.isError;
  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'PERCENTAGE'
      ? (item?.price ?? 0) * (appliedCoupon.discountValue / 100)
      : appliedCoupon.discountValue
    : 0;
  const total = Math.max(0, (item?.price ?? 0) - discount);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    try {
      const result = await validateCoupon.mutateAsync({ code: couponCode.trim(), applicableType: orderType, applicableId: id });
      if (!result.valid || !result.coupon) {
        toast.error(result.reason ?? 'Coupon is not valid for this item');
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({
        id: result.coupon.id,
        code: result.coupon.code,
        discountType: result.coupon.discountType,
        discountValue: Number(result.coupon.discountValue),
      });
      toast.success('Coupon applied');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Coupon validation failed');
    }
  }

  async function startCheckout() {
    if (!item) return;
    setCheckoutStep(1); // Start compiling check
    try {
      const result = await checkout.mutateAsync({
        orderType,
        referenceId: id,
        amount: total,
        currency: item.currency,
        discountAmount: discount,
        couponId: appliedCoupon?.id,
        paymentProvider: 'STRIPE',
      });
      if (result.mode === 'provider_redirect' && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result.mode === 'razorpay_order') {
        setCheckoutStep(2);
        setPendingMessage('Razorpay order created. Complete payment in the configured Razorpay client to unlock access.');
        toast.success('Razorpay order created');
        return;
      }
      setCheckoutStep(2);
      setPendingMessage(result.message ?? 'Development pending order created. Configure a payment provider to complete checkout.');
      toast.success('Development pending order created');
    } catch (err) {
      setCheckoutStep(0);
      toast.error(err instanceof Error ? err.message : 'Checkout failed');
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-snow py-12 px-4 dark:bg-midnight text-foreground">
      {/* Background Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.03] dark:bg-[radial-gradient(#ffffff_1px,transparent_1px)] dark:opacity-[0.02]" />

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Navigation link */}
        <Link href="/" className="inline-block rounded border-2 border-border bg-card px-3 py-1 font-display font-black text-md shadow-[-3px_3px_0px_rgba(28,28,28,1)] dark:bg-midnight-soft hover:-translate-y-0.5 transition-all">
          ← CANCEL CHECKOUT
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Form Side */}
          <section className="space-y-6">
            <div>
              <span className="inline-block rounded border-2 border-border bg-mango px-2.5 py-0.5 font-retro text-xs font-bold text-border shadow-[-1.5px_1.5px_0px_rgba(28,28,28,1)]">
                SECURE TRANSACTION OVERLAY
              </span>
              <h1 className="mt-3 font-display text-3xl font-black uppercase sm:text-5xl leading-none">
                SECURE TERMINAL CHECKOUT
              </h1>
              <p className="mt-2 text-md font-medium text-muted-foreground">
                Enter your billing details to execute transaction sequence and compile instant access to modules.
              </p>
            </div>

            {/* Provider handoff */}
            <Card className="border-3 border-border shadow-[-4px_4px_0px_rgba(28,28,28,1)] bg-card dark:bg-midnight-raised relative overflow-hidden">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="font-display text-lg font-black uppercase">
                  PAYMENT PROVIDER HANDOFF
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="rounded-xl border-2 border-border bg-muted p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-success-dark dark:text-success" />
                    <div>
                      <p className="font-display text-sm font-black uppercase text-foreground">No card data is collected here</p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        Payment details are entered only on Stripe or Razorpay after a provider session is created. If provider keys are missing, this page creates a dev-only pending order without granting access.
                      </p>
                    </div>
                  </div>
                </div>
                {checkoutStep === 2 && pendingMessage && (
                  <div className="mt-4 rounded-xl border-2 border-mango bg-mango/10 p-4 text-sm font-semibold text-foreground">
                    {pendingMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Checkout Summary Side */}
          <aside className="space-y-6">
            {/* ITEM SUMMARY CARD */}
            <Card className="border-3 border-border bg-card shadow-[-4px_4px_0px_rgba(28,28,28,1)] dark:bg-midnight-raised">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="font-display text-lg font-black uppercase">
                  📦 MODULE DETAILS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-3">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </div>
                ) : isError || !item ? (
                  <div className="rounded border-2 border-red-500 bg-red-50 dark:bg-red-950 p-4 text-xs font-bold text-red-700 dark:text-red-400 uppercase font-retro tracking-wide">
                    COMPILE ERROR: COULD NOT ACQUIRE ITEM DETAILS
                  </div>
                ) : (
                  <div>
                    <span className="inline-block rounded border border-border bg-cyan/20 px-2 py-0.5 font-retro text-[10px] font-black text-cyan-500 uppercase">
                      {orderType} // VERIFIED
                    </span>
                    <h2 className="mt-3 font-display text-2xl font-black uppercase leading-tight">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">
                      {item.description || 'Secure purchase on CreatorVerse Y2K'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TRANSACTION BILLING BOX */}
            <Card className="border-3 border-border bg-card shadow-[-4px_4px_0px_rgba(28,28,28,1)] dark:bg-midnight-raised sticky top-6">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="font-display text-lg font-black uppercase">
                  📋 CHARGING MATRIX
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between font-retro text-sm font-black">
                  <span className="text-muted-foreground">SUBTOTAL</span>
                  <span>{money(item?.price, item?.currency)}</span>
                </div>
                <div className="flex justify-between font-retro text-sm font-black border-b border-border/20 pb-3">
                  <span className="text-muted-foreground">DISCOUNTS</span>
                  <span className="text-success-dark dark:text-success">-{money(discount, item?.currency)}</span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between font-display text-2xl font-black uppercase">
                    <span>NET TOTAL</span>
                    <span className="text-transparent bg-clip-text gradient-hero font-extrabold">{money(total, item?.currency)}</span>
                  </div>
                </div>

                {/* Coupon input */}
                <div className="flex gap-2">
                  <Input
                    aria-label="Coupon code"
                    placeholder="COUPON CODE"
                    className="border-2 border-border font-retro focus-visible:ring-violet uppercase font-black"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-border active:translate-y-[2px]"
                    disabled={validateCoupon.isPending}
                    onClick={applyCoupon}
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="font-retro text-xs font-bold text-success uppercase">
                    ★ COUPON APPLIED: {appliedCoupon.code}
                  </p>
                )}

                {/* Progress bar visual for checking */}
                <AnimatePresence>
                  {checkoutStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded border-2 border-mango bg-mango/10 p-3"
                    >
                      <div className="flex justify-between font-retro text-[10px] text-mango-600 dark:text-mango">
                        <span>COMPILING SECURE METADATA...</span>
                        <span>75% READY</span>
                      </div>
                      <div className="mt-1.5 h-3 w-full rounded border border-border bg-midnight p-0.5 overflow-hidden">
                        <motion.div
                          animate={{ width: ['0%', '100%'] }}
                          transition={{ duration: 1.5, ease: 'easeInOut' }}
                          className="h-full bg-mango rounded-sm shadow-md"
                          style={{ width: '75%' }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  className="w-full py-6 font-display font-black text-md tracking-wider border-2 border-border bg-violet text-white shadow-[-3px_3px_0px_rgba(28,28,28,1)] active:translate-y-[3px] active:-translate-x-[3px] active:shadow-none hover:shadow-[-5px_5px_0px_rgba(28,28,28,1)] hover:-translate-y-1 transition-all"
                  disabled={!item || checkout.isPending || checkoutStep === 1}
                  onClick={startCheckout}
                >
                  {checkoutStep === 1 ? 'PROCESSING TRANSACTION...' : 'EXECUTE PAYMENT SEQUENCE'}
                </Button>

                <div className="flex items-center justify-center gap-1.5 font-retro text-[9px] text-muted-foreground uppercase text-center font-bold">
                  <Lock className="h-3 w-3 text-mango" /> SECURE SSL ENCRYPTED GATEWAY DIRECT PIXEL
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
