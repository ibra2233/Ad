
import { Order, OrderStatus } from './types';
import { DB_CONFIG } from './config';

/**
 * التحقق من جاهزية الإعدادات
 */
export const isConfigReady = (role: 'admin' | 'user' = 'user') => {
  const key = role === 'admin' ? DB_CONFIG.secretKey : DB_CONFIG.publishableKey;
  return (
    DB_CONFIG.enabled && 
    DB_CONFIG.url && 
    !DB_CONFIG.url.includes('YOUR_PROJECT_REF') && 
    key &&
    !key.includes('YOUR_')
  );
};

/**
 * محرك الطلبات المركزي
 * @param role 'admin' يستخدم المفتاح السري، 'user' يستخدم المفتاح العام
 */
const supabaseRequest = async (
  table: string, 
  method: string = 'GET', 
  body?: any, 
  query: string = '', 
  role: 'admin' | 'user' = 'user'
) => {
  if (!isConfigReady(role)) return null;
  
  // اختيار المفتاح الصحيح بناءً على الدور
  const key = role === 'admin' ? DB_CONFIG.secretKey : DB_CONFIG.publishableKey;

  const headers: any = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  if (method === 'POST' || method === 'PATCH' || method === 'DELETE') {
    headers['Prefer'] = 'return=representation';
  }

  const url = `${DB_CONFIG.url}/rest/v1/${table}${query ? `?${query}` : (method === 'GET' ? '?select=*' : '')}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Supabase [${role}] Error:`, errorData);
      return null;
    }
    
    if (response.status === 204) return [];
    return await response.json();
  } catch (error) {
    console.error(`Network Error [${role}]:`, error);
    return null;
  }
};

/**
 * جلب الشحنات
 */
export const fetchOrders = async (role: 'admin' | 'user' = 'user'): Promise<Order[]> => {
  const data = await supabaseRequest('orders', 'GET', null, '', role);
  if (data && Array.isArray(data)) {
    return data.map(o => ({
      id: o.id,
      orderCode: o.order_code,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerAddress: o.customer_address,
      productName: o.product_name,
      quantity: o.quantity,
      totalPrice: o.total_price,
      status: o.status,
      currentPhysicalLocation: o.current_location,
      updatedAt: new Date(o.updated_at).getTime(),
      customerLocation: o.customer_lat ? { lat: o.customer_lat, lng: o.customer_lng } : undefined,
      driverLocation: o.driver_lat ? { lat: o.driver_lat, lng: o.driver_lng } : undefined
    }));
  }
  return [];
};

/**
 * مزامنة شحنة (أدمن فقط - يستخدم Secret Key)
 */
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
  
  // فحص الوجود باستخدام مفتاح الأدمن
  const check = await supabaseRequest('orders', 'GET', null, `order_code=eq.${order.orderCode}`, 'admin');
  
  if (check && check.length > 0) {
    await supabaseRequest('orders', 'PATCH', dbOrder, `order_code=eq.${order.orderCode}`, 'admin');
  } else {
    await supabaseRequest('orders', 'POST', dbOrder, '', 'admin');
  }
  
  window.dispatchEvent(new Event('storage'));
};

/**
 * حذف شحنة (أدمن فقط - يستخدم Secret Key)
 */
export const deleteOrder = async (id: string): Promise<void> => {
  await supabaseRequest('orders', 'DELETE', null, `id=eq.${id}`, 'admin');
  window.dispatchEvent(new Event('storage'));
};
