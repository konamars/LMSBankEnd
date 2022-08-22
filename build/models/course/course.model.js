"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const resourcesSchema = new mongoose_1.Schema({
    fileTitle: {
        type: mongoose_1.Schema.Types.String,
        default: '',
    },
    fileLink: {
        type: mongoose_1.Schema.Types.String,
        default: ''
    },
    referenceTitle: {
        type: mongoose_1.Schema.Types.String,
        default: ''
    },
    referenceLink: {
        type: mongoose_1.Schema.Types.String,
        default: ''
    }
});
const assignmentSchema = new mongoose_1.Schema({
    title: {
        type: mongoose_1.Schema.Types.String,
        default: '',
    },
    submitOn: {
        type: mongoose_1.Schema.Types.Date,
        default: new Date()
    },
    instuctions: {
        type: mongoose_1.Schema.Types.String,
        default: ''
    },
    solution: {
        type: Object,
        default: {}
    }
});
const topicsSchema = new mongoose_1.Schema({
    title: {
        type: mongoose_1.Schema.Types.String,
        default: ''
    },
    link: {
        type: mongoose_1.Schema.Types.String,
        default: ''
    },
    video_id: {
        type: mongoose_1.Schema.Types.String,
        default: ''
    },
    resources: [resourcesSchema],
    assignments: [assignmentSchema]
});
const curriculumSchema = new mongoose_1.Schema({
    title: {
        type: mongoose_1.Schema.Types.String,
        default: ''
    },
    topics: [topicsSchema],
});
const couponSchema = new mongoose_1.Schema({
    isCouponEnabled: {
        type: mongoose_1.Schema.Types.Boolean,
        default: false
    },
    couponPercentage: {
        type: mongoose_1.Schema.Types.Number,
        default: 0
    }
});
const courseSchema = new mongoose_1.Schema({
    title: {
        type: mongoose_1.Schema.Types.String,
        required: 'Course Title is required'
    },
    mainDescription: {
        type: mongoose_1.Schema.Types.String,
        required: 'Course Description is required'
    },
    imageURL: {
        type: mongoose_1.Schema.Types.String,
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
        type: mongoose_1.Schema.Types.Number
    },
    curriculumLink: {
        type: mongoose_1.Schema.Types.String
    },
    category: {
        type: mongoose_1.Schema.Types.String,
        default: 'DL'
    },
    coupon: couponSchema,
    duration: {
        type: mongoose_1.Schema.Types.String
    },
    prerequisties: {
        type: mongoose_1.Schema.Types.String
    },
    skillLevel: {
        type: mongoose_1.Schema.Types.String
    },
});
exports.default = mongoose_1.model('course', courseSchema);
