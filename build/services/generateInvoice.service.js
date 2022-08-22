"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const common_service_1 = require("../services/common.service");
const config_1 = __importDefault(require("../config"));
var pdf = require('html-pdf');
const buildPaths = {
    buildPathHtml: path.resolve('./invoiceBuilder.html'),
    buildPathPdf: path.resolve('./invoiceBuilder.pdf')
};
const createRow = (item) => `
  <tr>
    <td scope="col">1</td>
    <td scope="col">${item.title}</td>
    <td scope="col">${item.quantity || '1'}</td>
    <td scope="col">${item.price || ''}</td>
    <td scope="col">${item.discount || 0}</td>
    <td scope="col">${item.price}</td>
    <td scope="col">${item.gst || '18%'}</td>
    <td scope="col">${exports.generateInvoice.calculateTaxableValue(item.price)}</td>
  </tr>
`;
const createTable = (rows) => `
  <table id="course-details">
    <thead>
      <tr>
        <th scope="col" >S. No.</th>
        <th scope="col" >Course Name</th>
        <th scope="col" >Qty</th>
        <th scope="col" >Unit Price</th>
        <th scope="col" >Discount/Offer</th>
        <th scope="col" >Total Price</th>
        <th scope="col" >GST <br/> Rate (%)</th>
        <th scope="col" >Taxable Value <br/> Plus taxes</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
`;
const createHtml = (table, studentDetails) => `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        table {
            text-align: left;
            margin: 0px auto;
            width: 100%;
            font-size: 10px;
        }
        img {
            width: 180px;
        }
        span {
            font-weight: bold;
        }
        #company-header, #company-body{
            border-top: 1px solid #B4B4B4;
            border-left: 1px solid #B4B4B4;
            border-right: 1px solid #B4B4B4;
        }
        #company-header{
            padding: 5px 0px 10px 10px;
        }
        #company-body th, #company-body td{
            padding: 5px 0px;
        }
        #course-details td{
            padding: 20px;
        }
        #course-details, #course-details th, #course-details  td{
            border: 1px solid #B4B4B4;
            border-collapse: collapse;
        }
        #course-details th{
            padding: 6px 8px;
            font-size: 10px;
            text-align: center;
        }
        #course-details td{
            text-align: center;
            font-size: 10px;
            padding: 10px 8px;
        }
        #company-body{
            padding-left: 18px;
        }
        #company-body th, #company-body td{
          width: 45%;
        }
        .signature{
            text-align: right;
            width: 95%;
            margin: 0px auto;
            padding-top: 4em;
        }
        .signature span{
            border-top: 1px solid black;
            padding-top: 5px;
            font-size: 11px;
            font-weight: bold;
        }
        .border-right{
          border: 1px solid #B4B4B4;
        }
    </style>
</head>
<body>
    <div style="padding: 20px 10px 0px 20px; width: 94.5%">
        <table id="company-header">
            <tr>
                <th><img
                        src="${config_1.default.FRONT_END_URL}/assets/images/logo.png">
                </th>
            </tr>
            <tr>
                <td><span>Registered Office: </span>Synergy Building, 2nd Floor, Gachibowli, Hyderabad, Telangana, India
                </td>
            </tr>
            <tr>
                <th>www.digital-lync.com</th>
            </tr>
        </table>
        <table id="company-body">
            <tr>
                <th>Order Details</th>
                <th>Billing Details</th>
            </tr>
            <tr>
                <td>Order Id: dl${common_service_1.commonService.generateRandom(6)}</td>
                <td>Name: ${studentDetails.firstname} ${studentDetails.lastname}</td>
            </tr>
            <tr>
                <td>PAN Number: AAFCD6967P</td>
                <td>Email Id: ${studentDetails.email}</td>
            </tr>
            <tr>
                <td>GSTIN Number: 36AAFCD6967P1ZS</td>
                <td>Invoice Number: #${common_service_1.commonService.generateRandom(7)}</td>
            </tr>
            <tr>
                <td>State: Telangana</td>
                <td>Invoice Date: ${common_service_1.commonService.generateInvoiceDate()}</td>
            </tr>            
        </table>
        ${table}
        <div class="signature">
            <span>Manikanta Kona, CEO, Digital Lync</span>
        </div>
    </div>
</body>
</html>
`;
class GenerateInvoice {
    constructor() {
        this.doesFileExist = (filePath) => {
            try {
                fs.statSync(filePath); // get information of the specified file path.
                return true;
            }
            catch (error) {
                return false;
            }
        };
        this.generateInvoice = (studentDetails, courses) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (this.doesFileExist(buildPaths)) {
                        // deleting old build file
                        fs.unlinkSync(buildPaths.buildPathHtml);
                        fs.unlinkSync(buildPaths.buildPathPdf);
                    }
                    const rows = courses.map(createRow).join('');
                    const table = createTable(rows);
                    const html = createHtml(table, studentDetails);
                    // fs.writeFileSync(buildPaths.buildPathHtml, html);
                    var options = {
                        format: 'A4',
                    };
                    pdf.create(html, options).toFile('./invoiceBuilder.pdf', (err, res) => {
                        if (err)
                            throw err;
                        resolve({ data: 'Generated' });
                    });
                    // await this.initPrintPdf();
                    // resolve({data: 'Generated'});          
                }
                catch (error) {
                    console.log('Failed in generating');
                    reject(error);
                }
            }));
        });
        this.initPrintPdf = () => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.doesFileExist(buildPaths)) {
                    fs.unlinkSync(buildPaths.buildPathPdf);
                }
                const pdf = yield this.printPdf();
                fs.writeFileSync(buildPaths.buildPathPdf, pdf);
                console.log('Succesfully Created an PDF');
            }
            catch (error) {
                console.log('Failed in creating pdf');
                throw error;
            }
        });
        this.printPdf = () => __awaiter(this, void 0, void 0, function* () {
            try {
                // const browser = await puppeteer.launch();
                // const page = await browser.newPage();
                // await page.goto(buildPaths.buildPathHtml, { waitUntil: 'networkidle0' });
                // const pdf = await page.pdf({
                //   format: 'A4',
                //   margin: {
                //     top: '20px',
                //     right: '20px',
                //     bottom: '20px',
                //     left: '20px'
                //   }
                // });
                // await browser.close();        
                // return pdf;
            }
            catch (error) {
                console.log('Failed scaning');
                throw 'Failed in scaning';
            }
        });
    }
    calculateTaxableValue(price) {
        return price + ((price * 18) / 100);
    }
}
exports.generateInvoice = new GenerateInvoice();
