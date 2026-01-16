
import { Order, OrderStatus } from './types';
import { DB_CONFIG } from './config';

/**
 * التحقق من جاهزية الإعدادات
 */
export const isConfigReady = (role: 'admin' | 'user' = 'user'): boolean => {
  const url = DB_CONFIG.url;
  // إذا كان الأدمن لا يملك مفتاح سري، نتحقق من وجود المفتاح العام على الأقل
  const key = (role === 'admin' && DB_CONFIG.secretKey) ? DB_CONFIG.secretKey : DB_CONFIG.publishableKey;
  return !!(url && !url.includes('YOUR_PROJECT_REF') && key && key.length > 10);
};

/**
 * محرك الطلبات المركزي لـ Supabase REST API
 */
const supabaseRequest = async (
  table: string, 
  method: string = 'GET', 
  body: any = null, 
  query: string = '', 
  role: 'admin' | 'user' = 'user'
) => {
  if (!isConfigReady(role)) {
    console.warn(`Configuration missing or invalid for role: ${role}`);
    return null;
  }
  
  // نستخدم السري للأدمن، وإذا لم يتوفر نستخدم العام (Anon)
  let key = role === 'admin' ? DB_CONFIG.secretKey : DB_CONFIG.publishableKey;
  if (role === 'admin' && !key) {
    key = DB_CONFIG.publishableKey;
    console.info('Admin: Secret key missing, falling back to Anon key.');
  }

  const headers: Record<string, string> = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  if (method !== 'GET') {
    headers['Prefer'] = 'return=representation';
  }

  // بناء الرابط بشكل صحيح
  const baseUrl = `${DB_CONFIG.url}/rest/v1/${table}`;
  let url = baseUrl;
  
  if (query) {
    url += `?${query}`;
  } else if (method === 'GET') {
    url += `?select=*`;
  }
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      const err = await response.json();
      console.error('Supabase Error Detailed:', err);
      // تنبيه في الكونسول إذا كانت المشكلة في الصلاحيات
      if (response.status === 401 || response.status === 403) {
        console.error('Permission Denied: Check your RLS policies in Supabase.');
      }
      return null;
    }
    
    return response.status === 204 ? [] : await response.json();
  } catch (error) {
    console.error('Network/Fetch Error:', error);
    return null;
  }
};

export const fetchOrders = async (role: 'admin' | 'user' = 'user'): Promise<Order[]> => {
  const data = await supabaseRequest('orders', 'GET', null, 'order=updated_at.desc', role);
  if (data && Array.isArray(data)) {
    return data.map(o => ({
      id: o.id,
      orderCode: o.order_code,
      customerName: o.customer_name,
      customerPhone: o.customer_phone || '',
      customerAddress: o.customer_address || '',
      productName: o.product_name || '',
      quantity: Number(o.quantity) || 1,
      totalPrice: Number(o.total_price) || 0,
      status: o.status as OrderStatus,
      currentPhysicalLocation: o.current_location || '',
      updatedAt: new Date(o.updated_at).getTime()
    }));
  }
  return [];
};

export const syncOrder = async (order: Order): Promise<void> => {
  const dbOrder = {
    order_code: order.orderCode,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    product_name: order.productName,
    quantity: order.quantity,
    total_price: order.totalPrice,
    status: order.status,
    current_location: order.currentPhysicalLocation || '',
    updated_at: new Date().toISOString()
  };
  
  // التحقق من وجود الطلب مسبقاً للكود
  const check = await supabaseRequest('orders', 'GET', null, `order_code=eq.${order.orderCode}`, 'admin');
  
  if (check && check.length > 0) {
    // تحديث
    await supabaseRequest('orders', 'PATCH', dbOrder, `order_code=eq.${order.orderCode}`, 'admin');
  } else {
    // إضافة جديد
    await supabaseRequest('orders', 'POST', dbOrder, '', 'admin');
  }
  
  // إرسال حدث لتحديث الواجهة
  window.dispatchEvent(new Event('storage'));
};

export const deleteOrder = async (id: string): Promise<void> => {
  await supabaseRequest('orders', 'DELETE', null, `id=eq.${id}`, 'admin');
  window.dispatchEvent(new Event('storage'));
};
