'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Plus, ShoppingBag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateProduct, useProducts } from '@/hooks/use-payments';
import { useMediaAssets } from '@/hooks/use-media';

const schema = z.object({
  title: z.string().min(3, 'Product title is required'),
  type: z.enum(['EBOOK', 'TEMPLATE', 'DOWNLOAD', 'COACHING', 'BUNDLE']),
  price: z.coerce.number().min(0, 'Price must be positive'),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function money(value: number | string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value));
}

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: products = [], isLoading, isError, error } = useProducts({ limit: 24 });
  const mediaAssets = useMediaAssets({ page: 1, limit: 12 });
  const createProduct = useCreateProduct();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', type: 'DOWNLOAD', price: 29, description: '', fileUrl: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createProduct.mutateAsync({
        ...values,
        fileUrl: values.fileUrl || undefined,
        status: 'PUBLISHED',
      });
      toast.success('Product published');
      form.reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Product creation failed');
    }
  }

  const revenueProxy = products.reduce((sum, product) => sum + Number(product.price), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Digital Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sell downloads, templates, coaching calls, and bundles through checkout.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm((value) => !value)}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New product</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
              <Input label="Title" {...form.register('title')} error={form.formState.errors.title?.message} />
              <label className="space-y-1.5 text-sm font-medium text-foreground">
                Type
                <select className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" {...form.register('type')}>
                  <option value="DOWNLOAD">Download</option>
                  <option value="EBOOK">E-book</option>
                  <option value="TEMPLATE">Template</option>
                  <option value="COACHING">Coaching</option>
                  <option value="BUNDLE">Bundle</option>
                </select>
              </label>
              <Input label="Price" type="number" step="0.01" {...form.register('price')} error={form.formState.errors.price?.message} />
              <Input label="File URL" {...form.register('fileUrl')} error={form.formState.errors.fileUrl?.message} />
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium text-foreground">Attach from media library</p>
                {mediaAssets.isLoading ? (
                  <div className="h-16 animate-pulse rounded-xl bg-muted" />
                ) : mediaAssets.data?.data.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {mediaAssets.data.data.slice(0, 6).map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => {
                          form.setValue('fileUrl', asset.url || asset.key, { shouldDirty: true });
                          toast.success('Media attached to product file field');
                        }}
                        className="rounded-xl border p-3 text-left text-sm transition hover:bg-muted dark:border-border-dark"
                      >
                        <span className="block truncate font-medium">{asset.filename}</span>
                        <span className="block truncate text-xs text-muted-foreground">{asset.key}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground dark:border-border-dark">
                    Upload assets in Media Library to attach protected downloads here.
                  </p>
                )}
              </div>
              <div className="md:col-span-2"><Input label="Description" {...form.register('description')} /></div>
              <div className="md:col-span-2"><Button type="submit" disabled={createProduct.isPending}>{createProduct.isPending ? 'Publishing...' : 'Publish product'}</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6"><Package className="h-5 w-5 text-mango-500" /><p className="mt-3 text-sm text-muted-foreground">Products</p><p className="mt-1 text-2xl font-bold">{products.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><ShoppingBag className="h-5 w-5 text-accent-purple" /><p className="mt-3 text-sm text-muted-foreground">Catalog value</p><p className="mt-1 text-2xl font-bold">{money(revenueProxy)}</p></CardContent></Card>
        <Card><CardContent className="p-6"><Package className="h-5 w-5 text-accent-cyan" /><p className="mt-3 text-sm text-muted-foreground">Published</p><p className="mt-1 text-2xl font-bold">{products.filter((product) => product.status === 'PUBLISHED').length}</p></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />)}</div>
      ) : isError ? (
        <Card><CardContent className="p-6 text-sm text-red-600">{error instanceof Error ? error.message : 'Products could not be loaded.'}</CardContent></Card>
      ) : products.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-10 text-center"><p className="font-medium">No digital products yet</p><p className="mt-1 text-sm text-muted-foreground">Add a product to start selling templates, downloads, or coaching calls.</p></CardContent></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">{product.type}</span>
                <h2 className="mt-3 text-lg font-bold text-foreground">{product.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description || 'Digital product ready for checkout.'}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-bold text-foreground">{money(product.price, product.currency)}</span>
                  <span className="text-xs text-muted-foreground">{product.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
