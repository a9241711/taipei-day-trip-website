//全域變數設定
//fetch attractionData資料變數
let attractionData
// 輪播圖片設定
let slideIndex=1;

let attractionUrl =location.href; //取得網址
let url=attractionUrl.split("/")[attractionUrl.split("/").length - 1] //取最後ID值
//Model區 取得資料
//過濾掉不必要的字符
function filterUrl(str){
    let pattern=/[`~!@#$^&*()=|{}':;',\\\[\]\.<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？]/g;
    return str.replace(pattern,"");
}
let urlNum=filterUrl(url);
console.log(urlNum);
//fetch
async function getIdFetch(){
    try{
        const response = await fetch(`/api/attraction/${urlNum}`);
        const data = await response.json();
        return attractionData = data;
    }
    catch(message){
        throw Error("Error",message);
    }
}

//fetch booking data
async function postBooking(attractionId,date,time,price){
    try{
        const response=await fetch("/api/booking",{
            method:"POST",
            headers:{"Content-Type":"application/json; Charset=UTF-8"},
            body:JSON.stringify({
                attractionId:attractionId,
                date:date, 
                time:time,
                price:price
            })
        });
        const data=response.json()
        return data
    }
    catch(message){
        throw Error("Error",message)
    }
}
//view區 render畫面至html
//景點資訊
function getIdData (){
    showEffect();
    // let id =1;
    //取得HTML標籤
    let attractionImge=document.querySelector(".attractionImge");//圖片element
    let attractionTitle=document.querySelector(".attractionTitle");
    let attractionCate =document.querySelector(".attractionCate");
    let attractionMrt =document.querySelector(".attractionMrt");
    let introDescription=document.querySelector(".introDescription");
    let introAddress =document.querySelector(".introAddress");
    let introTrans= document.querySelector(".introTrans");
    let divDot=document.querySelector(".div-dot");
    // //取得fetch data console.log(attractionId)
    let attractionImages=attractionData["data"]["images"];
    let attractionTitleValue=attractionData["data"]["name"];
    let attractionCateValue=attractionData["data"]["category"];
    let attractionMrtValue=attractionData["data"]["mrt"];
    let introDescriptionValue=attractionData["data"]["description"];
    let introAddressValue=attractionData["data"]["address"];
    let introTransValue=attractionData["data"]["transport"];

    //Render文字回去 attraction.html
    attractionTitle.textContent=attractionTitleValue;
    attractionCate.textContent=attractionCateValue;
    attractionMrt.textContent=attractionMrtValue;
    introDescription.textContent=introDescriptionValue;
    introAddress.textContent=introAddressValue;
    introTrans.textContent=introTransValue;
    //Render圖片回去attraction.hmtl
    for(let x=0;x<attractionImages.length;x++){
        let imageDiv = document.createElement("div");
        let images = document.createElement("img");
        let dotSpan =document.createElement("span");
        images.setAttribute("src",attractionImages[x]);
        images.classList.add("attractionImges");
        imageDiv.setAttribute("class","slide fade");
        dotSpan.setAttribute("class","dot active");
        dotSpan.setAttribute("onclick",`currentSlide(${x+1})`);
        imageDiv.appendChild(images);
        divDot.appendChild(dotSpan)
        attractionImge.appendChild(imageDiv);
    }
    hideEffect();
}

//選擇方向鍵時顯示圖片
function plusSlides(n){
    console.log("number",n,"index",slideIndex)
    showSlide(slideIndex +=n);
}
//選擇dot時顯示圖片
function currentSlide(n){
    showSlide(slideIndex =n)
}
//顯示圖片function
async function showSlide(slideNumber){
    
    await new Promise((resolve,reject)=>{
        let i ;
        let slide=document.querySelectorAll(".slide") //取得所有.slide元素
        let dot =document.querySelectorAll(".dot")//取得所有.dot元素
        if(slideNumber>slide.length){//若slideNumber大於slide長度時，要回到第一個元素1
            slideIndex=1;
        }
        if(slideNumber<1){//若slideNumber小於1時，要回到最大的元素
            slideIndex=slide.length;
    }    for(i=0;i<slide.length;i++){
        slide[i].style.display="none";//把所有.slide元素都隱藏
    }   for(i=0;i<slide.length;i++){
        dot[i].className=dot[i].className.replace("active","");//把所有.dot元素的active css replace成空字串
    }
        slide[slideIndex-1].style.display="block";//把slideNumber的slide元素打開
        dot[slideIndex-1].className += " active";
        resolve();//繼續往下執行
    }) 
}

//日期選擇
function selectTime(){
    let timSelected=document.querySelector('input[name="time"]:checked').value;//取得input value
    let selectedTime=document.getElementById("selected-time");
    // console.log(timSelected);
    selectedTime.textContent="新台幣"+timSelected+"元";
}

//開啟載入中動畫
function showEffect(){
    let divLoader=document.querySelector(".div-loader")
    let loader = document.querySelector(".loader");
    divLoader.style.display="block";
    loader.style.display="block";
}
//關閉載入中動畫
function hideEffect(){
    let divLoader=document.querySelector(".div-loader")
    let loader = document.querySelector(".loader");
    divLoader.style.display="none";
    loader.style.display="none";
}

//POST預定行程
function getBookingPost(){
    let bookingBtn=document.querySelector(".booking-btn"); //提交booking的按鈕
    bookingBtn.addEventListener("click", async(e)=>{
        e.preventDefault();
        let attractionId=urlNum;
        let date = document.querySelector('input[name="date"]').value;
        let price=document.querySelector('input[name="time"]:checked').value;
        let time ;
        if(price==2000){
            time="moring";
        }else{
            time="afternoon";
        }
        console.log(attractionId,date,price,time)
        let data= await postBooking(attractionId,date,time,price);
        if(data["ok"]==true){
            window.location="/booking"
        }if (data["message"]=="尚未登入" ){
            signin.setAttribute("style", "display:block; transform: scale(1); ");
            signinForm.setAttribute("style", "animation:formMove 1s");
            // popUpController();
            return
        }
        if(data["error"] ){
            let attractionBook=document.querySelector(".attraction-book").children[2].lastElementChild;
            attractionBook.insertAdjacentHTML("afterend", `<p style="color:#448899; margin-top:20px;">${data["message"]}</p>`);
            flag=false;
        }
    })
}

//date不可選今天以前的日期
function minDate(){
    let dateChoose=document.getElementsByName("date"); //getElementsByName回傳nodelist，需要用array選取
    let today= new Date().toISOString().split("T")[0]; //取得當前的年月日
    dateChoose[0].setAttribute("min",today);
}

//Controller區，操作function
//畫面initial
async function getInitail(){
    await getIdFetch();
    getIdData();
    showSlide(slideIndex);
}




//執行function
document.addEventListener("DOMContentLoaded",()=>{
    getInitail();
    getBookingPost();
    minDate();
})
