from flask import Blueprint, jsonify, request, make_response,session
from dotenv import load_dotenv
from model.model import signIn_data,signUp_data,updatePassword_data
import os,re,jwt,datetime
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

api_user = Blueprint("api_user", __name__)
jwtKey=os.getenv("JWTKEY")

#取得使用者資訊 GET
@api_user.route("/user", methods=["GET"])
def getUser():
    jwtCookie=request.cookies.get("token")
    # print("firstjwt",jwtCookie)
    if not jwtCookie:
        return jsonify({"data":None})
    decodeJwt=jwt.decode(jwtCookie, jwtKey, algorithms='HS256') #cookie decode
    # print(decodeJwt)
    return make_response(jsonify(decodeJwt))
    # if current_user: #確認使用者是否存在session
    # # userdata=signIn_data(current_user)
    #     id=userdata["id"]
    #     name=userdata["name"]
    #     email=userdata["email"]
    #     response={
    #         "id":id,
    #         "name":name,
    #         "email":email}        # print(response)
    #     return jsonify(response)


# 登入PATCH
@api_user.route("/user", methods=["PATCH"])
def signIn():
    signInRequest = request.get_json()# print(signInRequest) 取得request
    email=signInRequest["email"]
    password=signInRequest["password"] #print(email,password)
    findone=signIn_data(email) #連接database 找有沒有該會員print("findone",findone)
    if  not findone:#若找不到會員則返回錯誤
        response={"error": True,"message":"帳號密碼錯誤"}
        return make_response(jsonify(response),400)
    if findone:
        hashpassword=findone[3]
        checkPassword=check_password_hash(hashpassword,password)
        if not checkPassword: #檢查密碼是否與資料相符，若無則返回錯誤
            response={"error": True,"message":"帳號密碼錯誤"}
            return make_response(jsonify(response),400)
        userdata={"id":findone[0],"name":findone[1],"email":findone[2]}
        datetime_now = datetime.datetime.now()#取得當前的時間
        time_range = datetime.timedelta(days = 1) # 取時間range為一天
        new_time = datetime_now + time_range # 過期時間為當前時間後一天
        token=jwt.encode(userdata, jwtKey, algorithm='HS256') # 產生 JWT
        response= make_response(jsonify({"ok":True}))
        response.set_cookie("token", value=token, expires=new_time, samesite='Lax')#將jwt存入cookie，取名token
        # print("patch",response)
        return response
         # userdata={"id":findone[0],"name":findone[1],"email":findone[2]}
        # session["user"]={ #將使用者存入session
        #         "id":findone[0],
        #         "name":findone[1],
        #         "email":findone[2],
        #         }

#註冊POST
@api_user.route("/user", methods=["POST"])
def signUp():
    signUpRequest=request.get_json(force =True) # the mimetype is ignored.
    signName=signUpRequest["signName"]
    signEmail=signUpRequest["signEmail"]
    signPassword=signUpRequest["signPassword"]
    # print(signUpRequest)
    if request.method =="POST":        
        checkEmail=re.compile(r'^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$') #檢查mail格式
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
        hashsignPassword= generate_password_hash(signPassword)
        response=signUp_data(signName,signEmail,hashsignPassword) #連接database使用者註冊
        return make_response(jsonify(response)),{"Access-Control-Allow-Origin": "*"}

#登出使用者DELETE
@api_user.route("/user", methods=["DELETE"])
def signOut():
    response=make_response(jsonify({"ok":True}))
    response.headers["Access-Control-Allow-Origin"]= "*"
    response.set_cookie("token", value="") # 把 JWT 的 cookie 刪除
    return response
    # session.pop('user', None)
    # jwt = get_jwt()["jwt"]
    # print(jwt)
    # jwt_redis_blocklist.set(jwt, "")

    #修改密碼PUT
@api_user.route("/user", methods=["PUT"])
def updatePassword():
    jwtCookie=request.cookies.get("token")
    # print("firstjwt",jwtCookie)
    if not jwtCookie:
        return jsonify({"data":None})
    decodeJwt=jwt.decode(jwtCookie, jwtKey, algorithms='HS256') #cookie decode
    email=decodeJwt["email"]
    updateRequest=request.get_json(force =True) # the mimetype is ignored.
    updatePassword=updateRequest["updatePassword"]
    # print(signUpRequest)
    if(not re.match(r'^(?=^.{8,}$)((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.*$',updatePassword)):#檢查密碼格式，大小寫各一+數字8以上
            reponse={
                "error":True,
                "message":"密碼需符合8碼數字+英文大小寫各一"
            }
            return make_response(jsonify(reponse)) 
    hashsignPassword= generate_password_hash(updatePassword)
    response=updatePassword_data(email,hashsignPassword) #連接database使用者註冊
    return make_response(jsonify(response)),{"Access-Control-Allow-Origin": "*"}
