/**
 * components/PDFModal.jsx
 * Modal de preview com botão para gerar PDF.
 * CORREÇÃO: Garante que o modal tenha scroll e o PDF seja gerado corretamente
 */

import { useState, useRef, useEffect } from 'react';
import ProposalPreview from './ProposalPreview';
import { generatePDF } from '../services/pdfGenerator';

export default function PDFModal({ 
  proposal, 
  company, 
  totalBRL, 
  totalUSD, 
  adminMode = false,
  onClose, 
  onNotify 
}) {
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef(null);

  // Garante que o preview seja renderizado completamente antes de gerar PDF
  useEffect(() => {
    // Pequeno delay para garantir renderização
    const timer = setTimeout(() => {
      if (previewRef.current) {
        console.log('✅ Preview ready for PDF generation');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [proposal, totalBRL]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Força um reflow antes de gerar
      await new Promise(resolve => setTimeout(resolve, 50));
      
      await generatePDF(proposal, company, totalBRL, totalUSD);
      onNotify('PDF generated successfully!', 'success');
    } catch (err) {
      console.error('PDF generation error:', err);
      onNotify('Error generating PDF: ' + err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ 
        maxWidth: 950, 
        width: '90%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div className="modal-header">
          <div>
            <div className="modal-header-title">Proposal Preview</div>
            <div className="modal-header-sub">
              {adminMode ? 'Admin View (with values)' : 'Customer View (values hidden)'}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕ Close</button>
        </div>

        <div className="modal-body" style={{ 
          flex: 1,
          overflow: 'auto', 
          background: '#e8e8e8',
          padding: '20px',
          minHeight: 0, // Crucial para flex funcionar
        }}>
          <div 
            ref={previewRef}
            style={{
              background: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              margin: '0 auto',
              maxWidth: '800px',
              width: '100%',
            }}
          >
            <ProposalPreview
              proposal={proposal}
              company={company}
              totalBRL={totalBRL}
              adminMode={adminMode}
            />
          </div>
        </div>

        <div className="modal-footer" style={{
          padding: '12px 20px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button
            className="btn btn-success btn-lg"
            onClick={handleGenerate}
            disabled={generating}
            style={{ minWidth: 140 }}
          >
            {generating ? '⏳ Generating...' : '⬇ Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}