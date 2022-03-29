
//POST ORDER
TPDirect.setupSDK(123852, 'app_eMCFmXPIIgjzbruUocYi0e2i5mTA7wU0YJ3SuudxbbkZnKOq0kS2UTFmj2gk', 'sandbox')
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
    let connectionEmail=document.querySelector(".connection-form-email");//聯絡信箱
    let connectionName=document.querySelector(".connection-form-name");//聯絡姓名
    let connectionPhone=document.querySelector(".connection-form-phone");//聯絡電話
    // fix keyboard issue in iOS device
    // forceBlurIos()
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()
    // Check TapPay Fields Status is can get prime
    if (tappayStatus.canGetPrime === false) {
        document.querySelector('#curl').innerHTML ="<p '>欄位資訊有誤</p>"
        return
    }

    // 讓 button click 之後觸發 getPrime 方法
    TPDirect.card.getPrime(async function (result) {
        console.log(result);
        if (result.status !== 0) {
            console.err('getPrime 錯誤')
            alert("getPrime 錯誤")
            return
        }
        var prime = result.card.prime
        // alert('getPrime 成功: ' + prime);
    //取得booking資料
    let getBookingData= await getBookingFetch();
    console.log("attraction",getBookingData["data"])
    fetch('/api/orders',{
            method:"POST",
            headers: {"content-type": "application/json"},
            body:JSON.stringify({
                prime:prime,
                order:{
                    price:getBookingData["data"]["price"],
                    trip:{
                        attraction:getBookingData["data"]["attraction"],
                    },
                    date:getBookingData["data"]["date"],
                    time:getBookingData["data"]["time"],
                },                
                contact: {
                    "name": connectionName.value,
                    "email": connectionEmail.value,
                    "phone": connectionPhone.value,
                    },
            })
        }).then((response)=>{return response.json()}).then((data)=>{
            if(data["error"]==true){
                document.querySelector('#curl').innerHTML= `<p style='color:red;'>${data["message"]}</p>`
            }else{
                console.log(data);
                orderNumber=data["data"]["number"]
                document.querySelector('#curl').innerHTML= `
                <p style='color:red;'>${data["data"]["payment"]["message"]}</p>
                <p style='color:red;'>您的訂單編號為${data["data"]["nubmer"]}，可點擊以下連結查詢</p>
                <a href={{url_for()}}></a>
                `;
                window.location.href="/thankyou";
            }
            })
    })
}

let orderSubmit =document.querySelector(".order-submit");

//送出付款
orderSubmit.addEventListener(("click"),(e)=>{
    e.preventDefault();
    submitonClick();
})

