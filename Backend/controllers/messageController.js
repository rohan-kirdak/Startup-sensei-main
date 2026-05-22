import Conversation from "../model/Conversation.js";
import Message from "../model/Message.js";
import User from "../model/User.js";

// @route GET /api/messages/conversations
// Get all conversations for the current user
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate("participants", "name email profilePic role")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: req.user._id },
          readBy: { $ne: req.user._id }
        });
        return {
          ...conv.toObject(),
          unreadCount
        };
      })
    );

    res.json(enrichedConversations);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/messages/:conversationId
// Get all messages for a specific conversation
export const getConversationMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("senderId", "name profilePic role")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/messages/send
// Send a message to a user (starts or continues a conversation)
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text, conversationId } = req.body;
    let convId = conversationId;

    // If no conversationId, find or create one between sender and receiver
    if (!convId) {
      let conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user._id, receiverId],
        });
      }
      convId = conversation._id;
    }

    // Create the message
    const message = await Message.create({
      conversationId: convId,
      senderId: req.user._id,
      text,
    });

    // Update conversation lastMessage and timestamp
    await Conversation.findByIdAndUpdate(convId, {
      lastMessage: message._id,
      isActive: true,
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/messages/start/:receiverId
// Check for existing conversation or prepare to start one
export const startConversation = async (req, res, next) => {
  try {
    const { receiverId } = req.params;
    
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    }).populate("participants", "name profilePic role bio");

    if (!conversation) {
      // Return receiver info so frontend can show who we're starting a chat with
      const receiver = await User.findById(receiverId).select("name profilePic role bio");
      return res.json({ conversation: null, receiver });
    }

    res.json({ conversation });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/messages/edit/:messageId
// Edit a message
export const editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if the current user is the sender of the message
    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this message" });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    res.json(message);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/messages/read/:conversationId
// Mark all messages in a conversation as read
export const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      {
        $addToSet: { readBy: req.user._id }
      }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    next(error);
  }
};
