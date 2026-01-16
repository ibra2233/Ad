
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Language } from '../types';
import { fetchOrders, syncOrder, deleteOrder } from '../store';
import { Search, Plus, Edit2, Trash2, X, Loader2, Save, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';

interface Props { lang: Language; }

const AdminView: React.FC<Props> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchOrders('admin');
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const exportToCSV = () => {
    if (orders.length === 0) return;
    
    const headers = ['order_code', 'customer_name', 'customer_phone', 'customer_address', 'product_name', 'quantity', 'total_price', 'status', 'current_location', 'updated_at'];
    const csvRows = orders.map(o => [
      o.orderCode,
      `"${o.customerName}"`,
      o.customerPhone,
      `"${o.customerAddress}"`,
      `"${o.productName}"`,
      o.quantity,
      o.totalPrice,
      o.status,
      `"${o.currentPhysicalLocation}"`,
      new Date(o.updatedAt).toISOString()
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!editingOrder?.orderCode || !editingOrder?.customerName) return;
    setIsProcessing(true);
    
    const orderData = {
      ...editingOrder,
      id: editingOrder.id || Date.now().toString(),
      updatedAt: Date.now(),
      currentPhysicalLocation: editingOrder.currentPhysicalLocation || statusLabels[editingOrder.status as OrderStatus],
      quantity: Number(editingOrder.quantity) || 1,
      totalPrice: Number(editingOrder.totalPrice) || 0
    } as Order;

    await syncOrder(orderData);
    setEditingOrder(null);
    await loadData();
    setIsProcessing(false);
  };

  const handleDeleteCurrent = async () => {
    let targetId = editingOrder?.id;
    if (!targetId && editingOrder?.orderCode) {
      const existing = orders.find(o => o.orderCode.trim().toUpperCase() === editingOrder.orderCode?.trim().toUpperCase());
      if (existing) targetId = existing.id;
    }
    if (!targetId) return;

    if (confirm(isAr ? 'حذف الشحنة نهائياً؟' : 'Delete forever?')) {
      setIsProcessing(true);
      await deleteOrder(targetId);
      setEditingOrder(null);
      await loadData();
      setIsProcessing(false);
    }
  };

  const handleFetchByCode = () => {
    if (!editingOrder?.orderCode) return;
    const existing = orders.find(o => o.orderCode.trim().toUpperCase() === editingOrder.orderCode?.trim().toUpperCase());
    if (existing) setEditingOrder(existing);
    else alert(isAr ? 'كود غير موجود' : 'Code not found');
  };

  const statusLabels: Record<OrderStatus, string> = {
    'China_Store': isAr ? 'بانتظار الشحن' : 'Pending',
    'China_Warehouse': isAr ? 'في مخزن الصين' : 'Warehouse CN',
    'En_Route': isAr ? 'في الشحن الدولي' : 'En Route',
    'Libya_Warehouse': isAr ? 'وصلت ليبيا' : 'Warehouse LY',
    'Out_for_Delivery': isAr ? 'خرجت للتوصيل' : 'Out for Delivery',
    'Delivered': isAr ? 'تم التسليم' : 'Delivered'
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-10">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
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
            <Download className="w-5 h-5" /> {isAr ? 'تصدير CSV' : 'Export'}
          </button>
          <button 
            onClick={() => setEditingOrder({ status: 'China_Store', orderCode: 'LY-', customerName: '', quantity: 1, totalPrice: 0 })}
            className="flex-1 lg:flex-none px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20"
          >
            <Plus className="w-6 h-6" /> {isAr ? 'شحنة جديدة' : 'Add New'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-bold">{isAr ? 'جاري تحميل البيانات من السحابة...' : 'Loading from cloud...'}</p>
        </div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-800 text-slate-400 text-[10px] font-black tracking-widest uppercase">
                  <th className="px-8 py-5">كود الشحنة</th>
                  <th className="px-8 py-5">الزبون</th>
                  <th className="px-8 py-5">الحالة</th>
                  <th className="px-8 py-5 text-left">إدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.filter(o => o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase())).map(order => (
                  <tr key={order.id} className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-8 py-6 font-mono font-black text-blue-400">{order.orderCode}</td>
                    <td className="px-8 py-6">
                      <div className="text-white font-bold">{order.customerName}</div>
                      <div className="text-[10px] text-slate-500">{order.productName}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${
                        order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-left flex gap-2 justify-end">
                      <button onClick={() => setEditingOrder(order)} className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={async () => { if(confirm(isAr ? 'حذف؟' : 'Delete?')) { await deleteOrder(order.id); loadData(); } }} className="p-3 bg-red-600/10 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingOrder && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-4xl p-8 md:p-10 shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-black text-white">{isAr ? 'بيانات الشحنة' : 'Order Details'}</h2>
                <p className="text-slate-500 text-sm">{isAr ? 'تعديل كافة تفاصيل الطلب والموقع' : 'Edit all order details and location'}</p>
              </div>
              <button onClick={() => setEditingOrder(null)} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-[10px] font-black text-blue-400 mb-2 block uppercase">كود التتبع</label>
                <div className="flex gap-2">
                  <input className="flex-1 bg-transparent text-white text-3xl font-mono outline-none" value={editingOrder.orderCode} onChange={e => setEditingOrder({...editingOrder, orderCode: e.target.value.toUpperCase()})} />
                  <button onClick={handleFetchByCode} className="px-6 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 transition-all"><RefreshCw className="w-4 h-4" /> {isAr ? 'جلب' : 'Fetch'}</button>
                </div>
              </div>
              
              <div className="space-y-4">
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" placeholder={isAr ? 'اسم الزبون' : 'Customer Name'} value={editingOrder.customerName || ''} onChange={e => setEditingOrder({...editingOrder, customerName: e.target.value})} />
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" placeholder={isAr ? 'رقم الهاتف' : 'Phone'} value={editingOrder.customerPhone || ''} onChange={e => setEditingOrder({...editingOrder, customerPhone: e.target.value})} />
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" placeholder={isAr ? 'العنوان التفصيلي' : 'Address'} value={editingOrder.customerAddress || ''} onChange={e => setEditingOrder({...editingOrder, customerAddress: e.target.value})} />
              </div>
              
              <div className="space-y-4">
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500" placeholder={isAr ? 'اسم المنتج' : 'Product'} value={editingOrder.productName || ''} onChange={e => setEditingOrder({...editingOrder, productName: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-black" placeholder={isAr ? 'السعر' : 'Price'} value={editingOrder.totalPrice || 0} onChange={e => setEditingOrder({...editingOrder, totalPrice: parseFloat(e.target.value)})} />
                  <select className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" value={editingOrder.status} onChange={e => setEditingOrder({...editingOrder, status: e.target.value as OrderStatus})}>
                    {Object.entries(statusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <input className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-blue-400 font-bold" placeholder={isAr ? 'الموقع الحالي (نص)' : 'Current Physical Location'} value={editingOrder.currentPhysicalLocation || ''} onChange={e => setEditingOrder({...editingOrder, currentPhysicalLocation: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handleSave} disabled={isProcessing} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
                {isAr ? 'تحديث وحفظ' : 'Update & Save'}
              </button>
              {editingOrder.id && (
                <button onClick={handleDeleteCurrent} disabled={isProcessing} className="px-10 py-5 bg-red-600 text-white rounded-3xl font-black hover:bg-red-500 transition-all flex items-center justify-center gap-2 shadow-xl">
                  <Trash2 className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
