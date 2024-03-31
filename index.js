require('dotenv').config(); 

const AWS = require('aws-sdk');
AWS.config.logger = console; 

const multer = require('multer');
const express = require('express');
const app = express();
const path = require('path');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const s3Client = new AWS.S3({
  region: 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype
  };

  try {
    await s3Client.putObject(params).promise();
    console.log('File uploaded to S3 successfully!');
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};


app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    await uploadToS3(file);
    res.status(200).send('File uploaded to S3 successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to S3');
  }
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(3003, () => {
  console.log('Server is running on port 3003');
});
