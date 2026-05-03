/**
 * pages/SavedPage.jsx
 * Lista de propostas salvas no localStorage.
 */
export default function SavedPage({ proposals, onLoad, onDelete }) {
  if (!proposals.length) {
    return (
      <div className="card saved-empty">
        <div className="saved-empty-icon">📋</div>
        <div style={{ color: 'var(--text2)' }}>Nenhuma proposta salva ainda.</div>
        <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 6 }}>
          Crie uma proposta no editor e clique em "Salvar".
        </div>
      </div>
    );
  }

  return (
    <div>
      {proposals.map(p => (
        <div key={p.id} className="saved-item" onClick={() => onLoad(p)}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 3 }}>
              {p.clientName || 'Cliente não informado'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              Proposta {p.number || '#'} &nbsp;·&nbsp;
              {p.products?.length || 0} produto(s) &nbsp;·&nbsp;
              {p.savedAt ? new Date(p.savedAt).toLocaleDateString('pt-BR') : '—'}
            </div>
          </div>
          <div className="row gap-8" onClick={e => e.stopPropagation()}>
            <span className="badge badge-gold">{p.products?.length || 0} itens</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(p.id)}
              title="Remover proposta"
            >✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
