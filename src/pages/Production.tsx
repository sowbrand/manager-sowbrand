import React, { useState, useEffect } from 'react';
import { Plus, Clock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { ProductionOrder } from '../types';

const Production: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    // REMOVIDO o "error" daqui, pois não estava sendo usado
    const { data } = await supabase
      .from('production_orders')
      .select('*, clients(name)')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produção</h1>
        <button className="bg-sow-green text-white px-4 py-2 rounded-lg flex gap-2">
          <Plus size={20} /> Nova Ordem
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p>Carregando...</p> : orders.map((order: any) => (
          <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-gray-400">#{order.id.slice(0,8)}</span>
                <h3 className="font-bold text-lg">{order.clients?.name || 'Cliente Desconhecido'}</h3>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-50">
              <Clock size={16} />
              <span>Prazo: {order.deadline ? new Date(order.deadline).toLocaleDateString() : 'Sem data'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Production;