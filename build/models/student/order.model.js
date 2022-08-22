"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: 'Course Id is required'
    },
    type: {
        type: mongoose_1.Schema.Types.String
    },
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: 'Student ID is required'
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    paymentId: {
        type: mongoose_1.Schema.Types.String,
    },
    invoiceLink: {
        type: mongoose_1.Schema.Types.String
    },
    isAllocated: {
        type: mongoose_1.Schema.Types.Boolean,
        required: true,
        default: false
    },
    totalPrice: {
        type: mongoose_1.Schema.Types.Number
    }
});
exports.default = mongoose_1.model('order', orderSchema);
