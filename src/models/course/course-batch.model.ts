import { Schema, model } from 'mongoose';

const resourcesSchema = new Schema({
  fileTitle: {
    type: Schema.Types.String,
    default: '',
  },
  fileLink: {
    type: Schema.Types.String,
    default: ''
  },
  referenceTitle: {
    type: Schema.Types.String,
    default: ''
  },
  referenceLink: {
    type: Schema.Types.String,
    default: ''
  }
});
const assignmentSchema = new Schema({
  title: {
    type: Schema.Types.String,
    default: '',
  },
  submitOn: {
    type: Schema.Types.Date,
    default: new Date()
  },
  instructions: {
    type: Schema.Types.String,
    default: ''
  },
  solution: {
    type: Object,
    default: {}
  },
  instructorMailId: {
    type: String
  }
});
const topicsSchema = new Schema({
  title: {
    type: Schema.Types.String,
    default: ''
  },
  link: {
    type: Schema.Types.String,
    default: ''
  },
  video_id: {
    type: Schema.Types.String,
    default: ''
  },
  assessmentId: {
    type: Schema.Types.String
  },
  assessmentName: {
    type: Schema.Types.String
  },
  resources: [resourcesSchema],
  assignments: [assignmentSchema]
})
const curriculumSchema = new Schema({
  title: {
    type: Schema.Types.String,
    default: ''
  },
  topics: [topicsSchema],
});

const batchSchema = new Schema({
  courseId :{
    type: Schema.Types.ObjectId,
    required: 'CourseId is required'
  },
  instructorId :{
    type: Schema.Types.ObjectId,
    required: 'InstructorId is required'
  },
  createdAt: {
    type: Schema.Types.Date,
    default: new Date()
  },
  endDate: {
    type: Schema.Types.Date  
  },
  isCompleted: {
    type: Schema.Types.Boolean,
    default: false
  },
  curriculum: [curriculumSchema],
  isActive: {
    type: Schema.Types.Boolean,
    default: true
  },
  discussions: {
    type: Array,
    default: []
  },
  projects: {
    type: Array,
    default: []
  },
  upcomingClassDate: {
    type: Schema.Types.Date
  },
  upcomingClassZoomLink: {
    type: Schema.Types.String
  },
  startedDate: {
    type: Schema.Types.Date
  },
  status: {
    type: Schema.Types.String
  },
  id: {
    type: Schema.Types.String
  },
  startTime: {
    type: Schema.Types.String
  },
  endTime: {
    type: Schema.Types.String
  },
  isFeedbackEnabled: {
    type: Schema.Types.Boolean,
    default: false
  }
});

export default model('batch', batchSchema);
