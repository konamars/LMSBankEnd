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
    instructions: {
        type: mongoose_1.Schema.Types.String,
        default: ''
    },
    solution: {
        type: Object,
        default: {}
    },
    instructorMailId: {
        type: String
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
    assessmentId: {
        type: mongoose_1.Schema.Types.String
    },
    assessmentName: {
        type: mongoose_1.Schema.Types.String
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
const batchSchema = new mongoose_1.Schema({
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: 'CourseId is required'
    },
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: 'InstructorId is required'
    },
    createdAt: {
        type: mongoose_1.Schema.Types.Date,
        default: new Date()
    },
    endDate: {
        type: mongoose_1.Schema.Types.Date
    },
    isCompleted: {
        type: mongoose_1.Schema.Types.Boolean,
        default: false
    },
    curriculum: [curriculumSchema],
    isActive: {
        type: mongoose_1.Schema.Types.Boolean,
        default: true
    },
    discussions: {
        type: Array,
        default: []
    },
    projects: {
        type: Array,
        default: []
    },
    upcomingClassDate: {
        type: mongoose_1.Schema.Types.Date
    },
    upcomingClassZoomLink: {
        type: mongoose_1.Schema.Types.String
    },
    startedDate: {
        type: mongoose_1.Schema.Types.Date
    },
    status: {
        type: mongoose_1.Schema.Types.String
    },
    id: {
        type: mongoose_1.Schema.Types.String
    },
    startTime: {
        type: mongoose_1.Schema.Types.String
    },
    endTime: {
        type: mongoose_1.Schema.Types.String
    },
    isFeedbackEnabled: {
        type: mongoose_1.Schema.Types.Boolean,
        default: false
    }
});
exports.default = mongoose_1.model('batch', batchSchema);
