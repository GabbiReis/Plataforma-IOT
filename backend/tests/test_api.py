"""Testes de fumaça da API do AgriNexus."""

import uuid

import pytest
from fastapi.testclient import TestClient

from main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def email_unico():
    return f"teste-{uuid.uuid4().hex[:12]}@exemplo.com"

def test_health_responde_ok(client):
    resposta = client.get("/health")

    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok"}

def test_cadastro_cria_usuario(client, email_unico):
    resposta = client.post(
        "/usuarios",
        json={"nome_completo": "Usuária de Teste", "email": email_unico, "senha": "SenhaForte123"},
    )

    assert resposta.status_code == 200
    assert resposta.json()["nome"] == "Usuária de Teste"

def test_cadastro_rejeita_email_duplicado(client, email_unico):
    dados = {"nome_completo": "Usuária de Teste", "email": email_unico, "senha": "SenhaForte123"}
    client.post("/usuarios", json=dados)

    resposta = client.post("/usuarios", json=dados)

    assert resposta.status_code == 400

def test_login_emite_token(client, email_unico):
    client.post(
        "/usuarios",
        json={"nome_completo": "Usuária de Teste", "email": email_unico, "senha": "SenhaForte123"},
    )

    resposta = client.post("/login", json={"email": email_unico, "senha": "SenhaForte123"})

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["token_type"] == "bearer"
    assert corpo["access_token"]
    assert corpo["usuario"]["email"] == email_unico

def test_login_recusa_senha_errada(client, email_unico):
    client.post(
        "/usuarios",
        json={"nome_completo": "Usuária de Teste", "email": email_unico, "senha": "SenhaForte123"},
    )

    resposta = client.post("/login", json={"email": email_unico, "senha": "SenhaErrada"})

    assert resposta.status_code == 401

def test_login_recusa_usuario_inexistente(client):
    resposta = client.post(
        "/login", json={"email": "nao-existe@exemplo.com", "senha": "QualquerCoisa"}
    )

    assert resposta.status_code == 401
