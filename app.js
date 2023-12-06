// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3030;

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


// Dosya yolu
const jsonFilePath = 'public/dates.json';

function update(data){
    console.log("BURASI "+data.username);
    console.log("BURASI "+data.dates);
    fs.readFile(jsonFilePath, 'utf8', (err, jsondata) => {
        if (err) {
            console.error('Dosya okuma hatası:', err);
            return;
        }
    
        // JSON verisini parse et
        const jsonData = JSON.parse(jsondata);
    
        // Kontrol ve Güncelleme Fonksiyonu
        function updateJsonData(data) {
            // Kullanıcı var mı kontrol et
            const userIndex = jsonData.findIndex(user => user.username === data.username);
    
            // Eğer kullanıcı yoksa ekle
            if (userIndex === -1) {
                jsonData.push(data);
                console.log(data.username + " kullanıcısı eklenmiştir.");
            } else {
                
                // Tarih dizisi içinde THE_Tarh var mı kontrol et
                console.log(jsonData[userIndex].dates);
                var index = jsonData[userIndex].dates.indexOf(data.dates);
            
                if (index !== -1) {
                    // Eğer varsa, tarihi sil
                    jsonData[userIndex].dates.splice(index, 1);
                    console.log("silindi");
                } else {
                    // Eğer yoksa, tarihi ekle
                    console.log("ABs " +data.dates);
                    jsonData[userIndex].dates.push(data.dates);
                    console.log("eklendi");
                }
            }
    
            // Güncellenmiş JSON'u dosyaya yaz
            fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Dosya yazma hatası:', err);
                    return;
                }
                console.log('JSON dosyası güncellenmiştir.');
            });
        }
        updateJsonData(data);
    });
}

function addNewUser(data){
    fs.readFile(jsonFilePath, 'utf8', (err, jsondata) => {
        if (err) {
            console.error('Dosya okuma hatası:', err);
            return;
        }
    
        // JSON verisini parse et
        const jsonData = JSON.parse(jsondata);
    
        // Kontrol ve Güncelleme Fonksiyonu
        function addNewUserJsonData(data) {
            // Kullanıcı var mı kontrol et
            const userIndex = jsonData.findIndex(user => user.username === data.username);
    
            // Eğer kullanıcı yoksa ekle
            if (userIndex === -1) {
                jsonData.push(data);
                io.emit('isAvailable', "yes");
            }else{
                // YOU CANT GET THIS USERNAME
                io.emit('isAvailable', "no");
            }
    
            // Güncellenmiş JSON'u dosyaya yaz
            fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Dosya yazma hatası:', err);
                    return;
                }
                console.log('JSON dosyası güncellenmiştir.');
            });
        }
        addNewUserJsonData(data);
    });
}

/*function setCalendar(){
    console.log("eben var midur")
    fs.readFile(jsonFilePath, 'utf8', (err, jsondata) => {
        if (err) {
            console.error('Dosya okuma hatası:', err);
            return;
        }
    
        // JSON verisini parse et
        const jsonData = JSON.parse(jsondata);
        fetch(jsonData)
            .then(response => response.json())
            .then(jsondataa => {
                console.log(jsondataa);})
    });

}*/


io.on('connection', (socket) => {
    console.log('Bir kullanıcı bağlandı');
    
    // Yeni bir mesaj alındığında
    socket.on('istiyorum', (data) => {
        console.log(data);
        update(data);
        console.log(data.username +' Tarafından, İstenilen Tarih: ' + data.dates);
    });
    // Yeni bir mesaj alındığında
    socket.on('sil', (data) => {
        console.log(data);
        update(data);
        console.log(data.username +' Tarafından, Silinen Tarih: ' + data.dates);
    });
    socket.on('newUser', (data) => {
        console.log(data);
        addNewUser(data);
    });
    /*socket.on("setCalendar",(data) => {
        console.log(data);
        setCalendar();
    });*/
    // Bağlantı kesildiğinde
    socket.on('disconnect', () => {
        console.log('Bir kullanıcı ayrıldı');
    });
});

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
