"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EditTravelPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params?.id as string;

  const [form, setForm] = useState({
    title: "",
    description: "",
    destination: "",
    startDate: "",
    endDate: "",
    maxParticipants: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/travel-plans/${planId}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            title: data.plan.title || "",
            description: data.plan.description || "",
            destination: data.plan.destination || "",
            startDate: data.plan.startDate?.slice(0, 10) || "",
            endDate: data.plan.endDate?.slice(0, 10) || "",
            maxParticipants: data.plan.maxParticipants || 1,
          });
        } else {
          toast.error("Trip not found");
          router.push("/dashboard");
        }
      } catch {
        toast.error("Failed to load trip");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    if (planId) fetchPlan();
  }, [planId, router]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.description.trim()) nextErrors.description = "Description is required";
    if (!form.destination.trim()) nextErrors.destination = "Destination is required";
    if (!form.startDate) nextErrors.startDate = "Start date is required";
    if (!form.endDate) nextErrors.endDate = "End date is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = "End date cannot be before start date";
    }
    if (!form.maxParticipants || Number(form.maxParticipants) < 1) {
      nextErrors.maxParticipants = "Max participants must be at least 1";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/travel-plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Trip updated successfully!");
        router.push(`/travel-plans/${planId}`);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update trip");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="section-shell max-w-2xl">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => router.push('/travel-plans')} className="flex items-center gap-2">
            ← Back to My Trips
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-6">Edit Trip Plan</h1>
        <div className="card-surface p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-40" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <Label className="mb-2 block">Title</Label>
                <Input name="title" value={form.title} onChange={handleChange} required />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
              </div>
              <div>
                <Label className="mb-2 block">Description</Label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
              </div>
              <div>
                <Label className="mb-2 block">Destination</Label>
                <Input name="destination" value={form.destination} onChange={handleChange} required />
                {errors.destination && <p className="text-sm text-destructive mt-1">{errors.destination}</p>}
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label className="mb-2 block">Start Date</Label>
                  <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
                  {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate}</p>}
                </div>
                <div className="flex-1">
                  <Label className="mb-2 block">End Date</Label>
                  <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
                  {errors.endDate && <p className="text-sm text-destructive mt-1">{errors.endDate}</p>}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Max Participants</Label>
                <Input type="number" name="maxParticipants" min={1} value={form.maxParticipants} onChange={handleChange} required />
                {errors.maxParticipants && <p className="text-sm text-destructive mt-1">{errors.maxParticipants}</p>}
              </div>
              <Button type="submit" className="w-full gradient-sunset text-white" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
