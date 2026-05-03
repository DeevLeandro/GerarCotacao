/**
 * utils/helpers.js
 * Funções utilitárias: formatação de moeda, datas, geração de IDs
 */

/** Gera um ID aleatório curto */
export function genId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Formata número com separadores brasileiros */
export function fmt(n, digits = 2) {
  return Number(n || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Formata como BRL: R$ 1.234,56 */
export function fmtBRL(n) {
  return `R$ ${fmt(n)}`;
}

/** Formata como USD: USD 1,234.56 */
export function fmtUSD(n) {
  return `USD ${fmt(n)}`;
}

/** Formata data por extenso em português */
export function formatDate(d = new Date()) {
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Adiciona N dias a uma data e retorna nova Date */
export function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/** Gera número de proposta padrão */
export function genProposalNumber() {
  const now = new Date();
  const yy  = now.getFullYear();
  const seq = String(Date.now()).slice(-4);
  return `${yy}-${seq}`;
}
