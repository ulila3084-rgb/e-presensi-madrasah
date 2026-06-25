import React, { useState } from "react";
import { ReportData, ReportRow } from "../types";
import { Printer, FileText, Download, FileSpreadsheet, ListFilter, UserCheck } from "lucide-react";

interface ReportTabProps {
  report: ReportData;
  onModeChange: (mode: "harian" | "pekanan" | "bulanan") => void;
  onLoadReport: () => void;
}

export default function ReportTab({ report, onModeChange, onLoadReport }: ReportTabProps) {
  const [exportType, setExportType] = useState("excel");
  const [printPaper, setPrintPaper] = useState("a4");

  const exportCSV = () => {
    let csv = [];
    // Header
    csv.push(["No", "Kode", "Nama Guru", "Masuk", "Izin", "Sakit", "Alpa", "Masuk Guru Bantu / Piket"].join(","));

    report.rows.forEach((r, idx) => {
      csv.push([
        idx + 1,
        `"${r.kode}"`,
        `"${r.nama}"`,
        r.Masuk,
        r.Izin,
        r.Sakit,
        r.Alpa,
        r.GuruBantu
      ].join(","));
    });

    const blob = new Blob(["\ufeff" + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-rekap-${report.mode}-${report.dateISO}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const tableHtml = `
      <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <h2>${report.title}</h2>
          <table border="1" style="border-collapse:collapse; font-family: Arial, sans-serif;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:8px;">No</th>
                <th style="padding:8px;">Kode</th>
                <th style="padding:8px;">Nama Guru</th>
                <th style="padding:8px;">Masuk</th>
                <th style="padding:8px;">Izin</th>
                <th style="padding:8px;">Sakit</th>
                <th style="padding:8px;">Alpa</th>
                <th style="padding:8px;">Masuk Guru Bantu</th>
              </tr>
            </thead>
            <tbody>
              ${report.rows.map((r, idx) => `
                <tr>
                  <td style="padding:8px; text-align:center;">${idx + 1}</td>
                  <td style="padding:8px; text-align:center; font-weight:bold;">${r.kode}</td>
                  <td style="padding:8px;">${r.nama}</td>
                  <td style="padding:8px; text-align:center;">${r.Masuk}</td>
                  <td style="padding:8px; text-align:center;">${r.Izin}</td>
                  <td style="padding:8px; text-align:center;">${r.Sakit}</td>
                  <td style="padding:8px; text-align:center;">${r.Alpa}</td>
                  <td style="padding:8px; text-align:center;">${r.GuruBantu}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-rekap-${report.mode}-${report.dateISO}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportWord = () => {
    const wordHtml = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f1f5f9; font-weight: bold; }
            .title { text-align: center; margin-bottom: 20px; }
            .ttd-wrap { margin-top: 40px; display: flex; justify-content: flex-end; }
            .ttd-box { width: 250px; text-align: center; font-size: 13px; margin-left: auto; }
            .ttd-space { height: 75px; }
          </style>
        </head>
        <body>
          <div class="title">
            <h2>${report.title}</h2>
            <h3>MMU TSANAWIYAH JEMBER</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Nama Guru</th>
                <th>Masuk</th>
                <th>Izin</th>
                <th>Sakit</th>
                <th>Alpa</th>
                <th>Masuk Guru Bantu</th>
              </tr>
            </thead>
            <tbody>
              ${report.rows.map((r, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><b>${r.kode}</b></td>
                  <td>${r.nama}</td>
                  <td>${r.Masuk}</td>
                  <td>${r.Izin}</td>
                  <td>${r.Sakit}</td>
                  <td>${r.Alpa}</td>
                  <td>${r.GuruBantu}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="ttd-wrap">
            <div class="ttd-box">
              <div>Mengetahui,</div>
              <div>Kepala Sekolah</div>
              <div class="ttd-space"></div>
              <div><b>........................................</b></div>
              <div>NIP. ................................</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([wordHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-rekap-${report.mode}-${report.dateISO}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (exportType === "pdf") {
      handlePrint();
    } else if (exportType === "excel") {
      exportExcel();
    } else if (exportType === "word") {
      exportWord();
    } else if (exportType === "csv") {
      exportCSV();
    }
  };

  const handlePrint = () => {
    // Add page class to body for printing
    const originalClass = document.body.className;
    document.body.className = `${originalClass} print-${printPaper}`;

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.className = originalClass;
      }, 500);
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Tools Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 sm:p-5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 no-print">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl self-start sm:self-auto">
            <ListFilter className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Mode Rekap Laporan
            </label>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              {["harian", "pekanan", "bulanan"].map((m) => (
                <button
                  key={m}
                  onClick={() => onModeChange(m as any)}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold capitalize transition-all cursor-pointer ${
                    report.mode === m
                      ? "bg-white text-teal-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onLoadReport}
            className="sm:self-end h-9 px-4 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Muat Laporan
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Paper selector for print */}
          <div className="flex-1 sm:flex-initial">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Ukuran Kertas
            </label>
            <select
              value={printPaper}
              onChange={(e) => setPrintPaper(e.target.value)}
              className="h-9 w-full sm:w-24 text-xs font-bold border border-slate-200 rounded-lg px-2 bg-slate-50/50 cursor-pointer"
            >
              <option value="a4">A4 (Std)</option>
              <option value="f4">F4</option>
              <option value="a5">A5</option>
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial h-9 px-4 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak
          </button>

          {/* Export Selector */}
          <div className="flex-1 sm:flex-initial">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Format Ekspor
            </label>
            <div className="flex">
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="h-9 text-xs font-bold border border-slate-200 rounded-l-lg px-2 bg-slate-50/50 cursor-pointer w-full sm:w-28"
              >
                <option value="excel">Excel (.xls)</option>
                <option value="word">Word (.doc)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="pdf">PDF (Print)</option>
              </select>
              <button
                onClick={handleExport}
                className="h-9 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-r-lg flex items-center justify-center transition-all cursor-pointer"
                title="Unduh Laporan"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actual Printable Report Sheet */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 sm:p-8 relative print:shadow-none print:border-0 print:p-0">
        {/* Print Header */}
        <div className="text-center border-b-2 border-slate-800 pb-5 mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            PRESENSI DIGITAL GURU
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black text-teal-850 mt-1 uppercase tracking-wider">
            MMU TSANAWIYAH
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Ranting B-48 Sumber Kejayan, Kecamatan Mayang, Kabupaten Jember
          </p>
          <div className="mt-4 bg-teal-50 border border-teal-100 text-teal-850 py-1.5 px-4 rounded-xl inline-block font-extrabold text-sm uppercase tracking-wide no-print">
            {report.title}
          </div>
          {/* Printable title */}
          <div className="hidden print:block text-sm font-bold uppercase mt-3 border border-slate-800 py-1 rounded">
            {report.title}
          </div>
        </div>

        {/* Report Content Table */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left border-collapse print:text-xs">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 print:bg-slate-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-center w-12 print:border">No</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-center w-16 print:border">Kode</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider print:border">Nama Guru</th>
                <th className="px-4 py-3 text-xs font-bold text-emerald-700 uppercase tracking-wider text-center print:border">Masuk</th>
                <th className="px-4 py-3 text-xs font-bold text-amber-700 uppercase tracking-wider text-center print:border">Izin</th>
                <th className="px-4 py-3 text-xs font-bold text-blue-700 uppercase tracking-wider text-center print:border">Sakit</th>
                <th className="px-4 py-3 text-xs font-bold text-rose-700 uppercase tracking-wider text-center print:border">Alpa</th>
                <th className="px-4 py-3 text-xs font-bold text-teal-855 uppercase tracking-wider text-center print:border">Guru Bantu (Piket)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {report.rows.map((row, index) => (
                <tr key={row.kode} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                  <td className="px-4 py-3 text-sm text-slate-500 text-center print:border">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-bold text-teal-850 text-center print:border">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-teal-50 text-teal-800 print:bg-transparent print:p-0 font-extrabold">
                      {row.kode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 print:border">{row.nama}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-emerald-650 print:border">{row.Masuk}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-amber-600 print:border">{row.Izin}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-blue-600 print:border">{row.Sakit}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-rose-600 print:border">{row.Alpa}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-teal-855 print:border">{row.GuruBantu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature Area */}
        <div className="mt-12 flex justify-end">
          <div className="w-[280px] text-center text-sm font-medium text-slate-700 space-y-1">
            <div>Jember, {report.dateISO}</div>
            <div>Mengetahui,</div>
            <div className="font-bold uppercase tracking-wider">Kepala Sekolah</div>
            <div className="h-24" /> {/* Spacer for physical signature */}
            <div className="font-extrabold border-b border-slate-400 pb-0.5 inline-block w-4/5 text-slate-900">
              ........................................
            </div>
            <div className="text-xs text-slate-450 mt-1">NIP. ........................................</div>
          </div>
        </div>
      </div>
    </div>
  );
}
