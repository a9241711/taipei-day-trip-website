from flask import Blueprint,jsonify,request,make_response,session
import os,json,requests,re,jwt
from dotenv import load_dotenv
from datetime import datetime
from model.model import postOrder_data,getOrder_data

load_dotenv()
now =datetime.now()
api_order =Blueprint("api_order",__name__)
jwtKey=os.getenv("JWTKEY")

@api_order.route("/order/<orderNumber>", methods=["GET"])
def getOrder(orderNumber):
    # if "user" not in session:
    #     return make_response(jsonify({ "error": True,"message": "自訂的錯誤訊息"}),403)
    reponse=getOrder_data(orderNumber)
    # print(reponse)
    return make_response(jsonify(reponse)),{"Access-Control-Allow-Origin": "*"}

@api_order.route("/orders",methods=["POST"])
def postOrder():
    # if "user" not in session:
    #     return make_response(jsonify({ "error": True,"message": "自訂的錯誤訊息"}),403)
    jwtCookie=request.cookies.get("token")
    if not jwtCookie:
        return make_response(jsonify({ "error": True,"message": "自訂的錯誤訊息"}),403)
    userdata=jwt.decode(jwtCookie, jwtKey, algorithms='HS256') #cookie decode
    # if "user" not in session:
    # userId=session["user"]["id"] #取得登入帳號的會員ID print("bookinguserid",userId)
    orderRequest=request.get_json()
    # userid=session["user"]["id"]
    userId=userdata["id"]
    # XApiKey=request.headers["X-Api-Key"]
    currentTime=now.strftime("%Y%m%d%H%M%S")
    print("currentTime",currentTime,userdata)
    prime=orderRequest["prime"]
    contactPhone=orderRequest["contact"]["phone"]
    contactName=orderRequest["contact"]["name"]
    contactEmail=orderRequest["contact"]["email"]
    checkEmail=re.compile(r'^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$') #檢查mail格式
    if(not checkEmail.match(contactEmail)):
        return make_response(jsonify({"error": True,"message":"Email格式錯誤"}),400)
    if not contactPhone or not contactName or not contactEmail :
        return make_response(jsonify({"error": True,"message":"聯絡資訊欄位有缺漏"}),400) 
    orderInfo=orderRequest["order"]
    trip=orderInfo["trip"]
    attractionid=trip["attraction"]["id"]
    price=orderInfo["price"]
    date=orderInfo["date"]
    time=orderInfo["time"]
    headers={"Content-Type": "application/json","x-api-key":os.getenv("PARTNERKEY")}
    data={
        "prime":prime,        
        "partner_key": os.getenv("PARTNERKEY"),
        "merchant_id": "tonychou_TAISHIN",     
        "amount": price,
        "details": "旅遊行程",
        "cardholder": {
            "phone_number": contactPhone,
            "name": contactName,
            "email":contactEmail
        },
        }
    payurl='https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'
    print("data",data)
    response = requests.post(payurl, json=data, headers=headers)
    fromserver =response.json()
    print("fromserver",fromserver["status"])
    if(fromserver["status"]==0):
        print(currentTime,attractionid,userId,contactName,contactEmail,contactPhone,date,price,time)
        postOrder_data(currentTime,attractionid,userId,contactName,contactEmail,contactPhone,date,price,time)
        reponseToClient={
            "data": {
            "number": currentTime,
            "payment": {
                "status": 0,
                 "message": "付款成功"
                     }
                }
             }
        return make_response(jsonify(reponseToClient))
    return jsonify("receive POST")
