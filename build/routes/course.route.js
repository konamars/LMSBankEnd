"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = __importDefault(require("../controllers/course/course.controller"));
const verify_1 = require("../utils/verify");
const generateInvoice_service_1 = require("../services/generateInvoice.service");
class CourseRouter {
    constructor() {
        this.router = express_1.Router();
        this.courseController = new course_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/create', this.courseController.createCourse);
        this.router.get('/getCourseById/:courseId', verify_1.verifyToken, this.courseController.getCourseById);
        this.router.get('/getAllCourses', verify_1.verifyToken, this.courseController.getAllCourses);
        this.router.post('/createDiscussion', verify_1.verifyToken, this.courseController.createDiscussion);
        this.router.post('/createProject', this.courseController.createProject);
        this.router.post('/createResource', this.courseController.createResource);
        this.router.post('/createAssignment', this.courseController.createAssignment);
        this.router.post('/uploadCurriculum', this.courseController.uploadCurriculum);
        this.router.post('/generateInvoice', generateInvoice_service_1.generateInvoice.generateInvoice);
        this.router.post('/createResource', this.courseController.createResource);
        this.router.post('/addCoupon', this.courseController.addCoupon);
        this.router.get('/getAssessmentById/:assessmentId', verify_1.verifyToken, this.courseController.getAssessmentById);
        this.router.post('/updateAssessmetByProgress', verify_1.verifyToken, this.courseController.updateAssessmetByProgress);
    }
}
exports.default = CourseRouter;
