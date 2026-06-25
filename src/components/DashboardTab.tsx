import React, { useState } from "react";
import { DashboardData, AttendanceRecord } from "../types";
import { Users, ClipboardCheck, AlertCircle, TrendingUp, Search, GraduationCap, ShieldCheck } from "lucide-react";

interface DashboardTabProps {
  data: DashboardData;
}

export default function DashboardTab({ data }: DashboardTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"mengajar" | "piket">("mengajar");
  const [searchQuery, setSearchQuery] = useState("");

  const recordsToRender = activeSubTab === "mengajar" ? data.mengajar : data.piket;

  const filteredRecords = recordsToRender.filter((r) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      r.nama.toLowerCase().includes(searchLower) ||
      r.kode.toLowerCase().includes(searchLower) ||
      r.mapel.toLowerCase().includes(searchLower) ||
      r.kelas.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Masuk":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">Masuk</span>;
      case "Izin":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-150">Izin</span>;
      case "Sakit":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-750 border border-blue-150">Sakit</span>;
      case "Alpa":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-150">Alpa</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-400 border border-slate-150">Belum Hadir</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex items-center gap-4 transition-all hover:scale-[1.02] duration-200">
          <div className="p-3.5 bg-teal-50 text-teal-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Guru Mengajar</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">{data.totalMengajar}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex items-center gap-4 transition-all hover:scale-[1.02] duration-200">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Sudah Diinput</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">{data.sudah}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md flex items-center gap-4 transition-all hover:scale-[1.02] duration-200">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Belum Diinput</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">{data.belum}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-700 to-emerald-800 rounded-2xl p-5 text-white shadow-lg flex items-center gap-4 transition-all hover:scale-[1.02] duration-200 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="p-3.5 bg-white/15 text-white rounded-xl relative z-10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="relative z-10 flex-1">
            <span className="block text-xs font-bold text-teal-100 uppercase tracking-wider">Persentase Kehadiran</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold">{data.persen}%</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-bold text-teal-50">Hari Ini</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        {/* Tab Headers */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-100 p-4 sm:p-5 gap-4">
          <div className="flex bg-slate-50 p-1 rounded-xl self-start">
            <button
              onClick={() => {
                setActiveSubTab("mengajar");
                setSearchQuery("");
              }}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeSubTab === "mengajar"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Guru Mengajar ({data.totalMengajar})
            </button>
            <button
              onClick={() => {
                setActiveSubTab("piket");
                setSearchQuery("");
              }}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                activeSubTab === "piket"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Guru Piket ({data.totalPiket})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari guru, kelas, mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-sm bg-slate-50/50"
            />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <p className="font-semibold text-sm">Tidak ada guru ditemukan</p>
              <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150">
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Kode</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Guru</th>
                  {activeSubTab === "mengajar" && (
                    <>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Sesi / Jam</th>
                      <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Mata Pelajaran</th>
                    </>
                  )}
                  {activeSubTab === "piket" && (
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tugas</th>
                  )}
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-slate-700">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 text-teal-800 text-xs font-bold">
                        {r.kode}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-800">{r.nama}</td>
                    {activeSubTab === "mengajar" && (
                      <>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">
                            {r.kelas}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          <span className="block font-medium text-slate-800">Sesi {r.sesi}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{r.jam}</span>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-teal-800">{r.mapel}</td>
                      </>
                    )}
                    {activeSubTab === "piket" && (
                      <td className="px-5 py-4 text-sm text-slate-500">
                        <span className="font-semibold text-emerald-800">Guru Bantu / Piket</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">13.00 - 16.00 WIB</span>
                      </td>
                    )}
                    <td className="px-5 py-4 text-sm">{getStatusBadge(r.status)}</td>
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
          )}
        </div>
      </div>
    </div>
  );
}
