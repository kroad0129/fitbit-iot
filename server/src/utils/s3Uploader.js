require('dotenv').config();
const AWS = require('aws-sdk');

// S3 클라이언트 생성
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

/**
 * S3에 JSON 데이터를 직접 업로드
 * @param {Object} jsonData - 업로드할 JSON 객체
 * @param {string} s3Key - S3 버킷 내 저장 경로 (예: logs/2024-05-02/log_2024-05-02T10:12:00.json)
 * @returns {Promise}
 */
function uploadLogFile(jsonData, s3Key) {
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: JSON.stringify(jsonData, null, 2),
        ContentType: 'application/json'
    };

    return s3.upload(params).promise()
        .then((data) => {
            console.log("✅ S3 업로드 성공:", data.Location);
        })
        .catch((err) => {
            console.error("❌ S3 업로드 실패:", err);
        });
}

module.exports = { uploadLogFile };
