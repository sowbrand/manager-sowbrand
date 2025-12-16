import React, { useState, useEffect } from 'react';
import { Plus, Factory, Edit2, Trash2, X } from 'lucide-react';
import { MOCK_SUPPLIERS } from '../constants';
import type { Supplier, SupplierCategory } from '../types';

const CATEGORIES: SupplierCategory[] = [
  'Malha',
  'Modelagem',
  'Corte',
  'Costura',
  'Bordado',
  'Estampa Silk',
  'Impressão DTF',
  'Prensa DTF',
  'Acabamento',
];

// Estilo corrigido para inputs
const INPUT_STYLE =
  'w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sow-green focus:border-transparent outline-none transition-all placeholder-gray-400';
const LABEL_STYLE = 'block text-sm font-bold text-gray-700 mb-1';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('sow_suppliers');
    return saved ? JSON.parse(saved) : MOCK_SUPPLIERS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({});

  useEffect(() => {
    localStorage.setItem('sow_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      setSuppliers(
        suppliers.map((s) =>
          s.id === formData.id ? ({ ...s, ...formData } as Supplier) : s
        )
      );
    } else {
      const newSupplier = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as Supplier;
      setSuppliers([...suppliers, newSupplier]);
    }
    setIsModalOpen(false);
    setFormData({});
  };

  const deleteSupplier = (id: string) => {
    if (confirm('Tem certeza que deseja remover este fornecedor?')) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
    }
  };

  const filteredSuppliers =
    selectedCategory === 'Todos'
      ? suppliers
      : suppliers.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all
              ${
                selectedCategory === 'Todos'
                  ? 'bg-sow-black text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all
               ${
                 selectedCategory === cat
                   ? 'bg-sow-black text-white shadow-md'
                   : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
               }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setFormData({ category: 'Costura' });
            setIsModalOpen(true);
          }}
          className="bg-sow-green hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-green-200 shrink-0 transition-colors"
        >
          <Plus size={20} />
          Novo Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-green-50 transition-colors">
                <Factory
                  className="text-gray-400 group-hover:text-sow-green"
                  size={24}
                />
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium border border-gray-200">
                {supplier.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {supplier.name}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Responsável:{' '}
              <span className="font-medium text-gray-700">
                {supplier.contact}
              </span>
            </p>
            <div className="flex gap-2 border-t border-gray-50 pt-4">
              <button
                onClick={() => {
                  setFormData(supplier);
                  setIsModalOpen(true);
                }}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-600 transition-colors flex justify-center items-center gap-2"
              >
                <Edit2 size={14} /> Editar
              </button>
              <button
                onClick={() => deleteSupplier(supplier.id)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">
                {formData.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className={LABEL_STYLE}>Nome da Empresa</label>
                <input
                  required
                  className={INPUT_STYLE}
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Têxtil Silva"
                />
              </div>
              <div>
                <label className={LABEL_STYLE}>Categoria</label>
                <select
                  className={INPUT_STYLE}
                  value={formData.category || 'Costura'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as SupplierCategory,
                    })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_STYLE}>
                  Nome do Responsável / Contato
                </label>
                <input
                  required
                  className={INPUT_STYLE}
                  value={formData.contact || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  placeholder="Ex: Maria"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sow-green text-white font-bold rounded-lg hover:bg-green-600 shadow-lg shadow-green-100 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
