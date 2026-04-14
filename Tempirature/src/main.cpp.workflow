#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <NextTM1637.h>
#include <ArduinoJson.h>

// ---  l-WiFi ---
const char* ssid = "x";
const char* password = "12345678900";

// ---  l-MQTT (HiveMQ Cloud) ---
const char* mqtt_server = "199c676f864e4139ad68223e0541c9d2.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;                            
const char* mqtt_user = "abdo2";              
const char* mqtt_pass = "abdo123456789--Q"; 

WiFiClientSecure espClient;
PubSubClient client(espClient);

// --- Définition dyal les Pins ---
#define PIN_BUTTON 34  
#define PIN_LED_GREEN 32 
#define PIN_LED_RED 33   
#define PIN_BUZZER 26  

// TM1637
#define PIN_CLK 18
#define PIN_DIO 5
NextTM1637 display(PIN_CLK, PIN_DIO);

// BME280
Adafruit_BME280 bme; 

// Variables
unsigned long lastMsg = 0;
bool bmeStatus = false;
bool lastButtonState = false; 
void reconnect() {
  while (!client.connected()) {
    Serial.print("Kan-connecta l-MQTT...");
    String clientId = "HospitalBoard-";
    clientId += String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println(" M-connecti!");
    } else {
      Serial.print(" Fchel, rc=");
      Serial.print(client.state());
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  pinMode(PIN_BUTTON, INPUT); 
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  
  // I3dad dyal l-Buzzer
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW); 

  display.begin();
  display.setBrightness(4);

  bmeStatus = bme.begin(0x76);
  if (!bmeStatus) { 
    bmeStatus = bme.begin(0x77);
  }
  
  if (!bmeStatus) {
    Serial.println("⚠️ BME280 mazal ma-mconnectich!");
  } else {
    Serial.println("✅ BME280 m-connecti mzyan!");
  }

  Serial.print("Kan-connecta b WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi M-connecti!");

  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  bool currentButtonState = (digitalRead(PIN_BUTTON) == LOW);

  if (currentButtonState == true && lastButtonState == false) {
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_RED, HIGH);
      digitalWrite(PIN_BUZZER, HIGH); 
      Serial.println("[🔊 BUZZER] : BZZZZZZZ BZZZZZZZ (SOS URGENCE) !"); 
      delay(50);
  }
  
  lastButtonState = currentButtonState;

  unsigned long now = millis();
  if (now - lastMsg > 5000) {
    lastMsg = now;

    float temp = bme.readTemperature();
    float hum = bme.readHumidity();
    float pres = bme.readPressure() / 100.0F; 

    // L-Affichage f TM1637
    if (bmeStatus && !isnan(temp)) {
      display.showNumber((int)temp);
    } else {
      display.showNumber(0000); 
    }

    bool isDanger = false;
    if ((bmeStatus && temp > 28.0) || currentButtonState) {
      isDanger = true;
    }

    if (isDanger) {
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_RED, HIGH);
      digitalWrite(PIN_BUZZER, HIGH); // <--- L-BUZZER KIB9A KHEDDAM F DANGER
      if (!currentButtonState) {
          Serial.println("🚨 ALERTE: L-7arara fayta 28°C!");
      }
    } else {
      digitalWrite(PIN_LED_RED, LOW);
      digitalWrite(PIN_LED_GREEN, HIGH);
      digitalWrite(PIN_BUZZER, LOW);  // <--- L-BUZZER SAKET F SAFE
    }

    // T-wjad dyal l-JSON
    StaticJsonDocument<200> doc;
    doc["device_id"] = "MakerBoard_01";
    
    if (!bmeStatus || isnan(temp)) {
       doc["temperature"] = nullptr;
       doc["humidity"] = nullptr;
       doc["pressure"] = nullptr;
    } else {
       doc["temperature"] = int(temp * 100) / 100.0;
       doc["humidity"] = int(hum * 100) / 100.0;
       doc["pressure"] = int(pres * 100) / 100.0;
    }
    
    doc["sos_alert"] = currentButtonState;
    doc["status"] = isDanger ? "DANGER" : "SAFE";

    String jsonString;
    serializeJson(doc, jsonString);

    // Siftan l-HiveMQ
    client.publish("hospital/sensors", jsonString.c_str());
    
    Serial.print("Data m-sifta: ");
    Serial.println(jsonString);
  }
}