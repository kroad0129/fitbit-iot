require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * 센서 로그 데이터를 S3에 단일 JSON 파일로 업로드
 * @param {Object} logData - 업로드할 JSON 객체
 * @param {string} dateString - 날짜 문자열 (예: '2025-05-02')
 * @returns {Promise<string>} - 업로드된 S3 키 반환
 */
async function appendLogToS3(logData, dateString) {
    const timestamp = new Date().toISOString();
    const s3Key = `logs/${dateString}/log_${timestamp}.json`;

    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: JSON.stringify(logData, null, 2),
        ContentType: 'application/json',
    };

    try {
        await s3.upload(params).promise();
        return s3Key;
    } catch (err) {
        console.error('❌ S3 업로드 실패:', err.message);
        return '[S3 업로드 실패]';
    }
}

module.exports = { appendLogToS3 };
