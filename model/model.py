import os,json
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
        mycursor.execute("SELECT * from member where id=%s"%(userId,))#找到登入者的會員資料
        member=mycursor.fetchone()
        bookingId=member[4] #找到該會員的bookingId print("member",member,"bookingId",bookingId)
        if not bookingId:
            response=None
            return response
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
        mycursor.execute("SELECT id from booking ORDER BY id DESC LIMIT 1; ")#取得booking資料表中最後一欄位
        findLastBook=mycursor.fetchone() #print(findLastBook)
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
        mycursor.execute("SELECT * from member WHERE id=%s" %(userId,))
        member=mycursor.fetchone()
        bookingId=member[4] #找到該會員的bookingId print("member",member,"bookingId",bookingId)
        mycursor.execute("DELETE from booking WHERE id=%s" % (bookingId,))
        mysqlConnection.commit()
        print(mycursor.rowcount, "record(s) deleted")
        mycursor.execute("""UPDATE member SET bookingid=%s WHERE id=%s""" , (None,userId)) #更新會員的booking為Null
        mysqlConnection.commit()
        print(mycursor.rowcount, "record(s) updated")
        response={"ok": True}
        return response
    except Exception as e:
        print(e)
        return jsonify({"error":True,"message":"伺服器內部錯誤"},500)

    finally:
        if mysqlConnection.in_transaction:
            mysqlConnection.rollback()
        closePool(mysqlConnection,mycursor)