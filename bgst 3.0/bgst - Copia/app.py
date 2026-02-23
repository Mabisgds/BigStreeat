import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS
from data_base import conectar_banco 
from flask import Flask, request, jsonify
from flask import Flask, request, jsonify, render_template

from flask import Flask, render_template

app = Flask(__name__)

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
        return jsonify({"erro": "Erro conexão banco"}), 500

    cursor = db.cursor()
    dados = request.get_json()

    try:
        cursor.execute("""
            INSERT INTO eventos 
            (nome, data_evento, horario_inicio, horario_fim, faixa_etaria)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            dados["nome"],
            dados["data_evento"],
            dados["horario_inicio"],
            dados["horario_fim"],
            dados["faixa_etaria"]
        ))

        db.commit()

    except mysql.connector.Error as erro:
        print("Erro ao criar evento:", erro)
        return jsonify({"success": False, "message": str(erro)}), 400

    finally:
        cursor.close()
        db.close()

    return jsonify({"success": True})

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