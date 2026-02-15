// src/app/components/StepResult.jsx
import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Printer, RefreshCcw } from 'lucide-react';

export default function StepResult({ 
    isUploading, // Boolean: True jika sedang upload
    finalImage,  // Base64 gambar final
    resultUrl,   // URL untuk QR Code
    pin,         // PIN akses
    layout,      // single / strip (buat ukuran print)
    onHome       // Fungsi reset ke halaman awal
}) {
  const [copyInput, setCopyInput] = useState('4');
  const requestedCopies = Math.max(1, Math.min(999, Number.parseInt(copyInput, 10) || 1));
  const slotsPerSheet = 4;
  const totalSheets = Math.ceil(requestedCopies / slotsPerSheet);

  const handlePrint = () => {
    if (!finalImage) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    document.body.appendChild(iframe);

    const printDocument = iframe.contentWindow?.document;
    if (!printDocument) {
      iframe.remove();
      return;
    }

    const printSize = layout === 'strip'
      ? { width: '5cm', height: '15cm' }
      : { width: '10cm', height: '15cm' };

    const sheetsMarkup = Array.from({ length: totalSheets })
      .map((_, sheetIndex) => {
        const start = sheetIndex * slotsPerSheet;
        const countOnThisSheet = Math.min(slotsPerSheet, requestedCopies - start);
        const slotsMarkup = Array.from({ length: countOnThisSheet })
          .map(
            () => `
              <div class="slot">
                <img src="${finalImage}" alt="Print Result" />
              </div>
            `
          )
          .join('');

        return `<section class="sheet">${slotsMarkup}</section>`;
      })
      .join('');

    printDocument.open();
    printDocument.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Folkshoot Print</title>
          <style>
            @page { margin: 5mm; size: A4 portrait; }
            html, body {
              margin: 0;
              padding: 0;
              background: #fff;
            }
            .sheet {
              width: 100%;
              height: 287mm; /* 297mm - (5mm top + 5mm bottom) */
              box-sizing: border-box;
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              grid-template-rows: repeat(2, minmax(0, 1fr));
              gap: 1mm;
              page-break-after: always;
            }
            .sheet:last-child {
              page-break-after: auto;
            }
            .slot {
              display: grid;
              place-items: center;
              box-sizing: border-box;
              padding: 1mm;
            }
            img {
              width: auto;
              height: auto;
              max-width: min(${printSize.width}, calc(100% - 1mm));
              max-height: min(calc(${printSize.height} - 2mm), calc(100% - 1mm));
              object-fit: contain;
              display: block;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${sheetsMarkup}
        </body>
      </html>
    `);
    printDocument.close();

    const cleanup = () => {
      setTimeout(() => iframe.remove(), 300);
    };

    iframe.onload = () => {
      const printWindow = iframe.contentWindow;
      if (!printWindow) {
        cleanup();
        return;
      }
      printWindow.onafterprint = cleanup;
      printWindow.focus();
      printWindow.print();
      setTimeout(cleanup, 15000);
    };
  };

  // --- TAMPILAN 1: LOADING / UPLOADING ---
  if (isUploading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center animate-pulse">
            <div className="w-20 h-20 border-8 border-zinc-100 border-t-black rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-black uppercase tracking-widest mb-1">Processing</h2>
            <p className="text-zinc-400 text-xs uppercase tracking-[0.2em]">Enhancing & Printing...</p>
        </div>
      </div>
    );
  }

  // --- TAMPILAN 2: HASIL AKHIR ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 animate-in fade-in zoom-in duration-500">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
            
            {/* KOLOM KIRI: PREVIEW GAMBAR */}
            <div className="flex justify-center md:justify-end">
                <div className="bg-white p-3 shadow-2xl border border-zinc-200 rotate-1 transform hover:rotate-0 transition duration-500">
                     {finalImage ? (
                        <img 
                            src={finalImage} 
                            alt="Result" 
                            className="max-h-[70vh] w-auto object-contain rounded-sm" 
                        />
                     ) : (
                        <div className="w-64 h-96 bg-zinc-100 flex items-center justify-center text-zinc-300">No Image</div>
                     )}
                </div>
            </div>

            {/* KOLOM KANAN: INFO & QR */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
                <h1 className="text-5xl font-black mb-2 tracking-tighter">FOLKSHOOT</h1>
                <p className="text-zinc-400 mb-10 uppercase tracking-[0.3em] text-xs border-b border-zinc-200 pb-4 w-full md:w-auto">
                    Memory Secured
                </p>

                {/* QR CODE BOX */}
                <div className="bg-white p-4 border-2 border-black inline-block mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {resultUrl ? (
                        <QRCodeCanvas value={resultUrl} size={160} level={"H"} />
                    ) : (
                        <div className="w-[160px] h-[160px] bg-zinc-200 animate-pulse"></div>
                    )}
                </div>

                {/* PIN INFO */}
                <div className="mb-10 text-center md:text-left">
                    <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1 tracking-widest">Access Code</p>
                    <div className="text-6xl font-mono font-bold tracking-widest text-black">
                        {pin || "----"}
                    </div>
                </div>

                {/* TOMBOL PRINT + NEW SESSION */}
                <div className="w-full md:w-auto mb-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">
                        Print Copies
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 4].map((value) => (
                            <button
                                key={value}
                                onClick={() => setCopyInput(String(value))}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${requestedCopies === value ? 'bg-black text-white border-black' : 'bg-white text-zinc-700 border-zinc-300 hover:border-zinc-500'}`}
                            >
                                {value}
                            </button>
                        ))}
                        <input
                            type="number"
                            min="1"
                            max="999"
                            value={copyInput}
                            onChange={(e) => setCopyInput(e.target.value)}
                            className="w-24 px-3 py-1.5 rounded-full border border-zinc-300 text-sm font-bold text-center focus:outline-none focus:border-black"
                        />
                    </div>
                    <p className="text-xs text-zinc-500">
                        {requestedCopies} copy, otomatis {totalSheets} lembar A4.
                    </p>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={handlePrint}
                        disabled={!finalImage}
                        className="w-full md:w-auto px-10 py-4 bg-zinc-100 text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-sm flex items-center justify-center gap-3 rounded-full disabled:opacity-40"
                    >
                        <Printer size={18} /> Print
                    </button>
                    <button 
                        onClick={onHome} 
                        className="w-full md:w-auto px-12 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-zinc-800 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 rounded-full"
                    >
                        <RefreshCcw size={18} /> New Session
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
