import React, { useState, useEffect } from "react";

export default function ClockWidget() {
  const [timeData, setTimeData] = useState({
    wib: "",
    istiwak: "",
    masehi: "",
    hijri: ""
  });

  const getIstiwak = (now: Date) => {
    // Longitude for Sumber Kejayan Jember Jatim is approx 112.72 (Jember / East Java)
    const longitude = 112.72;
    // 105 degrees is the standard meridian for WIB (GMT+7).
    // Difference is (longitude - 105) * 4 minutes per degree.
    const offsetMin = (longitude - 105) * 4;
    const t = new Date(now.getTime() + offsetMin * 60000);

    return t.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta"
    });
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const wibStr = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta"
      }) + " WIB";

      const masehiStr = now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta"
      });

      let hijriStr = "";
      try {
        hijriStr = new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Jakarta"
        }).format(now);
      } catch (err) {
        hijriStr = "Islamic Calendar Error";
      }

      const istiwakStr = getIstiwak(now);

      setTimeData({
        wib: wibStr,
        istiwak: istiwakStr,
        masehi: masehiStr,
        hijri: hijriStr
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-right flex flex-col items-end justify-center">
      <div className="font-mono text-xl sm:text-2xl font-bold text-teal-800 flex items-center gap-1.5 leading-none">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
        </span>
        {timeData.wib}
      </div>
      <div className="text-xs font-semibold text-slate-500 mt-1 text-right max-w-[280px] sm:max-w-none">
        <span>Istiwak ± {timeData.istiwak}</span>
        <span className="mx-1.5 text-teal-300">•</span>
        <span>{timeData.masehi}</span>
        <span className="mx-1.5 text-teal-300">•</span>
        <span>{timeData.hijri}</span>
      </div>
    </div>
  );
}
