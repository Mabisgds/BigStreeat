from flask import Flask, request, jsonify
from flask_cors import CORS
from data_base import conectar_database 

app = Flask(__name__)
CORS(app) 

@app.route('/auth', methods=['POST'])
def autenticacao():
    dados = request.json
    acao = dados.get('acao')
    db = conectar_database() 
    cursor = db.cursor(dictionary=True)

    try:
        if acao == 'cadastrar':
            sql = """INSERT INTO usuario 
                     (nome_user, cpf, data_nascimento, peso, altura, cep, email, senha, cidade_user, uf_user) 
                     VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
            
            valores = (
                dados.get('nome'), dados.get('cpf'), dados.get('dataNasc'),
                dados.get('peso'), dados.get('altura'), dados.get('cep'),
                dados.get('email'), dados.get('senha'), dados.get('cidade'), dados.get('estado')
            )
            
            cursor.execute(sql, valores)
            db.commit()
            return jsonify({"success": True})

        elif acao == 'login':
            sql = "SELECT * FROM usuario WHERE email = %s AND senha = %s"
            cursor.execute(sql, (dados.get('email'), dados.get('senha')))
            if cursor.fetchone():
                return jsonify({"success": True})
            return jsonify({"success": False, "message": "Login incorreto!"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})
    finally:
        cursor.close()
        db.close()

if __name__ == '__main__':
    app.run(debug=True)