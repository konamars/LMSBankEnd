"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_controller_1 = __importDefault(require("../controllers/student/student.controller"));
const verify_1 = require("../utils/verify");
class StudentRouter {
    constructor() {
        this.router = express_1.Router();
        this.studentController = new student_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/me', verify_1.verifyToken, this.studentController.getStudentById);
        this.router.post('/create', this.studentController.createStudent);
        this.router.post('/authenticate', this.studentController.authenticate);
        this.router.post('/createOrder', verify_1.verifyToken, this.studentController.createOrder);
        this.router.get('/getOrdersForStudent', verify_1.verifyToken, this.studentController.getOrdersByStudentId);
        // this.router.get('/recommendedCourses',verifyToken,this.studentController.getRecommendedCourses);
        this.router.post('/createOrderId', verify_1.verifyToken, this.studentController.createOrderId);
        this.router.get('/getCourseProgress/:id', verify_1.verifyToken, this.studentController.getCourseProgress);
        this.router.get('/updateCourseProgressStatus/:id', verify_1.verifyToken, this.studentController.updateStatusForCoureProgress);
        this.router.post('/edit', verify_1.verifyToken, this.studentController.editStudentDetails);
        this.router.post('/changePassword', verify_1.verifyToken, this.studentController.changePassword);
        this.router.get('/getInvoices', verify_1.verifyToken, this.studentController.getInvoicesByStudentId);
        this.router.post('/updateProfilePic', verify_1.verifyToken, this.studentController.updateStudentProfilePic);
        this.router.post('/sendEmail', this.studentController.sendEmail);
        this.router.post('/resetPassword', this.studentController.resetPassword);
        this.router.post('/addFeedback', verify_1.verifyToken, this.studentController.addFeedback);
        this.router.post('/getFeedback', verify_1.verifyToken, this.studentController.getFeedbackDetails);
        this.router.post('/uploadAssignment', verify_1.verifyToken, this.studentController.uploadAssignment);
        this.router.post('/sendAndStoreAssignment', this.studentController.sendAndStoreAssignment);
    }
}
exports.default = StudentRouter;
