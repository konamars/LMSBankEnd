import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    required: 'Course Id is required'
  },
  type:{
    type: Schema.Types.String
  },
  studentId: {
    type: Schema.Types.ObjectId,
    required: 'Student ID is required'
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  paymentId: {
    type: Schema.Types.String,
  },
  invoiceLink: {
    type: Schema.Types.String
  },
  isAllocated: {
    type: Schema.Types.Boolean,
    required: true,
    default: false
  },
  totalPrice: {
    type: Schema.Types.Number
  }
});

export default model('order',orderSchema);