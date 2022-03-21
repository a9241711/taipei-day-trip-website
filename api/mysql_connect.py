import os
import mysql.connector.pooling
from dotenv import load_dotenv
load_dotenv()

try:
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mysql",
    pool_size=5,
    connect_timeout=1000,
    pool_reset_session=True,
    host="localhost",
    user=os.getenv("SERVER_USER"),
    port=os.getenv("SERVER_PORT"),
    password=os.getenv("SERVER_PASSWORD"),
    database=os.getenv("SERVER_DATABASE"),)
except Exception as e:
    print(e)

def closePool(mysqlConnection, mycursor):
    if mysqlConnection.is_connected():
        mycursor.close()
        mysqlConnection.close()
