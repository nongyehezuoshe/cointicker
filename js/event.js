(async ()=>{
	var port;
	var coin={
		timer:null,
		beattimer:null,
		config:null,
		dom:null,
		boxmoveenable:false,
		init:async (config)=>{
			coin.config=config;
			coin.connect();

			// add event handle
			const events = ["wheel", "click", "keydown", "mouseup", "mousedown", "mousemove", "resize"];
			events.forEach(eventType => {
				window.addEventListener(eventType, coin.handleEvent, false);
			});

			// init expand
			const { expand = true } = await chrome.storage.local.get("expand");
			coin.expandStatus = expand;

			if(coin.config.tabauto){
				coin.initUI();
			}
		},
		handleEvent:e=>{
			switch(e.type){
				case"wheel":
				case"keydown":
					port.disconnect()
					coin.connect();
					break;
				case"click":
					if(e.target.id&&e.target.id=="btn-close"){
						coin.close(e);
					}else if(e.target.id&&e.target.id=="btn-expand"){
						coin.expand();
					}
					break;
				case"mousedown":
					if(e.button==0&&(e.target.classList.contains("cointicker")&&e.target.nodeName.toLowerCase()=="cointicker")){
						var boxposX=e.target.offsetLeft,
							boxposY=e.target.offsetTop;
						coin.boxmoveenable=true;
						coin.boxmoveposX=e.clientX-boxposX;
						coin.boxmoveposY=e.clientY-boxposY;
						e.target.style.cssText+="cursor:move;";
					}
					break;
				case"mousemove":
					if(coin.boxmoveenable&&(e.target.classList.contains("cointicker")&&e.target.nodeName.toLowerCase()=="cointicker")){
						coin.boxMove(e);
					}
					break;
				case"mouseup":
					coin.boxmoveenable=false;
					if(e.button==0&&(e.target.classList.contains("cointicker")&&e.target.nodeName.toLowerCase()=="cointicker")){
						e.target.style.cssText+="cursor:auto;";
					}
					break;
				case"resize":
					coin.posReset();
					break;
			}
		},
		UI:{
			domCreate:(type,classid,css,text,dataset)=>{
				var _dom=document.createElement(type);
				classid&&classid.class?_dom.className=classid.class:null;
				classid&&classid.id?_dom.id=classid.id:null;
				css?_dom.style.cssText+=css:null;
				text?_dom.innerText=text:null;
				dataset?_dom.dataset[dataset[0]]=dataset[1]:null;
				return _dom;
			}
		},
		getRandomColor:()=>{
			return `#${Math.random().toString(16).substr(2, 6)}`;
		},
		i18n:msg=>{
			return chrome.i18n.getMessage(msg)||msg;
		},
		initUI:async ()=>{
			// console.log("initui")
			var _wrap=coin.UI.domCreate("cointicker",{class:"cointicker"},"background-color:"+_conf+";");
			var _main=coin.UI.domCreate("main");
			var _btn=coin.UI.domCreate("div",{id:"btn-close"},null,"x");
			var _expand=coin.UI.domCreate("div",{id:"btn-expand"},"background: url("+chrome.runtime.getURL("img/expand.png")+") no-repeat center #00000080; background-size:contain;");
			_main.appendChild(_expand);

			var _flag=false;

			var _wrap_name=coin.UI.domCreate("div",{class:"coin-list coin-wrap-name"});
			var _wrap_price=coin.UI.domCreate("div",{class:"coin-list coin-wrap-price"});
			var _wrap_HLPrice=coin.UI.domCreate("div",{class:"coin-list coin-wrap-hlprice"});
			var _wrap_volume=coin.UI.domCreate("div",{class:"coin-list coin-wrap-volume"});
			_main.appendChild(_wrap_name);
			_main.appendChild(_wrap_price);
			_main.appendChild(_wrap_HLPrice);
			_main.appendChild(_wrap_volume);

			for(var i in coin.config[coin.config.apiserve]){
				for(var ii in coin.config[coin.config.apiserve][i]){
					var _name=coin.config[coin.config.apiserve][i][ii].name,
						_conf=coin.config[coin.config.apiserve][i][ii];
					if(!_conf.tab.intab){continue;}
					var _domname=coin.UI.domCreate("div",{class:"coin-name"},"background-color:"+_conf.tab.namebgcolor+";color:"+_conf.tab.namecolor+";",_name);
					var _domprice=coin.UI.domCreate("div",{class:"coin-price"},"background-color:"+_conf.tab.pricebgcolor+";color:"+_conf.tab.pricecolor,"waiting...",["code",_name]);
						_domprice.dataset.type=i

					// 24h high/low price
					console.log(_conf.tab.hlpricebgcolor)
					var _domHLPrice=coin.UI.domCreate("div",null,"background-color:"+(_conf.tab.hlpricebgcolor||coin.getRandomColor())+";color:"+(_conf.tab.hlpricecolor||"#ffffff")+";"),
						_domHLPrice_L=coin.UI.domCreate("div",{class:"coin-hlprice-l"}),
						_domHLPrice_R=coin.UI.domCreate("div",{class:"coin-hlprice-r"},null,null,["code",_name]);
						_domHLPrice_R.dataset.type=i
					_domHLPrice_L.appendChild(coin.UI.domCreate("div",{class:"coin-hlprice-title"},null,`${coin.i18n("hlprice_h")} :`));
					_domHLPrice_L.appendChild(coin.UI.domCreate("div",{class:"coin-hlprice-title"},null,`${coin.i18n("hlprice_l")} :`));
					_domHLPrice_R.appendChild(coin.UI.domCreate("div",{class:"coin-hlprice-value"},null,""));
					_domHLPrice_R.appendChild(coin.UI.domCreate("div",{class:"coin-hlprice-value"},null,""));
					_domHLPrice.appendChild(_domHLPrice_L);
					_domHLPrice.appendChild(_domHLPrice_R);

					// 24h volume
					var _domVolume=coin.UI.domCreate("div",null,"background-color:"+(_conf.tab.volumebgcolor||coin.getRandomColor())+";color:"+(_conf.tab.volumecolor||"#ffffff")),
						_domVolume_L=coin.UI.domCreate("div",{class:"coin-volume-l"}),
						_domVolume_R=coin.UI.domCreate("div",{class:"coin-volume-r"},null,null,["code",_name]);
						_domVolume_R.dataset.type=i
					_domVolume_L.appendChild(coin.UI.domCreate("div",{class:"coin-volume-title"},null,`${coin.i18n("volume_vol")} :`));
					_domVolume_L.appendChild(coin.UI.domCreate("div",{class:"coin-volume-title"},null,`${coin.i18n("volume_ccy")} :`));
					_domVolume_R.appendChild(coin.UI.domCreate("div",{class:"coin-volume-value"},null,""));
					_domVolume_R.appendChild(coin.UI.domCreate("div",{class:"coin-volume-value"},null,""));
					_domVolume.appendChild(_domVolume_L);
					_domVolume.appendChild(_domVolume_R);

					_wrap_name.appendChild(_domname);
					_wrap_price.appendChild(_domprice);
					_wrap_HLPrice.appendChild(_domHLPrice);
					_wrap_volume.appendChild(_domVolume);
					_flag=true;
				}
			}

			_main.appendChild(_btn)
			_wrap.appendChild(_main);

			if(coin.config.tabheartbeat){
				var _reading=coin.UI.domCreate("reading",null,"	width: 4px;height: 4px;margin: 0 auto;display: block;background-color: #ff0000;border-radius: 100%;position: absolute;left: 4px;bottom: 6px;opacity:0.3;");
				_wrap.appendChild(_reading);
			}

			_flag?document.body.appendChild(_wrap):null;
			coin.dom=_wrap;

			_wrap.style.cssText+=
				"background-color:"+coin.config.tabbgcolor
				+";opacity:0"
				+";border-color:"+coin.config.tabbordercolor
				+";box-shadow:"+coin.config.tabboxshadowcolor
				+" "+coin.config.tabboxshadowx+"px"
				+" "+coin.config.tabboxshadowy+"px"
				+" "+coin.config.tabboxshadowblur+"px"
				+" "+coin.config.tabboxshadowspread+"px;";

			coin.expand(true);
			window.setTimeout(()=>{
				_wrap.style.cssText+="opacity:"+coin.config.tabopacity;
			},100)

			switch(coin.config.tabpos){
				case"pos_lefttop":
					_wrap.style.cssText+="left:12px;top:12px;";
					break;
				case"pos_righttop":
					_wrap.style.cssText+="right:12px;top:12px;";
					break;
				case"pos_leftbottom":
					_wrap.style.cssText+="left:12px;top:"+(window.innerHeight-12-_wrap.offsetHeight)+"px;";
					break;
				case"pos_rightbottom":
					_wrap.style.cssText+="right:12px;top:"+(window.innerHeight-12-_wrap.offsetHeight)+"px;";
					break;
			}
		},
		posReset:()=>{
			if (!coin.dom) return;
			switch(coin.config.tabpos){
				case"pos_lefttop":
					coin.dom.style.cssText+="left:12px;top:12px;";
					break;
				case"pos_righttop":
					coin.dom.style.cssText+="left:"+(window.innerWidth-24-coin.dom.offsetWidth)+"px;top:12px;";
					break;
				case"pos_leftbottom":
					coin.dom.style.cssText+="left:12px;top:"+(window.innerHeight-12-coin.dom.offsetHeight)+"px;";
					break;
				case"pos_rightbottom":
					coin.dom.style.cssText+="left:"+(window.innerWidth-24-coin.dom.offsetWidth)+"px;top:"+(window.innerHeight-12-coin.dom.offsetHeight)+"px;";
					break;
			}
		},
		boxMove:e=>{
			const dom = e.target;
			if (!dom) return false;
			dom.style.cssText += `transition:none;
				left:${e.clientX - coin.boxmoveposX}px;
				top:${e.clientY - coin.boxmoveposY}px;
				z-index:${parseInt(new Date().getTime() / 1000)};`;
		},
		expand:async init=>{
			const expandBtn = coin.dom.querySelector("#btn-expand");
			const hlPrice = expandBtn.parentNode.querySelector(".coin-wrap-hlprice");
			const volume = expandBtn.parentNode.querySelector(".coin-wrap-volume");
			const names = coin.dom.querySelectorAll(".coin-wrap-name>div");
			const prices = coin.dom.querySelectorAll(".coin-wrap-price>div");

			coin.expandStatus = init ? coin.expandStatus : !coin.expandStatus;
			expandBtn.classList.toggle("clicked");
			await chrome.storage.local.set({"expand":coin.expandStatus});

			hlPrice.style.display = coin.expandStatus ? "block" : "none";
			volume.style.display = coin.expandStatus ? "block" : "none";
			names.forEach(name => name.style.height = `${coin.expandStatus ? 40 : 20}px`);
			prices.forEach(price => price.style.height = `${coin.expandStatus ? 40 : 20}px`);

			const [width, height] = coin.getDomSize();
			coin.dom.style.width = `${width + 11}px`;
			expandBtn.style.cssText += `height: ${Math.max(height / 2, 32)}px; top: ${(height / 2) + 16}px;`;
		},
		getDomSize:()=>{
			const coinLists = coin.dom.querySelectorAll("main>div.coin-list");
			let width = 0;
			let height = Number(window.getComputedStyle(coinLists[0]).getPropertyValue("height").slice(0, -2));

			coinLists.forEach((list) => {
				if (list.style.display !== "none") {
					width += Number(window.getComputedStyle(list).getPropertyValue("width").slice(0, -2));
				}
			});

			width = Math.ceil(Math.round(width));
			height = Math.ceil(Math.round(height));

			return [width, height];
		},
		showData:(data)=>{
			// console.log(data);
			function formatVolume(volume) {
				var suffix = "";
				var lang=chrome.i18n.getUILanguage().replace("-","_");
				if (lang=="zh_CN"){
					if (volume > 100000000) {
						volume = (volume / 100000000).toFixed(2);
						suffix = "亿";
					} else if (volume > 10000) {
						volume = (volume / 10000).toFixed(2);
						suffix = "万";
					}else{
						volume = Number(volume).toFixed(2);
					}
				}else{
					if (volume > 1000000000) {
						volume = (volume / 1000000000).toFixed(2);
						suffix = "B";
					} else if (volume > 1000000) {
						volume = (volume / 1000000).toFixed(2);
						suffix = "M";
					} else if (volume > 1000) {
						volume = (volume / 1000).toFixed(2);
						suffix = "K";
					}else{
						volume = Number(volume).toFixed(2);
					}
				}

				return volume + suffix || "Err";
			}
			function formatDecimalPlaces(str) {
				if (!str) return;
				const match = str.match(/\.(\d+)/);
				if (!match) return str + '.00';
				const numSpaces = 2 - match[1].length;
				return numSpaces > 0 ? str + '0'.repeat(numSpaces) : str;
			}

			for(var i in data){
				var _dom=coin.dom.querySelector(".coin-price[data-code="+i+"][data-type="+data[i].instType+"]");
				(_dom || {}).innerText = formatDecimalPlaces(data[i].last) || "Err";

				var _dom_hlprice=coin.dom.querySelector(".coin-hlprice-r[data-code="+i+"][data-type="+data[i].instType+"]")?.querySelectorAll(".coin-hlprice-value");
				(_dom_hlprice?.[0] || {}).innerText = data[i].high24h || "Err";
				(_dom_hlprice?.[1] || {}).innerText = data[i].low24h || "Err";

				var _dom_volume=coin.dom.querySelector(".coin-volume-r[data-code="+i+"][data-type="+data[i].instType+"]")?.querySelectorAll(".coin-volume-value");
				(_dom_volume?.[0] || {}).innerText =formatVolume(data[i].vol24h);
				(_dom_volume?.[1] || {}).innerText =formatVolume(data[i].volCcy24h);
			}
			if(coin.config.tabheartbeat){
				var _reading=coin.dom.querySelector("reading");
				var _color=["rgb(255, 0, 0)","rgb(0, 255, 0)","rgb(0, 0, 255)"]
				// console.log(_reading)
				for(var i=0;i<_color.length;i++){
					if(getComputedStyle(_reading)["background-color"]==_color[i]){
						_reading.style.cssText+="background-color:"+(i==2?_color[0]:_color[i+1])
						break;
					}
				}
			}

			var domSize=coin.getDomSize();
			coin.dom.style.cssText+="width:"+(domSize[0]+10+1)+"px;";
			// var _height=Math.min(domSize[1],200)/2;
			var _height=(domSize[1])/2;
			_height=_height<32?32:_height;
			coin.dom.querySelector("#btn-expand").style.cssText+="height:"+_height+"px;top:"+((domSize[1]-_height)/2+16)+"px;";
		},
		close:e=>{
			const getCoinTicker = (ele) => {
				return (ele.tagName.toLowerCase() === "cointicker" && ele.classList.contains("cointicker")) ? ele : getCoinTicker(ele.parentNode);
			};

			getCoinTicker(e.target).remove();
			coin.dom = null;

			if (coin.timer) {
				window.clearInterval(coin.timer);
			}
		},
		connect:()=>{
			port = chrome.runtime.connect({name: "knockknock"});
			port.postMessage({type:"heartbeat"});
			if(coin.config.tabauto){
				// console.log("d")
				port.postMessage({type:"currentData"});
			}
			port.onMessage.addListener(function(msg) {
				// console.log(msg)
				if(msg.type&&msg.type=="showintab"){
					coin.dom?null:coin.initUI();
					port.postMessage({type:"currentData"});
				}
				if(msg.type&&msg.type=="currentData"){
					// console.log(msg)
					coin.showData(msg.data);
					if(coin.timer){window.clearInterval(coin.timer);}
					coin.timer=window.setInterval(()=>{
						port.postMessage({type:"currentData"});
					},coin.config.tabinterval||500)
				}else{
					// console.log(msg);
					if(coin.beattimer){window.clearInterval(coin.beattimer);}
					coin.beattimer=window.setInterval(()=>{
						port.postMessage({type: "heartbeat"});
					},8000)
				}
			});
			port.onDisconnect.addListener(()=>{
				coin.connect();
			});
		}
	};
	coin.init(await chrome.storage.sync.get());
})();