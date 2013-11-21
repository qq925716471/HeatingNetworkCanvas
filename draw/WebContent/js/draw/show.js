var canvas = document.getElementById('canvas');
var c = canvas.getContext('2d');
var width = document.body.clientWidth - 2 * canvas.offsetTop;
var height = document.body.clientHeight - 2 * canvas.offsetLeft;
canvas.width = width;
canvas.height = height;
c.scale(width / 1200, height / 600);
var lines = [];
var icons = [];
var texts = [];
var showData = {};
var initState = false;
/**
 * 读取数据
 * @param {Object} event
 */
var source = new EventSource("sendMessage.jsp");
if(typeof(EventSource)!=="undefined"){
 source.onmessage = function(event) {
	showData = JSON.parse(event.data);
	console.log("message");
};
source.onerror = function(event) {
	console.log("error");
};
source.onopen = function(event) {
	console.log("open");
};}
else
  {
 alert("不支持EventSource");
  } 

var select = null;
var clickIconIndex = null;
var times = 1;
var xmlhttp;
function createXMLHttp() {
	xmlhttp = null;
	if (window.XMLHttpRequest) {// code for Firefox, Opera, IE7, etc.
		xmlhttp = new XMLHttpRequest();
	} else if (window.ActiveXObject) {// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	if (xmlhttp == null) {
		alert("Your browser does not support XMLHTTP.");
	}
}
function init() {
	if (xmlhttp == null) {
		createXMLHttp();
	}
	xmlhttp.onreadystatechange = state_Change;
	xmlhttp.open("post", "getPicture.action?stationName=a", true);
	xmlhttp.send(null);

}
function state_Change() {
	if (xmlhttp.readyState == 4) {// 4 = "loaded"
		if (xmlhttp.status == 200) {// 200 = "OK"
			var data = JSON.parse(xmlhttp.responseText)[0];
			lines = data.lines;
			icons = data.icons;
			texts = data.texts;
			
		} else {
			alert("没有数据!");
		}
	}
}
init();

// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame || function(callback) {
				window.setTimeout(callback, 1000 / 10);
			};
})();

// usage:
// instead of setInterval(render, 16) ....

(function loop() {
	drawParticles();
	
	requestAnimFrame(loop);
})();

/**
 * 画线
 */
var line = null;

function drawLines() {
	for ( var i in lines) {
		line = lines[i];
		
		if (line.isOpen > 0) {
			c.save();
			c.globalCompositeOperation = "source-over";
			//Lets reduce the opacity of the BG paint to give the final touch
			c.fillStyle = "rgba(255, 0, 0, 0.8)";
			c.fillRect(line.x, line.y, line.w, line.h);
			waterFlow(line);
			c.restore();
		}else{
			c.fillStyle = line.color;
			c.fillRect(line.x, line.y, line.w, line.h);
		}
	}
}

/**
 * 流水
 * @param {Object} line
 */
var lineX, lineY;
function waterFlow(line) {
	switch (line.flow) {
	case "west":
		if (!line.water) {
			var waterPoints = [];
			for ( var j = 3; j < line.w - 3; j = j + 30) {
				var water = {
					x : j,
					y : 3
				};
				waterPoints.push(water);
			}
			line.water = waterPoints;
		}
		
		for ( var j in line.water) {
			c.beginPath();
			c.fillStyle = "#009ad6";
			lineX = parseInt(line.x) + parseInt(line.water[j].x++);
			lineY = parseInt(line.y) + 1 + parseInt(line.water[j].y);
			if (parseInt(line.water[j].x + 3) > line.w) {
				line.water[j].x = 3;
			}
			c.arc(lineX, lineY, 3, 0, Math.PI * 2, false);
			c.fill();
		}
		break;
	case "east":
		if (!line.water) {
			var waterPoints = [];
			for ( var j = 3; j < line.w - 3; j = j + 30) {
				var water = {
					x : j,
					y : 3
				};
				waterPoints.push(water);
			}
			line.water = waterPoints;
		}
		for ( var j in line.water) {
			c.beginPath();
			c.fillStyle = "#009ad6";
			lineX = parseInt(line.x) + parseInt(line.water[j].x--);
			lineY = parseInt(line.y) + 1 + parseInt(line.water[j].y);
			if (parseInt(line.water[j].x - 3) < 0) {
				line.water[j].x = line.w - 3;
			}
			c.arc(lineX, lineY, 3, 0, Math.PI * 2, false);
			c.fill();
		}
		break;
	case "north":
		if (!line.water) {
			var waterPoints = [];
			for ( var j = 3; j < line.h - 3; j = j + 30) {
				var water = {
					x : 4,
					y : j
				};
				waterPoints.push(water);
			}
			line.water = waterPoints;
		}
		for ( var j in line.water) {
			c.beginPath();
			c.fillStyle = "#009ad6";
			lineX = parseInt(line.x) + parseInt(line.water[j].x);
			lineY = parseInt(line.y) + parseInt(line.water[j].y--);
			if (parseInt(line.water[j].y - 3) < 0) {
				line.water[j].y = line.h - 3;
			}
			c.arc(lineX, lineY, 3, 0, Math.PI * 2, false);
			c.fill();
		}
		break;
	case "south":
		if (!line.water) {
			var waterPoints = [];
			for ( var j = 3; j < line.h - 3; j = j + 30) {
				var water = {
					x : 4,
					y : j
				};
				waterPoints.push(water);
			}
			line.water = waterPoints;
		}
		for ( var j in line.water) {
			c.beginPath();
			c.fillStyle = "#009ad6";
			lineX = parseInt(line.x) + parseInt(line.water[j].x);
			lineY = parseInt(line.y) + parseInt(line.water[j].y++);
			if (parseInt(line.water[j].y + 3) > line.h) {
				line.water[j].y = 3;
			}
			c.arc(lineX, lineY, 3, 0, Math.PI * 2, false);
			c.fill();
		}
		break;
	}
}

/**
 * 画图标
 */
var icon = null;
var degreesList = [];
var degrees = 30;
for ( var j = 0; j < degrees; j++) {
				degreesList.push(j);
			}
var times = 0;

function drawIcons() {
	for ( var i in icons) {
		icon = icons[i];
		var image = new Image();
		image.src = icon.src;
		//icon.id!=select?c.drawImage(image,icon.x,icon.y,icon.w,icon.h):c.drawImage(image,icon.x-3,icon.y-6,icon.h+6,icon.w+6);
		c.drawImage(image, icon.x, icon.y, icon.w, icon.h);
		if (icon.isOpen && icon.src == "js/icons/xhb.png") {
			draw(icon);
		} else if (icon.src == "js/icons/jbd.png"
				&& eval(initContext(icon.condition))) {
			drawLighting(icon);
		} else if (icon.src == "js/icons/waterbox.jpg") {
			if (showData.id != null) {
				var h = Math.floor(eval(initContext(icon.volume))* (icon.h - icon.h*0.25));
				var x = Math.floor(icon.x + icon.w * 0.08);
				var y = icon.y+ icon.h - 0.2 * icon.h -h;
				var w = Math.floor(icon.w*0.82); 
				c.save();
				var gradient = c.createLinearGradient( x, y , x , y+h);
				gradient.addColorStop(0, '#afdfe4');
				gradient.addColorStop(0.5, '#009ad6');
				gradient.addColorStop(1, '#2468a2');
				c.fillStyle = gradient;
				c.fillRect(x, y, w, h);
				c.restore();
			}
		}
	}
}
/**
 * 报警灯光效果
 * @param {Object} icon
 */
var s = 0;
function drawLighting(icon){
	c.save();
	c.globalAlpha = 0.7;
	c.beginPath();
	var grd=c.createRadialGradient((icon.x + icon.w / 2),Math.floor(icon.y + icon.h / 2-2),0,Math.floor(icon.x + icon.w / 2),Math.floor(icon.y + icon.h / 2-2),23);
	grd.addColorStop(0+s,"red");
	grd.addColorStop(1-s,"black");
	c.strokeStyle = grd;
	c.lineWidth = 12;
	c.arc(Math.floor(icon.x + icon.w / 2), Math.floor(icon.y + icon.h / 2 -2), 15,
			0, 2*Math.PI, false);
	c.stroke();
	c.restore();
	s = s>0.99?0:(s+0.01);
}
/**
 * 循环泵启动动效果
 * @param {Object} icon
 */
function draw(icon) {
	var  s, e;
	var d = 0;
	c.save();
	d = degreesList[times];
	c.strokeStyle = 'blue';
	c.lineWidth = 3;
	c.beginPath();
	s = Math.floor(360 / degrees * (d));
	e = Math.floor(360 / degrees * (d + 2));
	s1 = Math.floor(360 / degrees * (d+15));
	e1 = Math.floor(360 / degrees * (d+17));
	c.arc(Math.floor(icon.x + icon.w / 2)+1, Math.floor(icon.y + icon.h / 2-5), 10,
			(Math.PI / 180) * s, (Math.PI / 180) * e, false);
	

	c.stroke();
	c.beginPath();
	c.arc(Math.floor(icon.x + icon.w / 2)+1, Math.floor(icon.y + icon.h / 2-5), 10,
			(Math.PI / 180) * s1, (Math.PI / 180) * e1, false);
		c.stroke();
	c.restore();
	times++;
	if (times >= degrees) {
		times = 0;
	}
}

/**
 * 显示数据
 * @param {Object} type
 * @param {Object} icon
 */
var text = null;
var context = null;
function drawTexts() {
	c.save();
	for ( var i in texts) {
		text = texts[i];
		c.font = text.size+"px Arial, sans-serif";
		c.textAlign = "center";
		c.textBaseline = "middle";
		c.fillStyle = text.color;
		context = initContext(text.context);
		c.fillText(context, parseInt(text.x) + parseInt(text.w / 2),
				parseInt(text.y) + parseInt(text.h / 2));
	}
	c.restore();
}

/**
 * 解析文字内容
 */
var newS = "";
var key = "";
function initContext(s) {
	newS = "";
	if (s) {
		if (s.toString().indexOf("{") == -1) {
			newS = s;
		} else {
			newS += s.substring(0, s.indexOf("{"));
			key = s.substring(s.indexOf("{") + 1, s.indexOf("}"));
			newS += showData[key];
			newS += initContext(s.substr(s.indexOf("}") + 1, s.length - 1));
		}
	}
	return newS;
}
/**
 * 绘画
 */
function drawParticles() {
	c.fillStyle = "black";
	c.fillRect(0, 0, 1200, 600);
	drawLines();
	drawIcons();
	drawTexts();
	/**
	if(clickIconIndex!=null){
		changAlpha(icons[clickIconIndex]);
	}**/
	initState = true;
}

var isXInIcon, isYInIcon;
canvas.onmousemove = function(e) {
	for ( var i in icons) {
		icon = icons[i];
		isXInIcon = e.pageX > icon.x * width / 1200 + canvas.offsetLeft
				&& e.pageX < (icon.x * width / 1200 + canvas.offsetLeft + icon.w);
		isYInIcon = e.pageY > icon.y * height / 600 + canvas.offsetTop
				&& e.pageY < (icon.y * height / 600 + canvas.offsetTop + icon.h);
		if (isXInIcon && isYInIcon) {
			this.style.cursor = "pointer";
			select = icon.id;
			return;
		}
	}
	this.style.cursor = "default";
	select = null;
};
canvas.onclick = function() {
	if (select != null) {
		for ( var i in icons) {
			icon = icons[i];
			if (icon.id == select) {
				clickIconIndex = i;
				icon.isOpen = !icon.isOpen;
				var openLines = icon.lines.split(',');
				if (icon.isOpen) {
					for ( var i in openLines) {
						var lineId = openLines[i];
						for ( var j in lines) {
							var line = lines[j];
							if (line.id === parseInt(lineId)) {
								lines[j].isOpen += 1;
							}
						}

					}
				} else {
					for ( var i in openLines) {
						var lineId = openLines[i];
						for ( var j in lines) {
							var line = lines[j];
							if (line.id === parseInt(lineId)) {
								lines[j].isOpen -= 1;
							}
						}

					}
				}
			}
			icon.isOpen
					&& icon.win != ''
					&& window
							.open(
									icon.win,
									'',
									'height=400, width=800, top=100,left=100, toolbar=no, menubar=no, scrollbars=no,titlebar=no, resizable=no,location=no,status=no');
		}

	}
};

function changAlpha(icon) {
	if (times <= 60) {
		c.globalAlpha = 1 - times / 80;
		var image = new Image();
		image.src = icon.src;
		c.drawImage(image, icon.x - 2 - times / 2, icon.y - 4 - times / 2,
				icon.h + 4 + times, icon.w + 4 + times);
		image = null;
		c.globalAlpha = 1;
		times++;
	} else {
		times = 1;
		clickIconIndex = null;
	}
}

window.onresize = function() {
	width = document.body.clientWidth - 2 * canvas.offsetTop;
	height = document.body.clientHeight - 2 * canvas.offsetLeft;
	canvas.width = width;
	canvas.height = height;
	c.scale(width / 1200, height / 600);
};

