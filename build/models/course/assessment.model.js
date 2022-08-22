"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const assessmentSchema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.Schema.Types.String,
        required: 'Name is required'
    },
    createdAt: {
        type: mongoose_1.Schema.Types.Date,
        default: new Date()
    },
    assessment: {
        type: Array,
        default: []
    }
});
exports.default = mongoose_1.model('assessment', assessmentSchema);
