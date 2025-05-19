import paho.mqtt.client as mqtt
import time
import json
from datetime import datetime
import RPi.GPIO as GPIO
import board
import adafruit_dht

# GPIO 설정
GPIO.setmode(GPIO.BCM)

# DHT22 온습도 센서 설정
dht = adafruit_dht.DHT22(board.D4)  # GPIO 4번 핀

# MQ-135 가스 센서 설정 (디지털 출력)
GAS_SENSOR_PIN = 18  # GPIO 18번 핀
GPIO.setup(GAS_SENSOR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)  # 풀업 저항 활성화

# MQTT 브로커 설정
MQTT_BROKER = "192.168.234.35"  # MQTT 브로커 주소
MQTT_PORT = 1883
MQTT_TOPIC = "sensors/data"

# MQTT 클라이언트 생성
client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print(f"MQTT 브로커 연결됨 (결과 코드: {rc})")

def on_publish(client, userdata, mid):
    print(f"메시지 발행됨 (메시지 ID: {mid})")

# 콜백 함수 설정
client.on_connect = on_connect
client.on_publish = on_publish

# MQTT 브로커 연결
client.connect(MQTT_BROKER, MQTT_PORT, 60)

def read_sensors():
    try:
        # DHT22 온습도 센서 읽기
        temperature = dht.temperature
        humidity = dht.humidity
        
        # MQ-135 가스 센서 읽기 (디지털 출력)
        gas_detected = GPIO.input(GAS_SENSOR_PIN) == GPIO.LOW  # LOW일 때 가스 감지
        
        return {
            "temperature": round(temperature, 1) if temperature is not None else 0,
            "humidity": round(humidity, 1) if humidity is not None else 0,
            "gasDetected": gas_detected,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"센서 읽기 오류: {e}")
        return {
            "temperature": 0,
            "humidity": 0,
            "gasDetected": False,
            "timestamp": datetime.now().isoformat()
        }

# 메인 루프
try:
    while True:
        # 센서 데이터 읽기
        sensor_data = read_sensors()
        
        # JSON 형식으로 변환
        payload = json.dumps(sensor_data)
        
        # MQTT로 데이터 발행
        client.publish(MQTT_TOPIC, payload)
        print(f"발행된 데이터: {payload}")
        
        # 5초 대기
        time.sleep(5)

except KeyboardInterrupt:
    print("프로그램 종료")
    client.disconnect()
    GPIO.cleanup() 