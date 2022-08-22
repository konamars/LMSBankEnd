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
const student_model_1 = __importDefault(require("../../models/student/student.model"));
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = __importDefault(require("../../config"));
const order_model_1 = __importDefault(require("../../models/student/order.model"));
const course_model_1 = __importDefault(require("../../models/course/course.model"));
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = require("mongoose");
const razorpay_1 = __importDefault(require("razorpay"));
const course_progress_1 = __importDefault(require("../../models/student/course-progress"));
const generateInvoice_service_1 = require("../../services/generateInvoice.service");
const awsS3_service_1 = require("../../services/awsS3.service");
const common_service_1 = require("../../services/common.service");
const emailSender_service_1 = require("../../services/emailSender.service");
const feedback_model_1 = __importDefault(require("../../models/course/feedback.model"));
const student_assignment_model_1 = __importDefault(require("../../models/student/student-assignment.model"));
class StudentController {
    constructor() {
        this.awsS3Service = new awsS3_service_1.AWSS3Service();
        this.rpInstance = new razorpay_1.default({
            key_id: "rzp_test_VUfGujc6qEAj1x",
            key_secret: "rvK3lTxhHRlyj2DcvH1AC4tB",
        });
        this.createOrderId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const course = yield course_model_1.default.findById(req.body["courseId"]);
                if (course) {
                    const order = yield this.rpInstance.orders.create({
                        amount: req.body.totalPrice * 100,
                        currency: "INR",
                        receipt: "re1",
                        payment_capture: "0",
                    });
                    res.status(200).json(order["id"]);
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createToken = (user) => {
            const expiresIn = 60 * 60; // an hour
            const dataStoredInToken = {
                _id: user._id,
                time: user["lastLoggedIn"],
            };
            return jsonwebtoken_1.sign(dataStoredInToken, config_1.default.JWT_SECRET, { expiresIn });
        };
        this.createStudent = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
                            const tokenData = this.createToken(user);
                            res.status(201).json({
                                auth: true,
                                token: tokenData,
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
        this.authenticate = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const emailMatched = yield student_model_1.default.findOne({
                    email: req.body.email,
                });
                if (emailMatched) {
                    const comparePassword = yield bcryptjs_1.compare(req.body.password, emailMatched["password"]);
                    if (comparePassword) {
                        const updateTimesstamp = yield student_model_1.default.findOneAndUpdate({ _id: emailMatched["_id"] }, { $set: { lastLoggedIn: moment_1.default().unix() } }, { new: true });
                        if (updateTimesstamp) {
                            const tokenData = this.createToken(updateTimesstamp);
                            res.status(200).json({
                                auth: true,
                                token: tokenData,
                                firstname: emailMatched["firstname"],
                                lastname: emailMatched["lastname"],
                                isActive: updateTimesstamp["isActive"],
                            });
                        }
                    }
                    else {
                        res.status(409).json({ password: true });
                    }
                }
                else {
                    res.status(409).json({ email: true });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getStudentById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const studentDetails = yield student_model_1.default.findById(req["tokenId"], {
                    password: 0,
                });
                if (studentDetails) {
                    res.status(200).json({
                        firstname: studentDetails["firstname"],
                        lastname: studentDetails["lastname"],
                        email: studentDetails["email"],
                        phone: studentDetails["phone"],
                        profilePicture: studentDetails["profilePicture"],
                    });
                }
                else {
                    res.status(404).json({ student: true });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.createOrder = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let batchId;
                let awsResponse = "";
                let invoice;
                const studentDetails = yield student_model_1.default.findById(req["tokenId"], {
                    password: 0,
                });
                const courseDetails = yield course_model_1.default.findById(req.body["courseId"]);
                invoice = yield generateInvoice_service_1.generateInvoice.generateInvoice(studentDetails, [
                    courseDetails,
                ]);
                if (invoice && invoice.data === "Generated") {
                    awsResponse = yield this.awsS3Service.uploadFile({ path: "./invoiceBuilder.pdf" }, common_service_1.commonService.generateRandom(10) + ".pdf", "Invoices");
                }
                const order = yield order_model_1.default.create({
                    studentId: req["tokenId"],
                    courseId: req.body["courseId"],
                    paymentId: req.body["paymentId"],
                    invoiceLink: awsResponse.Location,
                    totalPrice: req.body["totalPrice"],
                    createdAt: new Date(),
                });
                if (order) {
                    res.status(201).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getOrdersByStudentId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield order_model_1.default.aggregate([
                    {
                        $match: {
                            studentId: mongoose_1.Types.ObjectId(req["tokenId"]),
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
                            title: "$courseDetails.title",
                            description: "$courseDetails.mainDescription",
                            imageURL: "$courseDetails.imageURL",
                            rating: "$courseDetails.rating",
                            courseId: "$courseId",
                            id: "$_id"
                        },
                    },
                ]);
                if (orders) {
                    let o = yield Promise.all(orders.map((or) => __awaiter(this, void 0, void 0, function* () {
                        let detail = yield course_progress_1.default.findOne({ studentId: req['tokenId'], orderId: or['id'], courseId: or['courseId'] });
                        if (detail) {
                            return Object.assign({}, or, { status: detail['isSuspended'] ? 'suspended' : detail['isStarted'] ? 'started' : 'assigned' }, !detail['isSuspended'] && { progressId: detail['_id'] });
                        }
                        else {
                            return Object.assign({}, or, { status: 'not_assigned' });
                        }
                    })));
                    res.status(200).json(o);
                }
                else {
                    res.status(404).json("not found");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getCourseProgress = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield course_progress_1.default.aggregate([
                    {
                        $match: {
                            studentId: mongoose_1.Types.ObjectId(req["tokenId"]),
                            _id: mongoose_1.Types.ObjectId(req.params["id"]),
                            isSuspended: false
                        },
                    },
                    {
                        $lookup: {
                            from: "batches",
                            localField: "batchId",
                            foreignField: "_id",
                            as: "batchDetails",
                        },
                    },
                    {
                        $unwind: {
                            path: "$batchDetails",
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
                            title: "$courseDetails.title",
                            imageURL: "$courseDetails.imageURL",
                            rating: "$courseDetails.rating",
                            courseId: "$courseId",
                            studentId: "$studentId",
                            batchId: "$batchId",
                            curriculum: "$batchDetails.curriculum",
                            isCompleted: "$batchDetails.isCompleted",
                            isActive: "$batchDetails.isActive",
                            id: "$_id",
                            upcomingClassDate: "$batchDetails.upcomingClassDate",
                            upcomingClassZoomLink: "$batchDetails.upcomingClassZoomLink",
                            resources: "$batchDetails.resources",
                            assignments: "$batchDetails.assignments",
                            discussions: "$batchDetails.discussions",
                            projects: "$batchDetails.projects",
                            startedDate: "$batchDetails.createdAt",
                            isStarted: "$isStarted",
                            isFeedbackEnabled: "$batchDetails.isFeedbackEnabled",
                            completedAssessments: "$completedAssessments",
                            duration: "$courseDetails.duration",
                            prerequisties: "$courseDetails.prerequisties",
                            skillLevel: "$courseDetails.skillLevel",
                        },
                    },
                ]);
                if (orders) {
                    res.status(200).json(orders);
                }
                else {
                    res.status(404).json("not found");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.updateStatusForCoureProgress = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const updated = yield course_progress_1.default.updateOne({
                    studentId: req["tokenId"],
                    _id: req.params["id"],
                }, { $set: { isStarted: true } });
                if (updated) {
                    res.status(200).json("done");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.editStudentDetails = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const editStudentDetails = yield student_model_1.default.findByIdAndUpdate(req["tokenId"], { $set: req.body }, { new: true });
                if (editStudentDetails)
                    res.status(200).json(editStudentDetails);
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.changePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const student = yield student_model_1.default.findById(req["tokenId"]);
                if (student) {
                    const comparePassword = yield bcryptjs_1.compare(req.body.password, student["password"]);
                    if (comparePassword) {
                        const hashedPassword = yield bcryptjs_1.hash(req.body.newPassword, 10);
                        if (hashedPassword) {
                            const updatedStudent = yield student_model_1.default.findByIdAndUpdate(req["tokenId"], { $set: { password: hashedPassword } });
                            if (updatedStudent) {
                                res.status(200).json("updated successfully");
                            }
                        }
                    }
                    else {
                        res.status(409).json({ passwordInvalid: true });
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getInvoicesByStudentId = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield order_model_1.default.aggregate([
                    {
                        $match: {
                            studentId: mongoose_1.Types.ObjectId(req["tokenId"]),
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
                            title: "$courseDetails.title",
                            imageURL: "$courseDetails.imageURL",
                            price: "$courseDetails.price",
                            id: "$_id",
                            orderedDate: "$createdAt",
                            invoiceLink: "$invoiceLink",
                            totalPrice: "$totalPrice",
                        },
                    },
                ]);
                if (orders) {
                    res.status(200).json(orders);
                }
                else {
                    res.status(404).json("not found");
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.updateStudentProfilePic = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const editStudentDetails = yield student_model_1.default.findByIdAndUpdate(req["tokenId"], { $set: { profilePicture: req.body.profilePicture } }, { new: true });
                if (editStudentDetails)
                    res.status(200).json(editStudentDetails);
            }
            catch (error) {
                res.status(500).json(error);
            }
        });
        this.sendEmail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const student = yield student_model_1.default.findOne({ email: req.body.email });
                if (student) {
                    const token = yield common_service_1.commonService.generateRandomBytes();
                    const updateStudent = yield student_model_1.default.findByIdAndUpdate({ _id: student["_id"] }, {
                        resetPasswordToken: token,
                        resetPasswordExpires: Date.now() + 86400000,
                    }, { upsert: true, new: true });
                    if (updateStudent) {
                        updateStudent.type = "resetPassword";
                        yield emailSender_service_1.emailSenderService.sendEmail(updateStudent, token);
                        res
                            .status(200)
                            .json({ status: 1, data: { message: "Sent successfully" } });
                    }
                    else {
                        res
                            .status(200)
                            .json({
                            status: 0,
                            data: { message: "Failed in sending email, Try again" },
                        });
                    }
                }
                else {
                    res
                        .status(200)
                        .json({ status: 0, data: { message: "Email not found" } });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).send(error);
            }
        });
        this.resetPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const student = yield student_model_1.default.findOne({
                    resetPasswordToken: req.body.token,
                    resetPasswordExpires: {
                        $gt: Date.now(),
                    },
                });
                if (student) {
                    const hashedPassword = yield bcryptjs_1.hash(req.body.newPassword, 10);
                    if (hashedPassword) {
                        const updatedStudent = yield student_model_1.default.findByIdAndUpdate({ _id: student["_id"] }, {
                            $set: {
                                password: hashedPassword,
                                resetPasswordToken: undefined,
                                resetPasswordExpires: undefined,
                            },
                        }, { upsert: true, new: true });
                        if (updatedStudent) {
                            res.status(200).json({
                                status: 1,
                                data: {
                                    message: "Password updated successfully",
                                },
                            });
                        }
                    }
                }
                else {
                    res.status(200).json({
                        status: 0,
                        data: {
                            errorDescription: "Password reset token is invalid or has expired.",
                            error: "expired_token",
                        },
                    });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.addFeedback = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const existing = yield feedback_model_1.default.findOne({
                    studentId: req.body.studentId,
                    courseId: req.body.courseId,
                    batchId: req.body.batchId,
                });
                if (existing) {
                    res.status(200).json({
                        status: 0,
                        data: {
                            errorDescription: "Feedback already added",
                        },
                    });
                }
                else {
                    const feedbackRes = yield feedback_model_1.default.create(req.body);
                    if (feedbackRes) {
                        res.status(200).json({
                            status: 1,
                            data: {
                                message: "Added successfully ",
                            },
                        });
                    }
                    else {
                        res.status(200).json({
                            status: 0,
                            data: {
                                errorDescription: "Failed in adding",
                            },
                        });
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.getFeedbackDetails = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const feedback = yield feedback_model_1.default.findOne({
                    studentId: req.body.studentId,
                    courseId: req.body.courseId,
                    batchId: req.body.batchId,
                });
                if (feedback) {
                    res.status(200).json({ status: 1, data: feedback });
                }
                else {
                    res
                        .status(200)
                        .json({
                        status: 0,
                        data: { errorDescription: "Feedback not found" },
                    });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
        this.uploadAssignment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let awsResponse = "";
                const token = yield common_service_1.commonService.generateRandomBytes(4);
                const fileName = req["files"]["file"].originalFilename;
                awsResponse = yield this.awsS3Service.uploadFile(req["files"]["fileLink"], `${token}-${fileName}`, "StudentAssignments");
                const assignment = yield student_assignment_model_1.default.create({
                    fileLink: awsResponse.Location || "",
                    courseId: req.body["courseId"],
                    batchId: req.body["batchId"],
                    topicId: req.body["topicId"],
                    studentId: req.body["studentId"],
                });
                if (assignment) {
                    res.status(200).json({ status: 1, data: assignment });
                }
            }
            catch (error) {
                res.status(500).json(error);
            }
        });
        this.sendAndStoreAssignment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (req["files"]["assignmentFile"] && req.body['instructorMailId'] != 'undefined') {
                    const buildReq = {
                        email: req.body["instructorMailId"],
                        type: "sendAssignment",
                        attachment: req["files"]["assignmentFile"],
                    };
                    const emailSenderRes = yield emailSender_service_1.emailSenderService.sendEmail(buildReq);
                    if (emailSenderRes) {
                        const assignment = yield student_assignment_model_1.default.create({
                            fileLink: req["files"]["assignmentFile"].originalFilename,
                            courseId: req.body["courseId"],
                            batchId: req.body["batchId"],
                            topicId: req.body["topicId"],
                            studentId: req.body["studentId"],
                            instructorMailId: req.body["instructorMailId"],
                        });
                        if (assignment) {
                            res.status(200).json({ status: 1, data: assignment });
                        }
                    }
                }
                else {
                    res.status(200).send({ data: "Attachment required or instructor mail missing" });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        });
    }
}
exports.default = StudentController;
