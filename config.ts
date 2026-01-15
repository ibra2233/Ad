
/**
 * LogiTrack Master Configuration
 */

// 1. حدد نوع التطبيق للنسخة الحالية
export const APP_TYPE: 'USER' | 'ADMIN' | 'DRIVER' = 'ADMIN'; 

// 2. إعدادات قاعدة البيانات (Supabase)
// config.ts

export const DB_CONFIG = {
  enabled: true, // فعل الاتصال بالقاعدة
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zdcngosnxowrycqtmvkt.supabase.co', // رابط Supabase
  key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_secret_BpHP_l0zIXG6NWh6ViTyYQ_TvKaEuoy', // المفتاح
};
