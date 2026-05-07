/**
 * components/CostCalculator.jsx
 * CALCULADORA COM AS REGRAS CORRETAS
 */

import { genId } from '../utils/helpers';
import { fmtBRL, fmtUSD } from '../utils/helpers';
import {
  QUICK_ITEMS,
  getLineUSD,
  getTotalUSD,
  getTotalBRL,
  applyDesiredBRL,
  getValorAduaneiroUSD,
  getValorAgregadoUSD,
  getICMSSaidaUSD,
  getIOFUSD,
  getTotalSemICMSSaidaUSD,
} from '../services/costCalculator';

export default function CostCalculator({
  lines,
  fx,
  onLinesChange,
  onFxChange,
  desiredTotal,
  onDesiredChange,
}) {
  const totalUSD = getTotalUSD(lines);
  const totalBRL = getTotalBRL(lines, fx);
  const fxNum = parseFloat(fx) || 1;
  
  // Cálculos especiais
  const valorAduaneiroUSD = getValorAduaneiroUSD(lines);
  const valorAduaneiroBRL = valorAduaneiroUSD * fxNum;
  const valorAgregadoUSD = getValorAgregadoUSD(lines);
  const valorAgregadoBRL = valorAgregadoUSD * fxNum;
  const icmsSaidaUSD = getICMSSaidaUSD(lines);
  const icmsSaidaBRL = icmsSaidaUSD * fxNum;
  const iofUSD = getIOFUSD(lines);
  const iofBRL = iofUSD * fxNum;
  const totalSemICMS = getTotalSemICMSSaidaUSD(lines);
  const totalSemICMSBRL = totalSemICMS * fxNum;

  const updateLine = (id, field, val) =>
    onLinesChange(lines.map(l => l.id === id ? { ...l, [field]: val } : l));

  const removeLine = id =>
    onLinesChange(lines.filter(l => l.id !== id));

  const addLine = (name = '', usd = '', pct = '') =>
    onLinesChange([...lines, { id: genId(), name, usd, pct }]);

  const clearAll = () => {
    if (!lines.length || window.confirm('Clear all lines?'))
      onLinesChange([]);
  };

  const applyDesired = () => {
    const target = parseFloat(desiredTotal);
    if (!target) return;
    onLinesChange(applyDesiredBRL(lines, fx, target));
  };

  return (
    <div>
      {/* REGRAS DE CÁLCULO */}
      <div className="alert alert-warning mb-16" style={{ 
        marginBottom: 16, 
        background: '#444444',
        fontSize: 12,
        padding: '12px 16px',
        borderRadius: 8,
      }}>
        <strong>📐 Regras de Cálculo:</strong><br />
        • <strong>Valor Aduaneiro</strong> = Mercadoria + Frete Internacional = <strong>{fmtUSD(valorAduaneiroUSD)}</strong><br />
        • <strong>IOF</strong> = 3.5% sobre Frete = <strong>{fmtUSD(iofUSD)}</strong><br />
        • <strong>Base ICMS Entrada, IPI, PIS, COFINS, Imp. Importação</strong> = Valor Aduaneiro<br />
        • <strong>Valor Agregado</strong> = Total (sem ICMS Saída) - Valor Aduaneiro = <strong>{fmtUSD(valorAgregadoUSD)}</strong><br />
        • <strong>ICMS Saída</strong> = 17% sobre Valor Agregado = <strong>{fmtUSD(icmsSaidaUSD)}</strong>
      </div>

      {/* Câmbio */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div className="form-group" style={{ width: 180 }}>
          <label>Exchange Rate USD/BRL</label>
          <input
            type="number" step="0.01" value={fx}
            onChange={e => onFxChange(e.target.value)}
            placeholder="5.20"
          />
        </div>
      </div>

      {/* Botões rápidos */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Quick Add:
        </span>
        {QUICK_ITEMS.map(q => (
          <button
            key={q.label}
            className="btn btn-secondary btn-sm"
            onClick={() => addLine(q.label, q.usd, q.pct)}
            style={{ fontSize: 12, padding: '4px 10px' }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Tabela de custos */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4, fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Descrição', 'USD (fixo)', '%', 'BRL (auto)', ''].map((h, i) => (
              <th key={i} style={{
                fontSize: 11, fontWeight: 600, color: 'var(--text3)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '0 6px 10px',
                textAlign: i >= 3 ? 'right' : 'left',
                width: i === 4 ? 36 : 'auto',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text3)' }}>
                No cost lines. Use buttons above.
              </td>
            </tr>
          )}
          {lines.map((l, i) => {
            const valUSD = getLineUSD(l, lines);
            const valBRL = valUSD * fxNum;
            const isSpecial = l.name?.toLowerCase().includes('icms') || l.name?.toLowerCase().includes('iof');
            
            return (
              <tr key={l.id} style={{ 
                borderBottom: '1px solid var(--border)',
                background: isSpecial ? 'rgba(200,169,110,0.08)' : 'transparent',
              }}>
                <td style={{ padding: '6px 6px' }}>
                  <input
                    value={l.name}
                    onChange={e => updateLine(l.id, 'name', e.target.value)}
                    placeholder="Ex: Mercadoria"
                    style={{ width: '100%', fontWeight: isSpecial ? 500 : 'normal' }}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: 120 }}>
                  <input
                    type="number" step="0.01" min="0"
                    value={l.usd}
                    onChange={e => updateLine(l.id, 'usd', e.target.value)}
                    placeholder="0.00"
                    style={{ width: '100%', textAlign: 'right', fontFamily: 'var(--font-mono)' }}
                    disabled={l.name?.toLowerCase().includes('icms saída') || l.name?.toLowerCase().includes('iof')}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: 80 }}>
                  <input
                    type="number" step="0.01" min="0"
                    value={l.pct}
                    onChange={e => updateLine(l.id, 'pct', e.target.value)}
                    placeholder="%"
                    style={{ width: '100%', textAlign: 'right', fontFamily: 'var(--font-mono)' }}
                  />
                </td>
                <td style={{
                  padding: '6px 6px', textAlign: 'right',
                  fontFamily: 'var(--font-mono)', fontSize: 13,
                  color: valBRL > 0 ? 'var(--text2)' : 'var(--text3)',
                  width: 120,
                }}>
                  {valBRL > 0 ? fmtBRL(valBRL) : '—'}
                </td>
                <td style={{ padding: '6px 2px', textAlign: 'center', width: 36 }}>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeLine(l.id)}
                    style={{ padding: '4px 8px', fontSize: 12 }}
                    title="Remove"
                  >✕</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 24 }}>
        <button className="btn btn-secondary" onClick={() => addLine()}>+ Add line</button>
        <button className="btn btn-secondary btn-sm" onClick={clearAll} style={{ color: 'var(--text3)' }}>Clear all</button>
      </div>

      <div className="divider" />

      {/* TOTAIS DETALHADOS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="total-box" style={{ padding: '16px 20px', background: '#272727', borderRadius: 8 }}>
          <div className="total-label" style={{ fontSize: 11 }}>💰 VALOR ADUANEIRO</div>
          <div className="total-brl" style={{ fontSize: 20 }}>{fmtUSD(valorAduaneiroUSD)}</div>
          <div style={{ fontSize: 14, color: '#ffffff' }}>{fmtBRL(valorAduaneiroBRL)}</div>
          <div style={{ fontSize: 10, color: '#ffffff', marginTop: 6 }}>Mercadoria + Frete</div>
        </div>
        <div className="total-box" style={{ padding: '16px 20px', background: '#272727', borderRadius: 8 }}>
          <div className="total-label" style={{ fontSize: 11 }}>📈 VALOR AGREGADO</div>
          <div className="total-brl" style={{ fontSize: 20 }}>{fmtUSD(valorAgregadoUSD)}</div>
          <div style={{ fontSize: 14, color: '#ffffff' }}>{fmtBRL(valorAgregadoBRL)}</div>
          <div style={{ fontSize: 10, color: '#ffffff', marginTop: 6 }}>Total - Valor Aduaneiro</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="total-box" style={{ padding: '16px 20px' }}>
          <div className="total-label">TOTAL USD</div>
          <div className="total-brl" style={{ fontSize: 24 }}>{fmtUSD(totalUSD)}</div>
          <div style={{ fontSize: 11, color: '#ffffff', marginTop: 6 }}>ICMS Saída: {fmtUSD(icmsSaidaUSD)}</div>
        </div>
        <div className="total-box" style={{ padding: '16px 20px' }}>
          <div className="total-label">TOTAL BRL</div>
          <div className="total-brl" style={{ fontSize: 24 }}>{fmtBRL(totalBRL)}</div>
          <div style={{ fontSize: 11, color: '#ffffff', marginTop: 6 }}>ICMS Saída: {fmtBRL(icmsSaidaBRL)}</div>
        </div>
      </div>

      {/* Valor desejado */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
          💡 Desired final value (BRL)
        </span>
        <input
          type="number"
          value={desiredTotal}
          onChange={e => onDesiredChange(e.target.value)}
          placeholder="Ex: 50000"
          style={{ width: 160, textAlign: 'right', fontFamily: 'var(--font-mono)' }}
        />
        <button className="btn btn-secondary" onClick={applyDesired}>
          Calculate margin
        </button>
        {desiredTotal && (
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>
            Difference: {fmtBRL(parseFloat(desiredTotal) - totalBRL)}
          </span>
        )}
      </div>
    </div>
  );
}