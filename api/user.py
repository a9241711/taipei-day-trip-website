from flask import Blueprint, jsonify, request, make_response,session,redirect, url_for
from dotenv import load_dotenv
from api.mysql_connect import connection_pool, closePool
import os,re


load_dotenv()

api_user = Blueprint("api_user", __name__)


#取得使用者資訊 GET
@api_user.route("/user", methods=["GET"])
def getUser():
    if "user" in session: #確認使用者是否存在session
        id=session["user"]["id"]
        name=session["user"]["name"]
        email=session["user"]["email"]
        response={
            "id":id,
            "name":name,
            "email":email}        # print(response)
        return jsonify(response)
    else:
        session.pop('user', None)
        return jsonify({ "data": None })

# 登入PATCH
@api_user.route("/user", methods=["PATCH"])
def signIn():
    signInRequest = request.get_json()# print(signInRequest) 取得request
    email=signInRequest["email"]
    password=signInRequest["password"] #print(email,password)
    try:
        mysqlConnection = connection_pool.get_connection()
        if mysqlConnection.is_connected():
            mycursor = mysqlConnection.cursor()
            mycursor.execute(
                "SELECT id,name,email,password FROM member WHERE email=%s", (email,))
            findone = mycursor.fetchone()# print(findone)
            if  not findone:#若找不到會員則返回錯誤
                response={"error": True,"message":"帳號密碼錯誤"}
                return make_response(jsonify(response),400)
            if findone:
                userpassword=findone[3]
                if password !=userpassword: #檢查密碼是否與資料相符，若無則返回錯誤
                    response={"error": True,"message":"帳號密碼錯誤"}
                    return make_response(jsonify(response),400)
                session["user"]={ #將使用者存入session
                        "id":findone[0],
                        "name":findone[1],
                        "email":findone[2],
                        }
                response= make_response(jsonify({"ok":True}))
                response.headers["Access-Control-Allow-Origin"]= "*"
                return response
    except Exception as e:
        print(e)
        return jsonify({"error": True, "message": "伺服器內部錯誤"}, 500)
    finally:
        if mysqlConnection.in_transaction:
                mysqlConnection.rollback()
        closePool(mysqlConnection, mycursor)

#註冊POST
@api_user.route("/user", methods=["POST"])
def signUp():
    signUpRequest=request.get_json(force =True) # the mimetype is ignored.
    signName=signUpRequest["signName"]
    signEmail=signUpRequest["signEmail"]
    signPassword=signUpRequest["signPassword"]
    # print(signUpRequest)
    try:
        if request.method =="POST":        
            mysqlConnection=connection_pool.get_connection()
            if  mysqlConnection.is_connected():                # print("Connection is runing",signEmail)
                mycursor=mysqlConnection.cursor()
                mycursor.execute("SELECT email from member WHERE email=%s",(signEmail,))
                finduser=mycursor.fetchone()
                if finduser: #若帳號重複則返回錯誤
                    reponse={
                            "error": True,
                            "message": "帳號已註冊"
                            }
                    return make_response(jsonify(reponse))
            checkEmail=re.compile(r'[^@]+@[^@]+\.[^@]+') #檢查mail格式
            if(not checkEmail.match(signEmail)):
                reponse={
                    "error":True,
                    "message":"信箱格式錯誤"
                }
                return make_response(jsonify(reponse))
            if(not re.match(r'^(?=^.{8,}$)((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.*$',signPassword)):#檢查密碼格式，大小寫各一+數字8以上
                reponse={
                    "error":True,
                    "message":"密碼需符合8碼數字+英文大小寫各一"
                }
                return make_response(jsonify(reponse)) 
            register= "INSERT INTO member (name,email,password) VALUES (%s,%s,%s)"
            val=(signName,signEmail,signPassword)
            mycursor.execute(register,val)
            mysqlConnection.commit()#將使用者存入DB
            return make_response(jsonify({"ok":True})),{"Access-Control-Allow-Origin": "*"}
    except Exception as e:
        print(e)
        return jsonify({"error": True, "message": "伺服器內部錯誤"}, 500)
    finally :
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection, mycursor)

#刪除DELETE
@api_user.route("/user", methods=["DELETE"])
def signOut():
    session.pop('user', None)
    response=make_response(jsonify({"ok":True}))
    response.headers["Access-Control-Allow-Origin"]= "*"
    return response
