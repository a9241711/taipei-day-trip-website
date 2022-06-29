//***全域變數設定***//
let page =0;
let keyword=""
const searchBtn=document.querySelector(".slogan-btn");
const loader = document.querySelector(".loader");
const main=document.querySelector(".main");
// let attractions//取得景點資料變數

//Model區與後端要資料處理
//***fetch景點資訊url，page+keyword***//
async function getPageData(page,keyword){
    try{
        let response = await fetch(`/api/attractions?page=${page}&keyword=${keyword}`);
        let data= await response.json();
        return attractions=data
        }
    catch(message){
        throw Error("Fetching was wrong");    
        } 
}

//View render畫面區
//***根據page取得景點資訊***//
async function showAttraction(){
    showEffect()//載入中畫面
    // //fetch資料
    let attractions= await getPageData(page,keyword);
    page =attractions["nextPage"];
    if(attractions["error"]!=true){
        let attractionData=attractions["data"];
        //    
    for (let i=0;i<attractionData.length;i++){
         //Attrraction Value
        let attractionTitleValue=attractionData[i]["name"]//景點名稱
        let attractionTransValue=attractionData[i]["mrt"]//景點交通
        let attractionCateValue=attractionData[i]["category"]//景點類別
        let attractionImgValue=attractionData[i]["images"][0]//景點圖片
        let attractionIdValue=attractionData[i]["id"]//景點id console.log(attractionIdValue)
        
        //render到網頁中
        let mainContent =document.createElement("div");
        mainContent.classList.add("main-content");
        mainContent.innerHTML=`
        <a href="/attraction/${attractionIdValue}">
        <img class="attractionImg" src="${attractionImgValue}">
        <h1 class="attractionTitle">${attractionTitleValue}</h1>
        <div class="txt">
            <p class="attractionTrans">${attractionTransValue}</p>
            <p class="attractionCate">${attractionCateValue}</p>
        </div>
        </a>`
        main.appendChild(mainContent);
        hideEffect()//關閉載入中畫面
        //設定flag為true
        ready=true;
    } 
    }else{
        showEffect()//載入中畫面
        //若無法順利找到景點，則顯示無法找到景點的文字
        removeAttraction();
        let notFoundAttraction =document.createElement("p");
        notFoundAttraction.textContent="查無景點";
        main.appendChild(notFoundAttraction);
        page=null;
        //關閉載入中動畫
        hideEffect();
        //設定flag為true
        ready=true;
    }
}

//***關鍵字搜尋景點function***//
function showKeywordAttraction(){
    searchBtn.addEventListener("click", async ()=>{
    //開啟載入中動畫
     showEffect();     
     //取得使用者輸入的值
     let searchValue=document.querySelector(".search").value;
     let keywordPage=0;
     keyword=searchValue;
    // //fetch資料
    let attractions= await getPageData(keywordPage,keyword);
    let keywordData=attractions["data"];
    //若無response錯誤訊息，表示成功取得景點資訊，顯示景點內容
    if(attractions["error"]!=true){ 
        //紀錄keyword的nextpage
        let keywordNextPage =attractions["nextPage"];
        //紀錄page的頁數console.log("keywordpage",page)
        page=keywordNextPage;
        // //移除頁面中的內容
        removeAttraction();
        //render景點資訊到頁面中
        for (let i=0;i<keywordData.length;i++){
            //KeyWord Attrraction Value
           let keywordDataTitleValue=keywordData[i]["name"]//景點名稱
           let keywordDataTransValue=keywordData[i]["mrt"]//景點交通
           let keywordDataCateValue=keywordData[i]["category"]//景點類別
           let keywordDataImgValue=keywordData[i]["images"][0]//景點圖片
           let keywordDataIdValue=keywordData[i]["id"]//景點id
            //render到網頁中
           let mainContent =document.createElement("div");
           mainContent.classList.add("main-content");
           mainContent.innerHTML=`
           <a href="/attraction/${keywordDataIdValue}">
           <img class="attractionImg" src="${keywordDataImgValue}">
           <h1 class="attractionTitle">${keywordDataTitleValue}</h1>
           <div class="txt">
               <p class="attractionTrans">${keywordDataTransValue}</p>
               <p class="attractionCate">${keywordDataCateValue}</p>
           </div>
           </a>`
           main.appendChild(mainContent);
           hideEffect();
           //設定flag為true
           ready=true;
       }
    }else{//若無法順利找到景點，則顯示無法找到景點的文字
        showEffect()//載入中畫面
        removeAttraction();
        let notFoundAttraction =document.createElement("p");
        notFoundAttraction.classList.add("noPage");
        notFoundAttraction.textContent="查無景點";
        main.appendChild(notFoundAttraction);
        page=null;
        hideEffect();//關閉載入畫面
        //設定flag為true
        ready=true;
    }
})
}

//***Endless Scroll function***//
// 設定flag 一開始初始值是false
let ready= false; 
let footer =document.querySelector(".footer")
//設定intersectionObserver載入更多data若footer可見
let option={
    root:null,
     rootMargin: "0px", //用來擴大或者縮小視窗的的大小
    threshold:0.1 //當觀察footer 10%時候就會觸發handleIntersect callback
};
//載入更多畫面
async function handleIntersect(entries){
    if(page==null){
        return
    }
    if(entries[0].isIntersecting && ready){ 
            ready=false;
            showAttraction();     
                }  
    }
// }
//建構IntersectionObserver
const observer=new IntersectionObserver(handleIntersect,option);
observer.observe(footer);


//remove不需要的景點
function removeAttraction(){
    main.innerHTML='';
}

//Controller區
//初始畫面
function initData(){
    
    showAttraction();
    

}


//執行function區
//頁面初始載入
initData();

//Endless頁面
document.addEventListener("DOMContentLoaded", ()=>{
    handleIntersect();//Endless page
    showKeywordAttraction()
})

