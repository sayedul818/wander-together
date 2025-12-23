import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

// GET /api/messages?userId=<otherUserId> - Get conversation with a specific user
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (userId) {
      // Get conversation with specific user
      const messages = await Message.find({
        $or: [
          { sender: session.userId, recipient: userId },
          { sender: userId, recipient: session.userId }
        ]
      })
        .populate('sender', 'name avatar')
        .populate('recipient', 'name avatar')
        .sort({ createdAt: 1 });

      // Mark messages as read
      await Message.updateMany(
        { sender: userId, recipient: session.userId, read: false },
        { read: true }
      );

      return NextResponse.json({ messages });
    } else {
      // Get all conversations (list of users with latest message)
      const sentMessages = await Message.find({ sender: session.userId })
        .populate('recipient', 'name avatar email')
        .sort({ createdAt: -1 });
      
      const receivedMessages = await Message.find({ recipient: session.userId })
        .populate('sender', 'name avatar email')
        .sort({ createdAt: -1 });

      // Combine and group by user
      const conversationsMap = new Map();

      sentMessages.forEach(msg => {
        if (!msg.recipient) return; // skip if recipient is missing
        const userId = (msg.recipient as any)._id?.toString();
        if (!userId) return;
        if (!conversationsMap.has(userId)) {
          conversationsMap.set(userId, {
            user: msg.recipient,
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
            unreadCount: 0
          });
        }
      });

      receivedMessages.forEach(msg => {
        if (!msg.sender) return; // skip if sender is missing
        const userId = (msg.sender as any)._id?.toString();
        if (!userId) return;
        const existing = conversationsMap.get(userId);
        if (!existing || new Date(msg.createdAt) > new Date(existing.lastMessageTime)) {
          conversationsMap.set(userId, {
            user: msg.sender,
            lastMessage: msg.content,
            lastMessageTime: msg.createdAt,
            unreadCount: existing?.unreadCount || 0
          });
        }
        if (!msg.read) {
          const current = conversationsMap.get(userId);
          if (current) {
            current.unreadCount = (current.unreadCount || 0) + 1;
          }
        }
      });

      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

      return NextResponse.json({ conversations });
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages - Send a new message
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recipient, content } = body;

    if (!recipient || !content?.trim()) {
      return NextResponse.json({ error: 'Recipient and content are required' }, { status: 400 });
    }

    // Check if recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Create message
    const message = await Message.create({
      sender: session.userId,
      recipient,
      content: content.trim(),
      read: false
    });

    await message.populate('sender', 'name avatar');
    await message.populate('recipient', 'name avatar');

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
