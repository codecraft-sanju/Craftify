const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { 
        type: String, 
        enum: ['customer', 'seller', 'founder', 'admin'], 
        default: 'customer' 
    },
    avatar: { type: String, default: 'U' },
    
    // --- CHANGE: Removed 'shop' field ---
    // Reason: We will query Shop collection directly to support Multi-Store future proofing.
    
    address: [{
        street: String, city: String, state: String, zipCode: String, country: String,
        isDefault: { type: Boolean, default: false }
    }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model('User', userSchema);