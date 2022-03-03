from .mysql_connect import connection_pool
from flask import Blueprint, jsonify, request
from dotenv import load_dotenv
import re

load_dotenv()

api_attraction = Blueprint("api_attraction", __name__)


# 根據page跟keyword回傳資料

@api_attraction.route("/attractions", methods=["GET"])
def getAttractions():
    attractionList = []
    mysqlConnection = connection_pool.get_connection()
    mycursor = mysqlConnection.cursor()
    keyword = request.args.get("keyword", "")  # 抓取關鍵字
    page = request.args.get("page")
    if re.match(r'[0-9]', page) == None:  # 如果沒有page則回傳錯誤
        return jsonify({"error": True, "message": "page格式錯誤"})
    intPage = int(page)
    pageStart = intPage * 12  # 根據page起始，決定要拿取的起始列數
    pageInterval = 12  # 固定提取的筆數為12筆 # print(pageStart, pageInterval)
    try:
        attractionsNumber = "SELECT * from attraction LIMIT %s,%s"  # 抓取資料的數字區間
        val = (pageStart, pageInterval)  # print(val)
        if keyword:  # 如果有關鍵字，則增加關鍵字搜尋條件
            attractionsNumber = '''SELECT * from attraction WHERE name LIKE %s LIMIT %s,%s'''
            val = ("%"+keyword+"%", pageStart, pageInterval)  # print(val)
        mycursor.execute(attractionsNumber, val)  # 執行cursor()
        attractionResults = mycursor.fetchall()  # 撈取SQL資料
        mysqlConnection.close()  # 關閉connection pool
        if not attractionResults:
            return jsonify({"error": True, "message": "伺服器內部錯誤"})
        for attractionResult in attractionResults:  # 把景點結果放入for迴圈
            # 轉換成dict，並zip結合兩個list
            arractionData = dict(zip(mycursor.column_names, attractionResult))
            attractionList.append(arractionData)  # 把dict append回去空List
        if len(attractionResults) < 12:  # 如果搜尋結果小於12筆，表示沒有下一頁
            response = {
                "nextPage": None,
                "data": attractionList}
            return jsonify(response)  # print(response)
        if len(attractionResults) == 12:  # 如果搜尋結果等於12筆，表示有下一頁
            for attractionResult in attractionResults:
                arractionData = dict(
                    zip(mycursor.column_names, attractionResult))
                attractionList.append(arractionData)  # 把資料append到List
                response = {  # print(response)
                    "nextPage": intPage+1,  # 數量==12則表示有下一頁
                    "data": attractionList
                }
            return jsonify(response)
    except Exception as e:
        print(e)
        return jsonify({"error": True, "message": "伺服器內部錯誤"}, 500)


# 依據景點ID回傳對應資訊

@api_attraction.route("/attraction/<id>", methods=["GET"])
def attraction(id):
    mysqlConnection = connection_pool.get_connection()  # 連結connection pool
    mycursor = mysqlConnection.cursor()  # f開啟cursor
    attractionId = "SELECT * from attraction where id =%s" % (id)  # SQL指令
    mycursor.execute(attractionId)  # 執行SQL指令
    attractionFind = mycursor.fetchone()  # 只須回傳一筆
    mysqlConnection.close()  # 關閉connection
    try:
        if attractionFind:  # 如果找到景點資料
            # print(attractionData)
            attractionData = dict(zip(mycursor.column_names, attractionFind))
            return jsonify(attractionData, 200)
        else:  # 如果沒找到則回傳失敗
            return jsonify({
                "error": True,
                "message": "景點編號不正確"
            }, 400)
    except Exception as e:
        print(e)
        return jsonify({"error": True,
                        "message": "伺服器內部錯誤"}, 500)
