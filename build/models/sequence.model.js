"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sequenceSchema = new mongoose_1.Schema({
    name: {
        type: mongoose_1.Schema.Types.String
    },
    sequence_id: {
        type: mongoose_1.Schema.Types.Number
    }
});
exports.default = mongoose_1.model('sequence', sequenceSchema);
