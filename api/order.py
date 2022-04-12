from flask import Blueprint,jsonify,request,make_response,session
import os,json,requests,re,jwt
from dotenv import load_dotenv
from datetime import datetime
from model.model import postOrder_data,getOrder_data,getALLOrder_data

load_dotenv()
now =datetime.now()
api_order =Blueprint("api_order",__name__)
jwtKey=os.getenv("JWTKEY")

@api_order.route("/order/<orderNumber>", methods=["GET"])
def getOrder(orderNumber):
    jwtCookie=request.cookies.get("token")
    if not jwtCookie:
        return make_response(jsonify({ "error": True,"message": "未登入"}),403)
    reponse=getOrder_data(orderNumber)
    return make_response(jsonify(reponse)),{"Access-Control-Allow-Origin": "*"}

#取得指定member id的所有訂單編號
@api_order.route("/order", methods=["GET"])
def getAllOrder():
    jwtCookie=request.cookies.get("token")
    if not jwtCookie:
        return make_response(jsonify({ "error": True,"message": "未登入"}),403)
    decodeJwt=jwt.decode(jwtCookie, jwtKey, algorithms='HS256')
    useId=decodeJwt["id"]
    memberDatas=getALLOrder_data(useId)
    return make_response(jsonify({"data":memberDatas})),{"Access-Control-Allow-Origin": "*"}

@api_order.route("/orders",methods=["POST"])
def postOrder():
    jwtCookie=request.cookies.get("token")
    if not jwtCookie:
        return make_response(jsonify({ "error": True,"message": "未登入"}),403)
    userdata=jwt.decode(jwtCookie, jwtKey, algorithms='HS256') #cookie decode
    orderRequest=request.get_json()
    userId=userdata["id"]
    currentTime=now.strftime("%Y%m%d%H%M%S")
    prime=orderRequest["prime"]
    contactPhone=orderRequest["contact"]["phone"]
    contactName=orderRequest["contact"]["name"]
    contactEmail=orderRequest["contact"]["email"]
    checkEmail=re.compile(r'^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$') #檢查mail格式
    checkPhone=re.compile(r'(09)+[0-9]{8}')
    if(not checkEmail.match(contactEmail)):
        return make_response(jsonify({"error": True,"message":"Email格式錯誤"}),400)
    if(not checkPhone.match(contactPhone)):
        return make_response(jsonify({"error": True,"message":"手機格式錯誤，請輸入開頭09+後面8碼"}),400)
    if not contactName: 
        return make_response(jsonify({"error": True,"message":"聯絡資訊欄位有缺漏"}),400) 
    orderInfo=orderRequest["order"]
    trip=orderInfo["trip"]
    attractionid=trip["attraction"]["id"]
    price=orderInfo["price"]
    date=orderInfo["date"]
    time=orderInfo["time"]
    status=1 #尚未付款status=1
    postOrder_data(currentTime,attractionid,userId,contactName,contactEmail,contactPhone,date,price,time,status)#先傳入DB記錄訂單資訊
    tapPayHeaders={"Content-Type": "application/json","x-api-key":os.getenv("PARTNERKEY")}
    tapPaydata={
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
    tapPayurl='https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'    # print("data",tapPaydata)
    tapRequest = requests.post(tapPayurl, json=tapPaydata, headers=tapPayHeaders)
    ResponseFromTap =tapRequest.json()
    # print("ResposeFromTap",ResponseFromTap["status"])
    if(ResponseFromTap["status"]==0):#若TapPay回傳成功則回傳資料到SERVER，更新status=0
        status=ResponseFromTap["status"]
        postOrder_data(currentTime,attractionid,userId,contactName,contactEmail,contactPhone,date,price,time,status)
        reponseToClient={
            "data": {
            "number": currentTime,
            "payment": {
                "status": status,
                 "message": "付款成功"
                     }
                }
             }
        return make_response(jsonify(reponseToClient))
    else:
        errorMessage={
            "error": True,
            "message":"信用卡付款失敗"}
        return make_response(jsonify(errorMessage),400)
    # if "user" not in session:
    #     return make_response(jsonify({ "error": True,"message": "自訂的錯誤訊息"}),403)
    # if "user" not in session:
    # userId=session["user"]["id"] #取得登入帳號的會員ID print("bookinguserid",userId)
    # userid=session["user"]["id"]