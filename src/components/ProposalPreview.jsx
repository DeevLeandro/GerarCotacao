/**
 * components/ProposalPreview.jsx
 * Layout fiel ao PDF de referência (Boaz Aviation – Sales Proposal)
 *
 * ESTRUTURA:
 * - Cabeçalho: Logo oficial + "Sales Proposal" + tabela Date/Quote#
 * - Bloco endereço cliente + dados empresa
 * - Tabela Terms / FOB / Customer Ref # (igual ao PDF de referência)
 * - Linha de contato (Phone / Email)
 * - Tabela de itens: Part Number | Description | Qty | Condition
 * - Total apenas em USD
 * - Rodapé com validade + email + telefone em TODAS as páginas
 * - Última página: observações + condições comerciais
 */

import { formatDate, addDays } from '../utils/helpers';

const ITEMS_PER_PAGE = 18;

function fmtUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const PAGE_STYLE = {
  width: '215.9mm',
  minHeight: '279.4mm',
  padding: '14mm 14mm 20mm 14mm',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
  fontFamily: "'Arial', 'Helvetica', sans-serif",
  fontSize: '9pt',
  color: '#1a1a1a',
  position: 'relative',
};

// ─── Rodapé — igual em TODAS as páginas ───────────────────────────────────────
function PageFooter({ company, proposal, now, validity }) {
  const validUntil = addDays(now, validity);
  return (
    <div style={{
      position: 'absolute',
      bottom: '8mm',
      left: '14mm',
      right: '14mm',
      borderTop: '1px solid #dddddd',
      paddingTop: '3mm',
      fontSize: '7.5pt',
      color: '#888888',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 8,
    }}>
      <span>This proposal is valid until {formatDate(validUntil)}.</span>
      <span style={{ textAlign: 'right' }}>
        {[company?.name, company?.email, company?.phone].filter(Boolean).join(' · ')}
      </span>
    </div>
  );
}

// ─── Cabeçalho ────────────────────────────────────────────────────────────────
function PageHeader({ company, proposal, now }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8mm',
    }}>
      {/* Logo oficial */}
      <div>
        <img
          src="/images/logo.png"
          alt={company?.name || 'Logo'}
          style={{
            height: '28mm',
            maxWidth: '72mm',
            objectFit: 'contain',
            display: 'block',
          }}
          onError={e => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = 'flex';
            }
          }}
        />
        {/* Fallback texto */}
        <div style={{ display: 'none', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{ fontSize: '28pt', fontWeight: '900', color: '#1a1a1a', letterSpacing: '-1px', lineHeight: 1 }}>
            {company?.logoText || 'BOAZ'}
          </div>
          <div style={{ fontSize: '6pt', color: '#555555', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '1mm' }}>
            {company?.sub || 'aviation'}
          </div>
        </div>
      </div>

      {/* Título + tabela Date / Quote# */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '18pt', fontWeight: '700', color: '#1a1a1a', marginBottom: '3mm' }}>
          Sales Proposal
        </div>
        <table style={{ borderCollapse: 'collapse', marginLeft: 'auto', fontSize: '8pt' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={thStyle}>Date</th>
              <th style={{ ...thStyle, borderLeft: '1px solid #cccccc' }}>Quote #</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdMetaStyle}>{formatDate(now)}</td>
              <td style={{ ...tdMetaStyle, borderLeft: '1px solid #cccccc' }}>{proposal.number || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Bloco endereço cliente + empresa ─────────────────────────────────────────
function AddressBlock({ proposal, company }) {
  return (
    <div style={{ display: 'flex', gap: '6mm', marginBottom: '6mm' }}>
      {/* Caixa cliente */}
      <div style={{
        border: '1px solid #bbbbbb',
        padding: '3mm 4mm',
        width: '50%',
        fontSize: '8.5pt',
        lineHeight: 1.5,
      }}>
        <div style={{ fontSize: '7.5pt', color: '#555555', marginBottom: '1mm' }}>Name / Address</div>
        <div style={{ fontWeight: '600' }}>{proposal.clientName || '—'}</div>
        {proposal.clientContact && <div>{proposal.clientContact}</div>}
        {proposal.clientAddress && <div style={{ whiteSpace: 'pre-line' }}>{proposal.clientAddress}</div>}
        {proposal.clientCNPJ && (
          <div style={{ fontSize: '7.5pt', color: '#555555', marginTop: '1mm' }}>
            CNPJ: {proposal.clientCNPJ}
          </div>
        )}
      </div>

      {/* Dados da empresa */}
      <div style={{ width: '50%', fontSize: '8.5pt', lineHeight: 1.6, paddingTop: '1mm' }}>
        <div style={{ fontWeight: '700' }}>{company?.name || 'Boaz Aeronautical Technical Solutions'}</div>
        {company?.contactName && <div>{company.contactName}</div>}
        {company?.city        && <div>{company.city}</div>}
        {company?.country     && <div>{company.country}</div>}
        {company?.address     && <div style={{ marginTop: '2mm' }}>{company.address}</div>}
      </div>
    </div>
  );
}

// ─── Linha Terms / FOB / Customer Ref # ──────────────────────────────────────
// No PDF de referência esta tabela fica no canto direito da página,
// alinhada abaixo da tabela Date/Quote#, com a metade esquerda vazia.
function TermsRow({ proposal }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '3mm',
    }}>
      <table style={{
        width: '50%',
        borderCollapse: 'collapse',
        fontSize: '8.5pt',
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ ...thStyle, width: '30%', textAlign: 'center' }}>Terms</th>
            <th style={{ ...thStyle, width: '30%', borderLeft: '1px solid #cccccc', textAlign: 'center' }}>FOB</th>
            <th style={{ ...thStyle, width: '40%', borderLeft: '1px solid #cccccc', textAlign: 'center' }}>Customer Ref. #</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...tdStyle, textAlign: 'center' }}>{proposal.paymentTerms || 'Prepaid ACH'}</td>
            <td style={{ ...tdStyle, borderLeft: '1px solid #cccccc', textAlign: 'center' }}>
              {proposal.fob || 'EXWKS LUCAS'}
            </td>
            <td style={{ ...tdStyle, borderLeft: '1px solid #cccccc', textAlign: 'center' }}>
              {proposal.customerRef || '—'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Linha de contato Phone / Email (abaixo do Terms, igual ao PDF) ───────────
function ContactRow({ company }) {
  if (!company?.phone && !company?.email) return null;
  return (
    <div style={{
      fontSize: '7.5pt',
      color: '#555555',
      marginBottom: '4mm',
      textAlign: 'right',
    }}>
      {company?.phone && <>Phone # {company.phone}</>}
      {company?.phone && company?.email && '  '}
      {company?.email && <>E-mail {company.email}</>}
    </div>
  );
}

// ─── Cabeçalho da tabela de itens ─────────────────────────────────────────────
function ItemTableHead() {
  return (
    <thead>
      <tr style={{ backgroundColor: '#f0f0f0' }}>
        <th style={{ ...thStyle, width: '18%', textAlign: 'left', paddingLeft: '2mm' }}>Part Number</th>
        <th style={{ ...thStyle, textAlign: 'left', paddingLeft: '2mm', borderLeft: '1px solid #cccccc' }}>Description</th>
        <th style={{ ...thStyle, width: '8%', borderLeft: '1px solid #cccccc', textAlign: 'center' }}>Qty</th>
        <th style={{ ...thStyle, width: '13%', borderLeft: '1px solid #cccccc', textAlign: 'center' }}>Condition</th>
      </tr>
    </thead>
  );
}

// ─── Linha de item ─────────────────────────────────────────────────────────────
function ItemRow({ product, isLast }) {
  return (
    <tr style={{ borderBottom: isLast ? 'none' : '1px solid #e8e8e8' }}>
      <td style={{
        padding: '1.5mm 2mm',
        fontFamily: "'Courier New', monospace",
        fontSize: '7.5pt',
        verticalAlign: 'top',
        borderRight: '1px solid #cccccc',
      }}>
        {product.partNumber || '—'}
      </td>
      <td style={{
        padding: '1.5mm 2mm',
        fontSize: '8pt',
        lineHeight: 1.35,
        verticalAlign: 'top',
        borderRight: '1px solid #cccccc',
      }}>
        <div style={{ fontWeight: '600' }}>{product.description}</div>
        {product.alternate && <div style={{ color: '#555555', fontSize: '7.5pt' }}>{product.alternate}</div>}
        {product.hsCode    && <div style={{ color: '#777777', fontSize: '7pt' }}>HS Code {product.hsCode} ECCN {product.eccn || ''}</div>}
        {product.netWeight && <div style={{ color: '#777777', fontSize: '7pt' }}>Net weight {product.netWeight}</div>}
      </td>
      <td style={{
        padding: '1.5mm 2mm',
        textAlign: 'center',
        fontSize: '8pt',
        verticalAlign: 'top',
        borderRight: '1px solid #cccccc',
      }}>
        {product.qty || 1}
      </td>
      <td style={{
        padding: '1.5mm 2mm',
        textAlign: 'center',
        fontSize: '8pt',
        verticalAlign: 'top',
      }}>
        {product.condition || 'NEW'}
      </td>
    </tr>
  );
}

// ─── Linha de Total ───────────────────────────────────────────────────────────
function TotalRow({ value }) {
  return (
    <tr>
      <td colSpan={3} style={{
        padding: '3mm 2mm',
        textAlign: 'right',
        fontSize: '12pt',
        fontWeight: '700',
        color: '#1a1a1a',
        borderTop: '2px solid #aaaaaa',
        borderRight: '1px solid #cccccc',
      }}>
        Total
      </td>
      <td style={{
        padding: '3mm 3mm',
        textAlign: 'right',
        fontSize: '12pt',
        fontWeight: '700',
        color: '#1a1a1a',
        borderTop: '2px solid #aaaaaa',
      }}>
        {value}
      </td>
    </tr>
  );
}

// ─── Estilos compartilhados ────────────────────────────────────────────────────
const thStyle = {
  padding: '1.5mm 2mm',
  fontWeight: '600',
  color: '#333333',
  fontSize: '8pt',
  border: '1px solid #cccccc',
  borderBottom: '1px solid #cccccc',
};

const tdStyle = {
  padding: '2mm 2mm',
  fontSize: '8.5pt',
  border: '1px solid #cccccc',
  borderTop: 'none',
};

const tdMetaStyle = {
  padding: '1.5mm 3mm',
  fontSize: '8pt',
  border: '1px solid #cccccc',
  borderTop: 'none',
  textAlign: 'center',
};

// ─── Componente principal ──────────────────────────────────────────────────────
export default function ProposalPreview({ proposal, company, totalBRL, adminMode = false }) {
  const now      = new Date();
  const validity = parseInt(proposal.validityDays) || 10;
  const products = (proposal.products || []).filter(p => p.description?.trim());

  // Apenas USD no PDF
  const hasValidTotal     = totalBRL !== null && totalBRL !== undefined && totalBRL > 0;
  const totalUSD          = hasValidTotal ? totalBRL / (parseFloat(proposal.fx) || 5.20) : null;
  const totalUSDFormatted = totalUSD ? fmtUSD(totalUSD) : '—';

  const pages = [];
  for (let i = 0; i < products.length; i += ITEMS_PER_PAGE) {
    pages.push(products.slice(i, i + ITEMS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  const defaultConditions = [
    `Payment: ${proposal.paymentTerms || 'As per commercial agreement'}`,
    `Estimated delivery time: ${proposal.deliveryDays || '30–45 business days after confirmation'}`,
    `Proposal valid for ${validity} calendar days`,
    'Values subject to stock availability and exchange rate fluctuation',
    'All items include certificate of origin and traceability (FAA/EASA)',
  ].map(l => `• ${l}`).join('\n');

  return (
    <div id="pdf-document" style={{ backgroundColor: '#e8e8e8', padding: '10px' }}>

      {/* ── Páginas de itens ── */}
      {pages.map((pageItems, pageIdx) => {
        const isLastItemPage = pageIdx === pages.length - 1;
        return (
          <div
            key={pageIdx}
            className="pdf-page"
            style={{ ...PAGE_STYLE, marginBottom: '10px' }}
          >
            <PageHeader company={company} proposal={proposal} now={now} />
            <AddressBlock proposal={proposal} company={company} />
            <TermsRow proposal={proposal} />
            <ContactRow company={company} />

            {/* Tabela de itens */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '8.5pt',
              border: '1px solid #cccccc',
            }}>
              <ItemTableHead />
              <tbody>
                {pageItems.map((p, i) => (
                  <ItemRow
                    key={p.id || i}
                    product={p}
                    isLast={i === pageItems.length - 1 && isLastItemPage}
                  />
                ))}
                {/* Total somente na última página de itens — apenas USD */}
                {isLastItemPage && (
                  <TotalRow value={totalUSDFormatted} />
                )}
              </tbody>
            </table>

            {/* ── Condições na mesma página que os últimos itens ── */}
            {isLastItemPage && (
              <div style={{ marginTop: '8mm' }}>

                {/* Observações do cliente */}
                {proposal.observations?.trim() && (
                  <div style={{ marginBottom: '6mm' }}>
                    <div style={{
                      fontSize: '9pt', fontWeight: '700',
                      borderBottom: '1px solid #cccccc',
                      paddingBottom: '1mm', marginBottom: '3mm',
                      textTransform: 'uppercase', letterSpacing: '0.3px',
                    }}>
                      Notes to Customer
                    </div>
                    <div style={{ fontSize: '8.5pt', lineHeight: 1.5, whiteSpace: 'pre-wrap', color: '#333333' }}>
                      {proposal.observations}
                    </div>
                  </div>
                )}

                {/* Condições comerciais */}
                <div style={{ marginBottom: '10mm' }}>
                  <div style={{
                    fontSize: '9pt', fontWeight: '700',
                    borderBottom: '1px solid #cccccc',
                    paddingBottom: '1mm', marginBottom: '3mm',
                    textTransform: 'uppercase', letterSpacing: '0.3px',
                  }}>
                    Commercial Terms
                  </div>
                  <div style={{ fontSize: '8.5pt', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#333333' }}>
                    {proposal.conditions?.trim() || defaultConditions}
                  </div>
                </div>
              </div>
            )}

            {/* Número de página */}
            <div style={{
              position: 'absolute',
              bottom: '14mm',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '7.5pt',
              color: '#888888',
            }}>
              Page {pageIdx + 1}
            </div>

            {/* Rodapé em TODAS as páginas */}
            <PageFooter company={company} proposal={proposal} now={now} validity={validity} />
          </div>
        );
      })}

    </div>
  );
}