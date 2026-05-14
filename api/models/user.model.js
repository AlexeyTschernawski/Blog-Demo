import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M16 16C19.3137 16 22 13.3137 22 10C22 6.68629 19.3137 4 16 4C12.6863 4 10 6.68629 10 10C10 13.3137 12.6863 16 16 16Z' fill='%239CA3AF'/%3E%3Cpath d='M16 18C11.0492 18 7 21.134 7 25.5C7 26.3284 7.67157 27 8.5 27H23.5C24.3284 27 25 26.3284 25 25.5C25 21.134 20.9508 18 16 18Z' fill='%239CA3AF'/%3E%3C/svg%3E"
    },
    profilePictureFileId: 
    { type: String, default: "" },

    isAdmin: {
      type: Boolean,
      default: false,
    },
    
  
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    

    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;