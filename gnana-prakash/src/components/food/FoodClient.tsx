"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, UtensilsCrossed, Loader2, Coffee, Sun, Sunset, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MEALS = [
  { key: "breakfast", label: "Breakfast", icon: Sun, color: "text-amber-500" },
  { key: "teaBreak", label: "Tea Break", icon: Coffee, color: "text-amber-700" },
  { key: "lunch", label: "Lunch", icon: UtensilsCrossed, color: "text-brand-500" },
  { key: "snacks", label: "Snacks", icon: Sunset, color: "text-orange-500" },
  { key: "dinner", label: "Dinner", icon: Moon, color: "text-violet-500" },
];

export default function FoodClient() {
  const [programId, setProgramId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dayNumber, setDayNumber] = useState(1);
  const [meals, setMeals] = useState<Record<string, { quantity: number; participants: number; remarks: string }>>({
    breakfast: { quantity: 0, participants: 0, remarks: "" },
    teaBreak: { quantity: 0, participants: 0, remarks: "" },
    lunch: { quantity: 0, participants: 0, remarks: "" },
    snacks: { quantity: 0, participants: 0, remarks: "" },
    dinner: { quantity: 0, participants: 0, remarks: "" },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: programsData, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ["programs_list"],
    queryFn: async () => {
      const res = await fetch("/api/programs?limit=100");
      return res.json();
    }
  });

  const handleChange = (mealKey: string, field: string, value: string | number) => {
    setMeals(prev => ({ ...prev, [mealKey]: { ...prev[mealKey], [field]: value } }));
  };

  const handleSave = async () => {
    if (!programId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/food", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program: programId, date, dayNumber, ...meals }),
      });
      if (res.ok) setSaved(true);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-base">Food Record Entry</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                className="flex h-9 w-48 rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={programId}
                onChange={e => setProgramId(e.target.value)}
                disabled={isLoadingPrograms}
              >
                <option value="">Select Program...</option>
                {programsData?.data?.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.programName}
                  </option>
                ))}
              </select>
              <Input type="date" className="h-9 text-sm" value={date} onChange={e => setDate(e.target.value)} />
              <Input 
                type="text" 
                placeholder="Day #" 
                className="h-9 w-20 text-sm" 
                value={dayNumber === 0 ? "" : dayNumber} 
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setDayNumber(val === "" ? 0 : Number(val));
                }} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {saved && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-emerald-700 text-sm">✓ Food record saved successfully!</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {MEALS.map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="rounded-xl border p-4 space-y-3 hover:shadow-sm transition-shadow">
                <div className={`flex items-center gap-2 font-semibold text-sm ${color}`}>
                  <Icon className="w-4 h-4" /> {label}
                </div>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Quantity (kg/litres)</Label>
                    <Input 
                      type="text" 
                      className="h-8 text-sm mt-1"
                      placeholder="0"
                      value={meals[key].quantity === 0 ? "" : meals[key].quantity}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = val.split(".");
                        const cleanVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : val;
                        handleChange(key, "quantity", cleanVal === "" ? 0 : Number(cleanVal));
                      }} 
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Participants Served</Label>
                    <Input 
                      type="text" 
                      className="h-8 text-sm mt-1"
                      placeholder="0"
                      value={meals[key].participants === 0 ? "" : meals[key].participants}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        handleChange(key, "participants", val === "" ? 0 : Number(val));
                      }} 
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Remarks</Label>
                    <Input placeholder="Optional" className="h-8 text-sm mt-1"
                      value={meals[key].remarks}
                      onChange={e => handleChange(key, "remarks", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Total participants served: <span className="font-semibold text-foreground">
                {Object.values(meals).reduce((sum, m) => sum + (Number(m.participants) || 0), 0)}
              </span>
            </div>
            <Button className="gap-2" onClick={handleSave} disabled={saving || !programId}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Food Record
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
