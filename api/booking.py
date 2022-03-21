from msilib.schema import Error
from flask import Blueprint,jsonify,request,make_response,session
from api.mysql_connect import connection_pool,closePool
import os,json
from dotenv import load_dotenv

load_dotenv()
api_booking =Blueprint("api_booking",__name__)

#取得預定行程
@api_booking.route("/booking",methods=["GET"])
def getBooking():
    if "user" not in session:
        return make_response(jsonify({"error":True,"message":"尚未登入"}),403)
    userId=session["user"]["id"] #取得登入帳號的會員ID print("bookinguserid",userId)
    try:
        mysqlConnection=connection_pool.get_connection()
        mycursor=mysqlConnection.cursor()
        mycursor.execute("SELECT * from member where id=%s"%(userId,))#找到登入者的會員資料
        member=mycursor.fetchone()
        bookingId=member[4] #找到該會員的bookingId print("member",member,"bookingId",bookingId)
        if not bookingId:
            return make_response(jsonify(None))
        mycursor.execute("SELECT * from booking WHERE id=%s"%(bookingId,)) #找到該會員的booking資訊 print("BookingInfo",bookingInformation)
        bookingInformation=mycursor.fetchone()
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
        return make_response(jsonify(response))
    except Exception as e:
        print(e)
        return jsonify({"error":True,"message":"伺服器內部錯誤"},500)
    finally:
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection, mycursor)

#預定行程
@api_booking.route("/booking",methods=["POST"])
def postBooking():
    if "user" not in session:
        return make_response(jsonify({"error":True,"message":"尚未登入"}),403)
    userId=session["user"]["id"] #會員ID
    bookingData=request.get_json()
    bookingId=bookingData["attractionId"] #預定景點ID
    bookingDate=bookingData["date"] #預定日期
    bookingTime=bookingData["time"] #預定時間
    bookingPrice=bookingData["price"] #預定金額 print(userId,bookingId,bookingDate,bookingTime,bookingPrice)
    if not bookingId or not bookingDate or not bookingTime or not bookingPrice:
        return make_response( jsonify({"error":True,"message":"資料有誤請重新輸入"}),400)
    try:
        mysqlConnection=connection_pool.get_connection()
        mycursor=mysqlConnection.cursor()
        mycursor.execute("SELECT id from booking ORDER BY id DESC LIMIT 1; ")#取得booking資料表中最後一欄位
        findLastBook=mycursor.fetchone()
        print(findLastBook)
        if not findLastBook: #若找不到資料，表示booking表無資料，起始id為1
            findLastBookId =1
        else:
            findLastBookId=list(findLastBook)[0]+1 #取得欄位id 並且+1# print(findLastBookId)    
        userBookingId=(findLastBookId,userId) #存入member table的bookingId,與會員ID
        print("userBookingId",type(findLastBookId),userBookingId )
        userUpdate="UPDATE member SET bookingid=%s WHERE id=%s" #存入member table
        mycursor.execute(userUpdate,userBookingId)
        mysqlConnection.commit()#存入DB
        storeBooking="INSERT INTO booking (id,attractionid,date,time,price) VALUES (%s,%s,%s,%s,%s)"#存景點
        val=(findLastBookId,bookingId,bookingDate,bookingTime,bookingPrice)
        mycursor.execute(storeBooking,val)
        mysqlConnection.commit()#存入DB
        return jsonify({"ok":True})
    except Exception as e:
        print(e)
        return jsonify({"error":True,"message":"伺服器內部錯誤"},500)

    finally:
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection, mycursor)
        
@api_booking.route("/booking",methods=["DELETE"])
def deleteBooking():
    if "user" not in session:
        return make_response(jsonify({"error":True,"message":"尚未登入"}),403)
    userId=session["user"]["id"] #取得登入帳號的會員ID print("bookinguserid",userId)
    try:
        mysqlConnection=connection_pool.get_connection()
        mycursor=mysqlConnection.cursor()
        mycursor.execute("SELECT * from member WHERE id=%s" %(userId,))
        member=mycursor.fetchone()
        bookingId=member[4] #找到該會員的bookingId print("member",member,"bookingId",bookingId)
        mycursor.execute("DELETE from booking WHERE id=%s" % (bookingId,))
        mysqlConnection.commit()
        print(mycursor.rowcount, "record(s) deleted")
        mycursor.execute("""UPDATE member SET bookingid=%s WHERE id=%s""" , (None,userId)) #更新會員的booking為Null
        mysqlConnection.commit()
        print(mycursor.rowcount, "record(s) updated")
        return jsonify({"ok": True})
    except Exception as e:
        print(e)
        return jsonify({"error":True,"message":"伺服器內部錯誤"},500)

    finally:
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection,mycursor)

  