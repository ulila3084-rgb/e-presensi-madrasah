import React, { useState, useEffect } from "react";
import { AttendanceRecord } from "../types";
import { Check, ClipboardList, Trash2, Save, Sparkles, Smile, RefreshCw } from "lucide-react";

interface InputTabProps {
  initialRecords: AttendanceRecord[];
  onSave: (records: AttendanceRecord[]) => Promise<void>;
  isSyncing: boolean;
}

export default function InputTab({ initialRecords, onSave, isSyncing }: InputTabProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    // Clone initial records to avoid mutation
    setRecords(JSON.parse(JSON.stringify(initialRecords)));
  }, [initialRecords]);

  const handleStatusChange = (index: number, newStatus: "Masuk" | "Izin" | "Sakit" | "Alpa" | "") => {
    const updated = [...records];
    updated[index].status = newStatus;

    if (newStatus === "Masuk") {
      const now = new Date();
      updated[index].jamMasuk = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta"
      });
    } else {
      updated[index].jamMasuk = "";
    }
    setRecords(updated);
  };

  const markAllMasuk = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta"
    });

    const updated = records.map(r => ({
      ...r,
      status: "Masuk" as const,
      jamMasuk: timeStr
    }));
    setRecords(updated);
  };

  const clearAllStatus = () => {
    const updated = records.map(r => ({
      ...r,
      status: "" as const,
      jamMasuk: ""
    }));
    setRecords(updated);
  };

  const handleSubmit = async () => {
    const filledRecords = records.filter(r => r.status);
    if (filledRecords.length === 0) {
      alert("Harap pilih status untuk minimal satu guru.");
      return;
    }
    await onSave(records);
  };

  return (
    <div className="space-y-6">
      {/* Control Buttons Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 leading-none">Formulir Presensi Guru</h3>
            <p className="text-xs text-slate-400 mt-1">Simpan kehadiran guru secara harian di sini.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={markAllMasuk}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 rounded-xl border border-emerald-150 transition-all cursor-pointer min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            Semua Masuk
          </button>
          <button
            onClick={clearAllStatus}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-150 transition-all cursor-pointer min-h-[44px]"
          >
            <Trash2 className="w-4 h-4" />
            Kosongkan
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSyncing}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Presensi
          </button>
        </div>
      </div>

      {/* Main Grid / Cards Container */}
      <div className="block lg:hidden space-y-4">
        {/* Mobile View Card List */}
        {records.map((r, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-teal-50 text-teal-800 text-xs font-bold">
                    {r.kode}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-sm">{r.nama}</h4>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {r.hari} • {r.kelas !== "-" ? r.kelas : "Piket"} • Sesi {r.sesi !== "-" ? r.sesi : "Piket"}{" "}
                  {r.mapel ? `• ${r.mapel}` : ""}
                </p>
              </div>
              {r.jamMasuk && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700">
                  {r.jamMasuk}
                </span>
              )}
            </div>

            {/* Mobile Touch Targets */}
            <div className="grid grid-cols-5 gap-1 pt-1">
              {[
                { val: "Masuk", label: "Masuk", color: "bg-emerald-50 text-emerald-700 border-emerald-150 ring-emerald-400" },
                { val: "Izin", label: "Izin", color: "bg-amber-50 text-amber-700 border-amber-150 ring-amber-400" },
                { val: "Sakit", label: "Sakit", color: "bg-blue-50 text-blue-700 border-blue-150 ring-blue-400" },
                { val: "Alpa", label: "Alpa", color: "bg-rose-50 text-rose-700 border-rose-150 ring-rose-400" },
                { val: "", label: "Kosong", color: "bg-slate-50 text-slate-500 border-slate-150 ring-slate-400" }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => handleStatusChange(i, opt.val as any)}
                  className={`py-2.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center gap-0.5 ${
                    (r.status === opt.val)
                      ? `${opt.color} ring-2 border-transparent scale-102 font-extrabold`
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {opt.label}
                  {r.status === opt.val && <Check className="w-3 h-3 text-current mt-0.5" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view Table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150">
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kode</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Guru</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tugas / Kelas</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sesi / Jam</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mata Pelajaran</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[420px]">Pilih Kehadiran</th>
                <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Masuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-5 py-4 text-sm">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 text-teal-855 text-xs font-bold">
                      {r.kode}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-800">{r.nama}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {r.kelas !== "-" ? (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">
                        {r.kelas}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-xs">Piket</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {r.sesi !== "-" ? (
                      <div>
                        <span className="block font-medium text-slate-800">Sesi {r.sesi}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{r.jam}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">13.00 - 16.00 WIB</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-teal-800">
                    {r.mapel || <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <div className="flex gap-1">
                      {[
                        { val: "Masuk", label: "Masuk", style: "bg-emerald-50 text-emerald-700 border-emerald-150 hover:bg-emerald-100 ring-emerald-400" },
                        { val: "Izin", label: "Izin", style: "bg-amber-50 text-amber-700 border-amber-150 hover:bg-amber-100 ring-amber-400" },
                        { val: "Sakit", label: "Sakit", style: "bg-blue-50 text-blue-700 border-blue-150 hover:bg-blue-100 ring-blue-400" },
                        { val: "Alpa", label: "Alpa", style: "bg-rose-50 text-rose-700 border-rose-150 hover:bg-rose-100 ring-rose-400" },
                        { val: "", label: "Kosong", style: "bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100 ring-slate-400" }
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => handleStatusChange(i, opt.val as any)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer min-h-[36px] flex items-center justify-center gap-1 ${
                            r.status === opt.val
                              ? `${opt.style} ring-2 border-transparent scale-105`
                              : "bg-white text-slate-500 border-slate-200"
                          }`}
                        >
                          {opt.label}
                          {r.status === opt.val && <Check className="w-3.5 h-3.5 text-current" />}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-slate-500">
                    {r.jamMasuk ? (
                      <span className="bg-slate-50 px-2 py-1 rounded text-xs font-bold text-slate-600 border border-slate-100">
                        {r.jamMasuk}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
