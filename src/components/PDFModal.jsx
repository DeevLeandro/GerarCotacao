/**
 * components/PDFModal.jsx
 * Modal de preview com botão para gerar PDF.
 */
import { useState } from 'react';
import ProposalPreview from './ProposalPreview';
import { generatePDF } from '../services/pdfGenerator';

export default function PDFModal({ proposal, company, totalBRL, totalUSD, onClose, onNotify }) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generatePDF(proposal);
      onNotify('PDF gerado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      onNotify('Erro ao gerar PDF: ' + err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-header-title">Preview da Proposta</div>
            <div className="modal-header-sub">Visualização do documento que o cliente receberá</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕ Fechar</button>
        </div>

        <div className="modal-body">
          <ProposalPreview
            proposal={proposal}
            company={company}
            totalBRL={totalBRL}
            totalUSD={totalUSD}
          />
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Fechar</button>
          <button
            className="btn btn-success btn-lg"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? '⏳ Gerando PDF...' : '⬇ Baixar PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
