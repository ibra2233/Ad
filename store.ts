
import { Order, OrderStatus } from './types';
import { DB_CONFIG } from './config';

/**
 * تحويل الكائن من تنسيق التطبيق إلى تنسيق قاعدة البيانات
 */
const mapToDb = (order: Partial<Order>) => ({
  order_code: order.orderCode || '',
  customer_name: order.customerName || '',
  customer_phone: order.customerPhone || '',
  customer_address: order.customerAddress || '',
  product_name: order.productName || '',
  quantity: order.quantity || 1,
  total_price: order.totalPrice || 0,
  status: order.status || 'China_Store',
  current_location: order.currentPhysicalLocation || '',
  updated_at: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString()
});

/**
 * تحويل الكائن من تنسيق قاعدة البيانات إلى تنسيق التطبيق مع حماية ضد القيم الفارغة
 */
const mapFromDb = (dbOrder: any): Order => ({
  id: dbOrder.id || Math.random().toString(36).substr(2, 9),
  orderCode: dbOrder.order_code || 'N/A',
  customerName: dbOrder.customer_name || 'No Name',
  customerPhone: dbOrder.customer_phone || '',
  customerAddress: dbOrder.customer_address || '',
  productName: dbOrder.product_name || '',
  quantity: Number(dbOrder.quantity) || 1,
  totalPrice: Number(dbOrder.total_price) || 0,
  status: (dbOrder.status as OrderStatus) || 'China_Store',
  currentPhysicalLocation: dbOrder.current_location || '',
  updatedAt: dbOrder.updated_at ? new Date(dbOrder.updated_at).getTime() : Date.now()
});

/**
 * التحقق من جاهزية الإعدادات
 */
export const isConfigReady = (role: 'admin' | 'user' = 'user'): boolean => {
  const url = DB_CONFIG.url;
  const key = (role === 'admin' && DB_CONFIG.secretKey) ? DB_CONFIG.secretKey : DB_CONFIG.publishableKey;
  return !!(url && !url.includes('YOUR_PROJECT_REF') && key && key.length > 10);
};

const supabaseRequest = async (
  table: string, 
  method: string = 'GET', 
  body: any = null, 
  query: string = '', 
  role: 'admin' | 'user' = 'user'
) => {
  if (!isConfigReady(role)) return null;
  
  const key = role === 'admin' ? (DB_CONFIG.secretKey || DB_CONFIG.publishableKey) : DB_CONFIG.publishableKey;

  const headers: Record<string, string> = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  if (method !== 'GET') {
    headers['Prefer'] = 'return=representation';
    if (method === 'POST') {
      headers['Prefer'] += ',resolution=merge-duplicates';
    }
  }

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
      console.error('Supabase Error:', await response.text());
      return null;
    }
    
    return response.status === 204 ? [] : await response.json();
  } catch (error) {
    console.error('Network Error:', error);
    return null;
  }
};

export const fetchOrders = async (role: 'admin' | 'user' = 'user'): Promise<Order[]> => {
  try {
    const data = await supabaseRequest('orders', 'GET', null, 'select=*&order=updated_at.desc', role);
    if (data && Array.isArray(data)) {
      return data.map(mapFromDb);
    }
  } catch (e) {
    console.error("Error fetching orders:", e);
  }
  return [];
};

export const syncOrder = async (order: Order): Promise<Order | null> => {
  const existing = await supabaseRequest('orders', 'GET', null, `order_code=eq.${order.orderCode}`, 'admin');
  const dbData = mapToDb(order);

  if (existing && existing.length > 0) {
    const result = await supabaseRequest('orders', 'PATCH', dbData, `order_code=eq.${order.orderCode}`, 'admin');
    return result && result.length > 0 ? mapFromDb(result[0]) : null;
  } else {
    const result = await supabaseRequest('orders', 'POST', dbData, '', 'admin');
    return result && result.length > 0 ? mapFromDb(result[0]) : null;
  }
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  const data = await supabaseRequest('orders', 'DELETE', null, `id=eq.${id}`, 'admin');
  return data !== null;
};
