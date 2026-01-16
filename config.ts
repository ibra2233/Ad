
/**
 * LogiTrack Configuration
 */

export const DB_CONFIG = {
  enabled: true,
  // رابط المشروع
  url: 'https://zdcngosnxowrycqtmvkt.supabase.co',
  
  // المفتاح العام (Public/Anon) - يستخدم لتتبع الشحنات من قبل الزبائن
  publishableKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY25nb3NueG93cnljcXRtdmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDMzODYsImV4cCI6MjA4NDA3OTM4Nn0.rk7uRggTf_1qViBDrrYqooveENckIYZYkuL0DqEfeeo',

  /**
   * المفتاح السري (Service Role Key)
   * تجده في: Project Settings > API > service_role (secret)
   * استخدامه ضروري إذا كانت قاعدة البيانات محمية بـ RLS.
   * إذا تركت هذا الحقل فارغاً، سيحاول التطبيق استخدام المفتاح العام أعلاه.
   */
  secretKey: ''
};

// كلمة مرور الدخول للوحة الإدارة في التطبيق
export const ADMIN_PASSWORD = '123'; 

// وضع التطبيق الحالي
export const APP_TYPE: 'admin' | 'customer' = 'ADMIN';
