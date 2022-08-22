import { Schema, model } from "mongoose";

const progressSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    required: 'Course Id is required'
  },
  orderId: {
    type: Schema.Types.ObjectId
  },
  studentId: {
    type: Schema.Types.ObjectId,
    required: 'Student ID is required'
  },
  batchId: {
    type: Schema.Types.ObjectId,
    required: 'Batch ID is required'
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  isStarted: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  isAssigned: {
    type: Boolean,
    default: false
  },
  completedAssessments: {
    type: Array,
    default: []
  }
});

export default model('course-progress', progressSchema);