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

// ==========================================
// 🎯 Updated Form Data - v2 Coupon System
// ==========================================

export type DiscountType = 'percent' | 'fixed_amount' | 'free_delivery' | 'free_item';
export type RestrictionType = 'none' | 'prefix' | 'phone' | 'company' | 'both';

export interface CouponFormData {
  // Basic Info
  code?: string;
  name: string;
  
  // Discount Settings (v2)
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number | null;
  
  // Usage Limits
  maxUsesTotal?: number | null;
  maxUsesPerUser: number;
  minOrder: number;
  validDays: number;
  
  // User Restrictions (NEW!)
  firstOrderOnly: boolean;
  requiresRegistration: boolean;
  
  // Phone Restrictions
  restrictionType: RestrictionType;
  restrictedPrefixes?: string[];
  restrictedCompany?: string;
  restrictedPhone?: string;
  
  // Status
  active?: boolean;
  
  // Messages
  messageAr: string;
  messageEn: string;
  successMessageAr?: string;
  successMessageEn?: string;
  
  // Free Item (for free_item type)
  freeItemProductId?: string;
  freeItemNameAr?: string;
  freeItemNameEn?: string;
}

export interface CouponStats {
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  status: string;
  totalUses: number;
  maxUsesTotal: number | null;
  maxUsesPerUser: number;
  remainingUses: number | string;
  validFrom: string;
  validTo: string;
  restrictionType: string;
  usageBreakdown?: Array<{
    discount_type: string;
    count: number;
    total_discount?: number;
  }>;
  usageHistory?: Array<{
    id: string | number;
    used_at: number;
    user_phone: string;
    discount_applied: number;
    order_id?: string;
  }>;
}

// ==========================================
// Initial Form Values
// ==========================================

export const INITIAL_COUPON_FORM: CouponFormData = {
  code: '',
  name: '',
  discountType: 'percent',
  discountValue: 20,
  maxDiscount: null,
  maxUsesTotal: null,
  maxUsesPerUser: 1,
  minOrder: 0,
  validDays: 7,
  firstOrderOnly: false,
  requiresRegistration: false,
  restrictionType: 'none',
  restrictedPrefixes: [],
  restrictedCompany: '',
  restrictedPhone: '',
  active: true,
  messageAr: '',
  messageEn: '',
  successMessageAr: '',
  successMessageEn: ''
};

// ==========================================
// Helper Functions
// ==========================================

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, { ar: string; en: string; icon: string }> = {
  percent: { ar: 'نسبة مئوية', en: 'Percentage', icon: '%' },
  fixed_amount: { ar: 'مبلغ ثابت', en: 'Fixed Amount', icon: '💰' },
  free_delivery: { ar: 'توصيل مجاني', en: 'Free Delivery', icon: '🚚' },
  free_item: { ar: 'منتج مجاني', en: 'Free Item', icon: '🎁' }
};

export const RESTRICTION_TYPE_LABELS: Record<RestrictionType, { ar: string; en: string }> = {
  none: { ar: 'للجميع', en: 'Everyone' },
  prefix: { ar: 'شركة اتصالات', en: 'Telecom Prefix' },
  phone: { ar: 'رقم محدد', en: 'Specific Phone' },
  company: { ar: 'شركة', en: 'Company' },
  both: { ar: 'مزيج', en: 'Combined' }
};

export const TELECOM_PREFIXES = [
  { value: '010', label: 'فودافون (010)' },
  { value: '011', label: 'اتصالات (011)' },
  { value: '012', label: 'أورانج (012)' },
  { value: '015', label: 'وي (015)' }
];
