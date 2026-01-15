
import { Order, AppNotification, OrderStatus, Location } from './types';
import { DB_CONFIG } from './config';

const isConfigReady = () => {
  return (
    DB_CONFIG.enabled && 
    DB_CONFIG.url && 
    !DB_CONFIG.url.includes('YOUR_PROJECT_REF') && 
    DB_CONFIG.key
  );
};

const supabaseRequest = async (table: string, method: string = 'GET', body?: any, query: string = '') => {
  if (!isConfigReady()) return null;
  
  const headers: any = {
    'apikey': DB_CONFIG.key,
    'Authorization': `Bearer ${DB_CONFIG.key}`,
    'Content-Type': 'application/json'
  };

  if (method === 'POST') headers['Prefer'] = 'return=representation';

  const url = `${DB_CONFIG.url}/rest/v1/${table}${query ? `?${query}` : (method === 'GET' ? '?select=*' : '')}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) return null;
    if (response.status === 204) return [];
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const fetchOrders = async (): Promise<Order[]> => {
  if (isConfigReady()) {
    const data = await supabaseRequest('orders');
    if (data && Array.isArray(data)) {
      const orders = data.map(o => ({
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
      localStorage.setItem('logitrack_remote_db', JSON.stringify(orders));
      return orders;
    }
  }
  const local = localStorage.getItem('logitrack_remote_db');
  return local ? JSON.parse(local) : [];
};

export const getOrders = (): Order[] => {
  const local = localStorage.getItem('logitrack_remote_db');
  return local ? JSON.parse(local) : [];
};

export const syncOrder = async (order: Order): Promise<void> => {
  if (isConfigReady()) {
    const dbOrder = {
      order_code: order.orderCode,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_address: order.customerAddress,
      product_name: order.productName,
      quantity: order.quantity,
      total_price: order.totalPrice,
      status: order.status,
      current_location: order.currentPhysicalLocation,
      updated_at: new Date().toISOString()
    };
    
    const check = await supabaseRequest('orders', 'GET', null, `order_code=eq.${order.orderCode}`);
    if (check && check.length > 0) {
      await supabaseRequest('orders', 'PATCH', dbOrder, `order_code=eq.${order.orderCode}`);
    } else {
      await supabaseRequest('orders', 'POST', dbOrder);
    }

    // إضافة إشعار تلقائي عند تحديث الحالة
    await supabaseRequest('notifications', 'POST', {
      order_code: order.orderCode,
      title: 'تحديث حالة الشحنة',
      body: `تم تحديث حالة شحنتك (${order.orderCode}) إلى: ${order.status}`,
    });
  }
  await fetchOrders();
  window.dispatchEvent(new Event('storage'));
};

export const updateOrderLocation = async (orderCode: string, type: 'customer' | 'driver', location: Location) => {
  if (isConfigReady()) {
    const fieldLat = type === 'customer' ? 'customer_lat' : 'driver_lat';
    const fieldLng = type === 'customer' ? 'customer_lng' : 'driver_lng';
    await supabaseRequest('orders', 'PATCH', { 
      [fieldLat]: location.lat, 
      [fieldLng]: location.lng 
    }, `order_code=eq.${orderCode}`);
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  if (isConfigReady()) {
    await supabaseRequest('orders', 'DELETE', null, `id=eq.${id}`);
  }
  await fetchOrders();
  window.dispatchEvent(new Event('storage'));
};

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  if (isConfigReady()) {
    const data = await supabaseRequest('notifications');
    if (data && Array.isArray(data)) {
        return data.map(n => ({
            id: n.id,
            orderCode: n.order_code,
            title: n.title,
            body: n.body,
            isRead: n.is_read,
            timestamp: new Date(n.created_at).getTime()
        }));
    }
  }
  return [];
};
