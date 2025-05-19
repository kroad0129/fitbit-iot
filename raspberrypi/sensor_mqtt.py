import paho.mqtt.client as mqtt
import Adafruit_DHT
import RPi.GPIO as GPIO
import time
import json

# 설정 파일 로드
with open("config.json", "r") as f:
    config = json.load(f)

# MQTT 설정
MQTT_BROKER = config["mqtt_broker"]
MQTT_PORT = config["mqtt_port"]
MQTT_TOPIC = config["mqtt_topic"]

# 센서 핀 설정
DHT_PIN = config["dht_pin"]
GAS_SENSOR_PIN = config["gas_pin"]

# 센서 타입 고정
DHT_TYPE = Adafruit_DHT.DHT11

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

try:
    while True:
        # 센서 데이터 읽기
        humidity, temperature = Adafruit_DHT.read_retry(DHT_TYPE, DHT_PIN)
        gas_detected = GPIO.input(GAS_SENSOR_PIN) == 0  # LOW일 때 감지됨

        if humidity is not None and temperature is not None:
            payload = {
                "temperature": round(temperature, 1),
                "humidity": round(humidity, 1),
                "gas_detected": gas_detected
            }
            client.publish(MQTT_TOPIC, json.dumps(payload))
            print("📡 전송됨:", payload)
        else:
            print("⚠️ 온습도 센서 읽기 실패")

        time.sleep(5)

except KeyboardInterrupt:
    print("\n🛑 종료: GPIO 정리 중")
    GPIO.cleanup()
