/**
 * components/ProductList.jsx
 * Lista editável de produtos da proposta.
 */
import { genId } from '../utils/helpers';

export default function ProductList({ products = [], onChange }) {
  const update = (id, field, val) =>
    onChange(products.map(p => (p.id === id ? { ...p, [field]: val } : p)));

  const remove = id => onChange(products.filter(p => p.id !== id));

  const add = () =>
    onChange([...products, { id: genId(), partNumber: '', description: '', qty: 1 }]);

  return (
    <div>
      {products.map((p, i) => (
        <div key={p.id} className="product-item fade-in">
          <div style={{ flex: 1 }}>
            <div className="product-num">#{String(i + 1).padStart(2, '0')}</div>
            <div className="product-fields">
              <div className="form-group">
                <label>Part / Ref.</label>
                <input
                  value={p.partNumber}
                  onChange={e => update(p.id, 'partNumber', e.target.value)}
                  placeholder="Ex: 21-11328"
                />
              </div>
              <div className="form-group">
                <label>Descrição completa</label>
                <input
                  value={p.description}
                  onChange={e => update(p.id, 'description', e.target.value)}
                  placeholder="Ex: Filter Element — Alt 206-076-034-003"
                />
              </div>
              <div className="form-group">
                <label>Qtd.</label>
                <input
                  type="number"
                  min="1"
                  value={p.qty}
                  onChange={e => update(p.id, 'qty', e.target.value)}
                />
              </div>
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => remove(p.id)}
            title="Remover produto"
          >✕</button>
        </div>
      ))}

      <div className="mt-16">
        <button className="btn btn-secondary" onClick={add}>
          + Adicionar Produto
        </button>
      </div>
    </div>
  );
}
