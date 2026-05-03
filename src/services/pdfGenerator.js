/**
 * services/pdfGenerator.js
 * Gera PDF usando html2canvas + jsPDF diretamente (sem html2pdf.js).
 * Mais estável com Create React App / Webpack 5.
 */
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generatePDF(proposal) {
  const el = document.getElementById('pdf-document');
  if (!el) throw new Error('Elemento #pdf-document não encontrado no DOM.');

  const filename = [
    'Proposta',
    proposal.number?.replace(/[^a-zA-Z0-9]/g, '_') || 'DRAFT',
    proposal.clientName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente',
  ].join('_') + '.pdf';

  // Renderiza o elemento como imagem em alta resolução
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 794,   // largura A4 em px a 96dpi
  });

  const imgData  = canvas.toDataURL('image/jpeg', 0.98);
  const pdf      = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const pageW    = pdf.internal.pageSize.getWidth();
  const pageH    = pdf.internal.pageSize.getHeight();
  const imgW     = pageW;
  const imgH     = (canvas.height * pageW) / canvas.width;

  // Se o conteúdo for maior que uma página, divide em múltiplas
  let yPos = 0;
  while (yPos < imgH) {
    if (yPos > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, -yPos, imgW, imgH);
    yPos += pageH;
  }

  pdf.save(filename);
}
