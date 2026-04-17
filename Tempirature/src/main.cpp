#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <NextMPU6050.h>  
#include <NextTM1637.h>
#include <ArduinoJson.h> 
#include <Preferences.h>

// ==========================================
// --- CONFIGURATION CLOUD ---
// ==========================================
const char* mqtt_server = "199c676f864e4139ad68223e0541c9d2.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;                            
const char* mqtt_user = "abdo2";              
const char* mqtt_pass = "abdo123456789--Q"; 

WiFiClientSecure espClient;
PubSubClient client(espClient);

// ==========================================
// --- CONFIGURATION ACCESS POINT (AP) ---
// ==========================================
const char* ap_ssid = "Mine_Ventilation_02"; 
const char* ap_pass = "mine1234";            

WebServer server(80); 
Preferences preferences; 

// ==========================================
// --- DEFINITION DES PINS ---
// ==========================================
#define PIN_BUTTON 34  
#define PIN_LED_GREEN 32 
#define PIN_LED_RED 33   
#define PIN_BUZZER 26  
#define PIN_LED_0 25
#define PIN_LED_1 26
const int SDA_PIN = 21; 
const int SCL_PIN = 22;

#define PIN_CLK 18
#define PIN_DIO 5
NextTM1637 display(PIN_CLK, PIN_DIO);

Adafruit_BME280 bme; 
NextMPU6050 mpu; 

// ==========================================
// --- VARIABLES GLOBALES ---
// ==========================================
bool bmeStatus = false;
bool mpuStatus = false;
bool lastButtonState = false; 

#define WINDOW_SIZE 10
float vibration_history[WINDOW_SIZE];
int readIndex = 0;
float totalVibration = 0;
float averageVibration = 0;

float currentTemp = NAN;
float currentHum = NAN;
bool currentSOS = false;
bool isDanger = false;
String alertType = "NONE";

unsigned long lastUpdate = 0;
unsigned long lastReconnectAttempt = 0; 

// ==========================================
// --- FONCTIONS WEB (API & WIFI MANAGER) ---
// ==========================================

void handleDataApi() {
  JsonDocument doc;
  doc["device_id"] = "VentilationNode_02";
  
  // FIX: Rje3na l IF/ELSE l-3adiya bach C++ may-t9le9ch
  if (!bmeStatus || isnan(currentTemp)) {
     doc["temperature"] = nullptr;
     doc["humidity"] = nullptr;
  } else {
     doc["temperature"] = int(currentTemp * 100) / 100.0;
     doc["humidity"] = int(currentHum * 100) / 100.0;
  }
  
  if (mpuStatus) {
     doc["vibration_level"] = int(averageVibration * 100) / 100.0;
  } else {
     doc["vibration_level"] = nullptr;
  }
  
  doc["sos_alert"] = currentSOS;
  doc["status"] = isDanger ? "DANGER" : "SAFE";
  if (isDanger) doc["alert_reason"] = alertType;

  String jsonString;
  serializeJson(doc, jsonString);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", jsonString);
}

void handleRoot() {
  Serial.println("Kan-scanni l-WiFi bach n-wjed l-Interface...");
  int n = WiFi.scanNetworks();
  
  String html = "<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>";
  html += "<style>body{background-color:#09090b;color:#f59e0b;font-family:sans-serif;text-align:center;padding:40px 20px;}";
  html += "select,input{padding:12px;margin:10px 0;width:100%;max-width:300px;border-radius:5px;border:1px solid #f59e0b;background:#18181b;color:white;}";
  html += "button{background-color:#f59e0b;color:black;border:none;padding:15px;font-weight:bold;border-radius:5px;cursor:pointer;width:100%;max-width:300px;}";
  html += "button:hover{background-color:#d97706;}</style></head><body>";
  
  html += "<h2>📡 Mine Network Setup</h2><p>Sélectionnez le réseau Wi-Fi :</p>";
  html += "<form action='/save' method='POST'>";
  html += "<select name='ssid'>";
  
  if (n == 0) {
    html += "<option value=''>Aucun réseau trouvé</option>";
  } else {
    for (int i = 0; i < n; ++i) {
      html += "<option value='" + WiFi.SSID(i) + "'>" + WiFi.SSID(i) + " (" + String(WiFi.RSSI(i)) + "dBm)</option>";
    }
  }
  
  html += "</select><br>";
  html += "<input type='password' name='pass' placeholder='Mot de passe du Wi-Fi' required><br><br>";
  html += "<button type='submit'>Connecter l'ESP32</button>";
  html += "</form></body></html>";

  server.send(200, "text/html", html);
}

void handleSave() {
  String new_ssid = server.arg("ssid");
  String new_pass = server.arg("pass");

  preferences.begin("wifi-config", false);
  preferences.putString("ssid", new_ssid);
  preferences.putString("pass", new_pass);
  preferences.end();

  String html = "<!DOCTYPE html><html><body style='background:#09090b;color:#10b981;text-align:center;padding:50px;font-family:sans-serif;'>";
  html += "<h2>✅ Sauvegarde Réussie !</h2><p>L'ESP32 va redémarrer et se connecter à <b>" + new_ssid + "</b>.</p></body></html>";
  server.send(200, "text/html", html);

  Serial.println("WiFi m-sauvegardé ! Redémarrage f 2 tawan...");
  delay(2000);
  ESP.restart(); 
}

// ==========================================
// --- SETUP ---
// ==========================================
void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED_1, OUTPUT); digitalWrite(PIN_LED_1, HIGH);
  pinMode(PIN_LED_0, OUTPUT); digitalWrite(PIN_LED_0, HIGH);
  
  pinMode(PIN_BUTTON, INPUT); pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT); pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_BUZZER, LOW); 

  display.begin(); display.setBrightness(4);
  Wire.begin(SDA_PIN, SCL_PIN);

  bmeStatus = bme.begin(0x76);
  if (!bmeStatus) bmeStatus = bme.begin(0x77);

  mpuStatus = mpu.begin();
  for (int i = 0; i < WINDOW_SIZE; i++) vibration_history[i] = 0;

  Serial.println("\nKan-ch3el l-Access Point...");
  WiFi.mode(WIFI_AP_STA); 
  WiFi.softAP(ap_ssid, ap_pass);
  Serial.print("✅ AP mch3oul! Smiya: "); Serial.println(ap_ssid);
  Serial.print("🌐 Page de configuration & API IP: "); Serial.println(WiFi.softAPIP());

  preferences.begin("wifi-config", true); 
  String saved_ssid = preferences.getString("ssid", "");
  String saved_pass = preferences.getString("pass", "");
  preferences.end();

  if (saved_ssid != "") {
    Serial.println("L9it WiFi f d-dakira: " + saved_ssid);
    WiFi.begin(saved_ssid.c_str(), saved_pass.c_str());
    
    int wifi_timeout = 0;
    while (WiFi.status() != WL_CONNECTED && wifi_timeout < 20) {
      delay(500); Serial.print("."); wifi_timeout++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n✅ M-connecti m3a l-Router! IP: " + WiFi.localIP().toString());
    } else {
      Serial.println("\n⚠️ L-mot de passe ghalat wla réseau b3id. N-tsnna l-configuration mn l-Interface.");
    }
  } else {
    Serial.println("⚠️ Makayn 7ta WiFi f d-dakira. Dkhel l- 192.168.4.1 bach d-dir l-config!");
  }

  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);

  server.on("/", HTTP_GET, handleRoot);            
  server.on("/save", HTTP_POST, handleSave);       
  server.on("/api/data", HTTP_GET, handleDataApi); 

  server.onNotFound([]() {
    server.send(404, "text/plain", "Error 404: Endpoint ma-mowjoudch.");
  });
  server.begin();
}

// ==========================================
// --- LOOP PRINCIPALE ---
// ==========================================
void loop() {
  server.handleClient();

  if (WiFi.status() == WL_CONNECTED) {
    if (!client.connected()) {
      unsigned long now = millis();
      if (now - lastReconnectAttempt > 5000) { 
        lastReconnectAttempt = now;
        Serial.print("Kan-siyyi n-connecta l-HiveMQ...");
        String clientId = "MiningBoard-" + String(random(0xffff), HEX);
        if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
          Serial.println(" ✅ M-connecti!");
        } else {
          Serial.println(" ❌ Fchel.");
        }
      }
    } else {
      client.loop(); 
    }
  }

  unsigned long now = millis();
  if (now - lastUpdate > 1000) { 
    lastUpdate = now;

    currentSOS = (digitalRead(PIN_BUTTON) == LOW); 
    if (currentSOS == true && lastButtonState == false) {
        Serial.println("[🔊 BUZZER] : SOS URGENCE!"); 
    }
    lastButtonState = currentSOS;

    currentTemp = bmeStatus ? bme.readTemperature() : NAN;
    currentHum = bmeStatus ? bme.readHumidity() : NAN;

    if (bmeStatus && !isnan(currentTemp)) display.showNumber((int)currentTemp);
    else display.showNumber(0000); 

    if (mpuStatus) {
      float ax = mpu.getAccelX(); float ay = mpu.getAccelY(); float az = mpu.getAccelZ();
      float magnitude_g = sqrt(pow(ax, 2) + pow(ay, 2) + pow(az, 2));
      float deviation = abs(magnitude_g - 1.0); 

      totalVibration -= vibration_history[readIndex];
      vibration_history[readIndex] = deviation;
      totalVibration += vibration_history[readIndex];
      readIndex = (readIndex + 1) % WINDOW_SIZE;
      averageVibration = totalVibration / WINDOW_SIZE;
    }

    isDanger = false; alertType = "NONE";
    if (currentSOS) { isDanger = true; alertType = "SOS_BUTTON_PRESSED"; }
    else if (bmeStatus && currentTemp > 28.0) { isDanger = true; alertType = "HIGH_TEMPERATURE"; }
    else if (mpuStatus && averageVibration > 0.8) { isDanger = true; alertType = "BEARING_FAULT"; }

    if (isDanger) {
      digitalWrite(PIN_LED_GREEN, LOW); digitalWrite(PIN_LED_RED, HIGH); digitalWrite(PIN_BUZZER, HIGH); 
    } else {
      digitalWrite(PIN_LED_RED, LOW); digitalWrite(PIN_LED_GREEN, HIGH); digitalWrite(PIN_BUZZER, LOW);  
    }

    JsonDocument doc;
    doc["device_id"] = "VentilationNode_02";
    
    // FIX: Rje3na l IF/ELSE l-3adiya hta hna
    if (!bmeStatus || isnan(currentTemp)) {
       doc["temperature"] = nullptr;
       doc["humidity"] = nullptr;
    } else {
       doc["temperature"] = int(currentTemp * 100) / 100.0;
       doc["humidity"] = int(currentHum * 100) / 100.0;
    }
    
    if (mpuStatus) {
       doc["vibration_level"] = int(averageVibration * 100) / 100.0;
    } else {
       doc["vibration_level"] = nullptr;
    }
    
    doc["sos_alert"] = currentSOS;
    doc["status"] = isDanger ? "DANGER" : "SAFE";
    if (isDanger) doc["alert_reason"] = alertType;

    String jsonString;
    serializeJson(doc, jsonString);

    if (client.connected()) {
      client.publish("mine/sensors/telemetry", jsonString.c_str());
    }
  }
  if (currentTemp>=23){
    digitalWrite(PIN_LED_1, LOW); 
  } else {
    digitalWrite(PIN_LED_1, HIGH); 
  }
}