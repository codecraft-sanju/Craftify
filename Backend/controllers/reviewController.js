// controllers/reviewController.js
const Review = require('../models/Review');
const User = require('../models/User'); // User ki details nikalne ke liye

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    // Sabse naye reviews pehle dikhane ke liye createdAt: -1 kiya hai
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Logged in users only)
const createReview = async (req, res) => {
  try {
    // 1. Frontend se sirf quote aur rating lenge
    const { quote, rating } = req.body;
    
    // 2. User ID humein auth middleware (token) se mil jayegi, frontend par bharosa nahi karenge
    const userId = req.user._id; 

    // 3. User ko database me dhundho taaki uska naam aur avatar nikal sakein
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found in database.' });
    }

    const existingReview = await Review.findOne({ user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already submitted a review!' });
    }
    
    // 5. Avatar Logic: Agar database me sirf 1 letter hai (jaise 'S'), toh mast image bana lo
    let finalImageUrl = user.avatar;
    if (!finalImageUrl || finalImageUrl.length === 1) {
      const formattedName = encodeURIComponent(user.name);
      // Background color aapki website ki theme (#A79277) ke hisaab se rakha hai
      finalImageUrl = `https://ui-avatars.com/api/?name=${formattedName}&background=A79277&color=fff&size=150&rounded=true`;
    }

    // 6. Naya review object banao
    const newReview = new Review({ 
      user: userId,          // Review model me humne 'user' rakha tha naam
      name: user.name,       // DB se real name
      image: finalImageUrl,  // DB/Generated Avatar
      quote,                 // Frontend se aaya quote
      rating,                // Frontend se aayi rating
      isVerified: true
    });
    
    // 7. Database me save kar do
    await newReview.save();

  
    const totalReviews = await Review.countDocuments();
    if (totalReviews > 20) {
      const excessCount = totalReviews - 20;
      // Sabse purane find karo (createdAt: 1)
      const oldestReviews = await Review.find().sort({ createdAt: 1 }).limit(excessCount);
      const idsToDelete = oldestReviews.map(review => review._id);
      
      await Review.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.status(201).json({ 
      message: 'Review successfully added!', 
      review: newReview 
    });

  } catch (error) {
   
    if (error.code === 11000) {
      return res.status(400).json({ message: 'you already give review' });
    }
    res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

module.exports = { getReviews, createReview };