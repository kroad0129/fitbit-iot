import paho.mqtt.client as mqtt
import time
import json
import random  # 테스트용 임시 데이터 생성
from datetime import datetime
import RPi.GPIO as GPIO
import board
import adafruit_dht
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

# GPIO 설정
GPIO.setmode(GPIO.BCM)

# DHT22 온습도 센서 설정
dht = adafruit_dht.DHT22(board.D4)  # GPIO 4번 핀

# ADS1115 ADC 설정
i2c = board.I2C()
ads = ADS.ADS1115(i2c)
chan = AnalogIn(ads, ADS.P0)  # A0 핀 사용

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
        
        # MQ-135 가스 센서 읽기 (ADS1115 사용)
        gas_value = chan.value
        gas_voltage = chan.voltage
        
        # 가스 레벨을 0-100 사이의 값으로 정규화
        # ADS1115는 16비트 ADC (0-65535)
        gas_level = min(100, max(0, (gas_value / 65535) * 100))
        
        return {
            "temperature": round(temperature, 1) if temperature is not None else 0,
            "humidity": round(humidity, 1) if humidity is not None else 0,
            "gasLevel": round(gas_level, 1),
            "gasValue": round(gas_value, 1),
            "gasVoltage": round(gas_voltage, 3),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"센서 읽기 오류: {e}")
        return {
            "temperature": 0,
            "humidity": 0,
            "gasLevel": 0,
            "gasValue": 0,
            "gasVoltage": 0,
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