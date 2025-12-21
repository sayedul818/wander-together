"use client";

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Image as ImageIcon, Users, MapPin, Smile, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  currentUser?: { _id?: string; name?: string; avatar?: string; role?: string } | null;
  onCreated?: (post: any) => void;
}

export default function PostCreateModal({ open, onClose, currentUser, onCreated }: Props) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'friends'>('public');
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setContent('');
      setFiles([]);
      setPreviews([]);
      setVideoPreview(null);
      setIsPosting(false);
    }
  }, [open]);

  const onPickFiles = (accept: string) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
  };

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFiles(selected);

    const imgPreviews: string[] = [];
    let vid: string | null = null;
    for (const f of selected) {
      const url = URL.createObjectURL(f);
      if (f.type.startsWith('image/')) imgPreviews.push(url);
      else if (f.type.startsWith('video/')) vid = url;
    }
    setPreviews(imgPreviews);
    setVideoPreview(vid);
  };

  const handlePostSubmit = async () => {
    if (!content.trim() && previews.length === 0 && !videoPreview) return;
    try {
      setIsPosting(true);

      // Upload selected files first
      let images: string[] = [];
      let videoUrl: string | undefined;
      if (files.length > 0) {
        for (const f of files) {
          const fd = new FormData();
          fd.append('file', f);
          const resUp = await fetch('/api/upload/cloudinary', { method: 'POST', body: fd });
          if (resUp.ok) {
            const dataUp = await resUp.json();
            if (dataUp.resourceType === 'image') {
              images.push(dataUp.url);
            } else if (dataUp.resourceType === 'video') {
              videoUrl = dataUp.url;
            }
          }
        }
      }

      const postType: 'text' | 'image' | 'video' | 'memory' = videoUrl ? 'video' : images.length > 0 ? 'image' : 'text';

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, postType, images, videoUrl, privacy }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Failed to create post');
        return;
      }

      const newPost = await res.json();
      toast.success('Post created');
      onCreated?.(newPost);
      onClose();
    } catch (error) {
      console.error('Create post error:', error);
      toast.error('Could not create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="border-b border-border/60 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Create post</h2>
                <button onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser?.avatar || ''} />
                  <AvatarFallback>{currentUser?.name?.slice(0,2)?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{currentUser?.name || 'You'}</span>
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-[40px_1fr] gap-3">
                <div className="flex items-start justify-center">
                  <div className="h-9 w-9 rounded-md bg-gradient-to-br from-pink-400 to-yellow-400" />
                </div>
                <Textarea
                  placeholder={`What's on your mind${currentUser?.name ? ", " + currentUser.name : ''}?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[140px]"
                />
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative h-32 rounded-lg overflow-hidden">
                      <img src={src} className="w-full h-full object-cover" alt="preview" />
                    </div>
                  ))}
                </div>
              )}
              {videoPreview && (
                <div className="relative rounded-lg overflow-hidden">
                  <video src={videoPreview} controls className="w-full" />
                </div>
              )}

              <div className="rounded-xl border border-border/60">
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Add to your post</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onPickFiles('image/*')} className="rounded-md p-2 hover:bg-muted" title="Photo/Video">
                      <ImageIcon className="h-5 w-5 text-emerald-500" />
                    </button>
                    <button className="rounded-md p-2 hover:bg-muted" title="Tag people">
                      <Users className="h-5 w-5 text-blue-500" />
                    </button>
                    <button className="rounded-md p-2 hover:bg-muted" title="Feeling/Activity">
                      <Smile className="h-5 w-5 text-yellow-500" />
                    </button>
                    <button className="rounded-md p-2 hover:bg-muted" title="Check in">
                      <MapPin className="h-5 w-5 text-red-500" />
                    </button>
                    <button className="rounded-md p-2 hover:bg-muted" title="GIF">
                      <span className="text-teal-500 text-xs font-semibold">GIF</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handlePostSubmit}
                  disabled={(!content.trim() && previews.length === 0 && !videoPreview) || isPosting}
                  className="w-full"
                >
                  {isPosting ? (
                    'Posting...'
                  ) : (
                    <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Post</span>
                  )}
                </Button>
              </div>

              <input type="file" ref={fileInputRef} className="hidden" onChange={onFilesSelected} multiple />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
