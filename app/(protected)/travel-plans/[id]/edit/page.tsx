"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <h1 className="text-3xl font-bold mb-8">Edit Trip Plan</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Title</label>
          <Input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
        <div>
          <label className="block mb-2 font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
          <label className="block mb-2 font-medium">Destination</label>
          <Input name="destination" value={form.destination} onChange={handleChange} required />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-2 font-medium">Start Date</label>
            <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
          </div>
          <div className="flex-1">
            <label className="block mb-2 font-medium">End Date</label>
            <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
          </div>
        </div>
        <div>
          <label className="block mb-2 font-medium">Max Participants</label>
          <Input type="number" name="maxParticipants" min={1} value={form.maxParticipants} onChange={handleChange} required />
        </div>
        <Button type="submit" className="w-full gradient-sunset text-white" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
