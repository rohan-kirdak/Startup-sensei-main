import Mentor from "../model/Mentor.js";
import User from "../model/User.js";

// @route POST /api/mentors/apply
// Apply to become a mentor (founder applies)
export const applyAsMentor = async (req, res, next) => {
  try {
    const { expertise, hourlyRate, availability, bio } = req.body;

    const alreadyApplied = await Mentor.findOne({ user: req.user._id });
    if (alreadyApplied) {
      res.status(400);
      throw new Error("Mentor profile already exists for this user");
    }

    const mentor = await Mentor.create({
      user: req.user._id,
      expertise,
      hourlyRate,
      availability,
      isApproved: true,
    });

    // Ensure role and bio are updated in User profile
    await User.findByIdAndUpdate(req.user._id, { 
      role: "mentor",
      ...(bio && { bio })
    });

    res.status(201).json(mentor);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/mentors
// Get all approved mentors with optional filter by expertise
export const getAllMentors = async (req, res, next) => {
  try {
    const { expertise, minRating } = req.query;

    const filter = { isApproved: true };
    if (expertise) filter.expertise = { $in: [expertise] };
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const mentors = await Mentor.find(filter)
      .populate("user", "name email profilePic bio")
      .sort({ rating: -1 });

    res.json(mentors);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/mentors/:id
// Get single mentor by ID
export const getMentorById = async (req, res, next) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate(
      "user",
      "name email profilePic bio",
    );

    if (!mentor) {
      res.status(404);
      throw new Error("Mentor not found");
    }

    res.json(mentor);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/mentors/:id/approve  (Admin only)
export const approveMentor = async (req, res, next) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true },
    );

    if (!mentor) {
      res.status(404);
      throw new Error("Mentor not found");
    }

    res.json({ message: "Mentor approved successfully", mentor });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/mentors/:id/review
// Submit a rating/review after a completed session
export const reviewMentor = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      res.status(404);
      throw new Error("Mentor not found");
    }

    // Recalculate average rating
    const totalRatingPoints = mentor.rating * mentor.totalReviews + rating;
    mentor.totalReviews += 1;
    mentor.rating = totalRatingPoints / mentor.totalReviews;

    await mentor.save();
    res.json({ message: "Review submitted", rating: mentor.rating });
  } catch (error) {
    next(error);
  }
};
