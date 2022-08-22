"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const studentAssignmentSchema = new mongoose_1.Schema({
    fileLink: {
        type: mongoose_1.Schema.Types.String
    },
    courseId: {
        type: mongoose_1.Schema.Types.String
    },
    batchId: {
        type: mongoose_1.Schema.Types.String
    },
    topicId: {
        type: mongoose_1.Schema.Types.String
    },
    studentId: {
        type: mongoose_1.Schema.Types.String
    },
    instructorMailId: {
        type: mongoose_1.Schema.Types.String
    },
    createdAt: {
        type: mongoose_1.Schema.Types.Date,
        default: new Date()
    }
});
exports.default = mongoose_1.model('assignment', studentAssignmentSchema);
