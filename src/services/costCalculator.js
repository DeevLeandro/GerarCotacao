/**
 * services/costCalculator.js
 * CALCULADORA DE CUSTOS PARA PEÇAS DE AVIÃO
 *
 * REGRAS CORRETAS:
 * 1. Valor Aduaneiro = Mercadoria + Frete Internacional
 * 2. Base cálculo impostos (ICMS Entrada, PIS, COFINS, IPI, Imp. Importação) = Valor Aduaneiro
 * 3. IOF = 3.5% sobre o Frete Internacional
 * 4. ICMS Saída = 17% sobre o Valor Agregado
 * 5. Valor Agregado = Total sem ICMS Saída - Valor Aduaneiro
 *
 * FIX: ICMS Entrada agora sempre usa Valor Aduaneiro (Mercadoria + Frete) como base,
 *      nunca a soma de todas as outras linhas.
 */

import { genId } from '../utils/helpers';

export const DEFAULT_FX = '5.20';

/**
 * Cria linhas padrão com a estrutura correta
 */
export function makeDefaultLines() {
  return [
    { id: genId(), name: 'Mercadoria',                        usd: '1850.00', pct: '' },
    { id: genId(), name: 'Frete Internacional',               usd: '157.25',  pct: '' },
    { id: genId(), name: 'IOF (3.5% s/ frete)',               usd: '',        pct: '3.5',  dependsOn: 'Frete Internacional' },
    { id: genId(), name: 'Imposto de Importação',             usd: '',        pct: '0',    dependsOn: 'Valor Aduaneiro' },
    { id: genId(), name: 'IPI',                               usd: '',        pct: '0',    dependsOn: 'Valor Aduaneiro' },
    { id: genId(), name: 'PIS',                               usd: '',        pct: '0',    dependsOn: 'Valor Aduaneiro' },
    { id: genId(), name: 'COFINS',                            usd: '',        pct: '0',    dependsOn: 'Valor Aduaneiro' },
    { id: genId(), name: 'ICMS Entrada',                      usd: '',        pct: '17',   dependsOn: 'Valor Aduaneiro' },
    { id: genId(), name: 'Taxa Siscomex',                     usd: '26.64',   pct: '' },
    { id: genId(), name: 'Desembaraço Aduaneiro',             usd: '331.33',  pct: '' },
    { id: genId(), name: 'Delivery Fee',                      usd: '90.00',   pct: '' },
    { id: genId(), name: 'Desconsolidação',                   usd: '45.00',   pct: '' },
    { id: genId(), name: 'Taxa Administrativa',               usd: '45.00',   pct: '' },
    { id: genId(), name: 'CCT',                               usd: '15.00',   pct: '' },
    { id: genId(), name: 'Pick-up EUA',                       usd: '60.00',   pct: '' },
    { id: genId(), name: 'Armazenagem',                       usd: '0.00',    pct: '' },
    { id: genId(), name: 'Diversos',                          usd: '0.00',    pct: '' },
    { id: genId(), name: 'ICMS Saída (17% s/ valor agregado)', usd: '',       pct: '17',   dependsOn: 'Valor Agregado', isICMSSaida: true },
  ];
}

/**
 * Botões rápidos
 */
export const QUICK_ITEMS = [
  { label: 'Mercadoria',          usd: '',      pct: '' },
  { label: 'Frete Internacional', usd: '',      pct: '' },
  { label: 'IOF (3.5% frete)',    usd: '',      pct: '3.5' },
  { label: 'Imposto Importação',  usd: '',      pct: '' },
  { label: 'IPI',                 usd: '',      pct: '' },
  { label: 'PIS',                 usd: '',      pct: '' },
  { label: 'COFINS',              usd: '',      pct: '' },
  { label: 'ICMS Entrada 17%',    usd: '',      pct: '17' },
  { label: 'ICMS Saída 17%',      usd: '',      pct: '17' },
  { label: 'Taxa Siscomex',       usd: '26.64', pct: '' },
  { label: 'Desembaraço',         usd: '331.33',pct: '' },
  { label: 'Delivery Fee',        usd: '90',    pct: '' },
  { label: 'Desconsolidação',     usd: '45',    pct: '' },
  { label: 'Taxa ADM',            usd: '45',    pct: '' },
  { label: 'CCT',                 usd: '15',    pct: '' },
  { label: 'Pick-up US',          usd: '60',    pct: '' },
  { label: 'Armazenagem',         usd: '',      pct: '' },
  { label: 'Diversos',            usd: '',      pct: '' },
];

/**
 * Calcula o VALOR ADUANEIRO = Mercadoria + Frete Internacional
 */
export function getValorAduaneiroUSD(lines) {
  let mercadoria = 0;
  let frete = 0;

  for (const line of lines) {
    const name = line.name?.toLowerCase().trim() || '';
    const usd  = parseFloat(line.usd) || 0;
    if (name === 'mercadoria')          mercadoria = usd;
    if (name === 'frete internacional') frete      = usd;
  }

  const valorAduaneiro = mercadoria + frete;
  console.log('📊 Valor Aduaneiro:', { mercadoria, frete, valorAduaneiro });
  return valorAduaneiro;
}

/**
 * Calcula o IOF = 3.5% sobre o Frete Internacional
 */
export function getIOFUSD(lines) {
  let frete = 0;
  for (const line of lines) {
    const name = line.name?.toLowerCase().trim() || '';
    if (name === 'frete internacional') frete = parseFloat(line.usd) || 0;
  }
  const iof = frete * 0.035;
  console.log('📊 IOF:', { frete, iof });
  return iof;
}

/**
 * Calcula o TOTAL SEM ICMS SAÍDA
 */
export function getTotalSemICMSSaidaUSD(lines) {
  let total = 0;
  for (const line of lines) {
    const isICMSSaida = line.name?.toLowerCase().includes('icms saída');
    if (!isICMSSaida) total += getLineUSD(line, lines);
  }
  return total;
}

/**
 * Calcula o VALOR AGREGADO = Total sem ICMS Saída - Valor Aduaneiro
 */
export function getValorAgregadoUSD(lines) {
  const totalSemICMSSaida = getTotalSemICMSSaidaUSD(lines);
  const valorAduaneiro    = getValorAduaneiroUSD(lines);
  const valorAgregado     = Math.max(0, totalSemICMSSaida - valorAduaneiro);
  console.log('📊 Valor Agregado:', { totalSemICMSSaida, valorAduaneiro, valorAgregado });
  return valorAgregado;
}

/**
 * Calcula o ICMS SAÍDA = 17% sobre o Valor Agregado
 */
export function getICMSSaidaUSD(lines) {
  const valorAgregado = getValorAgregadoUSD(lines);
  const icmsSaida     = valorAgregado * 0.17;
  console.log('📊 ICMS Saída:', { valorAgregado, icmsSaida });
  return icmsSaida;
}

/**
 * Helpers para identificar tipo de linha pelo nome
 */
function isICMSEntrada(name)        { return name.includes('icms entrada'); }
function isICMSSaida(name)          { return name.includes('icms saída'); }
function isIOF(name)                { return name.includes('iof'); }
function isImpostoAduaneiro(name)   {
  return name.includes('ipi') ||
         name.includes('pis') ||
         name.includes('cofins') ||
         name.includes('imposto de importação');
}

/**
 * Calcula o valor USD de uma linha com as regras especiais
 *
 * REGRA ICMS ENTRADA (FIX):
 *   Base = Valor Aduaneiro (Mercadoria + Frete), SEMPRE.
 *   Não importa o que mais exista nas linhas.
 */
export function getLineUSD(line, allLines) {
  const usd  = parseFloat(line.usd) || 0;
  const pct  = parseFloat(line.pct) || 0;
  const name = line.name?.toLowerCase().trim() || '';

  // Valor fixo sem percentual → retorna direto
  if (usd > 0 && pct === 0) return usd;

  // IOF: 3.5% sobre Frete Internacional
  if (isIOF(name) && pct > 0) {
    return getIOFUSD(allLines);
  }

  // ICMS Saída: 17% sobre Valor Agregado
  if (isICMSSaida(name) && pct > 0) {
    return getICMSSaidaUSD(allLines);
  }

  // ICMS Entrada: % sobre Valor Aduaneiro (FIX — era calculado errado antes)
  if (isICMSEntrada(name) && pct > 0) {
    const valorAduaneiro = getValorAduaneiroUSD(allLines);
    return valorAduaneiro * pct / 100;
  }

  // IPI, PIS, COFINS, Imposto de Importação: % sobre Valor Aduaneiro
  if (isImpostoAduaneiro(name) && pct > 0) {
    const valorAduaneiro = getValorAduaneiroUSD(allLines);
    return valorAduaneiro * pct / 100;
  }

  // Percentual genérico: calcula sobre a soma das outras linhas com valor fixo
  if (pct > 0) {
    const base = allLines.reduce((sum, l) => {
      if (l.id === line.id) return sum;
      const lUSD = parseFloat(l.usd) || 0;
      return sum + lUSD;
    }, 0);
    return base * pct / 100;
  }

  return 0;
}

/**
 * Soma total USD (TODAS as linhas, incluindo ICMS Saída)
 */
export function getTotalUSD(lines) {
  if (!lines || lines.length === 0) return 0;
  let total = 0;
  for (const line of lines) total += getLineUSD(line, lines);
  console.log('📊 TOTAL USD:', total);
  return total;
}

/**
 * Total em BRL
 */
export function getTotalBRL(lines, fx) {
  const totalUSD = getTotalUSD(lines);
  const fxRate   = parseFloat(fx) || parseFloat(DEFAULT_FX);
  const totalBRL = totalUSD * fxRate;
  console.log('📊 TOTAL BRL:', { totalUSD, fxRate, totalBRL });
  return totalBRL;
}

/**
 * Aplica valor desejado ajustando a margem/diversos
 */
export function applyDesiredBRL(lines, fx, desiredBRL) {
  const fxRate = parseFloat(fx) || parseFloat(DEFAULT_FX);
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