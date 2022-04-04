//Thank you Page
//get order fetch data
let getThankUrl=location.href.split("?number=")[1]
async function getOrderFetch(getThankUrl){
    try{
        let getOrderData=await fetch(`/api/order/${getThankUrl}`);
        let data= getOrderData.json();
        return data
    }
    catch (message){
        throw Error("error",message)
    }

}


async function getThankyouPage(){
    hideEffect()
    let data=await getOrderFetch(getThankUrl);
    console.log(data);
    let orderName=data["data"]["contact"]["name"];
    let orderDate=data["data"]["trip"]["date"];
    let orderPrice=data["data"]["price"];
    let orderAttraction=data["data"]["trip"]["attraction"]["name"];
    let orderAddress=data["data"]["trip"]["attraction"]["address"];
    let orderTime
    if(data["data"]["trip"]["time"]=="moring"){
        orderTime="上半天";//預定時間
    }
    if(data["data"]["trip"]["time"]=="afternoon"){
        orderTime="下半天";//預定時間
    }

    let thankyouDiv =document.querySelector(".thankyouDiv");
    thankyouDiv.innerHTML=`
    <h3 >${orderName} 先生/小姐您好，感謝您預定行程：${orderAttraction}</h3>
    <div class="thankyouDivText">
    <p >您的訂單明細如下：</p>
    <p>日期：${orderDate}</p>
    <p>時間：${orderTime}</p>
    <p>費用：${orderPrice}</p>
    <p>地點：${orderAddress}</p>
    <p >請紀錄您的訂單編號，以便查詢。</p>
    <p>您的訂單編號為：</p><p style="text-decoration: underline; color:#448899">${getThankUrl}</p>
    </div>
    `
  
}

getThankyouPage()