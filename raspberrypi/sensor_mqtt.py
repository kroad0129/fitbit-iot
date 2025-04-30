import paho.mqtt.client as mqtt
import Adafruit_DHT
import time
import json

with open("config.json", "r") as f:
    config = json.load(f)

MQTT_BROKER = config["mqtt_broker"]
MQTT_PORT = config["mqtt_port"]
MQTT_TOPIC = config["mqtt_topic"]
DHT_PIN = config["dht_pin"]
DHT_TYPE = Adafruit_DHT.DHT22 if config["dht_type"] == "DHT22" else Adafruit_DHT.DHT11

client = mqtt.Client()
client.connect(MQTT_BROKER, MQTT_PORT)

while True:
    humidity, temperature = Adafruit_DHT.read_retry(DHT_TYPE, DHT_PIN)

    if humidity is not None and temperature is not None:
        payload = {
            "temperature": round(temperature, 1),
            "humidity": round(humidity, 1)
        }
        client.publish(MQTT_TOPIC, json.dumps(payload))
        print("📡 전송됨:", payload)
    else:
        print("⚠️ 센서 읽기 실패")

    time.sleep(5)
