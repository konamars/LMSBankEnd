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
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("mongoose");
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config"));
const healthcheck_route_1 = __importDefault(require("./routes/healthcheck.route"));
const student_route_1 = __importDefault(require("./routes/student.route"));
const course_route_1 = __importDefault(require("./routes/course.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const formData = require('express-form-data');
class App {
    constructor(port) {
        this.app = express_1.default();
        this.healthcheckRouter = new healthcheck_route_1.default();
        this.studentRouter = new student_route_1.default();
        this.courseRouter = new course_route_1.default();
        this.adminRouter = new admin_route_1.default();
        this.config = () => {
            this.app.use(cors_1.default());
            this.bodyParserConfig();
            this.app.use((req, res, next) => {
                // res.header("Access-Control-Allow-Origin", "*");
                // res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
                // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
                res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.header('Pragma', 'no-cache');
                res.header('Expires', '0');
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Headers', 'Content-type, Accept');
                next();
            });
            this.mongooseConfig();
            this.initializeRoutes();
        };
        this.bodyParserConfig = () => {
            // this.app.use(json());
            this.app.use(body_parser_1.urlencoded({ extended: false }));
            this.app.use(body_parser_1.json({ limit: '19MB' }));
            this.app.use(formData.parse());
        };
        this.mongooseConfig = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield mongoose_1.connect(config_1.default.MONGO_URL, {
                    useNewUrlParser: true,
                });
                console.log('connected to db');
            }
            catch (error) {
                console.log(`mongoErr :::: ${error}`);
            }
        });
        this.initializeRoutes = () => {
            this.app.use('/', this.healthcheckRouter.router);
            this.app.use('/student', this.studentRouter.router);
            this.app.use('/course', this.courseRouter.router);
            this.app.use('/admin', this.adminRouter.router);
        };
        this.listen = () => {
            this.app.listen(this.port, () => {
                console.log(`App listening on the port ${this.port}`);
            });
        };
        this.port = port;
        this.config();
    }
}
exports.default = App;
