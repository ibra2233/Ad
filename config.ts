
/**
 * LogiTrack Configuration - Advanced Key Management
 */
export const DB_CONFIG = {
  enabled: true, 
  url: 'https://YOUR_PROJECT_REF.supabase.co', 
  
  // المفتاح العام (للزباين) - يسمى أحياناً Anon أو Publishable
  publishableKey: 'YOUR_PUBLISHABLE_KEY',

  // المفتاح السري (للأدمن) - يسمى Secret أو Service Role
  // تحذير: هذا المفتاح يملك صلاحيات مطلقة على قاعدة البيانات
  secretKey: 'YOUR_SECRET_KEY'
};

// كلمة مرور لوحة الإدارة (كطبقة حماية إضافية للواجهة)
export const ADMIN_PASSWORD = '123'; 
