//***Model***//
//Fetch相關資料
async function updatePassword(updatePassword){
    try{
        let updateRequest=await fetch("/api/user",{
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({
                updatePassword:updatePassword
            })
        })
        let data= await updateRequest.json();
        return data
    }
    catch(message){
        throw Error("error",message)
    }

}

//***View***//
//取得會員訂單資訊
async function getMemberData(){
    showEffect()
    let userData=await getSignInFetch();//取得會員資訊
    let userName=userData["name"];
    let email=userData["email"]
    if(userData["data"]===null){
        alert("請先登入帳號");
        window.location.href="/"
        return
    }
    let memberInfo=document.querySelector(".member-info");


    memberInfo.innerHTML=`
    <p>姓名：${userName}</p>
    <p>電子郵件：${email}</p>
    <div class="updatePassword-input">
    <label for="pwd">修改密碼：</label>
    <input type="password" id="pwd" name="pwd" placeholder="請輸入修改密碼">
    <i class="far fa-save fa-lg " onclick={updatePasswordBtn()}></i></div>
    <p id="show-updateMes" style="display:none"></p>
    `
    let getAllData=await fetch("/api/order").then((res)=> res.json()).then((data)=>  data["data"]);//取得使用者訂單
    let orderItems =document.querySelector(".order-item");
    let memberOrder=document.querySelector(".member-order");
    let bookingFoot=document.querySelector(".footer");//footer
    if(getAllData===null ){//若無訂單資訊，則顯示相關文字
        orderItems.style.display="none";
        let noneBooking=document.createElement("p");
        noneBooking.textContent="目前沒有任何已完成預訂的行程";
        memberOrder.append(noneBooking);
        bookingFoot.style.height= "100%";
        hideEffect();
        return
    }
    for(let x=0;x<getAllData.length;x++){
        let orderTable=document.querySelector(".order-table");
        let orderTr= document.createElement("tr");
        let orderTitle = getAllData[x]["name"];//景點名稱
        let orderAddress = getAllData[x]["address"];//景點地址
        let orderDate =getAllData[x]["tripdate"];//預定日期
        let orderTime =getAllData[x]["triptime"]==="morning" ?"上半天" :"下半天";//預定時間
        let orderPrice =getAllData[x]["tripprice"];//預定時間
        orderTr.innerHTML=`
        <td>${orderTitle}</td>
        <td>${orderAddress}</td>
        <td>${orderDate}</td>
        <td>${orderTime}</td>
        <td>${orderPrice}</td>
        `
        orderTable.appendChild(orderTr)
        orderItems.appendChild(orderTable)
    }   
    hideEffect()
}

//修改密碼
async function updatePasswordBtn(){
    let getPassword=document.getElementById("pwd").value;
    let showUpdateMes=document.getElementById("show-updateMes")
    let data= await updatePassword(getPassword);
    if(data["error"] ){
        showUpdateMes.style.display ="block"
        showUpdateMes.textContent=data["message"];
    }else{
        showUpdateMes.setAttribute("style","display:block;color:#448899")
        showUpdateMes.textContent="修改成功";
        
    }
}




//***Controller***//
document.addEventListener("DOMContentLoaded",async()=>{
    await getMemberData();
})