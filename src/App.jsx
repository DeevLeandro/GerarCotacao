/**
 * App.jsx
 * CORREÇÃO: Garante que totalBRL seja calculado e passado para o PDF
 */

import { useState, useCallback, useEffect } from 'react';

import Sidebar from './components/Sidebar';
import Notification from './components/Notification';
import PDFModal from './components/PDFModal';

import EditorPage from './pages/EditorPage';
import SavedPage from './pages/SavedPage';
import SettingsPage from './pages/SettingsPage';

import { makeDefaultLines, DEFAULT_FX, getTotalBRL, getTotalUSD } from './services/costCalculator';
import {
  loadProposals, saveProposals,
  loadCompany, saveCompany,
  loadLastCosts, saveLastCosts,
} from './services/storage';
import { genId, genProposalNumber } from './utils/helpers';

function newProposal() {
  return {
    id: genId(),
    clientName: '',
    clientContact: '',
    number: genProposalNumber(),
    validityDays: 10,
    paymentTerms: '',
    deliveryDays: '30-45 business days after confirmation',
    observations: '',
    conditions: '',
    products: [],
    savedAt: null,
  };
}

export default function App() {
  const [page, setPage] = useState('editor');
  const [adminMode, setAdminMode] = useState(true);

  const [company, setCompanyRaw] = useState(() => ({
    name: 'BOAZ AVIATION',
    sub: 'Aircraft Parts Import & Export',
    email: 'sales@boazaviation.com',
    phone: '+1 (305) 123-4567',
    address: 'Miami, FL — USA',
    ...loadCompany(),
  }));
  const setCompany = cfg => { setCompanyRaw(cfg); saveCompany(cfg); };

  const [proposals, setProposalsRaw] = useState(loadProposals);
  const [proposal, setProposal] = useState(newProposal);
  const setProposals = list => { setProposalsRaw(list); saveProposals(list); };

  const [lines, setLinesRaw] = useState(() => {
    const saved = loadLastCosts();
    return saved?.lines?.length ? saved.lines : makeDefaultLines();
  });
  const [fx, setFxRaw] = useState(() => loadLastCosts()?.fx || DEFAULT_FX);
  const [desiredTotal, setDesiredTotal] = useState('');

  const setLines = l => { setLinesRaw(l); saveLastCosts({ lines: l, fx }); };
  const setFx = v => { setFxRaw(v); saveLastCosts({ lines, fx: v }); };

  const [showPreview, setShowPreview] = useState(false);
  const [notif, setNotif] = useState(null);
  const notify = useCallback((msg, type = 'success') => {
    setNotif({ msg, type, key: Date.now() });
  }, []);

  // 🔥 CORREÇÃO CRÍTICA: Força o cálculo do totalBRL sempre que lines ou fx mudam
  const totalUSD = getTotalUSD(lines);
  const totalBRL = getTotalBRL(lines, fx);
  
  // Log para debug
  useEffect(() => {
    console.log('💰 TOTAL CALCULADO:', { totalUSD, totalBRL, fx, linesCount: lines.length });
  }, [totalUSD, totalBRL, fx, lines]);

  const handleSave = () => {
    const updated = { ...proposal, savedAt: Date.now() };
    const idx = proposals.findIndex(p => p.id === proposal.id);
    const list = idx >= 0
      ? proposals.map(p => p.id === proposal.id ? updated : p)
      : [updated, ...proposals];
    setProposals(list);
    setProposal(updated);
    notify('Proposal saved successfully!');
  };

  const handleLoad = p => { setProposal(p); setPage('editor'); notify('Proposal loaded.'); };
  const handleDelete = id => { setProposals(proposals.filter(p => p.id !== id)); notify('Proposal removed.', 'error'); };
  const handleNew = () => { setProposal(newProposal()); setPage('editor'); };

  return (
    <div className="app-shell">
      <Sidebar
        page={page} onPage={setPage}
        adminMode={adminMode} onToggleAdmin={setAdminMode}
        company={company} onNew={handleNew}
      />

      <main className="main">
        {page === 'editor' && (
          <>
            <div className="page-header">
              <div className="page-title">
                {proposal.clientName ? `Proposal — ${proposal.clientName}` : 'New Proposal'}
              </div>
              <div className="page-sub">
                {proposal.number} &nbsp;·&nbsp;
                {(proposal.products || []).length} item(s)
                {adminMode && <span className="badge badge-gold" style={{ marginLeft: 10 }}>Admin Mode</span>}
              </div>
            </div>
            <EditorPage
              proposal={proposal} onProposalChange={setProposal}
              lines={lines} fx={fx}
              onLinesChange={setLines} onFxChange={setFx}
              desiredTotal={desiredTotal} onDesiredChange={setDesiredTotal}
              adminMode={adminMode}
              onPreview={() => setShowPreview(true)}
              onSave={handleSave}
            />
          </>
        )}

        {page === 'saved' && (
          <>
            <div className="page-header">
              <div className="page-title">Saved Proposals</div>
              <div className="page-sub">{proposals.length} proposal(s) in history</div>
            </div>
            <SavedPage proposals={proposals} onLoad={handleLoad} onDelete={handleDelete} />
          </>
        )}

        {page === 'settings' && (
          <>
            <div className="page-header">
              <div className="page-title">Settings</div>
              <div className="page-sub">Company information</div>
            </div>
            <SettingsPage company={company} onCompanyChange={setCompany} />
          </>
        )}
      </main>

      {showPreview && (
        <PDFModal
          proposal={proposal}
          company={company}
          totalBRL={totalBRL}  // 🔥 AGORA VEM CORRETAMENTE CALCULADO
          totalUSD={totalUSD}
          adminMode={adminMode}
          onClose={() => setShowPreview(false)}
          onNotify={notify}
        />
      )}

      {notif && (
        <Notification key={notif.key} msg={notif.msg} type={notif.type} onDone={() => setNotif(null)} />
      )}
    </div>
  );
}