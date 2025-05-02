require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * 지정한 날짜의 로그 파일을 불러와 배열에 누적 저장
 * @param {Object} logData - 새로 추가할 로그 데이터
 * @param {string} dateString - 예: '2025-05-02'
 */
async function appendLogToS3(logData, dateString) {
    const s3Key = `logs/${dateString}/log_${dateString}.json`;

    let logs = [];

    try {
        // 기존 로그 가져오기 (있으면)
        const existing = await s3.getObject({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key,
        }).promise();

        logs = JSON.parse(existing.Body.toString());
    } catch (err) {
        if (err.code !== 'NoSuchKey') {
            throw err; // 예상치 못한 오류는 그대로 throw
        }
        // NoSuchKey는 최초 생성인 경우이므로 무시
    }

    logs.push(logData);

    // 덮어쓰기
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: JSON.stringify(logs, null, 2),
        ContentType: 'application/json',
    };

    await s3.upload(params).promise();
    return s3Key;
}

module.exports = { appendLogToS3 };
