const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["admin", "company", "jobseeker"], default: "jobseeker" }
});

module.exports = mongoose.model("User", UserSchema);
