import { Schema, model } from "mongoose";

const adminSchema = new Schema({
  username: {
    type: Schema.Types.String,
    required: 'Firstname is required',
  },
  password: {
    type: Schema.Types.String,
    required:'Password is required'
  },
  lastLoggedIn: {
    type: Schema.Types.String
  },
});

export default model('admin',adminSchema);