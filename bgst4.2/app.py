import mysql.connector
import os
from datetime import datetime
from flask import session
from flask import Flask, request, jsonify
from flask_cors import CORS
from data_base import conectar_banco 
from flask import Flask, request, jsonify
from flask import Flask, request, jsonify, render_template
import requests
from flask import Flask, render_template

app = Flask(__name__)
from flask_cors import CORS

CORS(app, supports_credentials=True, origins=["http://127.0.0.1:5500", "http://localhost:5500"])
app.secret_key = os.urandom(24)

def obter_coordenadas(endereco):
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": endereco, "format": "json"}

    response = requests.get(
        url,
        params=params,
        headers={"User-Agent": "BigStreetApp"}
    )

    dados = response.json()

    if dados:
        return dados[0]["lat"], dados[0]["lon"]

    return None, None

@app.route("/")
def home():
    return render_template("institucional.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/cadastro")
def cadastro():
    return render_template("cadastro.html")

@app.route("/home")
def homepage():
    return render_template("htmlhomepage.html")

@app.route('/institucional')
def institucional():
    return render_template('institucional.html')



@app.route('/auth', methods=['POST'])


def autenticacao():

    db = conectar_banco()
    if db is None:
        return jsonify({"success": False, "message": "Erro conexão banco"}), 500

    cursor = db.cursor(dictionary=True)
    dados = request.get_json()

    print("DADOS RECEBIDOS:", dados)

    email = dados.get("email")
    senha = dados.get("senha")
    acao = dados.get("acao")

    # ---------------- LOGIN ---------------- #
    if acao == "login":

        cursor.execute("SELECT * FROM usuario WHERE email=%s", (email,))
        usuario = cursor.fetchone()

        if not usuario:
            cursor.close()
            db.close()
            return jsonify({
                "success": False,
                "message": "Usuário não encontrado"
            }), 401

        if usuario["senha"] != senha:
            cursor.close()
            db.close()
            return jsonify({
                "success": False,
                "message": "Senha incorreta"
            }), 401

        session["usuario_id"] = usuario["id_usuario"]

        cursor.close()
        db.close()

        return jsonify({
            "success": True,
            "message": "Login autorizado"
        })

    # ---------------- CADASTRO ---------------- #
    elif acao == "cadastro":

        nome_user = dados.get("nome_user")
        cpf = dados.get("cpf")
        data_nascimento = dados.get("data_nascimento")
        peso = dados.get("peso")
        altura = dados.get("altura")
        email = dados.get("email")
        senha = dados.get("senha")
        cep = dados.get("cep")
        rua_user = dados.get("rua_user")
        bairro_user = dados.get("bairro_user")
        cidade_user = dados.get("cidade_user")
        uf_user = dados.get("uf_user")

        avaliacao = 0

        endereco_completo = f"{rua_user}, {bairro_user}, {cidade_user}, {uf_user}, Brasil"
        latitude, longitude = obter_coordenadas(endereco_completo)
        
        print("Latitude:", latitude)
        print("Longitude:", longitude)

        try:
            cursor.execute("""
                INSERT INTO usuario 
                (nome_user, cpf, data_nascimento, peso, altura, email, senha,
                 cep, rua_user, bairro_user, cidade_user, uf_user,
                 latitude, longitude, avaliacao)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                nome_user,
                cpf,
                data_nascimento,
                peso,
                altura,
                email,
                senha,
                cep,
                rua_user,
                bairro_user,
                cidade_user,
                uf_user,
                latitude,
                longitude,
                avaliacao
            ))

            db.commit()

            return jsonify({"success": True})

        except mysql.connector.Error as erro:
            print("Erro ao cadastrar:", erro)

            if erro.errno == 1062:
                return jsonify({
                    "success": False,
                    "message": "Este CPF ou email já está cadastrado."
                }), 400

            return jsonify({
                "success": False,
                "message": "Erro ao cadastrar usuário."
            }), 400

        finally:
            cursor.close()
            db.close()

    else:
        cursor.close()
        db.close()
        return jsonify({"success": False, "message": "Ação inválida"}), 400
    # ---------------- EVENTOS ---------------- #

@app.route('/eventos', methods=['GET'])
def listar_eventos():
    db = conectar_banco()

    if db is None:
        return jsonify({"erro": "Erro conexão banco"}), 500

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM eventos")
    eventos = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(eventos)

@app.route('/eventos', methods=['POST'])
def criar_evento():
    db = conectar_banco()
    if db is None:
        return jsonify({"success": False, "message": "Erro conexão banco"}), 500
    
    dados = request.get_json()
    if not dados:
        return jsonify({"success": False, "message": "Dados não recebidos"}), 400

    try:
        cursor = db.cursor()
        
        # Garante o ID do usuário (Sessão ou padrão 1)
        usuario_id = session.get("usuario_id") or 1 

        # Montamos a tupla com EXATAMENTE 23 itens. 
        # O .get("campo", "padrão") evita que o MySQL receba algo que ele não entende.
        # Tratamento básico para evitar campos vazios que quebram o banco

        tipo_recebido = dados.get("tipo", "").strip().lower()

        if tipo_recebido == "quadra alugada":
            tipo_final = "Quadra Alugada"
        else:
            tipo_final = "Quadra publica"

        data_evento = dados.get("data_evento")
        hora_inicio = dados.get("horario_inicio")
        hora_fim = dados.get("horario_termino")

        if not data_evento or not hora_inicio or not hora_fim:
            return jsonify({
                "success": False,
                "message": "Data e horários são obrigatórios"
            }), 400
    except Exception as e:
        print("ERRO NO BANCO:", str(e))
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

        try:
            horario_inicio_final = datetime.strptime(
                f"{data_evento} {hora_inicio}", 
                "%Y-%m-%d %H:%M"
            )

            horario_termino_final = datetime.strptime(
                f"{data_evento} {hora_fim}", 
                "%Y-%m-%d %H:%M"
            )

        except ValueError:
            return jsonify({
                "success": False,
                "message": "Formato de data ou hora inválido"
            }), 400

        valores = (
            dados.get("nome_evento") or "Evento Sem Nome",
            tipo_final,          # Verifique se 'Público' existe no seu ENUM
            dados.get("faixa_etaria") or "Livre",
            dados.get("genero") or "Misto",
            dados.get("esporte_evento") or "Futebol",
            dados.get("descricao_evento") or "",
            data_evento,
            horario_inicio_final,
            horario_termino_final,
            dados.get("qtd_times") or 2,
            dados.get("jogadores_time") or 5,
            dados.get("valor_aluguel") or 0.0,
            dados.get("horas_aluguel") or 1,
            dados.get("pix") or "",
            dados.get("beneficiario") or "",
            dados.get("banco") or "",
            dados.get("rua_numero") or "",
            dados.get("cidade_evento") or "",
            dados.get("bairro_evento") or "",
            dados.get("cep_evento") or "",
            dados.get("codigo_convite") or "",
            usuario_id,                             # O ID que pegamos da sessão ou forçamos          # Garante que a quadra não seja nula
        )

        sql = """
            INSERT INTO eventos (
                nome_evento, tipo, faixa_etaria, genero, esporte_evento,
                descricao_evento, data_evento, horario_inicio, horario_termino, qtd_times,
                jogadores_time, valor_aluguel, horas_aluguel, pix,
                beneficiario, banco, rua_numero, cidade_evento,
                bairro_evento, cep_evento, codigo_convite,
                usuario_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        print("DADOS RECEBIDOS:", dados)
        print("DATA:", dados.get("data_evento"))
        print("HORA INICIO:", dados.get("horario_inicio"))
        print("HORA FIM:", dados.get("horario_termino"))
        print("VALORES ENVIADOS:")
        for i, v in enumerate(valores):
            print(i, v)

        cursor.execute(sql, valores)
        db.commit()
        
        try:
            cursor.execute(sql, valores)
            db.commit()

            evento_id = cursor.lastrowid

            link_evento = f"http://localhost:5000/evento/{evento_id}"

            qr_code_url = (
                "https://api.qrserver.com/v1/create-qr-code/"
                f"?size=250x250&data={link_evento}"
            )

            return jsonify({
                "success": True,
                "message": "Evento criado!",
                "evento_id": evento_id,
                "link_evento": link_evento,
                "qr_code_url": qr_code_url
            }), 201

        except Exception as e:
            print("ERRO NO BANCO:", str(e))
            return jsonify({
                "success": False,
                "message": str(e)
            }), 400

        finally:
            cursor.close()
            db.close()

    # ---------------- QUADRAS ---------------- #
@app.route('/quadra', methods=['POST'])
def criar_quadras():
    db = conectar_banco()
    if db is None:
        return jsonify({"success": False, "message": "Erro conexão banco"}), 500
    
    dados = request.get_json()
    if not dados:
        return jsonify({"success": False, "message": "Dados não recebidos"}), 400

    try:
        cursor = db.cursor()
        
        # Garante o ID do usuário (Sessão ou padrão 1)
        usuario_id = session.get("usuario_id") or 1 

        # Montamos a tupla com EXATAMENTE 23 itens. 
        # O .get("campo", "padrão") evita que o MySQL receba algo que ele não entende.
        # Tratamento básico para evitar campos vazios que quebram o banco

        valores = (
            dados.get("nome_quadra") or "Quadra Sem Nome",
            dados.get("rua_quadra") or "",
            dados.get("numero_quadra"),
            dados.get("cidade_quadra") or "",
            dados.get("bairro_quadra") or "",
            dados.get("cep_quadra") or "",
            dados.get("estado_quadra") or "",
            dados.get("superficie") or "Concreto",
            dados.get("esporte_quadra") or "Futebol",
            dados.get("capacidade") or "",
            usuario_id,                            # O ID que pegamos da sessão ou forçamos          # Garante que a quadra não seja nula
        )

        sql = """
            INSERT INTO quadra (
                nome_quadra, rua_quadra, numero_quadra, cidade_quadra, bairro_quadra, cep_quadra, estado_quadra, superficie, esporte_quadra, capacidade, usuario_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        print("DADOS RECEBIDOS:", dados)
        for i, v in enumerate(valores):
            print(i, v)

        cursor.execute(sql, valores)
        db.commit()
        
        return jsonify({
            "success": True,
            "message": "Quadra criada!",
            "id_quadra": cursor.lastrowid
        }), 201

    except Exception as e:
        print("ERRO NO BANCO:", str(e)) # Isso vai aparecer no seu terminal do VS Code
        return jsonify({"success": False, "message": str(e)}), 400
    finally:
        cursor.close()
        db.close()
    return jsonify(quadras)



# ---------------- MAIN ---------------- #

@app.route('/evento/<int:evento_id>', methods=['GET'])
def visualizar_evento(evento_id):
    db = conectar_banco()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM eventos WHERE id_evento = %s", (evento_id,))
    evento = cursor.fetchone()

    cursor.close()
    db.close()

    if not evento:
        return jsonify({"erro": "Evento não encontrado"}), 404

    return render_template("evento_detalhe.html", evento=evento)

if __name__ == '__main__':
    app.run(debug=True)