"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const student_model_1 = __importDefault(require("../models/student/student.model"));
const admin_model_1 = __importDefault(require("../models/admin.model"));
const getSecret = (req, res) => __awaiter(this, void 0, void 0, function* () {
    const token = req['headers'] && (req['headers']['X-ACCESS-TOKEN'] || req['headers']['authorization']) ? (req['headers']['X-ACCESS-TOKEN'] || req['headers']['authorization']) : null;
    if (token) {
        const decoded = jsonwebtoken_1.decode(token.toString());
        const isAdmin = decoded['isAdmin'];
        let model = isAdmin ? admin_model_1.default : student_model_1.default;
        if (decoded && decoded['_id'] && typeof decoded['_id'] === 'string') {
            try {
                const studentDetails = yield model.findOne({ _id: decoded['_id'] });
                console.log(studentDetails);
                let isActive = true;
                if (!isAdmin && studentDetails['isActive'] === false) {
                    isActive = false;
                }
                if (studentDetails && isActive) {
                    return Promise.resolve(decoded['_id']);
                }
                else {
                    return Promise.reject(null);
                }
            }
            catch (error) {
                console.log(error);
                return Promise.reject(error);
            }
        }
    }
});
exports.verifyToken = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const secret = yield getSecret(req, res);
        req['tokenId'] = secret;
        next();
    }
    catch (error) {
        console.log(error);
        res.sendStatus(401);
    }
});
