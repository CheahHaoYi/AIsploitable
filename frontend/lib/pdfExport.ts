import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  cveId?: string | null;
  title?: string;
  filename?: string;
}

/**
 * Directly generates and downloads a high-fidelity PDF from the rendered report element.
 * Bypasses the browser print dialog completely and delivers a clean multi-page .pdf document.
 */
export async function exportReportElementToPdf(
  target: HTMLElement | string,
  options: PdfExportOptions = {}
): Promise<void> {
  const element = typeof target === 'string' ? document.getElementById(target) : target;
  if (!element) {
    throw new Error('Report element not found for PDF export.');
  }

  // Create high-resolution canvas from the target element
  const canvas = await html2canvas(element, {
    scale: 2, // 2x resolution for sharp, vector-quality text
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth || 1024,
    onclone: (clonedDoc, clonedElement) => {
      if (clonedElement) {
        clonedElement.style.overflow = 'visible';
        clonedElement.style.maxHeight = 'none';
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.borderRadius = '0px';
        clonedElement.style.border = 'none';
        clonedElement.style.padding = '24px';
        clonedElement.style.backgroundColor = '#ffffff';

        // Ensure all nested scrollable containers expand to full height
        const scrollables = clonedElement.querySelectorAll('.overflow-y-auto, .overflow-x-auto, pre, table');
        scrollables.forEach((el) => {
          (el as HTMLElement).style.overflow = 'visible';
          (el as HTMLElement).style.maxHeight = 'none';
        });
      }
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm
  const marginX = 10;
  const marginY = 12;
  const printableWidth = pdfWidth - marginX * 2;
  const pageContentHeight = pdfHeight - marginY * 2;

  // Calculate scaled height based on printable width
  const scaledHeight = (canvas.height * printableWidth) / canvas.width;

  let heightLeft = scaledHeight;
  let pageNumber = 1;

  // Slice image across pages cleanly
  while (heightLeft > 0) {
    if (pageNumber > 1) {
      pdf.addPage();
    }

    const position = marginY - (pageNumber - 1) * pageContentHeight;
    pdf.addImage(
      imgData,
      'JPEG',
      marginX,
      position,
      printableWidth,
      scaledHeight,
      undefined,
      'FAST'
    );

    // Add running footer with page numbers
    pdf.setFontSize(8);
    pdf.setTextColor(130, 130, 130);
    pdf.text(
      `CyberTriage AI — Security Verification Report (${options.cveId || 'TLP:AMBER'}) • Page ${pageNumber}`,
      marginX,
      pdfHeight - 5
    );

    heightLeft -= pageContentHeight;
    pageNumber++;
  }

  // Generate safe filename
  const safeId = (options.cveId || 'SecurityReport').replace(/[^a-zA-Z0-9-_]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const finalFilename = options.filename || `CyberTriage_${safeId}_${dateStr}.pdf`;

  pdf.save(finalFilename);
}
