$(function() {
	var canvas = $id('canvas'); //画布
	canvas.width = 1200;
	canvas.height = 600;
	var c = canvas.getContext('2d'); //2D绘画
	var lineId =0,iconId = 0,textId = 0;
	var lines = [];
	var icons = [];
	var data = {
		temp : 30
	};
	var texts = [];
	$.get("getPicture",{
		stationName:'a'
	},function(data){
		lines = data[0].lines;
    	icons = data[0].icons;
    	texts = data[0].texts;
    	lineId = lines.length>0?lines[lines.length-1].id+1:0;
    	iconId = icons.length>0?icons[icons.length-1].id+1:0;
    	textId = texts.length>0?texts[texts.length-1].id+1:0;
	})
	var isPaint = false; //绘画状态
	var selectTool = "line"; //选择绘画工具 默认管线
	var hotKey = "";
	var selectIcon = ''; //选择的图标 默认空字符
	var selectId = 'line';
	var img = new Image(); //图片
	img.src = "js/icons/icon1.jpg"; //背景图

	$('.tool').click(function() {
		selectId = $(this).attr("id");
		select($(this).children().attr("name"), $(this).children().attr("src"))
	});
	
	
	$('#save').click(function() {
		save();
	});
	
	$('#delete').click(function() {
		if(confirm("确定删除全部么？"))
		{
        	lines = [];
        	icons = [];
        	texts = [];
		}
		
	});

	$('#canvas').mousedown(function(e) {
		beginDraw(e)
	});
	$('#canvas').mouseup(function(e) {
		overDraw(e)
	});
	$('#canvas').mouseout(function(e) {
		outDraw(e)
	});
	$('#addLine').click(function() {
		addLine();
		return false;
	});
	$('#deleteLine').click(function() {
		deleteLine();
		return false;
	});
	$('#addIcon').click(function() {
		addIcon();
		return false;
	});
	$('#deleteIcon').click(function() {
		deleteIcon();
		return false;
	});
	$('#addText').click(function() {
		addText();
		return false;
	});
	$('#deleteText').click(function() {
		deleteText();
		return false;
	});
	$('.tool').hover(function() {
		$(this).css( {
			'background-color' : '#f58220',
			'padding':'0px 5px 10px 5px',
			'filter' : 'alpha(Opacity=100)',
			'opacity' : 1
		});
	}, function() {
		//鼠标离开时移除divOver样式
			$(".tool[id!="+selectId+"]").css({
				'background-color' : '#CFDFEF',
				'filter' : 'alpha(Opacity=70)',
				'padding':'5px',
				'opacity' : 0.7
			});
		});
$("#line").css({
				'background-color' : '#f58220',
				'padding':'0px 5px 10px 5px',
				'filter' : 'alpha(Opacity=100)',
				'opacity' : 1
			});
	/**
	 * 绘画状态管线
	 */
	var drawLine = {
		w : 0,
		h : 0,
		x : 0,
		y : 0,
		draw : function() {
			c.fillStyle = "red";
			c.globalAlpha = 0.6;
			c.fillRect(this.x, this.y, this.w, this.h);
			c.globalAlpha = 1;
		}
	};
	/**
	 * 绘画状态图片
	 */
	var drawIcon = {
		w : 28,
		h : 28,
		x : 0,
		y : 0,
		src : '',
		draw : function() {
			if (this.src != '') {
				var img = new Image();
				img.src = this.src;
				c.globalAlpha = 0.6;
				c.drawImage(img, this.x, this.y, this.h, this.w);
				c.globalAlpha = 1;
			}
		}
	};
	/**
	 * 绘画状态下文字框
	 */
	var drawText = {
		w : 0,
		h : 0,
		x : 0,
		y : 0,
		draw : function() {
			c.strokeStyle = "white";
			c.lineWidth = "1";
			c.strokeRect(this.x, this.y, this.w, this.h);
			c.strokeStyle = "black";
		}
	};

	/**
	 * 获取动态对象
	 */
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame
				|| window.webkitRequestAnimationFrame
				|| window.mozRequestAnimationFrame || function(callback) {
					window.setTimeout(callback, 1000 / 20);
				};
	})();

	/**
	 * 绘画
	 */
	(function draw() {
		c.fillStyle="black"
		$("#showBackImg").is(":checked")?c.drawImage(img, 0, 0, canvas.width, canvas.height):c.fillRect(0, 0, canvas.width, canvas.height);
		drawLines();
		drawIcons();
		drawTexts();
		if (selectTool == 'icon') {
			drawIcon.draw();
		} else if (selectTool == 'line') {
			drawLine.draw();
		} else if (selectTool == 'text') {
			drawText.draw();
		}
		requestAnimFrame(draw);
	})();

	/**
	 * 画线
	 */
	function drawLines() {
		for ( var i in lines) {
			var line = lines[i];
			c.fillStyle = line.color;
			c.fillRect(line.x, line.y, line.w, line.h);
			c.strokeRect(line.x, line.y, line.w, line.h);
		}
	}

	/**
	 * 画图标
	 */
	function drawIcons() {
		for ( var i in icons) {
			var icon = icons[i];
			var image = new Image();
			image.src = icon.src;
			i != select ? c.drawImage(image, icon.x, icon.y,icon.w,icon.h)
					: c.drawImage(image, icon.x - 3, icon.y - 6, icon.w + 6,
							icon.h + 6);
		}
	}

	/**
	 * 
	 * @param {Object} type
	 * @param {Object} icon
	 */
	function drawTexts() {
		for ( var i in texts) {
			var text = texts[i];
			c.strokeStyle = "white";
			c.lineWidth = "1";
			c.strokeRect(text.x, text.y, text.w, text.h);
			c.strokeStyle = "black";
			c.font = text.size+"px Arial, sans-serif";
			c.textAlign = "center";
			c.textBaseline = "middle";
			c.fillStyle = text.color;
			var context = initContext(text.context);
			c.fillText(context, parseInt(text.x) + parseInt(text.w / 2),
					parseInt(text.y) + parseInt(text.h / 2));
		}
	}
	/**
	 * 选择工具
	 * @param {Object} type 工具种类
	 * @param {Object} icon 选择图标名
	 */
	function select(type, e) {
		selectTool = type;
		selectIcon = type=="icon" ? e: '';
		$('#lineForm').hide(300);
		$('#iconForm').hide(300);
		$('#textForm').hide(300);
		$(".tool[id!="+selectId+"]").css({
				'background-color' : '#CFDFEF',
				'filter' : 'alpha(Opacity=70)',
				'padding':5,
				'opacity' : 0.7
			});
		initDrawState();
	}
	
	function initDrawState(){
			if (selectTool == "line") {
				drawLine.x = 0;
				drawLine.y = 0;
				drawLine.h = 0;
				drawLine.w = 0;
			} else if (selectTool == "icon") {
				drawIcon.x = 0;
				drawIcon.y = 0;
				drawIcon.h = 28;
				drawIcon.w = 28;
				drawIcon.src = '';
			} else if (selectTool == "text") {
				drawText.x = 0;
				drawText.y = 0;
				drawText.h = 0;
				drawText.w = 0;
			}
	}
	/**
	 * 鼠标移动事件
	 * @param {Object} e
	 */
	canvas.onmousemove = function(e) {
		var canvasOffsetH = canvas.offsetTop;
		var canvasOffsetL = canvas.offsetLeft;
		mouseX = e.pageX - canvasOffsetL;
		mouseY = e.pageY - canvasOffsetH;
		if (isPaint) {
			if (selectTool == "line") {
				drawLine.w = mouseX - drawLine.x;
				drawLine.h = mouseY - drawLine.y;
				if(Math.abs(drawLine.w) > Math.abs(drawLine.h) ){
					drawLine.h=8;
				}else{
					drawLine.w=8;
				}
			} else if (selectTool == "icon") {
				drawIcon.x = mouseX;
				drawIcon.y = mouseY;
				
			} else if (selectTool == "text") {
				drawText.w = mouseX - drawText.x;
				drawText.h = mouseY - drawText.y;
			}
		}
	}
	/**
	 * 开始绘画鼠标左键按下事件
	 * @param {Object} e
	 */
	function beginDraw(e) {
		var mouseX = e.pageX - canvas.offsetLeft;
		var mouseY = e.pageY - canvas.offsetTop;
		if (selectTool == "select"||hotKey=="select") {
			$('#lineForm').hide();
			$('#iconForm').hide();
			$('#textForm').hide();
			clickLine(mouseX, mouseY) || clickIcon(mouseX, mouseY)
					|| clickText(mouseX, mouseY)
		} else {
			isPaint = true;
			if (selectTool == "line") {
				drawLine.x = mouseX;
				drawLine.y = mouseY;
			} else if (selectTool == "icon") {
				drawIcon.x = mouseX;
				drawIcon.y = mouseY;
				drawIcon.src = selectIcon;
			} else if (selectTool == "text") {
				drawText.x = mouseX;
				drawText.y = mouseY;
			}
		}

	}
	;

	/**
	 * 鼠标单击选取控件
	 * @param  mouseX
	 * @param  mouseY
	 * @return boolean
	 */
	function clickLine(mouseX, mouseY) {
		var isSelected = false;
		for ( var i in lines) {
			var line = lines[i];
			var isXInLine = line.x <= mouseX
					&& mouseX <= (parseInt(line.x) + parseInt(line.w));
			var isYInLine = line.y <= mouseY
					&& mouseY <= (parseInt(line.y) + parseInt(line.h));
			if (isXInLine && isYInLine) {
				$("#lineForm").css({top:mouseY + canvas.offsetTop ,left: mouseX + canvas.offsetLeft});
				$("#lineForm").show(300);
				$id("lineX").value = line.x;
				$id("lineY").value = line.y;
				$id("lineW").value = line.w;
				$id("lineH").value = line.h;
				$id("lineId").value = line.id;
				$id("lineColor").value = line.color;
				switch (line.flow) {
				case 'west':
					clickOptions(0, 0, "");
					break;
				case 'east':
					clickOptions(0, 1, "");
					break;
				case 'north':
					clickOptions(0, 2, "");
					break;
				default:
					clickOptions(0, 3, "");
				}
				isSelected = true;
				break;
			}
		}
		return isSelected;
	}
	/**
	 * 鼠标点击选中图标
	 * @param  mouseX
	 * @param  mouseY
	 * @return boolean
	 */
	function clickIcon(mouseX, mouseY) {
		var isSelected = false;
		for ( var i in icons) {
			var icon = icons[i];
			var isXInIcon = icon.x <= mouseX && mouseX <= icon.x + icon.w;
			var isYInIcon = icon.y <= mouseY && mouseY <= icon.y + icon.h;
			if (isXInIcon && isYInIcon) {
				//selectIcon = icon.src;
				$("#iconForm").css({top:mouseY + canvas.offsetTop ,left: mouseX + canvas.offsetLeft});
				$("#iconForm").show(300);
				$id("iconX").value = icon.x;
				$id("iconY").value = icon.y;
				$id("iconW").value = icon.w;
				$id("iconH").value = icon.h;
				$id("iconId").value = icon.id;
				$id("lines").value = icon.lines;
				$id("win").value = icon.win;
				if(icon.src=="js/icons/jbd.png"){
					$("#conditionTr").show();
					$id("condition").value = icon.condition;
					}else {
						$("#conditionTr").hide();
						}
				if(icon.src=="js/icons/waterbox.jpg"){
					$("#volumeTr").show();
					$id("volume").value = icon.volume;
					}else {
						$("#volumeTr").hide();
						}
				selectIcon = icon.src;
				isSelected = true;
				break;
			}
		}
		return isSelected;
	}

	/**
	 * 鼠标点击选中文字
	 * @param  mouseX
	 * @param  mouseY
	 * @return boolean
	 */
	function clickText(mouseX, mouseY) {
		var isSelected = false;
		for ( var i in texts) {
			var text = texts[i];
			var isXInText = text.x <= mouseX && mouseX <= text.x + text.w;
			var isYInText = text.y <= mouseY && mouseY <= text.y + text.h;
			if (isXInText && isYInText) {
				$("#textForm").css({top:mouseY + canvas.offsetTop ,left: mouseX + canvas.offsetLeft});
				$("#textForm").show(300);
				$id("textX").value = text.x;
				$id("textY").value = text.y;
				$id("textW").value = text.w;
				$id("textH").value = text.h;
				$id("textId").value = text.id;
				$id("context").value = text.context;
				$id("size").value = text.size;
				$id("textColor").value = text.color;
				isSelected = true;
				break;
			}
		}
		return isSelected;
	}

	/**
	 * 开始绘画鼠标左键抬起事件
	 * @param {Object} e
	 */
	function overDraw(e) {
		if (isPaint == true) {
			var mouseX = e.pageX - canvas.offsetLeft;
			var mouseY = e.pageY - canvas.offsetTop;
			isPaint = false;
			if (selectTool == "line") {
				$("#lineForm").css({top:e.pageY ,left: e.pageX});
				$("#lineForm").show(300);
				$id("lineX").value = drawLine.x;
				$id("lineY").value = drawLine.y;
				$id("lineW").value = drawLine.w;
				$id("lineH").value = drawLine.h;
				$id("lineId").value = lineId;
				$id("lineColor").value = "red";
			} else if (selectTool == "icon") {
				$("#iconForm").css({top:e.pageY+24 ,left: e.pageX+24});
				$("#iconForm").show(300);
				$id("iconX").value = drawIcon.x;
				$id("iconY").value = drawIcon.y;
				$id("iconW").value = drawIcon.w;
				$id("iconH").value = drawIcon.h;
				$id("iconId").value = iconId;
				$id("win").value = '';
				$id("lines").value = '';
				if(drawIcon.src=="js/icons/jbd.png"){
					$("#conditionTr").show();
					$id("condition").value = '';
					}else {
						$("#conditionTr").hide();
						}
				if(drawIcon.src=="js/icons/waterbox.jpg"){
					$("#volumeTr").show();
					$id("volume").value = '';
					}else {
						$("#volumeTr").hide();
						}
				
			} else if (selectTool == "text") {
				$("#textForm").css({top:e.pageY ,left: e.pageX});
				$("#textForm").show(300);
				$id("textX").value = drawText.x;
				$id("textY").value = drawText.y;
				$id("textW").value = drawText.w;
				$id("textH").value = drawText.h;
				$id("textColor").value = "red";
				$id("context").value = "";
				$id("size").value = "14";
				$id("textId").value = textId;
			}
		}
	}
	/**
	 * 鼠标移出绘画框
	 * @param {Object} e
	 */
	function outDraw(e) {
		var isDivDisplay = $('#lineForm').is(":visible")
				|| $('#iconForm').is(":visible")
				|| $('#textForm').is(":visible")
		isPaint = false;
		if (!isDivDisplay) {
			initDrawState();
		}
	}


	/**
	 * 添加线
	 */
	function addLine() {
		var id = parseInt($id("lineId").value);
		var lineX, lineY, lineW, lineH;
		if ($id("lineW").value < 0) {
			lineX = parseInt($id("lineX").value) + parseInt($id("lineW").value);
			lineW = -$id("lineW").value;
		} else {
			lineX = $id("lineX").value;
			lineW = $id("lineW").value;
		}
		if ($id("lineH").value < 0) {
			lineY = parseInt($id("lineY").value) + parseInt($id("lineH").value);
			lineH = -$id("lineH").value;
		} else {
			lineY = $id("lineY").value;
			lineH = $id("lineH").value;
		}
		var line = {
			id : id,
			x : parseInt(lineX),
			y : parseInt(lineY),
			h : parseInt(lineH),
			w : parseInt(lineW),
			color : $id("lineColor").value,
			flow : $id("flow").value,
			isOpen : 0
		}
		if (selectTool == "select") {
			for ( var i in lines) {
				if (lines[i].id == id) {
					lines[i] = line;
					break;
				}
			}
		} else {
			lines.push(line);
			lineId++;
			drawLine.x = 0;
			drawLine.y = 0;
			drawLine.h = 0;
			drawLine.w = 0;
		}
		$('#lineForm').hide(300);
	}
	/**
	 * 删除线
	 */
	function deleteLine() {
		var id = $id('lineId').value;
		if (selectTool != "select") {
			drawLine.x = 0;
			drawLine.y = 0;
			drawLine.h = 0;
			drawLine.w = 0;
		} else {
			for ( var i in lines) {
				if (lines[i].id == id) {
					lines.splice(i, 1);
					break;
				}
			}
		}
		$('#lineForm').hide(300);
	}
	/**
	 * 添加图标
	 */
	function addIcon() {
		var id = parseInt($id('iconId').value);
		var icon = {
			id : id,
			x : parseInt($id("iconX").value),
			y : parseInt($id("iconY").value),
			h : parseInt($id("iconH").value),
			w : parseInt($id("iconW").value),
			lines : $id("lines").value,
			win: $id("win").value,
			src : selectIcon,
			condition:$id("condition").value,
			volume:$id("volume").value,
			isOpen:false
		}
		if (selectTool == "select") {
			for ( var i in icons) {
				if (icons[i].id == id) {
					icons[i] = icon;
					break;
				}
			}
		} else {
			icons.push(icon);
			iconId++;
			drawIcon.x = 0;
			drawIcon.y = 0;
			drawIcon.h = 28;
			drawIcon.w = 28;
			drawIcon.src = '';
		}
		$('#iconForm').hide(300);
	}
	/**
	 * 删除图标
	 */
	function deleteIcon() {
		var id = $id('iconId').value;
		if (selectTool != "select") {
			drawIcon.x = 0;
			drawIcon.y = 0;
			drawIcon.h = 23;
			drawIcon.w = 23;
			drawIcon.src = '';
		} else {
			for ( var i in icons) {
				if (icons[i].id == id) {
					icons.splice(i, 1);
					break;
				}
			}
		}
		$('#iconForm').hide(300);
	}

	/**
	 * 添加文字
	 */
	function addText() {
		var id = parseInt($id('textId').value);
		var textX, textY, textW, textH;
		if ($id("textW").value < 0) {
			textX = parseInt($id("textX").value) + parseInt($id("textW").value);
			textW = -$id("textW").value;
		} else {
			textX = $id("textX").value;
			textW = $id("textW").value;
		}
		if ($id("textH").value < 0) {
			textY = parseInt($id("textY").value) + parseInt($id("textH").value);
			textH = -$id("textH").value;
		} else {
			textY = $id("textY").value;
			textH = $id("textH").value;
		}
		var size = $id("size").value;
		var text = {
			id : id,
			x : parseInt(textX),
			y : parseInt(textY),
			h : parseInt(textH),
			w : parseInt(textW),
			size : parseInt(size),
			color : $id("textColor").value,
			context : $id("context").value
		};
		if (selectTool == "select") {
			for ( var i in texts) {
				if (texts[i].id == id) {
					texts[i] = text;
					break;
				}
			}
		} else {
			texts.push(text);
			textId++;
			drawText.x = 0;
			drawText.y = 0;
			drawText.h = 0;
			drawText.w = 0;
		}
		$('#textForm').hide(300);}

	/**
	 * 删除文字
	 */
	function deleteText() {
		var id = $id('textId').value;
		if (selectTool != "select") {
			drawText.x = 0;
			drawText.y = 0;
			drawText.h = 0;
			drawText.w = 0;
		} else {
			for ( var i in texts) {
				if (texts[i].id == id) {
					texts.splice(i, 1);
					break;
				}
			}
		}
		$('#textForm').hide(300);
	}

	/**
	 * 解析文字内容
	 */
	function initContext(s) {
		var newS = "";
		if (s) {
			if (s.toString().indexOf("{") == -1) {
				newS = s;
			} else {
				newS += s.substring(0, s.indexOf("{"));
				var key = s.substring(s.indexOf("{") + 1, s.indexOf("}"))
				newS += data[key];
				newS += initContext(s.substr(s.indexOf("}") + 1, s.length - 1))
			}
		}
		return newS;
	}

	/**
	 * 显示温度
	 * @memberOf {TypeName} 
	 */
	function showTemp(temp) {
		var tempCanvas = $id("tempCanvas")
		var cx = tempCanvas.getContext("2d");
		var imag = new Image();
		imag.src = "js/icons/speed.jpg";
		cx.drawImage(imag, 0, 0, 300, 300);
		$id("tempDiv").style.display = "block";

	}

	/**
	 * ajax
	 */
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

	function save() {
		if (xmlhttp == null) {
			createXMLHttp()
		}
		xmlhttp.onreadystatechange = state_Change;
		var str = "lines=" + JSON.stringify(lines) + "&icons="
				+ JSON.stringify(icons) + "&texts=" + JSON.stringify(texts)
				+ "&stationName=a";
		xmlhttp.open("post", "savePicture.action", true);
		xmlhttp.setRequestHeader("Content-Type",
				"application/x-www-form-urlencoded");
		xmlhttp.send(str);

	}
	function state_Change() {
		if (xmlhttp.readyState == 4) {// 4 = "loaded"
			if (xmlhttp.status == 200) {// 200 = "OK"
				alert("ok");
			} else {
				alert("Problem retrieving data:" + xmlhttp.statusText);
			}
		}
	}

	/**
	 var text = {
	 w: 90,
	 h: 20,
	 x: 0,
	 y: 0,
	 draw: function() {
	 c.strokeStyle = "white";
	 c.lineWidth = "1";
	 c.strokeRect(this.x, this.y-20, this.w, this.h);
	 c.font = "12px Arial, sans-serif";
	 c.textAlign = "center";
	 c.textBaseline = "middle";
	 c.fillStyle = "red";
	 c.fillText("x:"+this.x+",this.y:"+(this.y-20), this.x+45, this.y-10);
	 }
	 };**/

})

/*#############################################################
 Name: Select to CSS
 Version: 0.2
 Author: Utom
 URL: http://utombox.com/
 * 选择下拉框样式文件
 #############################################################*/
var selects = document.getElementsByTagName('select');
var isIE = (document.all && window.ActiveXObject && !window.opera) ? true
		: false;
function $id(id) {
	return document.getElementById(id);
}
function stopBubbling(ev) {
	ev.stopPropagation();
}
function rSelects() {
	for (i = 0; i < selects.length; i++) {
		selects[i].style.display = 'none';
		select_tag = document.createElement('div');
		select_tag.id = 'select_' + selects[i].name;
		select_tag.className = 'select_box';
		selects[i].parentNode.insertBefore(select_tag, selects[i]);
		select_info = document.createElement('div');
		select_info.id = 'select_info_' + selects[i].name;
		select_info.className = 'tag_select';
		select_info.style.cursor = 'pointer';
		select_tag.appendChild(select_info);
		select_ul = document.createElement('ul');
		select_ul.id = 'options_' + selects[i].name;
		select_ul.className = 'tag_options';
		select_ul.style.position = 'absolute';
		select_ul.style.display = 'none';
		select_ul.style.zIndex = '999';
		select_tag.appendChild(select_ul);
		rOptions(i, selects[i].name);
		mouseSelects(selects[i].name);
		if (isIE) {
			selects[i].onclick = new Function("clickLabels3('"
					+ selects[i].name + "');window.event.cancelBubble = true;");
		} else if (!isIE) {
			selects[i].onclick = new Function("clickLabels3('"
					+ selects[i].name + "')");
			selects[i].addEventListener("click", stopBubbling, false);
		}
	}
}
function rOptions(i, name) {
	var s = [ 'a', 'b', 'c' ];
	s.splice(1, 1);
	s
	var options = selects[i].getElementsByTagName('option');
	var options_ul = 'options_' + name;
	for (n = 0; n < selects[i].options.length; n++) {
		option_li = document.createElement('li');
		option_li.style.cursor = 'pointer';
		option_li.className = 'open';
		$id(options_ul).appendChild(option_li);
		option_text = document.createTextNode(selects[i].options[n].text);
		option_li.appendChild(option_text);
		option_selected = selects[i].options[n].selected;
		if (option_selected) {
			option_li.className = 'open_selected';
			option_li.id = 'selected_' + name;
			$id('select_info_' + name).appendChild(
					document.createTextNode(option_li.innerHTML));
		}
		option_li.onmouseover = function() {
			this.className = 'open_hover';
		}
		option_li.onmouseout = function() {
			if (this.id == 'selected_' + name) {
				this.className = 'open_selected';
			} else {
				this.className = 'open';
			}
		}
		option_li.onclick = new Function("clickOptions(" + i + "," + n + ",'"
				+ selects[i].name + "')");
	}
}
function mouseSelects(name) {
	var sincn = 'select_info_' + name;
	$id(sincn).onmouseover = function() {
		if (this.className == 'tag_select')
			this.className = 'tag_select_hover';
	}
	$id(sincn).onmouseout = function() {
		if (this.className == 'tag_select_hover')
			this.className = 'tag_select';
	}
	if (isIE) {
		$id(sincn).onclick = new Function("clickSelects('" + name
				+ "');window.event.cancelBubble = true;");
	} else if (!isIE) {
		$id(sincn).onclick = new Function("clickSelects('" + name + "');");
		$id('select_info_' + name).addEventListener("click", stopBubbling,
				false);
	}
}
function clickSelects(name) {
	var sincn = 'select_info_' + name;
	var sinul = 'options_' + name;
	for (i = 0; i < selects.length; i++) {
		if (selects[i].name == name) {
			if ($id(sincn).className == 'tag_select_hover') {
				$id(sincn).className = 'tag_select_open';
				$id(sinul).style.display = '';
			} else if ($id(sincn).className == 'tag_select_open') {
				$id(sincn).className = 'tag_select_hover';
				$id(sinul).style.display = 'none';
			}

		} else {
			$id('select_info_' + selects[i].name).className = 'tag_select';
			$id('options_' + selects[i].name).style.display = 'none';
		}
	}
}
function clickOptions(i, n, name) {
	var li = $id('options_' + name).getElementsByTagName('li');
	$id('selected_' + name).className = 'open';
	$id('selected_' + name).id = '';
	li[n].id = 'selected_' + name;
	li[n].className = 'open_hover';
	$id('select_' + name).removeChild($id('select_info_' + name));
	select_info = document.createElement('div');
	select_info.id = 'select_info_' + name;
	select_info.className = 'tag_select';
	select_info.style.cursor = 'pointer';
	$id('options_' + name).parentNode.insertBefore(select_info,
			$id('options_' + name));
	mouseSelects(name);
	$id('select_info_' + name).appendChild(
			document.createTextNode(li[n].innerHTML));
	$id('options_' + name).style.display = 'none';
	$id('select_info_' + name).className = 'tag_select';
	selects[i].options[n].selected = 'selected';
}
window.onload = function(e) {
	bodyclick = document.getElementsByTagName('body').item(0);
	rSelects();
	bodyclick.onclick = function() {
		for (i = 0; i < selects.length; i++) {
			$id('select_info_' + selects[i].name).className = 'tag_select';
			$id('options_' + selects[i].name).style.display = 'none';
		}
	}
}
