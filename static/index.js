//***變數設定***//
let page =0;
let keyword=""
const searchBtn=document.querySelector(".slogan-btn");
const loader = document.querySelector(".loader");
const main=document.querySelector(".main");

//***fetch景點資訊url，page+keyword***//
async function getPageData(page,keyword){
    try{
        let response = await fetch(`/api/attractions?page=${page}&keyword=${keyword}`);
        if(response.ok){
            let data= await response.json();
            // console.log("data",data)
            return data
        }else{
            let error= await response.json();
            // console.log("data",data)
            return error
        }
    }
    catch(message){
        console.log(`${message}`);
        throw Error("Fetching was wrong");    
        } 
}

//***根據page取得景點資訊***//
async function showAttraction(){
    //開啟載入中動畫
    showEffect();
    //fetch資料
    let attractions = await getPageData(page,keyword);// console.log("attractions",attractions,"attractionpage",page)
    if(attractions["error"]!=true){
        let attractionData=attractions["data"];
        page =attractions["nextPage"];   
    for (let i=0;i<attractionData.length;i++){
         //Attrraction Value
        let attractionTitleValue=attractionData[i]["name"]//景點名稱
        let attractionTransValue=attractionData[i]["mrt"]//景點交通
        let attractionCateValue=attractionData[i]["category"]//景點類別
        let attractionImgValue=attractionData[i]["images"][0]//景

        //render到網頁中
        let mainContent =document.createElement("div");
        mainContent.classList.add("main-content");
        mainContent.innerHTML=`
        <img class="attractionImg" src="${attractionImgValue}">
        <h1 class="attractionTitle">${attractionTitleValue}</h1>
        <div class="txt">
            <p class="attractionTrans">${attractionTransValue}</p>
            <p class="attractionCate">${attractionCateValue}</p>
        </div>`
        main.appendChild(mainContent);
        //關閉載入中動畫
        hideEffect();
    } 
    }else{
        //若無法順利找到景點，則顯示無法找到景點的文字
        removeAttraction();
        let notFoundAttraction =document.createElement("p");
        notFoundAttraction.textContent="查無景點";
        main.appendChild(notFoundAttraction);
        page=null;
        //關閉載入中動畫
        hideEffect();
    }
}

//***關鍵字搜尋景點function***//
searchBtn.addEventListener("click",async ()=>{
    //取得使用者輸入的值
    let searchValue=document.querySelector(".search").value;
    let keywordPage=0;
    keyword=searchValue;
    //根據keyword Fetch資料console.log("keywordPage",keywordPage)
    let keywordAttractions = await getPageData(keywordPage,keyword);
    //紀錄是否有response錯誤訊息，用來判斷是否查無相關景點
    let keywordData=keywordAttractions["data"];
       
    //若無response錯誤訊息，表示成功取得景點資訊，顯示景點內容
    if(keywordAttractions["error"]!=true){ 
        //紀錄keyword的nextpage
        let keywordNextPage =keywordAttractions["nextPage"];
        //紀錄page的頁數console.log("keywordpage",page)
        page=keywordNextPage;
        //開啟載入中動畫
        showEffect();
        //移除頁面中的內容
        removeAttraction();
        //render景點資訊到頁面中
        for (let i=0;i<keywordData.length;i++){
            //KeyWord Attrraction Value
           let keywordDataTitleValue=keywordData[i]["name"]//景點名稱
           let keywordDataTransValue=keywordData[i]["mrt"]//景點交通
           let keywordDataCateValue=keywordData[i]["category"]//景點類別
           let keywordDataImgValue=keywordData[i]["images"][0]//景點圖片

            //render到網頁中
           let mainContent =document.createElement("div");
           mainContent.classList.add("main-content");
           mainContent.innerHTML=`
           <img class="attractionImg" src="${keywordDataImgValue}">
           <h1 class="attractionTitle">${keywordDataTitleValue}</h1>
           <div class="txt">
               <p class="attractionTrans">${keywordDataTransValue}</p>
               <p class="attractionCate">${keywordDataCateValue}</p>
           </div>`
           main.appendChild(mainContent);
           //關閉載入中動畫
           hideEffect()
       }
    }else{//若無法順利找到景點，則顯示無法找到景點的文字
        removeAttraction();
        let notFoundAttraction =document.createElement("p");
        notFoundAttraction.classList.add("noPage");
        notFoundAttraction.textContent="查無景點";
        main.appendChild(notFoundAttraction);
        page=null;
        //關閉載入中動畫
        hideEffect();
    }
    

})

//***Endless Scroll function***//
let footer =document.querySelector(".footer")
// document.addEventListener("DOMContentLoaded",()=>{
    //設定intersectionObserver載入更多data若footer可見
    let option={
        root:null,
        rootMargin: "0px", //用來擴大或者縮小視窗的的大小
        threshold:0.1 //當觀察footer 10%時候就會觸發handleIntersect callback
    };
    //callback function，操控IntersectionObserver
    function handleIntersect(entries){
        console.log(entries[0].intersectionRatio)
        if(page==null){
            return
        }if(entries[0].intersectionRatio <= 0) return;
        else{
            if(entries[0].isIntersecting){
                showAttraction();     
                    }  
        }
    }
    //建構IntersectionObserver
    const observer=new IntersectionObserver(handleIntersect,option);
    //觀察指定區域
    if(page !=null){//若page不等於null，判斷是否footer已進入可見範圍，並執行showAttraction
    observer.observe(footer);
    }
// });

//remove不需要的景點
function removeAttraction(){
    main.innerHTML='';
}
//開啟載入中動畫
function showEffect(){
    let divLoader=document.querySelector(".div-loader")
    let loader = document.querySelector(".loader");
    let footer = document.querySelector(".footer");
    divLoader.style.display="block";
    loader.style.display="block";
    footer.style.display="none";
}
//關閉載入中動畫
function hideEffect(){
    let divLoader=document.querySelector(".div-loader")
    let loader = document.querySelector(".loader");
    let footer = document.querySelector(".footer");
    divLoader.style.display="none";
    loader.style.display="none";
    footer.style.display="flex";
}

//練習用append加入網頁元素，可忽略//
// let getData=function(){
//     let url = `http://localhost:3000/api/attractions?page=${page}&keyword=${keyword}`
//     fetch(url).then((response)=>{
//         return response.json();
//     }).then((data)=>{
//         let main =document.querySelector(".main")
//         let attractionData=data["data"];
//         let nextPage =data["nextPage"]     
//             for (let i=0;i<attractionData.length;i++){
//                 let mainContent =document.createElement("div");
//                 mainContent.classList.add("main-content");
//                 let txt =document.createElement("div");
//                 txt.classList.add("txt");
//                 //Attrraction Value
//                 let attractionTitleValue=attractionData[i]["name"]//景點名稱
//                 let attractionTransValue=attractionData[i]["mrt"]//景點交通
//                 let attractionCateValue=attractionData[i]["category"]//景點類別
//                 let attractionImgValue=attractionData[i]["images"][0]//景點照片
//                 // console.log(attractionData[i])
//                 let attractionTitle=document.createElement("p") //景點名稱title
//                 attractionTitle.textContent=attractionTitleValue
//                 attractionTitle.classList.add("attractionTitle")
//                 let attractionTrans=document.createElement("p") //景點交通
//                 attractionTrans.textContent=attractionTransValue
//                 attractionTrans.classList.add("attractionTrans")
//                 let attractionCate=document.createElement("p") //景點類別
//                 attractionCate.textContent=attractionCateValue
//                 attractionCate.classList.add("attractionCate")
//                 let arratcionImg = document.createElement("img"); //Img照片
//                 arratcionImg.src=attractionImgValue;
//                 txt.append(attractionTrans,attractionCate);
//                 mainContent.append(arratcionImg,attractionTitle,txt);
//                 main.appendChild(mainContent);
//         }
//     })
// }
// 


