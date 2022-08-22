import { Request, Response, NextFunction } from "express";
import InstructorModel from "../../models/instructor/instructor.model";
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
import studentModel from "../../models/student/student.model";
import adminModel from "../../models/admin.model";
import v4 from "uuid";
import assessmentModel from "../../models/course/assessment.model";
import { AWSS3Service } from "../../services/awsS3.service";
import { commonService } from "../../services/common.service";
import feedbackModel from "../../models/course/feedback.model";
import sequenceModel from "../../models/sequence.model";

// Admin Controller

export default class AdminController {
  private awsS3Service: AWSS3Service = new AWSS3Service();
  public createToken = (user: any) => {
    const expiresIn = 60 * 60; // an hour
    const dataStoredInToken = {
      _id: user._id,
      time: user["lastLoggedIn"],
      isAdmin: true
    };
    return sign(dataStoredInToken, config.JWT_SECRET, { expiresIn });
  };

  public authenticate = async (req: Request, res: Response) => {
    try {
      const usernameMatched: any = await adminModel.findOne({
        username: req.body.username,
      });
      if (usernameMatched) {
        const comparePassword = await compare(
          req.body.password,
          usernameMatched["password"]
        );
        if (comparePassword) {
          const updateTimesstamp = await adminModel.findOneAndUpdate(
            { _id: usernameMatched["_id"] },
            { $set: { lastLoggedIn: moment().unix() } },
            { new: true }
          );
          console.log(updateTimesstamp);
          if (updateTimesstamp) {
            const tokenData = this.createToken(updateTimesstamp);
            res.status(200).json({
              auth: true,
              token: tokenData,
              name: usernameMatched["username"],
            });
          }
        } else {
          res.status(409).json({ password: true });
        }
      } else {
        res.status(409).json({ username: true });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public createAdmin = async (req: Request, res: Response) => {
    if (req.body.secret == "Digitallync_client") {
      try {
        const hashedPassword = await hash(req.body.password, 10);
        const requestBody = {
          username: req.body["username"],
          password: hashedPassword,
          lastLoggedIn: moment().unix(),
        };
        const user: any = await adminModel.create(requestBody);
        if (user) {
          res.status(201).json("done");
        }
      } catch (error) {
        console.log(error);
        res.status(500).json(error);
      }
    } else {
      res.status(409).json({ secret: true });
    }
  };

  public createInstructor = async (req: Request, res: Response) => {
    try {
      const emailMatched = await InstructorModel.findOne({
        email: req.body.email,
      });
      if (emailMatched) {
        res.status(409).json({ email: true });
      } else {
        const hashedPassword = await hash(req.body.password, 10);
        const requestBody = {
          ...req.body,
          password: hashedPassword,
          lastLoggedIn: moment().unix(),
        };
        const user: any = await InstructorModel.create(requestBody);
        if (user) {
          res.status(201).json("done");
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public removeInstructor = async (req: Request, res: Response) => {
    try {
      const status = await InstructorModel.findByIdAndDelete(
        req.params.instructorId
      );
      if (status) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public editInstructor = async (req: Request, res: Response) => {
    try {
      const request = {
        ...req.body,
      };
      request["password"] ? delete request["password"] : null;
      const updated = await InstructorModel.findByIdAndUpdate(
        req.body.instructorId,
        { $set: { ...request } }
      );
      if (updated) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public allInstructors = async (req: Request, res: Response) => {
    try {
      const instructors = await InstructorModel.find({});
      if (instructors) {
        res.status(200).json(instructors);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getInstructorById = async (req: Request, res: Response) => {
    try {
      const instructor: any = await InstructorModel.findById(
        req.params.instructorId
      );
      if (instructor) {
        res.status(200).json({
          username: instructor["username"],
          email: instructor["email"],
          _id: instructor["_id"],
        });
      } else {
        res.status(404).json("not Found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public createCourse = async (req: Request, res: Response) => {
    try {
      const isCourseExist = await courseModel.findOne({ title: req.body.title });
      if (isCourseExist) {
        res.status(409).send('Already exist');
      } else {
        const course = await courseModel.create(req.body);
        if (course) {
          res.status(201).json("done");
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public allCourses = async (req: Request, res: Response) => {
    try {
      const courses = await courseModel.find({});
      if (courses) {
        res.status(200).json(courses);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public removeCourse = async (req: Request, res: Response) => {
    try {
      const status = await courseModel.findByIdAndDelete(req.params.courseId);
      if (status) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public removeProgress = async (req: Request, res: Response) => {
    try {
      const status = await courseProgress.findByIdAndDelete(req.params.id);
      if (status) {
        let updated = await orderModel.findByIdAndUpdate(status['orderId'], { $set: { isAllocated: false } });
        if (updated) {
          res.status(200).json("done");
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public editCourse = async (req: Request, res: Response) => {
    try {
      const updated = await courseModel.updateOne(
        { _id: req.body.courseId },
        { $set: { ...req.body } }
      );
      if (updated) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getCourseById = async (req: Request, res: Response) => {
    try {
      const instructor: any = await courseModel.findById(req.params.courseId);
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
      } else {
        res.status(404).json("not Found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getBatchById = async (req: Request, res: Response) => {
    try {
      const batch: any = await courseBatchModel.findById(req.params.batchId);
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
      } else {
        res.status(404).json("not Found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getBatchDetailById = async (req: Request, res: Response) => {
    try {
      const PAGE_SIZE = req.body.size || 5;
      const batch: any =await courseBatchModel.findById(req.body.id);
      const details: any = await Promise.all([1,2].map(async (a) => {
        if(a === 1) {
      if (batch) {
        let students = await courseProgress.aggregate([{ $match: {batchId: Types.ObjectId(batch["_id"]) }},
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
        { $limit: PAGE_SIZE },])
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
    }else {
       return await courseProgress.count({batchId: batch["_id"]});
    }
  }
      ));
        res.status(200).json({
          data: details[0],
          total: details[1]
        });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getStudentsBasedOnBatch = async (req: Request, res: Response) => {
    console.log(req.params.courseId);
    try {
      let users = await orderModel.aggregate([
        {
          $match: {
            courseId: Types.ObjectId(req.params.courseId),
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
      ])
      if (users) {
        res.status(200).json(users.filter(user => !!user.email));
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public suspendUser = async (req: Request, res: Response) => {
    try {
      let updated = await courseProgress.findByIdAndUpdate(req.body.id, { $set: { isSuspended: req.body['isSuspended'] } });
      console.log(updated);
      if (updated) {
        res.status(200).json('done')
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public allCourseBatches = async (req: Request, res: Response) => {
    try {
      const PAGE_SIZE = req.body.size || 5;
      const courses: any = await Promise.all([1, 2].map(async (a) => a === 1 ? await courseBatchModel.aggregate([
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
      ]) : await courseBatchModel.count({ status: { $ne: 'Completed' } })));
      if (courses) {
        let data = await Promise.all(
          courses[0].map(async (c: any) => {
            let count = await courseProgress.count({ batchId: c["id"] });
            return {
              ...c,
              studentsCount: count,
            };
          })
        );
        res.status(200).json({
          data,
          total: courses[1]
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public completedCourseBatches = async (req: Request, res: Response) => {
    try {
      const courses = await courseBatchModel.aggregate([
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
        let data = await Promise.all(
          courses.map(async (c: any) => {
            let count = await courseProgress.count({ batchId: c["id"] });
            return {
              ...c,
              studentsCount: count,
            };
          })
        );
        res.status(200).json(data.reverse());
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public updateLiveClassLink = async (req: Request, res: Response) => {
    try {
      const updated = await courseBatchModel.findByIdAndUpdate(req.body.id, {
        $set: {
          upcomingClassDate: req.body.date,
          upcomingClassZoomLink: req.body.link,
        },
      });
      if (updated) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getCourseBatchById = async (req: Request, res: Response) => {
    try {
      const course: any = await courseBatchModel.findById(req.params.courseId);
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
      } else {
        res.status(404).json("not Found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public updateCourseBatch = async (req: Request, res: Response) => {
    try {
      let request = {
        ...req.body,
        // ...req.body['resources'] && {
        //   resources: req.body['resources'].map((r: any) => ({
        //     ...!r['_id'] && { id: v4() },
        //     ...r
        //   }))
        // },
        // ...req.body['assigments'] && {
        //   assigments: req.body['assigments'].map((a: any) => ({
        //     ...!a['_id'] && { id: v4() },
        //     ...a
        //   })),
        ...(req.body["projects"] && {
          projects: req.body["projects"].map((p: any) => ({
            ...(!p["id"] && { id: v4() }),
            ...p,
          })),
        }),
      };
      let updated = await courseBatchModel.updateOne(
        { _id: req.body.batchId },
        { $set: { ...request } }
      );
      if (updated) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public createAssessment = async (req: Request, res: Response) => {
    try {
      const assessment = await assessmentModel.create(req.body);
      if (assessment) {
        res.status(201).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public allAssessments = async (req: Request, res: Response) => {
    try {
      const assessments = await assessmentModel.find({});
      if (assessments) {
        res.status(200).json(assessments);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public removeAssessment = async (req: Request, res: Response) => {
    try {
      const status = await assessmentModel.findByIdAndDelete(
        req.params.assessmentId
      );
      if (status) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public editAssessment = async (req: Request, res: Response) => {
    try {
      const updated = await assessmentModel.updateOne(
        { _id: req.body.assessmentId },
        { $set: { ...req.body } }
      );
      if (updated) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getAssessmentById = async (req: Request, res: Response) => {
    try {
      const assessment: any = await assessmentModel.findById(
        req.params.assessmentId
      );
      if (assessment) {
        res.status(200).json(assessment);
      } else {
        res.status(404).json("not Found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public createOrUpdateOrDeleteAssignment = async (
    req: Request,
    res: Response
  ) => {
    try {
      const checkBatch: any = await courseBatchModel.findById(req.body.batchId);
      let isCurriculumPresent = false;
      let isTopicPresent = false;
      let curriculumIndex: any;
      let topicIndex: any;
      if (checkBatch) {
        checkBatch.curriculum.forEach((curriculum: any, i: any) => {
          curriculum.topics.forEach((topic: any, j: any) => {
            if (topic._id == req.body.topicId) {
              isCurriculumPresent = true;
              curriculumIndex = i;
              isTopicPresent = true;
              topicIndex = j;
            }
          });
        });
        if (isCurriculumPresent && isTopicPresent) {
          let awsResponse: any;
          if (req["files"]["file"]) {
            const token = await commonService.generateRandomBytes(4);
            const fileName = req["files"]["file"].originalFilename;
            awsResponse = await this.awsS3Service.uploadFile(
              req["files"]["file"],
              `${token}-${fileName}`,
              "Assignments"
            );
          }
          if (req.body.isDelete === "true") {
            checkBatch.curriculum[curriculumIndex].topics[
              topicIndex
            ].assignments.splice(topicIndex, 1);
          } else if (req.body.assignmentId !== "undefined") {
            checkBatch.curriculum[curriculumIndex].topics[
              topicIndex
            ].assignments.forEach((r: any) => {
              if (r._id == req.body.assignmentId) {
                r.title = req.body.title;
                r.submitOn = req.body.submitOn;
                r.instructions = req.body.instructions;
                r.instructorMailId = req.body.instructorMailId;
                r.solution = {
                  content: req.body.content,
                  fileLink:
                    awsResponse && awsResponse.Location
                      ? awsResponse.Location
                      : req.body.file,
                };
              }
            });
          } else {
            checkBatch.curriculum[curriculumIndex].topics[
              topicIndex
            ].assignments.push({
              title: req.body.title,
              submitOn: req.body.submitOn,
              instructions: req.body.instructions,
              instructorMailId: req.body.instructorMailId,
              solution: {
                content: req.body.content,
                fileLink:
                  awsResponse && awsResponse.Location
                    ? awsResponse.Location
                    : "",
              },
            });
          }
          checkBatch.markModified("topics");
          const course = await checkBatch.save();
          res.status(200).json({
            status: 1,
            data:
              course.curriculum[curriculumIndex].topics[topicIndex].assignments,
          });
        } else {
          res.status(200).json({
            status: 0,
            data: { error: "Invalid curriculum or topic id" },
          });
        }
      } else {
        res
          .status(200)
          .json({ status: 0, data: { error: "Invalid course id" } });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public createUser = async (req: Request, res: Response) => {
    try {
      const emailMatched = await studentModel.findOne({
        email: req.body.email,
      });
      if (emailMatched) {
        res.status(409).json({ email: true });
      } else {
        const phoneMatched = await studentModel.findOne({
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
          const user: any = await studentModel.create(requestBody);
          if (user) {
            res.status(201).json({
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

  public removeUser = async (req: Request, res: Response) => {
    try {
      const status = await studentModel.findByIdAndDelete(req.params.userId);
      if (status) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public editUser = async (req: Request, res: Response) => {
    try {
      const request = {
        ...req.body,
      };
      request["password"] ? delete request["password"] : null;
      const updated = await studentModel.findByIdAndUpdate(req.body.userId, {
        $set: { ...request, lastUpdatedAt: Date.now() },
      });
      if (updated) {
        res.status(200).json("done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getUserById = async (req: Request, res: Response) => {
    try {
      const user: any = await studentModel.findById(req.params.userId);
      if (user) {
        res.status(200).json({ user });
      } else {
        res.status(404).json("not Found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public allUsers = async (req: Request, res: Response) => {
    try {
      const PAGE_SIZE = req.body.size || 5;
      const users = await Promise.all([1, 2].map(async (a) => a === 1 ? await studentModel.aggregate([
        { $match: {} },
        { $sort: { _id: -1 } },
        { $skip: ((req.body.page) - 1) * PAGE_SIZE },
        { $limit: PAGE_SIZE },
      ]) : await studentModel.count({})));
      res.status(200).json({
        data: users[0],
        total: users[1]
      });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public getFeedbacksByBatchId = async (req: Request, res: Response) => {
    try {
      const feedbacks = await feedbackModel.aggregate([
        {
          $match: {
            batchId: Types.ObjectId(req.params.batchId),
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
      } else {
        res.status(200).json({ status: 0, data: "Data not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public removeProject = async (req: Request, res: Response) => {
    try {
      const batch: any = await courseBatchModel.findById(req.params["batchId"]);
      if (batch) {
        let isDeleted = false;
        batch.projects.forEach((project: any, index: any) => {
          if (project.id === req.params["projectId"]) {
            batch.projects.splice(index, 1);
            isDeleted = true;
          }
        });
        if (isDeleted) {
          const updatedBatch = await batch.save();
          if (updatedBatch) {
            res.status(200).json(updatedBatch);
          }
        } else {
          res.status(404).json({ data: "Project not found" });
        }
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public updateFeedbackFlag = async (req: Request, res: Response) => {
    try {
      let request = {
        ...req.body,
      };
      let updated = await courseBatchModel.updateOne(
        { _id: req.body.batchId },
        { $set: { isFeedbackEnabled: req.body.isFeedbackEnabled } }
      );
      if (updated) {
        console.log(updated);
        res.status(200).json("done");
      } else {
        res.status(400).json("Failed");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  getValueForNextSequence = async (sequenceOfName: string) => {
    let sequenceDoc: any = await sequenceModel.findOneAndUpdate(
      { name: sequenceOfName },
      { $inc: { sequence_id: 1 } },
      { new: true, upsert: true }
    );
    return sequenceDoc.sequence_id;
  };

  public createBatch = async (req: Request, res: Response) => {
    try {
      const checkCourse: any = await courseModel.findById(req.body["courseId"]);
      if (checkCourse) {
        let id = await this.getValueForNextSequence(req.body["courseId"]);
        const batch = await courseBatchModel.create({
          ...req.body,
          id: `${req.body["courseName"].substring(0, 3)}${id}`,
          curriculum: checkCourse["curriculum"],
        });
        if (batch) {
          if (req.body.students && req.body.students.length) {
            let p = await Promise.all(
              req.body.students.map(
                async (s: any) => {
                  await courseProgress.create({
                    studentId: s['studentId'],
                    courseId: req.body["courseId"],
                    batchId: batch["_id"],
                    orderId: s['orderId']
                  });
                  await orderModel.findByIdAndUpdate(s['orderId'], { $set: { isAllocated: true } });
                  return s;
                }
              )
            );
          }
          res.status(201).json("done");
        }
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };
  public registeredUsers = async (req: Request, res: Response) => {
    try {
      let users = await orderModel.aggregate([
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
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public updateCourseBatchDetail = async (req: Request, res: Response) => {
    try {
      if (req.body.students && req.body.students.length) {
        await Promise.all(
          req.body.students.map(
            async (s: any) => {
              await courseProgress.create({
                studentId: s['studentId'],
                courseId: req.body["courseId"],
                batchId: req.body.batchId,
                orderId: s['orderId']
              });
              await orderModel.findByIdAndUpdate(s['orderId'], { $set: { isAllocated: true } });
              return s;
            }
          )
        );
      }
      let updated = await courseBatchModel.updateOne(
        { _id: req.body.batchId },
        { $set: { ...req.body } }
      );
      if (updated) {
        res.status(200).json("Done");
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };

  public deleteAllProgresses = async (req: Request, res: Response) => {
    if (req.body.secret === 'DL_Admin_Remove') {

      try {
        let deleted = await courseProgress.remove({});
        if (deleted) {
          res.sendStatus(200);
        }
      } catch (error) {
        console.log(error);
        res.status(500).json(error);
      }
    } else {
      res.status(409).json({ secret: true })
    }
  }


  public deleteAllBatches = async (req: Request, res: Response) => {
    if (req.body.secret === 'DL_Admin_Remove') {

      try {
        let deleted = await courseBatchModel.remove({});
        if (deleted) {
          res.sendStatus(200);
        }
      } catch (error) {
        console.log(error);
        res.status(500).json(error);
      }
    } else {
      res.status(409).json({ secret: true })
    }
  }

  public deleteAllOrders = async (req: Request, res: Response) => {
    if (req.body.secret === 'DL_Admin_Remove') {

      try {
        let deleted = await orderModel.remove({});
        if (deleted) {
          res.sendStatus(200);
        }
      } catch (error) {
        console.log(error);
        res.status(500).json(error);
      }
    } else {
      res.status(409).json({ secret: true })
    }
  }


}
