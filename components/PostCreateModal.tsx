"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Image as ImageIcon, Users, MapPin, Smile, Sparkles, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

// Common emojis for the picker
const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍',
  '🥰', '😘', '😋', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😌', '😔', '😢',
  '😭', '😤', '😡', '🤯', '😱', '🥶', '🤗', '🤔', '🤫', '🤭', '🙄', '😬',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💞', '💓', '💗',
  '👍', '👎', '👏', '🙌', '🤝', '👋', '✌️', '🤞', '🤟', '🤘', '👌', '🙏',
  '🔥', '⭐', '🌟', '💫', '✨', '🎉', '🎊', '🎈', '🌈', '☀️', '🌙', '⛅',
  '✈️', '🚗', '🚀', '🏖️', '🏔️', '🗺️', '🌍', '🌎', '🌏', '🏝️', '🏕️', '⛺'
];

interface TaggedUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface GifResult {
  id: string;
  url: string;
  preview: string;
  title: string;
}

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tag People state
  const [showTagPeople, setShowTagPeople] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [tagSearchResults, setTagSearchResults] = useState<TaggedUser[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Location state
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [location, setLocation] = useState('');

  // GIF picker state
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [gifResults, setGifResults] = useState<GifResult[]>([]);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isSearchingGifs, setIsSearchingGifs] = useState(false);

  useEffect(() => {
    if (!open) {
      setContent('');
      setFiles([]);
      setPreviews([]);
      setVideoPreview(null);
      setIsPosting(false);
      setShowTagPeople(false);
      setTagSearch('');
      setTagSearchResults([]);
      setTaggedUsers([]);
      setShowEmojiPicker(false);
      setShowLocationInput(false);
      setLocation('');
      setShowGifPicker(false);
      setGifSearch('');
      setGifResults([]);
      setSelectedGif(null);
    }
  }, [open]);

  // Search users for tagging
  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setTagSearchResults([]);
      return;
    }
    try {
      setIsSearchingUsers(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=users`);
      if (res.ok) {
        const data = await res.json();
        setTagSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearchingUsers(false);
    }
  }, []);

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tagSearch) searchUsers(tagSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [tagSearch, searchUsers]);

  // Search GIFs using Giphy API (using public beta key for demo)
  const searchGifs = useCallback(async (query: string) => {
    try {
      setIsSearchingGifs(true);
      // Using Giphy's public beta API key for demo purposes
      const apiKey = 'dc6zaTOxFJmzC'; // Public beta key
      const endpoint = query.trim() 
        ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const gifs: GifResult[] = data.data.map((gif: any) => ({
          id: gif.id,
          url: gif.images.original.url,
          preview: gif.images.fixed_height_small.url,
          title: gif.title,
        }));
        setGifResults(gifs);
      }
    } catch (error) {
      console.error('Error searching GIFs:', error);
      toast.error('Failed to load GIFs');
    } finally {
      setIsSearchingGifs(false);
    }
  }, []);

  // Debounced GIF search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showGifPicker) searchGifs(gifSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [gifSearch, showGifPicker, searchGifs]);

  // Load trending GIFs when picker opens
  useEffect(() => {
    if (showGifPicker && gifResults.length === 0) {
      searchGifs('');
    }
  }, [showGifPicker, gifResults.length, searchGifs]);

  const addTaggedUser = (user: TaggedUser) => {
    if (!taggedUsers.find(u => u._id === user._id)) {
      setTaggedUsers([...taggedUsers, user]);
    }
    setTagSearch('');
    setTagSearchResults([]);
  };

  const removeTaggedUser = (userId: string) => {
    setTaggedUsers(taggedUsers.filter(u => u._id !== userId));
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setContent(content + emoji);
    }
  };

  const selectGif = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setShowGifPicker(false);
    // Clear image/video previews when selecting a GIF
    setPreviews([]);
    setVideoPreview(null);
    setFiles([]);
  };

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
    if (!content.trim() && previews.length === 0 && !videoPreview && !selectedGif) return;
    try {
      setIsPosting(true);

      // Upload selected files first
      let images: string[] = [];
      let videoUrl: string | undefined;
      let gifUrl: string | undefined = selectedGif || undefined;
      
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

      const postType: 'text' | 'image' | 'video' | 'memory' = videoUrl ? 'video' : (images.length > 0 || gifUrl) ? 'image' : 'text';
      
      // Add GIF to images if selected
      if (gifUrl) {
        images = [gifUrl, ...images];
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          postType, 
          images, 
          videoUrl, 
          privacy,
          location: location || undefined,
          taggedUsers: taggedUsers.map(u => u._id),
        }),
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
                  ref={textareaRef}
                  placeholder={`What's on your mind${currentUser?.name ? ", " + currentUser.name : ''}?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[140px]"
                />
              </div>

              {/* Tagged Users Display */}
              {taggedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">With:</span>
                  {taggedUsers.map((user) => (
                    <span key={user._id} className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-sm text-blue-500">
                      {user.name}
                      <button onClick={() => removeTaggedUser(user._id)} className="hover:text-blue-700">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Location Display */}
              {location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span>at {location}</span>
                  <button onClick={() => setLocation('')} className="hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

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
              {selectedGif && (
                <div className="relative rounded-lg overflow-hidden">
                  <img src={selectedGif} alt="Selected GIF" className="w-full max-h-64 object-contain bg-black/5" />
                  <button 
                    onClick={() => setSelectedGif(null)}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1 hover:bg-black/70"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}

              {/* Tag People Panel */}
              <AnimatePresence>
                {showTagPeople && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Tag People</span>
                      <button onClick={() => setShowTagPeople(false)} className="p-1 hover:bg-muted rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for people..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {isSearchingUsers && (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    {tagSearchResults.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                        {tagSearchResults.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => addTaggedUser(user)}
                            className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-muted"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || ''} />
                              <AvatarFallback>{user.name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Emoji Picker Panel */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Choose an emoji</span>
                      <button onClick={() => setShowEmojiPicker(false)} className="p-1 hover:bg-muted rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-12 gap-1 max-h-40 overflow-y-auto">
                      {EMOJI_LIST.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => insertEmoji(emoji)}
                          className="p-1 text-xl hover:bg-muted rounded transition-transform hover:scale-110"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Location Input Panel */}
              <AnimatePresence>
                {showLocationInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Add Location</span>
                      <button onClick={() => setShowLocationInput(false)} className="p-1 hover:bg-muted rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Where are you?"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* GIF Picker Panel */}
              <AnimatePresence>
                {showGifPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Choose a GIF</span>
                      <button onClick={() => setShowGifPicker(false)} className="p-1 hover:bg-muted rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search GIFs..."
                        value={gifSearch}
                        onChange={(e) => setGifSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {isSearchingGifs && (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                      {gifResults.map((gif) => (
                        <button
                          key={gif.id}
                          onClick={() => selectGif(gif.url)}
                          className="rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                        >
                          <img 
                            src={gif.preview} 
                            alt={gif.title} 
                            className="w-full h-20 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">Powered by GIPHY</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="rounded-xl border border-border/60">
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Add to your post</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onPickFiles('image/*,video/*')} className="rounded-md p-2 hover:bg-muted" title="Photo/Video">
                      <ImageIcon className="h-5 w-5 text-emerald-500" />
                    </button>
                    <button 
                      onClick={() => { setShowTagPeople(!showTagPeople); setShowEmojiPicker(false); setShowLocationInput(false); setShowGifPicker(false); }} 
                      className={`rounded-md p-2 hover:bg-muted ${showTagPeople ? 'bg-muted' : ''}`} 
                      title="Tag people"
                    >
                      <Users className="h-5 w-5 text-blue-500" />
                    </button>
                    <button 
                      onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowTagPeople(false); setShowLocationInput(false); setShowGifPicker(false); }} 
                      className={`rounded-md p-2 hover:bg-muted ${showEmojiPicker ? 'bg-muted' : ''}`} 
                      title="Feeling/Activity"
                    >
                      <Smile className="h-5 w-5 text-yellow-500" />
                    </button>
                    <button 
                      onClick={() => { setShowLocationInput(!showLocationInput); setShowTagPeople(false); setShowEmojiPicker(false); setShowGifPicker(false); }} 
                      className={`rounded-md p-2 hover:bg-muted ${showLocationInput ? 'bg-muted' : ''}`} 
                      title="Check in"
                    >
                      <MapPin className="h-5 w-5 text-red-500" />
                    </button>
                    <button 
                      onClick={() => { setShowGifPicker(!showGifPicker); setShowTagPeople(false); setShowEmojiPicker(false); setShowLocationInput(false); }} 
                      className={`rounded-md p-2 hover:bg-muted ${showGifPicker ? 'bg-muted' : ''}`} 
                      title="GIF"
                    >
                      <span className="text-teal-500 text-xs font-semibold">GIF</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handlePostSubmit}
                  disabled={(!content.trim() && previews.length === 0 && !videoPreview && !selectedGif) || isPosting}
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
