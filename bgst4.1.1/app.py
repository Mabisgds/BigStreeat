import mysql.connector
import os
from flask import session
from flask import Flask, request, jsonify
from flask_cors import CORS
from data_base import conectar_banco 
from flask import Flask, request, jsonify
from flask import Flask, request, jsonify, render_template

from flask import Flask, render_template

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = os.urandom(24)

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

        # Busca usuário apenas pelo email
        cursor.execute(
            "SELECT * FROM usuario WHERE email=%s",
            (email,)
        )

        usuario = cursor.fetchone()

        cursor.close()
        db.close()

        # Verifica se usuário existe
        if not usuario:
            return jsonify({
                "success": False,
                "message": "Usuário não encontrado"
            }), 401

        # Verifica senha
        
        if usuario["senha"] != senha:
            return jsonify({
                "success": False,
                "message": "Senha incorreta"
            }), 401

        # Se chegou aqui, login é válido
        session["usuario_id"] = usuario["id_usuario"]
        print("Sessão após login:", session.get("usuario_id"))

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
        cep = dados.get("cep")
        cidade_user = dados.get("cidade_user")
        uf_user = dados.get("uf_user")

        try:
            print(dados)

            cursor.execute("""
                INSERT INTO usuario 
                (nome_user, cpf, data_nascimento, peso, altura, email, senha, cep, cidade_user, uf_user)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                nome_user,
                cpf,
                data_nascimento,
                peso,
                altura,
                email,
                senha,
                cep,
                cidade_user,
                uf_user
            ))

            db.commit()

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

        return jsonify({"success": True})

    cursor.close()
    db.close()
    return jsonify({"success": False}), 400


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
    
    print("Sessão ao criar evento:", session.get("usuario_id"))

    dados = request.get_json()

    if not dados:
        return jsonify({"success": False, "message": "Dados inválidos"}), 400

    try:
        cursor = db.cursor()
        print("Quantidade de %s:", 22)
        print("Quantidade valores:", len((
            dados.get("nome_evento"),
            dados.get("tipo"),
            dados.get("faixa_etaria"),
            dados.get("genero"),
            dados.get("esporte_evento"),
            dados.get("descricao_evento"),
            dados.get("horario_inicio"),
            dados.get("horario_termino"),
            dados.get("qtd_times"),
            dados.get("jogadores_time"),
            dados.get("valor_aluguel"),
            dados.get("horas_aluguel"),
            dados.get("pix"),
            dados.get("beneficiario"),
            dados.get("banco"),
            dados.get("rua_numero"),
            dados.get("cidade_evento"),
            dados.get("bairro_evento"),
            dados.get("cep_evento"),
            dados.get("ponto_ref"),
            dados.get("codigo_convite"),        
            dados.get("quadra_id")
        )))
        usuario_id = session.get("usuario_id")

        if not usuario_id:
            return jsonify({
                "success": False,
                "message": "Usuário não autenticado"
            }), 401
            
        cursor.execute("""
            INSERT INTO eventos (
                nome_evento,
                tipo,
                faixa_etaria,
                genero,
                esporte_evento,
                descricao_evento,
                horario_inicio,
                horario_termino,
                qtd_times,
                jogadores_time,
                valor_aluguel,
                horas_aluguel,
                pix,
                beneficiario,
                banco,
                rua_numero,
                cidade_evento,
                bairro_evento,
                cep_evento,
                ponto_ref,
                codigo_convite,
                usuario_id,
                quadra_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            dados.get("nome_evento"),
            dados.get("tipo"),
            dados.get("faixa_etaria"),
            dados.get("genero"),
            dados.get("esporte_evento"),
            dados.get("descricao_evento"),
            dados.get("horario_inicio"),
            dados.get("horario_termino"),
            dados.get("qtd_times"),
            dados.get("jogadores_time"),
            dados.get("valor_aluguel"),
            dados.get("horas_aluguel"),
            dados.get("pix"),
            dados.get("beneficiario"),
            dados.get("banco"),
            dados.get("rua_numero"),
            dados.get("cidade_evento"),
            dados.get("bairro_evento"),
            dados.get("cep_evento"),
            dados.get("ponto_ref"),
            dados.get("codigo_convite"),
            usuario_id,
            dados.get("quadra_id")
        ))

        db.commit()
        evento_id = cursor.lastrowid

    except mysql.connector.Error as erro:
        print("Erro ao criar evento:", erro)
        return jsonify({
            "success": False,
            "message": str(erro)
        }), 400

    finally:
        cursor.close()
        db.close()

    return jsonify({
        "success": True,
        "message": "Evento criado com sucesso",
        "evento_id": evento_id
    }), 201



@app.route("/quadras", methods=["GET"])
def listar_quadras():
    db = conectar_banco()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM quadra")
    quadras = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(quadras)



# ---------------- MAIN ---------------- #

if __name__ == '__main__':
    app.run(debug=True)