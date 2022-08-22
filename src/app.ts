import express from "express";
import { connect } from "mongoose";
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import config from './config';
import HealthCheckRouter from './routes/healthcheck.route';
import StudentRouter from "./routes/student.route";
import CourseRouter from "./routes/course.route";
import AdminRouter from "./routes/admin.route";
const formData = require('express-form-data');
import * as fs from 'fs';
import path from 'path';
import https from 'https';
var key = fs.readFileSync(path.join(__dirname,'./key.pem'));
var cert = fs.readFileSync(path.join(__dirname,'./cert.pem'));

export default class App {
  public app: express.Application = express();
  public port: number;
  private healthcheckRouter: HealthCheckRouter = new HealthCheckRouter();
  private studentRouter: StudentRouter = new StudentRouter();
  private courseRouter: CourseRouter = new CourseRouter();
  private adminRouter: AdminRouter = new AdminRouter();
  client: any;
  constructor(port: number) {
    this.port = port;
    this.config();
  }

  private config = () => {
    this.app.use(cors());
    this.bodyParserConfig();
    this.app.use((req, res, next) => {
      // res.header("Access-Control-Allow-Origin", "*");
      // res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
      // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', '0');
      res.header('Access-Control-Allow-Origin', '*');
      // res.header('Access-Control-Allow-Headers', 'Content-type, Accept');
      res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      next();
    });

    this.mongooseConfig();
    this.initializeRoutes();
  }

  private bodyParserConfig = () => {
    // this.app.use(json());
    this.app.use(urlencoded({ extended: false }));
    this.app.use(json({limit: '19MB'}));
    this.app.use(formData.parse());

  }

  private mongooseConfig = async() => {
    try {
     await connect(config.MONGO_URL, {
        useNewUrlParser: true,
      });
      console.log('connected to db');
    } catch (error) {
      console.log(`mongoErr :::: ${error}`);
    }
  }

  private initializeRoutes = () => {
    this.app.use('/', this.healthcheckRouter.router)
    this.app.use('/student',this.studentRouter.router);
    this.app.use('/course',this.courseRouter.router);
    this.app.use('/admin', this.adminRouter.router);
  }

  public listen = () => {
    const server = https.createServer({key: key, cert: cert }, this.app);
    server.listen(this.port, () => { 
      console.log(`App listening on the port ${this.port}`) 
    });

    // this.app.listen(this.port, () => {
    //   console.log(`App listening on the port ${this.port}`);
    // });
  }

}