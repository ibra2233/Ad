
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Language } from '../types';
import { fetchOrders, syncOrder, deleteOrder } from '../store';
import { Search, Plus, Edit2, Trash2, X, Loader2, Save, Phone, MapPin, ShoppingBag, CreditCard, RefreshCw } from 'lucide-react';

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
    const data = await fetchOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

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
    // إذا كان هناك ID نحذف بواسطة الـ ID، وإلا نبحث بالكود ونحذف
    let targetId = editingOrder?.id;
    
    if (!targetId && editingOrder?.orderCode) {
      const existing = orders.find(o => o.orderCode.trim().toUpperCase() === editingOrder.orderCode?.trim().toUpperCase());
      if (existing) targetId = existing.id;
    }

    if (!targetId) {
      alert(isAr ? 'يرجى إدخال كود شحنة موجود للحذف' : 'Please enter a valid tracking code to delete');
      return;
    }

    if (confirm(isAr ? 'سيتم حذف كافة بيانات الشحنة نهائياً، هل أنت متأكد؟' : 'All shipment data will be deleted forever, are you sure?')) {
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
    if (existing) {
      setEditingOrder(existing);
    } else {
      alert(isAr ? 'لم يتم العثور على شحنة بهذا الكود' : 'No shipment found with this code');
    }
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
      {/* القسم العلوي: البحث والإضافة */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div className="flex w-full md:w-[500px] gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder={isAr ? 'بحث بالكود أو الاسم...' : 'Search...'} 
              className="w-full pr-12 pl-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 ring-blue-500 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="px-8 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
            onClick={loadData}
          >
            {isAr ? 'بحث' : 'Search'}
          </button>
        </div>
        
        <button 
          onClick={() => setEditingOrder({ 
            status: 'China_Store', 
            orderCode: 'LY-', 
            customerName: '', 
            customerPhone: '',
            customerAddress: '',
            productName: '', 
            quantity: 1,
            totalPrice: 0 
          })}
          className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/20 active:scale-95"
        >
          <Plus className="w-6 h-6" /> {isAr ? 'إضافة شحنة' : 'Add New'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <th className="px-8 py-5">{isAr ? 'كود الشحنة' : 'Code'}</th>
                  <th className="px-8 py-5">{isAr ? 'الزبون' : 'Customer'}</th>
                  <th className="px-8 py-5">{isAr ? 'المنتج' : 'Product'}</th>
                  <th className="px-8 py-5">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="px-8 py-5 text-left">{isAr ? 'إدارة' : 'Manage'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.filter(o => 
                  o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(order => (
                  <tr key={order.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-8 py-6 font-mono font-black text-blue-400">{order.orderCode}</td>
                    <td className="px-8 py-6">
                      <div className="text-white font-bold">{order.customerName}</div>
                      <div className="text-[10px] text-slate-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-8 py-6 text-white font-bold">{order.productName}</td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-500/10 text-green-400' :
                        order.status === 'Out_for_Delivery' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-left space-x-2 space-x-reverse">
                      <button onClick={() => setEditingOrder(order)} className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={async () => { if(confirm(isAr ? 'حذف؟' : 'Delete?')) { await deleteOrder(order.id); loadData(); } }} className="p-3 bg-red-600/10 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة التعديل والحذف */}
      {editingOrder && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-4xl p-8 md:p-10 shadow-2xl my-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-black text-white">{isAr ? 'التحكم في البيانات' : 'Data Control'}</h2>
                <p className="text-slate-500 text-sm mt-1">{isAr ? 'تعديل أو حذف بيانات الشحنة الحالية' : 'Edit or delete current shipment'}</p>
              </div>
              <button onClick={() => setEditingOrder(null)} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white" disabled={isProcessing}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-10">
              {/* حقل الكود مع زر البحث/الجلب */}
              <div className="md:col-span-2 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">{isAr ? 'كود التتبع (أدخل الكود ثم اضغط جلب أو حذف)' : 'Tracking Code (Enter code then fetch or delete)'}</label>
                <div className="flex bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 focus-within:border-blue-500 transition-all">
                  <input 
                    className="flex-1 p-5 bg-transparent text-white outline-none font-mono text-2xl placeholder:opacity-20" 
                    placeholder="LY-XXXX"
                    value={editingOrder.orderCode} 
                    onChange={e => setEditingOrder({...editingOrder, orderCode: e.target.value.toUpperCase()})} 
                  />
                  <button 
                    onClick={handleFetchByCode}
                    className="px-8 bg-blue-600 text-white font-black flex items-center gap-2 hover:bg-blue-500 transition-all active:scale-95 border-l border-slate-800"
                  >
                    <RefreshCw className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} /> {isAr ? 'جلب البيانات' : 'Fetch'}
                  </button>
                </div>
              </div>

              {/* بيانات المستخدم */}
              <div className="space-y-4">
                <h3 className="text-indigo-400 font-black text-xs uppercase tracking-widest border-b border-slate-800 pb-2">{isAr ? 'بيانات الزبون' : 'User Data'}</h3>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">{isAr ? 'اسم الزبون' : 'Name'}</label>
                  <input className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-slate-800 focus:border-indigo-500" value={editingOrder.customerName} onChange={e => setEditingOrder({...editingOrder, customerName: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                  <input className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-slate-800 focus:border-indigo-500" value={editingOrder.customerPhone || ''} onChange={e => setEditingOrder({...editingOrder, customerPhone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">{isAr ? 'العنوان' : 'Address'}</label>
                  <input className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-slate-800 focus:border-indigo-500" value={editingOrder.customerAddress || ''} onChange={e => setEditingOrder({...editingOrder, customerAddress: e.target.value})} />
                </div>
              </div>

              {/* بيانات الشحنة */}
              <div className="space-y-4">
                <h3 className="text-indigo-400 font-black text-xs uppercase tracking-widest border-b border-slate-800 pb-2">{isAr ? 'تفاصيل الطرد' : 'Package Details'}</h3>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">{isAr ? 'اسم المنتج' : 'Product'}</label>
                  <input className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-slate-800 focus:border-indigo-500" value={editingOrder.productName || ''} onChange={e => setEditingOrder({...editingOrder, productName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">{isAr ? 'السعر' : 'Price'}</label>
                    <input type="number" className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-slate-800 focus:border-indigo-500" value={editingOrder.totalPrice || 0} onChange={e => setEditingOrder({...editingOrder, totalPrice: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">{isAr ? 'حالة الشحن' : 'Status'}</label>
                    <select className="w-full p-4 bg-slate-950 rounded-2xl text-white outline-none border border-slate-800 focus:border-indigo-500" value={editingOrder.status} onChange={e => setEditingOrder({...editingOrder, status: e.target.value as OrderStatus})}>
                      {Object.entries(statusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* الأزرار النهائية */}
            <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-800">
              <button 
                onClick={handleSave} 
                disabled={isProcessing}
                className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
                {isAr ? 'تعديل وحفظ البيانات' : 'Update & Save'}
              </button>
              
              <button 
                onClick={handleDeleteCurrent} 
                disabled={isProcessing}
                className="flex-1 py-5 bg-red-600 text-white rounded-3xl font-black hover:bg-red-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-900/20 active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-6 h-6" />
                {isAr ? 'حذف الشحنة نهائياً' : 'Delete Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
