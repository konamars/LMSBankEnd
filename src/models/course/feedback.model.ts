import { Schema, model } from "mongoose";

const feedbackSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  batchId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Schema.Types.Number,
    required: true
  },
  review: {
    type: Schema.Types.String,
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
});

export default model('feedback', feedbackSchema);