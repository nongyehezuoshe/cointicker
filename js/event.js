(async ()=>{
	var port;
	var coin={
		timer:null,
		beattimer:null,
		config:null,
		dom:null,
		boxmoveenable:false,
		init:(config)=>{
			console.log(config)

			coin.config=config;
			coin.connect();
			window.addEventListener("wheel",coin.handleEvent,false);
			window.addEventListener("click",coin.handleEvent,false);
			window.addEventListener("keydown",coin.handleEvent,false);
			window.addEventListener("mouseup",coin.handleEvent,false);
			window.addEventListener("mousedown",coin.handleEvent,false);
			window.addEventListener("mousemove",coin.handleEvent,false);
			window.addEventListener("resize",coin.handleEvent,false);
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
					}
					break;
				case"mousedown":
					console.log("mousedown")
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
		initUI:()=>{
			console.log("initui")
			var _wrap=coin.UI.domCreate("cointicker",{class:"cointicker"},"background-color:"+_conf+";");
			var _main=coin.UI.domCreate("main");
			var _btn=coin.UI.domCreate("div",{id:"btn-close"},null,"x");

			var _flag=false;
			for(var i in coin.config[coin.config.apiserve]){
				for(var ii in coin.config[coin.config.apiserve][i]){
					var _name=coin.config[coin.config.apiserve][i][ii].name,
						_conf=coin.config[coin.config.apiserve][i][ii];
					if(!_conf.tab.intab){continue;}
					var _domwrap=coin.UI.domCreate("div",{class:"coin-list"},null,null,["code",_name]);
					var _domname=coin.UI.domCreate("div",{class:"coin-name"},"background-color:"+_conf.tab.namebgcolor+";color:"+_conf.tab.namecolor+";",_name);
					var _domprice=coin.UI.domCreate("div",{class:"coin-price"},"background-color:"+_conf.tab.pricebgcolor+";color:"+_conf.tab.pricecolor,"waiting...");

					_domwrap.appendChild(_domname);
					_domwrap.appendChild(_domprice);
					_domwrap.appendChild(coin.UI.domCreate("div",null,"clear:both;"));
					_main.appendChild(_domwrap);
					_flag=true;
				}
			}

			_main.appendChild(_btn)
			_wrap.appendChild(_main);
			_flag?document.body.appendChild(_wrap):null;
			coin.dom=_wrap;

			_wrap.style.cssText+=
				"background-color:"+coin.config.tabbgcolor
				+";opacity:"+coin.config.tabopacity
				+";border-color:"+coin.config.tabbordercolor
				+";box-shadow:"+coin.config.tabboxshadowcolor
				+" "+coin.config.tabboxshadowx+"px"
				+" "+coin.config.tabboxshadowy+"px"
				+" "+coin.config.tabboxshadowblur+"px"
				+" "+coin.config.tabboxshadowspread+"px;";

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
			var dom=e.target;
			var mytime=new Date();
				mytime=mytime.getTime();
			if(!dom){return false;}
			dom.style.cssText+="transition:none;"+
				"left:"+(e.clientX-coin.boxmoveposX)+"px;"+
				"top:"+(e.clientY-coin.boxmoveposY)+"px;"+
				// "cursor:pointer;"+
				"z-index:"+parseInt((mytime)/1000);
		},
		showData:(data)=>{
			// console.log(data);
			var _dom=coin.dom.querySelector("[data-code="+data.data[0].instId+"] >.coin-price");
			_dom.innerText=data.data[0].last;
		},
		close:e=>{
			if(coin.timer){window.clearInterval(coin.timer);}
			var getDom=function(ele){
				if(ele.tagName.toLowerCase()=="cointicker"&&ele.classList.contains("cointicker")){
					return ele;
				}else{
					return arguments.callee(ele.parentNode);
				}
			}
			getDom(e.target).remove();
			coin.dom=null;
			if(coin.timer){window.clearInterval(coin.timer);}
		},
		connect:()=>{
			port = chrome.runtime.connect({name: "knockknock"});
			port.postMessage({type:"heartbeat"});
			if(coin.config.tabauto){
				console.log("d")
				port.postMessage({type:"currentData"});
			}
			port.onMessage.addListener(function(msg) {
				console.log(msg)
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
					},200)
				}else{
					console.log(msg)
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