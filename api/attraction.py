from flask import Blueprint, jsonify, request, make_response
from dotenv import load_dotenv
import re
import json
from model.model import getAttraction_data,attraction_id

load_dotenv()

api_attraction = Blueprint("api_attraction", __name__)


# 根據page跟keyword回傳資料
@api_attraction.route("/attractions", methods=["GET"])
def getAttractions():
    attractionList = []
    keyword = request.args.get("keyword", "")  # 抓取關鍵字
    page = request.args.get("page")
    if re.match(r'[0-9]', page) == None:  # 如果沒有page則回傳錯誤
        errorPage = {
            "error": True,
            "message": "page格式錯誤"
        }
        return make_response(jsonify(errorPage), 400), {"Access-Control-Allow-Origin": "*"}
    intPage = int(page)
    pageStart = intPage * 12  # 根據page起始，決定要拿取的起始列數
    pageInterval = 12  # 固定提取的筆數為12筆 # print(pageStart, pageInterval)
    results=list(getAttraction_data(pageStart,pageInterval,keyword)) #取得資料庫資料
    attractionResults=results[0]
    column=results[1]# print(pageStart,pageInterval,keyword)    
    if not attractionResults:
            response = {
                "error": True,
                "message": "查不到景點"
            }
            return make_response(jsonify(response), 500), {"Access-Control-Allow-Origin": "*"}
    for attractionResult in attractionResults:  # 把景點結果放入for迴圈
            attractionResultList = list(attractionResult)
            attractionResultList[9] = json.loads(
                attractionResultList[9])  # 將img圖片字串轉回list
            arractionData = dict(
                zip(column, attractionResultList))  # 轉換成dict，並zip結合
            attractionList.append(arractionData)  # 把dict append回去空List
    if len(attractionList) < 12:  # 如果搜尋結果小於13筆，表示沒有下一頁 # print(len(attractionList))
            response = {
                "nextPage": None,
                "data": attractionList}
            # print(response)
            return make_response(jsonify(response)), {"Access-Control-Allow-Origin": "*"}
    else:  # 如果不小於12，表示有下一頁print(len(attractionList))
            response = {
                "nextPage": intPage+1,  # 如果不小於12，表示有下一頁
                "data": attractionList
            }
            return make_response(jsonify(response)), {"Access-Control-Allow-Origin": "*"}

# 依據景點ID回傳對應資訊
@api_attraction.route("/attraction/<attractionId>", methods=["GET"])
def attraction(attractionId):
    attractionFind=list(attraction_id(attractionId))[0]
    column=list(attraction_id(attractionId))[1]#取得資料庫資料print(attractionFind,"column",column)
    # try:
    if attractionFind:  # 如果找到景點資料
        attractionList = list(attractionFind)  # 轉乘list
        attractionList[9] = json.loads(attractionList[9])  # 將img圖片字串轉回list
        attractionData = dict(zip(column, attractionList))
        response = {"data": attractionData}
        return make_response(jsonify(response)), {"Access-Control-Allow-Origin": "*"}
    else:  # 如果沒找到則回傳失敗
        response = {
            "error": True,
            "message": "景點編號不正確"
        }
        return make_response(jsonify(response), 400), {"Access-Control-Allow-Origin": "*"}
