let defaultConf={
	ver:2,
	apiserve:"okx",
	iconauto:true,
	tabauto:true,
	tabpos:"pos_righttop",
	tabbgcolor:"#eeeeee",
	tabopacity:"0.6",
	tabbordercolor:"#eeeeee",
	tabboxshadowcolor:"#656565",
	tabboxshadowx:0,
	tabboxshadowy:0,
	tabboxshadowblur:8,
	tabboxshadowspread:1,
	tabheartbeat:true,
	tabinterval:500,
	okx:{
		SPOT:[
			{
				name:"XCH-USDT",
				badge:{
					badgebgcolor:"#00ff00",
					tpicon:true,
					iconcolor:"#ffffff",
					iconbgcolor:"#ff0000",
					inicon:true
				},
				tab:{
					intab:true,
					namecolor:"#00ff00",
					namebgcolor:"#000000",
					pricecolor:"#000000",
					pricebgcolor:"#00ff00",
					hlpricecolor:"#ffffff",
					hlpricebgcolor:"#d55958",
					volumecolor:"#ffffff",
					volumebgcolor:"#8a0500"
				}
			},
			{
				name:"ETH-USDT",
				badge:{
					badgebgcolor:"#6400fa",
					tpicon:true,
					iconcolor:"#ffffff",
					iconbgcolor:"#0055ff",
					inicon:false
				},
				tab:{
					intab:true,
					namecolor:"#ffffff",
					namebgcolor:"#6400fa",
					pricecolor:"#ffffff",
					pricebgcolor:"#0055ff",
					hlpricecolor:"#ffffff",
					hlpricebgcolor:"#20ac6d",
					volumecolor:"#ffffff",
					volumebgcolor:"#74119a"
				}
			},
			{
				name:"BTC-USDT",
				badge:{
					badgebgcolor:"#ef8e19",
					tpicon:true,
					iconcolor:"#ffffff",
					iconbgcolor:"#0055ff",
					inicon:false
				},
				tab:{
					intab:true,
					namecolor:"#8b008b",
					namebgcolor:"#ef8e19",
					pricecolor:"#ffffff",
					pricebgcolor:"#8b5a2b",
					hlpricecolor:"#ffffff",
					hlpricebgcolor:"#8b008b",
					volumecolor:"#ffffff",
					volumebgcolor:"#006400"
				}
			}
		]
	}
}
let coin={
	config:null,
	wss:null,
	currentData:{},
	port:null,
	socketReopen:()=>{
		coin.wss.close();
		// coin.socketOpen();
	},
	socketOpen:async ()=>{
		// await coin.getTradingpair(coin.config.apiserve);
		let deamon;
		coin.wss=new WebSocket("wss://ws.okx.com:8443/ws/v5/public");
		coin.wss.addEventListener('open', function (event) {
			var _obj=coin.config[coin.config.apiserve];
			var _text="";
			for (var i in _obj){
				var _type=i;
				console.log(_type);
				for( var ii in _obj[i]){
					var _name=_obj[i][ii].name;
					var _text=(_text?_text+',':'')+
						'{"channel": "tickers",'+
						'"instType": "'+_type+'",'+
						'"instId": "'+_name+'"}';
				}
			}
			coin.wss.send('{"op": "subscribe","args": ['+_text+']}');
			// coin.wss.send('{"op": "subscribe","args": [{"channel": "instruments","instType": "SWAP"}]}');
		});
		coin.wss.addEventListener('message',async function (e) {
			// console.log(e);
			if(e.data=="pong"){
				return;
			}
			var _data=JSON.parse(e.data);
			if(_data.event&&_data.event=="subscribe"){return;}
			_data=_data.data[0];

			var _conf;
			var _obj=coin.config[coin.config.apiserve][_data.instType];
			for(var i in _obj){
				if(_obj[i].name==_data.instId){
					_conf=_obj[i];
					break;
				}
			}

			// console.log(_data)
			
			if(_conf?.tab?.intab){
			// if(_conf.tab.intab){
				// if(!coin.currentData[_data.instId]){coin.currentData[_data.instId]=""}
				coin.currentData[_data.instId]="";
				coin.currentData[_data.instId]=_data;
			}

			// if(!coin.config.iconauto||!_conf.badge.inicon){return;}
			if(!coin.config.iconauto||(!_conf?.badge?.inicon)){return;}

			chrome.action.setBadgeBackgroundColor({color:_conf.badge.badgebgcolor.toUpperCase()});
			var _text=""
			if(_data.last.indexOf(".")!=-1){
				if(_data.last.indexOf(".")==4){
					chrome.action.setBadgeText({text:_data.last.substr(0,4)});
					_text=_data.last.substr(5);
				}else{
					if(_data.last.indexOf(".")<4){
						chrome.action.setBadgeText({text:_data.last.substr(0,5)});
						_text=_data.last.substr(5);
					}else{
						chrome.action.setBadgeText({text:_data.last.substr(0,4)});
						_text=_data.last.substr(4);
					}
				}
			}else{
				_text=_data.last.substr(4);
			}

			if(_conf.badge.tpicon){
				if(_text.length==0){
					coin.setIcon(_data.instId.substr(0,_data.instId.indexOf("-")),_conf);
				}else{
					coin.setIcon(_text,_conf);
				}
			}else{
				if(_text.length==0){
					chrome.action.setIcon({path:"./icons/icon.png"});
				}else{
					coin.setIcon(_text,_conf);
				}
			}
		});
		coin.wss.addEventListener('error',e=>{
			console.log(e);
			chrome.action.setBadgeText({text:"Err"});
			// if(_conf.tab.intab){
				for(var i in coin.currentData){
					coin.currentData[i]="";
				}
			// }
			// coin.socketOpen();
		});
		coin.wss.addEventListener('close',e=>{
			console.log("close")
			coin.socketOpen();
		});
	},
	setIcon:(text,conf)=>{
		// console.log(text)
		var c=new OffscreenCanvas(32,32)
		var ctx=c.getContext("2d");
			
		ctx.fillStyle = conf.badge.iconbgcolor.toUpperCase(); /*"rgb(200,0,0)";*/
		ctx.fillRect(0, 0, 32, 32);
			
		ctx.fillStyle= conf.badge.iconcolor.toUpperCase(); /*"white";*/
		ctx.textAlign="center";
		ctx.font="bold 14px Arial";
		ctx.fillText(text,16,14);

		chrome.action.setIcon({imageData:ctx.getImageData(0, 0, 32, 32)})
	},
	confSave:async (conf)=>{
		await chrome.storage.sync.clear();
		await chrome.storage.sync.set(conf);
		coin.config=conf;
		coin.socketReopen();
	},
	confReset:async ()=>{
		await chrome.storage.sync.clear();
		await chrome.storage.sync.set(defaultConf);
		await coin.confLoad();
		coin.socketReopen();
	},
	confLoad:async ()=>{
		coin.config=await chrome.storage.sync.get();
		console.log(coin.config)
		if((!coin.config.ver)||(coin.config.ver<2)){
			console.log("ffff");
			await chrome.storage.sync.set(defaultConf);
			coin.config=defaultConf;
		}
	},
	getTradingpair:async (type)=>{
		var _conf=await chrome.storage.local.get();
			_conf[type]={};
		switch(type){
			case"okx":
				_option_flag=0;
				_option_array=["BTC-USD","ETH-USD"];
				var get_instrument=async type=>{
					var _url="https://www.okx.com/api/v5/public/instruments?instType="+type;
					if(type=="OPTION"){
						_url="https://www.okx.com/api/v5/public/instruments?instType="+type+"&instFamily="+_option_array[_option_flag];
						_option_flag+=1;
					}
					var xx=await fetch(_url).then(res=>res.json());
					return xx;
				}
				var _type_array=["SPOT","SWAP"/*,"MARGIN"*/,"FUTURES","OPTION","OPTION"];
				for(var i=0;i<_type_array.length;i++){
					_conf[type][_type_array[i]]=_conf[type][_type_array[i]]||[];
					var _data=await get_instrument(_type_array[i]);
					console.log(_data)
					for(var ii=0;_data&&ii<_data.data.length;ii++){
						_conf[type][_type_array[i]].push(_data.data[ii].instId);
					}
				}
				await chrome.storage.local.clear();
				await chrome.storage.local.set(_conf);
				break;
		}
	},
	showInTab:()=>{

	}
};
(async ()=>{
	await coin.confLoad();
	coin.socketOpen();
	chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
		switch(message.type){
			case"event_getconf":
				sendResponse(coin.config);
				break;
			case"confSave":
				await coin.confSave(message.value);
				sendResponse("confsave");
				break;
			case"confReset":
				await coin.confReset();
				break;
			case"reconnet":
				coin.socketReopen();
				break
			case"reload":
				console.log("reload")
				chrome.runtime.reload();
				break
			case"heartbeat":
				coin.socketOpen();
				break;
			case"showintab":
				// coin.showInTab();
				coin.port.postMessage({type:"showintab"});
				break;
		}
		sendResponse();
	});
	chrome.runtime.onConnect.addListener(function(port) {
		coin.port=port;
		port.onMessage.addListener(function(msg) {
			if (msg.type&&msg.type=="heartbeat"){
				if(coin.wss){
					coin.wss.send("ping");
				}else{
					coin.socketOpen();
				}
				port.postMessage({type:"heartbeat"});
			}else if(msg.type&&msg.type=="currentData"){
				port.postMessage({type:"currentData",data:coin.currentData});
			}
		});
	});
	chrome.tabs.onActivated.addListener(activeInfo=>{
	});
	await coin.getTradingpair(coin.config.apiserve);
})();