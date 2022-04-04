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
    let data=await getOrderFetch(getThankUrl)
    console.log(data)
    let orderName=data["data"]["contact"]["name"]
    let thankyouDiv =document.querySelector(".thankyouDiv");
    thankyouDiv.innerHTML=`
    <h3 >${orderName} 先生/小姐您好，感謝您預定本行程</h3>
    <p >請紀錄您的訂單編號，以便查詢。</p></br>
    <p>您的訂單編號為：</p><p style="text-decoration: underline; color:#448899">${getThankUrl}</p>
    `
  
}

getThankyouPage()