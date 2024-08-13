const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../Models/SignUpModel'); 
const nodemailer = require('nodemailer'); 

// Function to hash passwords
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// 1. Signup Controller
exports.signup = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, profession, aboutYou, education, upload, age, idVerification, uploadIDCard } = req.body;
        const hashedPassword = await hashPassword(password);
        
        const user = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            profession,
            aboutYou,
            education,
            upload,
            age,
            idVerification,
            uploadIDCard,
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 2. Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Implement JWT or session logic here to maintain a login session
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 3. Edit Profile Controller
exports.editProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming req.user is populated by authentication middleware
        const { fullName, email, dateOfBirth, gender } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, {
            fullName,
            email,
            dateOfBirth,
            gender,
        }, { new: true });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 4. Request Password Reset Controller
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ message: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry

        await user.save();

        // Send email with token (nodemailer example)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/reset/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('there was an error: ', err);
            } else {
                res.status(200).json('recovery email sent');
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 5. Reset Password Controller
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Token is invalid or has expired' });

        user.password = await hashPassword(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 6. Change Password Controller
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.user.id); // Assuming req.user is populated by authentication middleware

        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        user.password = await hashPassword(newPassword);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 7. Logout Controller
exports.logout = (req, res) => {
    // Implement session or JWT invalidation here
    req.logout(); // If using Passport.js
    res.status(200).json({ message: 'Logged out successfully' });
};

// 8. Sign out from all devices Controller (assuming using JWT)
exports.signOutFromAllDevices = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        // Here, you would invalidate all JWT tokens by changing a field in the user schema
        // For example, adding a "tokenVersion" or similar concept:
        user.tokenVersion += 1;
        await user.save();

        res.status(200).json({ message: 'Signed out from all devices' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
