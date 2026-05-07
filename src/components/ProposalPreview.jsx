/**
 * components/ProposalPreview.jsx
 * Layout fiel ao PDF de referência (Boaz Aviation – Proforma Invoice/Quote)
 *
 * ESTRUTURA:
 * - Cabeçalho: Logo/nome + bloco "Proforma Invoice / Quote" + tabela Date/Quote#
 * - Bloco endereço cliente (box com borda)
 * - Tabela Terms / FOB / Customer Ref # com linhas
 * - Tabela de itens: Part Number | Description | Qty | Condition
 * - Rodapé com total USD
 * - Última página: observações + condições + validade
 */

import { formatDate, addDays } from '../utils/helpers';

const ITEMS_PER_PAGE = 18;

// ─── Formatadores ──────────────────────────────────────────────────────────────
function fmtUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function fmtBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ─── Estilos base (inline, para html2canvas) ───────────────────────────────────
const PAGE_STYLE = {
  width: '215.9mm',        // Letter width
  minHeight: '279.4mm',    // Letter height
  padding: '14mm 14mm 16mm 14mm',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
  fontFamily: "'Arial', 'Helvetica', sans-serif",
  fontSize: '9pt',
  color: '#1a1a1a',
  position: 'relative',
};

// ─── Sub-componente: Cabeçalho (igual ao PDF) ──────────────────────────────────
function PageHeader({ company, proposal, now }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8mm',
    }}>
      {/* Logo / Nome empresa */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6mm' }}>
        {/* Ícone BOAZ estilo do PDF */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
        }}>
          <div style={{
            fontSize: '28pt',
            fontWeight: '900',
            color: '#1a1a1a',
            letterSpacing: '-1px',
            lineHeight: 1,
          }}>
            {/* Simula o logo bold tipo "BOAZ" do PDF */}
            {company?.logoText || 'BOAZ'}
          </div>
          <div style={{
            fontSize: '6pt',
            color: '#555555',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginTop: '1mm',
          }}>
            {company?.sub || 'aviation'}
          </div>
        </div>
        <div style={{
          borderLeft: '1px solid #cccccc',
          paddingLeft: '6mm',
          lineHeight: 1.4,
        }}>
          <div style={{ fontSize: '6.5pt', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AERONAUTICAL</div>
          <div style={{ fontSize: '6.5pt', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TECHNOLOGY</div>
          <div style={{ fontSize: '6.5pt', color: '#555555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SOLUTIONS</div>
        </div>
      </div>

      {/* Título + Data/Quote# */}
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: '18pt',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '3mm',
        }}>
          Proforma Invoice / Quote
        </div>
        {/* Tabela Date | Quote# */}
        <table style={{
          borderCollapse: 'collapse',
          marginLeft: 'auto',
          fontSize: '8pt',
        }}>
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

// ─── Sub-componente: Bloco cliente + Fornecedor ────────────────────────────────
function AddressBlock({ proposal, company }) {
  return (
    <div style={{
      display: 'flex',
      gap: '6mm',
      marginBottom: '6mm',
    }}>
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

      {/* Dados da empresa (Boaz) */}
      <div style={{
        width: '50%',
        fontSize: '8.5pt',
        lineHeight: 1.6,
        paddingTop: '1mm',
      }}>
        <div style={{ fontWeight: '700' }}>{company?.name || 'Boaz Aeronautical Technical Solutions'}</div>
        {company?.contactName && <div>{company.contactName}</div>}
        {company?.city && <div>{company.city}</div>}
        {company?.country && <div>{company.country}</div>}
        {company?.address && <div style={{ marginTop: '2mm' }}>{company.address}</div>}
      </div>
    </div>
  );
}

// ─── Sub-componente: Linha Terms/FOB/CustomerRef ───────────────────────────────
function TermsRow({ proposal }) {
  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '3mm',
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
  );
}

// ─── Sub-componente: Contato (linha abaixo de Terms no PDF original) ───────────
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

// ─── Sub-componente: Cabeçalho da tabela de itens ─────────────────────────────
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

// ─── Sub-componente: Linha de item ─────────────────────────────────────────────
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
        {product.alternate && (
          <div style={{ color: '#555555', fontSize: '7.5pt' }}>{product.alternate}</div>
        )}
        {product.hsCode && (
          <div style={{ color: '#777777', fontSize: '7pt' }}>HS Code {product.hsCode} ECCN {product.eccn || ''}</div>
        )}
        {product.netWeight && (
          <div style={{ color: '#777777', fontSize: '7pt' }}>Net weight {product.netWeight}</div>
        )}
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

// ─── Sub-componente: Linha de Total ───────────────────────────────────────────
function TotalRow({ label, value }) {
  return (
    <tr>
      <td colSpan={3} style={{
        padding: '2mm 2mm',
        textAlign: 'right',
        fontSize: '8.5pt',
        color: '#555555',
        borderTop: '1px solid #cccccc',
        borderRight: '1px solid #cccccc',
      }}>
        {label}
      </td>
      <td style={{
        padding: '2mm 3mm',
        textAlign: 'right',
        fontSize: '9pt',
        fontWeight: '700',
        borderTop: '1px solid #cccccc',
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
  const now = new Date();
  const validity = parseInt(proposal.validityDays) || 10;
  const validUntil = addDays(now, validity);
  const products = (proposal.products || []).filter(p => p.description?.trim());

  const hasValidTotal = totalBRL !== null && totalBRL !== undefined && totalBRL > 0;
  const totalUSD = hasValidTotal ? totalBRL / (parseFloat(proposal.fx) || 5.20) : null;
  const totalUSDFormatted = totalUSD ? fmtUSD(totalUSD) : '—';
  const totalBRLFormatted = hasValidTotal ? fmtBRL(totalBRL) : '—';

  // Divide produtos em páginas
  const pages = [];
  for (let i = 0; i < products.length; i += ITEMS_PER_PAGE) {
    pages.push(products.slice(i, i + ITEMS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]); // ao menos 1 página

  const defaultConditions = [
    `Pagamento: ${proposal.paymentTerms || 'Conforme acordo comercial'}`,
    `Prazo de entrega estimado: ${proposal.deliveryDays || '30–45 dias úteis após confirmação'}`,
    `Proposta válida por ${validity} dias corridos`,
    'Valores sujeitos à disponibilidade de estoque e variação cambial',
    'Todos os itens possuem certificado de origem e rastreabilidade (FAA/EASA)',
  ].map(l => `• ${l}`).join('\n');

  const totalPages = pages.length + 1; // +1 para página final de condições

  return (
    <div id="pdf-document" style={{
      backgroundColor: '#e8e8e8',
      padding: '10px',
    }}>
      {/* ── Páginas de itens ── */}
      {pages.map((pageItems, pageIdx) => {
        const isLastItemPage = pageIdx === pages.length - 1;
        return (
          <div
            key={pageIdx}
            className="pdf-page"
            style={{
              ...PAGE_STYLE,
              pageBreakAfter: 'always',
              marginBottom: '10px',
            }}
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
                {/* Linha de total apenas na última página de itens */}
                {isLastItemPage && (
                  <TotalRow
                    label="Total"
                    value={`USD ${totalUSDFormatted.replace('$', '').replace('US', '')}`}
                  />
                )}
              </tbody>
            </table>

            {/* Número de página */}
            <div style={{
              position: 'absolute',
              bottom: '8mm',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: '7.5pt',
              color: '#888888',
            }}>
              Page {pageIdx + 1}
            </div>
          </div>
        );
      })}

      {/* ── Página final: observações + condições ── */}
      <div
        className="pdf-page"
        style={{
          ...PAGE_STYLE,
          marginBottom: '10px',
        }}
      >
        <PageHeader company={company} proposal={proposal} now={now} />

        {/* Total destacado */}
        {hasValidTotal && (
          <div style={{
            marginBottom: '8mm',
            padding: '3mm 4mm',
            backgroundColor: '#f8f8f8',
            border: '1px solid #dddddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontSize: '9pt', color: '#555555' }}>TOTAL DA PROPOSTA</div>
            <div>
              <div style={{ fontSize: '14pt', fontWeight: '700', textAlign: 'right' }}>
                {totalBRLFormatted}
              </div>
              <div style={{ fontSize: '8pt', color: '#777777', textAlign: 'right' }}>
                USD {totalUSDFormatted}
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        {proposal.observations?.trim() && (
          <div style={{ marginBottom: '8mm' }}>
            <div style={{
              fontSize: '9pt',
              fontWeight: '700',
              borderBottom: '1px solid #cccccc',
              paddingBottom: '1mm',
              marginBottom: '3mm',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}>
              Observações para o Cliente
            </div>
            <div style={{
              fontSize: '8.5pt',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              color: '#333333',
            }}>
              {proposal.observations}
            </div>
          </div>
        )}

        {/* Condições comerciais */}
        <div style={{ marginBottom: '10mm' }}>
          <div style={{
            fontSize: '9pt',
            fontWeight: '700',
            borderBottom: '1px solid #cccccc',
            paddingBottom: '1mm',
            marginBottom: '3mm',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}>
            Condições Comerciais
          </div>
          <div style={{
            fontSize: '8.5pt',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            color: '#333333',
          }}>
            {proposal.conditions?.trim() || defaultConditions}
          </div>
        </div>

        {/* Rodapé com validade */}
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
        }}>
          <span>Esta proposta é válida até {formatDate(validUntil)}.</span>
          <span>
            {[company?.name, company?.email, company?.phone].filter(Boolean).join(' · ')}
          </span>
        </div>
      </div>
    </div>
  );
}
