let edition=(function(){
	var _editions=["xch","eth","btc"];
	for(var i=0;i<_editions.length;i++){
		if(chrome.runtime.getManifest().name.toLowerCase().indexOf(_editions[i])!=-1){
			return _editions[i];
		}
	}
	return "normal";
})();
console.log(edition);
let defaultConf={
	ver:1,
	edition:"xch",
	apiserve:"okx",
	okx:{
		SPOT:[
			{
				// name:"XCH-USDT",
				name:edition=="normal"?"BTC-USDT":edition.toUpperCase()+"-USDT",
				icon:true,
				iconcolor:"#ffffff",
				iconbgcolor:"#ff0000",
				btbgcolor:"#00ff00",
				up:"100",
				dn:"10",
				tpicon:true,
				notif:false
			}
		]
	}
}
let coin={
	config:null,
	wss:null,
	socketReopen:()=>{
		coin.wss.close();
		// coin.socketOpen();
	},
	socketOpen:async ()=>{
		await coin.getTradingpair(coin.config.apiserve);

		let deamon;
		coin.wss=new WebSocket("wss://ws.okx.com:8443/ws/v5/public");
		coin.wss.addEventListener('open', function (event) {
			var _obj=coin.config[coin.config.apiserve];
			var _text="";
			for (var i in _obj){
				console.log(_obj[i]);
				var _type=i;
				console.log(_type);
				for( var ii in _obj[i]){
					var _name=_obj[i][ii].name;
					console.log(_name);
					var _text=(_text?_text+',':'')+'{"channel": "tickers",'+
						'"instType": "'+_type+'",'+
						'"instId": "'+_name+'"}';
				}
			}
			coin.wss.send('{"op": "subscribe","args": ['+_text+']}');
		});
		coin.wss.addEventListener('message',async function (event) {
			// console.log(event.data);
			var _data=event.data=="pong"?event.data:JSON.parse(event.data);
			if(_data.event&&_data.event=="subscribe"){return;}
			var _conf;
			var _obj=coin.config[coin.config.apiserve][_data.data[0].instType];
			for(var i in _obj){
				if(_obj[i].name==_data.data[0].instId){
					_conf=_obj[i];
					break;
				}
			}
			chrome.action.setBadgeBackgroundColor({color:_conf.btbgcolor.toUpperCase()});

			var _text=""
			if(_data.data[0].last.indexOf(".")!=-1){
				if(_data.data[0].last.indexOf(".")==4){
					chrome.action.setBadgeText({text:_data.data[0].last.substr(0,4)});
					_text=_data.data[0].last.substr(5);
				}else{
					if(_data.data[0].last.indexOf(".")<4){
						chrome.action.setBadgeText({text:_data.data[0].last.substr(0,5)});
						_text=_data.data[0].last.substr(5);
					}else{
						chrome.action.setBadgeText({text:_data.data[0].last.substr(0,4)});
						_text=_data.data[0].last.substr(4);
					}
				}
			}else{
				_text=_data.data[0].last.substr(4);
			}

			if(_conf.icon){
				if(_text.length==0){
					coin.setIcon(_data.arg.instId.substr(0,_data.arg.instId.indexOf("-")),_conf);
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
			coin.socketOpen();
		});
		coin.wss.addEventListener('close',e=>{
			coin.socketOpen();
		});
	},
	setIcon:(text,conf)=>{
		// console.log(text)
		var c=new OffscreenCanvas(32,32)
		var ctx=c.getContext("2d");
			
		ctx.fillStyle = conf.iconbgcolor.toUpperCase(); /*"rgb(200,0,0)";*/
		ctx.fillRect(0, 0, 32, 32);
			
		ctx.fillStyle= conf.iconcolor.toUpperCase(); /*"white";*/
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
		if(!coin.config.ver){
			console.log("ffff");
			await chrome.storage.sync.set(defaultConf);
		}
	},
	getTradingpair:async (type)=>{
		var _conf={};
			_conf[type]={};
		switch(type){
			case"okx":
				var socket=new WebSocket("wss://ws.okx.com:8443/ws/v5/public");
				socket.addEventListener('open', function (event) {
					socket.send('{"op": "subscribe","args": [{"channel": "instruments","instType": "SPOT"},{"channel": "instruments","instType": "MARGIN"},{"channel": "instruments","instType": "SWAP"},{"channel": "instruments","instType": "FUTURES"},{"channel": "instruments","instType": "OPTION"}]}');
				});
				socket.addEventListener('message',async function (event) {
					var _data=JSON.parse(event.data);
					_conf[type][_data.arg.instType]=[];
					for(var i in _data.data){
						if(edition!="normal"){
							if(_data.data[i].instId.split("-")[0].toLowerCase()==edition){
								_conf[type][_data.arg.instType].push(_data.data[i].instId);
							}
						}else{
							_conf[type][_data.arg.instType].push(_data.data[i].instId);
						}
					}
					// await chrome.storage.local.clear();
					await chrome.storage.local.set(_conf);
				})
				break;
		}
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
			case"heartbeat":
				coin.socketOpen();
				break;
		}
		sendResponse();
	});
	chrome.runtime.onConnect.addListener(function(port) {
		console.assert(port.name === "knockknock");
		port.onMessage.addListener(function(msg) {
			if (msg.joke === "Knock knock"){
				port.postMessage({question: "Who's there?"});
			}
		});
	});
	chrome.tabs.onActivated.addListener(activeInfo=>{
		console.log(activeInfo);
	});
})();