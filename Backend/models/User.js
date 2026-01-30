const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Added for generating secure tokens

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true // Added to remove extra whitespace
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Added to normalize email storage
        trim: true // Added to remove extra whitespace
    },
    password: {
        type: String,
        required: true,
        select: false // Added so password isn't returned in queries by default
    },
    role: {
        type: String,
        enum: ['customer', 'seller', 'founder', 'admin'], // Added 'admin'
        default: 'customer'
    },
    avatar: {
        type: String, // Initials (e.g., "SC") or URL
        default: 'U'
    },
    // Agar user seller hai, toh unki Shop ID yaha store kar sakte hain quick access ke liye
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },

    // --- New Advanced Fields ---
    address: [{
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        isDefault: { type: Boolean, default: false }
    }],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
    // We have to explicitly select the password in the controller because of select: false
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- New Method: Generate Password Reset Token ---
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);