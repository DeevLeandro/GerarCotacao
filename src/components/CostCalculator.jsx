/**
 * components/CostCalculator.jsx
 * Calculadora de custos com linhas livres e dinâmicas.
 * Adicione qualquer custo: nome + USD ou %. Tudo soma automaticamente.
 */
import { genId }        from '../utils/helpers';
import { fmtBRL, fmtUSD } from '../utils/helpers';
import {
  QUICK_ITEMS,
  getLineUSD,
  getTotalUSD,
  getTotalBRL,
  applyDesiredBRL,
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
  const fxNum    = parseFloat(fx) || 1;

  /* ── Handlers ─────────────────────────────────────────── */
  const updateLine = (id, field, val) =>
    onLinesChange(lines.map(l => l.id === id ? { ...l, [field]: val } : l));

  const removeLine = id =>
    onLinesChange(lines.filter(l => l.id !== id));

  const addLine = (name = '', usd = '', pct = '') =>
    onLinesChange([...lines, { id: genId(), name, usd, pct }]);

  const clearAll = () => {
    if (!lines.length || window.confirm('Limpar todas as linhas?'))
      onLinesChange([]);
  };

  const applyDesired = () => {
    const target = parseFloat(desiredTotal);
    if (!target) return;
    onLinesChange(applyDesiredBRL(lines, fx, target));
  };

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div>
      <div className="alert alert-warning mb-16" style={{ marginBottom: 16 }}>
        🔒 Este detalhamento <strong>NÃO</strong> aparece no PDF do cliente.
      </div>

      {/* ── Câmbio ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div className="form-group" style={{ width: 180 }}>
          <label>Câmbio R$/USD</label>
          <input
            type="number" step="0.01" value={fx}
            onChange={e => onFxChange(e.target.value)}
            placeholder="4.98"
          />
        </div>
      </div>

      {/* ── Botões rápidos ──────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Adicionar rápido:
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

      {/* ── Tabela de linhas ────────────────────────────── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Descrição', 'USD (fixo)', '% (da base)', 'R$ (auto)', ''].map((h, i) => (
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
              <td colSpan={5} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                Nenhuma linha. Use os botões acima ou clique em "+ Adicionar".
              </td>
            </tr>
          )}
          {lines.map((l, i) => {
            const valUSD = getLineUSD(l, lines);
            const valBRL = valUSD * fxNum;
            return (
              <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 6px' }}>
                  <input
                    value={l.name}
                    onChange={e => updateLine(l.id, 'name', e.target.value)}
                    placeholder="Ex: PIS"
                    style={{ width: '100%' }}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: 130 }}>
                  <input
                    type="number" step="0.01" min="0"
                    value={l.usd}
                    onChange={e => updateLine(l.id, 'usd', e.target.value)}
                    placeholder="0.00"
                    style={{ width: '100%', textAlign: 'right', fontFamily: 'var(--font-mono)' }}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: 110 }}>
                  <input
                    type="number" step="0.01" min="0"
                    value={l.pct}
                    onChange={e => updateLine(l.id, 'pct', e.target.value)}
                    placeholder="% base"
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
                    title="Remover"
                  >✕</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Ações ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 24 }}>
        <button className="btn btn-secondary" onClick={() => addLine()}>
          + Adicionar linha
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={clearAll}
          style={{ color: 'var(--text3)' }}
        >
          Limpar tudo
        </button>
      </div>

      <div className="divider" />

      {/* ── Totais ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div className="total-box" style={{ padding: '16px 20px' }}>
          <div className="total-label">Total USD</div>
          <div className="total-brl" style={{ fontSize: 24 }}>{fmtUSD(totalUSD)}</div>
        </div>
        <div className="total-box" style={{ padding: '16px 20px' }}>
          <div className="total-label">Total R$</div>
          <div className="total-brl" style={{ fontSize: 24 }}>{fmtBRL(totalBRL)}</div>
        </div>
      </div>

      {/* ── Valor desejado ──────────────────────────────── */}
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
          💡 Valor final desejado (R$)
        </span>
        <input
          type="number"
          value={desiredTotal}
          onChange={e => onDesiredChange(e.target.value)}
          placeholder="Ex: 50000"
          style={{ width: 160, textAlign: 'right', fontFamily: 'var(--font-mono)' }}
        />
        <button className="btn btn-secondary" onClick={applyDesired}>
          Calcular margem
        </button>
        {desiredTotal && (
          <span style={{
            fontSize: 12, color: 'var(--text3)',
          }}>
            Diferença: {fmtBRL(parseFloat(desiredTotal) - totalBRL)}
          </span>
        )}
      </div>
    </div>
  );
}
