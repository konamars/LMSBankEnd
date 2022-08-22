"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const course_model_1 = __importDefault(require("../../models/course/course.model"));
const uuid_1 = __importDefault(require("uuid"));
const course_batch_model_1 = __importDefault(require("../../models/course/course-batch.model"));
const awsS3_service_1 = require("../../services/awsS3.service");
const common_service_1 = require("../../services/common.service");
const assessment_model_1 = __importDefault(require("../../models/course/assessment.model"));
const course_progress_1 = __importDefault(require("../../models/student/course-progress"));
class CourseController {
    constructor() {
        this.awsS3Service = new awsS3_service_1.AWSS3Service();
        this.createCourse = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let c = new course_model_1.default(Object.assign({}, req.body));
                const course = yield c.save();
                if (course) {
                    res.status(201).json('created');
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getAllCourses = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const allCourses = yield course_model_1.default.find();
                if (allCourses) {
                    res.status(200).json(allCourses);
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getCourseById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const course = yield course_model_1.default.findById(req.params.courseId);
                if (course) {
                    res.status(200).json(course);
                }
                else {
                    res.status(404).json('No course found');
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createDiscussion = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const resource = yield course_batch_model_1.default.update({ _id: req.body['batchId'] }, { $push: { discussions: { label: req.body['label'], link: req.body['link'], id: uuid_1.default() } } });
                if (resource) {
                    res.status(200).json('done');
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createProject = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const batch = yield course_batch_model_1.default.findById(req.body['batchId']);
                if (batch) {
                    let awsLocation, resource;
                    if (req['files']['projectFile']) {
                        const token = yield common_service_1.commonService.generateRandomBytes(4);
                        const fileName = req['files']['projectFile'].originalFilename;
                        const awsResponse = yield this.awsS3Service.uploadFile(req['files']['projectFile'], `${token}-${fileName}`, 'Projects');
                        awsLocation = awsResponse.Location;
                    }
                    if (req.body.projectId !== 'undefined') {
                        resource = yield course_batch_model_1.default.update({ 'projects.id': req.body['projectId'] }, { $set: { 'projects.$.title': req.body['title'], 'projects.$.description': req.body['description'], 'projects.$.projectLink': awsLocation || req.body.projectFile } }, { upsert: true });
                    }
                    else {
                        resource = yield course_batch_model_1.default.updateOne({ _id: req.body['batchId'] }, { $push: { projects: { title: req.body['title'], description: req.body['description'], projectLink: awsLocation, id: uuid_1.default() } } });
                    }
                    if (resource) {
                        const batch = yield course_batch_model_1.default.findById(req.body['batchId']);
                        res.status(200).json({ status: 0, data: batch.projects });
                    }
                    else {
                        res.status(200).json({ status: 0, data: { error: 'Failed in adding' } });
                    }
                }
                else {
                    res.status(200).json({ status: 0, data: { error: 'Batch not available' } });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createAssignment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const resource = yield course_batch_model_1.default.updateOne({ _id: req.body['batchId'] }, { $push: { assignments: { title: req.body['title'], description: req.body['description'], submitOn: req.body['submitOn'], id: uuid_1.default() } } });
                if (resource) {
                    res.status(200).json('done');
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.uploadCurriculum = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if ('application/pdf'.includes(req['files']['curriculum'].type)) {
                    const course = yield course_model_1.default.findById(req.query.courseId);
                    if (course) {
                        const awsResponse = yield this.awsS3Service.uploadFile(req['files']['curriculum'], course.title + '.pdf', 'CourseCurriculums');
                        if (awsResponse) {
                            const courseResponse = yield course_model_1.default.findByIdAndUpdate(course._id, { $set: { curriculumLink: awsResponse.Location } }, { new: true });
                            if (courseResponse) {
                            }
                            res.status(200).json(courseResponse);
                        }
                    }
                    else {
                        res.status(200).json({ status: 0, data: { reason: 'Course not available' } });
                    }
                }
                else {
                    res.status(200).json({ status: 0, data: { reason: 'Supports only PDF format' } });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createResource = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const checkBatch = yield course_batch_model_1.default.findById(req.body.batchId);
                const token = yield common_service_1.commonService.generateRandomBytes();
                let isCurriculumPresent = false;
                let isTopicPresent = false;
                let curriculumIndex;
                let topicIndex;
                if (checkBatch) {
                    checkBatch.curriculum.forEach((curriculum, i) => {
                        if (curriculum._id == req.body.moduleId) {
                            isCurriculumPresent = true;
                            curriculumIndex = i;
                            curriculum.topics.forEach((topic, j) => {
                                if (topic._id == req.body.topicId) {
                                    isTopicPresent = true;
                                    topicIndex = j;
                                }
                            });
                        }
                    });
                    if (isCurriculumPresent && isTopicPresent) {
                        let awsLocation;
                        if (req['files']['fileLink']) {
                            const token = yield common_service_1.commonService.generateRandomBytes(4);
                            const fileName = req['files']['fileLink'].originalFilename;
                            const awsResponse = yield this.awsS3Service.uploadFile(req['files']['fileLink'], `${token}-${fileName}`, 'Resources');
                            awsLocation = awsResponse.Location;
                        }
                        if (req.body.isDelete === 'true') {
                            checkBatch.curriculum[curriculumIndex].topics[topicIndex].resources.splice(topicIndex, 1);
                        }
                        else if (req.body.resourceId !== 'undefined') {
                            checkBatch.curriculum[curriculumIndex].topics[topicIndex].resources.forEach((r) => {
                                if (r._id == req.body.resourceId) {
                                    r.fileTitle = req.body.fileTitle,
                                        r.fileLink = awsLocation || req.body.fileLink,
                                        r.referenceLink = req.body.referenceLink;
                                    r.referenceTitle = req.body.referenceTitle;
                                }
                            });
                        }
                        else {
                            checkBatch.curriculum[curriculumIndex].topics[topicIndex].resources.push({
                                fileTitle: req.body.fileTitle,
                                fileLink: awsLocation,
                                referenceTitle: req.body.referenceTitle,
                                referenceLink: req.body.referenceLink
                            });
                        }
                        checkBatch.markModified('topics');
                        const course = yield checkBatch.save();
                        res.status(200).json({ status: 1, data: course.curriculum[curriculumIndex].topics[topicIndex].resources });
                    }
                    else {
                        res.status(200).json({ status: 0, data: { error: 'Invalid curriculum or topic id' } });
                    }
                }
                else {
                    res.status(200).json({ status: 0, data: { error: 'Invalid course id' } });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.addCoupon = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const couponReq = {
                    isCouponEnabled: req.body.isCouponEnabled,
                    couponPercentage: req.body.couponPercentage
                };
                const couponRes = yield course_model_1.default.findByIdAndUpdate(req.body.courseId, { $set: { coupon: couponReq } }, { new: true });
                if (couponRes) {
                    res.status(200).json({ status: 1, data: couponRes });
                }
                else {
                    res.status(200).json({ status: 0, data: { error: 'Course not found' } });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getAssessmentById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const assessment = yield assessment_model_1.default.findById(req.params.assessmentId);
                if (assessment) {
                    res.status(200).json(assessment);
                }
                else {
                    res.status(404).json('not Found');
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.updateAssessmetByProgress = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield course_progress_1.default.update({ _id: req.body['id'] }, { $push: { completedAssessments: Object.assign({}, req.body['assessment']) } });
                if (updated) {
                    res.status(200).json('done');
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        // public downloadCurriculum = (req: Request, res: Response) => {
        //   const s3Instance = new AWS.S3({
        //       accessKeyId: config.AWS_S3_ACCESS_KEY,
        //       secretAccessKey: config.AWS_SECRET_ACCESS_KEY
        //   });
        //   const params = {
        //     Bucket: config.AWS_S3_BUCKET_NAME,
        //     Key: 'AWS.jpg',
        //   };
        //   s3Instance.getObject(params, (awsError: any, awsResponse: any) => {
        //       // fs.unlink(file.path, (err) => {
        //       //     if (err) {
        //       //         console.error(err);
        //       //     }
        //       //     console.log('Temp File Delete');
        //       // });
        //       if (awsError) {
        //           console.log(awsError);
        //           res.status(500).json('Failed');
        //       } else {
        //           res.status(200)
        //           res.json(new TextDecoder('utf-8').decode(awsResponse.Body));
        //       }
        //   })
        // }
    }
}
exports.default = CourseController;
