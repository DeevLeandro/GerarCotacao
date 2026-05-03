/**
 * services/costCalculator.js
 * Calculadora dinâmica — linhas livres, sem campos fixos.
 * Cada linha tem: id, name, usd (valor fixo), pct (% sobre soma USD das demais).
 */
import { genId } from '../utils/helpers';

export const DEFAULT_FX = '4.98';

/** Linhas padrão pré-populadas */
export function makeDefaultLines() {
  return [
    { id: genId(), name: 'Mercadoria',           usd: '',   pct: '' },
    { id: genId(), name: 'Frete Internacional',  usd: '',    pct: '' },
    { id: genId(), name: 'ICMS',                 usd: '',       pct: '17' },
    { id: genId(), name: 'Taxa Siscomex',        usd: '',  pct: '' },
    { id: genId(), name: 'Desembaraço',          usd: '', pct: '' },
    { id: genId(), name: 'Delivery Fee',         usd: '',     pct: '' },
  ];
}

/** Sugestões rápidas para adicionar linha */
export const QUICK_ITEMS = [
  { label: 'Mercadoria',       usd: '',      pct: '' },
  { label: 'Frete Intl.',      usd: '',      pct: '' },
  { label: 'ICMS 17%',        usd: '',      pct: '17' },
  { label: 'IOF 3,5%',        usd: '',      pct: '3.5' },
  { label: 'Siscomex',        usd: '', pct: '' },
  { label: 'Desembaraço',     usd: '', pct: '' },
  { label: 'Delivery Fee',    usd: '',    pct: '' },
  { label: 'Desconsolidação', usd: '',    pct: '' },
  { label: 'Taxa ADM',        usd: '',    pct: '' },
  { label: 'CCT',             usd: '',    pct: '' },
  { label: 'Pick-up US',      usd: '',    pct: '' },
  { label: 'IPI',             usd: '',      pct: '' },
  { label: 'PIS',             usd: '',      pct: '' },
  { label: 'COFINS',          usd: '',      pct: '' },
  { label: 'Armazenagem',     usd: '',      pct: '' },
  { label: 'Honorários',      usd: '',      pct: '' },
  { label: 'Imp. Importação', usd: '',      pct: '' },
];

/**
 * Calcula o valor USD de uma linha.
 * Se tiver usd > 0, usa usd direto.
 * Se tiver pct > 0, aplica sobre a soma das linhas com usd direto (exceto ela mesma).
 */
export function getLineUSD(line, allLines) {
  const usd = parseFloat(line.usd) || 0;
  const pct = parseFloat(line.pct) || 0;
  if (usd > 0) return usd;
  if (pct > 0) {
    const base = allLines.reduce((sum, l) => {
      if (l.id === line.id) return sum;
      return sum + (parseFloat(l.usd) || 0);
    }, 0);
    return base * pct / 100;
  }
  return 0;
}

/** Soma total USD */
export function getTotalUSD(lines) {
  return lines.reduce((sum, l) => sum + getLineUSD(l, lines), 0);
}

/** Total em BRL */
export function getTotalBRL(lines, fx) {
  return getTotalUSD(lines) * (parseFloat(fx) || 1);
}

/**
 * Ajusta linha de honorários/margem para bater valor desejado em BRL.
 */
export function applyDesiredBRL(lines, fx, desiredBRL) {
  const fxRate  = parseFloat(fx) || 1;
  const current = getTotalBRL(lines, fx);
  const diffUSD = (desiredBRL - current) / fxRate;

  const idx = lines.findIndex(l => /honorar|margem|margin/i.test(l.name));

  if (idx >= 0) {
    const existing = parseFloat(lines[idx].usd) || 0;
    const newUSD = Math.max(0, existing + diffUSD).toFixed(2);
    return lines.map((l, i) => i === idx ? { ...l, usd: newUSD, pct: '' } : l);
  }

  return [
    ...lines,
    {
      id:   genId(),
      name: diffUSD >= 0 ? 'Margem / Honorários' : 'Desconto',
      usd:  Math.abs(diffUSD).toFixed(2),
      pct:  '',
    },
  ];
}
