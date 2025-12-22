'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Loader2, Trash2, Edit2, X, 
  Upload, Eye, EyeOff, ExternalLink, BarChart3,
  MousePointer, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface Sponsor {
  _id: string;
  title: string;
  description?: string;
  image: string;
  link: string;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  clicks: number;
  impressions: number;
  createdAt: string;
}

export default function SponsorsManagement() {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    isActive: true,
    priority: 0,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/sponsors');
      if (res.status === 403) {
        router.push('/dashboard');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSponsors(data.sponsors || []);
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      toast.error('Failed to load sponsors');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (sponsor?: Sponsor) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setFormData({
        title: sponsor.title,
        description: sponsor.description || '',
        image: sponsor.image,
        link: sponsor.link,
        isActive: sponsor.isActive,
        priority: sponsor.priority,
        startDate: sponsor.startDate ? new Date(sponsor.startDate).toISOString().split('T')[0] : '',
        endDate: sponsor.endDate ? new Date(sponsor.endDate).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingSponsor(null);
      setFormData({
        title: '',
        description: '',
        image: '',
        link: '',
        isActive: true,
        priority: 0,
        startDate: '',
        endDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSponsor(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'sponsors');

      const res = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success('Image uploaded');
      } else {
        toast.error('Failed to upload image');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image || !formData.link) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingSponsor 
        ? `/api/admin/sponsors/${editingSponsor._id}`
        : '/api/admin/sponsors';
      
      const res = await fetch(url, {
        method: editingSponsor ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
        }),
      });

      if (res.ok) {
        toast.success(editingSponsor ? 'Sponsor updated' : 'Sponsor created');
        closeModal();
        fetchSponsors();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save sponsor');
      }
    } catch (error) {
      toast.error('Failed to save sponsor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sponsorId: string) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;

    try {
      const res = await fetch(`/api/admin/sponsors/${sponsorId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Sponsor deleted');
        setSponsors(prev => prev.filter(s => s._id !== sponsorId));
      } else {
        toast.error('Failed to delete sponsor');
      }
    } catch (error) {
      toast.error('Failed to delete sponsor');
    }
  };

  const toggleActive = async (sponsor: Sponsor) => {
    try {
      const res = await fetch(`/api/admin/sponsors/${sponsor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !sponsor.isActive }),
      });

      if (res.ok) {
        setSponsors(prev => prev.map(s => 
          s._id === sponsor._id ? { ...s, isActive: !s.isActive } : s
        ));
        toast.success(sponsor.isActive ? 'Sponsor deactivated' : 'Sponsor activated');
      }
    } catch (error) {
      toast.error('Failed to update sponsor');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="page-shell py-4 flex items-center justify-between">
          <div>
            <Link href="/admin" className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Sponsors Management</h1>
          </div>
          <Button onClick={() => openModal()} className="gradient-sunset text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Sponsor
          </Button>
        </div>
      </div>

      <div className="page-shell py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-surface p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Total Sponsors</p>
            <p className="text-2xl font-bold">{sponsors.length}</p>
          </div>
          <div className="card-surface p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-500">{sponsors.filter(s => s.isActive).length}</p>
          </div>
          <div className="card-surface p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Total Impressions</p>
            <p className="text-2xl font-bold">{sponsors.reduce((acc, s) => acc + s.impressions, 0).toLocaleString()}</p>
          </div>
          <div className="card-surface p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">Total Clicks</p>
            <p className="text-2xl font-bold">{sponsors.reduce((acc, s) => acc + s.clicks, 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Sponsors Grid */}
        {sponsors.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sponsors yet</h3>
            <p className="text-muted-foreground mb-4">Create your first sponsored ad to display in the feed</p>
            <Button onClick={() => openModal()} className="gradient-sunset text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Sponsor
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.map((sponsor) => (
              <motion.div
                key={sponsor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card-surface rounded-lg border overflow-hidden ${
                  sponsor.isActive ? 'border-border' : 'border-red-500/30 opacity-60'
                }`}
              >
                <div className="relative h-40">
                  <Image
                    src={sponsor.image}
                    alt={sponsor.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {sponsor.isActive ? (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Inactive</span>
                    )}
                    <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      Priority: {sponsor.priority}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{sponsor.title}</h3>
                  {sponsor.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{sponsor.description}</p>
                  )}
                  <a 
                    href={sponsor.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline flex items-center gap-1 mb-3"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {new URL(sponsor.link).hostname}
                  </a>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      {sponsor.impressions.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer className="h-4 w-4" />
                      {sponsor.clicks.toLocaleString()} clicks
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(sponsor)}
                      className="flex-1"
                    >
                      {sponsor.isActive ? (
                        <><EyeOff className="h-4 w-4 mr-1" /> Deactivate</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-1" /> Activate</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(sponsor)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(sponsor._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-muted rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Image Upload */}
                <div>
                  <Label>Sponsor Image *</Label>
                  <div className="mt-2">
                    {formData.image ? (
                      <div className="relative h-40 rounded-lg overflow-hidden">
                        <Image
                          src={formData.image}
                          alt="Sponsor preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                      >
                        {isUploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Click to upload image</span>
                          </>
                        )}
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Trek Patagonia Adventure"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Short description of the sponsored content"
                    rows={2}
                  />
                </div>

                {/* Link */}
                <div>
                  <Label htmlFor="link">Link URL *</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                {/* Priority */}
                <div>
                  <Label htmlFor="priority">Priority (higher = shown first)</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    min={0}
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Active (visible to users)</Label>
                </div>

                {/* Submit */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 gradient-sunset text-white"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingSponsor ? (
                      'Update Sponsor'
                    ) : (
                      'Create Sponsor'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
