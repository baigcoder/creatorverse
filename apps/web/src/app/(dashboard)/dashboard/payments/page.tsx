'use client';

import { CreditCard, DollarSign, RefreshCcw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrders, useRefund } from '@/hooks/use-payments';

function money(value: number | string | undefined, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value ?? 0));
}

export default function PaymentsPage() {
  const { data: orders = [], isLoading, isError, error } = useOrders();
  const refund = useRefund();
  const completedRevenue = orders
    .filter((order) => order.status === 'COMPLETED')
    .reduce((sum, order) => sum + Number(order.amount), 0);
  const pending = orders.filter((order) => order.status === 'PENDING').length;
  const refunded = orders.reduce((sum, order) => sum + (order.refunds?.length ?? 0), 0);

  async function requestRefund(orderId: string) {
    if (!confirm('Create a refund request for this order?')) return;
    try {
      await refund.mutateAsync({ orderId, data: { reason: 'Creator dashboard refund request' } });
      toast.success('Refund request created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Refund request failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track orders, provider status, refunds, and payout risk.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <ShieldCheck className="h-4 w-4 text-mango-500" />
          Webhooks verified
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Completed revenue', value: money(completedRevenue), icon: DollarSign },
          { label: 'Pending orders', value: String(pending), icon: CreditCard },
          { label: 'Refund records', value: String(refunded), icon: RefreshCcw },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <metric.icon className="h-5 w-5 text-mango-500" />
              <p className="mt-3 text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {error instanceof Error ? error.message : 'Orders could not be loaded.'}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="font-medium text-foreground">No orders yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Checkout activity will appear here after learners buy courses, products, or memberships.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-3 pr-4">Order</th>
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Provider</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/70 last:border-0">
                      <td className="py-4 pr-4">
                        <p className="font-medium text-foreground">{order.id.slice(0, 10)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="py-4 pr-4">{order.orderType}</td>
                      <td className="py-4 pr-4 font-medium text-foreground">{money(order.amount, order.currency)}</td>
                      <td className="py-4 pr-4">{order.paymentProvider ?? 'Manual'}</td>
                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-foreground">{order.status}</span>
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={order.status !== 'COMPLETED' || refund.isPending}
                          onClick={() => requestRefund(order.id)}
                        >
                          Refund
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
