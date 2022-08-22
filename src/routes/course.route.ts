import { Router } from 'express';
import CourseController from '../controllers/course/course.controller';
import { verifyToken } from '../utils/verify';
import {generateInvoice} from '../services/generateInvoice.service';
class CourseRouter {
  public router: Router = Router();
  private courseController: CourseController = new CourseController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/create', this.courseController.createCourse);
    this.router.get('/getCourseById/:courseId', verifyToken, this.courseController.getCourseById);
    this.router.get('/getAllCourses', verifyToken, this.courseController.getAllCourses);
    this.router.post('/createDiscussion', verifyToken, this.courseController.createDiscussion);
    this.router.post('/createProject', this.courseController.createProject);
    this.router.post('/createResource', this.courseController.createResource);
    this.router.post('/createAssignment', this.courseController.createAssignment);
    this.router.post('/uploadCurriculum', this.courseController.uploadCurriculum);
    this.router.post('/generateInvoice', generateInvoice.generateInvoice);
    this.router.post('/createResource', this.courseController.createResource);
    this.router.post('/addCoupon', this.courseController.addCoupon);
    this.router.get('/getAssessmentById/:assessmentId', verifyToken,this.courseController.getAssessmentById);
    this.router.post('/updateAssessmetByProgress', verifyToken,this.courseController.updateAssessmetByProgress);
  }
}

export default CourseRouter;