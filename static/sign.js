let signLink=document.querySelector(".sign-link");
let closeSignin=document.querySelector(".closeSignin")
let closeSignup=document.querySelector(".closeSignup")
let signin =document.querySelector(".signin");
let signinForm=document.querySelector(".signin-form");
let signup =document.querySelector(".signup");
let signinA=document.querySelector(".signin-a");
let signupA=document.querySelector(".signup-a");

//顯示登入彈窗
signLink.addEventListener("click",()=>{
    // signin.classList.add("active");
    signin.setAttribute("style", "display:block; transform: scale(1); ");
    signinForm.setAttribute("style", "animation:formMove 1s");
})
closeSignin.addEventListener("click",()=>{
    signin.setAttribute("style", "display:none; transform: scale(0); ");
    signinForm.setAttribute("style", "animation:none");
})
signinA.addEventListener("click",()=>{
    signin.setAttribute("style", "transform: scale(0); ");
    signinForm.setAttribute("style", "animation:none");
    signup.setAttribute("style", "display:block; ");
})
signupA.addEventListener("click",()=>{
    signup.setAttribute("style", "display:none; ");
    signin.setAttribute("style", "display:block; transform: scale(1); ");
    // signinForm.setAttribute("style", "animation:none");
})
closeSignup.addEventListener("click",()=>{
    signup.setAttribute("style", "display:none; ");
})