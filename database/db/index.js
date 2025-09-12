require('dotenv').config();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10; // Standard salt factor for bcrypt

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ Error connecting to MongoDB:', err));


// --- Schemas Definition ---

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  purchasedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  }],
}, { timestamps: true });

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  imageLink: { // Changed to camelCase for convention
    type: String,
    required: true,
  },
  price: { // Changed to camelCase for convention
    type: Number,
    required: true,
    min: 0, // Price should not be negative
  },
  isPublished: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// --- Password Hashing Middleware (for both Admin and User) ---
const hashPassword = async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
};

AdminSchema.pre('save', hashPassword);
UserSchema.pre('save', hashPassword);

// --- Password Comparison Method (for both Admin and User) ---
const comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

AdminSchema.methods.comparePassword = comparePassword;
UserSchema.methods.comparePassword = comparePassword;


// --- Model Creation ---
const Admin = mongoose.model("Admin", AdminSchema);
const User = mongoose.model("User", UserSchema);
const Course = mongoose.model("Course", CourseSchema);


// --- Exports ---
module.exports = {
  Admin,
  User,
  Course,
};