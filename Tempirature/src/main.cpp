#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <NextMPU6050.h>  // <--- L-bibliothèque jdida dyalek
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
const int SDA_PIN = 21; // ESP32 I2C
const int SCL_PIN = 22;

// TM1637
#define PIN_CLK 18
#define PIN_DIO 5
NextTM1637 display(PIN_CLK, PIN_DIO);

// Capteurs
Adafruit_BME280 bme; 
NextMPU6050 mpu; // <--- Objet b l-bibliothèque jdida

// Variables globales
unsigned long lastMsg = 0;
bool bmeStatus = false;
bool mpuStatus = false;
bool lastButtonState = false; 

// --- Variables l-Moyenne Glissante (Vibrations) ---
#define WINDOW_SIZE 10
float vibration_history[WINDOW_SIZE];
int readIndex = 0;
float totalVibration = 0;
float averageVibration = 0;

void reconnect() {
  while (!client.connected()) {
    Serial.print("Kan-connecta l-MQTT...");
    String clientId = "MiningBoard-";
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
  
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW); 

  display.begin();
  display.setBrightness(4);

  // Initialisation I2C b les pins li 3titi f l'exemple
  Wire.begin(SDA_PIN, SCL_PIN);

  // Initialisation BME280
  bmeStatus = bme.begin(0x76);
  if (!bmeStatus) { 
    bmeStatus = bme.begin(0x77);
  }
  if (!bmeStatus) Serial.println("⚠️ BME280 mazal ma-mconnectich!");
  else Serial.println("✅ BME280 m-connecti mzyan!");

  // Initialisation NextMPU6050
  mpuStatus = mpu.begin();
  if (!mpuStatus) {
    Serial.println("⚠️ MPU6050 mazal ma-mconnectich! (NextMPU)");
  } else {
    Serial.println("✅ MPU6050 m-connecti mzyan! (NextMPU)");
  }

  // Initialisation tableau vibrations
  for (int i = 0; i < WINDOW_SIZE; i++) vibration_history[i] = 0;

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
  if (!client.connected()) reconnect();
  client.loop();

  bool currentButtonState = (digitalRead(PIN_BUTTON) == LOW); 

  // -- Alarme instantanée (Bouton SOS) --
  if (currentButtonState == true && lastButtonState == false) {
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_RED, HIGH);
      digitalWrite(PIN_BUZZER, HIGH); 
      Serial.println("[🔊 BUZZER] : BZZZZZZZ BZZZZZZZ (SOS URGENCE) !"); 
      delay(50);
  }
  lastButtonState = currentButtonState;

  unsigned long now = millis();
  if (now - lastMsg > 1000) { 
    lastMsg = now;

    // --- 1. L-9iraya dyal BME280 ---
    float temp = bmeStatus ? bme.readTemperature() : NAN;
    float hum = bmeStatus ? bme.readHumidity() : NAN;
    float pres = bmeStatus ? bme.readPressure() / 100.0F : NAN; 

    if (bmeStatus && !isnan(temp)) display.showNumber((int)temp);
    else display.showNumber(0000); 

    // --- 2. L-9iraya dyal NextMPU6050 o l-Moyenne Glissante ---
    if (mpuStatus) {
      // 9iraya dyal les axes b les fonctions jdad
      float ax = mpu.getAccelX();
      float ay = mpu.getAccelY();
      float az = mpu.getAccelZ();

      // Hna maghadich n9essmo 3la 9.81 7it NextMPU kaye3tik l-vibration b l-"G" direct!
      float magnitude_g = sqrt(pow(ax, 2) + pow(ay, 2) + pow(az, 2));
      float deviation = abs(magnitude_g - 1.0); // Ch7al b3ida 3la gravité normale (1g)

      // Moyenne Glissante bach n7iydo l-bruit (Filtre logiciel)
      totalVibration -= vibration_history[readIndex];
      vibration_history[readIndex] = deviation;
      totalVibration += vibration_history[readIndex];
      readIndex = (readIndex + 1) % WINDOW_SIZE;
      averageVibration = totalVibration / WINDOW_SIZE;
    }

    // --- 3. Logique de Détection des Dangers ---
    bool isDanger = false;
    String alertType = "NONE";

    if (currentButtonState) {
      isDanger = true;
      alertType = "SOS_BUTTON_PRESSED";
    } else if (bmeStatus && temp > 28.0) {
      isDanger = true;
      alertType = "HIGH_TEMPERATURE";
    } else if (mpuStatus && averageVibration > 0.8) {
      isDanger = true;
      alertType = "BEARING_FAULT"; // Vibration tal3a!
    }

    // Actionnement dyal les Actuateurs
    if (isDanger) {
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_RED, HIGH);
      digitalWrite(PIN_BUZZER, HIGH); 
      Serial.println("🚨 ALERTE CRITIQUE : " + alertType);
    } else {
      digitalWrite(PIN_LED_RED, LOW);
      digitalWrite(PIN_LED_GREEN, HIGH);
      digitalWrite(PIN_BUZZER, LOW);  
    }

    // --- 4. T-wjad dyal l-JSON ---
    StaticJsonDocument<250> doc;
    doc["device_id"] = "VentilationNode_04";
    
    if (!bmeStatus || isnan(temp)) {
       doc["temperature"] = nullptr;
       doc["humidity"] = nullptr;
    } else {
       doc["temperature"] = int(temp * 100) / 100.0;
       doc["humidity"] = int(hum * 100) / 100.0;
    }
    
    if (mpuStatus) {
       doc["vibration_level"] = int(averageVibration * 100) / 100.0;
    } else {
       doc["vibration_level"] = nullptr;
    }
    
    doc["sos_alert"] = currentButtonState;
    doc["status"] = isDanger ? "DANGER" : "SAFE";
    if (isDanger) doc["alert_reason"] = alertType;

    String jsonString;
    serializeJson(doc, jsonString);

    // Siftan l-HiveMQ
    client.publish("mine/sensors/telemetry", jsonString.c_str());
    
    Serial.print("Data m-sifta: ");
    Serial.println(jsonString);
  }
}