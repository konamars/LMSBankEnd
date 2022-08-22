import { Schema, model } from "mongoose";

const instructorSchema = new Schema({
  username: {
    type: Schema.Types.String,
    required: 'Username is required',
  },
  email: {
    type: Schema.Types.String,
    required: 'Email is required'
  },
  password: {
    type: Schema.Types.String,
    required:'Password is required'
  },
  lastLoggedIn: {
    type: Schema.Types.String
  }
});

export default model('instructor',instructorSchema);