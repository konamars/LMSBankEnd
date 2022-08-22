import { Router } from 'express';
import CourseController from '../controllers/course/course.controller';
import { verifyToken } from '../utils/verify';
import AdminController from '../controllers/admin/admin.controller';

class AdminRouter {
  public router: Router = Router();
  private adminController: AdminController = new AdminController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/addAdmin', this.adminController.createAdmin);
    this.router.post('/authenticate', this.adminController.authenticate);
    this.router.post('/addInstructor',verifyToken, this.adminController.createInstructor);
    this.router.put('/updateInstructor',verifyToken, this.adminController.editInstructor);
    this.router.delete('/deleteInstructor/:instructorId', verifyToken,this.adminController.removeInstructor);
    this.router.get('/allInstructors', verifyToken,this.adminController.allInstructors);
    this.router.get('/getInstructorById/:instructorId', verifyToken,this.adminController.getInstructorById);
    this.router.post('/addCourse', verifyToken,this.adminController.createCourse);
    this.router.get('/allCourses', verifyToken,this.adminController.allCourses);
    this.router.delete('/deleteCourse/:courseId', verifyToken,this.adminController.removeCourse);
    this.router.delete('/deleteProgress/:id', verifyToken,this.adminController.removeProgress);
    this.router.get('/getCourseById/:courseId', verifyToken,this.adminController.getCourseById);
    this.router.get('/getBatchById/:batchId', verifyToken,this.adminController.getBatchById);
    this.router.post('/getBatchDetailById', verifyToken,this.adminController.getBatchDetailById);
    this.router.get('/getStudentsBasedOnBatch/:courseId', verifyToken,this.adminController.getStudentsBasedOnBatch);
    this.router.put('/updateCourse', verifyToken,this.adminController.editCourse);
    this.router.post('/allCourseBatches', verifyToken,this.adminController.allCourseBatches);
    this.router.get('/completedCourseBatches', verifyToken,this.adminController.completedCourseBatches);
    this.router.put('/updateLiveClassLink', verifyToken,this.adminController.updateLiveClassLink);
    this.router.get('/getCourseBatchById/:courseId', verifyToken,this.adminController.getCourseBatchById);
    this.router.post('/suspendUser',verifyToken, this.adminController.suspendUser);
    this.router.post('/addUser',verifyToken, this.adminController.createUser);
    this.router.put('/updateUser',verifyToken, this.adminController.editUser);
    this.router.delete('/deleteUser/:userId', verifyToken,this.adminController.removeUser);
    this.router.get('/getUserById/:userId', verifyToken,this.adminController.getUserById);
    this.router.post('/allUsers', verifyToken,this.adminController.allUsers);
    this.router.get('/registeredUsers', verifyToken,this.adminController.registeredUsers);
    this.router.put('/updateCourseBatch', verifyToken,this.adminController.updateCourseBatch);
    this.router.put('/updateCourseBatchDetail', verifyToken,this.adminController.updateCourseBatchDetail);
    this.router.post('/addAssessment', verifyToken,this.adminController.createAssessment);
    this.router.get('/allAssessments', verifyToken,this.adminController.allAssessments);
    this.router.delete('/deleteAssessment/:assessmentId', verifyToken,this.adminController.removeAssessment);
    this.router.put('/updateAssessment', verifyToken,this.adminController.editAssessment);
    this.router.get('/getAssessmentById/:assessmentId', verifyToken,this.adminController.getAssessmentById);
    this.router.post('/createUpdateDeleteAssignment', verifyToken,this.adminController.createOrUpdateOrDeleteAssignment);
    this.router.get('/getFeedbacksByBatchId/:batchId', this.adminController.getFeedbacksByBatchId);
    this.router.delete('/deleteProject/:batchId/:projectId', this.adminController.removeProject);
    this.router.put('/updateFeedbackFlag', this.adminController.updateFeedbackFlag);
    this.router.post('/addBatch', verifyToken,this.adminController.createBatch);
    this.router.post('/deleteAllBatches',this.adminController.deleteAllBatches);
    this.router.post('/deleteAllOrders',this.adminController.deleteAllOrders);
    this.router.post('/deleteAllProgresses',this.adminController.deleteAllProgresses);
  }
}

export default AdminRouter;