/**
 * services/pdfGenerator.js
 * Gera PDF no PADRÃO AMERICANO (Letter size 8.5" x 11")
 * 
 * CORREÇÕES DE CORTE:
 * - Calcula altura real do conteúdo
 * - Adiciona múltiplas páginas automaticamente
 * - Usa windowHeight para capturar tudo
 * - Mantém qualidade mesmo com várias páginas
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Gera PDF da proposta sem cortes
 * @param {Object} proposal - Dados da proposta
 * @param {Object} company - Dados da empresa  
 * @param {number} totalBRL - Total em BRL
 * @param {number} totalUSD - Total em USD
 * @returns {Promise<void>}
 */
export async function generatePDF(proposal, company, totalBRL, totalUSD) {
  // Aguarda renderização completa
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const element = document.getElementById('pdf-document');
  if (!element) throw new Error('Element #pdf-document not found');

  // OBTÉM DIMENSÕES REAIS DO ELEMENTO
  const originalHeight = element.scrollHeight;
  const originalWidth = element.scrollWidth;
  
  console.log(`📄 PDF Generation: Original size ${originalWidth} x ${originalHeight}`);

  // CAPTURA COM ALTURA TOTAL (sem cortes)
  const canvas = await html2canvas(element, {
    scale: 2.5, // Alta resolução
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: originalWidth,
    windowHeight: originalHeight, // CRUCIAL: captura altura total
    scrollX: 0,
    scrollY: 0,
    onclone: (clonedDoc, element) => {
      // Garante que o clone tenha as dimensões corretas
      const clonedElement = clonedDoc.getElementById('pdf-document');
      if (clonedElement) {
        clonedElement.style.height = 'auto';
        clonedElement.style.overflow = 'visible';
      }
    }
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  
  // CONFIGURA PDF TAMANHO CARTA (AMERICANO)
  const pdf = new jsPDF({
    unit: 'mm',
    format: 'letter',
    orientation: 'portrait',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();   // ~216mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // ~279mm
  
  // Calcula proporção da imagem
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  
  console.log(`📄 PDF Page: ${pageWidth}mm x ${pageHeight}mm`);
  console.log(`📄 Image: ${imgWidth}mm x ${imgHeight}mm`);
  
  // CALCULA QUANTAS PÁGINAS SÃO NECESSÁRIAS
  const totalPages = Math.ceil(imgHeight / pageHeight);
  console.log(`📄 Total pages needed: ${totalPages}`);
  
  // ADICIONA PÁGINAS COM POSICIONAMENTO CORRETO
  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage();
    }
    
    const yOffset = -(page * pageHeight);
    
    pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, imgHeight);
    
    // Opcional: Adiciona numeração de página
    const pageNumber = page + 1;
    if (totalPages > 1) {
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 25, pageHeight - 5);
    }
  }

  // Nome do arquivo
  const clientName = (proposal.clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
  const proposalNum = (proposal.number || 'DRAFT').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Proposal_${clientName}_${proposalNum}.pdf`;
  
  pdf.save(filename);
  console.log(`✅ PDF saved: ${filename}`);
  
  return { success: true, filename, pages: totalPages };
}

/**
 * Versão alternativa com compressão para arquivos grandes
 */
export async function generatePDFCompressed(proposal, company, totalBRL, totalUSD) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const element = document.getElementById('pdf-document');
  if (!element) throw new Error('Element #pdf-document not found');

  // Captura com qualidade um pouco menor para arquivos menores
  const canvas = await html2canvas(element, {
    scale: 2.0, // Qualidade ligeiramente menor, mas arquivo menor
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.85); // Compressão mais forte
  
  const pdf = new jsPDF({
    unit: 'mm',
    format: 'letter',
    orientation: 'portrait',
    compress: true, // Compressão interna do PDF
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  
  const totalPages = Math.ceil(imgHeight / pageHeight);
  
  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, -(page * pageHeight), imgWidth, imgHeight);
  }

  const clientName = (proposal.clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
  const proposalNum = (proposal.number || 'DRAFT').replace(/[^a-zA-Z0-9]/g, '_');
  pdf.save(`Proposal_${clientName}_${proposalNum}.pdf`);
}