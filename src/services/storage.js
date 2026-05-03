/**
 * services/storage.js
 * Camada de persistência via localStorage.
 */
const PROPOSALS_KEY = 'import_proposals_v2';
const COMPANY_KEY   = 'import_company_cfg_v1';
const COSTS_KEY     = 'import_last_costs_v2';  // v2 = lines[]

export function loadProposals() {
  try { return JSON.parse(localStorage.getItem(PROPOSALS_KEY) || '[]'); } catch { return []; }
}
export function saveProposals(list) {
  try { localStorage.setItem(PROPOSALS_KEY, JSON.stringify(list)); return true; } catch { return false; }
}

export function loadCompany() {
  try { return JSON.parse(localStorage.getItem(COMPANY_KEY) || '{}'); } catch { return {}; }
}
export function saveCompany(cfg) {
  try { localStorage.setItem(COMPANY_KEY, JSON.stringify(cfg)); return true; } catch { return false; }
}

// costs agora é { lines: [], fx: string }
export function loadLastCosts() {
  try { return JSON.parse(localStorage.getItem(COSTS_KEY) || '{}'); } catch { return {}; }
}
export function saveLastCosts(data) {
  try { localStorage.setItem(COSTS_KEY, JSON.stringify(data)); return true; } catch { return false; }
}
