"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const studentSchema = new mongoose_1.Schema({
    firstname: {
        type: mongoose_1.Schema.Types.String,
        required: 'Firstname is required',
    },
    lastname: {
        type: mongoose_1.Schema.Types.String,
        required: 'Lastname is required',
    },
    email: {
        type: mongoose_1.Schema.Types.String,
        required: 'Email is required'
    },
    phone: {
        type: mongoose_1.Schema.Types.String,
        required: 'Phone number is required'
    },
    password: {
        type: mongoose_1.Schema.Types.String,
        required: 'Password is required'
    },
    profilePicture: {
        type: mongoose_1.Schema.Types.String
    },
    lastLoggedIn: {
        type: mongoose_1.Schema.Types.String
    },
    socket: {
        type: mongoose_1.Schema.Types.String
    },
    resetPasswordToken: {
        type: mongoose_1.Schema.Types.String
    },
    resetPasswordExpires: {
        type: mongoose_1.Schema.Types.String
    },
    createdAt: {
        type: mongoose_1.Schema.Types.Date,
        default: new Date()
    },
    isActive: {
        type: mongoose_1.Schema.Types.Boolean,
        default: true
    },
    lastUpdatedAt: {
        type: mongoose_1.Schema.Types.Number,
        default: Date.now()
    }
});
exports.default = mongoose_1.model('student', studentSchema);
