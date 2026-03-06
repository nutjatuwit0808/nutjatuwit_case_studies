"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { fetchVocAnalytics } from "@/lib/api";
import type { VocAnalytics } from "@/types/voc";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_COLORS = [
  "rgba(56, 189, 248, 0.8)",
  "rgba(34, 211, 238, 0.8)",
  "rgba(74, 222, 128, 0.8)",
  "rgba(250, 204, 21, 0.8)",
  "rgba(251, 146, 60, 0.8)",
];

const BAR_OPTIONS_NO_LEGEND = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
} as const;

function ChartCard({
  title,
  hasData,
  colSpan,
  children,
}: {
  title: string;
  hasData: boolean;
  colSpan?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border border-slate-700 bg-slate-800/50 p-4 ${colSpan ? "md:col-span-2" : ""}`}
    >
      <h3 className="mb-4 text-lg font-semibold text-slate-200">{title}</h3>
      {hasData ? children : <p className="text-slate-500">ยังไม่มีข้อมูล</p>}
    </div>
  );
}

export function VoCCharts() {
  const [data, setData] = useState<VocAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVocAnalytics()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-400">กำลังโหลด...</p>;
  if (error) return <p className="text-red-400">เกิดข้อผิดพลาด: {error}</p>;
  if (!data) return null;

  const intentLabels = Object.keys(data.byIntent);
  const sentimentLabels = Object.keys(data.bySentiment);

  const intentChartData = {
    labels: intentLabels,
    datasets: [
      {
        label: "จำนวน",
        data: intentLabels.map((k) => data.byIntent[k]),
        backgroundColor: CHART_COLORS,
      },
    ],
  };

  const sentimentChartData = {
    labels: sentimentLabels,
    datasets: [
      {
        data: sentimentLabels.map((k) => data.bySentiment[k]),
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
      },
    ],
  };

  const dateChartData = {
    labels: data.byDate.map((d) => d.date),
    datasets: [
      {
        label: "จำนวนคำถาม",
        data: data.byDate.map((d) => d.count),
        fill: true,
        backgroundColor: "rgba(56, 189, 248, 0.2)",
        borderColor: "rgb(56, 189, 248)",
      },
    ],
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ChartCard title="Intent (ประเภทคำถาม)" hasData={intentLabels.length > 0}>
        <Bar data={intentChartData} options={BAR_OPTIONS_NO_LEGEND} />
      </ChartCard>

      <ChartCard title="Sentiment (อารมณ์ลูกค้า)" hasData={sentimentLabels.length > 0}>
        <div className="mx-auto h-48 w-48">
          <Doughnut
            data={sentimentChartData}
            options={{
              responsive: true,
              plugins: { legend: { position: "bottom" } },
            }}
          />
        </div>
      </ChartCard>

      <ChartCard title="คำถามตามวันที่" hasData={data.byDate.length > 0} colSpan>
        <Bar data={dateChartData} options={BAR_OPTIONS_NO_LEGEND} />
      </ChartCard>
    </div>
  );
}
