import json
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()
mydb = mysql.connector.connect(
    host="localhost",
    user=os.getenv("SERVER_USER"),
    password=os.getenv("SERVER_PASSWORD"),
    database=os.getenv("SERVER_DATABASE"),
)

mycursor = mydb.cursor()
mycursor.execute("""CREATE TABLE IF NOT EXISTS attraction (
id BIGINT NOT NULL,
name VARCHAR(100),
category VARCHAR(100),
description TEXT,
address VARCHAR(255),
transport TEXT,
mrt VARCHAR(100),
latitude FLOAT,
longitude FLOAT,
images TEXT
)
""")
mydb.commit()

# read file
# 告訴 Python 我們要讀取的檔案是以 UTF-8 編碼即可解決'cp950'報錯
with open('taipei-attractions.json', 'r', encoding="utf-8") as jsonfile:
    jsonobj = json.load(jsonfile)  # parse file
    results = jsonobj["result"]["results"]
    # print(list)
    for result in results:
        id = result["_id"]
        name = result["stitle"]
        category = result["CAT2"]
        description = result["xbody"]
        address = result["address"]
        transport = result["info"]
        mrt = result["MRT"]
        latitude = result["latitude"]
        longitude = result["longitude"]
        imagesUrl = result["file"].lower().split("https://")[1:]
        # print(imagesUrl)
        imagesUrlList = []
        for imageUrl in imagesUrl:
            if imageUrl.endswith(("jpg", "png")):  # endwith接受tuple("a","b")作為多字串比對
                imageUrl = "http://" + imageUrl
                imagesUrlList.append(imageUrl)
        imagesUrlListJson = json.dumps(imagesUrlList)  # 轉換成json字串
        print(imagesUrlListJson)
        sql_data = ("INSERT INTO attraction (id, name, category, description, address, transport, mrt, latitude, longitude, images)"
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
        mycursor.execute(sql_data, (id, name, category, description, address,
                         transport, mrt, latitude, longitude, imagesUrlListJson))

        mydb.commit()
