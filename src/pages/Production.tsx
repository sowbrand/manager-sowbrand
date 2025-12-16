import React, { useState, useEffect } from 'react';
import { MOCK_ORDERS, MOCK_SUPPLIERS, MOCK_CLIENTS } from '../constants';
import type {
  ProductionOrder,
  ProductionStatus,
  Supplier,
  Client,
  ProductionStage,
} from '../types';
import { ChevronDown, ChevronUp, Plus, Search, Filter, X } from 'lucide-react';

const Production: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>(() => {
    const saved = localStorage.getItem('sow_orders');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });

  const [suppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('sow_suppliers');
    return saved ? JSON.parse(saved) : MOCK_SUPPLIERS;
  });

  const [clients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('sow_clients');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });

  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Order Form
  const [newOrder, setNewOrder] = useState<{
    clientId: string;
    product: string;
    quantity: string;
    modelingOrigin: 'Sow Brand' | 'Cliente';
  }>({ clientId: '', product: '', quantity: '', modelingOrigin: 'Sow Brand' });

  // Styles
  const INPUT_STYLE =
    'w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sow-green focus:border-transparent outline-none transition-all placeholder-gray-400';
  const LABEL_STYLE = 'block text-sm font-bold text-gray-700 mb-1';
  const BUTTON_PRIMARY =
    'bg-sow-green text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-600 transition-colors active:scale-95';

  useEffect(() => {
    localStorage.setItem('sow_orders', JSON.stringify(orders));
  }, [orders]);

  const STAGES_CONFIG = [
    { key: 'modelagem', label: 'Modelagem' },
    { key: 'corte', label: 'Corte' },
    { key: 'costura', label: 'Costura' },
    { key: 'bordado', label: 'Bordado' },
    { key: 'silk', label: 'Silk' },
    { key: 'dtfPrint', label: 'DTF Print' },
    { key: 'dtfPress', label: 'DTF Press' },
    { key: 'acabamento', label: 'Acabamento' },
  ];

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.clientId || !newOrder.product || !newOrder.quantity) return;

    const client = clients.find((c) => c.id === newOrder.clientId);
    const emptyStage: ProductionStage = { status: 'Pendente' };

    const orderToAdd: ProductionOrder = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: newOrder.clientId,
      clientName: client ? client.name : 'Cliente Removido',
      product: newOrder.product,
      quantity: parseInt(newOrder.quantity),
      modelingOrigin: newOrder.modelingOrigin,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      stages: {
        modelagem: { ...emptyStage },
        corte: { ...emptyStage },
        costura: { ...emptyStage },
        bordado: { ...emptyStage },
        silk: { ...emptyStage },
        dtfPrint: { ...emptyStage },
        dtfPress: { ...emptyStage },
        acabamento: { ...emptyStage },
      },
    };

    setOrders([orderToAdd, ...orders]);
    setIsModalOpen(false);
    setNewOrder({
      clientId: '',
      product: '',
      quantity: '',
      modelingOrigin: 'Sow Brand',
    });
  };

  const updateStage = (
    orderId: string,
    stageKey: string,
    field: string,
    value: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          stages: {
            ...order.stages,
            [stageKey]: {
              ...(order.stages as any)[stageKey],
              [field]: value,
            },
          },
        };
      })
    );
  };

  const getStatusColor = (status: ProductionStatus) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Atrasado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-white text-gray-500 border-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 pb-20">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por pedido, cliente..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sow-green shadow-sm text-gray-900 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2">
            <Filter size={16} />{' '}
            <span className="hidden sm:inline">Filtros</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2 bg-sow-green text-white rounded-xl text-sm font-bold hover:bg-green-600 flex items-center justify-center gap-2 shadow-lg shadow-green-100"
          >
            <Plus size={16} /> Novo Pedido
          </button>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div
              className="p-4 flex flex-col gap-2 cursor-pointer active:bg-gray-50 transition-colors"
              onClick={() =>
                setExpandedCard(expandedCard === order.id ? null : order.id)
              }
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-sow-green bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    {order.orderNumber}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-1">
                    {order.clientName}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-800">
                    {order.quantity}
                  </span>
                  <p className="text-[10px] text-gray-500 uppercase">Peças</p>
                </div>
              </div>
              <div className="flex justify-between items-end mt-2">
                <p className="text-sm text-gray-600">{order.product}</p>
                {expandedCard === order.id ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedCard === order.id && (
              <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2">
                {STAGES_CONFIG.map((stage) => {
                  const stageData = (order.stages as any)[stage.key];
                  return (
                    <div
                      key={stage.key}
                      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
                        <span className="font-bold text-sm text-gray-700 uppercase tracking-wide">
                          {stage.label}
                        </span>
                        <select
                          value={stageData?.status || 'Pendente'}
                          onChange={(e) =>
                            updateStage(
                              order.id,
                              stage.key,
                              'status',
                              e.target.value
                            )
                          }
                          className={`text-xs font-bold px-2 py-1 rounded border-0 outline-none cursor-pointer ${getStatusColor(
                            stageData?.status
                          )}`}
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Em Andamento">Em Andamento</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Atrasado">Atrasado</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-gray-400 mb-1">
                            Responsável
                          </label>
                          <select
                            className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-900"
                            value={stageData?.supplierId || ''}
                            onChange={(e) =>
                              updateStage(
                                order.id,
                                stage.key,
                                'supplierId',
                                e.target.value
                              )
                            }
                          >
                            <option value="" disabled>
                              -
                            </option>
                            <option value="Sow Interno">Interno</option>
                            <option value="Cliente">Cliente</option>
                            {suppliers
                              .filter(
                                (s) =>
                                  s.category.toLowerCase() ===
                                    stage.label.toLowerCase() ||
                                  s.category === 'Costura'
                              )
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <label className="block text-gray-400 mb-1">
                              Entrada
                            </label>
                            <input
                              type="text"
                              placeholder="DD/MM"
                              className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-900"
                              value={stageData?.dateIn || ''}
                              onChange={(e) =>
                                updateStage(
                                  order.id,
                                  stage.key,
                                  'dateIn',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">
                              Saída
                            </label>
                            <input
                              type="text"
                              placeholder="DD/MM"
                              className="w-full bg-gray-50 border border-gray-200 rounded p-1 text-gray-900"
                              value={stageData?.dateOut || ''}
                              onChange={(e) =>
                                updateStage(
                                  order.id,
                                  stage.key,
                                  'dateOut',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:flex flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="min-w-max border-collapse">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 text-left border-r border-gray-200 bg-gray-50 sticky left-0 z-20 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Pedido / Cliente
                </th>
                <th className="p-3 text-left border-r border-gray-200 bg-gray-50 w-32">
                  Produto
                </th>
                <th className="p-3 text-center border-r border-gray-200 bg-gray-50 w-20">
                  Qtd
                </th>
                <th className="p-3 text-center border-r border-gray-200 bg-gray-50 w-32">
                  Origem Mod.
                </th>

                {STAGES_CONFIG.map((stage) => (
                  <th
                    key={stage.key}
                    colSpan={4}
                    className="p-2 text-center border-r border-gray-200 bg-gray-100/50"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {stage.label}
                    </div>
                  </th>
                ))}
              </tr>
              <tr>
                <th className="p-2 bg-gray-50 sticky left-0 z-20 border-r border-gray-200"></th>
                <th className="p-2 bg-gray-50 border-r border-gray-200"></th>
                <th className="p-2 bg-gray-50 border-r border-gray-200"></th>
                <th className="p-2 bg-gray-50 border-r border-gray-200"></th>

                {STAGES_CONFIG.map((stage) => (
                  <React.Fragment key={`${stage.key}-sub`}>
                    <th className="px-2 py-1 bg-white border-b border-r border-gray-200 text-[10px] w-32 font-medium">
                      Fornecedor
                    </th>
                    <th className="px-2 py-1 bg-white border-b border-r border-gray-200 text-[10px] w-16 font-medium">
                      Ent.
                    </th>
                    <th className="px-2 py-1 bg-white border-b border-r border-gray-200 text-[10px] w-16 font-medium">
                      Sai.
                    </th>
                    <th className="px-2 py-1 bg-white border-b border-r border-gray-200 text-[10px] w-24 font-medium">
                      Status
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 border-r border-gray-100 sticky left-0 bg-white hover:bg-gray-50 z-10 group-hover:bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    <div className="font-bold text-gray-900">
                      {order.orderNumber}
                    </div>
                    <div className="text-xs text-gray-500 truncate w-40">
                      {order.clientName}
                    </div>
                  </td>
                  <td className="p-3 border-r border-gray-100">
                    <div className="truncate w-28 text-gray-700">
                      {order.product}
                    </div>
                  </td>
                  <td className="p-3 text-center border-r border-gray-100 font-medium text-gray-900">
                    {order.quantity}
                  </td>
                  <td className="p-3 border-r border-gray-100 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${
                        order.modelingOrigin === 'Sow Brand'
                          ? 'bg-sow-green/10 text-sow-green border-sow-green/20'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}
                    >
                      {order.modelingOrigin}
                    </span>
                  </td>

                  {STAGES_CONFIG.map((stage) => {
                    const stageData = (order.stages as any)[stage.key];
                    return (
                      <React.Fragment key={`${order.id}-${stage.key}`}>
                        <td className="p-1 border-r border-gray-100">
                          <select
                            className="w-full bg-transparent text-[11px] border-none focus:ring-0 p-0 text-gray-600 cursor-pointer"
                            value={stageData?.supplierId || ''}
                            onChange={(e) =>
                              updateStage(
                                order.id,
                                stage.key,
                                'supplierId',
                                e.target.value
                              )
                            }
                          >
                            <option value="" disabled>
                              -
                            </option>
                            <option value="Sow Interno">Interno</option>
                            <option value="Cliente">Cliente</option>
                            {suppliers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1 border-r border-gray-100 text-xs text-center p-0">
                          <input
                            type="text"
                            className="w-full h-full text-center bg-transparent border-none focus:ring-0 text-gray-600 text-[11px]"
                            placeholder="-"
                            value={stageData?.dateIn || ''}
                            onChange={(e) =>
                              updateStage(
                                order.id,
                                stage.key,
                                'dateIn',
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="p-1 border-r border-gray-100 text-xs text-center p-0">
                          <input
                            type="text"
                            className="w-full h-full text-center bg-transparent border-none focus:ring-0 text-gray-600 text-[11px]"
                            placeholder="-"
                            value={stageData?.dateOut || ''}
                            onChange={(e) =>
                              updateStage(
                                order.id,
                                stage.key,
                                'dateOut',
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="p-1 border-r border-gray-100">
                          <select
                            value={stageData?.status || 'Pendente'}
                            onChange={(e) =>
                              updateStage(
                                order.id,
                                stage.key,
                                'status',
                                e.target.value
                              )
                            }
                            className={`w-full px-1 py-0.5 rounded text-[10px] font-bold border text-center cursor-pointer appearance-none ${getStatusColor(
                              stageData?.status
                            )}`}
                          >
                            <option value="Pendente">Pend.</option>
                            <option value="Em Andamento">Andam.</option>
                            <option value="Concluído">OK</option>
                            <option value="Atrasado">Atras.</option>
                          </select>
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="h-12 border-t border-gray-200 flex items-center justify-between px-4 bg-gray-50">
          <span className="text-xs text-gray-500">
            Mostrando {orders.length} pedidos
          </span>
        </div>
      </div>

      {/* NEW ORDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-900">
                Novo Pedido de Produção
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className={LABEL_STYLE}>Selecione o Cliente</label>
                <select
                  required
                  className={INPUT_STYLE}
                  value={newOrder.clientId}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, clientId: e.target.value })
                  }
                >
                  <option value="">-- Selecione --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_STYLE}>Produto / Peça</label>
                <input
                  required
                  className={INPUT_STYLE}
                  placeholder="Ex: Camiseta Oversized Algodão"
                  value={newOrder.product}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, product: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_STYLE}>Quantidade</label>
                  <input
                    required
                    type="number"
                    min="1"
                    className={INPUT_STYLE}
                    placeholder="100"
                    value={newOrder.quantity}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, quantity: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Origem Modelagem</label>
                  <select
                    className={INPUT_STYLE}
                    value={newOrder.modelingOrigin}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        modelingOrigin: e.target.value as any,
                      })
                    }
                  >
                    <option value="Sow Brand">Sow Brand</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button type="submit" className={BUTTON_PRIMARY}>
                  Criar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Production;
