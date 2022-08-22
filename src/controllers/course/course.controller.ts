import { Request, Response } from 'express';
import CourseModel from '../../models/course/course.model';
import v4 from 'uuid';
import courseBatchModel from '../../models/course/course-batch.model';
import { AWSS3Service } from '../../services/awsS3.service';
import { commonService } from '../../services/common.service';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import assessmentModel from "../../models/course/assessment.model";
import courseProgress from "../../models/student/course-progress";

export default class CourseController {
  private awsS3Service: any = new AWSS3Service();
  public createCourse = async (req: Request, res: Response) => {
    try {
      let c = new CourseModel({
        ...req.body
      })
      const course = await c.save()
      if (course) {
        res.status(201).json('created');
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public getAllCourses = async (req: Request, res: Response) => {
    try {
      const allCourses = await CourseModel.find();
      if (allCourses) {
        res.status(200).json(allCourses);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public getCourseById = async (req: Request, res: Response) => {
    try {
      const course = await CourseModel.findById(req.params.courseId);
      if (course) {
        res.status(200).json(course);
      } else {
        res.status(404).json('No course found');
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public createDiscussion = async (req: Request, res: Response) => {
    try {
      const resource = await courseBatchModel.update({_id:req.body['batchId']}, { $push: { discussions: { label: req.body['label'], link: req.body['link'], id: v4() } } } );
      if (resource) {
        res.status(200).json('done');
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public createProject = async (req: Request, res: Response) => {
    try {
      const batch: any = await courseBatchModel.findById(req.body['batchId']);
      if (batch) {
        let awsLocation, resource;    
        if (req['files']['projectFile']) {
          const token = await commonService.generateRandomBytes(4);
          const fileName = req['files']['projectFile'].originalFilename;
          const awsResponse = await this.awsS3Service.uploadFile(req['files']['projectFile'], `${token}-${fileName}`, 'Projects');
          awsLocation = awsResponse.Location; 
        }
        if (req.body.projectId !== 'undefined') {
          resource = await courseBatchModel.update({'projects.id': req.body['projectId']}, { $set: { 'projects.$.title': req.body['title'], 'projects.$.description': req.body['description'], 'projects.$.projectLink': awsLocation || req.body.projectFile}},{ upsert: true });
        } else {
          resource = await courseBatchModel.updateOne({_id:req.body['batchId']}, { $push: { projects: { title: req.body['title'], description: req.body['description'], projectLink: awsLocation, id: v4() } } });
        }
        if (resource) {
          const batch: any = await courseBatchModel.findById(req.body['batchId']);
          res.status(200).json({status : 0, data: batch.projects});
        } else {
          res.status(200).json({status : 0, data: {error: 'Failed in adding'}});
        }
      } else {
        res.status(200).json({status : 0, data: {error: 'Batch not available'}});
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public createAssignment = async (req: Request, res: Response) => {
    try {
      const resource = await courseBatchModel.updateOne({_id:req.body['batchId']}, { $push: { assignments: { title: req.body['title'], description: req.body['description'], submitOn: req.body['submitOn'], id: v4() } } });
      if (resource) {
        res.status(200).json('done');
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public uploadCurriculum = async (req: Request, res: Response) => {
    try {
      if ('application/pdf'.includes(req['files']['curriculum'].type)) {
        const course: any = await CourseModel.findById(req.query.courseId);
        if (course) {
          const awsResponse = await this.awsS3Service.uploadFile(req['files']['curriculum'], course.title + '.pdf', 'CourseCurriculums');
            if (awsResponse) {
              const courseResponse  = await CourseModel.findByIdAndUpdate(course._id, {$set: {curriculumLink: awsResponse.Location}}, { new: true });
                if (courseResponse) {
                  
                }
              res.status(200).json(courseResponse);
            }
        } else {
          res.status(200).json({status : 0, data: {reason: 'Course not available'}});
        }
      } else {
        res.status(200).json({status : 0, data: {reason: 'Supports only PDF format'}});
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public createResource = async (req: Request, res: Response) => {
    try {
      const checkBatch: any = await courseBatchModel.findById(req.body.batchId);
      const token = await commonService.generateRandomBytes();
      let isCurriculumPresent = false;
      let isTopicPresent = false;
      let curriculumIndex: any;
      let topicIndex: any;
      if (checkBatch) {
        checkBatch.curriculum.forEach((curriculum: any, i: any) => { 
          if (curriculum._id == req.body.moduleId) {
            isCurriculumPresent = true;
            curriculumIndex = i;
            curriculum.topics.forEach((topic: any, j: any) => {
              if (topic._id == req.body.topicId) {
                isTopicPresent = true;
                topicIndex = j;
              }
            })
          }
        });
        if (isCurriculumPresent && isTopicPresent) {
          let awsLocation: any;
          if (req['files']['fileLink']) {
            const token = await commonService.generateRandomBytes(4);
            const fileName = req['files']['fileLink'].originalFilename;
            const awsResponse = await this.awsS3Service.uploadFile(req['files']['fileLink'], `${token}-${fileName}`, 'Resources');
            awsLocation = awsResponse.Location; 
          }
          if (req.body.isDelete === 'true') {
            checkBatch.curriculum[curriculumIndex].topics[topicIndex].resources.splice(topicIndex, 1);
          } else if (req.body.resourceId !== 'undefined') {
            checkBatch.curriculum[curriculumIndex].topics[topicIndex].resources.forEach((r: any) => {
              if (r._id == req.body.resourceId) {
                r.fileTitle = req.body.fileTitle,
                r.fileLink = awsLocation || req.body.fileLink,
                r.referenceLink = req.body.referenceLink;
                r.referenceTitle = req.body.referenceTitle;
              }
            });
          } else {
            checkBatch.curriculum[curriculumIndex].topics[topicIndex].resources.push({
              fileTitle: req.body.fileTitle,
              fileLink: awsLocation,
              referenceTitle: req.body.referenceTitle,
              referenceLink: req.body.referenceLink
            });
          }
          checkBatch.markModified('topics');
          const course = await checkBatch.save();
          res.status(200).json({status: 1, data: course.curriculum[curriculumIndex].topics[topicIndex].resources});
        } else {
          res.status(200).json({status: 0, data: {error: 'Invalid curriculum or topic id'}})
        }
      } else {
        res.status(200).json({status: 0, data: {error: 'Invalid course id'}})
      }
    } catch(error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public addCoupon = async (req: Request, res: Response) => {
    try {
      const couponReq = {
        isCouponEnabled: req.body.isCouponEnabled,
        couponPercentage: req.body.couponPercentage
      };
      const couponRes = await CourseModel.findByIdAndUpdate(req.body.courseId, {$set: {coupon: couponReq}}, { new: true });
      if (couponRes) {
        res.status(200).json({status: 1, data: couponRes})
      } else {
        res.status(200).json({status: 0, data: {error: 'Course not found'}});
      }
    } catch(error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public getAssessmentById = async (req: Request, res: Response) => {
    try {
      const assessment: any = await assessmentModel.findById(req.params.assessmentId);
      if (assessment) {
        res.status(200).json(assessment);
      } else {
        res.status(404).json('not Found');
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

  public updateAssessmetByProgress = async (req: Request, res: Response) => {
    try {
      const updated = await courseProgress.update({_id:req.body['id']}, { $push: { completedAssessments: { ...req.body['assessment'] }}});
      if (updated) {
        res.status(200).json('done');
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }

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