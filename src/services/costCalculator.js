/**
 * services/costCalculator.js
 * Calculadora dinâmica para peças de avião.
 * 
 * CÁLCULOS ESPECIAIS:
 * - ICMS ENTRADA: incide sobre VALOR ADUANEIRO + FRETE + SEGURO + DESPESAS
 * - ICMS SAÍDA (REBATE): incide sobre VALOR AGREGADO (diferença entre venda e custo)
 * 
 * NÃO calcula sobre faturamento total, e sim sobre valor agregado do produto.
 */

import { genId } from '../utils/helpers';

export const DEFAULT_FX = '4.98';

/** Linhas padrão pré-populadas */
export function makeDefaultLines() {
  return [
    { id: genId(), name: 'Mercadoria (Valor Aduaneiro)', usd: '', pct: '' },
    { id: genId(), name: 'Frete Internacional', usd: '', pct: '' },
    { id: genId(), name: 'Seguro Internacional', usd: '', pct: '' },
    { id: genId(), name: 'ICMS Entrada (Importação)', usd: '', pct: '17' },
    { id: genId(), name: 'ICMS Saída (Rebate)', usd: '', pct: '17' },
    { id: genId(), name: 'Taxa Siscomex', usd: '26.64', pct: '' },
    { id: genId(), name: 'Desembaraço Aduaneiro', usd: '331.33', pct: '' },
    { id: genId(), name: 'Armazenagem', usd: '', pct: '' },
    { id: genId(), name: 'Delivery Fee (Frete Local)', usd: '90', pct: '' },
    { id: genId(), name: 'Desconsolidação', usd: '45', pct: '' },
    { id: genId(), name: 'Taxa Administrativa', usd: '45', pct: '' },
    { id: genId(), name: 'CCT (Controle de Carga)', usd: '15', pct: '' },
    { id: genId(), name: 'Pick-up EUA', usd: '60', pct: '' },
    { id: genId(), name: 'Honorários / Margem', usd: '', pct: '' },
  ];
}

/** Sugestões rápidas para adicionar linha */
export const QUICK_ITEMS = [
  { label: 'Mercadoria (Base)', usd: '', pct: '' },
  { label: 'Frete Internacional', usd: '', pct: '' },
  { label: 'Seguro', usd: '', pct: '' },
  { label: 'ICMS Entrada 17%', usd: '', pct: '17' },
  { label: 'ICMS Saída (Rebate) 17%', usd: '', pct: '17' },
  { label: 'Taxa Siscomex', usd: '26.64', pct: '' },
  { label: 'Desembaraço', usd: '331.33', pct: '' },
  { label: 'Delivery Fee', usd: '90', pct: '' },
  { label: 'Desconsolidação', usd: '45', pct: '' },
  { label: 'Taxa ADM', usd: '45', pct: '' },
  { label: 'CCT', usd: '15', pct: '' },
  { label: 'Pick-up US', usd: '60', pct: '' },
  { label: 'Armazenagem', usd: '', pct: '' },
  { label: 'IOF 3.5%', usd: '', pct: '3.5' },
  { label: 'PIS', usd: '', pct: '' },
  { label: 'COFINS', usd: '', pct: '' },
];

/**
 * Calcula a BASE DE CÁLCULO para ICMS (Valor Aduaneiro + Frete + Seguro + Despesas)
 * @param {Array} allLines - Todas as linhas de custo
 * @returns {number} Valor base em USD
 */
export function getICMSBaseUSD(allLines) {
  // Linhas que compõem a base de cálculo do ICMS (CIF + Despesas Aduaneiras)
  const baseKeys = [
    'mercadoria',
    'frete internacional',
    'seguro internacional',
    'taxa siscomex',
    'desembaraço',
    'armazenagem',
    'desconsolidação',
    'pick-up',
    'cct',
  ];
  
  return allLines.reduce((sum, line) => {
    const name = line.name?.toLowerCase() || '';
    const isBaseItem = baseKeys.some(key => name.includes(key));
    if (isBaseItem) {
      return sum + getLineUSD(line, allLines);
    }
    return sum;
  }, 0);
}

/**
 * Calcula o VALOR AGREGADO (diferença entre preço de venda e custo total)
 * Usado para calcular ICMS Saída (Rebate)
 * @param {number} sellingPriceUSD - Preço de venda em USD
 * @param {Array} allLines - Todas as linhas de custo
 * @returns {number} Valor agregado em USD
 */
export function getAggregatedValueUSD(sellingPriceUSD, allLines) {
  const totalCost = getTotalUSD(allLines);
  return Math.max(0, sellingPriceUSD - totalCost);
}

/**
 * Calcula ICMS ENTRADA (sobre a base de cálculo)
 * @param {Array} allLines - Todas as linhas de custo
 * @param {number} icmsRatePercent - Alíquota do ICMS (ex: 17)
 * @returns {number} Valor do ICMS Entrada em USD
 */
export function getICMSEntradaUSD(allLines, icmsRatePercent = 17) {
  const baseUSD = getICMSBaseUSD(allLines);
  return baseUSD * (icmsRatePercent / 100);
}

/**
 * Calcula ICMS SAÍDA / REBATE (sobre o valor agregado)
 * @param {number} sellingPriceUSD - Preço de venda em USD
 * @param {Array} allLines - Todas as linhas de custo  
 * @param {number} icmsRatePercent - Alíquota do ICMS (ex: 17)
 * @returns {number} Valor do ICMS Saída em USD
 */
export function getICMSSaidaRebateUSD(sellingPriceUSD, allLines, icmsRatePercent = 17) {
  const aggregatedValue = getAggregatedValueUSD(sellingPriceUSD, allLines);
  return aggregatedValue * (icmsRatePercent / 100);
}

/**
 * Calcula o valor USD de uma linha.
 * Regras:
 * - Se tiver usd > 0, usa valor fixo direto
 * - Se tiver pct > 0, aplica sobre a base apropriada:
 *   * ICMS Entrada: sobre base ICMS
 *   * ICMS Saída: sobre valor agregado
 *   * Outros: sobre soma das linhas com usd direto
 */
export function getLineUSD(line, allLines) {
  const usd = parseFloat(line.usd) || 0;
  const pct = parseFloat(line.pct) || 0;
  
  // Se tem valor fixo, usa direto
  if (usd > 0) return usd;
  
  // Se tem percentual, calcula sobre a base apropriada
  if (pct > 0) {
    const name = line.name?.toLowerCase() || '';
    
    // ICMS Entrada: calcula sobre base ICMS
    if (name.includes('icms entrada')) {
      const base = getICMSBaseUSD(allLines);
      return base * pct / 100;
    }
    
    // ICMS Saída (Rebate): calcula sobre valor agregado
    if (name.includes('icms saída') || name.includes('icms saida') || name.includes('rebate')) {
      // Para ICMS Saída, precisamos do preço de venda
      // Por enquanto retorna 0, será atualizado quando tiver selling price
      return 0;
    }
    
    // Outros percentuais: calcula sobre base padrão (linhas com valor fixo)
    const base = allLines.reduce((sum, l) => {
      if (l.id === line.id) return sum;
      return sum + (parseFloat(l.usd) || 0);
    }, 0);
    return base * pct / 100;
  }
  
  return 0;
}

/** Soma total USD (todos os custos) */
export function getTotalUSD(lines) {
  return lines.reduce((sum, l) => sum + getLineUSD(l, lines), 0);
}

/** Total em BRL */
export function getTotalBRL(lines, fx) {
  return getTotalUSD(lines) * (parseFloat(fx) || 1);
}

/**
 * Ajusta linha de honorários/margem para bater valor desejado em BRL.
 * @param {Array} lines - Linhas atuais
 * @param {string} fx - Taxa de câmbio
 * @param {number} desiredBRL - Valor desejado em BRL
 * @returns {Array} Linhas ajustadas
 */
export function applyDesiredBRL(lines, fx, desiredBRL) {
  const fxRate = parseFloat(fx) || 1;
  const current = getTotalBRL(lines, fx);
  const diffUSD = (desiredBRL - current) / fxRate;

  // Procura linha de honorários/margem existente
  const idx = lines.findIndex(l => /honorar|margem|margin/i.test(l.name));

  if (idx >= 0) {
    const existing = parseFloat(lines[idx].usd) || 0;
    const newUSD = Math.max(0, existing + diffUSD).toFixed(2);
    return lines.map((l, i) => i === idx ? { ...l, usd: newUSD, pct: '' } : l);
  }

  // Se não encontrou, adiciona nova linha
  return [
    ...lines,
    {
      id: genId(),
      name: diffUSD >= 0 ? 'Margem / Honorários' : 'Desconto',
      usd: Math.abs(diffUSD).toFixed(2),
      pct: '',
    },
  ];
}

/**
 * Calcula o PREÇO DE VENDA FINAL em USD considerando todos os custos + margem
 * @param {Array} lines - Linhas de custo
 * @param {number} marginPercent - Margem de lucro desejada (%)
 * @returns {number} Preço de venda em USD
 */
export function calculateSellingPriceUSD(lines, marginPercent = 0) {
  const totalCost = getTotalUSD(lines);
  return totalCost * (1 + marginPercent / 100);
}

/**
 * Obtém o VALOR AGREGADO TOTAL (soma de todos os agregados por produto)
 * @param {Array} products - Produtos com seus preços
 * @param {Array} costLines - Linhas de custo
 * @returns {number} Valor agregado total em USD
 */
export function getTotalAggregatedValueUSD(products, costLines) {
  // Calcula custo total por unidade
  const totalCostUSD = getTotalUSD(costLines);
  const totalQty = products.reduce((sum, p) => sum + (parseInt(p.qty) || 1), 0);
  const costPerUnit = totalQty > 0 ? totalCostUSD / totalQty : 0;
  
  // Calcula valor agregado por produto (preço de venda - custo)
  let aggregatedSum = 0;
  for (const product of products) {
    const sellingPrice = parseFloat(product.sellingPriceUSD) || 0;
    const qty = parseInt(product.qty) || 1;
    aggregatedSum += (sellingPrice - costPerUnit) * qty;
  }
  
  return Math.max(0, aggregatedSum);
}