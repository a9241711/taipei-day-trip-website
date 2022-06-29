///**Model** */
//fetch booking資訊GET
async function getBookingFetch(){
    try{
        let response =await fetch("/api/booking",{
            method:"GET",
        });
        let data =await response.json();
        return data
    }
    catch (message){
        throw Error("Error",message);
    }
}

//DELETE booking資訊
async function fetchDeleteBooking(){
    let response=await fetch("/api/booking",{
        method:"DELETE",
    })
    let data =await response.json();
    return data
}

///***View */
//取得未訂行程，render畫面
async function getBooking(){
        showEffect();
        //Fetch取得booking資料
        let getBookingData= await getBookingFetch();
        //Fetch取得會員資料
        let getUserData= await getSignInFetch();
        //主區塊
        let main =document.querySelector(".main");
        ///未訂行程的顯示區塊
        let reservationTitle= document.querySelector(".reservation-title"); //網頁標題
        let bookingFoot=document.querySelector(".footer");//footer
        let bookInfo =document.querySelectorAll(".book-info");//上方預定行程資訊
        let attractionContent=document.querySelector(".attraction-content");////上方預定行程區塊
        let attracionTitle=document.querySelector(".attractionTitle");//景點名稱
        let attractionImge=document.getElementById("attractionImge");//景點圖片
        //下方信用卡、聯絡資訊區塊
        let attractionReservation= document.querySelector(".attraction-reservation");
        let orderPrice=document.querySelector(".order-price")//訂單費用  
        let connectionEmail=document.querySelector(".connection-form-email");//聯絡信箱
        let connectionName=document.querySelector(".connection-form-name");//聯絡姓名
        //取得並顯示會員姓名
        reservationTitle.textContent=`您好，${getUserData["name"]}，待預定行程如下：` ;
        if(getBookingData==null){
            attractionContent.style.display="none";
            attractionReservation.style.display="none";
            let noneBooking=document.createElement("p");
            noneBooking.textContent="目前沒有任何待預訂的行程";
            main.append(noneBooking);
            bookingFoot.style.height= "100%";
            hideEffect();
            return
        }
        if(getBookingData["error"] ){
            alert("請先登入帳號");
            window.location.href="/"
        }
        if(getBookingData["data"]){
            attractionImge.src=getBookingData["data"]["attraction"]["image"] //景點圖片
            attracionTitle.textContent="台北一日遊:"+getBookingData["data"]["attraction"]["name"];//景點名稱
            bookInfo[0].textContent=getBookingData["data"]["date"];//預定日期
            if(getBookingData["data"]["time"]=="moring"){
                bookInfo[1].textContent="上半天";//預定時間
            }
            if(getBookingData["data"]["time"]=="afternoon"){
                bookInfo[1].textContent="下半天";//預定時間
            }
            // bookInfo[1].textContent=getBookingData["data"]["time"];//預定時間
            bookInfo[2].textContent=getBookingData["data"]["price"];//預定金額
            bookInfo[3].textContent=getBookingData["data"]["attraction"]["address"];//預定地址
            //付款資訊區塊
            connectionName.value=getUserData["name"];
            connectionEmail.value=getUserData["email"];
            orderPrice.textContent=`總價：新台幣${getBookingData["data"]["price"]}元`;
            hideEffect();
        }
        
}


//刪除預定行程
function deleteBookBtn(){
    let deleteBtn=document.querySelector(".delete")
    deleteBtn.addEventListener(("click"), async(e)=>{
        e.preventDefault();
            showEffect();
            let data = await fetchDeleteBooking()
            if(data["ok"] ==true){
                window.location.reload();
            }
        })
}


//多個設置setattributes 的簡易function
function setAttributes(el,attr){
    for( var key in attr){
        el.setAttribute(key,attr[key]);
    }
}



///**Control */
//執行function

//畫面initial
async function getBookingInitail(){
    await getBooking();
}


document.addEventListener("DOMContentLoaded",()=>{
    getBookingInitail()
    deleteBookBtn();
    signOut();
})



