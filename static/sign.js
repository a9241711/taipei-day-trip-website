
//登入/註冊彈出視窗的相關變數
let signLink=document.querySelector(".sign-link");//登入/註冊彈出按鈕
let closeSignin=document.querySelector(".closeSignin")//關閉彈出視窗
let closeSignup=document.querySelector(".closeSignup")//關閉彈出視窗
let signin =document.querySelector(".signin");//登入表單
let signinForm=document.querySelector(".signin-form");//登入表單
let signInBtn =document.querySelector(".signIn-btn");//登入送出按鈕
let signinA=document.querySelector(".signin-a");//轉換註冊彈出頁面
let signup =document.querySelector(".signup");//註冊表單
let signupA=document.querySelector(".signup-a");//轉換登入彈出頁面
let signUpBtn=document.querySelector(".signUp-btn");//註冊送出按鈕
let signOutBtn =document.querySelector(".signOut");//登出header
let bookLink=document.querySelector(".book-link")
//顯示文字相關變數
let errorMessage //錯誤訊息
let successMeg //成功訊息

//***Model***//
//Fetch取得使用者登入資訊GET
let userUrl='/api/user'
async function getSignInFetch(){
    try{
        const response= await fetch(userUrl);
        const data= await response.json();
        return data;
    }
    catch(message){
        throw Error("Error",message);
    }

}

//Fetch使用者登入PATCH
async function patchSignInFetch(email,password){
    try{
        let response =await fetch(userUrl,{
            method:"PATCH",
            body:JSON.stringify({ 
                email:email,
                password:password}),
            headers:{"Content-Type":"application/json; charset=UTF-8"},
        })
        let data =await response.json();
        return data;
    }
    catch(message){
        throw Error("Error",message);
    }
}
//fetch使用者註冊POST
async function postSignUpFetch(signName,signEmail,signPassword){
    try{
        let response=await fetch(userUrl,{
            method:"POST",
            body:JSON.stringify({
                signName:signName,
                signEmail:signEmail,
                signPassword:signPassword
            }),
            headers:{"Content-Type":"application/json; Charset=UTF-8"} 
        })
        let data= await response.json();
        return data;
    }
    catch (message){
        throw Error("Error",message);
    }
}
//fetch使用者登出DELETE
async function deleteSignFetch(){
    try{
        const response= await fetch(userUrl,{
            method:"DELETE",
        })
        const data= await response.json();
        return data;
    }
    catch(message){
        throw Error("Error",message);
    }

}

//***View***//

//取得使用者登入資訊
async function getUserView(){
            let data=await getSignInFetch() //console.log(data)
            // console.log(data)
            if(data["data"]!==null){
                signLink.setAttribute("style","display:none;")
                signOutBtn.setAttribute("style","display:block;")
             }else if(data["data"]==null){
                signLink.setAttribute("style","display:block;")
                signOutBtn.setAttribute("style","display:none;")
             }
    }
    
//登入畫面
function signInView(){
    signInBtn.addEventListener("click",async(e)=>{
        e.preventDefault();
        let email =document.querySelector(".email").value;
        let password =document.querySelector(".password").value;          
        let data = await patchSignInFetch(email,password);
            if(data["ok"]==true){
                    successMeg="登入成功，重新導向";
                    showSignInMessage(successMeg)
                    window.location.reload();
            }else{
                errorMessage="帳號密碼錯誤，請重新登入"
                showSignInMessage(errorMessage)
            }
        })
}

//註冊畫面
function signUpView(){
    signUpBtn.addEventListener(("click"),async (e)=>{
        e.preventDefault();
        let signName=document.querySelector(".signName").value;
        let signEmail=document.querySelector(".signEmail").value;
        let signPassword=document.querySelector(".signPassword").value;  
        if (signName===""||signEmail===""||signPassword ===""){
            errorMessage="欄位不得空白" ;
            showSignUpMessage(errorMessage);
            return
        }
            let data = await postSignUpFetch(signName,signEmail,signPassword);
            if(data["error"]==true){
                errorMessage=data.message;
                if(errorMessage=="信箱格式錯誤"){
                    showSignUpMessage(errorMessage)
                }
                if(errorMessage=="密碼需符合8碼數字+英文大小寫各一"){
                    showSignUpMessage(errorMessage)
                }
                if(errorMessage=="帳號已註冊"){
                    showSignUpMessage(errorMessage)
                }
            }
            else{
                successMeg="成功註冊"
                showSignUpMessage(successMeg)
                }
        })  
}

//登出畫面
function signOut(){
    signOutBtn.addEventListener(("click"),async(e)=>{
        e.preventDefault(); //        console.log("signout")
        let res=await deleteSignFetch();
        console.log(res)
        window.location.reload();
    }) 
}


//顯示登入/註冊的彈窗
function popUpController(){
    signLink.addEventListener("click",(e)=>{
        e.preventDefault();
        signin.setAttribute("style", "display:block; transform: scale(1); ");
        signinForm.setAttribute("style", "animation:formMove 1s");
    })
    //關閉登入視窗
    closeSignin.addEventListener("click",()=>{
        signin.setAttribute("style", "display:none; transform: scale(0); ");
        signinForm.setAttribute("style", "animation:none");
    })
    //切換至註冊視窗
    signinA.addEventListener("click",(e)=>{
        e.preventDefault();
        signin.setAttribute("style", "transform: scale(0); ");
        signinForm.setAttribute("style", "animation:none");
        signup.setAttribute("style", "display:block; ");
    })
    //切換至登入視窗
    signupA.addEventListener("click",(e)=>{
        e.preventDefault();
        signup.setAttribute("style", "display:none; ");
        signin.setAttribute("style", "display:block; transform: scale(1); ");
    })
    //關閉註冊視窗
    closeSignup.addEventListener("click",()=>{
        signup.setAttribute("style", "display:none; ");
    })
    //booking預定行程按鈕
    bookLink.addEventListener("click",async (e)=>{
    e.preventDefault();
    let data=await getSignInFetch();
    if(data["data"]!==null){
        window.location.href="/booking"
    }else{
        signin.setAttribute("style", "display:block; transform: scale(1); ");
        signinForm.setAttribute("style", "animation:formMove 1s");
        popUpController()
    }
})
}

//登入成功or失敗文字顯示
function showSignInMessage(error){
    let message = document.querySelector(".errorSignin");
    message.setAttribute("style","display:block;color:#448899;margin-top:10px;");
    message.textContent=error;
}
//註冊成功or失敗文字顯示
function showSignUpMessage(error){
    let message = document.querySelector(".errorSignup");
    message.setAttribute("style","display:block;color:#448899;margin-top:10px;");
    message.textContent=error;
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


//***Controller***//
getUserView(); //取得session登入驗證
window.onload=function(){
    // showEffect();
    popUpController();//彈出視窗
    signInView();//使用者登入
    signUpView()//使用者註冊
    signOut();
    // hideEffect();
}








///整理前coding
//登入操作
// signInBtn.addEventListener("click",async(e)=>{
//     e.preventDefault();
//     let email =document.querySelector(".email").value;
//     let password =document.querySelector(".password").value;
//     // console.log(email,password)
//     // fetch('/api/user',{
//     //     method:"PATCH",
//     //     body:JSON.stringify({ 
//     //         email:email,
//     //         password:password}),
//     //     headers:{"Content-Type":"application/json; charset=UTF-8"},
//     //     }).then((response)=>{
//     //        return response.json();
//     //     }).then((result)=>{
            
//     let data = await patchSignInFetch(email,password);
//     console.log(data)
//             if(data["ok"]==true){
//                     successMeg="註冊成功，重新導向首頁"
//                     showSignInMessage(successMeg)
//                     window.location.reload();
//             }else{
//                 errorMessage="帳號密碼錯誤，請重新登入"
//                 showSignInMessage(errorMessage)
//             }
//         })
        // }).catch((e)=>{console.log(e)});
// })

//註冊

// signUpBtn.addEventListener(("click"),async (e)=>{
//     e.preventDefault();
//     let signName=document.querySelector(".signName").value;
//     let signEmail=document.querySelector(".signEmail").value;
//     let signPassword=document.querySelector(".signPassword").value;

//     // console.log(signName,signEmail)
//     if (signName===""||signEmail===""||signPassword ===""){
//         errorMessage="欄位不得空白" ;
//         showSignUpMessage(errorMessage);
//         return
//     }
    // fetch("/api/user",{
    //     method:"POST",
    //     body:JSON.stringify({
    //         signName:signName,
    //         signEmail:signEmail,
    //         signPassword:signPassword
    //     }),
    //     headers:{"Content-Type":"application/json; Charset=UTF-8"}    
    // }).then((response)=>{
    //     return response.json();
    // }).then((data)=>{
        // console.log(data)
    //     let data = await postSignUpFetch(signName,signEmail,signPassword);
    //     if(data["error"]==true){
    //         errorMessage=data.message;
    //         if(errorMessage=="信箱格式錯誤"){
    //             showSignUpMessage(errorMessage)
    //         }
    //         if(errorMessage=="密碼需符合8碼數字+英文大小寫各一"){
    //             showSignUpMessage(errorMessage)
    //         }
    //         if(errorMessage=="帳號已註冊"){
    //             showSignUpMessage(errorMessage)
    //         }
    //     }
    //     else{
    //         successMeg="成功註冊"
    //         showSignUpMessage(successMeg)
    //         }
    // })
// })


//登出

// function signOut(){
//     signOutBtn.addEventListener(("click"),async(e)=>{
//         e.preventDefault();
//         console.log("signout")
        // fetch("/api/user",{
        //     method:"DELETE"}).then((response)=>{
        //     return response.json()}).then((data)=>{
            // alert("已登出，並導向首頁");
        // await deleteSignFetch();
        // window.location.reload();
        // })
//     }) 
// }