const Job = require("../models/Job");

// Create a new job
exports.createJob = async (req, res) => {
    try {
        const job = new Job({ ...req.body, postedBy: req.user.id });
        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ error: "Failed to create job", details: error.message });
    }
};

// Get all jobs with filtering and pagination
exports.getJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", location = "", minSalary, maxSalary } = req.query;

        const filters = {};
        if (search) filters.title = new RegExp(search, "i"); // Case-insensitive title search
        if (location) filters.location = location;
        if (minSalary) filters.salary = { $gte: minSalary };
        if (maxSalary) filters.salary = { ...filters.salary, $lte: maxSalary };

        const jobs = await Job.find(filters)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalJobs = await Job.countDocuments(filters);

        res.json({ totalJobs, currentPage: page, totalPages: Math.ceil(totalJobs / limit), jobs });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch jobs", details: error.message });
    }
};

// Get a specific job by ID
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch job", details: error.message });
    }
};

// Apply for a job (track applicants)
exports.applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        // Prevent duplicate applications
        if (job.applicants.includes(req.user.id)) {
            return res.status(400).json({ error: "You have already applied for this job" });
        }

        job.applicants.push(req.user.id);
        await job.save();

        res.json({ message: "Job application submitted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to apply for job", details: error.message });
    }
};

// Update a job (Only job poster can update)
exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to update this job" });
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedJob);
    } catch (error) {
        res.status(500).json({ error: "Failed to update job", details: error.message });
    }
};

// Delete a job (Only job poster can delete)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to delete this job" });
        }

        await job.deleteOne();
        res.json({ message: "Job deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete job", details: error.message });
    }
};

// Get jobs posted by a specific user
exports.getJobsByUser = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user jobs", details: error.message });
    }
};

// Get applicants for a job (Only job poster can view)
exports.getApplicantsForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate("applicants", "name email");
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to view applicants for this job" });
        }

        res.json({ applicants: job.applicants });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch applicants", details: error.message });
    }
};
