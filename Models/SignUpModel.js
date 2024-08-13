const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true }, 
    phoneNumber: { type: Number, required: true },
    password: { type: String, required: true },
    profession: { type: String, required: false }, 
    aboutYou: { type: String, required: false },
    education: { type: String, required: false },
    upload: { type: String, required: false },
    age: { type: Number, required: false },
    idVerification: { type: String, required: false },
    uploadIDCard: { type: String, required: false },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
    dateOfBirth: { type: Date, required: false },
    gender: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
