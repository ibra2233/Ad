
/**
 * LogiTrack Master Configuration
 */

// 1. حدد نوع التطبيق للنسخة الحالية
export const APP_TYPE: 'USER' | 'ADMIN' | 'DRIVER' = 'ADMIN'; 

// 2. إعدادات قاعدة البيانات (Supabase)
export const DB_CONFIG = {
  enabled: true, 
  url: 'https://YOUR_PROJECT_REF.supabase.co', 
  key: 'YOUR_SUPABASE_ANON_KEY' 
};
