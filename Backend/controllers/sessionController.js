import Session from "../model/Session.js";
import Mentor from "../model/Mentor.js";

// @route POST /api/sessions/book
export const bookSession = async (req, res, next) => {
  try {
    const { mentorId, scheduledAt, duration, notes } = req.body;

    const mentor = await Mentor.findById(mentorId);
    if (!mentor || !mentor.isApproved) {
      res.status(404);
      throw new Error("Mentor not found or not approved");
    }

    // Prevent booking a session with yourself
    if (mentor.user.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot book a mentorship session with yourself.");
    }

    const session = new Session({
      founder: req.user._id,
      mentor: mentorId,
      scheduledAt,
      duration: duration || 60,
      notes: notes || "",
    });

    session.meetingLink = `https://meet.jit.si/ProjectSensei_Session_${session._id}`;
    await session.save();

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/sessions/my
// Get all sessions for the logged-in user (founder or mentor)
export const getMySessions = async (req, res, next) => {
  try {
    const mentor = await Mentor.findOne({ user: req.user._id });
    const query = mentor
      ? { $or: [{ founder: req.user._id }, { mentor: mentor._id }] }
      : { founder: req.user._id };

    const sessions = await Session.find(query)
      .populate("founder", "name email profilePic")
      .populate({
        path: "mentor",
        populate: { path: "user", select: "name email profilePic" },
      })
      .sort({ scheduledAt: -1 });

    const now = new Date();
    const processedSessions = [];

    for (let session of sessions) {
      const scheduledTime = new Date(session.scheduledAt);
      const endTime = new Date(scheduledTime.getTime() + (session.duration || 60) * 60 * 1000);

      if (now > endTime) {
        let needsUpdate = false;
        const updateFields = {};

        if (session.meetingLink) {
          session.meetingLink = null;
          updateFields.meetingLink = null;
          needsUpdate = true;
        }

        if (session.status === "confirmed") {
          session.status = "completed";
          updateFields.status = "completed";
          needsUpdate = true;
        }

        if (needsUpdate) {
          await Session.updateOne({ _id: session._id }, { $set: updateFields });
        }
      }
      processedSessions.push(session);
    }

    res.json(processedSessions);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/sessions/:id/status
// Mentor confirms or cancels; founder cancels
export const updateSessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404);
      throw new Error("Session not found");
    }

    const validStatuses = ["confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error("Invalid status value");
    }

    session.status = status;
    await session.save();

    res.json({ message: `Session marked as ${status}`, session });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/sessions/:id/payment
// Update payment status after Razorpay/Stripe webhook
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404);
      throw new Error("Session not found");
    }

    session.paymentStatus = paymentStatus;
    session.paymentId = paymentId;
    if (paymentStatus === "paid") session.status = "confirmed";

    await session.save();
    res.json({ message: "Payment status updated", session });
  } catch (error) {
    next(error);
  }
};
