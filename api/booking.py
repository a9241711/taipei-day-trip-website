from flask import Blueprint,jsonify,request,make_response,session
from model.model import postBooking_data,deleteBooking_date,getBooking_data
import os,json,jwt
from dotenv import load_dotenv

load_dotenv()
api_booking =Blueprint("api_booking",__name__)
jwtKey=os.getenv("JWTKEY")

#GET取得預定行程
@api_booking.route("/booking",methods=["GET"])
def getBooking():
    jwtCookie=request.cookies.get("token")
    if not jwtCookie:
        return make_response(jsonify({"error":True,"message":"尚未登入"}),403)
    decodeJwt=jwt.decode(jwtCookie, jwtKey, algorithms='HS256')
    userId=decodeJwt["id"]
    response=getBooking_data(userId)
    # print("get",response)
    return make_response(jsonify(response)), {"Access-Control-Allow-Origin": "*"}
    # if "user" not in session:
    # userId=session["user"]["id"] #取得登入帳號的會員ID print("bookinguserid",userId)

#POST預定行程
@api_booking.route("/booking",methods=["POST"])
def postBooking():
    jwtCookie=request.cookies.get("token")
    if not jwtCookie:#若無cookie，則表示尚未登入
        return make_response(jsonify({"error":True,"message":"尚未登入"}),403)
    decodeJwt=jwt.decode(jwtCookie, jwtKey, algorithms='HS256')
    userId=decodeJwt["id"]
    bookingData=request.get_json()
    bookingId=bookingData["attractionId"] #預定景點ID
    bookingDate=bookingData["date"] #預定日期
    bookingTime=bookingData["time"] #預定時間
    bookingPrice=bookingData["price"] #預定金額 print(userId,bookingId,bookingDate,bookingTime,bookingPrice)
    if not bookingId or not bookingDate or not bookingTime or not bookingPrice:
        return make_response( jsonify({"error":True,"message":"資料有誤請重新輸入"}),400)
    response= postBooking_data(userId,bookingId,bookingDate,bookingTime,bookingPrice)
    # print(response)
    return jsonify(response)
    # if "user" not in session:
    # userId=session["user"]["id"] #取得登入帳號的會員ID print("bookinguserid",userId)

#DELETE行程
@api_booking.route("/booking",methods=["DELETE"])
def deleteBooking():
    jwtCookie=request.cookies.get("token")
    if not jwtCookie:
        return make_response(jsonify({"error":True,"message":"尚未登入"}),403)
    decodeJwt=jwt.decode(jwtCookie, jwtKey, algorithms='HS256')
    userId=decodeJwt["id"]
    response =deleteBooking_date(userId)
    print(response)
    return jsonify(response)
    # if "user" not in session:
    #     return make_response(jsonify({"error":True,"message":"尚未登入"}),403)
    # userId=session["user"]["id"] #取得登入帳號的會員ID print("bookinguserid",userId)
    # response =deleteBooking_date(userId)
    # if "user" not in session:
    # userId=session["user"]["id"] #取得登入帳號的會員ID print("bookinguserid",userId)