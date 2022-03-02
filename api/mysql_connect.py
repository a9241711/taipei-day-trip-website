import os
import mysql.connector
from mysql.connector import Error, pooling
from dotenv import load_dotenv
load_dotenv()


def connection():
    try:
        connection_pool = mysql.connector.pooling.MySQLConnectionPool(
            pool_name="mysql",
            pool_size=20,
            pool_reset_session=True,
            host="localhost",
            user=os.getenv("SERVER_USER"),
            password=os.getenv("SERVER_PASSWORD"),
            database=os.getenv("SERVER_DATABASE"),
            charset="utf8")
        return connection_pool

    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
