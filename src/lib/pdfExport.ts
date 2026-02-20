/**
 * src/lib/pdfExport.ts
 * PDF va Excel export uchun utility funksiyalar (jsPDF + jspdf-autotable + xlsx)
 */

import { default as jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency } from '../utils';

interface CompanyInfo {
    name: string;
    tin?: string;
    address?: string;
    phone?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function createBase(title: string, company: CompanyInfo): InstanceType<typeof jsPDF> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header band
    doc.setFillColor(99, 102, 241); // indigo-500
    doc.rect(0, 0, 210, 22, 'F');

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(company.name, 14, 10);

    // STIR
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`STIR: ${company.tin ?? '—'}  |  ${company.address ?? ''}  |  ${company.phone ?? ''}`, 14, 17);

    // Report title
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 33);

    // Date
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Yaratildi: ${new Date().toLocaleDateString('uz-UZ')}`, 14, 39);

    return doc;
}

// ─── Generic table PDF ────────────────────────────────────────────────────────
export function exportTableToPDF(
    title: string,
    columns: { header: string; dataKey: string; isNumber?: boolean }[],
    rows: Record<string, unknown>[],
    company: CompanyInfo = { name: 'Mini Buxgalter' },
    filename = 'hisobot'
) {
    const doc = createBase(title, company);

    autoTable(doc, {
        startY: 44,
        head: [columns.map(c => c.header)],
        body: rows.map(row => columns.map(c => row[c.dataKey] ?? '')),
        headStyles: {
            fillColor: [99, 102, 241],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8,
        },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: columns.reduce((acc, c, i) => {
            if (c.isNumber) acc[i] = { halign: 'right' };
            return acc;
        }, {} as Record<number, { halign: 'right' }>),
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 2.5 },
    });

    // Footer
    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`Mini Buxgalter — ${title} | Sahifa ${i}/${pageCount}`, 14, 290);
    }

    doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── Invoice PDF ──────────────────────────────────────────────────────────────
interface InvoiceData {
    number: string;
    date: string;
    dueDate: string;
    counterparty: string;
    lines: { productName: string; quantity: number; unitPrice: number; total: number }[];
    subtotal: number;
    qqsRate?: number;
    qqsAmount?: number;
    grandTotal: number;
    status: string;
    type: 'sale' | 'purchase';
}

export function exportInvoicePDF(invoice: InvoiceData, company: CompanyInfo = { name: 'Mini Buxgalter' }) {
    const isSale = invoice.type === 'sale';
    const title = isSale ? `Sotuv fakturasi: ${invoice.number}` : `Xarid fakturasi: ${invoice.number}`;
    const doc = createBase(title, company);

    // Invoice meta block
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(isSale ? 'Mijoz:' : 'Yetkazib beruvchi:', 14, 46);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.counterparty, 45, 46);

    doc.setFont('helvetica', 'bold');
    doc.text('Sana:', 14, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.date, 45, 52);

    doc.setFont('helvetica', 'bold');
    doc.text('Muddat:', 14, 58);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.dueDate, 45, 58);

    doc.setFont('helvetica', 'bold');
    doc.text('Holat:', 14, 64);
    doc.setFont('helvetica', 'normal');
    const statusMap: Record<string, string> = { paid: "To'langan", partial: "Qisman to'langan", unpaid: "To'lanmagan" };
    doc.text(statusMap[invoice.status] ?? invoice.status, 45, 64);

    // Line items table
    autoTable(doc, {
        startY: 70,
        head: [['Mahsulot', 'Miqdor', "Narx (so'm)", "Jami (so'm)"]],
        body: invoice.lines.map(l => [
            l.productName,
            l.quantity.toString(),
            formatCurrency(l.unitPrice),
            formatCurrency(l.total),
        ]),
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
        margin: { left: 14, right: 14 },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;

    // Totals block
    const totalsX = 130;
    const cols = [totalsX, 175];

    const drawTotalRow = (label: string, value: string, bold = false, colorHex?: [number, number, number]) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(bold ? 9 : 8);
        doc.setTextColor(...(colorHex ?? [30, 41, 59]));
        doc.text(label, cols[0], finalY + (drawTotalRow as unknown as { _y: number })._y);
        doc.text(value, cols[1], finalY + (drawTotalRow as unknown as { _y: number })._y, { align: 'right' });
        (drawTotalRow as unknown as { _y: number })._y += 6;
    };
    (drawTotalRow as unknown as { _y: number })._y = 0;

    drawTotalRow('Subtotal:', formatCurrency(invoice.subtotal));
    if (invoice.qqsAmount !== undefined && invoice.qqsRate) {
        drawTotalRow(`QQS (${invoice.qqsRate}%):`, formatCurrency(invoice.qqsAmount));
    }
    // Grand total separator
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.3);
    doc.line(totalsX, finalY + (drawTotalRow as unknown as { _y: number })._y - 2, 196, finalY + (drawTotalRow as unknown as { _y: number })._y - 2);
    drawTotalRow("JAMI TO'LOV:", formatCurrency(invoice.grandTotal), true, [99, 102, 241]);

    // Footer
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Mini Buxgalter — Avtomatik yaratilgan | ${new Date().toLocaleString('uz-UZ')}`, 14, 290);

    doc.save(`faktura_${invoice.number}_${invoice.date}.pdf`);
}

// ─── Excel export ─────────────────────────────────────────────────────────────
export function exportTableToExcel(
    title: string,
    columns: { header: string; dataKey: string }[],
    rows: Record<string, unknown>[],
    filename = 'hisobot'
) {
    const wb = XLSX.utils.book_new();
    const wsData = [
        columns.map(c => c.header),
        ...rows.map(row => columns.map(c => row[c.dataKey] ?? '')),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = columns.map(() => ({ wch: 20 }));

    // Header style (xlsx supports limited styling in xlsx format)
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
