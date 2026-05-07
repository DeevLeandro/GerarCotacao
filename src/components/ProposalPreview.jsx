/**
 * components/ProposalPreview.jsx
 * CORREÇÃO: SEMPRE mostra o valor total no PDF (como na invoice)
 * O adminMode agora controla apenas visibilidade de custos internos, não do total
 */

import { formatDate, addDays } from '../utils/helpers';

export default function ProposalPreview({ proposal, company, totalBRL, adminMode = false }) {
  const now = new Date();
  const validity = parseInt(proposal.validityDays) || 10;
  const validUntil = addDays(now, validity);
  const products = (proposal.products || []).filter(p => p.description?.trim());
  
  // 🔥 CORREÇÃO: SEMPRE mostra o total, mesmo se for 0, mostra "To be calculated"
  const hasValidTotal = totalBRL !== null && totalBRL !== undefined && totalBRL > 0;
  const totalDisplay = hasValidTotal ? fmtBRL(totalBRL) : 'To be calculated';
  
  console.log('📄 ProposalPreview - totalBRL recebido:', totalBRL, 'exibindo:', totalDisplay);
  
  // Condições padrão
  const defaultConditions = [
    `Payment Terms: ${proposal.paymentTerms || 'As per commercial agreement'}`,
    `Estimated Delivery: ${proposal.deliveryDays || '30-45 business days after order confirmation'}`,
    `Validity: ${validity} calendar days from issue date`,
    `Prices subject to stock availability and exchange rate variations`,
    `All items are certified and traceable (FAA/EASA compliant)`,
  ].map(l => `• ${l}`).join('\n');

  return (
    <div id="pdf-document" style={{
      fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
      fontSize: '11pt',
      lineHeight: 1.4,
      color: '#333333',
      maxWidth: '100%',
      margin: 0,
      padding: '10mm',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
    }}>
      
      {/* HEADER - Company Info */}
      <div style={{
        borderBottom: '2px solid #1a1a2e',
        paddingBottom: '4mm',
        marginBottom: '6mm',
      }}>
        <div style={{
          fontSize: '22pt',
          fontWeight: '700',
          color: '#1a1a2e',
          letterSpacing: '-0.5px',
          marginBottom: '2mm',
        }}>
          {company?.name || 'BOAZ AVIATION'}
        </div>
        <div style={{
          fontSize: '10pt',
          color: '#666666',
          marginBottom: '3mm',
        }}>
          {company?.sub || 'Aircraft Parts Import & Export'}
        </div>
        <div style={{
          fontSize: '8pt',
          color: '#888888',
          borderTop: '1px solid #eeeeee',
          paddingTop: '2mm',
        }}>
          {[company?.address, company?.email, company?.phone].filter(Boolean).join('  |  ')}
        </div>
      </div>

      {/* PROPOSAL INFO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8mm',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '8pt', color: '#888888', marginBottom: '1mm', letterSpacing: '0.5px' }}>TO:</div>
          <div style={{ fontSize: '12pt', fontWeight: '600', color: '#1a1a2e' }}>
            {proposal.clientName || '—'}
          </div>
          {proposal.clientContact && (
            <div style={{ fontSize: '9pt', color: '#666666', marginTop: '1mm' }}>
              {proposal.clientContact}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '8pt', color: '#888888', marginBottom: '1mm', letterSpacing: '0.5px' }}>PROPOSAL NO:</div>
          <div style={{ fontSize: '12pt', fontWeight: '600', color: '#1a1a2e' }}>
            {proposal.number || '#001'}
          </div>
          <div style={{ fontSize: '9pt', color: '#666666', marginTop: '1mm' }}>
            Date: {formatDate(now)}
          </div>
        </div>
      </div>

      {/* BODY - Products Table */}
      <div style={{ marginBottom: '6mm' }}>
        <div style={{
          fontSize: '11pt',
          fontWeight: '600',
          color: '#1a1a2e',
          borderBottom: '1px solid #dddddd',
          paddingBottom: '1.5mm',
          marginBottom: '3mm',
        }}>
          ITEMS / MATERIAL
        </div>
        
        {products.length === 0 ? (
          <p style={{ color: '#999999', fontSize: '10pt', fontStyle: 'italic', margin: '4mm 0' }}>
            No items added to this proposal.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eeeeee', backgroundColor: '#fafafa' }}>
                <th style={{ textAlign: 'left', padding: '1.5mm 1mm', fontSize: '8pt', fontWeight: '600', color: '#555555', width: '18%' }}>Part #</th>
                <th style={{ textAlign: 'left', padding: '1.5mm 1mm', fontSize: '8pt', fontWeight: '600', color: '#555555' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '1.5mm 1mm', fontSize: '8pt', fontWeight: '600', color: '#555555', width: '12%' }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i === products.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
                  <td style={{ padding: '2mm 1mm', fontSize: '9pt', fontFamily: "'Courier New', monospace" }}>
                    {p.partNumber || '—'}
                  </td>
                  <td style={{ padding: '2mm 1mm', fontSize: '9pt', lineHeight: 1.3 }}>
                    {p.description}
                  </td>
                  <td style={{ padding: '2mm 1mm', fontSize: '9pt', textAlign: 'center' }}>
                    {p.qty || 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* OBSERVATIONS */}
      {proposal.observations?.trim() && (
        <div style={{ 
          marginBottom: '5mm',
          pageBreakInside: 'avoid',
        }}>
          <div style={{
            fontSize: '10pt',
            fontWeight: '600',
            color: '#1a1a2e',
            borderBottom: '1px solid #dddddd',
            paddingBottom: '1mm',
            marginBottom: '2mm',
          }}>
            OBSERVATIONS
          </div>
          <div style={{
            fontSize: '9pt',
            color: '#555555',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
          }}>
            {proposal.observations}
          </div>
        </div>
      )}

      {/* 🔥 TOTAL SECTION - SEMPRE VISÍVEL, IGUAL À INVOICE */}
      <div style={{
        marginTop: '6mm',
        marginBottom: '6mm',
        padding: '4mm 0',
        borderTop: '2px solid #1a1a2e',
        borderBottom: '2px solid #1a1a2e',
        textAlign: 'right',
        backgroundColor: '#fafafa',
        pageBreakInside: 'avoid',
      }}>
        <div style={{ fontSize: '10pt', color: '#666666', marginBottom: '2mm', letterSpacing: '0.5px' }}>
          TOTAL PROPOSAL VALUE
        </div>
        <div style={{
          fontSize: '24pt',
          fontWeight: '700',
          color: '#1a1a2e',
          letterSpacing: '-0.5px',
        }}>
          {totalDisplay}
        </div>
        <div style={{ fontSize: '8pt', color: '#888888', marginTop: '1mm' }}>
          {hasValidTotal ? 'All prices in Brazilian Real (BRL)' : 'Value will be calculated based on final costs'}
        </div>
      </div>

      {/* TERMS & CONDITIONS */}
      <div style={{ 
        marginBottom: '5mm',
        pageBreakInside: 'avoid',
      }}>
        <div style={{
          fontSize: '10pt',
          fontWeight: '600',
          color: '#1a1a2e',
          borderBottom: '1px solid #dddddd',
          paddingBottom: '1mm',
          marginBottom: '2mm',
        }}>
          TERMS & CONDITIONS
        </div>
        <div style={{
          fontSize: '8pt',
          color: '#555555',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
        }}>
          {proposal.conditions?.trim() || defaultConditions}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        marginTop: '5mm',
        paddingTop: '2mm',
        borderTop: '1px solid #eeeeee',
        fontSize: '7pt',
        color: '#999999',
        textAlign: 'center',
        pageBreakInside: 'avoid',
      }}>
        This proposal is valid until {formatDate(validUntil)}.
        <br />
        {company?.name || ''} - {company?.email || ''}
      </div>
    </div>
  );
}

function fmtBRL(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}