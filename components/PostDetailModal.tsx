'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsUp, MessageCircle, Share2, Loader2, Send, Heart, Smile, PartyPopper, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

interface PostDetailModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onCommentAdded: (updatedPost: any) => void;
}

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  currentUser,
  onCommentAdded
}: PostDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [localPost, setLocalPost] = useState<any>(post || null);
  const [isReacting, setIsReacting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactorsModal, setShowReactorsModal] = useState(false);
  const [visibleComments, setVisibleComments] = useState(5);
  const [visibleReplies, setVisibleReplies] = useState<{ [key: string]: number }>({});
  const [activeReactionTarget, setActiveReactionTarget] = useState<{ type: 'comment' | 'reply'; commentId: string; replyId?: string } | null>(null);

  // Reaction types with icons and colors
  const reactionTypes = [
    { type: 'like', label: 'Like', emoji: '👍', color: 'text-blue-500' },
    { type: 'love', label: 'Love', emoji: '❤️', color: 'text-red-500' },
    { type: 'care', label: 'Care', emoji: '🥰', color: 'text-amber-500' },
    { type: 'haha', label: 'Haha', emoji: '😂', color: 'text-yellow-500' },
    { type: 'wow', label: 'Wow', emoji: '😮', color: 'text-yellow-500' },
    { type: 'sad', label: 'Sad', emoji: '😢', color: 'text-blue-400' },
    { type: 'angry', label: 'Angry', emoji: '😡', color: 'text-orange-600' },
  ];

  // Update localPost when post prop changes
  useEffect(() => {
    if (post) {
      setLocalPost(post);
      setIsExpanded(false);
    }
  }, [post]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setLocalPost(updatedPost);
        onCommentAdded(updatedPost);
        setNewComment('');
        toast.success('Comment added');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setLocalPost(updatedPost);
        onCommentAdded(updatedPost);
        setReplyText('');
        setReplyingTo(null);
        toast.success('Reply added');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (type: string) => {
    setIsReacting(true);
    setShowReactionPicker(false);
    try {
      const res = await fetch(`/api/posts/${localPost._id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType: type })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setLocalPost(updatedPost);
        onCommentAdded(updatedPost);
        toast.success('Reaction added');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to react');
      }
    } catch (error) {
      console.error('Error reacting:', error);
      toast.error('Failed to react');
    } finally {
      setIsReacting(false);
    }
  };

  const handleCommentReaction = async (commentId: string, type: string) => {
    try {
      const res = await fetch(`/api/posts/${post._id}/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType: type })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setLocalPost(updatedPost);
        onCommentAdded(updatedPost);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to react to comment');
      }
    } catch (error) {
      console.error('Error reacting to comment:', error);
      toast.error('Failed to react to comment');
    } finally {
      setActiveReactionTarget(null);
    }
  };

  const handleReplyReaction = async (commentId: string, replyId: string, type: string) => {
    try {
      const res = await fetch(`/api/posts/${post._id}/comments/${commentId}/replies/${replyId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType: type })
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setLocalPost(updatedPost);
        onCommentAdded(updatedPost);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to react to reply');
      }
    } catch (error) {
      console.error('Error reacting to reply:', error);
      toast.error('Failed to react to reply');
    } finally {
      setActiveReactionTarget(null);
    }
  };

  const getTruncatedText = (text: string) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= 20) return text;
    
    if (isExpanded) return text;
    
    return words.slice(0, 20).join(' ') + '...';
  };

  if (!isOpen || !post || !localPost) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg">{post.userId?.name}'s Post</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
            {/* Post Image/Content - Left Side */}
            {localPost.images && localPost.images.length > 0 && (
              <div className="w-full lg:w-1/2 bg-black flex items-center justify-center min-h-[300px] lg:min-h-auto">
                <div className="relative w-full h-full min-h-[300px]">
                  <Image
                    src={localPost.images[0]}
                    alt="Post"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {localPost.videoUrl && !localPost.images && (
              <div className="w-full lg:w-1/2 bg-black flex items-center justify-center min-h-[300px] lg:min-h-auto">
                <video src={localPost.videoUrl} controls className="w-full h-full object-contain" />
              </div>
            )}

            {/* Comments Section - Right Side */}
            <div className="w-full lg:w-1/2 flex flex-col">
              {/* Post Info */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={localPost.userId?.avatar} alt={localPost.userId?.name} />
                    <AvatarFallback>{localPost.userId?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${localPost.userId?._id}`}>
                      <p className="font-semibold hover:underline">{localPost.userId?.name}</p>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(localPost.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {localPost.content && (
                  <div>
                    <p className="text-foreground mb-1">{getTruncatedText(localPost.content)}</p>
                    {localPost.content.split(' ').length > 20 && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-secondary hover:underline text-sm font-medium"
                      >
                        {isExpanded ? 'See less' : 'See more'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Reactions & Stats */}
              <div className="px-6 py-3 border-b border-border flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  {localPost.reactions && localPost.reactions.length > 0 && (
                    <button 
                      onClick={() => setShowReactorsModal(true)}
                      className="hover:underline hover:text-foreground"
                    >
                      {localPost.reactions.length} {localPost.reactions.length === 1 ? 'reaction' : 'reactions'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {localPost.comments && localPost.comments.length > 0 && (
                    <span>{localPost.comments.length} {localPost.comments.length === 1 ? 'comment' : 'comments'}</span>
                  )}
                  {localPost.shares && localPost.shares.length > 0 && (
                    <span>{localPost.shares.length} shares</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-3 border-b border-border flex items-center gap-1 justify-around relative">
                <div className="flex-1 relative">
                  <button 
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    disabled={isReacting}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-secondary/10 transition text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {isReacting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-4 w-4" />
                    )}
                    <span>Like</span>
                  </button>

                  {/* Reaction Picker */}
                  <AnimatePresence>
                    {showReactionPicker && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 10 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-background border border-border rounded-full shadow-lg p-2 flex gap-2 z-50"
                      >
                        {reactionTypes.map((reaction) => (
                          <button
                            key={reaction.type}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReaction(reaction.type);
                            }}
                            className={`p-2 rounded-full hover:scale-125 transition-transform ${reaction.color} hover:bg-secondary/20 text-lg`}
                            title={reaction.label}
                          >
                            {reaction.emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-secondary/10 transition text-sm text-muted-foreground hover:text-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span>Comment</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-secondary/10 transition text-sm text-muted-foreground hover:text-foreground">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {localPost.comments && localPost.comments.length > 0 ? (
                  <>
                  {localPost.comments.slice(0, visibleComments).map((comment: any) => (
                    <div key={comment._id} className="space-y-3">
                      {/* Main Comment */}
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.userId?.avatar} alt={comment.userId?.name} />
                          <AvatarFallback>{comment.userId?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="bg-secondary/20 rounded-2xl px-4 py-2">
                            <Link href={`/profile/${comment.userId?._id}`}>
                              <p className="font-semibold text-sm hover:underline">
                                {comment.userId?.name || 'Unknown User'}
                              </p>
                            </Link>
                            <p className="text-sm text-foreground break-words">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-1 px-4 text-xs text-muted-foreground">
                            <div className="relative">
                              <button
                                onClick={() => setActiveReactionTarget({ type: 'comment', commentId: comment._id })}
                                className="hover:underline"
                              >
                                React
                              </button>
                              <AnimatePresence>
                                {activeReactionTarget?.type === 'comment' && activeReactionTarget.commentId === comment._id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                    className="absolute left-0 mt-2 flex gap-2 bg-card shadow-lg rounded-full p-2 border border-border z-20"
                                  >
                                    {reactionTypes.map((reaction) => (
                                      <button
                                        key={reaction.type}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCommentReaction(comment._id, reaction.type);
                                        }}
                                        className={`p-2 rounded-full hover:scale-125 transition-transform ${reaction.color} hover:bg-secondary/20 text-base`}
                                        title={reaction.label}
                                      >
                                        {reaction.emoji}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <button onClick={() => setReplyingTo(comment._id)} className="hover:underline">
                              Reply
                            </button>
                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            {comment.reactions?.length > 0 && (
                              <div className="flex items-center gap-1 text-[11px] text-foreground">
                                <div className="flex -space-x-1">
                                  {Array.from(new Set(comment.reactions.map((r: any) => r.type))).map((type) => {
                                    const config = reactionTypes.find((rt) => rt.type === type as string);
                                    const color = config?.color || 'text-blue-500';
                                    return (
                                      <span
                                        key={type as string}
                                        className={`h-5 w-5 rounded-full bg-muted flex items-center justify-center border border-border ${color} text-xs`}
                                      >
                                        {config?.emoji || '👍'}
                                      </span>
                                    );
                                  })}
                                </div>
                                <span>{comment.reactions.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 space-y-3">
                          {comment.replies.slice(0, visibleReplies[comment._id] || 3).map((reply: any, idx: number) => (
                            <div key={idx} className="flex gap-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={reply.userId?.avatar} alt={reply.userId?.name} />
                                <AvatarFallback>{reply.userId?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="bg-secondary/20 rounded-2xl px-4 py-2">
                                  <p className="font-semibold text-sm">{reply.userId?.name || 'Unknown User'}</p>
                                  <p className="text-sm text-foreground break-words">{reply.content}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-1 px-4 text-xs text-muted-foreground">
                                  <div className="relative">
                                    <button
                                      onClick={() => setActiveReactionTarget({ type: 'reply', commentId: comment._id, replyId: reply._id })}
                                      className="hover:underline"
                                    >
                                      React
                                    </button>
                                    <AnimatePresence>
                                      {activeReactionTarget?.type === 'reply' && activeReactionTarget.commentId === comment._id && activeReactionTarget.replyId === reply._id && (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                          className="absolute left-0 mt-2 flex gap-2 bg-card shadow-lg rounded-full p-2 border border-border z-20"
                                        >
                                          {reactionTypes.map((reaction) => (
                                            <button
                                              key={reaction.type}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleReplyReaction(comment._id, reply._id, reaction.type);
                                              }}
                                              className={`p-2 rounded-full hover:scale-125 transition-transform ${reaction.color} hover:bg-secondary/20 text-base`}
                                              title={reaction.label}
                                            >
                                              {reaction.emoji}
                                            </button>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                  <button onClick={() => setReplyingTo(comment._id)} className="hover:underline">
                                    Reply
                                  </button>
                                  <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                                  {reply.reactions?.length > 0 && (
                                    <div className="flex items-center gap-1 text-[11px] text-foreground">
                                      <div className="flex -space-x-1">
                                        {Array.from(new Set(reply.reactions.map((r: any) => r.type))).map((type) => {
                                          const config = reactionTypes.find((rt) => rt.type === type as string);
                                          const color = config?.color || 'text-blue-500';
                                          return (
                                            <span
                                              key={type as string}
                                              className={`h-5 w-5 rounded-full bg-muted flex items-center justify-center border border-border ${color} text-xs`}
                                            >
                                              {config?.emoji || '👍'}
                                            </span>
                                          );
                                        })}
                                      </div>
                                      <span>{reply.reactions.length}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {comment.replies.length > (visibleReplies[comment._id] || 3) && (
                            <button
                              onClick={() => setVisibleReplies(prev => ({ ...prev, [comment._id]: (prev[comment._id] || 3) + 5 }))}
                              className="text-xs text-secondary hover:text-secondary/80 font-semibold"
                            >
                              See more replies ({comment.replies.length - (visibleReplies[comment._id] || 3)} more)
                            </button>
                          )}
                          {(visibleReplies[comment._id] || 0) > 3 && (
                            <button
                              onClick={() => setVisibleReplies(prev => ({ ...prev, [comment._id]: 3 }))}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              See less
                            </button>
                          )}
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingTo === comment._id && (
                        <div className="ml-8 flex gap-2">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                            <AvatarFallback>{currentUser?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddReply(comment._id)}
                              placeholder="Write a reply..."
                              className="rounded-full text-sm"
                            />
                            <button
                              onClick={() => handleAddReply(comment._id)}
                              disabled={isSubmitting || !replyText.trim()}
                              className="text-secondary hover:text-secondary/80 disabled:opacity-30 transition"
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {localPost.comments.length > visibleComments && (
                    <button
                      onClick={() => setVisibleComments(prev => prev + 5)}
                      className="text-sm text-secondary hover:text-secondary/80 font-semibold py-2"
                    >
                      See more comments ({localPost.comments.length - visibleComments} more)
                    </button>
                  )}
                  {visibleComments > 5 && (
                    <button
                      onClick={() => setVisibleComments(5)}
                      className="text-sm text-muted-foreground hover:text-foreground py-2"
                    >
                      See less
                    </button>
                  )}
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
                )}
              </div>

              {/* Comment Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                    <AvatarFallback>{currentUser?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex items-center gap-2 bg-secondary/20 rounded-full px-4 py-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      placeholder={`Comment as ${currentUser?.name || 'User'}...`}
                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={isSubmitting || !newComment.trim()}
                      className="text-secondary hover:text-secondary/80 disabled:opacity-30 transition"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reactors Modal */}
        <AnimatePresence>
          {showReactorsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowReactorsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="card-surface max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Reactions</h3>
                  <button 
                    onClick={() => setShowReactorsModal(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-3">
                  {localPost.reactions?.map((reaction: any, idx: number) => {
                    const reactionConfig = reactionTypes.find(rt => rt.type === reaction.type);
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={reaction.userId?.avatar} alt={reaction.userId?.name} />
                          <AvatarFallback>{reaction.userId?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{reaction.userId?.name || 'Unknown User'}</p>
                        </div>
                        <div className={`${reactionConfig?.color || 'text-blue-500'} text-lg`}>
                          {reactionConfig?.emoji || '👍'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
