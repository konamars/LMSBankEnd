"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const feedbackSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    batchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    rating: {
        type: mongoose_1.Schema.Types.Number,
        required: true
    },
    review: {
        type: mongoose_1.Schema.Types.String,
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});
exports.default = mongoose_1.model('feedback', feedbackSchema);
