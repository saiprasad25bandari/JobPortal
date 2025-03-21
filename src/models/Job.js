const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
    title: String,
    company: String,
    description: String,
    location: String,
    salary: Number,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Job", JobSchema);
