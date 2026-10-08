from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import bcrypt
import json
import os
import secrets
import time
import jwt
from datetime import datetime, timedelta, timezone
import psycopg2
from google import genai
from dotenv import load_dotenv
from prometheus_fastapi_instrumentator import Instrumentator

load_dotenv()

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY não definida. Configure a variável de ambiente antes de iniciar a API "
        "(veja .env.example). Sem ela, os tokens JWT seriam assinados com uma chave previsível."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

IOT_API_KEY = os.getenv("IOT_API_KEY")
if not IOT_API_KEY:
    raise RuntimeError(
        "IOT_API_KEY não definida. Configure a variável de ambiente antes de iniciar a API "
        "(veja .env.example). É a chave que autentica a placa física ao enviar leituras."
    )

app = FastAPI(title="AgriNexus API", description="Backend Completo - Autenticação e IoT", version="1.1.0")

CORS_ALLOW_ORIGINS = [
    origem.strip()
    for origem in os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")
    if origem.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator(excluded_handlers=["/metrics", "/health"]).instrument(app).expose(app)

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASS = os.getenv("DB_PASS")
    if not DB_PASS:
        raise RuntimeError(
            "DB_PASS não definida. Configure a variável de ambiente (ou use DATABASE_URL) "
            "antes de iniciar a API (veja .env.example)."
        )
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "agrinexus")
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

class Fatura(Base):
    __tablename__ = "faturas"
    id = Column(Integer, primary_key=True, index=True)
    fatura_id = Column(String(50), unique=True, index=True)
    desc = Column(String(200), nullable=False)
    data = Column(String(20), nullable=False)
    valor = Column(Float, nullable=False)
    status = Column(String(20), default="Em Aberto")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

class Plantacao(Base):
    __tablename__ = "plantacoes"
    id = Column(Integer, primary_key=True, index=True)
    cultura = Column(String(100), nullable=False)
    setor = Column(String(100), nullable=False)
    plantio = Column(String(20), nullable=False)
    previsao = Column(String(20), nullable=False)
    quantidade = Column(String(50), nullable=False)
    status = Column(String(20), default="Crescendo")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

class Agendamento(Base):
    __tablename__ = "agendamentos"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    horario = Column(String(10), nullable=False)
    tipo = Column(String(50), nullable=False)
    responsavel = Column(String(100), nullable=False)
    status = Column(String(20), default="Pendente")
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health", tags=["Sistema"])
def health_check():
    return {"status": "ok"}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client_ia = None

if GEMINI_API_KEY:
    client_ia = genai.Client(api_key=GEMINI_API_KEY)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_usuario_atual(token: str = Depends(oauth2_scheme), db = Depends(get_db)):
    credenciais_exception = HTTPException(
        status_code=401,
        detail="Não foi possível validar as credenciais. Faça login novamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credenciais_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado", headers={"WWW-Authenticate": "Bearer"})
    except jwt.InvalidTokenError:
        raise credenciais_exception

    user = db.query(Usuario).filter(Usuario.email == email).first()
    if user is None:
        raise credenciais_exception
    return user

class UsuarioCreate(BaseModel):
    nome_completo: str
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

class UsuarioUpdateSenha(BaseModel):
    nova_senha: str

class UsuarioUpdateDados(BaseModel):
    nome_completo: str
    email: str

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

class FaturaCreate(BaseModel):
    fatura_id: str
    desc: str
    data: str
    valor: float
    status: str
    usuario_id: int

class PlantacaoCreate(BaseModel):
    cultura: str
    setor: str
    plantio: str
    previsao: str
    quantidade: str
    status: str
    usuario_id: int

class PlantacaoUpdate(BaseModel):
    cultura: Optional[str] = None
    setor: Optional[str] = None
    plantio: Optional[str] = None
    previsao: Optional[str] = None
    quantidade: Optional[str] = None
    status: Optional[str] = None

class AgendamentoCreate(BaseModel):
    titulo: str
    horario: str
    tipo: str
    responsavel: str
    status: str
    usuario_id: int

class AgendamentoUpdate(BaseModel):
    titulo: Optional[str] = None
    horario: Optional[str] = None
    tipo: Optional[str] = None
    responsavel: Optional[str] = None
    status: Optional[str] = None

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

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email, "id": user.id}, expires_delta=access_token_expires)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {"id": user.id, "nome_completo": user.nome_completo, "email": user.email, "perfil": user.perfil},
        "mensagem": "Login realizado com sucesso"
    }

@app.put("/usuarios/{usuario_id}/senha", tags=["Autenticação"])
def atualizar_senha(usuario_id: int, dados: UsuarioUpdateSenha, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    if usuario_atual.id != usuario_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para alterar a senha de outro usuário")
    user = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user.senha_hash = get_password_hash(dados.nova_senha)
    db.commit()
    return {"mensagem": "Senha atualizada com sucesso"}

@app.put("/usuarios/{usuario_id}/dados", tags=["Autenticação"])
def atualizar_dados_usuario(usuario_id: int, dados: UsuarioUpdateDados, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    if usuario_atual.id != usuario_id:
        raise HTTPException(status_code=403, detail="Você não tem permissão para alterar dados de outro usuário")
    user = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if dados.email != user.email:
        email_existente = db.query(Usuario).filter(Usuario.email == dados.email).first()
        if email_existente:
            raise HTTPException(status_code=400, detail="Este e-mail já está em uso por outra conta")

    user.nome_completo = dados.nome_completo
    user.email = dados.email
    db.commit()
    return {"mensagem": "Dados atualizados com sucesso"}

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

@app.post("/api/leituras", status_code=201, tags=["IoT - Placa Física"])
async def receber_leitura(leitura: LeituraIoT, x_api_key: str = Header(None), db=Depends(get_db)):

    # Esta mesma chave precisa estar gravada no firmware da placa (Arduino IDE)
    if not IOT_API_KEY or not secrets.compare_digest(x_api_key or "", IOT_API_KEY):
        raise HTTPException(status_code=401, detail="Acesso não autorizado. Chave inválida.")

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
async def buscar_ultima_leitura(db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    try:
        resultado = db.query(LeituraIoTModel).order_by(LeituraIoTModel.id.desc()).first()

        if resultado:
            return {
                "temperatura": resultado.temp_ar,
                "umidade_solo": resultado.umidade_solo,
                "pressao": resultado.pressao,
                "luz": resultado.luz,
                "bateria": resultado.bateria,
                "rssi": resultado.rssi,
                "registrado_em": resultado.registrado_em.isoformat() if resultado.registrado_em else None
            }
        else:
            return {"temperatura": "--", "umidade_solo": "--", "pressao": "--", "luz": "--", "bateria": "--", "rssi": "--", "registrado_em": None}

    except Exception as e:
        return {"erro": f"Falha ao buscar no banco: {str(e)}"}

@app.get("/api/leituras/historico", tags=["IoT - Placa Física"])
async def buscar_historico(db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    try:
        resultados = db.query(LeituraIoTModel).order_by(LeituraIoTModel.id.desc()).limit(10).all()

        dados_grafico = []
        # O Recharts desenha da esquerda pra direita, então revertemos a ordem
        for linha in reversed(resultados):
            dados_grafico.append({
                "temperatura": linha.temp_ar,
                "umidade": linha.umidade_solo,
                "luz": linha.luz,
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

cache_dica_ia = {"texto": "", "tempo": 0}

@app.get("/analises/dica-ia", tags=["Análises"])
def obter_dica_ia(db=Depends(get_db)):
    """Rota turbinada que usa o Gemini para analisar o status geral da estufa e sensores IoT."""
    global cache_dica_ia

    # Isso impede que o React esgote as cotas do Google ao recarregar a página
    if time.time() - cache_dica_ia["tempo"] < 600 and cache_dica_ia["tempo"] != 0:
        return {"dica": cache_dica_ia["texto"]}

    leituras_recentes = db.query(Leitura).order_by(Leitura.registrado_em.desc()).limit(20).all()

    leituras_iot = db.query(LeituraIoTModel).order_by(LeituraIoTModel.registrado_em.desc()).limit(10).all()

    if not leituras_recentes and not leituras_iot:
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

    for iot in leituras_iot:
        resumo_dados.append({
            "sensor": f"LILYGO ({iot.device})",
            "tipo": "Multi-Sensor",
            "temp": iot.temp_ar,
            "umidade_solo": iot.umidade_solo,
            "luz": iot.luz,
            "bateria": iot.bateria
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
        resposta = client_ia.models.generate_content(model='gemini-2.5-flash', contents=prompt)
        cache_dica_ia["texto"] = resposta.text
        cache_dica_ia["tempo"] = time.time()
        return {"dica": resposta.text}
    except Exception as e:
        print(f"ERRO FATAL NA IA: {str(e)}")
        return {"dica": f"ERRO DO GOOGLE: {str(e)}"}

@app.post("/chat", tags=["IA Chatbot"])
async def chat_agrinexus(req: MensagemChat, db=Depends(get_db)):

    ultima_leitura = db.query(LeituraIoTModel).order_by(LeituraIoTModel.registrado_em.desc()).first()

    dados_estufa = "Nenhum dado recente encontrado no banco de dados."
    if ultima_leitura:
        dados_estufa = f"""
        Temperatura Atual: {ultima_leitura.temp_ar}°C
        Umidade do Solo: {ultima_leitura.umidade_solo}%
        Luminosidade: {ultima_leitura.luz} lux
        Bateria do Sensor IoT: {ultima_leitura.bateria}V
        """

    contexto_do_sistema = f"""
    Você é a inteligência artificial do sistema AgriNexus, um software de agricultura de precisão.
    Sua missão é ajudar os agricultores a tomarem decisões baseadas em IoT.
    Seja claro, profissional e direto. Use emojis relacionados à agricultura.
    
    DADOS REAIS DA ESTUFA NO MOMENTO EXATO DESTA CONVERSA:
    {dados_estufa}
    
    Baseie suas respostas nesses dados reais sempre que o usuário perguntar sobre o estado atual.
    A pergunta do agricultor é: 
    """

    try:
        prompt_final = contexto_do_sistema + req.mensagem

        resposta_ia = client_ia.models.generate_content(model='gemini-2.5-flash', contents=prompt_final)

        return {"resposta": resposta_ia.text}

    except Exception as e:
        return {"resposta": f"Erro interno na IA: {str(e)}"}

@app.post("/faturas", tags=["Financeiro"])
def criar_fatura(fatura: FaturaCreate, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    nova_fatura = Fatura(
        fatura_id=fatura.fatura_id,
        desc=fatura.desc,
        data=fatura.data,
        valor=fatura.valor,
        status=fatura.status,
        usuario_id=fatura.usuario_id
    )
    db.add(nova_fatura)
    db.commit()
    return {"mensagem": "Fatura registrada com sucesso"}

@app.get("/faturas/{usuario_id}", tags=["Financeiro"])
def listar_faturas(usuario_id: int, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    if usuario_atual.id != usuario_id:
        raise HTTPException(status_code=403, detail="Acesso negado às faturas de outro usuário")
    faturas = db.query(Fatura).filter(Fatura.usuario_id == usuario_id).order_by(Fatura.id.desc()).all()
    return [{"id": f.fatura_id, "desc": f.desc, "data": f.data, "valor": f.valor, "status": f.status} for f in faturas]

@app.put("/faturas/{fatura_id}/pagar", tags=["Financeiro"])
def pagar_fatura(fatura_id: str, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    fatura = db.query(Fatura).filter(Fatura.fatura_id == fatura_id).first()
    if not fatura:
        raise HTTPException(status_code=404, detail="Fatura não encontrada")
    fatura.status = "Pago"
    db.commit()
    return {"mensagem": "Fatura paga com sucesso"}

@app.post("/plantacoes", tags=["Colheita"])
def criar_plantacao(p: PlantacaoCreate, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    nova_plantacao = Plantacao(**p.dict())
    db.add(nova_plantacao)
    db.commit()
    db.refresh(nova_plantacao)
    return {"mensagem": "Plantação registrada com sucesso", "id": nova_plantacao.id}

@app.get("/plantacoes/{usuario_id}", tags=["Colheita"])
def listar_plantacoes(usuario_id: int, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    if usuario_atual.id != usuario_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    plantacoes = db.query(Plantacao).filter(Plantacao.usuario_id == usuario_id).order_by(Plantacao.id.desc()).all()
    return [
        {"id": p.id, "cultura": p.cultura, "setor": p.setor, "plantio": p.plantio, "previsao": p.previsao, "quantidade": p.quantidade, "status": p.status}
        for p in plantacoes
    ]

@app.put("/plantacoes/{plantacao_id}", tags=["Colheita"])
def atualizar_plantacao(plantacao_id: int, p: PlantacaoUpdate, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    plantacao = db.query(Plantacao).filter(Plantacao.id == plantacao_id).first()
    if not plantacao:
        raise HTTPException(status_code=404, detail="Plantação não encontrada")
    if plantacao.usuario_id != usuario_atual.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    if p.cultura is not None: plantacao.cultura = p.cultura
    if p.setor is not None: plantacao.setor = p.setor
    if p.plantio is not None: plantacao.plantio = p.plantio
    if p.previsao is not None: plantacao.previsao = p.previsao
    if p.quantidade is not None: plantacao.quantidade = p.quantidade
    if p.status is not None: plantacao.status = p.status

    db.commit()
    return {"mensagem": "Plantação atualizada com sucesso"}

@app.delete("/plantacoes/{plantacao_id}", tags=["Colheita"])
def deletar_plantacao(plantacao_id: int, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    plantacao = db.query(Plantacao).filter(Plantacao.id == plantacao_id).first()
    if not plantacao or plantacao.usuario_id != usuario_atual.id:
        raise HTTPException(status_code=404, detail="Plantação não encontrada ou acesso negado")
    db.delete(plantacao)
    db.commit()
    return {"mensagem": "Plantação deletada com sucesso"}

@app.post("/agendamentos", tags=["Agendamentos"])
def criar_agendamento(a: AgendamentoCreate, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    novo_agendamento = Agendamento(**a.dict())
    db.add(novo_agendamento)
    db.commit()
    db.refresh(novo_agendamento)
    return {"mensagem": "Tarefa registrada com sucesso", "id": novo_agendamento.id}

@app.get("/agendamentos/{usuario_id}", tags=["Agendamentos"])
def listar_agendamentos(usuario_id: int, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    if usuario_atual.id != usuario_id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    agendamentos = db.query(Agendamento).filter(Agendamento.usuario_id == usuario_id).order_by(Agendamento.id.desc()).all()
    return [
        {"id": a.id, "titulo": a.titulo, "horario": a.horario, "tipo": a.tipo, "responsavel": a.responsavel, "status": a.status}
        for a in agendamentos
    ]

@app.put("/agendamentos/{agendamento_id}", tags=["Agendamentos"])
def atualizar_agendamento(agendamento_id: int, a: AgendamentoUpdate, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    if agendamento.usuario_id != usuario_atual.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    if a.titulo is not None: agendamento.titulo = a.titulo
    if a.horario is not None: agendamento.horario = a.horario
    if a.tipo is not None: agendamento.tipo = a.tipo
    if a.responsavel is not None: agendamento.responsavel = a.responsavel
    if a.status is not None: agendamento.status = a.status

    db.commit()
    return {"mensagem": "Agendamento atualizado com sucesso"}

@app.delete("/agendamentos/{agendamento_id}", tags=["Agendamentos"])
def deletar_agendamento(agendamento_id: int, db=Depends(get_db), usuario_atual: Usuario = Depends(get_usuario_atual)):
    agendamento = db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()
    if not agendamento or agendamento.usuario_id != usuario_atual.id:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado ou acesso negado")
    db.delete(agendamento)
    db.commit()
    return {"mensagem": "Agendamento deletado com sucesso"}
