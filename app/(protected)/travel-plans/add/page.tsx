'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Calendar, MapPin, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const interests = ['Adventure', 'Beach', 'Culture', 'Food', 'Hiking', 'History', 'Nature', 'Photography', 'Shopping', 'Wellness'];

export default function AddTravelPlanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    maxParticipants: '10',
    interests: [] as string[],
    travelStyle: 'Friends',
    accommodationType: 'Hotel',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.destination || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.interests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/travel-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? parseInt(formData.budget) : undefined,
          maxParticipants: parseInt(formData.maxParticipants),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Trip created successfully!');
        router.push(`/travel-plans/${data.plan._id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create trip');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/dashboard" className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">Create a New Trip</h1>
        <p className="text-gray-600 mt-2">Plan your adventure and find travelers to join you</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
      >
        {/* Basic Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Trip Details</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="title" className="block mb-2">Trip Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Summer Europe Adventure"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="destination" className="block mb-2">Destination *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="destination"
                  name="destination"
                  placeholder="e.g., Paris, France"
                  className="pl-10"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="description" className="block mb-2">Description *</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Tell us about your trip..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="startDate" className="block mb-2">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  className="pl-10"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="endDate" className="block mb-2">End Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  className="pl-10"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Budget & Participants */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="budget" className="block mb-2">Budget (USD)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                placeholder="e.g., 3000"
                value={formData.budget}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="maxParticipants" className="block mb-2">Max Participants</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  className="pl-10"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  min="2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Travel Style & Accommodation */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Trip Type</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="travelStyle" className="block mb-2">Travel Style</Label>
              <select
                id="travelStyle"
                name="travelStyle"
                value={formData.travelStyle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option>Solo</option>
                <option>Friends</option>
                <option>Family</option>
                <option>Couple</option>
              </select>
            </div>
            <div>
              <Label htmlFor="accommodationType" className="block mb-2">Accommodation</Label>
              <select
                id="accommodationType"
                name="accommodationType"
                value={formData.accommodationType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option>Budget</option>
                <option>Hotel</option>
                <option>Airbnb</option>
                <option>Luxury</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Interests *</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {interests.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  formData.interests.includes(interest)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="gradient-sunset text-white flex-1"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Trip...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Create Trip
              </>
            )}
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button type="button" variant="outline" className="w-full" size="lg">
              Cancel
            </Button>
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
