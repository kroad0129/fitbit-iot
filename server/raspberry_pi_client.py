# import paho.mqtt.client as mqtt
# import time
# import json
# from datetime import datetime
import RPi.GPIO as GPIO
import board
import adafruit_dht
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
import time

# GPIO 설정
GPIO.setmode(GPIO.BCM)

# DHT22 온습도 센서 설정
dht = adafruit_dht.DHT22(board.D4)  # GPIO 4번 핀

# ADS1115 설정
i2c = board.I2C()  # 기본 I2C 핀 사용 (GPIO 2=SDA, GPIO 3=SCL)
ads = ADS.ADS1115(i2c)
channel = AnalogIn(ads, ADS.P0)  # AIN0 사용

print("센서 테스트를 시작합니다...")
print("Ctrl+C를 눌러 종료할 수 있습니다.")

try:
    while True:
        try:
            # DHT22 온습도 센서 읽기
            temperature = dht.temperature
            humidity = dht.humidity
            
            # MQ-135 가스 센서 읽기 (아날로그 값)
            gas_value = channel.value
            gas_voltage = channel.voltage
            
            # 센서 값 출력
            print("\n=== 센서 값 ===")
            print(f"온도: {temperature:.1f}°C")
            print(f"습도: {humidity:.1f}%")
            print(f"가스 센서 ADC 값: {gas_value}")
            print(f"가스 센서 전압: {gas_voltage:.3f}V")
            print("==============\n")
            
        except Exception as e:
            print(f"센서 읽기 오류: {e}")
        
        # 2초 대기
        time.sleep(2)

except KeyboardInterrupt:
    print("\n프로그램을 종료합니다.")
    GPIO.cleanup() 