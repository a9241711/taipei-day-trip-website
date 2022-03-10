import os
import mysql.connector.pooling
from dotenv import load_dotenv
load_dotenv()


connection_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mysql",
    pool_size=32,
    pool_reset_session=True,
    host="localhost",
    user=os.getenv("SERVER_USER"),
    password=os.getenv("SERVER_PASSWORD"),
    database=os.getenv("SERVER_DATABASE"),
    charset="utf8")
