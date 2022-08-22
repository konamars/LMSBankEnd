"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class HealthCheckRouter {
    constructor() {
        this.router = express_1.Router();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/healthcheck', (req, res) => {
            res.status(200).json({ health: 'lms-api up on runing' });
        });
    }
}
exports.default = HealthCheckRouter;
