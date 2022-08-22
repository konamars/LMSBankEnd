import { Schema, model } from "mongoose";

const sequenceSchema = new Schema({
  name: {
    type: Schema.Types.String
  },
  sequence_id: {
    type: Schema.Types.Number
  }
});

export default model('sequence',sequenceSchema);