"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { participantSchema, ParticipantInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PARTICIPANT_CATEGORIES } from "@/lib/utils";

interface Props { defaultValues?: Record<string, unknown>; onSuccess?: () => void; }

export default function ParticipantForm({ defaultValues, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<ParticipantInput>({
    resolver: zodResolver(participantSchema),
    defaultValues: defaultValues as ParticipantInput,
  });

  const onSubmit = async (data: ParticipantInput) => {
    setLoading(true); setError("");
    try {
      const url = defaultValues?._id ? `/api/participants/${defaultValues._id}` : "/api/participants";
      const method = defaultValues?._id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { setError("Failed to save"); return; }
      onSuccess?.();
    } catch { setError("Network error"); } finally { setLoading(false); }
  };

  const groupedCategories: Record<string, typeof PARTICIPANT_CATEGORIES> = {};
  PARTICIPANT_CATEGORIES.forEach(c => {
    if (!groupedCategories[c.group]) groupedCategories[c.group] = [];
    groupedCategories[c.group].push(c);
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Employee ID *</Label>
          <Input placeholder="EMP12345" {...register("employeeId")} />
          {errors.employeeId && <p className="text-destructive text-xs">{errors.employeeId.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Full Name *</Label>
          <Input placeholder="Full name" {...register("name")} />
          {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Mobile *</Label>
          <Input placeholder="10-digit number" {...register("mobile")} />
          {errors.mobile && <p className="text-destructive text-xs">{errors.mobile.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" placeholder="email@example.com" {...register("email")} />
        </div>
        <div className="space-y-1.5">
          <Label>Designation *</Label>
          <Input placeholder="Designation" {...register("designation")} />
          {errors.designation && <p className="text-destructive text-xs">{errors.designation.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("category")}>
            <option value="">Select category</option>
            {Object.entries(groupedCategories).map(([group, cats]) => (
              <optgroup key={group} label={group}>
                {cats.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </optgroup>
            ))}
          </select>
          {errors.category && <p className="text-destructive text-xs">{errors.category.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>School / Organization</Label>
          <Input placeholder="School or org name" {...register("schoolName")} />
        </div>
        <div className="space-y-1.5">
          <Label>District *</Label>
          <Input placeholder="District" {...register("district")} />
          {errors.district && <p className="text-destructive text-xs">{errors.district.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Mandal</Label>
          <Input placeholder="Mandal" {...register("mandal")} />
        </div>
        <div className="space-y-1.5">
          <Label>Program ID *</Label>
          <Input placeholder="Program ID" {...register("program")} />
          {errors.program && <p className="text-destructive text-xs">{errors.program.message}</p>}
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer p-3 rounded-lg border hover:bg-muted/50">
            <input type="checkbox" {...register("isResidential")} className="rounded" />
            <span className="font-medium">Residential Participant</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {defaultValues?._id ? "Update" : "Add Participant"}
        </Button>
      </div>
    </form>
  );
}
