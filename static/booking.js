let bookSubmit =document.querySelector(".book-submit");
let phoneValue=document.getElementById("phone");
let creditCard =document.getElementById("creditCard");
let expireValue=document.getElementById("expire");
let cardPasssword=document.getElementById("cardPasssword");
let deleteBooking = document.querySelector(".delete");
// bookSubmit.addEventListener("click",(e)=>{
//     e.preventDefault()
//     get()
// })
//多個attributes 設置function
function setAttributes(el,attr){
    for( var key in attr){
        el.setAttribute(key,attr[key]);
    }
}

//檢查手機格式
phoneValue.addEventListener("blur",(e)=>{
    let value =e.target.value;
    let checkInput=/(09)+[0-9]{8}/
    if (!value.match(checkInput)){
       if(document.getElementById("errorPhone")){//若已有errorP則移除
        phoneValue.parentNode.removeChild(phoneValue.parentNode.lastChild);
       }
        let errorP=document.createElement("p");
        setAttributes(errorP,{"style":"color:red;","id":"errorPhone"});//call setAttributes
        errorP.textContent="手機格式錯誤，請重新輸入"
        phoneValue.parentNode.appendChild(errorP)
    }else{
        if(document.getElementById("errorPhone")){
            phoneValue.parentNode.removeChild(phoneValue.parentNode.lastChild);
        }
    }
})

//檢查信用卡帳號
creditCard.addEventListener("blur",(e)=>{
    value=e.target.value;
    let creditCardCheck=/[0-9\s]{13,16}/;
    if(!value.match(creditCardCheck)){
        if(document.getElementById("errorCredit")){//若已有errorExpire則移除
            creditCard.parentNode.removeChild(creditCard.parentNode.lastChild);
        }
         let errorCredit=document.createElement("p");
         setAttributes(errorCredit,{"style":"color:red;","id":"errorCredit"});//call setAttributes
         errorCredit.textContent="信用卡號格式錯誤，請重新輸入"
         creditCard.parentNode.appendChild(errorCredit)
     }else{
        if(document.getElementById("errorCredit")){
            creditCard.parentNode.removeChild(creditCard.parentNode.lastChild);
         }
     
    }
})

//檢查信用卡過期日期
expireValue.addEventListener("blur",(e)=>{
    let value=e.target.value;
    let numberCheck=/[0-9]{2}[\/][0-9]{2}/;
    if(!value.match(numberCheck)){
        if(document.getElementById("errorExpire")){//若已有errorExpire則移除
            expireValue.parentNode.removeChild(expireValue.parentNode.lastChild);
        }
         let errorExpire=document.createElement("p");
         setAttributes(errorExpire,{"style":"color:red;","id":"errorExpire"});//call setAttributes
         errorExpire.textContent="MM/YY日期格式錯誤，請重新輸入"
         expireValue.parentNode.appendChild(errorExpire)
     }else{
        let MM=value.split("/",1);
        if(document.getElementById("errorExpire")){
            expireValue.parentNode.removeChild(expireValue.parentNode.lastChild);
         }
        if(parseInt(MM[0]) > 12){
            // console.log("number")
            let errorExpire=document.createElement("p");
            setAttributes(errorExpire,{"style":"color:red;","id":"errorExpire"});//call setAttributes
            errorExpire.textContent="月份格式錯誤，請重新輸入"
            expireValue.parentNode.appendChild(errorExpire)
        }
     }
})

//檢查卡片驗證碼
cardPasssword.addEventListener("blur",(e)=>{
    value=e.target.value;
    let passwordCheck=/\d{3}\d?/;//?表示可有可無
    if(!value.match(passwordCheck)){
        if(document.getElementById("errorPassword")){
            cardPasssword.parentNode.removeChild(cardPasssword.parentNode.lastChild)
        }
        let errorPassword=document.createElement("p");
        setAttributes(errorPassword,{"style":"color:red;","id":"errorPassword"});//call setAttributes
        errorPassword.textContent="驗證密碼錯誤，請重新輸入"
        cardPasssword.parentNode.appendChild(errorPassword);
    }else{
        if(document.getElementById("errorPassword")){
            cardPasssword.parentNode.removeChild(cardPasssword.parentNode.lastChild)
        }
        let num = value.slice(3,4); 
        if(isNaN(parseInt(num[0])) && num){
            let errorPassword=document.createElement("p");
            setAttributes(errorPassword,{"style":"color:red;","id":"errorPassword"});//call setAttributes
            errorPassword.textContent="驗證密碼尾數錯誤，請重新輸入"
            cardPasssword.parentNode.appendChild(errorPassword);
        }
    }
})


//取得未訂行程
fetch("/api/booking").then((response)=>{
    return response.json();
}).then((data)=>{
    console.log(data);
})

//刪除預定行程
deleteBooking.addEventListener(("click"),(e)=>{
    e.preventDefault();
    fetch("/api/booking",{method:"DELETE"}).then((response)=>{
        return response.json();
    }).then((data)=>{
        console.log(data);
    })
})
