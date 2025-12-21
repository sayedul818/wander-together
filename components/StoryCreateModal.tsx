"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { toast } from 'sonner';

interface StoryCreateModalProps {
	open: boolean;
	onClose: () => void;
	onCreated?: (story: any) => void;
	currentUser?: { name?: string; avatar?: string } | null;
}

export default function StoryCreateModal({ open, onClose, onCreated, currentUser }: StoryCreateModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [text, setText] = useState('');
	const [location, setLocation] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!open) {
			setFile(null);
			setPreview(null);
			setText('');
			setLocation('');
			setIsSubmitting(false);
		}
	}, [open]);

	useEffect(() => {
		if (!file) {
			setPreview(null);
			return;
		}

		const url = URL.createObjectURL(file);
		setPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = e.target.files?.[0];
		if (selected) {
			if (!selected.type.startsWith('image/')) {
				toast.error('Please select an image');
				return;
			}
			setFile(selected);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file) {
			toast.error('Add a photo to your story');
			return;
		}

		try {
			setIsSubmitting(true);

			const fd = new FormData();
			fd.append('file', file);
			const uploadRes = await fetch('/api/upload/cloudinary', { method: 'POST', body: fd });
			if (!uploadRes.ok) {
				toast.error('Failed to upload image');
				return;
			}
			const uploadData = await uploadRes.json();
			const imageUrl = uploadData.url;

			const res = await fetch('/api/stories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ image: imageUrl, text, location }),
			});

			if (!res.ok) {
				toast.error('Could not publish story');
				return;
			}

			const story = await res.json();
			toast.success('Story shared');
			onCreated?.(story);
			onClose();
		} catch (err) {
			console.error('Story create error', err);
			toast.error('Something went wrong');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					<motion.div
						className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl"
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
					>
						<button
							onClick={onClose}
							className="absolute right-4 top-4 rounded-full bg-card/80 text-foreground p-2 shadow hover:bg-card"
							aria-label="Close"
						>
							<X className="h-5 w-5" />
						</button>

						<div className="grid grid-cols-1 gap-6 p-6">
							<div className="flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow">
									{currentUser?.avatar ? (
										<Image src={currentUser.avatar} alt={currentUser.name || 'You'} width={48} height={48} className="h-full w-full object-cover" />
									) : (
										<span className="text-lg font-semibold">{currentUser?.name?.charAt(0) || 'Y'}</span>
									)}
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Create story</p>
									<p className="font-semibold">{currentUser?.name || 'You'}</p>
								</div>
							</div>

							<form className="space-y-4" onSubmit={handleSubmit}>
								<label className="flex h-48 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/40 transition hover:border-indigo-400 hover:bg-indigo-50">
									<div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
										{preview ? (
											<div className="relative h-48 w-full overflow-hidden rounded-xl">
												<img src={preview} alt="Preview" className="h-full w-full object-cover" />
											</div>
										) : (
											<>
												<ImageIcon className="h-8 w-8" />
												<span>Upload a photo</span>
											</>
										)}
									</div>
									<input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
								</label>

								<Textarea
									placeholder="Say something about your trip..."
									value={text}
									onChange={(e) => setText(e.target.value)}
									className="min-h-[96px]"
								/>

								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Add a location"
										value={location}
										onChange={(e) => setLocation(e.target.value)}
									/>
								</div>

								<div className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm text-muted-foreground">
									<div className="flex items-center gap-2">
										<Sparkles className="h-4 w-4 text-indigo-500" />
										<span>Stories disappear after 24 hours</span>
									</div>
								</div>

								<div className="flex justify-end gap-2">
									<Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
										Cancel
									</Button>
									<Button type="submit" disabled={!file || isSubmitting}>
										{isSubmitting ? 'Sharing...' : 'Share Story'}
									</Button>
								</div>
							</form>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
