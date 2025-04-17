require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

function uploadLogFile(filePath, s3Key) {
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/json'
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error("❌ S3 업로드 실패:", err);
        } else {
            console.log("✅ S3 업로드 성공:", data.Location);
        }
    });
}

module.exports = { uploadLogFile };
