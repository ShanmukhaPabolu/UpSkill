"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { venueSchema, VenueInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface VenueFormProps { defaultValues?: Record<string, unknown>; onSuccess?: () => void; }

export default function VenueForm({ defaultValues, onSuccess }: VenueFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<VenueInput>({
    resolver: zodResolver(venueSchema),
    defaultValues: defaultValues as VenueInput,
  });

  const onSubmit = async (data: VenueInput) => {
    setLoading(true);
    setError("");
    try {
      const url = defaultValues?._id ? `/api/venues/${defaultValues._id}` : "/api/venues";
      const method = defaultValues?._id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { setError("Failed to save venue"); return; }
      onSuccess?.();
    } catch { setError("Network error"); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm">{error}</div>}
      
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Venue Name *</Label>
            <Input placeholder="e.g. DIET Vijayawada" {...register("name")} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Full Address *</Label>
            <Input placeholder="Complete postal address" {...register("address")} />
            {errors.address && <p className="text-destructive text-xs">{errors.address.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>District *</Label>
            <Input placeholder="District ID" {...register("district")} />
            {errors.district && <p className="text-destructive text-xs">{errors.district.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Mandal *</Label>
            <Input placeholder="Mandal ID" {...register("mandal")} />
            {errors.mandal && <p className="text-destructive text-xs">{errors.mandal.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Contact Person *</Label>
            <Input placeholder="Name" {...register("contactPerson")} />
            {errors.contactPerson && <p className="text-destructive text-xs">{errors.contactPerson.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Contact Number *</Label>
            <Input placeholder="10-digit mobile" {...register("contactNumber")} />
            {errors.contactNumber && <p className="text-destructive text-xs">{errors.contactNumber.message}</p>}
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="venue@edu.ap.gov.in" {...register("email")} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Infrastructure</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Classrooms</Label>
            <Input type="number" min="0" {...register("infrastructure.classroomsCount", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Capacity (per day)</Label>
            <Input type="number" min="0" {...register("infrastructure.capacity", { valueAsNumber: true })} />
          </div>
          <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "infrastructure.projectors", label: "Projectors" },
              { name: "infrastructure.smartBoards", label: "Smart Boards" },
              { name: "infrastructure.wifi", label: "WiFi" },
              { name: "infrastructure.drinkingWater", label: "Drinking Water" },
              { name: "infrastructure.diningHall", label: "Dining Hall" },
              { name: "infrastructure.parking", label: "Parking" },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg border hover:bg-muted/50">
                <input type="checkbox" {...register(name as any)} className="rounded" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Accommodation</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer p-3 rounded-lg border hover:bg-muted/50">
              <input type="checkbox" {...register("accommodation.isResidential")} className="rounded" />
              <span className="font-medium">Residential Facility Available</span>
            </label>
          </div>
          <div className="space-y-1.5">
            <Label>AC Rooms</Label>
            <Input type="number" min="0" {...register("accommodation.acRooms", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Non-AC Rooms</Label>
            <Input type="number" min="0" {...register("accommodation.nonAcRooms", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Total Beds</Label>
            <Input type="number" min="0" {...register("accommodation.totalBeds", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Available Beds</Label>
            <Input type="number" min="0" {...register("accommodation.availableBeds", { valueAsNumber: true })} />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {defaultValues?._id ? "Update Venue" : "Create Venue"}
        </Button>
      </div>
    </form>
  );
}
