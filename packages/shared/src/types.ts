export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CREATOR' | 'LEARNER' | 'AFFILIATE';

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type LessonType = 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

export type WorkshopStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export type MeetingProvider = 'ZOOM' | 'GOOGLE_MEET' | 'WEBEX' | 'CUSTOM';

export type CommunityVisibility = 'PUBLIC' | 'PRIVATE' | 'PAID';

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
export type MembershipInterval = 'MONTHLY' | 'YEARLY';

export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'STRIPE' | 'RAZORPAY' | 'PAYPAL';
export type OrderType = 'COURSE' | 'WORKSHOP' | 'MEMBERSHIP' | 'PRODUCT';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export type AIConversationType = 'TUTOR' | 'COPILOT';

export type NotificationType =
  | 'ENROLLMENT'
  | 'PAYMENT'
  | 'CERTIFICATE'
  | 'WORKSHOP_REMINDER'
  | 'COMMUNITY_MENTION'
  | 'STREAK'
  | 'ACHIEVEMENT'
  | 'ANNOUNCEMENT';

export type ProductType = 'EBOOK' | 'TEMPLATE' | 'DOWNLOAD' | 'COACHING' | 'BUNDLE';

export type BadgeType = 'COURSE_COMPLETION' | 'STREAK' | 'COMMUNITY' | 'WORKSHOP' | 'CHALLENGE' | 'SPECIAL';

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface CreatorProfileDTO {
  id: string;
  userId: string;
  brandName: string;
  bio: string | null;
  logoUrl: string | null;
  customDomain: string | null;
  verified: boolean;
}

export interface CourseDTO {
  id: string;
  creatorId: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  currency: string;
  status: CourseStatus;
  level: CourseLevel;
  language: string;
  totalDuration: number;
  publishedAt: string | null;
  createdAt: string;
}

export interface CourseSectionDTO {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: LessonDTO[];
}

export interface LessonDTO {
  id: string;
  sectionId: string;
  title: string;
  type: LessonType;
  videoUrl: string | null;
  isPreview: boolean;
  duration: number;
  order: number;
}

export interface EnrollmentDTO {
  id: string;
  courseId: string;
  progress: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
}

export interface DashboardStatsDTO {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  revenueChange: number;
  studentsChange: number;
  recentSales: Array<{
    id: string;
    studentName: string;
    amount: number;
    courseName: string;
    date: string;
  }>;
  coursePerformance: Array<{
    id: string;
    title: string;
    enrollments: number;
    revenue: number;
    completionRate: number;
  }>;
}