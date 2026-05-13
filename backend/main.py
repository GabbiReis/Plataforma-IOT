from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext
import json
import os
import psycopg2
import google.generativeai as genai
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

app = FastAPI(title="AgriNexus API", description="Backend Completo - Autenticação e IoT", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# O Railway fornece a variável DATABASE_URL automaticamente se o banco estiver no mesmo projeto.
# Caso contrário, ele montará usando as variáveis individuais.
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASS = os.getenv("DB_PASS")
    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "railway")
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    perfil = Column(String, default="usuario")
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

class Estufa(Base):
    __tablename__ = "estufas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    localizacao = Column(String(150))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

class Sensor(Base):
    __tablename__ = "sensores"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    tipo = Column(String(50), nullable=False)
    status = Column(String(20), default="ativo")
    estufa_id = Column(Integer, ForeignKey("estufas.id"))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

class Leitura(Base):
    __tablename__ = "leituras"
    id = Column(Integer, primary_key=True, index=True)
    valor = Column(Float, nullable=False)
    sensor_id = Column(Integer, ForeignKey("sensores.id"))
    registrado_em = Column(DateTime(timezone=True), server_default=func.now())
    sensor = relationship("Sensor")

# Novo modelo para a tabela `leituras_iot` que recebe os dados da placa física
class LeituraIoTModel(Base):
    __tablename__ = "leituras_iot"
    id = Column(Integer, primary_key=True, index=True)
    device = Column(String(100))
    umidade_solo = Column(Float)
    temp_ar = Column(Float)
    umid_ar = Column(Float)
    pressao = Column(Float, nullable=True)
    luz = Column(Float, nullable=True)
    salinidade = Column(Float, nullable=True)
    bateria = Column(Float, nullable=True)
    rssi = Column(Integer, nullable=True)
    firmware = Column(String(50), nullable=True)
    registrado_em = Column(DateTime(timezone=True), server_default=func.now())

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
modelo_ia = genai.GenerativeModel('gemini-1.5-flash')

class UsuarioCreate(BaseModel):
    nome_completo: str
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

class EstufaCreate(BaseModel):
    nome: str
    localizacao: str
    usuario_id: int

class SensorCreate(BaseModel):
    nome: str
    tipo: str
    estufa_id: int

class LeituraCreate(BaseModel):
    valor: float
    sensor_id: int

class MensagemChat(BaseModel):
    mensagem: str

# 1. Definindo o "Contrato de Dados" (O que a placa vai mandar)
class LeituraIoT(BaseModel):
    sensor_id: str
    umidade_solo: float
    temperatura: float
    umidade_ar: float
    pressao: Optional[float] = None
    luz: Optional[float] = None
    salinidade: Optional[float] = None
    bateria: Optional[float] = None
    rssi: Optional[int] = None
    firmware: Optional[str] = None

@app.post("/usuarios", tags=["Autenticação"])
def criar_usuario(usuario: UsuarioCreate, db=Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    novo_usuario = Usuario(
        nome_completo=usuario.nome_completo,
        email=usuario.email,
        senha_hash=get_password_hash(usuario.senha)
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return {"mensagem": "Usuário criado com sucesso", "nome": novo_usuario.nome_completo}

@app.post("/login", tags=["Autenticação"])
def login(usuario: UsuarioLogin, db=Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if not user or not verify_password(usuario.senha, user.senha_hash):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    if not user.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo")

    return {
        "mensagem": "Login realizado com sucesso", 
        "usuario": {"id": user.id, "nome_completo": user.nome_completo, "email": user.email, "perfil": user.perfil}
    }

@app.post("/estufas", tags=["IoT - Gestão"])
def criar_estufa(estufa: EstufaCreate, db=Depends(get_db)):
    nova_estufa = Estufa(
        nome=estufa.nome,
        localizacao=estufa.localizacao,
        usuario_id=estufa.usuario_id
    )
    db.add(nova_estufa)
    db.commit()
    db.refresh(nova_estufa)
    return {"mensagem": "Estufa criada com sucesso", "id": nova_estufa.id}

@app.get("/estufas", tags=["IoT - Gestão"])
def listar_estufas(db=Depends(get_db)):
    return db.query(Estufa).all()

@app.post("/sensores", tags=["IoT - Gestão"])
def criar_sensor(sensor: SensorCreate, db=Depends(get_db)):
    novo_sensor = Sensor(
        nome=sensor.nome,
        tipo=sensor.tipo,
        estufa_id=sensor.estufa_id
    )
    db.add(novo_sensor)
    db.commit()
    db.refresh(novo_sensor)
    return {"mensagem": "Sensor cadastrado com sucesso", "id": novo_sensor.id}

@app.get("/sensores", tags=["IoT - Gestão"])
def listar_sensores(db=Depends(get_db)):
    return db.query(Sensor).all()

@app.post("/leituras", tags=["IoT - Dados"])
def registrar_leitura(leitura: LeituraCreate, db=Depends(get_db)):
    nova_leitura = Leitura(valor=leitura.valor, sensor_id=leitura.sensor_id)
    db.add(nova_leitura)
    db.commit()
    return {"mensagem": "Leitura registrada com sucesso", "valor": nova_leitura.valor}

# 2. A Rota que vai receber o POST da placa LILYGO
@app.post("/api/leituras", status_code=201, tags=["IoT - Placa Física"])
async def receber_leitura(leitura: LeituraIoT, x_api_key: str = Header(None), db=Depends(get_db)):
    
    # Validação de Segurança: Garante que só a sua placa pode mandar dados!
    # Lembre-se de colocar a mesma senha lá no código da Arduino IDE
    if x_api_key != "0qVuTNzzoCmkVINzstAWAMuJhTjDNIVN":
        raise HTTPException(status_code=401, detail="Acesso não autorizado. Chave inválida.")

    # Refatorado para usar SQLAlchemy, garantindo consistência e segurança
    try:
        nova_leitura = LeituraIoTModel(
            device=leitura.sensor_id,
            umidade_solo=leitura.umidade_solo,
            temp_ar=leitura.temperatura,
            umid_ar=leitura.umidade_ar,
            pressao=leitura.pressao,
            luz=leitura.luz,
            salinidade=leitura.salinidade,
            bateria=leitura.bateria,
            rssi=leitura.rssi,
            firmware=leitura.firmware
        )
        db.add(nova_leitura)
        db.commit()
        db.refresh(nova_leitura)

        print(f"✅ Leitura salva no banco com sucesso! ID: {nova_leitura.id}")
        
        return {"id": nova_leitura.id, "ok": True}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco: {str(e)}")

@app.get("/api/leituras/ultima", tags=["IoT - Placa Física"])
async def buscar_ultima_leitura(db=Depends(get_db)):
    try:
        resultado = db.query(LeituraIoTModel).order_by(LeituraIoTModel.id.desc()).first()

        if resultado:
            return {
                "temperatura": resultado.temp_ar,
                "umidade_solo": resultado.umidade_solo,
                "pressao": resultado.pressao,
                "luz": resultado.luz,
                "bateria": resultado.bateria,
                "rssi": resultado.rssi
            }
        else:
            return {"temperatura": "--", "umidade_solo": "--", "pressao": "--", "luz": "--", "bateria": "--", "rssi": "--"}

    except Exception as e:
        return {"erro": f"Falha ao buscar no banco: {str(e)}"}

@app.get("/api/leituras/historico", tags=["IoT - Placa Física"])
async def buscar_historico(db=Depends(get_db)):
    try:
        # Busca as 10 últimas leituras, ordenadas pela mais recente primeiro
        resultados = db.query(LeituraIoTModel).order_by(LeituraIoTModel.id.desc()).limit(10).all()

        dados_grafico = []
        # O Recharts desenha da esquerda pra direita, então revertemos a ordem
        for linha in reversed(resultados):
            dados_grafico.append({
                "temperatura": linha.temp_ar,
                "umidade": linha.umidade_solo,
                "hora": f"#{linha.id}"
            })
        return dados_grafico
    except Exception as e:
        print(f"Erro ao buscar histórico: {e}")
        return []

@app.get("/leituras/{sensor_id}", tags=["IoT - Dados"])
def obter_ultimas_leituras(sensor_id: int, db=Depends(get_db)):
    leituras = db.query(Leitura).filter(Leitura.sensor_id == sensor_id).order_by(Leitura.registrado_em.desc()).limit(10).all()
    
    if not leituras:
        return []
        
    return leituras

@app.get("/analises/historico/{sensor_id}", tags=["Análises"])
def obter_historico(sensor_id: int, db=Depends(get_db)):
    leituras = db.query(Leitura).filter(Leitura.sensor_id == sensor_id).order_by(Leitura.registrado_em.desc()).limit(20).all()
    return list(reversed(leituras))

@app.get("/analises/dica-ia/{sensor_id}", tags=["Análises"])
def obter_dica_ia(sensor_id: int, db=Depends(get_db)):
    """Rota turbinada que usa o Gemini para analisar múltiplos sensores ao mesmo tempo."""
    
    sensor_alvo = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor_alvo:
        return {"dica": "Sensor não encontrado."}
    
    leituras_recentes = db.query(Leitura).join(Sensor).filter(Sensor.estufa_id == sensor_alvo.estufa_id).order_by(Leitura.registrado_em.desc()).limit(20).all()
    
    if not leituras_recentes:
        return {"dica": "Aguardando mais dados dos sensores para gerar uma análise agrícola completa..."}

    significados = {
        "Temperatura Ar": "Calor do ambiente (em °C).",
        "Umidade Ar": "Quantidade de água no ar (em %).",
        "Pressão Atmosférica": "Indica mudanças no tempo.",
        "Umidade Solo": "Água disponível para as raízes.",
        "NDVI": "Vigor e saúde geral da planta (0 a 1).",
        "Nitrogênio": "Crescimento verde.",
        "Fósforo": "Raízes e flores.",
        "Potássio": "Resistência a doenças."
    }

    resumo_dados = []
    for leitura in leituras_recentes:
        tipo_curto = leitura.sensor.tipo.split('(')[0].strip()
        significado = significados.get(tipo_curto, leitura.sensor.tipo)
        
        resumo_dados.append({
            "sensor": leitura.sensor.nome,
            "tipo": leitura.sensor.tipo,
            "valor": leitura.valor,
            "significado": significado
        })

    contexto_json = json.dumps(resumo_dados, indent=2, ensure_ascii=False)

    prompt = f"""
    Você é a AgriNexus AI, uma agrônoma virtual de última geração para agricultura de precisão.
    Sua missão é analisar o estado atual da estufa e fornecer insights acionáveis para o agricultor.
    
    Abaixo estão as últimas leituras de todos os sensores da estufa, em formato JSON. 
    O campo 'significado' explica o que cada dado representa para a planta.

    DADOS ATUAIS DOS SENSORES:
    ```json
    {contexto_json}
    ```
    
    Com base nesses dados, escreva uma análise curta e profissional (máximo 4 frases).
    1. Resuma a saúde geral da plantação (olhe o NDVI, Nutrientes e Umidade Solo).
    2. Identifique qualquer risco iminente (ex: estresse térmico, solo seco ou falta de nutrientes).
    3. Recomende uma ação prática imediata para o agricultor (ex: "Ajustar irrigação para o Setor A").
    Use um tom profissional, direto e otimista.
    """

    try:
        resposta = modelo_ia.generate_content(prompt)
        return {"dica": resposta.text}
    except Exception as e:
        print(f"ERRO FATAL NA IA: {str(e)}")
        return {"dica": f"ERRO DO GOOGLE: {str(e)}"}

@app.post("/chat", tags=["IA Chatbot"])
async def chat_agrinexus(req: MensagemChat):
    
    # O SEGREDO DO TCC: Dar uma "personalidade" para o Gemini!
    contexto_do_sistema = """
    Você é a inteligência artificial do sistema AgriNexus, um software de agricultura de precisão.
    Sua missão é ajudar os agricultores a tomarem decisões baseadas em IoT.
    Seja claro, profissional e direto. Use emojis relacionados à agricultura.
    A pergunta do agricultor é: 
    """
    
    try:
        # Junta a personalidade com a pergunta do usuário
        prompt_final = contexto_do_sistema + req.mensagem
        
        # Pede a resposta pro Gemini (usando o modelo_ia já configurado)
        resposta_ia = modelo_ia.generate_content(prompt_final)
        
        # Devolve pro React
        return {"resposta": resposta_ia.text}
        
    except Exception as e:
        return {"resposta": f"Erro interno na IA: {str(e)}"}