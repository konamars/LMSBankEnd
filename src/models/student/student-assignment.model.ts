import { Schema, model } from 'mongoose';

const studentAssignmentSchema = new Schema({
  fileLink: {
    type: Schema.Types.String
  },
  courseId: {
    type: Schema.Types.String
  },
  batchId: {
    type: Schema.Types.String
  },
  topicId: {
    type: Schema.Types.String
  },
  studentId: {
    type: Schema.Types.String
  },
  instructorMailId: {
    type: Schema.Types.String
  },
  createdAt: {
    type: Schema.Types.Date,
    default: new Date()
  }
});

export default model('assignment', studentAssignmentSchema);