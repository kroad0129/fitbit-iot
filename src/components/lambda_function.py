import json
import boto3
import time
import os
import smtplib
from decimal import Decimal
from email.mime.text import MIMEText
from botocore.exceptions import ClientError

# DynamoDB 연결
dynamodb = boto3.resource('dynamodb')
data_table = dynamodb.Table('Data')

# 이메일 환경변수
EMAIL_SENDER = os.environ.get("EMAIL_SENDER")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD")
EMAIL_RECEIVER = os.environ.get("EMAIL_RECEIVER")

# Decimal 직렬화
def decimal_to_native(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError

# 이메일 전송 함수
def send_email(subject, message, sensor_data=None):
    print("📨 이메일 전송 시도 중...")
    
    # 이메일 본문 구성
    email_body = f"""
    <html>
    <body>
        <h2>건강 이상 감지 알림</h2>
        <p><strong>발생 시간:</strong> {sensor_data.get('timestamp', '알 수 없음')}</p>
        <p><strong>이상 징후:</strong> {message}</p>
        <hr>
        <h3>센서 데이터</h3>
        <ul>
            <li>온도: {sensor_data.get('temperature', 'N/A')}°C</li>
            <li>습도: {sensor_data.get('humidity', 'N/A')}%</li>
            <li>가스 상태: {sensor_data.get('gasDetection', 'N/A')}</li>
        </ul>
    </body>
    </html>
    """
    
    msg = MIMEText(email_body, 'html')
    msg["Subject"] = subject
    msg["From"] = EMAIL_SENDER
    msg["To"] = EMAIL_RECEIVER

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        print("✅ 이메일 전송 완료")
        return {"statusCode": 200, "message": "이메일 전송 성공"}
    except smtplib.SMTPException as e:
        print("❌ 이메일 전송 실패:", str(e))
        return {"statusCode": 500, "message": f"이메일 전송 오류: {str(e)}"}
    except Exception as e:
        print("❌ 이메일 전송 실패:", str(e))
        return {"statusCode": 500, "message": f"알 수 없는 오류 발생: {str(e)}"}

# Lambda 핸들러
def lambda_handler(event, context):
    print("📥 Lambda triggered:", json.dumps(event))

    method = event.get("httpMethod", "")
    path = event.get("resource") or event.get("path") or ""

    # IoT → Lambda 직접 전달 (센서 데이터 처리)
    if "temperature" in event and "humidity" in event:
        item = {
            "timestamp": str(int(time.time())),
            "temperature": Decimal(str(event.get("temperature", 0))),
            "humidity": Decimal(str(event.get("humidity", 0))),
            "gas_detected": Decimal(1 if event.get("gas_detected") else 0),
            "heart_rate": Decimal(str(event.get("heart_rate", 0)))
        }

        # 데이터 테이블에 추가 (업데이트 방식)
        data_table.put_item(Item=item)
        print("📦 [IoT] 센서 데이터 저장:", item)
        return {"statusCode": 200, "body": "IoT 데이터 저장 완료"}

    # React → POST /sensor (센서 데이터 저장)
    if method == "POST" and "/sensor" in path:
        try:
            body = event.get("body", "{}")
            if isinstance(body, str):
                body = json.loads(body)

            item = {
                "timestamp": str(int(time.time())),
                "temperature": Decimal(str(body.get("temperature", 0))),
                "humidity": Decimal(str(body.get("humidity", 0))),
                "gas_detected": Decimal(1 if body.get("gas_detected") else 0),
                "heart_rate": Decimal(str(body.get("heart_rate", 0)))
            }

            # 데이터 테이블에 추가 (업데이트 방식)
            data_table.put_item(Item=item)
            print("📦 [API] 센서 데이터 저장:", item)

            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"message": "데이터 저장 완료"})
            }

        except Exception as e:
            print("❌ POST /sensor 오류:", str(e))
            return {
                "statusCode": 500,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": str(e)})
            }

    # React → POST /alert (이메일 전송)
    elif method == "POST" and "/alert" in path:
        try:
            body = json.loads(event.get("body", "{}"))
            subject = body.get("subject", "건강 이상 알림")
            reason = body.get("reason", "비정상 상태 감지")
            sensor_data = body.get("sensorData", {})

            # 이메일 전송
            print(f"📩 이메일 전송 준비: {subject}, {reason}")
            result = send_email(subject, reason, sensor_data)
            
            if result["statusCode"] != 200:
                return {
                    "statusCode": result["statusCode"],
                    "headers": {"Access-Control-Allow-Origin": "*"},
                    "body": json.dumps({"error": result["message"]})
                }
                
            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"message": "이메일 전송됨"})
            }

        except Exception as e:
            print("❌ POST /alert 오류:", str(e))
            return {
                "statusCode": 500,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": str(e)})
            }

    # GET /sensor : 데이터 조회
    elif method == "GET" and "/sensor" in path:
        try:
            resp = data_table.scan()
            items = resp.get("Items", [])
            items_sorted = sorted(
                [x for x in items if x.get("timestamp", "0").isdigit()],
                key=lambda x: int(x["timestamp"]),
                reverse=True
            )

            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps(items_sorted, default=decimal_to_native)
            }

        except Exception as e:
            print("❌ GET /sensor 오류:", str(e))
            return {
                "statusCode": 500,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": str(e)})
            }

    # 허용되지 않은 요청
    return {
        "statusCode": 405,
        "headers": {"Access-Control-Allow-Origin": "*"},
        "body": json.dumps({"message": "Method not allowed"})
    }
