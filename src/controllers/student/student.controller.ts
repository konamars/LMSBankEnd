import { Request, Response, NextFunction } from "express";
import StudentModel from "../../models/student/student.model";
import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import config from "../../config";
import orderModel from "../../models/student/order.model";
import courseModel from "../../models/course/course.model";
import { ObjectId } from "mongodb";
import moment from "moment";
import { Types } from "mongoose";
import Razorpay from "razorpay";
import courseBatchModel from "../../models/course/course-batch.model";
import courseProgress from "../../models/student/course-progress";
import { generateInvoice } from "../../services/generateInvoice.service";
import { AWSS3Service } from "../../services/awsS3.service";
import { commonService } from "../../services/common.service";
import { emailSenderService } from "../../services/emailSender.service";
import FeedbackModel from "../../models/course/feedback.model";
import AssignmentModel from "../../models/student/student-assignment.model";

export default class StudentController {
  private awsS3Service: AWSS3Service = new AWSS3Service();
  public rpInstance = new Razorpay({
    key_id: "rzp_test_6n41NtIZLO0jf5",
    key_secret: "6JvuSNdkCwhq7aMocL5BoOl2",
  });

  public createOrderId = async (req: Request, res: Response) => {
    try {
      const course: any = await courseModel.findById(req.body["courseId"]);
      if (course) {
        const order = await this.rpInstance.orders.create({
          amount: req.body.totalPrice * 100,
          currency: "INR",
          receipt: "re1",
          payment_capture: "0",
        });
        res.status(200).json(order["id"]);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };
  public createToken = (user: any) => {
    const expiresIn = 60 * 60; // an hour
    const dataStoredInToken = {
      _id: user._id,
      time: user["lastLoggedIn"],
    };
    return sign(dataStoredInToken, config.JWT_SECRET, { expiresIn });
  };

  public createStudent = async (req: Request, res: Response) => {
    try {
      const emailMatched = await StudentModel.findOne({
        email: req.body.email,
      });
      if (emailMatched) {
        res.status(409).json({ email: true });
      } else {
        const phoneMatched = await StudentModel.findOne({
          phone: req.body.phone,
        });
        if (phoneMatched) {
          res.status(409).json({ phone: true });
        } else {
          const hashedPassword = await hash(req.body.password, 10);
          const requestBody = {
            ...req.body,
            password: hashedPassword,
            lastLoggedIn: moment().unix(),
            lastUpdatedAt: Date.now()
          };
          const user: any = await StudentModel.create(requestBody);
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
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public authenticate = async (req: Request, res: Response) => {
    try {
      const emailMatched: any = await StudentModel.findOne({
        email: req.body.email,
      });
      if (emailMatched) {
        const comparePassword = await compare(
          req.body.password,
          emailMatched["password"]
        );
        if (comparePassword) {
          const updateTimesstamp: any = await StudentModel.findOneAndUpdate(
            { _id: emailMatched["_id"] },
            { $set: { lastLoggedIn: moment().unix() } },
            { new: true }
          );
          if (updateTimesstamp) {
            const tokenData = this.createToken(updateTimesstamp);
            res.status(200).json({
              auth: true,
              token: tokenData,
              firstname: emailMatched["firstname"],
              lastname: emailMatched["lastname"],
              email: emailMatched['email'],
              phone: emailMatched['phone'],
              isActive: updateTimesstamp["isActive"],
            });
          }
        } else {
          res.status(409).json({ password: true });
        }
      } else {
        res.status(409).json({ email: true });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getStudentById = async (req: Request, res: Response) => {
    try {
      const studentDetails: any = await StudentModel.findById(req["tokenId"], {
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
      } else {
        res.status(404).json({ student: true });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public createOrder = async (req: Request, res: Response) => {
    try {
      let batchId;
      let awsResponse: any = "";
      let invoice: any;
      const studentDetails: any = await StudentModel.findById(req["tokenId"], {
        password: 0,
      });
      const courseDetails = await courseModel.findById(req.body["courseId"]);
      invoice = await generateInvoice.generateInvoice(studentDetails, [
        courseDetails,
      ]);
      if (invoice && invoice.data === "Generated") {
        awsResponse = await this.awsS3Service.uploadFile(
          { path: "./invoiceBuilder.pdf" },
          commonService.generateRandom(10) + ".pdf",
          "Invoices"
        );
      }
      const order = await orderModel.create({
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
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getOrdersByStudentId = async (req: Request, res: Response) => {
    try {
      const orders = await orderModel.aggregate([
        {
          $match: {
            studentId: Types.ObjectId(req["tokenId"]),
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
        let o =await Promise.all(orders.map(async (or: any) => {
          let detail = await courseProgress.findOne({studentId: req['tokenId'],orderId: or['id'],  courseId: or['courseId']});
          if(detail) {
            return {
              ...or,
              status: detail['isSuspended'] ? 'suspended' : detail['isStarted'] ? 'started' : 'assigned',
             ...!detail['isSuspended'] && { progressId: detail['_id'] }
            }
          }else {
            return {
              ...or,
              status: 'not_assigned'
            }
          }
        } ))
        res.status(200).json(o);
      } else {
        res.status(404).json("not found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getCourseProgress = async (req: Request, res: Response) => {
    try {
      const orders = await courseProgress.aggregate([
        {
          $match: {
            studentId: Types.ObjectId(req["tokenId"]),
            _id: Types.ObjectId(req.params["id"]),
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
      } else {
        res.status(404).json("not found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public updateStatusForCoureProgress = async (req: Request, res: Response) => {
    try {
      const updated = await courseProgress.updateOne(
        {
          studentId: req["tokenId"],
          _id: req.params["id"],
        },
        { $set: { isStarted: true } }
      );
      if (updated) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public editStudentDetails = async (req: Request, res: Response) => {
    try {
      const editStudentDetails = await StudentModel.findByIdAndUpdate(
        req["tokenId"],
        { $set: req.body },
        { new: true }
      );
      if (editStudentDetails) res.status(200).json(editStudentDetails);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public changePassword = async (req: Request, res: Response) => {
    try {
      const student: any = await StudentModel.findById(req["tokenId"]);
      if (student) {
        const comparePassword = await compare(
          req.body.password,
          student["password"]
        );
        if (comparePassword) {
          const hashedPassword = await hash(req.body.newPassword, 10);
          if (hashedPassword) {
            const updatedStudent = await StudentModel.findByIdAndUpdate(
              req["tokenId"],
              { $set: { password: hashedPassword } }
            );
            if (updatedStudent) {
              res.status(200).json("updated successfully");
            }
          }
        } else {
          res.status(409).json({ passwordInvalid: true });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getInvoicesByStudentId = async (req: Request, res: Response) => {
    try {
      const orders = await orderModel.aggregate([
        {
          $match: {
            studentId: Types.ObjectId(req["tokenId"]),
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
      } else {
        res.status(404).json("not found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public updateStudentProfilePic = async (req: Request, res: Response) => {
    try {
      const editStudentDetails = await StudentModel.findByIdAndUpdate(
        req["tokenId"],
        { $set: { profilePicture: req.body.profilePicture } },
        { new: true }
      );
      if (editStudentDetails) res.status(200).json(editStudentDetails);
    } catch (error) {
      res.status(500).json(error);
    }
  };

  public sendEmail = async (req: Request, res: Response) => {
    try {
      const student = await StudentModel.findOne({ email: req.body.email });
      if (student) {
        const token = await commonService.generateRandomBytes();
        const updateStudent: any = await StudentModel.findByIdAndUpdate(
          { _id: student["_id"] },
          {
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 86400000,
          },
          { upsert: true, new: true }
        );
        if (updateStudent) {
          updateStudent.type = "resetPassword";
          await emailSenderService.sendEmail(updateStudent, token);
          res
            .status(200)
            .json({ status: 1, data: { message: "Sent successfully" } });
        } else {
          res
            .status(200)
            .json({
              status: 0,
              data: { message: "Failed in sending email, Try again" },
            });
        }
      } else {
        res
          .status(200)
          .json({ status: 0, data: { message: "Email not found" } });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  };

  public resetPassword = async (req: Request, res: Response) => {
    try {
      const student: any = await StudentModel.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: {
          $gt: Date.now(),
        },
      });
      if (student) {
        const hashedPassword = await hash(req.body.newPassword, 10);
        if (hashedPassword) {
          const updatedStudent = await StudentModel.findByIdAndUpdate(
            { _id: student["_id"] },
            {
              $set: {
                password: hashedPassword,
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined,
              },
            },
            { upsert: true, new: true }
          );
          if (updatedStudent) {
            res.status(200).json({
              status: 1,
              data: {
                message: "Password updated successfully",
              },
            });
          }
        }
      } else {
        res.status(200).json({
          status: 0,
          data: {
            errorDescription: "Password reset token is invalid or has expired.",
            error: "expired_token",
          },
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public addFeedback = async (req: Request, res: Response) => {
    try {
      const existing = await FeedbackModel.findOne({
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
      } else {
        const feedbackRes: any = await FeedbackModel.create(req.body);
        if (feedbackRes) {
          res.status(200).json({
            status: 1,
            data: {
              message: "Added successfully ",
            },
          });
        } else {
          res.status(200).json({
            status: 0,
            data: {
              errorDescription: "Failed in adding",
            },
          });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };
  public getFeedbackDetails = async (req: Request, res: Response) => {
    try {
      const feedback = await FeedbackModel.findOne({
        studentId: req.body.studentId,
        courseId: req.body.courseId,
        batchId: req.body.batchId,
      });
      if (feedback) {
        res.status(200).json({ status: 1, data: feedback });
      } else {
        res
          .status(200)
          .json({
            status: 0,
            data: { errorDescription: "Feedback not found" },
          });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public uploadAssignment = async (req: Request, res: Response) => {
    try {
      let awsResponse: any = "";
      const token = await commonService.generateRandomBytes(4);
      const fileName = req["files"]["file"].originalFilename;
      awsResponse = await this.awsS3Service.uploadFile(
        req["files"]["fileLink"],
        `${token}-${fileName}`,
        "StudentAssignments"
      );
      const assignment = await AssignmentModel.create({
        fileLink: awsResponse.Location || "",
        courseId: req.body["courseId"],
        batchId: req.body["batchId"],
        topicId: req.body["topicId"],
        studentId: req.body["studentId"],
      });
      if (assignment) {
        res.status(200).json({ status: 1, data: assignment });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  };

  public sendAndStoreAssignment = async (req: Request, res: Response) => {
    try {
      if (req["files"]["assignmentFile"] && req.body['instructorMailId'] != 'undefined') {
        const buildReq = {
          email: req.body["instructorMailId"],
          type: "sendAssignment",
          attachment: req["files"]["assignmentFile"],
        };
        const emailSenderRes = await emailSenderService.sendEmail(buildReq);
        if (emailSenderRes) {
          const assignment = await AssignmentModel.create({
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
      } else {
        res.status(200).send({ data: "Attachment required or instructor mail missing" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };
}
