"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { programSchema, ProgramInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const DEPARTMENTS = ["School Education", "Higher Education", "Technical Education", "Training & Planning", "SSA", "RMSA"];

interface ProgramFormProps {
  defaultValues?: Record<string, unknown>;
  onSuccess?: () => void;
}

export default function ProgramForm({ defaultValues, onSuccess }: ProgramFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<ProgramInput>({
    resolver: zodResolver(programSchema),
    defaultValues: defaultValues as ProgramInput,
  });

  const onSubmit = async (data: ProgramInput) => {
    setLoading(true);
    setError("");
    try {
      const url = defaultValues?._id ? `/api/programs/${defaultValues._id}` : "/api/programs";
      const method = defaultValues?._id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to save program");
        return;
      }
      onSuccess?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Program Name *</Label>
          <Input placeholder="e.g. School Leadership Training 2024" {...register("programName")} />
          {errors.programName && <p className="text-destructive text-xs">{errors.programName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Training Year *</Label>
          <Input placeholder="2024-25" {...register("trainingYear")} />
          {errors.trainingYear && <p className="text-destructive text-xs">{errors.trainingYear.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Department *</Label>
          <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("department")}>
            <option value="">Select Department</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <p className="text-destructive text-xs">{errors.department.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>District *</Label>
          <Input placeholder="District ID or name" {...register("district")} />
          {errors.district && <p className="text-destructive text-xs">{errors.district.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Mandal *</Label>
          <Input placeholder="Mandal ID or name" {...register("mandal")} />
          {errors.mandal && <p className="text-destructive text-xs">{errors.mandal.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Venue *</Label>
          <Input placeholder="Venue ID" {...register("venue")} />
          {errors.venue && <p className="text-destructive text-xs">{errors.venue.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Service Provider</Label>
          <Input placeholder="Organization name" {...register("serviceProvider")} />
        </div>
        <div className="space-y-1.5">
          <Label>Start Date *</Label>
          <Input type="date" {...register("startDate")} />
          {errors.startDate && <p className="text-destructive text-xs">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>End Date *</Label>
          <Input type="date" {...register("endDate")} />
          {errors.endDate && <p className="text-destructive text-xs">{errors.endDate.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("status")}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Expected Participants</Label>
          <Input type="number" min="0" {...register("expectedParticipants", { valueAsNumber: true })} />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Description</Label>
          <textarea className="flex min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none" placeholder="Program description..." {...register("description")} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {defaultValues?._id ? "Update Program" : "Create Program"}
        </Button>
      </div>
    </form>
  );
}
