import randomBytes from 'randombytes';
class CommonService {
    public generateRandom = (length: any) => {
        const numbers = '0123456789';
        let result = '';
        for (var i = length; i > 0; --i) {
            result += numbers[Math.round(Math.random() * (numbers.length - 1))];
        }
        return result;
    }
    public generateInvoiceDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${month}/${day}/${year}`;
    }
    public generateRandomBytes = (bytes = 12) => {
        return new Promise( (resolve, reject) => {
            try {
                randomBytes(bytes, (err: any, buffer: any) => {
                    if (err) {
                        throw err;
                    } else {                    
                        resolve(buffer.toString('hex'));
                    }                     
                });
            } catch(error) {
                reject(error);
            }
        });
    }
}

export const commonService: any = new CommonService();