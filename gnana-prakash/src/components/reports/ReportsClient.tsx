"use client";
import { useState } from "react";
import { FileText, Download, Loader2, BarChart3, Users, MapPin, UtensilsCrossed, Image, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const REPORT_TYPES = [
  { id: "attendance", label: "Attendance Report", icon: ClipboardList, color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-950", desc: "Day-wise attendance summary for all programs" },
  { id: "participant", label: "Participant Report", icon: Users, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950", desc: "Complete participant registration details" },
  { id: "venue", label: "Venue Report", icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950", desc: "Infrastructure and occupancy statistics" },
  { id: "food", label: "Food Report", icon: UtensilsCrossed, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950", desc: "Meal consumption and quantity data" },
  { id: "photo", label: "Photo Report", icon: Image, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950", desc: "Uploaded and approved media summary" },
  { id: "consolidated", label: "Consolidated Report", icon: BarChart3, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-800", desc: "Full program report with all modules" },
];

export default function ReportsClient() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [filters, setFilters] = useState({ programId: "", district: "", from: "", to: "" });

  const generate = async (type: string, format: "pdf" | "excel") => {
    setGenerating(`${type}-${format}`);
    try {
      const qs = new URLSearchParams({ type, format, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) }).toString();
      const res = await fetch(`/api/reports?${qs}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-report-${Date.now()}.${format === "pdf" ? "pdf" : "xlsx"}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      // show error toast
    } finally {
      setTimeout(() => setGenerating(null), 1000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Program ID</label>
              <input placeholder="Optional" className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={filters.programId} onChange={e => setFilters(p => ({ ...p, programId: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">District</label>
              <input placeholder="Optional" className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={filters.district} onChange={e => setFilters(p => ({ ...p, district: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
              <input type="date" className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={filters.from} onChange={e => setFilters(p => ({ ...p, from: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
              <input type="date" className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={filters.to} onChange={e => setFilters(p => ({ ...p, to: e.target.value }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map(({ id, label, icon: Icon, color, bg, desc }) => (
          <Card key={id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs h-8"
                  disabled={!!generating} onClick={() => generate(id, "pdf")}>
                  {generating === `${id}-pdf` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs h-8"
                  disabled={!!generating} onClick={() => generate(id, "excel")}>
                  {generating === `${id}-excel` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
