import { Schema, model } from "mongoose";

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
  instuctions: {
    type: Schema.Types.String,
    default: ''
  },
  solution: {
    type: Object,
    default: {}
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
  resources: [resourcesSchema],
  assignments: [assignmentSchema]
});

const curriculumSchema = new Schema({
  title: {
    type: Schema.Types.String,
    default: ''
  },
  topics: [topicsSchema],
});

const couponSchema = new Schema({
  isCouponEnabled: {
    type: Schema.Types.Boolean,
    default: false
  },
  couponPercentage: {
    type: Schema.Types.Number,
    default: 0
  }
})

const courseSchema = new Schema({
  title: {
    type: Schema.Types.String,
    required: 'Course Title is required'
  },
  mainDescription: {
    type: Schema.Types.String,
    required: 'Course Description is required'
  },
  imageURL: {
    type: Schema.Types.String,
    required: 'imageUrl is required'
  },
  features: {
    type: Array,
    default: []
  },
  curriculum: [curriculumSchema],
  tools: {
    type: Array,
    default: []
  },
  faqs: {
    type: Array,
    default: []
  },
  price: {
    type: Schema.Types.Number
  },
  curriculumLink: {
    type: Schema.Types.String
  },
  category: {
    type: Schema.Types.String,
    default: 'DL'
  },
  coupon: couponSchema,
  duration: {
    type: Schema.Types.String
  },
  prerequisties: {
    type: Schema.Types.String
  },
  skillLevel: {
    type: Schema.Types.String
  },
});

export default model('course', courseSchema);