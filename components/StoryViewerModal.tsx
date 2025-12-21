"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Flame, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface StoryItem {
	_id: string;
	image: string;
	text?: string;
	location?: string;
	createdAt: string;
	userId: { _id: string; name: string; avatar?: string };
	reactions?: Array<{ userId: { _id: string; name: string; avatar?: string }; type: string }>;
	replies?: Array<{ userId: { _id: string; name: string; avatar?: string }; message: string; createdAt: string }>;
	views?: string[];
}

interface StoryViewerModalProps {
	open: boolean;
	stories: StoryItem[];
	startIndex: number;
	onClose: () => void;
	onDeleted?: (id: string) => void;
	currentUserId?: string | null;
}

export default function StoryViewerModal({ open, stories, startIndex, onClose, onDeleted, currentUserId }: StoryViewerModalProps) {
	const [index, setIndex] = useState(startIndex);
	const [localStories, setLocalStories] = useState<StoryItem[]>(stories);
	const [isSending, setIsSending] = useState(false);
	const [reply, setReply] = useState('');
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		setLocalStories(stories);
	}, [stories]);

	const story = localStories[index];

	useEffect(() => {
		if (!open) return;
		if (localStories.length === 0) {
			setIndex(0);
			return;
		}
		setIndex(Math.min(startIndex, localStories.length - 1));
	}, [open, startIndex, localStories.length]);

	// Auto-advance every 7s
	useEffect(() => {
		if (!open) return;
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			handleNext();
		}, 7000);
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [index, open]);

	useEffect(() => {
		if (!open || !story?._id) return;
		// fire and forget view ping
		fetch(`/api/stories/${story._id}/views`, { method: 'POST' }).catch(() => {});
	}, [story?._id, open]);

	useEffect(() => {
		const fetchDetail = async () => {
			if (!open || !story?._id) return;
			try {
				const res = await fetch(`/api/stories/${story._id}`);
				if (!res.ok) return;
				const data = await res.json();
				setLocalStories((prev) => {
					const updated = [...prev];
					updated[index] = data;
					return updated;
				});
			} catch {}
		};
		fetchDetail();
	}, [open, story?._id, index]);

	const handlePrev = () => {
		setIndex((prev) => (prev === 0 ? localStories.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setIndex((prev) => (prev === localStories.length - 1 ? 0 : prev + 1));
	};

	const handleReact = async (type: string) => {
		if (!story?._id) return;
		try {
			const res = await fetch(`/api/stories/${story._id}/reactions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type }),
			});
			if (!res.ok) return;
			const data = await res.json();
			setLocalStories((prev) => {
				const updated = [...prev];
				updated[index] = { ...story, reactions: data.reactions } as StoryItem;
				return updated;
			});
		} catch {}
	};

	const handleSendReply = async () => {
		if (!reply.trim() || !story?._id) return;
		try {
			setIsSending(true);
			const res = await fetch(`/api/stories/${story._id}/reply`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: reply.trim() }),
			});
			if (!res.ok) {
				toast.error('Could not send reply');
				return;
			}
			const data = await res.json();
			setLocalStories((prev) => {
				const updated = [...prev];
				updated[index] = { ...story, replies: data.replies } as StoryItem;
				return updated;
			});
			setReply('');
		} catch {
			toast.error('Could not send reply');
		} finally {
			setIsSending(false);
		}
	};

	const handleDelete = async () => {
		if (!story?._id) return;
		try {
			const res = await fetch(`/api/stories/${story._id}`, { method: 'DELETE' });
			if (!res.ok) {
				toast.error('Could not delete story');
				return;
			}
			toast.success('Story deleted');
			onDeleted?.(story._id);
			if (localStories.length === 1) {
				onClose();
			} else {
				handleNext();
			}
		} catch {
			toast.error('Could not delete story');
		}
	};

	const currentReaction = useMemo(() => {
		if (!story?.reactions || !currentUserId) return null;
		return story.reactions.find((r) => r.userId?._id === currentUserId)?.type || null;
	}, [story?.reactions, currentUserId]);

	return (
		<AnimatePresence>
			{open && story && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
				>
					  <div className="relative flex h-[90vh] w-[95vw] max-w-5xl flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-black shadow-2xl ring-1 ring-border/60">
						<button
							className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
							onClick={onClose}
							aria-label="Close"
						>
							<X className="h-5 w-5" />
						</button>

						<div className="absolute inset-0">
						<Image src={story.image} alt={story.text || 'Story'} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 95vw, 100vw" priority />
						</div>

						<div className="relative flex flex-1 flex-col justify-between p-6 text-white">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="h-12 w-12 overflow-hidden rounded-full border border-white/20">
										{story.userId.avatar ? (
											<Image src={story.userId.avatar} alt={story.userId.name} width={48} height={48} className="h-full w-full object-cover" />
										) : (
											<div className="flex h-full w-full items-center justify-center bg-white/10 text-lg font-semibold">
												{story.userId.name?.charAt(0) || 'U'}
											</div>
										)}
									</div>
									<div>
										<p className="text-sm text-white/70">{story.location || 'Somewhere on the road'}</p>
										<p className="text-lg font-semibold">{story.userId.name}</p>
									</div>
								</div>

								<div className="flex items-center gap-2 text-sm text-white/80">
									<Eye className="h-4 w-4" />
									<span>{story.views?.length || 0} views</span>
								</div>
							</div>

							<div className="pointer-events-none mt-auto max-w-xl text-balance text-2xl font-semibold leading-tight drop-shadow-xl">
								{story.text}
							</div>

							<div className="flex items-center justify-between gap-3 rounded-2xl bg-black/30 p-4 backdrop-blur dark:bg-white/10">
								<div className="flex items-center gap-2">
									{['like', 'love', 'wow'].map((type) => (
										<button
											key={type}
											onClick={() => handleReact(type)}
											className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${
												currentReaction === type ? 'bg-white text-slate-900' : 'bg-white/10 text-white'
											}`}
										>
											{type === 'like' && <Heart className="h-4 w-4" />}
											{type === 'love' && <Flame className="h-4 w-4" />}
											{type === 'wow' && <MessageCircle className="h-4 w-4 rotate-180" />}
											<span className="capitalize">{type}</span>
										</button>
									))}
									{currentUserId && currentUserId === story.userId._id && (
										<Button variant="ghost" size="icon" onClick={handleDelete} className="text-white hover:bg-white/10">
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>

								<div className="flex items-center gap-2">
									<Input
										placeholder="Send a reply"
										value={reply}
										onChange={(e) => setReply(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												handleSendReply();
											}
										}}
										className="bg-white/20 text-white placeholder:text-white/60"
									/>
									<Button onClick={handleSendReply} disabled={isSending || !reply.trim()}>
										{isSending ? 'Sending...' : 'Send'}
									</Button>
								</div>
							</div>
						</div>

						<button
							onClick={handlePrev}
							className="group absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
							aria-label="Previous"
						>
							<ChevronLeft className="h-6 w-6 group-active:translate-x-[-2px]" />
						</button>

						<button
							onClick={handleNext}
							className="group absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
							aria-label="Next"
						>
							<ChevronRight className="h-6 w-6 group-active:translate-x-[2px]" />
						</button>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
