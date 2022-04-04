//***Model***//
//POST fetch to Server
async function postOrderFecth(prime,getBookingPrice,getBookingAttrction,getBookingDate,getBookingTime,connectionNameValue,connectionEmailValue,connectionPhoneValue){
    try{
        let postOrder=await fetch("/api/orders",{
            method:"POST",
            headers:{"content-type":"application/json"},
            body:JSON.stringify({
                prime:prime,
                order:{
                        price:getBookingPrice,
                        trip:{
                            attraction:getBookingAttrction,
                        },
                        date:getBookingDate,
                        time:getBookingTime,
                },                
                contact: {
                        name: connectionNameValue,
                        email: connectionEmailValue,
                        phone: connectionPhoneValue,
                    },
                    })
                })
            let data =await postOrder.json();
            return data
    }
    catch(message){
        throw Error("Error",message);
    }
}
//SetUp TapPay SDK
TPDirect.setupSDK(123852, 'app_eMCFmXPIIgjzbruUocYi0e2i5mTA7wU0YJ3SuudxbbkZnKOq0kS2UTFmj2gk', 'sandbox')


//***POST ORDER View***//
// Display ccv field
TPDirect.card.setup({
    fields: {
        number: {
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: document.getElementById('card-expiration-date'),
            placeholder: 'MM / YY'
        },
        ccv: {
            element:'#card-ccv',
            placeholder: '後三碼'
        }
    },
        styles: {
        'input': {
            'color': 'gray',
            'font-size': '16px'
        },
        'input.ccv': {
            // 'font-size': '16px'
        },
        ':focus': {
            'color': 'black'
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    }
})

function submitonClick() {
    let connectionName=document.querySelector(".connection-form-name").value;//聯絡姓名
    let connectionEmail=document.querySelector(".connection-form-email").value;//聯絡信箱
    let connectionPhone=document.querySelector(".connection-form-phone").value;//聯絡電話
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()
    // Check TapPay Fields Status is can get prime
    if (tappayStatus.canGetPrime === false) {
        document.querySelector('#curl').innerHTML ="<p style='color:#448899;'>信用卡欄位資訊有誤</p>"
        return
    }
    //  getPrime 後執行以下
    TPDirect.card.getPrime(async function (result) {
        if (result.status !== 0) {
            alert("信用卡授權資料錯誤")
            return
        }
        let prime = result.card.prime
        //取得booking資料
        let getBookingData= await getBookingFetch();// console.log("getBookingData",getBookingData["data"])
        //設定要order Post的參數資料
        let getBookingPrice=getBookingData["data"]["price"];
        let getBookingAttrction=getBookingData["data"]["attraction"];
        let getBookingDate=getBookingData["data"]["date"];
        let getBookingTime=getBookingData["data"]["time"]
        //Post order to Server
        let data=await postOrderFecth(prime,getBookingPrice,getBookingAttrction,getBookingDate,getBookingTime,connectionName,connectionEmail,connectionPhone)
        console.log(data)
        if(data["error"]==true){//若回傳錯誤，則顯示錯誤訊息
            document.querySelector('#errorMessge').innerHTML= `<p style='color:#448899;'>${data["message"]}</p>`
        }else{//若回傳成功則顯示成功訊息
            console.log(data);
            let successMes=data["data"]["payment"]["message"]
            orderNumber=data["data"]["number"]
            document.querySelector('#curl').innerHTML= `
            <p style='color:#448899;'>${successMes}頁面重新導向...</p>
            `;
            document.querySelector('#curl').innerHTML ="<p style='color:#448899;'>信用卡欄位資訊有誤</p>"
            window.location.href=`/thankyou?number=${orderNumber}`;
        }
        })
}



//***Controller***//
//送出付款
function postBookingController(){
    //送出Post按鈕
    let orderSubmit =document.querySelector(".order-submit");
    orderSubmit.addEventListener(("click"),(e)=>{
        e.preventDefault();
        submitonClick();
    })
}

window.onload=function(){
    postBookingController();
}

