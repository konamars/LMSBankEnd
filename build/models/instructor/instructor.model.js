"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const instructorSchema = new mongoose_1.Schema({
    username: {
        type: mongoose_1.Schema.Types.String,
        required: 'Username is required',
    },
    email: {
        type: mongoose_1.Schema.Types.String,
        required: 'Email is required'
    },
    password: {
        type: mongoose_1.Schema.Types.String,
        required: 'Password is required'
    },
    lastLoggedIn: {
        type: mongoose_1.Schema.Types.String
    }
});
exports.default = mongoose_1.model('instructor', instructorSchema);
