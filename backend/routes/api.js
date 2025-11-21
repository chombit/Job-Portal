const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// Import controllers
const authController = require('../controllers/authController');
const jobController = require('../controllers/jobController');
const applicationController = require('../controllers/applicationController');
const savedJobController = require('../controllers/savedJobController');
const adminController = require('../controllers/adminController');

// Authentication routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);
router.put('/auth/updatedetails', auth, authController.updateDetails);
router.put('/auth/updatepassword', auth, authController.updatePassword);

// Job routes
router.get('/jobs', jobController.getJobs);
router.get('/jobs/my-jobs', auth, jobController.getMyJobs);
router.get('/jobs/:id', jobController.getJob);
router.post('/jobs', auth, authorize('employer', 'admin'), jobController.createJob);
router.put('/jobs/:id', auth, jobController.updateJob);
router.delete('/jobs/:id', auth, jobController.deleteJob);


// Application routes
router.post('/jobs/:jobId/apply', auth, authorize('job_seeker'), applicationController.applyForJob);
router.get('/applications/me', auth, authorize('job_seeker'), applicationController.getMyApplications);
router.get('/applications/my-jobs', auth, authorize('employer', 'admin'), applicationController.getApplicationsForMyJobs);
router.put('/applications/:id/status', auth, applicationController.updateApplicationStatus);
router.delete('/applications/:id', auth, applicationController.withdrawApplication);

// Saved jobs routes
router.get('/saved-jobs', auth, savedJobController.getSavedJobs);
router.post('/jobs/:jobId/save', auth, savedJobController.saveJob);
router.put('/saved-jobs/:id', auth, savedJobController.updateSavedJob);
router.delete('/saved-jobs/:id', auth, savedJobController.removeSavedJob);
router.get('/jobs/:jobId/is-saved', auth, savedJobController.checkIfJobIsSaved);

// Admin routes
router.get('/admin/dashboard/stats', auth, authorize('admin'), adminController.getDashboardStats);
router.get('/admin/users/recent', auth, authorize('admin'), adminController.getRecentUsers);
router.get('/admin/users', auth, authorize('admin'), adminController.getAllUsers);
router.get('/admin/users/:id', auth, authorize('admin'), adminController.createUser);
router.get('/admin/jobs/recent', auth, authorize('admin'), adminController.getRecentJobs);
router.get('/admin/jobs', auth, authorize('admin'), adminController.getAllJobs);
router.get('/admin/approvals/pending', auth, authorize('admin'), adminController.getPendingApprovals);
router.put('/admin/jobs/:id/status', auth, authorize('admin'), adminController.updateJobStatus);
router.put('/admin/users/:id/status', auth, authorize('admin'), adminController.updateUserStatus);
router.put('/admin/users/:id', auth, authorize('admin'), adminController.updateUser);


module.exports = router;
