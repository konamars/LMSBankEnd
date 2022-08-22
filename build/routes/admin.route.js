"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verify_1 = require("../utils/verify");
const admin_controller_1 = __importDefault(require("../controllers/admin/admin.controller"));
class AdminRouter {
    constructor() {
        this.router = express_1.Router();
        this.adminController = new admin_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/addAdmin', this.adminController.createAdmin);
        this.router.post('/authenticate', this.adminController.authenticate);
        this.router.post('/addInstructor', verify_1.verifyToken, this.adminController.createInstructor);
        this.router.put('/updateInstructor', verify_1.verifyToken, this.adminController.editInstructor);
        this.router.delete('/deleteInstructor/:instructorId', verify_1.verifyToken, this.adminController.removeInstructor);
        this.router.get('/allInstructors', verify_1.verifyToken, this.adminController.allInstructors);
        this.router.get('/getInstructorById/:instructorId', verify_1.verifyToken, this.adminController.getInstructorById);
        this.router.post('/addCourse', verify_1.verifyToken, this.adminController.createCourse);
        this.router.get('/allCourses', verify_1.verifyToken, this.adminController.allCourses);
        this.router.delete('/deleteCourse/:courseId', verify_1.verifyToken, this.adminController.removeCourse);
        this.router.delete('/deleteProgress/:id', verify_1.verifyToken, this.adminController.removeProgress);
        this.router.get('/getCourseById/:courseId', verify_1.verifyToken, this.adminController.getCourseById);
        this.router.get('/getBatchById/:batchId', verify_1.verifyToken, this.adminController.getBatchById);
        this.router.post('/getBatchDetailById', verify_1.verifyToken, this.adminController.getBatchDetailById);
        this.router.get('/getStudentsBasedOnBatch/:courseId', verify_1.verifyToken, this.adminController.getStudentsBasedOnBatch);
        this.router.put('/updateCourse', verify_1.verifyToken, this.adminController.editCourse);
        this.router.post('/allCourseBatches', verify_1.verifyToken, this.adminController.allCourseBatches);
        this.router.get('/completedCourseBatches', verify_1.verifyToken, this.adminController.completedCourseBatches);
        this.router.put('/updateLiveClassLink', verify_1.verifyToken, this.adminController.updateLiveClassLink);
        this.router.get('/getCourseBatchById/:courseId', verify_1.verifyToken, this.adminController.getCourseBatchById);
        this.router.post('/suspendUser', verify_1.verifyToken, this.adminController.suspendUser);
        this.router.post('/addUser', verify_1.verifyToken, this.adminController.createUser);
        this.router.put('/updateUser', verify_1.verifyToken, this.adminController.editUser);
        this.router.delete('/deleteUser/:userId', verify_1.verifyToken, this.adminController.removeUser);
        this.router.get('/getUserById/:userId', verify_1.verifyToken, this.adminController.getUserById);
        this.router.post('/allUsers', verify_1.verifyToken, this.adminController.allUsers);
        this.router.get('/registeredUsers', verify_1.verifyToken, this.adminController.registeredUsers);
        this.router.put('/updateCourseBatch', verify_1.verifyToken, this.adminController.updateCourseBatch);
        this.router.put('/updateCourseBatchDetail', verify_1.verifyToken, this.adminController.updateCourseBatchDetail);
        this.router.post('/addAssessment', verify_1.verifyToken, this.adminController.createAssessment);
        this.router.get('/allAssessments', verify_1.verifyToken, this.adminController.allAssessments);
        this.router.delete('/deleteAssessment/:assessmentId', verify_1.verifyToken, this.adminController.removeAssessment);
        this.router.put('/updateAssessment', verify_1.verifyToken, this.adminController.editAssessment);
        this.router.get('/getAssessmentById/:assessmentId', verify_1.verifyToken, this.adminController.getAssessmentById);
        this.router.post('/createUpdateDeleteAssignment', verify_1.verifyToken, this.adminController.createOrUpdateOrDeleteAssignment);
        this.router.get('/getFeedbacksByBatchId/:batchId', this.adminController.getFeedbacksByBatchId);
        this.router.delete('/deleteProject/:batchId/:projectId', this.adminController.removeProject);
        this.router.put('/updateFeedbackFlag', this.adminController.updateFeedbackFlag);
        this.router.post('/addBatch', verify_1.verifyToken, this.adminController.createBatch);
        this.router.post('/deleteAllBatches', this.adminController.deleteAllBatches);
        this.router.post('/deleteAllOrders', this.adminController.deleteAllOrders);
        this.router.post('/deleteAllProgresses', this.adminController.deleteAllProgresses);
    }
}
exports.default = AdminRouter;
