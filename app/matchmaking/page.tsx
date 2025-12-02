"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Calendar, Users, MapPin, DollarSign, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

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
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Best Match</h1>
        <p className="text-gray-600 text-lg">Discover the top 1–5 travel plans that fit you perfectly.</p>
      </motion.div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-8 mb-10 grid gap-6 md:grid-cols-2">
        <div>
          <label className="block font-semibold mb-2">Destination</label>
          <Input name="destination" value={form.destination} onChange={handleChange} required placeholder="e.g. Cox's Bazar" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-2">Start Date</label>
            <Input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-2">End Date</label>
            <Input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2">Budget (BDT)</label>
          <Input type="number" name="budget" value={form.budget} onChange={handleChange} required min={0} placeholder="e.g. 10000" />
        </div>
        <div>
          <label className="block font-semibold mb-2">Travel Style</label>
          <select name="travelStyle" value={form.travelStyle} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Select...</option>
            {TRAVEL_STYLES.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block font-semibold mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <button type="button" key={interest} onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 rounded-full border ${form.interests.includes(interest) ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>{interest}</button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 text-right">
          <Button type="submit" className="gradient-sunset text-white" size="lg" disabled={loading}>
            {loading ? "Searching..." : "Find Matches"}
          </Button>
        </div>
      </form>
      {error && <div className="text-red-500 text-center mb-6">{error}</div>}
      {results.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((plan, idx) => (
            <motion.div key={plan._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer">
              <div className="h-40 bg-gradient-to-br from-orange-300 to-pink-300 flex items-center justify-center relative">
                <MapPin className="h-10 w-10 text-white/50" />
                <span className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow text-orange-600 font-bold">{plan.score}% Match</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                <p className="text-gray-600 text-sm mb-2">Destination: {plan.destination}</p>
                <p className="text-gray-600 text-sm mb-2">Dates: {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</p>
                <p className="text-gray-600 text-sm mb-2">Budget: {plan.budget ? plan.budget.toLocaleString() : 'N/A'} BDT</p>
                <p className="text-gray-600 text-sm mb-2">Trip Type: {plan.travelStyle || 'N/A'}</p>
                <p className="text-gray-600 text-sm mb-2">Matching Interests: {plan.interests?.filter((i: string) => form.interests.includes(i)).join(', ') || 'None'}</p>
                <div className="flex items-center gap-2 mt-4">
                  <img src={plan.creator?.avatar || '/avatar.png'} alt={plan.creator?.name} className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-medium text-gray-900">{plan.creator?.name}</span>
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
    </>
  );
}
