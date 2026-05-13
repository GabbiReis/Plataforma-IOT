import time
import random
import requests
import json
import os

API_URL = os.getenv("API_URL", "http://localhost:8000/leituras")

CONFIG_SENSORES = [
    {"id": 1, "nome": "Temp-Ar-01", "tipo": "Temperatura Ar", "unidade": "°C", "significado": "Mede o calor do ambiente."},
    {"id": 2, "nome": "Umid-Ar-01", "tipo": "Umidade Ar", "unidade": "%", "significado": "Mede a água vaporizada no ar."},
    {"id": 3, "nome": "Press-Atmos-01", "tipo": "Pressão Atmosférica", "unidade": "hPa", "significado": "Ajuda a prever mudanças no clima."},
    {"id": 4, "nome": "Temp-Solo-01", "tipo": "Temperatura Solo", "unidade": "°C", "significado": "Mede o calor na zona das raízes."},
    {"id": 5, "nome": "Umid-Solo-01", "tipo": "Umidade Solo", "unidade": "%", "significado": "Indica quando a planta precisa de rega."},
    {"id": 6, "nome": "Nutri-Nitrogenio", "tipo": "Nutriente (N)", "unidade": "mg/kg", "significado": "Essencial para o crescimento verde."},
    {"id": 7, "nome": "Nutri-Fosforo", "tipo": "Nutriente (P)", "unidade": "mg/kg", "significado": "Importante para raízes e flores."},
    {"id": 8, "nome": "Nutri-Potassio", "tipo": "Nutriente (K)", "unidade": "mg/kg", "significado": "Aumenta a resistência a doenças."},
    {"id": 9, "nome": "NDVI-Câmera-01", "tipo": "Saúde (NDVI)", "unidade": "índice", "significado": "Mostra o vigor e a saúde da planta (0 a 1)."},
    {"id": 10, "nome": "Crescimento-Raio-01", "tipo": "Crescimento", "unidade": "cm", "significado": "Mede o aumento no tamanho da planta."}
]

def gerar_valor_realista(tipo_sensor):
    """Gera um número aleatório, mas dentro de uma faixa lógica para o tipo de sensor."""
    if "Temperatura" in tipo_sensor:
        return round(random.uniform(22.0, 35.0), 2)  # 22°C a 35°C
    elif "Umidade" in tipo_sensor:
        return round(random.uniform(40.0, 95.0), 1)  # 40% a 95%
    elif "Pressão" in tipo_sensor:
        return round(random.uniform(1005.0, 1015.0), 1) # hPa
    elif "Nutriente" in tipo_sensor:
        return round(random.uniform(5.0, 150.0), 1)   # mg/kg (N, P, K)
    elif "NDVI" in tipo_sensor:
        return round(random.uniform(0.1, 0.9), 2)    # Índice de 0.1 a 0.9
    elif "Crescimento" in tipo_sensor:
        valor_base = 25.0
        incremento = random.uniform(0.01, 0.05)
        return round(valor_base + incremento, 2) # cm
    return 0.0

print("🌱 Iniciando Central de Simulação Avançada AgriNexus...")
print(f"Total de sensores configurados: {len(CONFIG_SENSORES)}")
print("Pressione Ctrl+C para parar.\n")

while True:
    print("-" * 40)
    
    for sensor in CONFIG_SENSORES:
        valor_simulado = gerar_valor_realista(sensor["tipo"])
        
        payload = {
            "valor": valor_simulado,
            "sensor_id": sensor["id"]
        }

        try:
            resposta = requests.post(API_URL, json=payload, timeout=2)
            
            if resposta.status_code == 200:
                print(f"✅ [{sensor['nome']}]: {valor_simulado}{sensor['unidade']} - {sensor['significado']}")
            else:
                print(f"⚠️ Erro no Sensor {sensor['id']} ({sensor['nome']}): {resposta.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Erro: Não foi possível conectar ao backend. O Docker está rodando?")
            break
        except Exception as e:
            print(f"❌ Erro inesperado: {str(e)}")

    print("-" * 40)
    print("Aguardando 10 segundos para a próxima rodada...")
    time.sleep(10)