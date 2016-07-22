var socket = io.connect("http://nameless-sjerin.rhcloud.com:8000");

var about = document.getElementsByClassName("about")[0];
var lock = document.getElementsByClassName("lock")[0];
var textarea = document.getElementsByClassName("t-field")[0];
var button_exit = document.getElementsByClassName("exit")[0];
var button = document.getElementById("adaptive_button");
var mes_box = document.getElementsByClassName("m-box")[0];
var e_plane = document.getElementsByClassName("e-plane")[0];
var audio = document.getElementsByClassName("signal")[0];

var stopInp = true;
var sending = false;
var timerOut;
var animateTimer;
var point = 0;

socket.on("pong", function() {
    if (timerOut)
    	clearTimeout(timerOut);
    if (button.className == "message") {
        timerOut = setTimeout(function() {
            lock.style.display = "block";
            stopInp = true;
            textarea.value = "";
            addMessage("m-sys", "p-sys", "Соединение потеряно.")
        }, 20000);
    }
    else {
    	timerOut = setTimeout(function() {
    		location.reload();
    	}, 20000);	
    }
});

/*if (is.desktop()) {
    audio.src = "signal/m-signal.mp3";
    var vol = document.getElementsByClassName("m-vol")[0];
    vol.style.display = "block";
}*/

socket.on("search", function() {
	location.reload();
});

socket.on("entry", function() {
    socket.emit("entry");
    about.style.display = "none";
    lock.style.display = "none";
    button_exit.style.display = "block";
    button.className = "message";
    clearInterval(animateTimer);
    stopInp = false;
    button.textContent = "Отправить";
});

socket.on('message', function(data) {
	checkMessage("b-mess", data);
    //if (is.mobile()) return;
    //audio.play(); 
});

socket.on("exit", function() {	
    lock.style.display = "block";
    stopInp = true;
    textarea.value = "";
    addMessage("m-sys", "p-sys", "Собеседник отключился.");
})

/*добавление обработчиков нажатия кнопки и клавиши Enter для отправки 
сообщений*/
if (window.addEventListener) 
	window.addEventListener("keydown", keyPress, false);
else if (window.attachEvent)
	window.attachEvent("onkeydown", keyPress);

if (button.addEventListener) {
	button.addEventListener("click", sendMessage);
	button.addEventListener("mouseover", colorButton, false);
	button.addEventListener("mouseout", function() {
        e_plane.style.background = "rgb(93, 128, 93)";}, false);
}
else if (button.attachEvent) {
	button.attachEvent("onclick", sendMessage);
	button.attachEvent("onmouseenter", colorButton);
	button.attachEvent("onmouseleave", function() {
		e_plane.style.background = "rgb(93, 128, 93)";});
}

if (button_exit.addEventListener) 
    button_exit.addEventListener("click", function() {
    	location.reload();
    }, false);
else if (button_exit.attachEvent)
	button_exit.attachEvent("onclick", function() {
		location.reload();
	});

if (textarea.addEventListener){
	textarea.addEventListener("input", stopInput, false);
    textarea.addEventListener("change", function() {
        textarea.style.background = "linear-gradient(to top, rgba(66,66,66,0.62),rgba(68,68,68,0))";
        textarea.style.backgroundColor = "#464849";
    }, false);
}
else if (textarea.attachEvent) {
	textarea.attachEvent("oninput", stopInput);
    textarea.attachEvent("onchange", function() {
        textarea.style.background = "linear-gradient(to top, rgba(66,66,66,0.62),rgba(68,68,68,0))";
        textarea.style.backgroundColor = "#464849";
    });
}

function checkMessage(classMes, textMes) {
    var last = mes_box.childNodes[0];
    
    if (last.className == classMes){
        if (textMes[0] == '\n')
            textMes = textMes.substring(1);
        textMes = "+" + textMes;
    }

    for (var i = textMes.indexOf("\n"); i != -1; i = 
        textMes.indexOf("\n")) {
        var line = textMes.substring(0, i);
        textMes = textMes.substring(i+1);

        if (line.search(/\S/) != -1)
            addMessage(classMes, "p-mess", line);
    }

    if (textMes.search(/\S/) != -1)
        addMessage(classMes, "p-mess", textMes);
}

function addMessage(classMes, classP, textMes) {
    var last = mes_box.childNodes[0];

    var p = document.createElement("p");
    p.className = classP;

     if (last.className == "m-sys") {
        return;
    }
    else if (last.className == classMes) {
        if (textMes[0] == "+") {
            var span = document.createElement("div");
            span.textContent = "+";
            textMes = textMes.substring(1);

            var text = document.createTextNode(textMes);

            p.appendChild(span);
            p.appendChild(text);

            last.appendChild(p);
        }
        else {
            p.textContent = " " + textMes; 
            last.appendChild(p);
        }
    }
    
    else {  
        p.textContent = textMes;      
        var section = document.createElement("section");
        section.className = classMes;
        section.appendChild(p);

        mes_box.insertBefore(section, last);
    }
}


function sendMessage() {
	var classButton = button.className;

	if (classButton == "search") {
        if (sending) return;
        sending = true;

		socket.emit("search");
		button.className = "";
		if (!animateTimer) {
		    button.textContent = "Идет поиск";
		    animateTimer = setInterval(animateSearch, 1000);
	    }

	    sending = false;
	}

	else if (classButton == "message") {
        if (sending) return;

	    var text = textarea.value;
	    textarea.value = "";
        sending = true;

	    if (text.search(/\S/) != -1) {
	        socket.emit('message', text, function() {
		        checkMessage("a-mess", text);   
	        });
        }

        sending = false;
    }
}

function keyPress(e) {
	e = e || window.event;

	if (e.keyCode == 13 && !e.shiftKey) {
		sendMessage();
	}
}

function colorButton() {
	if (button.className == "message") {
	    if (textarea.value.search(/\S/) == -1) 
		    e_plane.style.background = "#8d5858";
	}
}

function stopInput() {
	if (stopInp) 
		textarea.value = "";
}

function animateSearch() {
    if (point < 3) {
    	point++;
    	button.textContent += '.';
    }
    else {
    	button.textContent = "Идет поиск";
    	point = 0;
    }
}
