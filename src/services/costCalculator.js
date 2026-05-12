/**
 * services/costCalculator.js
 * CORREÇÃO: IOF e ICMS Saída respeitam valor fixo USD quando digitado.
 * Prioridade: USD fixo > % calculado.
 */

import { genId } from '../utils/helpers';

export const DEFAULT_FX = '5.20';

export function makeDefaultLines() {
  return [
    { id: genId(), name: 'Mercadoria',                         usd: '1850.00', pct: '' },
    { id: genId(), name: 'Frete Internacional',                usd: '157.25',  pct: '' },
    { id: genId(), name: 'IOF (3.5% s/ frete)',                usd: '',        pct: '3.5',  dependsOn: 'Frete Internacional' },
    { id: genId(), name: 'Imposto de Importação',              usd: '',        pct: '0',    dependsOn: 'Valor Aduaneiro' },
    { id: genId(), name: 'IPI',                                usd: '',        pct: '0',    dependsOn: 'Valor Aduaneiro' },
    { id: genId(), name: 'PIS',                                usd: '',        pct: '0',    dependsOn: 'Valor Aduaneiro' },
    { id: genId(), name: 'COFINS',                             usd: '',        pct: '0',    dependsOn: 'Valor Aduaneiro' },
    { id: genId(), name: 'ICMS Entrada',                       usd: '',        pct: '17',   dependsOn: 'Valor Aduaneiro' },
    { id: genId(), name: 'Taxa Siscomex',                      usd: '26.64',   pct: '' },
    { id: genId(), name: 'Desembaraço Aduaneiro',              usd: '331.33',  pct: '' },
    { id: genId(), name: 'Delivery Fee',                       usd: '90.00',   pct: '' },
    { id: genId(), name: 'Desconsolidação',                    usd: '45.00',   pct: '' },
    { id: genId(), name: 'Taxa Administrativa',                usd: '45.00',   pct: '' },
    { id: genId(), name: 'CCT',                                usd: '15.00',   pct: '' },
    { id: genId(), name: 'Pick-up EUA',                        usd: '60.00',   pct: '' },
    { id: genId(), name: 'Armazenagem',                        usd: '0.00',    pct: '' },
    { id: genId(), name: 'Diversos',                           usd: '0.00',    pct: '' },
    { id: genId(), name: 'ICMS Saída (17% s/ valor agregado)', usd: '',        pct: '17',   dependsOn: 'Valor Agregado', isICMSSaida: true },
  ];
}

export const QUICK_ITEMS = [
  { label: 'Mercadoria',          usd: '',       pct: '' },
  { label: 'Frete Internacional', usd: '',       pct: '' },
  { label: 'IOF (3.5% frete)',    usd: '',       pct: '3.5' },
  { label: 'Imposto Importação',  usd: '',       pct: '' },
  { label: 'IPI',                 usd: '',       pct: '' },
  { label: 'PIS',                 usd: '',       pct: '' },
  { label: 'COFINS',              usd: '',       pct: '' },
  { label: 'ICMS Entrada 17%',    usd: '',       pct: '17' },
  { label: 'ICMS Saída 17%',      usd: '',       pct: '17' },
  { label: 'Taxa Siscomex',       usd: '26.64',  pct: '' },
  { label: 'Desembaraço',         usd: '331.33', pct: '' },
  { label: 'Delivery Fee',        usd: '90',     pct: '' },
  { label: 'Desconsolidação',     usd: '45',     pct: '' },
  { label: 'Taxa ADM',            usd: '45',     pct: '' },
  { label: 'CCT',                 usd: '15',     pct: '' },
  { label: 'Pick-up US',          usd: '60',     pct: '' },
  { label: 'Armazenagem',         usd: '',       pct: '' },
  { label: 'Diversos',            usd: '',       pct: '' },
];

// ─── Helpers de identificação ──────────────────────────────────────────────────
function isICMSEntrada(name)      { return name.includes('icms entrada'); }
function isICMSSaida(name)        { return name.includes('icms saída'); }
function isIOF(name)              { return name.includes('iof'); }
function isImpostoAduaneiro(name) {
  return name.includes('ipi') ||
         name.includes('pis') ||
         name.includes('cofins') ||
         name.includes('imposto de importação');
}

// ─── Cálculos base ─────────────────────────────────────────────────────────────

export function getValorAduaneiroUSD(lines) {
  let mercadoria = 0;
  let frete = 0;
  for (const line of lines) {
    const name = line.name?.toLowerCase().trim() || '';
    const usd  = parseFloat(line.usd) || 0;
    if (name === 'mercadoria')          mercadoria = usd;
    if (name === 'frete internacional') frete      = usd;
  }
  return mercadoria + frete;
}

/**
 * IOF: respeita valor fixo USD se digitado; caso contrário calcula % sobre frete.
 */
export function getIOFUSD(lines) {
  for (const line of lines) {
    const name = line.name?.toLowerCase().trim() || '';
    if (!isIOF(name)) continue;

    // Valor fixo digitado tem prioridade
    const fixedUSD = parseFloat(line.usd);
    if (!isNaN(fixedUSD) && fixedUSD > 0) return fixedUSD;

    // Cálculo automático: pct% sobre frete (padrão 3.5%)
    const pct = parseFloat(line.pct) || 3.5;
    let frete = 0;
    for (const l of lines) {
      if (l.name?.toLowerCase().trim() === 'frete internacional') {
        frete = parseFloat(l.usd) || 0;
      }
    }
    return frete * pct / 100;
  }
  return 0;
}

export function getTotalSemICMSSaidaUSD(lines) {
  let total = 0;
  for (const line of lines) {
    if (!isICMSSaida(line.name?.toLowerCase().trim() || '')) {
      total += getLineUSD(line, lines);
    }
  }
  return total;
}

export function getValorAgregadoUSD(lines) {
  const totalSemICMSSaida = getTotalSemICMSSaidaUSD(lines);
  const valorAduaneiro    = getValorAduaneiroUSD(lines);
  return Math.max(0, totalSemICMSSaida - valorAduaneiro);
}

/**
 * ICMS Saída: respeita valor fixo USD se digitado; caso contrário calcula % sobre Valor Agregado.
 */
export function getICMSSaidaUSD(lines) {
  for (const line of lines) {
    const name = line.name?.toLowerCase().trim() || '';
    if (!isICMSSaida(name)) continue;

    // Valor fixo digitado tem prioridade
    const fixedUSD = parseFloat(line.usd);
    if (!isNaN(fixedUSD) && fixedUSD > 0) return fixedUSD;

    // Cálculo automático: pct% sobre Valor Agregado (padrão 17%)
    const pct = parseFloat(line.pct) || 17;
    const valorAgregado = getValorAgregadoUSD(lines);
    return valorAgregado * pct / 100;
  }
  return 0;
}

/**
 * Calcula o valor USD de uma linha.
 * PRIORIDADE: USD fixo > cálculo por %.
 * Para IOF e ICMS Saída, delega para as funções específicas que já tratam a prioridade.
 */
export function getLineUSD(line, allLines) {
  const usd  = parseFloat(line.usd) || 0;
  const pct  = parseFloat(line.pct) || 0;
  const name = line.name?.toLowerCase().trim() || '';

  // IOF: delega para função específica (trata prioridade USD fixo vs %)
  if (isIOF(name)) {
    // Se tem USD fixo, usa ele; senão usa o cálculo automático
    if (usd > 0) return usd;
    if (pct > 0) return getIOFUSD(allLines);
    return getIOFUSD(allLines); // usa % padrão da linha
  }

  // ICMS Saída: delega para função específica
  if (isICMSSaida(name)) {
    if (usd > 0) return usd;
    if (pct > 0) return getICMSSaidaUSD(allLines);
    return getICMSSaidaUSD(allLines);
  }

  // Valor fixo sem percentual → retorna direto
  if (usd > 0 && pct === 0) return usd;

  // ICMS Entrada: % sobre Valor Aduaneiro
  if (isICMSEntrada(name) && pct > 0) {
    const base = usd > 0 ? usd : getValorAduaneiroUSD(allLines) * pct / 100;
    return usd > 0 ? usd : base;
  }

  // IPI, PIS, COFINS, Imposto de Importação: % sobre Valor Aduaneiro
  if (isImpostoAduaneiro(name) && pct > 0) {
    return usd > 0 ? usd : getValorAduaneiroUSD(allLines) * pct / 100;
  }

  // Percentual genérico sobre Valor Aduaneiro
  if (pct > 0) {
    return usd > 0 ? usd : getValorAduaneiroUSD(allLines) * pct / 100;
  }

  return usd;
}

export function getTotalUSD(lines) {
  if (!lines || lines.length === 0) return 0;
  return lines.reduce((acc, line) => acc + getLineUSD(line, lines), 0);
}

export function getTotalBRL(lines, fx) {
  return getTotalUSD(lines) * (parseFloat(fx) || parseFloat(DEFAULT_FX));
}

export function applyDesiredBRL(lines, fx, desiredBRL) {
  const fxRate  = parseFloat(fx) || parseFloat(DEFAULT_FX);
  const current = getTotalBRL(lines, fx);
  const diffUSD = (desiredBRL - current) / fxRate;

  const idx = lines.findIndex(l => /honorar|margem|diversos/i.test(l.name));

  if (idx >= 0) {
    const existing = parseFloat(lines[idx].usd) || 0;
    const newUSD   = Math.max(0, existing + diffUSD).toFixed(2);
    return lines.map((l, i) => i === idx ? { ...l, usd: newUSD, pct: '' } : l);
  }

  return [
    ...lines,
    {
      id:   genId(),
      name: diffUSD >= 0 ? 'Diversos' : 'Desconto',
      usd:  Math.abs(diffUSD).toFixed(2),
      pct:  '',
    },
  ];
}
