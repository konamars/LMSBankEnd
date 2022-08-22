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
const instructor_model_1 = __importDefault(require("../../models/instructor/instructor.model"));
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = __importDefault(require("../../config"));
const order_model_1 = __importDefault(require("../../models/student/order.model"));
const course_model_1 = __importDefault(require("../../models/course/course.model"));
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const course_batch_model_1 = __importDefault(require("../../models/course/course-batch.model"));
const course_progress_1 = __importDefault(require("../../models/student/course-progress"));
const student_model_1 = __importDefault(require("../../models/student/student.model"));
const admin_model_1 = __importDefault(require("../../models/admin.model"));
const uuid_1 = __importDefault(require("uuid"));
const assessment_model_1 = __importDefault(require("../../models/course/assessment.model"));
const awsS3_service_1 = require("../../services/awsS3.service");
const common_service_1 = require("../../services/common.service");
const feedback_model_1 = __importDefault(require("../../models/course/feedback.model"));
const sequence_model_1 = __importDefault(require("../../models/sequence.model"));
// Admin Controller
class AdminController {
    constructor() {
        this.awsS3Service = new awsS3_service_1.AWSS3Service();
        this.createToken = (user) => {
            const expiresIn = 60 * 60; // an hour
            const dataStoredInToken = {
                _id: user._id,
                time: user["lastLoggedIn"],
                isAdmin: true
            };
            return jsonwebtoken_1.sign(dataStoredInToken, config_1.default.JWT_SECRET, { expiresIn });
        };
        this.authenticate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const usernameMatched = yield admin_model_1.default.findOne({
                    username: req.body.username,
                });
                if (usernameMatched) {
                    const comparePassword = yield bcryptjs_1.compare(req.body.password, usernameMatched["password"]);
                    if (comparePassword) {
                        const updateTimesstamp = yield admin_model_1.default.findOneAndUpdate({ _id: usernameMatched["_id"] }, { $set: { lastLoggedIn: moment_1.default().unix() } }, { new: true });
                        console.log(updateTimesstamp);
                        if (updateTimesstamp) {
                            const tokenData = this.createToken(updateTimesstamp);
                            res.status(200).json({
                                auth: true,
                                token: tokenData,
                                name: usernameMatched["username"],
                            });
                        }
                    }
                    else {
                        res.status(409).json({ password: true });
                    }
                }
                else {
                    res.status(409).json({ username: true });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createAdmin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.body.secret == "Digitallync_client") {
                try {
                    const hashedPassword = yield bcryptjs_1.hash(req.body.password, 10);
                    const requestBody = {
                        username: req.body["username"],
                        password: hashedPassword,
                        lastLoggedIn: moment_1.default().unix(),
                    };
                    const user = yield admin_model_1.default.create(requestBody);
                    if (user) {
                        res.status(201).json("done");
                    }
                }
                catch (error) {
                    console.log(error);
                    res.status(500).json(error);
                }
            }
            else {
                res.status(409).json({ secret: true });
            }
        });
        this.createInstructor = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const emailMatched = yield instructor_model_1.default.findOne({
                    email: req.body.email,
                });
                if (emailMatched) {
                    res.status(409).json({ email: true });
                }
                else {
                    const hashedPassword = yield bcryptjs_1.hash(req.body.password, 10);
                    const requestBody = Object.assign({}, req.body, { password: hashedPassword, lastLoggedIn: moment_1.default().unix() });
                    const user = yield instructor_model_1.default.create(requestBody);
                    if (user) {
                        res.status(201).json("done");
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.removeInstructor = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield instructor_model_1.default.findByIdAndDelete(req.params.instructorId);
                if (status) {
                    res.status(200).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.editInstructor = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const request = Object.assign({}, req.body);
                request["password"] ? delete request["password"] : null;
                const updated = yield instructor_model_1.default.findByIdAndUpdate(req.body.instructorId, { $set: Object.assign({}, request) });
                if (updated) {
                    res.status(200).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.allInstructors = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const instructors = yield instructor_model_1.default.find({});
                if (instructors) {
                    res.status(200).json(instructors);
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getInstructorById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const instructor = yield instructor_model_1.default.findById(req.params.instructorId);
                if (instructor) {
                    res.status(200).json({
                        username: instructor["username"],
                        email: instructor["email"],
                        _id: instructor["_id"],
                    });
                }
                else {
                    res.status(404).json("not Found");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createCourse = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const isCourseExist = yield course_model_1.default.findOne({ title: req.body.title });
                if (isCourseExist) {
                    res.status(409).send('Already exist');
                }
                else {
                    const course = yield course_model_1.default.create(req.body);
                    if (course) {
                        res.status(201).json("done");
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.allCourses = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const courses = yield course_model_1.default.find({});
                if (courses) {
                    res.status(200).json(courses);
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.removeCourse = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield course_model_1.default.findByIdAndDelete(req.params.courseId);
                if (status) {
                    res.status(200).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.removeProgress = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield course_progress_1.default.findByIdAndDelete(req.params.id);
                if (status) {
                    let updated = yield order_model_1.default.findByIdAndUpdate(status['orderId'], { $set: { isAllocated: false } });
                    if (updated) {
                        res.status(200).json("done");
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.editCourse = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield course_model_1.default.updateOne({ _id: req.body.courseId }, { $set: Object.assign({}, req.body) });
                if (updated) {
                    res.status(200).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getCourseById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const instructor = yield course_model_1.default.findById(req.params.courseId);
                if (instructor) {
                    res.status(200).json({
                        basic: {
                            title: instructor["title"],
                            mainDescription: instructor["mainDescription"],
                            imageURL: instructor["imageURL"],
                            features: instructor["features"],
                            price: instructor["price"],
                            category: instructor["category"],
                            duration: instructor["duration"],
                            prerequisties: instructor["prerequisties"],
                            skillLevel: instructor["skillLevel"]
                        },
                        curriculum: instructor["curriculum"],
                        faqs: instructor["faqs"],
                    });
                }
                else {
                    res.status(404).json("not Found");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getBatchById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const batch = yield course_batch_model_1.default.findById(req.params.batchId);
                if (batch) {
                    res.status(200).json({
                        curriculum: batch["curriculum"],
                        basic: {
                            courseId: batch["courseId"],
                            projects: batch["projects"],
                            isFeedbackEnabled: batch["isFeedbackEnabled"],
                            isActive: batch["isActive"],
                            isCompleted: batch["isCompleted"],
                            upcomingClassDate: batch["upcomingClassDate"],
                            upcomingClassZoomLink: batch["upcomingClassZoomLink"],
                        },
                    });
                }
                else {
                    res.status(404).json("not Found");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getBatchDetailById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const PAGE_SIZE = req.body.size || 5;
                const batch = yield course_batch_model_1.default.findById(req.body.id);
                const details = yield Promise.all([1, 2].map((a) => __awaiter(this, void 0, void 0, function* () {
                    if (a === 1) {
                        if (batch) {
                            let students = yield course_progress_1.default.aggregate([{ $match: { batchId: mongoose_1.Types.ObjectId(batch["_id"]) } },
                                {
                                    $lookup: {
                                        from: "students",
                                        localField: "studentId",
                                        foreignField: "_id",
                                        as: "studentDetails",
                                    },
                                },
                                {
                                    $unwind: {
                                        path: "$studentDetails",
                                        preserveNullAndEmptyArrays: true,
                                    },
                                },
                                {
                                    $project: {
                                        firstname: "$studentDetails.firstname",
                                        lastname: "$studentDetails.lastname",
                                        batchId: "$batchId",
                                        courseId: "$courseId",
                                        isAssigned: "$isAssigned",
                                        isStarted: "$isStarted",
                                        isSuspended: "$isSuspended",
                                        orderId: "$orderId",
                                        studentId: "$studentId",
                                        progressId: "$_id",
                                        _id: "$_id"
                                    },
                                },
                                { $sort: { _id: -1 } },
                                { $skip: ((req.body.page + 1) - 1) * PAGE_SIZE },
                                { $limit: PAGE_SIZE },]);
                            return {
                                courseId: batch["courseId"],
                                instructorId: batch["instructorId"],
                                students,
                                endDate: batch["endDate"],
                                startTime: batch["startTime"],
                                endTime: batch["endTime"],
                                status: batch['status'],
                                startedDate: batch["startedDate"],
                            };
                        }
                    }
                    else {
                        return yield course_progress_1.default.count({ batchId: batch["_id"] });
                    }
                })));
                res.status(200).json({
                    data: details[0],
                    total: details[1]
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getStudentsBasedOnBatch = (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.params.courseId);
            try {
                let users = yield order_model_1.default.aggregate([
                    {
                        $match: {
                            courseId: mongoose_1.Types.ObjectId(req.params.courseId),
                            isAllocated: false
                        }
                    },
                    {
                        $lookup: {
                            from: "students",
                            localField: "studentId",
                            foreignField: "_id",
                            as: "studentDetails",
                        },
                    },
                    {
                        $unwind: {
                            path: "$studentDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            firstname: "$studentDetails.firstname",
                            lastname: "$studentDetails.lastname",
                            email: "$studentDetails.email",
                            phone: "$studentDetails.phone",
                            createdAt: "$createdAt",
                            studentId: "$studentId",
                            courseId: "$courseId",
                            orderId: "$_id",
                            _id: "$_id"
                        },
                    }
                ]);
                if (users) {
                    res.status(200).json(users.filter(user => !!user.email));
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.suspendUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let updated = yield course_progress_1.default.findByIdAndUpdate(req.body.id, { $set: { isSuspended: req.body['isSuspended'] } });
                console.log(updated);
                if (updated) {
                    res.status(200).json('done');
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.allCourseBatches = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const PAGE_SIZE = req.body.size || 5;
                const courses = yield Promise.all([1, 2].map((a) => __awaiter(this, void 0, void 0, function* () {
                    return a === 1 ? yield course_batch_model_1.default.aggregate([
                        {
                            $match: {
                                status: { $ne: 'Completed' }
                            }
                        },
                        {
                            $lookup: {
                                from: "courses",
                                localField: "courseId",
                                foreignField: "_id",
                                as: "courseDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$courseDetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                title: "$courseDetails.title",
                                createdDate: "$createdAt",
                                id: "$_id",
                                endDate: "$endDate",
                                startedDate: "$startedDate",
                                startTime: "$startTime",
                                endTime: "$endTime",
                                batch_id: "$id",
                                status: "$status"
                            },
                        },
                        { $sort: { _id: -1 } },
                        { $skip: ((req.body.page + 1) - 1) * PAGE_SIZE },
                        { $limit: PAGE_SIZE },
                    ]) : yield course_batch_model_1.default.count({ status: { $ne: 'Completed' } });
                })));
                if (courses) {
                    let data = yield Promise.all(courses[0].map((c) => __awaiter(this, void 0, void 0, function* () {
                        let count = yield course_progress_1.default.count({ batchId: c["id"] });
                        return Object.assign({}, c, { studentsCount: count });
                    })));
                    res.status(200).json({
                        data,
                        total: courses[1]
                    });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.completedCourseBatches = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const courses = yield course_batch_model_1.default.aggregate([
                    {
                        $match: {
                            status: { $eq: 'Completed' }
                        }
                    },
                    {
                        $lookup: {
                            from: "courses",
                            localField: "courseId",
                            foreignField: "_id",
                            as: "courseDetails",
                        },
                    },
                    {
                        $unwind: {
                            path: "$courseDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            title: "$courseDetails.title",
                            createdDate: "$createdAt",
                            id: "$_id",
                            endDate: "$endDate",
                            startedDate: "$startedDate",
                            startTime: "$startTime",
                            endTime: "$endTime",
                            batch_id: "$id",
                            status: "$status"
                        },
                    },
                ]);
                if (courses) {
                    let data = yield Promise.all(courses.map((c) => __awaiter(this, void 0, void 0, function* () {
                        let count = yield course_progress_1.default.count({ batchId: c["id"] });
                        return Object.assign({}, c, { studentsCount: count });
                    })));
                    res.status(200).json(data.reverse());
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.updateLiveClassLink = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield course_batch_model_1.default.findByIdAndUpdate(req.body.id, {
                    $set: {
                        upcomingClassDate: req.body.date,
                        upcomingClassZoomLink: req.body.link,
                    },
                });
                if (updated) {
                    res.status(200).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getCourseBatchById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const course = yield course_batch_model_1.default.findById(req.params.courseId);
                if (course) {
                    res.status(200).json({
                        curriculum: course["curriculum"],
                        resources: course["resources"],
                        assignments: course["assignments"],
                        projects: course["projects"],
                        upcomingClassDate: course["upcomingClassDate"],
                        upcomingClassZoomLink: course["upcomingClassZoomLink"],
                        isFeedbackEnabled: course["isFeedbackEnabled"],
                    });
                }
                else {
                    res.status(404).json("not Found");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.updateCourseBatch = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let request = Object.assign({}, req.body, (req.body["projects"] && {
                    projects: req.body["projects"].map((p) => (Object.assign({}, (!p["id"] && { id: uuid_1.default() }), p))),
                }));
                let updated = yield course_batch_model_1.default.updateOne({ _id: req.body.batchId }, { $set: Object.assign({}, request) });
                if (updated) {
                    res.status(200).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createAssessment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const assessment = yield assessment_model_1.default.create(req.body);
                if (assessment) {
                    res.status(201).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.allAssessments = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const assessments = yield assessment_model_1.default.find({});
                if (assessments) {
                    res.status(200).json(assessments);
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.removeAssessment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield assessment_model_1.default.findByIdAndDelete(req.params.assessmentId);
                if (status) {
                    res.status(200).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.editAssessment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield assessment_model_1.default.updateOne({ _id: req.body.assessmentId }, { $set: Object.assign({}, req.body) });
                if (updated) {
                    res.status(200).json("done");
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
                    res.status(404).json("not Found");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createOrUpdateOrDeleteAssignment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const checkBatch = yield course_batch_model_1.default.findById(req.body.batchId);
                let isCurriculumPresent = false;
                let isTopicPresent = false;
                let curriculumIndex;
                let topicIndex;
                if (checkBatch) {
                    checkBatch.curriculum.forEach((curriculum, i) => {
                        curriculum.topics.forEach((topic, j) => {
                            if (topic._id == req.body.topicId) {
                                isCurriculumPresent = true;
                                curriculumIndex = i;
                                isTopicPresent = true;
                                topicIndex = j;
                            }
                        });
                    });
                    if (isCurriculumPresent && isTopicPresent) {
                        let awsResponse;
                        if (req["files"]["file"]) {
                            const token = yield common_service_1.commonService.generateRandomBytes(4);
                            const fileName = req["files"]["file"].originalFilename;
                            awsResponse = yield this.awsS3Service.uploadFile(req["files"]["file"], `${token}-${fileName}`, "Assignments");
                        }
                        if (req.body.isDelete === "true") {
                            checkBatch.curriculum[curriculumIndex].topics[topicIndex].assignments.splice(topicIndex, 1);
                        }
                        else if (req.body.assignmentId !== "undefined") {
                            checkBatch.curriculum[curriculumIndex].topics[topicIndex].assignments.forEach((r) => {
                                if (r._id == req.body.assignmentId) {
                                    r.title = req.body.title;
                                    r.submitOn = req.body.submitOn;
                                    r.instructions = req.body.instructions;
                                    r.instructorMailId = req.body.instructorMailId;
                                    r.solution = {
                                        content: req.body.content,
                                        fileLink: awsResponse && awsResponse.Location
                                            ? awsResponse.Location
                                            : req.body.file,
                                    };
                                }
                            });
                        }
                        else {
                            checkBatch.curriculum[curriculumIndex].topics[topicIndex].assignments.push({
                                title: req.body.title,
                                submitOn: req.body.submitOn,
                                instructions: req.body.instructions,
                                instructorMailId: req.body.instructorMailId,
                                solution: {
                                    content: req.body.content,
                                    fileLink: awsResponse && awsResponse.Location
                                        ? awsResponse.Location
                                        : "",
                                },
                            });
                        }
                        checkBatch.markModified("topics");
                        const course = yield checkBatch.save();
                        res.status(200).json({
                            status: 1,
                            data: course.curriculum[curriculumIndex].topics[topicIndex].assignments,
                        });
                    }
                    else {
                        res.status(200).json({
                            status: 0,
                            data: { error: "Invalid curriculum or topic id" },
                        });
                    }
                }
                else {
                    res
                        .status(200)
                        .json({ status: 0, data: { error: "Invalid course id" } });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const emailMatched = yield student_model_1.default.findOne({
                    email: req.body.email,
                });
                if (emailMatched) {
                    res.status(409).json({ email: true });
                }
                else {
                    const phoneMatched = yield student_model_1.default.findOne({
                        phone: req.body.phone,
                    });
                    if (phoneMatched) {
                        res.status(409).json({ phone: true });
                    }
                    else {
                        const hashedPassword = yield bcryptjs_1.hash(req.body.password, 10);
                        const requestBody = Object.assign({}, req.body, { password: hashedPassword, lastLoggedIn: moment_1.default().unix(), lastUpdatedAt: Date.now() });
                        const user = yield student_model_1.default.create(requestBody);
                        if (user) {
                            res.status(201).json({
                                firstname: user["firstname"],
                                lastname: user["lastname"],
                            });
                        }
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.removeUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const status = yield student_model_1.default.findByIdAndDelete(req.params.userId);
                if (status) {
                    res.status(200).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.editUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const request = Object.assign({}, req.body);
                request["password"] ? delete request["password"] : null;
                const updated = yield student_model_1.default.findByIdAndUpdate(req.body.userId, {
                    $set: Object.assign({}, request, { lastUpdatedAt: Date.now() }),
                });
                if (updated) {
                    res.status(200).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getUserById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield student_model_1.default.findById(req.params.userId);
                if (user) {
                    res.status(200).json({ user });
                }
                else {
                    res.status(404).json("not Found");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.allUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const PAGE_SIZE = req.body.size || 5;
                const users = yield Promise.all([1, 2].map((a) => __awaiter(this, void 0, void 0, function* () {
                    return a === 1 ? yield student_model_1.default.aggregate([
                        { $match: {} },
                        { $sort: { _id: -1 } },
                        { $skip: ((req.body.page + 1) - 1) * PAGE_SIZE },
                        { $limit: PAGE_SIZE },
                    ]) : yield student_model_1.default.count({});
                })));
                res.status(200).json({
                    data: users[0],
                    total: users[1]
                });
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getFeedbacksByBatchId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const feedbacks = yield feedback_model_1.default.aggregate([
                    {
                        $match: {
                            batchId: mongoose_1.Types.ObjectId(req.params.batchId),
                        },
                    },
                    {
                        $lookup: {
                            from: "students",
                            localField: "studentId",
                            foreignField: "_id",
                            as: "studentDetails",
                        },
                    },
                    {
                        $unwind: {
                            path: "$studentDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            firstname: "$studentDetails.firstname",
                            lastname: "$studentDetails.lastname",
                            email: "$studentDetails.email",
                            phone: "$studentDetails.phone",
                            rating: "$rating",
                            review: "$review",
                            createdAt: "$createdAt",
                        },
                    },
                ]);
                if (feedbacks) {
                    res.status(200).json({ status: 1, data: feedbacks });
                }
                else {
                    res.status(200).json({ status: 0, data: "Data not found" });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.removeProject = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const batch = yield course_batch_model_1.default.findById(req.params["batchId"]);
                if (batch) {
                    let isDeleted = false;
                    batch.projects.forEach((project, index) => {
                        if (project.id === req.params["projectId"]) {
                            batch.projects.splice(index, 1);
                            isDeleted = true;
                        }
                    });
                    if (isDeleted) {
                        const updatedBatch = yield batch.save();
                        if (updatedBatch) {
                            res.status(200).json(updatedBatch);
                        }
                    }
                    else {
                        res.status(404).json({ data: "Project not found" });
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.updateFeedbackFlag = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let request = Object.assign({}, req.body);
                let updated = yield course_batch_model_1.default.updateOne({ _id: req.body.batchId }, { $set: { isFeedbackEnabled: req.body.isFeedbackEnabled } });
                if (updated) {
                    console.log(updated);
                    res.status(200).json("done");
                }
                else {
                    res.status(400).json("Failed");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getValueForNextSequence = (sequenceOfName) => __awaiter(this, void 0, void 0, function* () {
            let sequenceDoc = yield sequence_model_1.default.findOneAndUpdate({ name: sequenceOfName }, { $inc: { sequence_id: 1 } }, { new: true, upsert: true });
            return sequenceDoc.sequence_id;
        });
        this.createBatch = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const checkCourse = yield course_model_1.default.findById(req.body["courseId"]);
                if (checkCourse) {
                    let id = yield this.getValueForNextSequence(req.body["courseId"]);
                    const batch = yield course_batch_model_1.default.create(Object.assign({}, req.body, { id: `${req.body["courseName"].substring(0, 3)}${id}`, curriculum: checkCourse["curriculum"] }));
                    if (batch) {
                        if (req.body.students && req.body.students.length) {
                            let p = yield Promise.all(req.body.students.map((s) => __awaiter(this, void 0, void 0, function* () {
                                yield course_progress_1.default.create({
                                    studentId: s['studentId'],
                                    courseId: req.body["courseId"],
                                    batchId: batch["_id"],
                                    orderId: s['orderId']
                                });
                                yield order_model_1.default.findByIdAndUpdate(s['orderId'], { $set: { isAllocated: true } });
                                return s;
                            })));
                        }
                        res.status(201).json("done");
                    }
                }
                else {
                    res.sendStatus(404);
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.registeredUsers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let users = yield order_model_1.default.aggregate([
                    {
                        $lookup: {
                            from: "students",
                            localField: "studentId",
                            foreignField: "_id",
                            as: "studentDetails",
                        },
                    },
                    {
                        $unwind: {
                            path: "$studentDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: "courses",
                            localField: "courseId",
                            foreignField: "_id",
                            as: "courseDetails",
                        },
                    },
                    {
                        $unwind: {
                            path: "$courseDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            firstname: "$studentDetails.firstname",
                            lastname: "$studentDetails.lastname",
                            course: "$courseDetails.title",
                            createdAt: "$createdAt",
                            amount: "$totalPrice",
                            courseId: "$courseId",
                            studentId: "$studentId",
                            isAllocated: "$isAllocated"
                        },
                    },
                ]);
                res.status(200).json(users.reverse());
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.updateCourseBatchDetail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.body.students && req.body.students.length) {
                    yield Promise.all(req.body.students.map((s) => __awaiter(this, void 0, void 0, function* () {
                        yield course_progress_1.default.create({
                            studentId: s['studentId'],
                            courseId: req.body["courseId"],
                            batchId: req.body.batchId,
                            orderId: s['orderId']
                        });
                        yield order_model_1.default.findByIdAndUpdate(s['orderId'], { $set: { isAllocated: true } });
                        return s;
                    })));
                }
                let updated = yield course_batch_model_1.default.updateOne({ _id: req.body.batchId }, { $set: Object.assign({}, req.body) });
                if (updated) {
                    res.status(200).json("Done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.deleteAllProgresses = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.body.secret === 'DL_Admin_Remove') {
                try {
                    let deleted = yield course_progress_1.default.remove({});
                    if (deleted) {
                        res.sendStatus(200);
                    }
                }
                catch (error) {
                    console.log(error);
                    res.status(500).json(error);
                }
            }
            else {
                res.status(409).json({ secret: true });
            }
        });
        this.deleteAllBatches = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.body.secret === 'DL_Admin_Remove') {
                try {
                    let deleted = yield course_batch_model_1.default.remove({});
                    if (deleted) {
                        res.sendStatus(200);
                    }
                }
                catch (error) {
                    console.log(error);
                    res.status(500).json(error);
                }
            }
            else {
                res.status(409).json({ secret: true });
            }
        });
        this.deleteAllOrders = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (req.body.secret === 'DL_Admin_Remove') {
                try {
                    let deleted = yield order_model_1.default.remove({});
                    if (deleted) {
                        res.sendStatus(200);
                    }
                }
                catch (error) {
                    console.log(error);
                    res.status(500).json(error);
                }
            }
            else {
                res.status(409).json({ secret: true });
            }
        });
    }
}
exports.default = AdminController;
