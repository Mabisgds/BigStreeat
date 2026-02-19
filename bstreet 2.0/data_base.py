import mysql.connector

def conectar_banco():
    try:
        conexao = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root",
            database="bigstret",
            port=3306
        )
        return conexao
    except Exception as e:
        print("ERRO AO CONECTAR:", e)
        return None
