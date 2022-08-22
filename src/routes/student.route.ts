import { Router } from 'express';
import StudentController from '../controllers/student/student.controller';
import { verifyToken } from '../utils/verify';

class StudentRouter {
  public router: Router = Router();
  private studentController: StudentController = new StudentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void { 
    this.router.get('/me', verifyToken, this.studentController.getStudentById);
    this.router.post('/create', this.studentController.createStudent);
    this.router.post('/authenticate', this.studentController.authenticate);
    this.router.post('/createOrder',verifyToken, this.studentController.createOrder);
    this.router.get('/getOrdersForStudent',verifyToken,this.studentController.getOrdersByStudentId);
    // this.router.get('/recommendedCourses',verifyToken,this.studentController.getRecommendedCourses);
    this.router.post('/createOrderId',verifyToken, this.studentController.createOrderId);
    this.router.get('/getCourseProgress/:id',verifyToken, this.studentController.getCourseProgress);
    this.router.get('/updateCourseProgressStatus/:id',verifyToken, this.studentController.updateStatusForCoureProgress);
    this.router.post('/edit',verifyToken, this.studentController.editStudentDetails);
    this.router.post('/changePassword',verifyToken, this.studentController.changePassword);
    this.router.get('/getInvoices',verifyToken, this.studentController.getInvoicesByStudentId);
    this.router.post('/updateProfilePic',verifyToken, this.studentController.updateStudentProfilePic);
    this.router.post('/sendEmail', this.studentController.sendEmail);
    this.router.post('/resetPassword', this.studentController.resetPassword);
    this.router.post('/addFeedback', verifyToken ,this.studentController.addFeedback);
    this.router.post('/getFeedback', verifyToken, this.studentController.getFeedbackDetails);
    this.router.post('/uploadAssignment', verifyToken, this.studentController.uploadAssignment);
    this.router.post('/sendAndStoreAssignment', this.studentController.sendAndStoreAssignment);
  }
}

export default StudentRouter;
