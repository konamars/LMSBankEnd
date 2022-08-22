"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const randombytes_1 = __importDefault(require("randombytes"));
class CommonService {
    constructor() {
        this.generateRandom = (length) => {
            const numbers = '0123456789';
            let result = '';
            for (var i = length; i > 0; --i) {
                result += numbers[Math.round(Math.random() * (numbers.length - 1))];
            }
            return result;
        };
        this.generateInvoiceDate = () => {
            const date = new Date();
            const year = date.getFullYear();
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const day = ('0' + date.getDate()).slice(-2);
            return `${month}/${day}/${year}`;
        };
        this.generateRandomBytes = (bytes = 12) => {
            return new Promise((resolve, reject) => {
                try {
                    randombytes_1.default(bytes, (err, buffer) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            resolve(buffer.toString('hex'));
                        }
                    });
                }
                catch (error) {
                    reject(error);
                }
            });
        };
    }
}
exports.commonService = new CommonService();
