const express = require("express");
const { 
    createJob, 
    getJobs, 
    getJobById, 
    updateJob, 
    deleteJob, 
    applyForJob, 
    getJobsByUser, 
    getApplicantsForJob 
} = require("../controllers/jobController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a job (Authenticated users only)
router.post("/", authMiddleware, createJob);

// Get all jobs with filtering & pagination
router.get("/", getJobs);

// Get a specific job by ID
router.get("/:id", getJobById);

// Update a job (Only job owner)
router.patch("/:id", authMiddleware, updateJob);

// Delete a job (Only job owner)
router.delete("/:id", authMiddleware, deleteJob);

// Apply for a job (Authenticated users only)
router.post("/:id/apply", authMiddleware, applyForJob);

// Get jobs posted by the logged-in user
router.get("/my-jobs", authMiddleware, getJobsByUser);

// Get applicants for a job (Only job owner)
router.get("/:id/applicants", authMiddleware, getApplicantsForJob);

module.exports = router;
