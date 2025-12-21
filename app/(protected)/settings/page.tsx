'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileForm {
  name: string;
  bio?: string;
  location?: string;
  avatar?: string;
  interestsCSV?: string;
  visitedCSV?: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({ name: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          setLoading(false);
          toast.error('Please login to access settings');
          return;
        }
        const data = await res.json();
        const u = data.user || {};
        setForm({
          name: u.name || '',
          bio: u.bio || '',
          location: u.location || '',
          avatar: u.avatar || '',
          interestsCSV: Array.isArray(u.interests) ? u.interests.join(', ') : '',
          visitedCSV: Array.isArray(u.visitedCountries) ? u.visitedCountries.join(', ') : '',
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'avatars');
      const up = await fetch('/api/upload/cloudinary', { method: 'POST', body: fd });
      if (!up.ok) throw new Error('Upload failed');
      const result = await up.json();
      setForm((prev) => ({ ...prev, avatar: result.url }));
      toast.success('Avatar uploaded');
    } catch (err) {
      toast.error('Avatar upload failed');
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onChange = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        bio: form.bio?.trim() || undefined,
        location: form.location?.trim() || undefined,
        avatar: form.avatar || undefined,
        interests: (form.interestsCSV || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        visitedCountries: (form.visitedCSV || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to save');
      }
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading...
            </div>
          ) : (
            <form onSubmit={onSave} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={form.avatar || ''} alt={form.name || 'Avatar'} />
                  <AvatarFallback>{form.name?.slice(0,2)?.toUpperCase() || 'TB'}</AvatarFallback>
                </Avatar>
                <div className="space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={openFilePicker}>
                    <Upload className="h-4 w-4 mr-2" /> Change Avatar
                  </Button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={uploadAvatar} />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input value={form.name} onChange={onChange('name')} placeholder="Your name" />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <Textarea value={form.bio || ''} onChange={onChange('bio')} rows={3} placeholder="Tell others about your travel style" />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input value={form.location || ''} onChange={onChange('location')} placeholder="City, Country" />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium mb-1">Interests (comma separated)</label>
                <Input value={form.interestsCSV || ''} onChange={onChange('interestsCSV')} placeholder="Hiking, Food, Photography" />
              </div>

              {/* Visited Countries */}
              <div>
                <label className="block text-sm font-medium mb-1">Visited Countries (comma separated)</label>
                <Input value={form.visitedCSV || ''} onChange={onChange('visitedCSV')} placeholder="Japan, Peru, USA" />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="submit" disabled={saving} className="gradient-sunset text-white">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
