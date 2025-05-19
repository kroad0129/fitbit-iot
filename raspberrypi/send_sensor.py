import json, time
from awscrt import io, mqtt, auth, http
from awsiot import mqtt_connection_builder

ENDPOINT = "au3w4b2r0pnz5-ats.iot.ap-northeast-2.amazonaws.com"
CLIENT_ID = "raspberry"
PATH_TO_CERT = "raspberry.cert.pem"
PATH_TO_KEY = "raspberry.private.key"
PATH_TO_ROOT = "root-CA.crt"
TOPIC = "iot/sensor"

event_loop_group = io.EventLoopGroup(1)
host_resolver = io.DefaultHostResolver(event_loop_group)
client_bootstrap = io.ClientBootstrap(event_loop_group, host_resolver)

mqtt_connection = mqtt_connection_builder.mtls_from_path(
    endpoint=ENDPOINT,
    cert_filepath=PATH_TO_CERT,
    pri_key_filepath=PATH_TO_KEY,
    client_bootstrap=client_bootstrap,
    ca_filepath=PATH_TO_ROOT,
    client_id=CLIENT_ID,
    clean_session=False,
    keep_alive_secs=6
)

print("Connecting to AWS IoT Core...")
connect_future = mqtt_connection.connect()
connect_future.result()
print("Connected!")

# Send mock data
while True:
    message = {
        "temperature": 23.5,
        "heartbeat": 77,
        "timestamp": int(time.time())
    }
    mqtt_connection.publish(
        topic=TOPIC,
        payload=json.dumps(message),
        qos=mqtt.QoS.AT_LEAST_ONCE
    )
    print("Published:", message)
    time.sleep(5)
