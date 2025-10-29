from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

# Inicialização do FastAPI
app = FastAPI(title="AgriSense API", description="Backend do sistema AgriSense", version="1.0.0")

# Configurações do banco de dados
DB_USER = os.getenv("DB_USER", "admin")
DB_PASS = os.getenv("DB_PASS", "admin")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "iot_data")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ========================
# Modelos do Banco
# ========================

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nome_usuario = Column(String, unique=True, nullable=False)
    senha = Column(String, nullable=False)
    perfil = Column(String, default="usuario")  # Ex: admin, usuario


class Dispositivo(Base):
    __tablename__ = "dispositivos"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    localizacao = Column(String)
    tipo = Column(String)  # Ex: temperatura, umidade, solo
    status = Column(String, default="ativo")


class LeituraSensor(Base):
    __tablename__ = "leituras_sensores"
    id = Column(Integer, primary_key=True, index=True)
    id_dispositivo = Column(Integer)
    temperatura = Column(Float)
    umidade = Column(Float)
    umidade_solo = Column(Float)
    data_hora = Column(DateTime, default=datetime.utcnow)


class Alerta(Base):
    __tablename__ = "alertas"
    id = Column(Integer, primary_key=True, index=True)
    mensagem = Column(String, nullable=False)
    nivel = Column(String, default="aviso")  # aviso, crítico etc.
    data_hora = Column(DateTime, default=datetime.utcnow)
    id_dispositivo = Column(Integer)

Base.metadata.create_all(bind=engine)

# Schemas (entrada/saída)

class UsuarioSchema(BaseModel):
    nome_usuario: str
    senha: str
    perfil: str = "usuario"

class DispositivoSchema(BaseModel):
    nome: str
    localizacao: str
    tipo: str

class LeituraSchema(BaseModel):
    id_dispositivo: int
    temperatura: float
    umidade: float
    umidade_solo: float

class AlertaSchema(BaseModel):
    id_dispositivo: int
    mensagem: str
    nivel: str = "aviso"

# Rotas da API

@app.post("/usuarios", tags=["Usuários"])
def criar_usuario(usuario: UsuarioSchema):
    db = SessionLocal()
    novo_usuario = Usuario(
        nome_usuario=usuario.nome_usuario,
        senha=usuario.senha,
        perfil=usuario.perfil
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    db.close()
    return {"mensagem": "Usuário criado com sucesso", "usuario": usuario.nome_usuario}

@app.post("/login", tags=["Usuários"])
def login(usuario: UsuarioSchema):
    db = SessionLocal()
    user = db.query(Usuario).filter(Usuario.nome_usuario == usuario.nome_usuario).first()
    db.close()
    if not user or user.senha != usuario.senha:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")
    return {"mensagem": "Login realizado com sucesso", "perfil": user.perfil}


@app.post("/dispositivos", tags=["Dispositivos"])
def cadastrar_dispositivo(dispositivo: DispositivoSchema):
    db = SessionLocal()
    novo_dispositivo = Dispositivo(
        nome=dispositivo.nome,
        localizacao=dispositivo.localizacao,
        tipo=dispositivo.tipo
    )
    db.add(novo_dispositivo)
    db.commit()
    db.refresh(novo_dispositivo)
    db.close()
    return {"mensagem": "Dispositivo cadastrado com sucesso", "id": novo_dispositivo.id}


@app.get("/dispositivos", tags=["Dispositivos"])
def listar_dispositivos():
    db = SessionLocal()
    dispositivos = db.query(Dispositivo).all()
    db.close()
    return dispositivos


@app.post("/leituras", tags=["Leituras"])
def registrar_leitura(leitura: LeituraSchema):
    db = SessionLocal()
    nova_leitura = LeituraSensor(
        id_dispositivo=leitura.id_dispositivo,
        temperatura=leitura.temperatura,
        umidade=leitura.umidade,
        umidade_solo=leitura.umidade_solo
    )
    db.add(nova_leitura)
    db.commit()
    db.refresh(nova_leitura)
    db.close()
    return {"mensagem": "Leitura registrada com sucesso"}


@app.get("/leituras", tags=["Leituras"])
def listar_leituras():
    db = SessionLocal()
    leituras = db.query(LeituraSensor).all()
    db.close()
    return leituras


@app.post("/alertas", tags=["Alertas"])
def criar_alerta(alerta: AlertaSchema):
    db = SessionLocal()
    novo_alerta = Alerta(
        mensagem=alerta.mensagem,
        nivel=alerta.nivel,
        id_dispositivo=alerta.id_dispositivo
    )
    db.add(novo_alerta)
    db.commit()
    db.refresh(novo_alerta)
    db.close()
    return {"mensagem": "Alerta registrado com sucesso"}


@app.get("/alertas", tags=["Alertas"])
def listar_alertas():
    db = SessionLocal()
    alertas = db.query(Alerta).all()
    db.close()
    return alertas
