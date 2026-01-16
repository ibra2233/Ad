
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Language } from '../types';
import { fetchOrders, syncOrder, deleteOrder } from '../store';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  Save, 
  RefreshCw, 
  Download,
  AlertCircle
} from 'lucide-react';

interface Props { lang: Language; }

const AdminView: React.FC<Props> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusLabels: Record<OrderStatus, string> = {
    'China_Store': isAr ? 'بانتظار الشحن' : 'Pending',
    'China_Warehouse': isAr ? 'في مخزن الصين' : 'Warehouse CN',
    'En_Route': isAr ? 'في الشحن الدولي' : 'En Route',
    'Libya_Warehouse': isAr ? 'وصلت ليبيا' : 'Warehouse LY',
    'Out_for_Delivery': isAr ? 'خرجت للتوصيل' : 'Out for Delivery',
    'Delivered': isAr ? 'تم التسليم' : 'Delivered'
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrders('admin');
      // التأكد أن البيانات دائماً مصفوفة
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(isAr ? "فشل تحميل البيانات" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!editingOrder?.orderCode || !editingOrder?.customerName) {
      alert(isAr ? 'يرجى إكمال البيانات الأساسية' : 'Please fill basic info');
      return;
    }
    
    try {
      setIsProcessing(true);
      const orderData = {
        ...editingOrder,
        id: editingOrder.id || `temp-${Date.now()}`,
        updatedAt: Date.now(),
        currentPhysicalLocation: editingOrder.currentPhysicalLocation || statusLabels[editingOrder.status as OrderStatus || 'China_Store'],
        quantity: Number(editingOrder.quantity) || 1,
        totalPrice: Number(editingOrder.totalPrice) || 0,
        status: editingOrder.status || 'China_Store'
      } as Order;

      await syncOrder(orderData);
      setEditingOrder(null);
      await loadData();
    } catch (err) {
      alert(isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving data');
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToCSV = () => {
    if (!Array.isArray(orders) || orders.length === 0) return;
    const headers = ['Order Code', 'Customer', 'Product', 'Status', 'Price', 'Location'];
    const rows = orders.map(o => [
      o.orderCode || '',
      `"${o.customerName || ''}"`,
      `"${o.productName || ''}"`,
      o.status || '',
      o.totalPrice || 0,
      `"${o.currentPhysicalLocation || ''}"`
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // تصفية الشحنات مع حماية قصوى ضد القيم الفارغة
  const filteredOrders = Array.isArray(orders) ? orders.filter(o => {
    const code = String(o.orderCode || '').toLowerCase();
    const name = String(o.customerName || '').toLowerCase();
    const search = String(searchTerm || '').toLowerCase();
    return code.includes(search) || name.includes(search);
  }) : [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-10">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 text-right">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder={isAr ? 'بحث بالكود أو الاسم...' : 'Search...'} 
              className="w-full pr-12 pl-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={loadData} className="px-6 bg-slate-800 text-white rounded-2xl hover:bg-slate-700 transition-all">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={exportToCSV}
            className="flex-1 lg:flex-none px-6 py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
          >
            <Download className="w-5 h-5" /> {isAr ? 'تصدير' : 'Export'}
          </button>
          <button 
            onClick={() => setEditingOrder({ status: 'China_Store', orderCode: 'LY-', customerName: '', quantity: 1, totalPrice: 0 })}
            className="flex-1 lg:flex-none px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20"
          >
            <Plus className="w-6 h-6" /> {isAr ? 'شحنة جديدة' : 'Add New'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-bold">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right" dir={isAr ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="bg-slate-800 text-slate-400 text-[10px] font-black tracking-widest uppercase">
                  <th className="px-8 py-5">{isAr ? 'كود الشحنة' : 'Code'}</th>
                  <th className="px-8 py-5">{isAr ? 'الزبون' : 'Customer'}</th>
                  <th className="px-8 py-5">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className={`px-8 py-5 ${isAr ? 'text-left' : 'text-right'}`}>{isAr ? 'إدارة' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-8 py-6 font-mono font-black text-blue-400">{order.orderCode}</td>
                    <td className="px-8 py-6">
                      <div className="text-white font-bold">{order.customerName}</div>
                      <div className="text-[10px] text-slate-500">{order.productName || '---'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${
                        order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className={`px-8 py-6 flex gap-2 ${isAr ? 'justify-start' : 'justify-end'}`}>
                      <button onClick={() => setEditingOrder(order)} className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={async () => { if(confirm(isAr ? 'حذف؟' : 'Delete?')) { await deleteOrder(order.id); loadData(); } }} className="p-3 bg-red-600/10 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-bold">
                      {isAr ? 'لا توجد شحنات متاحة' : 'No orders found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal / Editor */}
      {editingOrder && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-4xl p-8 md:p-10 shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6 text-right" dir={isAr ? 'rtl' : 'ltr'}>
              <div>
                <h2 className="text-2xl font-black text-white">{isAr ? 'بيانات الشحنة' : 'Order Details'}</h2>
                <p className="text-slate-500 text-sm">{isAr ? 'تعديل تفاصيل الطلب والمكان الحالي' : 'Edit details and location'}</p>
              </div>
              <button onClick={() => setEditingOrder(null)} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-right" dir={isAr ? 'rtl' : 'ltr'}>
              <div className="md:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-black text-blue-400 mb-2 block uppercase">{isAr ? 'كود التتبع' : 'Tracking Code'}</label>
                <input 
                  className="w-full bg-transparent text-white text-3xl font-mono outline-none uppercase" 
                  value={editingOrder.orderCode || ''} 
                  onChange={e => setEditingOrder({...editingOrder, orderCode: e.target.value.toUpperCase()})} 
                />
              </div>
              
              <div className="space-y-4">
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" placeholder={isAr ? 'اسم الزبون' : 'Customer Name'} value={editingOrder.customerName || ''} onChange={e => setEditingOrder({...editingOrder, customerName: e.target.value})} />
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" placeholder={isAr ? 'رقم الهاتف' : 'Phone'} value={editingOrder.customerPhone || ''} onChange={e => setEditingOrder({...editingOrder, customerPhone: e.target.value})} />
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" placeholder={isAr ? 'العنوان' : 'Address'} value={editingOrder.customerAddress || ''} onChange={e => setEditingOrder({...editingOrder, customerAddress: e.target.value})} />
              </div>
              
              <div className="space-y-4">
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" placeholder={isAr ? 'المنتج' : 'Product'} value={editingOrder.productName || ''} onChange={e => setEditingOrder({...editingOrder, productName: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-black" placeholder={isAr ? 'السعر' : 'Price'} value={editingOrder.totalPrice || 0} onChange={e => setEditingOrder({...editingOrder, totalPrice: parseFloat(e.target.value) || 0})} />
                  <select className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" value={editingOrder.status} onChange={e => setEditingOrder({...editingOrder, status: e.target.value as OrderStatus})}>
                    {Object.entries(statusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-blue-400 font-bold" placeholder={isAr ? 'الموقع الحالي (نصي)' : 'Physical Location'} value={editingOrder.currentPhysicalLocation || ''} onChange={e => setEditingOrder({...editingOrder, currentPhysicalLocation: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleSave} disabled={isProcessing} className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black shadow-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
                {isAr ? 'حفظ التعديلات' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
