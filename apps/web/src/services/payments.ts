import apiFetch from '@/lib/api-client';

export type OrderType = 'COURSE' | 'WORKSHOP' | 'MEMBERSHIP' | 'PRODUCT';
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | string;
export type PaymentProvider = 'STRIPE' | 'RAZORPAY';

export type CheckoutRequest = {
  orderType: OrderType;
  referenceId: string;
  amount?: number;
  currency?: string;
  discountAmount?: number;
  couponId?: string;
  affiliateId?: string;
  paymentProvider?: PaymentProvider;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, unknown>;
};

export type Order = {
  id: string;
  orderType: OrderType;
  referenceId: string;
  amount: number | string;
  currency: string;
  discountAmount?: number | string;
  status: OrderStatus;
  paymentProvider?: PaymentProvider | null;
  providerPaymentId?: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  payments?: Array<{ id: string; status: string; amount: number | string; provider: string }>;
  refunds?: Array<{ id: string; status: string; amount: number | string; reason?: string | null }>;
};

export type CheckoutResult = {
  mode: 'provider_redirect' | 'dev_pending' | 'razorpay_order';
  order: Order;
  checkoutUrl: string | null;
  providerSessionId?: string;
  provider?: PaymentProvider;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  message?: string;
};

export type MembershipPlan = {
  id: string;
  creatorId: string;
  name: string;
  description?: string | null;
  price: number | string;
  currency: string;
  interval: 'MONTHLY' | 'YEARLY';
  benefits: string[];
  communityAccess: boolean;
  courseIds: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  createdAt: string;
  creator?: { id: string; brandName: string; logoUrl?: string | null; slug?: string | null };
};

export type Product = {
  id: string;
  creatorId: string;
  type: 'EBOOK' | 'TEMPLATE' | 'DOWNLOAD' | 'COACHING' | 'BUNDLE' | string;
  title: string;
  slug: string;
  description?: string | null;
  price: number | string;
  currency: string;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | string;
  createdAt: string;
  creator?: { id: string; brandName: string; logoUrl?: string | null };
};

export type ProductDownload = {
  orderId: string;
  orderStatus: OrderStatus;
  purchasedAt: string;
  amount: number | string;
  currency: string;
  product: Omit<Product, 'fileUrl'>;
  downloadKey: string | null;
  access: 'READY' | 'NO_FILE' | 'PENDING_PAYMENT' | string;
};

export type CouponValidationResult = {
  valid: boolean;
  coupon?: {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number | string;
  };
  reason?: string;
};

export type ProductListParams = { page?: number; limit?: number; creatorId?: string };

function toQuery(params?: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  return query.toString();
}

export const paymentsApi = {
  checkout: (data: CheckoutRequest) =>
    apiFetch<CheckoutResult>('/payments/checkout', { method: 'POST', body: JSON.stringify(data) }),

  orders: (page = 1, limit = 20) =>
    apiFetch<Order[]>(`/orders?page=${page}&limit=${limit}`),

  refund: (orderId: string, data?: { amount?: number; reason?: string }) =>
    apiFetch(`/orders/${orderId}/refund`, { method: 'POST', body: JSON.stringify(data || {}) }),

  verifyRazorpay: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    apiFetch<Order>('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(data) }),
};

export const membershipsApi = {
  list: (creatorId?: string) =>
    apiFetch<MembershipPlan[]>(`/memberships${creatorId ? `?creatorId=${creatorId}` : ''}`),

  get: (id: string) =>
    apiFetch<MembershipPlan>(`/memberships/${id}`),

  create: (data: {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    interval?: 'MONTHLY' | 'YEARLY';
    benefits?: string[];
    communityAccess?: boolean;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  }) => apiFetch<MembershipPlan>('/memberships', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<MembershipPlan>) =>
    apiFetch<MembershipPlan>(`/memberships/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  subscribe: (id: string) =>
    apiFetch(`/memberships/${id}/subscribe`, { method: 'POST' }),

  cancel: (id: string) =>
    apiFetch(`/subscriptions/${id}`, { method: 'DELETE' }),
};

export const productsApi = {
  list: (params?: ProductListParams) => {
    const query = toQuery(params);
    return apiFetch<Product[]>(`/products${query ? `?${query}` : ''}`);
  },

  get: (id: string) =>
    apiFetch<Product>(`/products/${id}`),

  create: (data: {
    type: Product['type'];
    title: string;
    description?: string;
    price?: number;
    currency?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  }) => apiFetch<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Product>) =>
    apiFetch<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  myDownloads: () =>
    apiFetch<ProductDownload[]>('/products/my-downloads'),

  delete: (id: string) =>
    apiFetch(`/products/${id}`, { method: 'DELETE' }),
};

export const couponsApi = {
  list: () =>
    apiFetch<any[]>('/coupons'),

  create: (data: any) =>
    apiFetch<any>('/coupons', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    apiFetch<any>(`/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch(`/coupons/${id}`, { method: 'DELETE' }),

  validate: (code: string, applicableType?: string, applicableId?: string) =>
    apiFetch<CouponValidationResult>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, applicableType, applicableId }) }),
};
