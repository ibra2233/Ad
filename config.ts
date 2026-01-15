
/**
 * LogiTrack Master Configuration
 */

// 1. حدد نوع التطبيق للنسخة الحالية
export const APP_TYPE: 'USER' | 'ADMIN' | 'DRIVER' = 'ADMIN'; 

// 2. إعدادات قاعدة البيانات (Supabase)
export const DB_CONFIG = {
  enabled: true, 
  url: 'https://zdcngosnxowrycqtmvkt.supabase.co', 
  key: 'sb_secret_BpHP_l0zIXG6NWh6ViTyYQ_TvKaEuoy' 
};
