/**
 * components/ImportParser.jsx
 * Carrega PDF do computador ou cola texto.
 * Extrai produtos E detecta valor total da invoice para sugerir
 * preenchimento automático dos custos.
 */
import { useState, useRef } from 'react';
import { parseInvoice } from '../utils/invoiceParser';
import { fmtUSD } from '../utils/helpers';
import { QUICK_ITEMS } from '../services/costCalculator';
import { genId } from '../utils/helpers';

const PDFJS_CDN    = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
    const s = document.createElement('script');
    s.src = PDFJS_CDN;
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve(window.pdfjsLib);
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function extractTextFromPDF(file) {
  const lib = await loadPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await lib.getDocument({ data: buf }).promise;
  let full  = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items   = content.items;
    if (!items.length) continue;
    const sorted = [...items].sort((a, b) => {
      const dy = b.transform[5] - a.transform[5];
      return Math.abs(dy) > 3 ? dy : a.transform[4] - b.transform[4];
    });
    let lines = [], cur = [], lastY = null;
    for (const item of sorted) {
      const y = Math.round(item.transform[5]);
      if (lastY === null || Math.abs(y - lastY) > 3) {
        if (cur.length) lines.push(cur.map(i => i.str).join(' '));
        cur = [item]; lastY = y;
      } else { cur.push(item); }
    }
    if (cur.length) lines.push(cur.map(i => i.str).join(' '));
    full += lines.join('\n') + '\n';
  }
  return full;
}

// Monta linhas de custo padrão a partir do valor total da invoice (mercadoria)
function buildCostLinesFromTotal(totalUSD) {
  const merc  = totalUSD;
  const frete = +(merc * 0.085).toFixed(2); // ~8.5% como estimativa de frete
  return [
    { id: genId(), name: 'Mercadoria',          usd: merc.toFixed(2),  pct: '' },
    { id: genId(), name: 'Frete Internacional', usd: frete.toFixed(2), pct: '' },
    { id: genId(), name: 'ICMS',                usd: '',               pct: '17' },
    { id: genId(), name: 'IOF',                 usd: '',               pct: '3.5' },
    { id: genId(), name: 'Taxa Siscomex',       usd: '26.64',          pct: '' },
    { id: genId(), name: 'Desembaraço',         usd: '331.33',         pct: '' },
    { id: genId(), name: 'Delivery Fee',        usd: '90',             pct: '' },
    { id: genId(), name: 'Desconsolidação',     usd: '45',             pct: '' },
    { id: genId(), name: 'Taxa ADM',            usd: '45',             pct: '' },
    { id: genId(), name: 'CCT',                 usd: '15',             pct: '' },
    { id: genId(), name: 'Pick-up US',          usd: '60',             pct: '' },
  ];
}

export default function ImportParser({ onImport, onCostSuggestion }) {
  const [text, setText]         = useState('');
  const [result, setResult]     = useState(null);
  const [detected, setDetected] = useState(null);   // { totalUSD, currency }
  const [loading, setLoading]   = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError]       = useState('');
  const [applied, setApplied]   = useState(false);
  const fileRef = useRef();

  const runParse = (rawText) => {
    const { products, detected: det } = parseInvoice(rawText);
    setResult(products);
    setDetected(det?.totalUSD ? det : null);
    setApplied(false);
  };

  const parse = () => { setError(''); runParse(text); };
  const clear = () => { setText(''); setResult(null); setDetected(null); setFileName(''); setError(''); setApplied(false); };

  const confirm = () => {
    if (result?.length) {
      onImport(result);
      setResult(null); setText(''); setFileName(''); setDetected(null); setApplied(false);
    }
  };

  const applyCosts = () => {
    if (!detected?.totalUSD || !onCostSuggestion) return;
    const lines = buildCostLinesFromTotal(detected.totalUSD);
    onCostSuggestion(lines);
    setApplied(true);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { setError('Selecione um arquivo PDF válido.'); return; }
    setError(''); setLoading(true); setFileName(file.name);
    try {
      const extracted = await extractTextFromPDF(file);
      setText(extracted);
      runParse(extracted);
    } catch (err) {
      console.error(err);
      setError('Erro ao ler o PDF. Tente copiar o texto manualmente.');
    } finally { setLoading(false); e.target.value = ''; }
  };

  return (
    <div>
      <div className="alert alert-info mb-16">
        Carregue um PDF ou cole o texto. O sistema extrai os produtos <strong>e</strong> detecta
        o valor total para pré-preencher os custos de importação automaticamente.
      </div>

      {/* ── Drop zone PDF ───────────────────────────── */}
      <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFile} />
      <div
        onClick={() => !loading && fileRef.current.click()}
        style={{
          border: '2px dashed var(--border2)', borderRadius: 'var(--radius-lg)',
          padding: '32px 24px', textAlign: 'center',
          cursor: loading ? 'wait' : 'pointer', marginBottom: 16,
          background: 'var(--bg3)', transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-muted)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
      >
        {loading ? (
          <div><div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div><div style={{ color: 'var(--text2)', fontSize: 14 }}>Lendo PDF...</div></div>
        ) : fileName ? (
          <div><div style={{ fontSize: 28, marginBottom: 8 }}>📄</div><div style={{ color: 'var(--accent2)', fontSize: 14, fontWeight: 600 }}>{fileName}</div><div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>Clique para trocar</div></div>
        ) : (
          <div><div style={{ fontSize: 28, marginBottom: 8 }}>📂</div><div style={{ color: 'var(--text2)', fontSize: 14, fontWeight: 500 }}>Clique para selecionar um PDF</div><div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>Proforma invoice, packing list, cotação...</div></div>
        )}
      </div>

      {error && (
        <div className="alert" style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)', color: 'var(--danger)', marginBottom: 12 }}>⚠ {error}</div>
      )}

      {/* ── Sugestão de custos detectados ───────────── */}
      {detected?.totalUSD && onCostSuggestion && (
        <div style={{
          background: applied ? 'rgba(82,196,122,0.08)' : 'rgba(200,169,110,0.08)',
          border: `1px solid ${applied ? 'rgba(82,196,122,0.3)' : 'rgba(200,169,110,0.25)'}`,
          borderRadius: 'var(--radius)',
          padding: '14px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: applied ? 'var(--success)' : 'var(--accent2)', marginBottom: 3 }}>
              {applied ? '✓ Custos preenchidos na calculadora!' : '💡 Valor total detectado na invoice'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              {applied
                ? 'Vá em ⚙️ Custos para ajustar os valores conforme necessário.'
                : `${fmtUSD(detected.totalUSD)} — deseja pré-preencher a calculadora de custos?`
              }
            </div>
          </div>
          {!applied && (
            <button className="btn btn-primary" onClick={applyCosts}>
              ⚡ Preencher Custos
            </button>
          )}
        </div>
      )}

      {/* ── Divisor ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ color: 'var(--text3)', fontSize: 12 }}>ou cole o texto manualmente</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <div className="form-group mb-16">
        <label>Texto da Invoice</label>
        <textarea
          className="import-area"
          value={text}
          onChange={e => { setText(e.target.value); setResult(null); setDetected(null); }}
          style={{ minHeight: 120 }}
          placeholder="Cole aqui o conteúdo da invoice..."
        />
      </div>

      <div className="row gap-8 mb-16">
        <button className="btn btn-primary" onClick={parse} disabled={!text.trim() || loading}>🔍 Extrair Produtos</button>
        <button className="btn btn-secondary" onClick={clear}>Limpar</button>
      </div>

      {/* ── Resultado ───────────────────────────────── */}
      {result !== null && (
        <div className="fade-in">
          <div className="divider" />
          <div className="row-between mb-16">
            <span className="text-muted" style={{ fontSize: 13 }}>
              {result.length > 0 ? `✓ ${result.length} produto(s) identificado(s)` : '⚠ Nenhum produto encontrado.'}
            </span>
            {result.length > 0 && (
              <button className="btn btn-success" onClick={confirm}>✓ Importar {result.length} produto(s)</button>
            )}
          </div>
          {result.map((p, i) => (
            <div key={p.id} className="product-item fade-in" style={{ marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div className="product-num">#{i + 1}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 60px', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--accent-muted)', marginBottom: 2 }}>Part Number</div>
                    <div className="mono" style={{ fontSize: 13 }}>{p.partNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--accent-muted)', marginBottom: 2 }}>Descrição</div>
                    <div style={{ fontSize: 13 }}>{p.description}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--accent-muted)', marginBottom: 2 }}>Qtd</div>
                    <div style={{ fontSize: 13 }}>{p.qty}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
