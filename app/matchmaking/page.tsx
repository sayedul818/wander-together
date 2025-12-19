"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Calendar, Users, MapPin, DollarSign, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import Image from "next/image";

const INTERESTS = [
  "Adventure", "Beach", "Culture", "Food", "History", "Nature",
  "Photography", "Hiking", "Shopping", "Art", "Music", "Sports"
];
const TRAVEL_STYLES = ["Solo", "Friends", "Family", "Couple", "Adventure", "Luxury"];

export default function MatchmakingPage() {
  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    interests: [] as string[],
    travelStyle: ""
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const toggleInterest = (interest: string) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...f.interests, interest]
    }));
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch("/api/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to fetch matches");
      const data = await res.json();
      setResults(data.matches || []);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="page-shell py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">Find Your Best Match</h1>
        <p className="text-muted-foreground text-lg">Discover the top 1–5 travel plans that fit you perfectly.</p>
      </motion.div>
      <form onSubmit={handleSubmit} className="card-surface p-8 mb-10 grid gap-6 md:grid-cols-2">
        <div>
          <label className="block font-semibold mb-2 text-foreground">Destination</label>
          <Input name="destination" value={form.destination} onChange={handleChange} required placeholder="e.g. Cox's Bazar" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-2 text-foreground">Start Date</label>
            <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-2 text-foreground">End Date</label>
            <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2 text-foreground">Budget (BDT)</label>
          <Input type="number" name="budget" value={form.budget} onChange={handleChange} required min={0} placeholder="e.g. 10000" />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-foreground">Travel Style</label>
          <select name="travelStyle" value={form.travelStyle} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-background text-foreground border-border">
            <option value="">Select...</option>
            {TRAVEL_STYLES.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block font-semibold mb-2 text-foreground">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <button type="button" key={interest} onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full border transition font-medium ${form.interests.includes(interest) ? 'bg-primary text-white border-primary' : 'bg-muted text-white border-muted hover:bg-muted/80'}`}>{interest}</button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 text-right">
          <Button type="submit" className="gradient-sunset text-white" size="lg" disabled={loading}>
            {loading ? "Searching..." : "Find Matches"}
          </Button>
        </div>
      </form>
      {error && <div className="text-destructive text-center mb-6">{error}</div>}
      {results.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((plan, idx) => (
            <motion.div key={plan._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="card-surface overflow-hidden hover:shadow-md transition cursor-pointer">
              <div className="h-40 bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center relative overflow-hidden">
                {plan.image ? (
                  <Image 
                    src={plan.image} 
                    alt={plan.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <MapPin className="h-10 w-10 text-white/50" />
                )}
                <span className="absolute top-4 right-4 bg-background rounded-full px-3 py-1 shadow text-primary font-bold">{plan.score}% Match</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{plan.title}</h3>
                <p className="text-muted-foreground text-sm mb-2">Destination: {plan.destination}</p>
                <p className="text-muted-foreground text-sm mb-2">Dates: {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</p>
                <p className="text-muted-foreground text-sm mb-2">Budget: {plan.budget ? plan.budget.toLocaleString() : 'N/A'} BDT</p>
                <p className="text-muted-foreground text-sm mb-2">Trip Type: {plan.travelStyle || 'N/A'}</p>
                <p className="text-muted-foreground text-sm mb-2">Matching Interests: {plan.interests?.filter((i: string) => form.interests.includes(i)).join(', ') || 'None'}</p>
                <div className="flex items-center gap-2 mt-4">
                  {plan.creator?.avatar ? (
                    <Image 
                      src={plan.creator.avatar} 
                      alt={plan.creator?.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center text-white font-bold text-xs">
                      {plan.creator?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="font-medium text-foreground">{plan.creator?.name}</span>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button size="sm" className="gradient-sunset text-white" onClick={() => window.location.href = `/travel-plans/${plan._id}`}>View Trip Details</Button>
                  <Button size="sm" variant="outline">Request to Join</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
