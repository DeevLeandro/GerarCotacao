/**
 * pages/SettingsPage.jsx
 * Configurações da empresa (nome, subtítulo, contato).
 * Salvo automaticamente no localStorage.
 */
export default function SettingsPage({ company, onCompanyChange }) {
  const set = (field, val) => onCompanyChange({ ...company, [field]: val });

  return (
    <div className="card">
      <div className="card-title">Configurações da Empresa</div>

      <div className="form-grid-2">
        <div className="form-group">
          <label>Nome da Empresa</label>
          <input
            value={company.name || ''}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex: Boaz Aviation"
          />
        </div>
        <div className="form-group">
          <label>Subtítulo / Setor</label>
          <input
            value={company.sub || ''}
            onChange={e => set('sub', e.target.value)}
            placeholder="Ex: Importação & Serviços Aeronáuticos"
          />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input
            value={company.email || ''}
            onChange={e => set('email', e.target.value)}
            placeholder="contato@empresa.com.br"
          />
        </div>
        <div className="form-group">
          <label>Telefone / WhatsApp</label>
          <input
            value={company.phone || ''}
            onChange={e => set('phone', e.target.value)}
            placeholder="+55 41 99999-0000"
          />
        </div>
        <div className="form-group span-2">
          <label>Endereço / Cidade</label>
          <input
            value={company.address || ''}
            onChange={e => set('address', e.target.value)}
            placeholder="Curitiba, PR — Brasil"
          />
        </div>
      </div>

      <div className="divider" />
      <div className="alert alert-info">
        As configurações são salvas automaticamente no navegador (localStorage).
        Estas informações aparecem no cabeçalho e rodapé do PDF.
      </div>
    </div>
  );
}
