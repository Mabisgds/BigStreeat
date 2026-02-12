import mysql.connector

def conectar_database():
    try:
        conexao = mysql.connector.connect(
            host = "127.0.0.1",
            user = "root",
            password = "root",
            database = "bigstrett"
        )
        return conexao
    except:
        return None