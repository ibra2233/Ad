
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Language } from '../types';
import { fetchOrders, syncOrder, deleteOrder } from '../store';
import { Search, Plus, Edit2, Trash2, X, Loader2, Save, RefreshCw } from 'lucide-react';

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
  }, []);

  const handleSave = async () => {
    if (!editingOrder?.orderCode || !editingOrder?.customerName) {
      alert(isAr ? 'Ø§Ù„Ø±Ø¬Ø§Ø¡ Ø¥Ø¯Ø®Ø§Ù„ ÙƒÙˆØ¯ Ø§Ù„Ø´Ø­Ù†Ø© ÙˆØ§Ø³Ù… Ø§Ù„Ø²Ø¨ÙˆÙ†' : 'Please enter code and name');
      return;
    }
    setIsProcessing(true);
    const orderData = {
      ...editingOrder,
      id: editingOrder.id || Date.now().toString(),
      updatedAt: Date.now(),
      quantity: Number(editingOrder.quantity) || 1,
      totalPrice: Number(editingOrder.totalPrice) || 0
    } as Order;

    await syncOrder(orderData);
    setEditingOrder(null);
    await loadData();
    setIsProcessing(false);
  };

  const handleFetchByCode = () => {
    if (!editingOrder?.orderCode) return;
    const existing = orders.find(o => o.orderCode.toUpperCase() === editingOrder.orderCode?.toUpperCase());
    if (existing) setEditingOrder(existing);
    else alert(isAr ? 'Ø§Ù„ÙƒÙˆØ¯ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯' : 'Code not found');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-32">
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="flex-1 flex gap-2">
          <input 
            type="text" 
            placeholder={isAr ? 'Ø§Ø¨Ø­Ø« Ø¨Ø§Ù„ÙƒÙˆØ¯ Ø£Ùˆ Ø§Ù„Ø§Ø³Ù…...' : 'Search...'} 
            className="w-full px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white outline-none focus:ring-2 ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="px-8 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-blue-500 shadow-lg shadow-blue-900/20">
            <Search className="w-5 h-5" /> {isAr ? 'Ø¨Ø­Ø«' : 'Search'}
          </button>
        </div>
        
        <button 
          onClick={() => setEditingOrder({ status: 'China_Store', orderCode: 'LY-', customerName: '', quantity: 1, totalPrice: 0 })}
          className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-500 shadow-xl shadow-emerald-900/20"
        >
          <Plus className="w-6 h-6" /> {isAr ? 'Ø¥Ø¶Ø§ÙØ© Ø´Ø­Ù†Ø©' : 'Add New'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-right">
            <thead className="bg-slate-800 text-slate-400 text-xs font-black">
              <tr>
                <th className="px-8 py-5">Ø§Ù„ÙƒÙˆØ¯</th>
                <th className="px-8 py-5">Ø§Ù„Ø²Ø¨ÙˆÙ†</th>
                <th className="px-8 py-5 text-left">Ø¥Ø¯Ø§Ø±Ø©</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.filter(o => (o.orderCode || '').includes(searchTerm) || (o.customerName || '').includes(searchTerm)).map(order => (
                <tr key={order.id} className="hover:bg-blue-500/5 transition-colors">
                  <td className="px-8 py-6 font-mono font-black text-blue-400">{order.orderCode}</td>
                  <td className="px-8 py-6 text-white font-bold">{order.customerName}</td>
                  <td className="px-8 py-6 text-left flex gap-2 justify-end">
                    <button onClick={() => setEditingOrder(order)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-md"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={async () => { if(confirm(isAr ? 'Ø­Ø°ÙØŸ' : 'Delete?')) { await deleteOrder(order.id); loadData(); } }} className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all shadow-md"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingOrder && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-3xl p-10 shadow-2xl relative">
            <button onClick={() => setEditingOrder(null)} className="absolute top-8 left-8 p-2 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-black text-white mb-8">{isAr ? 'Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø´Ø­Ù†Ø©' : 'Order Details'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 md:col-span-2">
                <input className="flex-1 p-4 bg-transparent text-white text-2xl font-mono outline-none" placeholder="LY-XXXX" value={editingOrder.orderCode || ''} onChange={e => setEditingOrder({...editingOrder, orderCode: e.target.value.toUpperCase()})} />
                <button onClick={handleFetchByCode} className="px-6 bg-blue-600 text-white rounded-xl font-black flex items-center gap-2"><RefreshCw className="w-4 h-4" /> {isAr ? 'Ø¬Ù„Ø¨' : 'Fetch'}</button>
              </div>
              <input className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-white" placeholder={isAr ? 'Ø§Ø³Ù… Ø§Ù„Ø²Ø¨ÙˆÙ†' : 'Customer'} value={editingOrder.customerName || ''} onChange={e => setEditingOrder({...editingOrder, customerName: e.target.value})} />
              <input className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-white" placeholder={isAr ? 'Ø§Ø³Ù… Ø§Ù„Ù…Ù†ØªØ¬' : 'Product'} value={editingOrder.productName || ''} onChange={e => setEditingOrder({...editingOrder, productName: e.target.value})} />
              <input type="number" className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-green-400 font-black" placeholder={isAr ? 'Ø§Ù„Ø³Ø¹Ø±' : 'Price'} value={editingOrder.totalPrice || ''} onChange={e => setEditingOrder({...editingOrder, totalPrice: parseFloat(e.target.value)})} />
              <select className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-white" value={editingOrder.status} onChange={e => setEditingOrder({...editingOrder, status: e.target.value as OrderStatus})}>
                <option value="China_Store">Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ø´Ø­Ù†</option>
                <option value="China_Warehouse">ÙÙŠ Ù…Ø®Ø²Ù† Ø§Ù„ØµÙŠÙ†</option>
                <option value="En_Route">ÙÙŠ Ø§Ù„Ø·Ø±ÙŠÙ‚</option>
                <option value="Libya_Warehouse">ÙˆØµÙ„Øª Ù„ÙŠØ¨ÙŠØ§</option>
                <option value="Out_for_Delivery">Ø®Ø§Ø±Ø¬ Ù„Ù„ØªÙˆØµÙŠÙ„</option>
                <option value="Delivered">ØªÙ… Ø§Ù„ØªØ³Ù„ÙŠÙ…</option>
              </select>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={handleSave} disabled={isProcessing} className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black shadow-xl hover:bg-emerald-500 flex items-center justify-center gap-2 transition-all">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Save className="w-6 h-6" />}
                {isAr ? 'Ø­ÙØ¸ ÙˆØªØ¹Ø¯ÙŠÙ„' : 'Save & Update'}
              </button>
              {editingOrder.id && (
                <button onClick={async () => { if(confirm(isAr ? 'Ø­Ø°ÙØŸ' : 'Delete?')) { await deleteOrder(editingOrder.id!); setEditingOrder(null); loadData(); } }} className="px-10 py-5 bg-red-600 text-white rounded-3xl font-black hover:bg-red-500 shadow-xl flex items-center justify-center gap-2 transition-all">
                  <Trash2 className="w-6 h-6" /> {isAr ? 'Ø­Ø°Ù' : 'Delete'}
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
