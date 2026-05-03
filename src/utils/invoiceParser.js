/**
 * utils/invoiceParser.js
 * Extrai produtos E dados financeiros de uma proforma invoice.
 */
import { genId } from './helpers';

/**
 * Resultado completo da leitura de uma invoice.
 * @returns {{ products, detected: { totalUSD, currency } }}
 */
export function parseInvoice(text) {
  return {
    products: parseProducts(text),
    detected: detectFinancials(text),
  };
}

/** Mantida para compatibilidade */
export function parseInvoiceText(text) {
  return parseProducts(text);
}

// ── Extrai produtos ──────────────────────────────────────────
function parseProducts(text) {
  const lines     = text.split('\n').map(l => l.trim()).filter(Boolean);
  const products  = [];

  const fullLineRegex = /^([A-Z0-9\-\/\.]{3,})\s+(.+?)\s+(\d+)\s+(?:NEW|USED|OH|SV|AR)/i;
  const simpleRegex   = /^([A-Z0-9\-\/\.]{4,})\s{2,}(.{8,})/;
  const skipPattern   = /HS Code|ECCN|Net weight|Phone|Email|Terms|Prepaid|Total|Page \d|Date|FOB|Quote|Invoice|Name|Address|Customer|Price Each|Part Number|Description|Qty|Condition/i;

  for (const line of lines) {
    if (skipPattern.test(line)) continue;

    const m1 = fullLineRegex.exec(line);
    if (m1) {
      const desc = cleanDesc(m1[2]);
      if (desc.length > 3)
        products.push({ id: genId(), partNumber: m1[1], description: desc, qty: parseInt(m1[3], 10) || 1 });
      continue;
    }

    const m2 = simpleRegex.exec(line);
    if (m2) {
      const desc = cleanDesc(m2[2]);
      if (desc.length > 5)
        products.push({ id: genId(), partNumber: m2[1], description: desc, qty: 1 });
    }
  }

  const seen = new Set();
  return products
    .filter(p => { if (seen.has(p.partNumber)) return false; seen.add(p.partNumber); return true; })
    .slice(0, 60);
}

// ── Detecta valores financeiros no texto ────────────────────
function detectFinancials(text) {
  const result = { totalUSD: null, currency: null };

  // Padrões para capturar total da invoice
  // Ex: "Total   USD 9,201.54" / "Total $9,201.54" / "USD 9.201,54"
  const patterns = [
    // "Total USD 9,201.54" ou "Total   USD 9.201,54"
    /total[\s\S]{0,30}USD[\s\$]*([\d.,]+)/i,
    // "USD 9,201.54" sozinho
    /USD[\s\$]*([\d][0-9.,]+)/i,
    // "$9,201.54"
    /\$\s*([\d][0-9.,]+)/,
    // "9,201.54" após palavra Total
    /Total\D{0,10}([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/i,
  ];

  for (const re of patterns) {
    const m = re.exec(text);
    if (m) {
      const raw = m[1].replace(/\s/g, '');
      const val = parseAmount(raw);
      if (val > 10) { // ignora valores muito pequenos
        result.totalUSD  = val;
        result.currency  = 'USD';
        break;
      }
    }
  }

  return result;
}

/** Converte string de valor para float, suportando formatos BR e US */
function parseAmount(str) {
  // "9.201,54" → 9201.54  (BR)
  // "9,201.54" → 9201.54  (US)
  const hasDotThenComma  = /\d\.\d{3},\d/.test(str); // BR: 1.234,56
  const hasCommaThenDot  = /\d,\d{3}\.\d/.test(str); // US: 1,234.56

  if (hasDotThenComma) return parseFloat(str.replace(/\./g, '').replace(',', '.'));
  if (hasCommaThenDot)  return parseFloat(str.replace(/,/g, ''));
  // ambíguo — tenta remover separador de milhar mais comum
  const clean = str.replace(/,/g, '');
  return parseFloat(clean) || 0;
}

function cleanDesc(raw) {
  return raw
    .replace(/HS Code[^,\n]*/gi, '')
    .replace(/ECCN[^\s,\n]*/gi, '')
    .replace(/Net weight[^\n]*/gi, '')
    .replace(/Alt\s+[\w\-\/,\s]+$/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
