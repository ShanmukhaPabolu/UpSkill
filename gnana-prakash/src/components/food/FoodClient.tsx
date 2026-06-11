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
              <Input placeholder="Program ID" className="h-9 w-44 text-sm" value={programId} onChange={e => setProgramId(e.target.value)} />
              <Input type="date" className="h-9 text-sm" value={date} onChange={e => setDate(e.target.value)} />
              <Input type="number" min="1" placeholder="Day #" className="h-9 w-20 text-sm" value={dayNumber} onChange={e => setDayNumber(Number(e.target.value))} />
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
                    <Input type="number" min="0" className="h-8 text-sm mt-1"
                      value={meals[key].quantity}
                      onChange={e => handleChange(key, "quantity", Number(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Participants Served</Label>
                    <Input type="number" min="0" className="h-8 text-sm mt-1"
                      value={meals[key].participants}
                      onChange={e => handleChange(key, "participants", Number(e.target.value))} />
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
