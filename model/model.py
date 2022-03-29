import os,json
from tkinter import E
from urllib import response
import mysql.connector.pooling
from flask import  jsonify
from dotenv import load_dotenv


load_dotenv()

connection_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="mysql",
    pool_size=5,
    connect_timeout=1000,
    pool_reset_session=True,
    host="localhost",
    user=os.getenv("SERVER_USER"),
    port=os.getenv("SERVER_PORT"),
    password=os.getenv("SERVER_PASSWORD"),
    database=os.getenv("SERVER_DATABASE"),)

def closePool(mysqlConnection, mycursor):
    if mysqlConnection.is_connected():
        mycursor.close()
        mysqlConnection.close()

#Attraction
# 根據page跟keyword回傳資料
def getAttraction_data(intPage,pageInterval,keyword):
    keyword = keyword  # 抓取關鍵字
    pageStart = intPage   # 根據page起始，決定要拿取的起始列數
    pageInterval = pageInterval  # 固定提取的筆數為12筆 # print(pageStart, pageInterval)
    try:
        mysqlConnection = connection_pool.get_connection()
        mycursor = mysqlConnection.cursor()
        attractionsNumber = "SELECT * from attraction LIMIT %s,%s"  # 抓取資料的數字區間
        val = (pageStart, pageInterval)  # print(val)        
        if keyword:  # 如果有關鍵字，則增加關鍵字搜尋條件
            attractionsNumber = "SELECT * from attraction WHERE name LIKE %s LIMIT %s,%s"
            val = ("%"+keyword+"%", pageStart, pageInterval)  # print(val)
        mycursor.execute(attractionsNumber, val)  # 執行cursor()
        attractionResults = mycursor.fetchall()  # 撈取SQL資料
        columns=mycursor.column_names
        return attractionResults,columns
    except Exception as e:
        print(e)
        return jsonify({"error": True, "message": "伺服器內部錯誤"}, 500)
    finally:
        if mysqlConnection.in_transaction:
                mysqlConnection.rollback()
        closePool(mysqlConnection, mycursor)



# 依據景點ID回傳對應資訊
def attraction_id(attractionId):
    try:
        mysqlConnection=connection_pool.get_connection()
        mycursor = mysqlConnection.cursor()
        # SQL指令
        findAttractionId = "SELECT * from attraction where id =%s " % (
            attractionId)
        mycursor.execute(findAttractionId)  # 執行SQL指令
        attractionFind = mycursor.fetchone()  # 只須回傳一筆
        columns=mycursor.column_names #print(attractionFind,"columns",columns)
        return attractionFind,columns
    except Exception as e:
        print(e)
        return jsonify({"error": True,
                        "message": "伺服器內部錯誤"})
    finally:
        if mysqlConnection.in_transaction:
                mysqlConnection.rollback()
        closePool(mysqlConnection, mycursor)


#User
# 登入PATCH
def signIn_data(email):
    try:
        mysqlConnection = connection_pool.get_connection()
        mycursor = mysqlConnection.cursor()
        mycursor.execute(
                "SELECT id,name,email,password FROM member WHERE email=%s", (email,))
        findone = mycursor.fetchone()# print(findone)
        return findone
    except Exception as e:
        print(e)
        return jsonify({"error": True, "message": "伺服器內部錯誤"}, 500)
    finally:
        if mysqlConnection.in_transaction:
                mysqlConnection.rollback()
        closePool(mysqlConnection, mycursor)

#註冊POST
def signUp_data(signName,signEmail,signPassword):
    try:    
            mysqlConnection=connection_pool.get_connection()
            mycursor=mysqlConnection.cursor()
            mycursor.execute("SELECT email from member WHERE email=%s",(signEmail,))
            finduser=mycursor.fetchone()
            if finduser: #若帳號重複則返回錯誤
                response={
                    "error": True,
                    "message": "帳號已註冊"
                    }
                return response
            register= "INSERT INTO member (name,email,password) VALUES (%s,%s,%s)"
            val=(signName,signEmail,signPassword)
            mycursor.execute(register,val)
            mysqlConnection.commit()#將使用者存入DB
            response={"ok":True}
            return response
    except Exception as e:
        print(e)
        return jsonify({"error": True, "message": "伺服器內部錯誤"}, 500)
    finally :
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection, mycursor)

#取得預定行程GET
def getBooking_data(userId):
    try:
        mysqlConnection=connection_pool.get_connection()
        mycursor=mysqlConnection.cursor()
        mycursor.execute("SELECT * from booking WHERE userid=%s"%(userId,)) #找到該會員的booking資訊 
        bookingInformation=mycursor.fetchone()
        if not bookingInformation:
            response=None
            return response
        # print("BookingInfo",bookingInformation)
        #取得booking訂單資訊
        arractionId=bookingInformation[1] #取得arractionID，用來取得attraction資訊
        bookingDate=bookingInformation[2]
        bookingTime=bookingInformation[3]
        bookingPrice=bookingInformation[4]
        print("arractionId",arractionId)
        mycursor.execute("SELECT name,address,images from attraction WHERE id=%s"%(arractionId,))
        #取得景點資訊
        attractionInformation=mycursor.fetchone() #print("attractionInformation",attractionInformation)
        attractionName=attractionInformation[0] #取得景點名稱
        attractionAddress=attractionInformation[1] #取得地址
        attractionImage=json.loads(attractionInformation[2]) #取得image
        #組成data
        response= {
            "data":{
            "attraction":{
                "id":arractionId,
                "name":attractionName,
                "address":attractionAddress,
                "image":attractionImage[0]
            },
            "date":bookingDate,
            "time":bookingTime,
            "price":bookingPrice
            }
        }
        print(response)
        return response
    except Exception as e:
        print(e)
        return jsonify({"error":True,"message":"伺服器內部錯誤"},500)
    finally:
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection, mycursor)

#預定行程POST
def postBooking_data(userId,bookingId,bookingDate,bookingTime,bookingPrice):
    try:
        mysqlConnection=connection_pool.get_connection()
        mycursor=mysqlConnection.cursor()
        mycursor.execute("SELECT * from booking WHERE userid=%s"%(userId,))#取得booking資料表中的userid
        fiindBooking=mycursor.fetchone() 
        print(fiindBooking)
        if not fiindBooking: #若找不到資料，表示booking表無資料，直接存入
            storeBooking="INSERT INTO booking (attractionid,date,time,price,userid) VALUES (%s,%s,%s,%s,%s)"#存景點
            val=(bookingId,bookingDate,bookingTime,bookingPrice,userId)
            mycursor.execute(storeBooking,val)
            mysqlConnection.commit()#存入DB
            response = {"ok":True}
            return response
        else:#表示有找到，用update的方式修改資料
            userUpdate="UPDATE booking SET attractionid=%s,date=%s,time=%s,price=%s WHERE userid=%s;" #更新booking表 table
            updateVal=(bookingId,bookingDate,bookingTime,bookingPrice,userId)
            mycursor.execute(userUpdate,updateVal)
            mysqlConnection.commit()#存入DB
            response = {"ok":True}
            return response
    except Exception as e:
        print(e)
        return jsonify({"error":True,"message":"伺服器內部錯誤"},500)

    finally:
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection, mycursor)
        
#刪除行程DELETE
def deleteBooking_date(userId):
    try:
        mysqlConnection=connection_pool.get_connection()
        mycursor=mysqlConnection.cursor()
        mycursor.execute("DELETE from booking WHERE userid=%s" % (userId,))
        mysqlConnection.commit()
        print(mycursor.rowcount, "record(s) deleted")
        response={"ok": True}
        return response
    except Exception as e:
        print(e)
        return jsonify({"error":True,"message":"伺服器內部錯誤"},500)

    finally:
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection,mycursor)

#GET ORDER BY NUMBER
def getOrder_data(orderNumber):
    try:
        mysqlConnection=connection_pool.get_connection()
        mycursor=mysqlConnection.cursor()
        mycursor.execute("SELECT orderdata.*,attraction.name,attraction.address,attraction.images from orderdata JOIN attraction ON orderdata.attractionid=attraction.id WHERE orderdata.number = %s"%(orderNumber))#根據orderNumber找出order資料
        orderRawData=mycursor.fetchone() #找到該景點order
        orderData = dict(zip(mycursor.column_names,orderRawData))
        number=orderData["number"]
        price=orderData["tripprice"]
        attractionid=orderData["attractionid"]
        name=orderData["name"]
        address=orderData["address"]
        image=json.loads(orderData["images"])[0]
        tripdate=orderData["tripdate"]
        triptime=orderData["triptime"]
        contactname=orderData["contactname"]
        contactemail=orderData["contactemail"]
        contactphone=orderData["contactphone"]
        response={
              "data": {
                "number": number,
                "price": price,
                "trip": {
                  "attraction": {
                    "id": attractionid,
                    "name": name,
                    "address": address,
                    "image": image
                  },
                  "date": tripdate,
                  "time": triptime
                },
                "contact": {
                  "name": contactname,
                  "email": contactemail,
                  "phone": contactphone
                },
                "status": 1
              }
            }
        print(response)
        return response
        mycursor.execute("SELECT orderdata.*,attraction.name,attraction.address,attraction.images,member.id,member.name from orderdata JOIN attraction ON orderdata.attractionid=attraction.id ")

    except Exception as e:
        print(e)
        return jsonify({"error":True,"message":"伺服器內部錯誤"},500)
    finally:
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection,mycursor)

#POST ORDER
def postOrder_data(currentTime,attractionid,userid,contactName,contactEmail,contactPhone,date,price,time):
    try:
        mysqlConnection=connection_pool.get_connection()
        mycursor=mysqlConnection.cursor()
        #存入order Table
        orderInsert="""INSERT INTO orderdata (number,attractionid,userid,contactname,contactemail,contactphone,tripdate,tripprice,triptime) VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
        orderdata=(currentTime,attractionid,userid,contactName,contactEmail,contactPhone,date,price,time)
        mycursor.execute(orderInsert,orderdata)
        mysqlConnection.commit()
    except Exception as e:
        print(e)
        return  jsonify({"error":True,"message":"伺服器內部錯誤"},500)
    finally:
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection,mycursor)