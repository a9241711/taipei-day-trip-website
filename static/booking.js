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
        // console.log(getBookingData,"getUserData","getUserData",getUserData)
        if(getBookingData==null){
            attractionContent.style.display="none";
            attractionReservation.style.display="none";
            let noneBooking=document.createElement("p");
            noneBooking.textContent="目前沒有任何待預訂的行程";
            main.append(noneBooking);
            bookingFoot.style.height= "100%";
            hideEffect();
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



//檢查手機格式
// function checkPhone(){
// let phoneValue=document.getElementById("phone");
//     phoneValue.addEventListener("blur",(e)=>{
//         let value =e.target.value;
//         let checkInput=/(09)+[0-9]{8}/
//         if (!value.match(checkInput)){
//            if(document.getElementById("errorPhone")){//若已有errorP則移除
//             phoneValue.parentNode.removeChild(phoneValue.parentNode.lastChild);
//            }
//             let errorP=document.createElement("p");
//             setAttributes(errorP,{"style":"color:#448899;","id":"errorPhone"});//call setAttributes
//             errorP.textContent="手機格式錯誤，請重新輸入"
//             phoneValue.parentNode.appendChild(errorP)
//         }else{
//             if(document.getElementById("errorPhone")){
//                 phoneValue.parentNode.removeChild(phoneValue.parentNode.lastChild);
//             }
//         }
//     })
// }

//檢查信用卡帳號
// creditCard.addEventListener("blur",(e)=>{
//     value=e.target.value;
//     let creditCardCheck=/[0-9\s]{13,16}/;
//     if(!value.match(creditCardCheck)){
//         if(document.getElementById("errorCredit")){//若已有errorExpire則移除
//             creditCard.parentNode.removeChild(creditCard.parentNode.lastChild);
//         }
//          let errorCredit=document.createElement("p");
//          setAttributes(errorCredit,{"style":"color:red;","id":"errorCredit"});//call setAttributes
//          errorCredit.textContent="信用卡號格式錯誤，請重新輸入"
//          creditCard.parentNode.appendChild(errorCredit)
//      }else{
//         if(document.getElementById("errorCredit")){
//             creditCard.parentNode.removeChild(creditCard.parentNode.lastChild);
//          }
     
//     }
// })

// //檢查信用卡過期日期
// expireValue.addEventListener("blur",(e)=>{
//     let value=e.target.value;
//     let numberCheck=/[0-9]{2}[\/][0-9]{2}/;
//     if(!value.match(numberCheck)){
//         if(document.getElementById("errorExpire")){//若已有errorExpire則移除
//             expireValue.parentNode.removeChild(expireValue.parentNode.lastChild);
//         }
//          let errorExpire=document.createElement("p");
//          setAttributes(errorExpire,{"style":"color:red;","id":"errorExpire"});//call setAttributes
//          errorExpire.textContent="MM/YY日期格式錯誤，請重新輸入"
//          expireValue.parentNode.appendChild(errorExpire)
//      }else{
//         let MM=value.split("/",1);
//         if(document.getElementById("errorExpire")){
//             expireValue.parentNode.removeChild(expireValue.parentNode.lastChild);
//          }
//         if(parseInt(MM[0]) > 12){
//             // console.log("number")
//             let errorExpire=document.createElement("p");
//             setAttributes(errorExpire,{"style":"color:red;","id":"errorExpire"});//call setAttributes
//             errorExpire.textContent="月份格式錯誤，請重新輸入"
//             expireValue.parentNode.appendChild(errorExpire)
//         }
//      }
// })

// //檢查卡片驗證碼
// cardPasssword.addEventListener("blur",(e)=>{
//     value=e.target.value;
//     let passwordCheck=/\d{3}\d?/;//?表示可有可無
//     if(!value.match(passwordCheck)){
//         if(document.getElementById("errorPassword")){
//             cardPasssword.parentNode.removeChild(cardPasssword.parentNode.lastChild)
//         }
//         let errorPassword=document.createElement("p");
//         setAttributes(errorPassword,{"style":"color:red;","id":"errorPassword"});//call setAttributes
//         errorPassword.textContent="驗證密碼錯誤，請重新輸入"
//         cardPasssword.parentNode.appendChild(errorPassword);
//     }else{
//         if(document.getElementById("errorPassword")){
//             cardPasssword.parentNode.removeChild(cardPasssword.parentNode.lastChild)
//         }
//         let num = value.slice(3,4); 
//         if(isNaN(parseInt(num[0])) && num){
//             let errorPassword=document.createElement("p");
//             setAttributes(errorPassword,{"style":"color:red;","id":"errorPassword"});//call setAttributes
//             errorPassword.textContent="驗證密碼尾數錯誤，請重新輸入"
//             cardPasssword.parentNode.appendChild(errorPassword);
//         }
//     }
// })


