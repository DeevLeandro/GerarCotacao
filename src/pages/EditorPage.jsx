/**
 * pages/EditorPage.jsx
 * Editor principal com abas: Produtos | Custos | Importar | Cliente
 * ADICIONADO: campos FOB e Customer Ref # na aba Cliente
 */
import { useState } from 'react';
import ProductList    from '../components/ProductList';
import CostCalculator from '../components/CostCalculator';
import ImportParser   from '../components/ImportParser';
import { getTotalBRL, getTotalUSD } from '../services/costCalculator';
import { fmtBRL, fmtUSD } from '../utils/helpers';

export default function EditorPage({
  proposal, onProposalChange,
  lines, fx, onLinesChange, onFxChange,
  desiredTotal, onDesiredChange,
  adminMode,
  onPreview, onSave,
}) {
  const [tab, setTab] = useState('products');

  const TABS = adminMode
    ? [
        { id: 'products', label: '📦 Produtos' },
        { id: 'costs',    label: '⚙️ Custos'   },
        { id: 'import',   label: '📥 Importar'  },
        { id: 'client',   label: '👤 Cliente'   },
      ]
    : [
        { id: 'products', label: '📦 Produtos' },
        { id: 'client',   label: '👤 Cliente'   },
        { id: 'import',   label: '📥 Importar'  },
      ];

  const set = (field, val) => onProposalChange({ ...proposal, [field]: val });
  const totalBRL = getTotalBRL(lines, fx);
  const totalUSD = getTotalUSD(lines);

  const handleCostSuggestion = (suggestedLines) => {
    onLinesChange(suggestedLines);
    setTab('costs');
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
        <div className="tab-actions">
          <button className="btn btn-secondary" onClick={onSave}>💾 Salvar</button>
          <button className="btn btn-primary btn-lg" onClick={onPreview}>👁 Preview PDF</button>
        </div>
      </div>

      {/* PRODUTOS */}
      {tab === 'products' && (
        <div className="fade-in">
          <div className="card">
            <div className="card-title">Produtos / Itens</div>
            <ProductList
              products={proposal.products || []}
              onChange={prods => set('products', prods)}
            />
          </div>
          {adminMode && (
            <div className="card">
              <div className="card-title">Resumo Rápido</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="total-box" style={{ padding: '16px 20px' }}>
                  <div className="total-label">Total USD</div>
                  <div className="total-brl" style={{ fontSize: 24 }}>{fmtUSD(totalUSD)}</div>
                </div>
                <div className="total-box" style={{ padding: '16px 20px' }}>
                  <div className="total-label">Total R$</div>
                  <div className="total-brl" style={{ fontSize: 24 }}>{fmtBRL(totalBRL)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CUSTOS (admin) */}
      {tab === 'costs' && adminMode && (
        <div className="fade-in">
          <div className="card">
            <div className="card-title">Calculadora de Custos (Admin)</div>
            <CostCalculator
              lines={lines} fx={fx}
              onLinesChange={onLinesChange} onFxChange={onFxChange}
              desiredTotal={desiredTotal} onDesiredChange={onDesiredChange}
            />
          </div>
        </div>
      )}

      {/* IMPORTAR */}
      {tab === 'import' && (
        <div className="fade-in">
          <div className="card">
            <div className="card-title">Importar da Invoice</div>
            <ImportParser
              onImport={prods => {
                set('products', [...(proposal.products || []), ...prods]);
                setTab('products');
              }}
              onCostSuggestion={adminMode ? handleCostSuggestion : undefined}
            />
          </div>
        </div>
      )}

      {/* CLIENTE */}
      {tab === 'client' && (
        <div className="fade-in">
          <div className="card">
            <div className="card-title">Dados do Cliente</div>
            <div className="form-grid-2 mb-16">
              <div className="form-group">
                <label>Nome / Empresa</label>
                <input value={proposal.clientName || ''} onChange={e => set('clientName', e.target.value)} placeholder="Ex: Thorus Taxi Aéreo" />
              </div>
              <div className="form-group">
                <label>Contato / E-mail</label>
                <input value={proposal.clientContact || ''} onChange={e => set('clientContact', e.target.value)} placeholder="Ex: ops@thorus.com" />
              </div>
              <div className="form-group">
                <label>Número da Proposta</label>
                <input value={proposal.number || ''} onChange={e => set('number', e.target.value)} placeholder="Ex: 2026-0012" />
              </div>
              <div className="form-group">
                <label>Validade (dias)</label>
                <input type="number" value={proposal.validityDays || 10} onChange={e => set('validityDays', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Terms (Condições de Pagamento)</label>
                <input value={proposal.paymentTerms || ''} onChange={e => set('paymentTerms', e.target.value)} placeholder="Ex: Prepaid ACH" />
              </div>
              <div className="form-group">
                <label>FOB</label>
                <input value={proposal.fob || ''} onChange={e => set('fob', e.target.value)} placeholder="Ex: EXWKS LUCAS" />
              </div>
              <div className="form-group">
                <label>Customer Ref. #</label>
                <input value={proposal.customerRef || ''} onChange={e => set('customerRef', e.target.value)} placeholder="Ex: PT-PST" />
              </div>
              <div className="form-group">
                <label>Prazo de Entrega</label>
                <input value={proposal.deliveryDays || ''} onChange={e => set('deliveryDays', e.target.value)} placeholder="Ex: 30–45 dias úteis" />
              </div>
            </div>
            <div className="form-group mb-16">
              <label>Observações para o Cliente</label>
              <textarea rows={5} value={proposal.observations || ''} onChange={e => set('observations', e.target.value)} placeholder="Observações, lead times, condições especiais..." />
            </div>
            <div className="form-group">
              <label>Condições Comerciais (deixe em branco para usar padrão)</label>
              <textarea rows={4} value={proposal.conditions || ''} onChange={e => set('conditions', e.target.value)} placeholder="Deixe em branco para usar as condições padrão..." />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
