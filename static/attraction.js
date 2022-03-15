//全域變數設定
//fetch attractionId資料變數
let attractionId
// 輪播圖片設定
let slideIndex=1;
let aTag=document.querySelectorAll("a");

//Model區 取得資料
//fetch
function getIdFetch(){
    try{
        let url =location.href;
        let urlNum=url.split("/")[url.split("/").length - 1] //取最後值
    return  fetch(`/api/attraction/${urlNum}`).then((response)=>{
            // console.log(response)
            return response.json();
        }).then((data)=>{
            // console.log(data)
            return attractionId = data;
        })
    }
    catch(message){
        throw Error("Error",message);
    }
}

//view區 render畫面至html
//景點資訊
function getIdData (){
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
    let attractionImages=attractionId["data"]["images"];
    let attractionTitleValue=attractionId["data"]["name"];
    let attractionCateValue=attractionId["data"]["category"];
    let attractionMrtValue=attractionId["data"]["mrt"];
    let introDescriptionValue=attractionId["data"]["description"];
    let introAddressValue=attractionId["data"]["address"];
    let introTransValue=attractionId["data"]["transport"];

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
}

//顯示方向鍵
async function showArrowElement(){
    await new Promise((resolve,reject)=>{
        setTimeout(()=>{
        for (let j =0;j<aTag.length;j++){
            aTag[j].style.display="block";
            }
        },500)
        resolve();//繼續往下執行
    })
}

//選擇方向鍵時顯示圖片
function plusSlides(n){
    // console.log("number",n,"index",slideIndex)
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
            console.log("max",slideNumber);
        }
        if(slideNumber<1){//若slideNumber小於1時，要回到最大的元素
            slideIndex=slide.length;
            console.log("min",slideNumber);
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

//Controller區，操作function
//畫面initial
async function getInitail(){
    showEffect()
    await getIdFetch();
    getIdData();
    showArrowElement();
    showSlide(slideIndex);
    hideEffect()
}

//執行function
document.addEventListener("DOMContentLoaded",()=>{
    getInitail();
})
