"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vimeo_1 = require("vimeo");
class VideoController {
    constructor() {
        this.client = new vimeo_1.Vimeo('da32bec50562eb84efbec765e9b18b78ce1172f4', 'C1IQ5XJb/TlVE1UzqPYymhQ2HO3B19HnoqSUbvV7zaih55LmgBFxgCB9nsDT6GQ3UAG9nRQ9xrglX6uLr5NsVYyNZt8r88To+KZ5O920xR/Mr0USUpAhlxWQKDDPZLLl', 'e3a376751614f18b810a3c34b8b26121');
    }
}
exports.default = VideoController;
