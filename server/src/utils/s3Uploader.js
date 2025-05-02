require('dotenv').config();
const AWS = require('aws-sdk');

// ✅ AWS S3 객체 생성
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * 하루 단위로 로그 파일을 누적 저장하는 함수
 * 실패 시도 무조건 try-catch로 감싸 사용하세요.
 *
 * @param {Object} logData - 새로 추가할 센서 로그
 * @param {string} dateString - 예: '2025-05-02'
 * @returns {Promise<string>} s3Key 반환
 */
async function appendLogToS3(logData, dateString) {
    const s3Key = `logs/${dateString}/log_${dateString}.json`;
    let logs = [];

    try {
        // ✅ 기존 S3 로그 파일 가져오기
        const existing = await s3
            .getObject({
                Bucket: process.env.S3_BUCKET,
                Key: s3Key,
            })
            .promise();

        logs = JSON.parse(existing.Body.toString());
    } catch (err) {
        if (err.code === 'NoSuchKey') {
            console.log('📁 최초 로그 생성:', s3Key);
        } else {
            // ⚠️ 예기치 않은 오류는 여기서 잡고 무시 (서버 멈추지 않게)
            console.error('❌ S3 getObject 실패:', err.message);
            return '[업로드 실패: getObject]';
        }
    }

    // ✅ 새 로그 추가
    logs.push(logData);

    try {
        // ✅ 덮어쓰기 업로드
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: s3Key,
            Body: JSON.stringify(logs, null, 2),
            ContentType: 'application/json',
        };

        await s3.upload(params).promise();
        return s3Key;
    } catch (err) {
        console.error('❌ S3 upload 실패:', err.message);
        return '[업로드 실패: upload]';
    }
}

module.exports = { appendLogToS3 };
