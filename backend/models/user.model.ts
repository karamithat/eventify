import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Interface - User dokümanı için (şemaya uygun)
export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Schema
const userSchema: Schema<UserDocument> = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Şifreyi hashlemeden önce
userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Girişte girilen şifreyi hash ile karşılaştır
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Model
const User = mongoose.model<UserDocument>("User", userSchema);
export default User;
