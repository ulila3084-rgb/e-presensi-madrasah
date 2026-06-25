import { Guru } from "./types";

export const ADMIN_USER = "MUDM";
export const ADMIN_PASS = "12345";

export const APP_TITLE = "Presensi Digital Guru MMU Tsanawiyah";
export const SCHOOL_NAME = "MMU TSANAWIYAH";
export const SCHOOL_SUBTITLE = "Ranting B-48 Sumber Kejayan";

export const GURU: [string, string][] = [
  ["A", "Ibu Nyai Hilmiyatus Sholihah"],
  ["B", "Abdul Haris Bukhory"],
  ["C", "Abdul Rozak"],
  ["D", "Amin Saputra"],
  ["E", "Muhammad Lukito Bawavi"],
  ["F", "Muhammad Shohib"],
  ["G", "Roni Sianturi"],
  ["H", "Shohebi Maulana Rijal"],
  ["I", "Afdila Nurus Sobah"],
  ["J", "Anisatul Awaliya"],
  ["K", "Ahmad Shofyan Yahya"],
  ["L", "Mahrus Sholeh"],
  ["M", "Alfatoni Al Farisi"],
  ["N", "M Riski Hidayatullah"],
  ["O", "Muhammad Zaini"]
];

export const JAM: Record<string, string> = {
  "1-2": "13.00 - 14.00 WIB",
  "3-4": "14.00 - 15.00 WIB",
  "5-6": "15.00 - 16.00 WIB"
};

export const JADWAL: Record<string, Record<string, [string, string, string][]>> = {
  "SABTU": {
    "1-2": [
      ["Kelas I", "Fiqih", "K"],
      ["Kelas II", "Akhlaq", "L"],
      ["Kelas III", "Nahwu", "I"]
    ],
    "3-4": [
      ["Kelas I", "Qoidah", "L"],
      ["Kelas II", "Hisab", "M"],
      ["Kelas III", "Akhlaq", "D"]
    ],
    "5-6": [
      ["Kelas I", "Al Quran", "F"],
      ["Kelas II", "Tarikh", "K"],
      ["Kelas III", "Hisab", "M"]
    ]
  },

  "AHAD": {
    "1-2": [
      ["Kelas I", "Fiqih", "K"],
      ["Kelas II", "Hadits", "H"],
      ["Kelas III", "Nahwu", "I"]
    ],
    "3-4": [
      ["Kelas I", "Akhlaq", "L"],
      ["Kelas II", "Arudl", "G"],
      ["Kelas III", "Fiqih", "K"]
    ],
    "5-6": [
      ["Kelas I", "Tarikh", "K"],
      ["Kelas II", "Al Quran/Imlak", "F"],
      ["Kelas III", "Qoidah", "L"]
    ]
  },

  "SENIN": {
    "1-2": [
      ["Kelas I", "Balaghoh", "C"],
      ["Kelas II", "Qoidah", "L"],
      ["Kelas III", "Tarikh", "K"]
    ],
    "3-4": [
      ["Kelas I", "Faroidl", "H"],
      ["Kelas II", "Balaghoh", "C"],
      ["Kelas III", "Ilmu Tafsir", "J"]
    ],
    "5-6": [
      ["Kelas I", "Q. Kitab/Imlak", "E"],
      ["Kelas II", "Fiqih", "K"],
      ["Kelas III", "Balaghoh", "C"]
    ]
  },

  "SELASA": {
    "1-2": [
      ["Kelas I", "Ushul Fiqih", "N"],
      ["Kelas II", "Mantiq", "C"],
      ["Kelas III", "Tauhid", "B"]
    ],
    "3-4": [
      ["Kelas I", "Balaghoh", "C"],
      ["Kelas II", "Tauhid", "B"],
      ["Kelas III", "Tafsir", "A"]
    ],
    "5-6": [
      ["Kelas I", "Nahwu", "I"],
      ["Kelas II", "Tafsir", "A"],
      ["Kelas III", "Tauhid", "B"]
    ]
  },

  "RABU": {
    "1-2": [
      ["Kelas I", "Tafsir", "L"],
      ["Kelas II", "Nahwu", "I"],
      ["Kelas III", "Al Quran/Imlak", "N"]
    ],
    "3-4": [
      ["Kelas I", "Nahwu", "I"],
      ["Kelas II", "Tafsir", "A"],
      ["Kelas III", "Fiqih", "K"]
    ],
    "5-6": [
      ["Kelas I", "Hadits", "O"],
      ["Kelas II", "Ushul Fiqih", "N"],
      ["Kelas III", "Tafsir", "A"]
    ]
  },

  "KAMIS": {
    "1-2": [
      ["Kelas I", "Tauhid", "L"],
      ["Kelas II", "Fiqih", "K"],
      ["Kelas III", "Ushul Fiqih", "E"]
    ],
    "3-4": [
      ["Kelas I", "Hisab", "M"],
      ["Kelas II", "Nahwu", "I"],
      ["Kelas III", "Mantiq", "C"]
    ],
    "5-6": [
      ["Kelas I", "Tafsir", "L"],
      ["Kelas II", "Mustholah", "K"],
      ["Kelas III", "Hadits", "H"]
    ]
  }
};

export const BULAN_LIST = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function getHariFromDate(dateISO: string): string {
  const d = dateISO ? new Date(dateISO + "T00:00:00") : new Date();
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...

  return {
    1: "SENIN",
    2: "SELASA",
    3: "RABU",
    4: "KAMIS",
    5: "JUMAT",
    6: "SABTU",
    0: "AHAD"
  }[day] || "SENIN";
}

export function getMonthName(dateISO: string): string {
  const d = new Date(dateISO + "T00:00:00");
  return BULAN_LIST[d.getMonth()];
}

export function getYear(dateISO: string): string {
  return new Date(dateISO + "T00:00:00").getFullYear().toString();
}

export function guruByKode(kode: string): Guru {
  const g = GURU.find(x => x[0] === kode);
  return g ? { kode: g[0], nama: g[1] } : { kode, nama: "-" };
}
