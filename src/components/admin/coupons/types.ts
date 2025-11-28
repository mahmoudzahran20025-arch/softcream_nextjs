// src/components/admin/coupons/types.ts
import type { Coupon } from '@/lib/admin';

export interface CouponsPageProps {
  coupons: Coupon[];
  onCreate: (data: CouponFormData) => Promise<boolean>;
  onToggle: (code: string) => Promise<void>;
  onUpdate: (code: string, data: CouponFormData) => Promise<boolean>;
  onDelete: (code: string) => Promise<boolean>;
}

export interface CouponCardProps {
  coupon: Coupon;
  onToggle: (code: string) => void;
  onEdit: (coupon: Coupon) => void;
  onDelete: (code: string) => void;
  onViewStats: (code: string) => void;
}

export interface CreateCouponModalProps {
  onClose: () => void;
  onCreate: (data: CouponFormData) => Promise<boolean>;
}

export interface EditCouponModalProps {
  coupon: Coupon;
  onClose: () => void;
  onUpdate: (code: string, data: CouponFormData) => Promise<boolean>;
}

export interface StatsModalProps {
  code: string;
  onClose: () => void;
}

export interface CouponFormData {
  code?: string;
  name: string;
  discountPercent: number;
  discountPercentChild: number;
  discountPercentSecond: number;
  maxUses: number;
  validDays: number;
  minOrder: number;
  active?: boolean;
  messageAr: string;
  messageEn: string;
}

export interface CouponStats {
  totalUses: number;
  maxUses: number;
  remainingUses: number;
  totalDiscount: number;
  usageBreakdown?: Array<{
    usage_type: string;
    count: number;
    total_discount?: number;
  }>;
  usageHistory?: Array<{
    id: string | number;
    used_at: number;
    customer_name?: string;
    user_phone: string;
    usage_type: string;
    discount_applied: number;
    order_total?: number;
  }>;
}

export const INITIAL_COUPON_FORM: CouponFormData = {
  code: '',
  name: '',
  discountPercent: 50,
  discountPercentChild: 35,
  discountPercentSecond: 25,
  maxUses: 10,
  validDays: 7,
  minOrder: 0,
  active: true,
  messageAr: '',
  messageEn: ''
};
