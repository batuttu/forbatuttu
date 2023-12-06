var socket = io();
const login_button = document.querySelector(".login-buton");
const user_name_input = document.querySelector(".the-name");
const user_password_input = document.querySelector(".the-password");
const login_screen = document.querySelector(".login-screen");
const takvim_screen = document.querySelector(".takvim-screen");
const alert_div = document.querySelector(".alert-div");
var iAm;
// LOCALE STROGE Yarın bakalım ve flex none yaptıktan sonra veri gönderimi
if(localStorage.getItem('VEGA_Takvim') == null){
    login_screen.style.display = "flex";
    takvim_screen.style.display = "none";
}else{
    login_screen.style.display = "none";
    takvim_screen.style.display = "flex";
    //socket.emit("setCalendar","a");
}

function addMyName(){
    if(user_name_input.value===""||user_password_input.value==="")
        {
            alert_div.innerText="Kullanıcı adı ya da şifre boş olamaz."
            alert_div.style.display = "flex";
        }
    else{
    var data = {
        "username" :  user_name_input.value,
        "password": user_password_input.value,
        "dates" : []
        
    }

    console.log(data);

    socket.emit('newUser', data);
    socket.on('isAvailable', (data) => {

        if(data == "yes"){
            localStorage.setItem('VEGA_Takvim', user_name_input.value);
            iAm = localStorage.getItem('VEGA_Takvim');
            if(localStorage.getItem('VEGA_Takvim') == null){
            login_screen.style.display = "flex";
            takvim_screen.style.display = "none";
        }   else{
            login_screen.style.display = "none";
            takvim_screen.style.display = "flex";
        }
            
            
        }else if(data == "no"){
            checkLogin=[user_name_input.value,user_password_input.value]
            fetch('dates.json')
            .then(response => response.json())
            .then(jsondata => {
            const userIndex = jsondata.findIndex(user => user.username === checkLogin[0]);
            if(jsondata[userIndex].username===checkLogin[0]&&jsondata[userIndex].password===checkLogin[1])
            {
                login_screen.style.display="none";
                takvim_screen.style.display="flex";
                localStorage.setItem('VEGA_Takvim', user_name_input.value);
                iAm = localStorage.getItem('VEGA_Takvim');
            }
            else{
                alert_div.innerText = "Kullanıcı adı ya da şifre yanlış";
                alert_div.style.display = "flex";
            }
        });
        }
        
    });
}
}



login_button.addEventListener("click",()=>{
    addMyName();
});

const calendar_box = document.querySelector(".calendar-container");



var startDate = new Date("2023.12.05");
var endDate = new Date("2023.12.30");

// Her gün için döngü
while (startDate <= endDate) {
    // Her gün için bir kutu oluştur
    var dayBox = document.createElement('div');
    dayBox.classList.add('day-box');
    dayBox.setAttribute('isCheck', "false");
    dayBox.textContent = startDate.toLocaleDateString();

    // Kutuyu ana container'a ekle
    calendar_box.appendChild(dayBox);
    

    dayBox.addEventListener("click", (e) => {
        var thisDate = e.target.innerText;
        console.log(thisDate);
        console.log(e.target.getAttribute("isCheck"));
        e.target.style.backgroundColor = "green";

        if(e.target.getAttribute("isCheck") == "false"){
            e.target.setAttribute('isCheck', "true");
            e.target.style.backgroundColor = "green";
            console.log("istiyorum iam " +iAm);
            var data = 
                {
                    "username" : iAm,
                    "dates" : thisDate
                }
            console.log(data);
            socket.emit('istiyorum', data);
        }
        else{
            e.target.setAttribute('isCheck', "false");
            e.target.style.backgroundColor = "red";
            var data = 
                {
                    "username" : iAm,
                    "dates" : thisDate
                }
            socket.emit('sil', data);
        }
        console.log(e.target.getAttribute("isCheck"));
    })
    
    startDate.setDate(startDate.getDate() + 1);
}

if(localStorage.getItem('VEGA_Takvim')){
    iAm = localStorage.getItem('VEGA_Takvim');
    fetch('dates.json')
    .then(response => response.json())
    .then(jsondata => {

        console.log(jsondata);
        var boxes = document.querySelectorAll(".day-box");

        const userIndex = jsondata.findIndex(user => user.username === iAm);
        console.log(userIndex);
        if(jsondata[userIndex].dates.length > 0){
            jsondata[userIndex].dates.forEach(date => {
                boxes.forEach(box => {
                    if(date == box.innerText){
                        box.setAttribute('isCheck', "true");
                        box.style.backgroundColor = "green";
                    }
                })
            });
        }
    });
}

user_name_input.addEventListener("keydown", (e) => {
    if (e.keyCode === 13) {
        addMyName();
    }
})


