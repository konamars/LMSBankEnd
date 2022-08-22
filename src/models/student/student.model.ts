import { Schema, model } from "mongoose";

const studentSchema = new Schema({
  firstname: {
    type: Schema.Types.String,
    required: 'Firstname is required',
  },
  lastname: {
    type: Schema.Types.String,
    required: 'Lastname is required',
  },
  email: {
    type: Schema.Types.String,
    required: 'Email is required'
  },
  phone: {
    type: Schema.Types.String,
    required: 'Phone number is required'
  },
  password: {
    type: Schema.Types.String,
    required:'Password is required'
  },
  profilePicture: {
    type: Schema.Types.String
  },
  lastLoggedIn: {
    type: Schema.Types.String
  },
  socket: {
    type: Schema.Types.String
  },
  resetPasswordToken: {
    type: Schema.Types.String
  },
  resetPasswordExpires: {
    type: Schema.Types.String
  },
  createdAt: {
    type: Schema.Types.Date,
    default: new Date()
  },
  isActive: {
    type: Schema.Types.Boolean,
    default: true
  },
  lastUpdatedAt: {
    type: Schema.Types.Number,
    default: Date.now()
  }
});

export default model('student',studentSchema);