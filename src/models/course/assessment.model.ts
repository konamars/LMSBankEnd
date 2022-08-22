import { Schema, model } from "mongoose";

const assessmentSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: 'Name is required'
  },
  createdAt: {
    type: Schema.Types.Date,
    default: new Date()
  },
  assessment: {
    type: Array,
    default: []
  }
});

export default model('assessment', assessmentSchema);
