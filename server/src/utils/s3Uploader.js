try {
    const s3Key = await appendLogToS3(logData, dateString);
    console.log(`☁️ S3 로그 저장 완료: ${s3Key}`);
} catch (err) {
    console.error('❌ S3 업로더 실패:', err.message);
}
