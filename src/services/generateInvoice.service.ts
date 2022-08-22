import * as fs from 'fs';
import * as path from 'path';
import { commonService } from '../services/common.service';
import config from '../config';
var pdf = require('html-pdf');

const buildPaths = {
    buildPathHtml: path.resolve('./invoiceBuilder.html'),
    buildPathPdf: path.resolve('./invoiceBuilder.pdf')
 };
 const createRow = (item: any) => `
  <tr>
    <td scope="col">1</td>
    <td scope="col">${item.title}</td>
    <td scope="col">${item.quantity || '1'}</td>
    <td scope="col">${item.price || ''}</td>
    <td scope="col">${item.discount || 0}</td>
    <td scope="col">${item.price}</td>
    <td scope="col">${item.gst || '18%'}</td>
    <td scope="col">${generateInvoice.calculateTaxableValue(item.price)}</td>
  </tr>
`;

const createTable = (rows: any) => `
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

const createHtml = (table: any, studentDetails: any) => `
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
                        src="${config.FRONT_END_URL}/assets/images/logo.png">
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
                <td>Order Id: dl${commonService.generateRandom(6)}</td>
                <td>Name: ${studentDetails.firstname} ${studentDetails.lastname}</td>
            </tr>
            <tr>
                <td>PAN Number: AAFCD6967P</td>
                <td>Email Id: ${studentDetails.email}</td>
            </tr>
            <tr>
                <td>GSTIN Number: 36AAFCD6967P1ZS</td>
                <td>Invoice Number: #${commonService.generateRandom(7)}</td>
            </tr>
            <tr>
                <td>State: Telangana</td>
                <td>Invoice Date: ${commonService.generateInvoiceDate()}</td>
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
    private doesFileExist = (filePath: any) => {
      try {
        fs.statSync(filePath); // get information of the specified file path.
        return true;
      } catch (error) {
        return false;
      }
    }
    public generateInvoice = async (studentDetails: any, courses: any) => {
        return new Promise(async (resolve, reject) => {
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
              pdf.create(html, options).toFile('./invoiceBuilder.pdf', (err: any, res: any) => {
                if (err) throw err;      
                resolve({data: 'Generated'});          
              });
              // await this.initPrintPdf();
              // resolve({data: 'Generated'});          
          } catch (error) {
              console.log('Failed in generating');
              reject(error);
          }
        });
    }
    
    private initPrintPdf = async () => {
      try {
        if (this.doesFileExist(buildPaths)) {
          fs.unlinkSync(buildPaths.buildPathPdf);
        }
        const pdf = await this.printPdf();
        fs.writeFileSync(buildPaths.buildPathPdf, pdf);
        console.log('Succesfully Created an PDF');
      } catch (error) {
        console.log('Failed in creating pdf');
        throw error;
      }
    }

    private printPdf = async () => {
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
      } catch(error) {
        console.log('Failed scaning');
        throw 'Failed in scaning';
      }
    }

    public calculateTaxableValue(price: any) {
      return price + ((price * 18) / 100);
    }
}

export const generateInvoice: any = new GenerateInvoice();
