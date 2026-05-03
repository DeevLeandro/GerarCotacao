/**
 * components/Sidebar.jsx
 * Navegação lateral com toggle Admin/Cliente.
 */
export default function Sidebar({ page, onPage, adminMode, onToggleAdmin, company, onNew }) {
  const navItems = [
    { id: 'editor',   icon: '✏️', label: 'Editor de Proposta' },
    { id: 'saved',    icon: '📁', label: 'Propostas Salvas'   },
    { id: 'settings', icon: '⚙️', label: 'Configurações'       },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {company?.name || 'Import Pro'}
        <span>Sistema de Propostas</span>
      </div>

      <div className="sidebar-section">Menu</div>

      {navItems.map(n => (
        <button
          key={n.id}
          className={`nav-item ${page === n.id ? 'active' : ''}`}
          onClick={() => onPage(n.id)}
        >
          <span className="nav-icon">{n.icon}</span>
          {n.label}
        </button>
      ))}

      <button className="nav-item new-btn" onClick={onNew}>
        <span className="nav-icon">＋</span>
        Nova Proposta
      </button>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <div className="mode-toggle-label">Modo de Visualização</div>
        <div className="toggle-btn">
          <button
            className={`toggle-opt ${adminMode ? 'active' : ''}`}
            onClick={() => onToggleAdmin(true)}
          >Admin</button>
          <button
            className={`toggle-opt ${!adminMode ? 'active' : ''}`}
            onClick={() => onToggleAdmin(false)}
          >Cliente</button>
        </div>
        {!adminMode && (
          <div className="mode-hint">Modo cliente: custos ocultos</div>
        )}
      </div>
    </aside>
  );
}
