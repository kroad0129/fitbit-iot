import paho.mqtt.client as mqtt
import Adafruit_DHT
import RPi.GPIO as GPIO
import time
import json
import os
from twilio.rest import Client

# 설정 파일 로드
with open("config.json", "r") as f:
    config = json.load(f)

# MQTT 설정
MQTT_BROKER = config["mqtt_broker"]
MQTT_PORT = config["mqtt_port"]
MQTT_TOPIC = config["mqtt_topic"]

# 센서 설정
DHT_PIN = config["dht_pin"]
GAS_SENSOR_PIN = config["gas_pin"]
DHT_TYPE = Adafruit_DHT.DHT11

# Twilio 설정
twilio_sid = config["twilio_sid"]
twilio_token = config["twilio_token"]
twilio_from = config["twilio_from"]
twilio_to = config["twilio_to"]

HUMIDITY_THRESHOLD = config["humidity_threshold"]
STATUS_FILE = "humidity_alert_status.txt"

# GPIO 설정
GPIO.setmode(GPIO.BCM)
GPIO.setup(GAS_SENSOR_PIN, GPIO.IN)

# MQTT 클라이언트 설정
client = mqtt.Client(client_id="raspberry")
client.tls_set(
    ca_certs="root-CA.crt",
    certfile="raspberry.cert.pem",
    keyfile="raspberry.private.key"
)
client.connect(MQTT_BROKER, MQTT_PORT)
client.loop_start()

# Twilio 클라이언트
twilio_client = Client(twilio_sid, twilio_token)

# 상태 저장/불러오기 함수
def get_previous_status():
    if os.path.exists(STATUS_FILE):
        with open(STATUS_FILE, 'r') as f:
            return f.read().strip()
    return "normal"

def set_status(status):
    with open(STATUS_FILE, 'w') as f:
        f.write(status)

try:
    while True:
        humidity, temperature = Adafruit_DHT.read_retry(DHT_TYPE, DHT_PIN)
        gas_detected = GPIO.input(GAS_SENSOR_PIN) == 0  # LOW일 때 감지됨

        if humidity is not None and temperature is not None:
            payload = {
                "temperature": round(temperature, 1),
                "humidity": round(humidity, 1),
                "gas_detected": gas_detected
            }

            # 습도 임계값 체크 및 문자 전송
            previous_status = get_previous_status()

            if humidity > HUMIDITY_THRESHOLD:
                if previous_status == "normal":
                    message = twilio_client.messages.create(
                        body=f"⚠️ 습도 경고: 현재 습도 {humidity:.1f}%",
                        from_=twilio_from,
                        to=twilio_to
                    )
                    print("📩 문자 전송:", message.sid)
                    set_status("alert")
                else:
                    print("💡 문자 이미 보냄, 현재 습도:", humidity)
            else:
                if previous_status == "alert":
                    print("✅ 습도 정상화됨, 상태 초기화")
                set_status("normal")

            client.publish(MQTT_TOPIC, json.dumps(payload))
            print("📡 MQTT 전송됨:", payload)
        else:
            print("⚠️ 온습도 센서 읽기 실패")

        time.sleep(5)

except KeyboardInterrupt:
    print("\n🛑 종료: GPIO 정리 중")
    GPIO.cleanup()
