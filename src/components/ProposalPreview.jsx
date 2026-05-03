/**
 * components/ProposalPreview.jsx
 * Documento visual para o cliente.
 * totalBRL vem do estado — se for 0 ou não informado, exibe "A confirmar".
 */
import { fmtBRL, formatDate, addDays } from '../utils/helpers';

export default function ProposalPreview({ proposal, company, totalBRL }) {
  const now        = new Date();
  const validity   = parseInt(proposal.validityDays) || 10;
  const validUntil = addDays(now, validity);
  const products   = (proposal.products || []).filter(p => p.description?.trim());

  // Se total for 0 ou negativo, mostra "A confirmar"
  const totalDisplay = totalBRL > 0 ? fmtBRL(totalBRL) : 'A confirmar';
  const hasTotal     = totalBRL > 0;

  const defaultConditions = [
    `Pagamento: ${proposal.paymentTerms || 'Conforme acordo comercial'}`,
    `Prazo de entrega estimado: ${proposal.deliveryDays || '30–45 dias úteis após confirmação'}`,
    `Proposta válida por ${validity} dias corridos`,
    'Valores sujeitos à disponibilidade de estoque',
  ].map(l => `• ${l}`).join('\n');

  return (
    <div id="pdf-document">
      {/* Header */}
      <div className="pdf-header">
        <div className="pdf-company-name">{company?.name || 'Sua Empresa'}</div>
        <div className="pdf-company-sub">{company?.sub || 'Importação & Serviços Aeronáuticos'}</div>
        <div className="pdf-header-meta">
          <div>
            <div className="pdf-meta-label">Cliente</div>
            <div className="pdf-meta-value large">{proposal.clientName || '—'}</div>
            {proposal.clientContact && (
              <div className="pdf-meta-value" style={{ fontSize: 13, marginTop: 4, opacity: 0.7 }}>
                {proposal.clientContact}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="pdf-meta-label">Proposta Nº</div>
            <div className="pdf-meta-value large">{proposal.number || '#001'}</div>
            <div className="pdf-meta-value" style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
              {formatDate(now)}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pdf-body">
        <div className="pdf-section-title">Itens da Proposta</div>
        {products.length === 0 ? (
          <p style={{ color: '#8a8a9a', fontSize: 13 }}>Nenhum produto cadastrado.</p>
        ) : products.map((p, i) => (
          <div key={p.id} className="pdf-product-row">
            <div className="pdf-product-num">{i + 1}</div>
            <div>
              <div className="pdf-product-name">
                {p.partNumber ? `[${p.partNumber}] ` : ''}{p.description}
              </div>
            </div>
            <div className="pdf-product-qty">Qtd {p.qty || 1}</div>
          </div>
        ))}

        {proposal.observations?.trim() && (
          <>
            <div className="pdf-divider" />
            <div className="pdf-section-title">Observações</div>
            <div className="pdf-obs-box">
              <div className="pdf-obs-text">{proposal.observations}</div>
            </div>
          </>
        )}

        {/* Total */}
        <div className="pdf-total-block">
          <div className="pdf-total-label">Valor Total da Proposta</div>
          <div
            className="pdf-total-value"
            style={!hasTotal ? { fontSize: 28, opacity: 0.6, letterSpacing: '0.04em' } : {}}
          >
            {totalDisplay}
          </div>
          {!hasTotal && (
            <div style={{ fontSize: 11, color: 'rgba(226,201,138,0.5)', marginTop: 8, letterSpacing: '0.1em' }}>
              VALOR SERÁ INFORMADO EM BREVE
            </div>
          )}
        </div>

        <div className="pdf-section-title">Condições Comerciais</div>
        <div className="pdf-conditions">
          {proposal.conditions?.trim() || defaultConditions}
        </div>
      </div>

      {/* Footer */}
      <div className="pdf-footer">
        <div>
          <div className="pdf-footer-company">{company?.name || ''}</div>
          <div>{[company?.email, company?.phone].filter(Boolean).join(' — ')}</div>
        </div>
        <div className="pdf-validity">
          <span className="pdf-validity-num">{validity}</span>
          <span className="pdf-validity-label">dias de validade</span>
        </div>
        <div className="pdf-footer-right">
          <div className="pdf-footer-right-label">Válida até</div>
          <div>{formatDate(validUntil)}</div>
        </div>
      </div>
    </div>
  );
}
