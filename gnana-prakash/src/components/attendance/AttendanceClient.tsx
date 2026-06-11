"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attendanceSchema, AttendanceInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, Loader2, Plus, Save } from "lucide-react";
import { formatDate } from "@/lib/utils";

const ATTENDANCE_FIELDS = [
  { key: "sgt", label: "SGT" }, { key: "krp", label: "KRP" }, { key: "drp", label: "DRP" },
  { key: "deoStaff", label: "DEO Staff" }, { key: "ssStaff", label: "SS Staff" },
  { key: "meo", label: "MEO" }, { key: "hm", label: "HM" }, { key: "crp", label: "CRP" }, { key: "others", label: "Others" },
];

export default function AttendanceClient() {
  const [programId, setProgramId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: records, isLoading } = useQuery({
    queryKey: ["attendance", programId],
    queryFn: async () => {
      if (!programId) return [];
      const res = await fetch(`/api/attendance?program=${programId}`);
      return res.json();
    },
    enabled: !!programId,
  });

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AttendanceInput>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: { sgt:0, krp:0, drp:0, deoStaff:0, ssStaff:0, meo:0, hm:0, crp:0, others:0 },
  });

  const values = watch();
  const total = ATTENDANCE_FIELDS.reduce((sum, f) => sum + (Number(values[f.key as keyof AttendanceInput]) || 0), 0);

  const mutation = useMutation({
    mutationFn: async (data: AttendanceInput) => {
      const res = await fetch("/api/attendance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, program: programId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); reset(); setShowForm(false); },
  });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Daily Attendance</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Enter Program ID" className="h-9 w-56 text-sm"
                value={programId} onChange={(e) => setProgramId(e.target.value)} />
              <Button size="sm" className="gap-2" onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4" /> Record Attendance
              </Button>
            </div>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t pt-5">
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Date *</Label>
                  <Input type="date" {...register("date")} />
                  {errors.date && <p className="text-destructive text-xs">{errors.date.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Day Number *</Label>
                  <Input type="number" min="1" {...register("dayNumber", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Remarks</Label>
                  <Input placeholder="Optional remarks" {...register("remarks")} />
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {ATTENDANCE_FIELDS.map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs">{label}</Label>
                    <Input type="number" min="0" className="h-9 text-sm"
                      {...register(key as keyof AttendanceInput, { valueAsNumber: true })} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900">
                <div>
                  <p className="text-sm text-brand-700 dark:text-brand-300 font-medium">Total Attendance</p>
                  <p className="text-xs text-brand-600/70 dark:text-brand-400/70">Auto-calculated</p>
                </div>
                <p className="text-3xl font-bold text-brand-700 dark:text-brand-300">{total}</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
                <Button type="submit" size="sm" className="gap-2" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Attendance
                </Button>
              </div>
            </form>
          </CardContent>
        )}

        <CardContent className="p-0">
          {!programId ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ClipboardList className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Enter a Program ID to view attendance records</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center h-40 items-center"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
          ) : records?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ClipboardList className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">No attendance records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Day</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>SGT</TableHead>
                  <TableHead>KRP</TableHead>
                  <TableHead>DRP</TableHead>
                  <TableHead>DEO</TableHead>
                  <TableHead>SS</TableHead>
                  <TableHead>MEO</TableHead>
                  <TableHead>HM</TableHead>
                  <TableHead>CRP</TableHead>
                  <TableHead className="font-bold text-brand-600">Total</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r: Record<string, any>) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-bold text-center">{r.dayNumber}</TableCell>
                    <TableCell className="text-sm">{formatDate(r.date)}</TableCell>
                    <TableCell className="text-center">{r.sgt}</TableCell>
                    <TableCell className="text-center">{r.krp}</TableCell>
                    <TableCell className="text-center">{r.drp}</TableCell>
                    <TableCell className="text-center">{r.deoStaff}</TableCell>
                    <TableCell className="text-center">{r.ssStaff}</TableCell>
                    <TableCell className="text-center">{r.meo}</TableCell>
                    <TableCell className="text-center">{r.hm}</TableCell>
                    <TableCell className="text-center">{r.crp}</TableCell>
                    <TableCell className="text-center font-bold text-brand-600">{r.totalAttendance}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.recordedBy?.name || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
