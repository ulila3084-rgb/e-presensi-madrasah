import React, { useState, useRef } from "react";
import { setSyncUrl, getSyncUrl, readLocalPresensi, writeLocalPresensi } from "../localDb";
import { Link, Check, RefreshCw, AlertCircle, HardDrive, Smartphone, FileUp, FileDown, Trash2 } from "lucide-react";

interface SettingsTabProps {
  onSyncUrlChanged: () => void;
}

export default function SettingsTab({ onSyncUrlChanged }: SettingsTabProps) {
  const [url, setUrl] = useState(getSyncUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveUrl = () => {
    setSyncUrl(url);
    onSyncUrlChanged();
    alert("Konfigurasi URL Sinkronisasi berhasil disimpan!");
  };

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setTestResult({ success: false, message: "URL kosong. Harap masukkan URL Apps Script terlebih dahulu." });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const payload = {
        url: url.trim(),
        payload: { dateISO: new Date().toISOString().slice(0, 10) }
      };

      // We call our Express proxy
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Koneksi server gagal dengan status ${response.status}`);
      }

      const data = await response.json();
      if (data && (data.hari || data.totalMengajar !== undefined)) {
        setTestResult({
          success: true,
          message: `Koneksi berhasil! Menghubungkan ke Spreadsheet untuk hari ${data.hari || "aktif"}.`
        });
      } else {
        setTestResult({
          success: true,
          message: "Koneksi berhasil, namun format respons tidak sesuai standar. Pastikan Web App dipublikasikan dengan akses 'Anyone'."
        });
      }
    } catch (error: any) {
      console.error(error);
      setTestResult({
        success: false,
        message: `Koneksi gagal: ${error.message || "Pastikan URL benar dan Apps Script mengizinkan CORS / akses Publik (Anyone)."}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleBackup = () => {
    const data = readLocalPresensi();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-presensi-mmu-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const confirmRestore = window.confirm(
            `Apakah Anda yakin ingin memulihkan cadangan ini? Ini akan menggabungkan/menimpa data lokal Anda dengan ${json.length} catatan baru.`
          );
          if (confirmRestore) {
            writeLocalPresensi(json);
            alert("Data presensi berhasil dipulihkan dari cadangan!");
            onSyncUrlChanged();
          }
        } else {
          alert("Format file cadangan tidak valid. File harus berupa list JSON.");
        }
      } catch (error) {
        alert("Gagal membaca file cadangan. Pastikan file berupa JSON yang valid.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // reset input
  };

  const handleClearData = () => {
    const confirmClear = window.confirm(
      "PERINGATAN: Apakah Anda yakin ingin menghapus semua data presensi lokal dari perangkat ini? Tindakan ini tidak dapat dibatalkan."
    );
    if (confirmClear) {
      writeLocalPresensi([]);
      onSyncUrlChanged();
      alert("Semua data presensi lokal telah dibersihkan.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Synchronization settings */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 sm:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <Link className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 leading-none">Sinkronisasi Google Sheets</h3>
            <p className="text-xs text-slate-400 mt-1">Integrasikan aplikasi ini dengan Spreadsheet Google Anda melalui Apps Script.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-450 tracking-wider">
              URL Google Apps Script Web App
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs sm:text-sm text-slate-800 bg-slate-50/30"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="flex-1 sm:flex-initial h-10 px-4 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Simpan URL
                </button>
                <button
                  type="button"
                  disabled={testing}
                  onClick={handleTestConnection}
                  className="flex-1 sm:flex-initial h-10 px-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-250 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  {testing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  Tes Koneksi
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              * Aplikasi akan menggunakan <strong>Penyimpanan Lokal (Offline)</strong> jika URL kosong. Setelah dihubungkan, semua status yang disimpan akan disinkronkan langsung ke Spreadsheet Anda.
            </p>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-2.5 animate-fadeIn text-xs sm:text-sm font-semibold ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : "bg-rose-50 border-rose-100 text-rose-800"
              }`}
            >
              {testResult.success ? (
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-650 flex-shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Local Storage & Backup Engine */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 leading-none">Manajemen Data Cadangan</h3>
            <p className="text-xs text-slate-400 mt-1">Ekspor, impor, atau bersihkan basis data lokal perangkat ini.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleBackup}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all min-h-[44px]"
          >
            <FileDown className="w-4 h-4 text-teal-650" />
            Ekspor Data (.json)
          </button>

          <button
            onClick={handleRestoreClick}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all min-h-[44px]"
          >
            <FileUp className="w-4 h-4 text-teal-650" />
            Impor Data (.json)
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={handleClearData}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-150 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all min-h-[44px]"
          >
            <Trash2 className="w-4 h-4" />
            Bersihkan Database
          </button>
        </div>
      </div>

      {/* PWA / Android installation card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 leading-none">Petunjuk Instalasi Android & iPhone</h3>
            <p className="text-xs text-slate-400 mt-1">Gunakan aplikasi ini seperti aplikasi native di HP Anda.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              Android (Google Chrome)
            </h4>
            <ol className="list-decimal pl-4 text-xs text-slate-500 space-y-1 font-medium leading-relaxed">
              <li>Buka browser Google Chrome di Android Anda.</li>
              <li>Ketuk tombol menu <strong>titik tiga (⋮)</strong> di sudut kanan atas.</li>
              <li>Pilih opsi <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong>.</li>
              <li>Ketuk <strong>"Tambahkan"</strong> untuk mengonfirmasi. Aplikasi akan muncul di beranda HP Anda!</li>
            </ol>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Apple iPhone (Safari)
            </h4>
            <ol className="list-decimal pl-4 text-xs text-slate-500 space-y-1 font-medium leading-relaxed">
              <li>Buka browser Safari di iPhone Anda.</li>
              <li>Ketuk tombol <strong>"Share" (Bagikan)</strong> di bilah bawah (ikon persegi berpanah atas).</li>
              <li>Gulir ke bawah dan ketuk opsi <strong>"Add to Home Screen" (Tambahkan ke Layar Utama)</strong>.</li>
              <li>Ketuk <strong>"Add" (Tambah)</strong> di sudut kanan atas. Aplikasi siap digunakan!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
