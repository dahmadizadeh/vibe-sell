"use client";

import type { Mockup } from "@/lib/types";

interface MockupCardProps {
  mockup: Mockup;
}

function WindowChrome({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-gray-500 font-medium ml-1">{title}</span>
      </div>
      <div className="bg-white p-4">{children}</div>
    </div>
  );
}

function DashboardMockup({ mockup }: MockupCardProps) {
  const dp = mockup.dataPoints;
  const kpis = Object.entries(dp).slice(0, 4).map(([key, value]) => ({
    label: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    value,
  }));
  return (
    <WindowChrome title={mockup.title}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">{kpi.label}</div>
            <div className="text-lg font-bold text-gray-900">{String(kpi.value ?? "\u2014")}</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs text-gray-400 mb-2">Score Distribution \u2014 {mockup.companyName}</div>
        <div className="flex items-end gap-1 h-16">
          {[40, 55, 70, 85, 60, 90, 45, 75, 95, 50, 80, 65].map((h, i) => (
            <div key={i} className="flex-1 bg-brand-primary/20 rounded-t" style={{ height: `${h}%` }}>
              <div className="bg-brand-primary rounded-t w-full" style={{ height: `${Math.min(h + 10, 100)}%` }} />
            </div>
          ))}
        </div>
      </div>
    </WindowChrome>
  );
}

function TableMockup({ mockup }: MockupCardProps) {
  const rows = [
    { company: "Series B Fintech", score: 95, activity: "2h ago", status: "Hot" },
    { company: "Growth SaaS Co", score: 88, activity: "1d ago", status: "Warm" },
    { company: "Enterprise Cloud", score: 82, activity: "3h ago", status: "Warm" },
    { company: "AI Startup", score: 76, activity: "5d ago", status: "New" },
  ];
  return (
    <WindowChrome title={mockup.title}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase">
            <th className="text-left pb-2">Lead</th>
            <th className="text-left pb-2">Score</th>
            <th className="text-left pb-2 hidden sm:table-cell">Activity</th>
            <th className="text-left pb-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.company} className={`border-t border-gray-100 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
              <td className="py-2 text-gray-700">{row.company}</td>
              <td className="py-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  row.score >= 90 ? "bg-green-100 text-green-700" :
                  row.score >= 80 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>{row.score}</span>
              </td>
              <td className="py-2 text-gray-400 hidden sm:table-cell">{row.activity}</td>
              <td className="py-2">
                <span className={`inline-flex items-center gap-1 text-xs ${
                  row.status === "Hot" ? "text-red-600" :
                  row.status === "Warm" ? "text-amber-600" : "text-gray-500"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    row.status === "Hot" ? "bg-red-400" :
                    row.status === "Warm" ? "bg-amber-400" : "bg-gray-300"
                  }`} />
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-xs text-gray-400 text-center">
        Showing data for {mockup.companyName}
      </div>
    </WindowChrome>
  );
}

function KanbanMockup({ mockup }: MockupCardProps) {
  const columns = [
    { title: "New", color: "bg-blue-400", items: ["Inbound Lead A", "Referral B"] },
    { title: "Qualified", color: "bg-yellow-400", items: ["Demo Request C", `${mockup.companyName} Lead`] },
    { title: "In Review", color: "bg-purple-400", items: ["Enterprise Deal"] },
    { title: "Won", color: "bg-green-400", items: ["Closed Q4"] },
  ];
  return (
    <WindowChrome title={mockup.title}>
      <div className="grid grid-cols-4 gap-2">
        {columns.map((col) => (
          <div key={col.title}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="text-xs font-medium text-gray-500">{col.title}</span>
            </div>
            {col.items.map((item) => (
              <div key={item} className="bg-gray-50 rounded p-2 text-xs text-gray-700 mb-1.5 border border-gray-100 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </WindowChrome>
  );
}

function AlertsMockup({ mockup }: MockupCardProps) {
  const dp = mockup.dataPoints;
  const alerts = [
    { text: `New high-score lead: ${String(dp.topAlert ?? "Series B fintech")}`, priority: "High", time: "2m ago" },
    { text: `${mockup.companyName} headcount grew 12% this quarter`, priority: "Medium", time: "1h ago" },
    { text: "3 leads moved to qualification stage", priority: "Low", time: "3h ago" },
    { text: `New funding alert: ${mockup.companyName} sector`, priority: "Medium", time: "5h ago" },
  ];
  return (
    <WindowChrome title={mockup.title}>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div key={i} className={`rounded-lg p-3 flex items-start gap-3 ${i % 2 === 0 ? "bg-gray-50" : ""}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              alert.priority === "High" ? "bg-red-400" :
              alert.priority === "Medium" ? "bg-yellow-400" : "bg-gray-300"
            }`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700 leading-snug">{alert.text}</p>
              <p className="text-xs text-gray-400 mt-0.5">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </WindowChrome>
  );
}

export function MockupCard({ mockup }: MockupCardProps) {
  const renderMockup = () => {
    switch (mockup.type) {
      case "dashboard": return <DashboardMockup mockup={mockup} />;
      case "table": return <TableMockup mockup={mockup} />;
      case "kanban": return <KanbanMockup mockup={mockup} />;
      case "alerts": return <AlertsMockup mockup={mockup} />;
    }
  };

  return (
    <div>
      {renderMockup()}
      <p className="text-xs text-gray-400 mt-2">{mockup.caption}</p>
    </div>
  );
}
