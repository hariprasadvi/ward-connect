const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

exports.uploadFile = async (file) => {
    // If using multer-s3, the file is already uploaded. This might be for manual uploads.
    // Assuming we use multer-s3 for the controller, but this helper can be useful for other things.
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `meetings/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    return s3.upload(params).promise();
};

exports.getFileStream = (fileKey) => {
    const params = {
        Key: fileKey,
        Bucket: process.env.AWS_BUCKET_NAME
    };
    return s3.getObject(params).createReadStream();
};

exports.getFileSignedUrl = (fileKey) => {
    const params = {
        Key: fileKey,
        Bucket: process.env.AWS_BUCKET_NAME,
        Expires: 3600 // 1 hour
    };
    return s3.getSignedUrl('getObject', params);
};
