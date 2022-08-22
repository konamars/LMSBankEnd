"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const adminSchema = new mongoose_1.Schema({
    username: {
        type: mongoose_1.Schema.Types.String,
        required: 'Firstname is required',
    },
    password: {
        type: mongoose_1.Schema.Types.String,
        required: 'Password is required'
    },
    lastLoggedIn: {
        type: mongoose_1.Schema.Types.String
    },
});
exports.default = mongoose_1.model('admin', adminSchema);
