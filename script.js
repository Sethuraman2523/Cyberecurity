// Live Date & Time

function updateClock() {

    const now = new Date();

    document.getElementById("date").innerHTML =
        now.toLocaleDateString();

    document.getElementById("time").innerHTML =
        now.toLocaleTimeString();
}

setInterval(updateClock,1000);

updateClock();



// Password Show Hide

const password=document.getElementById("password");

const eye=document.getElementById("togglePassword");

eye.onclick=function(){

if(password.type==="password"){

password.type="text";

eye.classList.remove("fa-eye");

eye.classList.add("fa-eye-slash");

}

else{

password.type="password";

eye.classList.remove("fa-eye-slash");

eye.classList.add("fa-eye");

}

}



// Login Attempt Control

let attempts=0;

let locked=false;

let timer;

let seconds=120;



const form=document.getElementById("loginForm");



form.addEventListener("submit",function(e){

e.preventDefault();



if(locked){

alert("Account Locked!");

return;

}



const username=document.getElementById("username").value;

const password=document.getElementById("password").value;



// Demo Credentials

if(username==="admin" && password==="12345"){

alert("Login Successful");

attempts=0;

document.getElementById("failedCount").innerHTML=0;

addHistory(username,"Success");

}

else{

attempts++;

document.getElementById("failedCount").innerHTML=attempts;

addHistory(username,"Failed");



if(attempts>=3){

lockAccount();

}

else{

alert("Invalid Username or Password");

}

}

});



function lockAccount(){

locked=true;

seconds=120;

timer=setInterval(countDown,1000);

alert("Account Locked for 2 Minutes");

}



function countDown(){

let min=Math.floor(seconds/60);

let sec=seconds%60;



document.getElementById("countdown").innerHTML=

String(min).padStart(2,'0')+

":"+

String(sec).padStart(2,'0');



seconds--;



if(seconds<0){

clearInterval(timer);

locked=false;

attempts=0;

document.getElementById("failedCount").innerHTML=0;

document.getElementById("countdown").innerHTML="02:00";

alert("Account Unlocked");

}

}



// Login History

function addHistory(user,status){

let tbody=document.getElementById("history");



let row=`

<tr>

<td>${new Date().toLocaleTimeString()}</td>

<td>${user || "Unknown"}</td>

<td>${status}</td>

<td>192.168.1.${Math.floor(Math.random()*200)}</td>

</tr>

`;



tbody.innerHTML=row+tbody.innerHTML;

}