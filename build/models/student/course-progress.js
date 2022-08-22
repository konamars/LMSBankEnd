"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const progressSchema = new mongoose_1.Schema({
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: 'Course Id is required'
    },
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId
    },
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: 'Student ID is required'
    },
    batchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: 'Batch ID is required'
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    isStarted: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    isAssigned: {
        type: Boolean,
        default: false
    },
    completedAssessments: {
        type: Array,
        default: []
    }
});
exports.default = mongoose_1.model('course-progress', progressSchema);
