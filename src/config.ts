export default Object.freeze({
  PORT: 3002,
  MONGO_URL: 'mongodb+srv://manideep:manideep@cluster0.njcv8.mongodb.net/dl-lms',
  // MONGO_URL: process.env.MONGO_DB,
  // MONGO_URL: 'mongodb://54.67.55.251:27017/dllms-dev',
  JWT_SECRET: 'sdtcb',
  AWS_S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.S3_SECRET_KEY,
  AWS_S3_BUCKET_NAME: process.env.S3_BUCKET,
  FRONT_END_URL: process.env.FE_URL,
  //SEND_GRID_API_KEY: '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',
  SEND_GRID_API_KEY: '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',
  SERVICE_PROVIDER: 'SendGrid',
  //SENDER_MAIL: 'trainingdli2@yopmail.com'
  SENDER_MAIL: 'lms@digital-lync.com'
});
