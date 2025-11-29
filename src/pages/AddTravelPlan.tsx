import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { format } from 'date-fns';
import { 
  ArrowLeft, MapPin, Calendar, Users, Wallet, 
  Image, FileText, Eye, EyeOff, Loader2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useTravelPlans, TravelType, BudgetRange } from '@/contexts/TravelPlansContext';
import { useToast } from '@/hooks/use-toast';
import { interests } from '@/data/mockTravelers';

const coverImages = [
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
  'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
  'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
];

export default function AddTravelPlan() {
  const { user } = useAuth();
  const { addPlan } = useTravelPlans();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelType, setTravelType] = useState<TravelType>('Solo');
  const [budget, setBudget] = useState<BudgetRange>('Mid-Range');
  const [description, setDescription] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState(coverImages[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 5
        ? [...prev, interest]
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!destination.trim()) newErrors.destination = 'Destination is required';
    if (!country.trim()) newErrors.country = 'Country is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!description.trim()) newErrors.description = 'Description is required';
    if (selectedInterests.length === 0) newErrors.interests = 'Select at least one interest';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addPlan({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '',
      userRating: user.rating || 0,
      destination,
      country,
      coverImage,
      startDate,
      endDate,
      travelType,
      budget,
      description,
      interests: selectedInterests,
      isPublic,
    });

    setIsLoading(false);
    toast({
      title: 'Trip created!',
      description: 'Your travel plan has been published.',
    });
    navigate('/travel-plans');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/travel-plans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Travel Plans
            </Link>
          </Button>

          <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
              Create a New Trip
            </h1>
            <p className="text-muted-foreground mb-8">
              Share your travel plans and find the perfect travel buddy
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Image Selection */}
              <div className="space-y-3">
                <Label>Cover Image</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {coverImages.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setCoverImage(img)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        coverImage === img
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination & Country */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="e.g., Bali, Tokyo, Paris"
                      className="pl-10"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                  {errors.destination && <p className="text-sm text-destructive">{errors.destination}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="e.g., Indonesia, Japan, France"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                  {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      className="pl-10"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="date"
                      className="pl-10"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
                </div>
              </div>

              {/* Travel Type & Budget */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Travel Type *</Label>
                  <Select value={travelType} onValueChange={(v) => setTravelType(v as TravelType)}>
                    <SelectTrigger>
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Solo">Solo</SelectItem>
                      <SelectItem value="Friends">Friends</SelectItem>
                      <SelectItem value="Family">Family</SelectItem>
                      <SelectItem value="Couple">Couple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Budget Range *</Label>
                  <Select value={budget} onValueChange={(v) => setBudget(v as BudgetRange)}>
                    <SelectTrigger>
                      <Wallet className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Budget">Budget</SelectItem>
                      <SelectItem value="Mid-Range">Mid-Range</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell potential travel buddies about your trip plans, what you want to do, and what kind of companion you're looking for..."
                  className="min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <Label>Interests (select up to 5) *</Label>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? 'default' : 'secondary'}
                      className={`cursor-pointer transition-all ${
                        selectedInterests.includes(interest)
                          ? 'gradient-sunset text-primary-foreground'
                          : 'hover:bg-secondary/80'
                      }`}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                      {selectedInterests.includes(interest) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
                {errors.interests && <p className="text-sm text-destructive">{errors.interests}</p>}
              </div>

              {/* Visibility */}
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Eye className="h-5 w-5 text-teal" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {isPublic ? 'Public Trip' : 'Private Trip'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isPublic
                        ? 'Other travelers can see and request to join'
                        : 'Only you can see this trip'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPublic(!isPublic)}
                >
                  {isPublic ? 'Make Private' : 'Make Public'}
                </Button>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" className="flex-1" asChild>
                  <Link to="/travel-plans">Cancel</Link>
                </Button>
                <Button type="submit" variant="hero" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Trip'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
