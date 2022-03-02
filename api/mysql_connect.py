import os
from mysql.connector import Error, pooling
from dotenv import load_dotenv
load_dotenv()


def connect():
    try:
        connection_pool = pooling.MySQLConnectionPool(
            pool_name="mysql",
            pool_size=20,
            pool_reset_session=True,
            host="localhost",
            user=os.getenv("SERVER_USER"),
            password=os.getenv("SERVER_PASSWORD"),
            database=os.getenv("SERVER_DATABASE"),
            charset="utf8")
        connection = connection_pool.get_connection()
        return connection

    except Error as e:
        print("Error while connecting to MySQL using Connection pool ", e)
