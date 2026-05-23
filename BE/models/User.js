const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Vui lòng nhập họ tên"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng nhập email hợp lệ",
      ],
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    profileCompleted: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin", "lab_staff"],
      default: "patient",
    },
    gender: {
      type: String,
      enum: ["Nam", "Nữ"],
      default: "Nam",
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    patientId: {
      type: String,
      unique: true,
      sparse: true,
    },
    /** Tăng khi logout để vô hiệu hóa mọi refresh token cũ */
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
    healthProfile: {
      bloodType: { type: String, default: "" },
      height: { type: String, default: "" },
      weight: { type: String, default: "" },
      bloodPressure: { type: String, default: "" },
      allergies: { type: String, default: "" },
      medicalHistory: { type: String, default: "" },
      isFilled: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  },
);

// Generate patientId before saving if not exists
userSchema.pre("save", async function () {
  if (!this.patientId && this.role === "patient") {
    const count = await mongoose
      .model("User")
      .countDocuments({ role: "patient" });
    this.patientId = `BN${String(count + 1).padStart(6, "0")}`;
  }

  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
