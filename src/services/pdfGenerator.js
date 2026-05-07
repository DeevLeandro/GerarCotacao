/**
 * services/pdfGenerator.js
 * Gera PDF com quebra de página correta para o layout
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generatePDF(proposal, company, totalBRL, totalUSD) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const element = document.getElementById('pdf-document');
  if (!element) throw new Error('Element #pdf-document not found');

  // Captura cada página separadamente para quebra correta
  const pages = element.querySelectorAll('.pdf-page');
  const canvasList = [];
  
  for (const page of pages) {
    const canvas = await html2canvas(page, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    canvasList.push(canvas);
  }

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'letter',
    orientation: 'portrait',
  });

  for (let i = 0; i < canvasList.length; i++) {
    if (i > 0) pdf.addPage();
    
    const canvas = canvasList[i];
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  }

  const clientName = (proposal.clientName || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
  const proposalNum = (proposal.number || 'DRAFT').replace(/[^a-zA-Z0-9]/g, '_');
  pdf.save(`Proposta_${clientName}_${proposalNum}.pdf`);
}