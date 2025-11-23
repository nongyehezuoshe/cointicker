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
	userInstTypes: [], // [OPTION, SPOT, SWAP, FUTURES]: only including user-managed
	nextIconInstTypeIndex: 0,
	nextIconInstIdIndex: 0,
	lastIconChangeTime: 0,
	socketReopen:()=>{
		coin.wss.close();
		// coin.socketOpen();
	},
	socketOpen:async ()=>{
		// await coin.getTradingpair(coin.config.apiserve);
		coin.userInstTypes = Object.keys(coin.config[coin.config.apiserve]);
		// console.log(coin.userInstTypes);
		coin.wss=new WebSocket("wss://ws.okx.com:8443/ws/v5/public");
		coin.wss.addEventListener('open', function (event) {
			var _obj=coin.config[coin.config.apiserve];
			var _text="";
			for (var i in _obj){
				var _type=i;
				// console.log(_type);
				for( var ii in _obj[i]){
					var _name=_obj[i][ii].name;
					var _text=(_text?_text+',':'')+
						'{"channel": "tickers",'+
						'"instType": "'+_type+'",'+
						'"instId": "'+_name+'"}';
				}
			}
			let _send_text = '{"op": "subscribe","args": ['+_text+']}';
			// console.log("socket open:", _send_text);
			// coin.wss.send('{"op": "subscribe","args": [{"channel": "instruments","instType": "SWAP"}]}');
			coin.wss.send(_send_text);
		});
		coin.wss.addEventListener('message',async function (e) {
			// console.log(e);
			if(e.data=="pong"){ return; }
			var _data=JSON.parse(e.data);
			if(!_data.data || (_data.event && _data.event=="subscribe")) {return;}
			_data=_data.data[0];

			var _userInstTypeObjs = coin.config[coin.config.apiserve];
			var _instType = _data.instType; //current trading pair type
			var _instIdIndex; //current trading pair Index
			var _obj=_userInstTypeObjs[_instType];
			var _conf; //current trading pair settings
			for(var i in _obj){
				if(_obj[i].name==_data.instId){
					_instIdIndex = i
					_conf=_obj[i];
					break;
				}
			}

			// console.log(_conf);
			// console.log(_data);
			
			if(_conf?.tab?.intab){
				// if(!coin.currentData[_data.instId]){coin.currentData[_data.instId]=""}
				coin.currentData[_data.instId]="";
				coin.currentData[_data.instId]=_data;
			}

			let nextIcon = function() {
				let _currTPLen = coin.config[coin.config.apiserve][coin.userInstTypes[coin.nextIconInstTypeIndex]].length; // current inst type trading pairs length
				coin.nextIconInstIdIndex = ++coin.nextIconInstIdIndex%_currTPLen; // next inst id
				if(coin.nextIconInstIdIndex == 0) {
					coin.nextIconInstTypeIndex = ++coin.nextIconInstTypeIndex%coin.userInstTypes.length; //next inst type
				}
				//console.log("next inst type index:", coin.nextIconInstTypeIndex, "next inst id index: ", coin.nextIconInstIdIndex);
			}
			const now = Date.now();
			let hadSetIcon = false;
			if(_instType == coin.userInstTypes[coin.nextIconInstTypeIndex]) {
				if(_instIdIndex == coin.nextIconInstIdIndex) {
					if(coin.config.iconauto && (_conf?.badge?.inicon)){ // display in icon
						// console.log("-->inst type:", _data.instType, " || inst id:", _data.instId);
						if (now - coin.lastIconChangeTime < 1500) return;
						coin.lastIconChangeTime = now;
						// console.log("++>>>inst type:", _data.instType, " || inst id:", _data.instId, " || price:", _data.last);
						coin.setIcon(_data.instId, _data.last, _conf);
						hadSetIcon = true;
					}
					if(!hadSetIcon) { coin.lastIconChangeTime = now; }
					nextIcon();
				}
			}
			if(!hadSetIcon && now - coin.lastIconChangeTime > 2000) { // maybe some trading pair subscribe failed and no return message
				coin.lastIconChangeTime = now;
				nextIcon();
			}
		});
		coin.wss.addEventListener('error',e=>{
			console.log("socket error =>");
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
			console.log("socket close")
			coin.socketOpen();
		});
	},
	setIcon:(instId, price, conf)=>{
		let _text_badge; // price:integer for badge
		let _text_icon; // price:decimal for icon
		let _pos_point = price.indexOf(".");

		/**
		 * The price display rule on badge and icon(notice: max-digits limit of badge = 4):
		 * 12345678 => 1234 + 5678
		 * 123456.7 => 1234 + 56.7
		 * 12345.67 => 1234 + 5.67
		 * 1234.567 => 1234 + 567		(should remove the dot)
		 * 123.4567 => 123.4 + 567
		 * 12.34567 => 12.34 + 567
		 * 1.234567 => 1.234 + 567
		 * 0.123456 => 0.123 + 456
		 */
		if( _pos_point == -1 || _pos_point > 4){  // no decimal or integer digits greater than 4
			_text_badge = {text:price.substr(0, 4)}
			_text_icon = price.substr(4, 4);
		} else {
			if(_pos_point == 4) {
			_text_badge = {text:price.substr(0, _pos_point)}
			_text_icon = price.substr(_pos_point + 1, 4);
			}else if(_pos_point < 4) {
				_text_badge = {text:price.substr(0, 5)}
				_text_icon = price.substr(5, 4);
			}
		}
		// console.log(instId, "=>", price,  "[badge text:", _text_badge, "icon text:", _text_icon, "]");

		if(conf.badge.tpicon){
			if(_text_icon.length == 0){
				_text_icon = instId.substr(0,instId.indexOf("-"));
			}
		}else{
			if(_text_icon.length == 0){
				_text_icon = {path:"./icons/icon.png"};
			}
		}

		chrome.action.setBadgeBackgroundColor({color: conf.badge.badgebgcolor.toUpperCase()});
		chrome.action.setBadgeText(_text_badge);
		var c=new OffscreenCanvas(32,32)
		var ctx=c.getContext("2d");
			
		ctx.fillStyle = conf.badge.iconbgcolor.toUpperCase(); /*"rgb(200,0,0)";*/
		ctx.fillRect(0, 0, 32, 32);
			
		ctx.fillStyle= conf.badge.iconcolor.toUpperCase(); /*"white";*/
		ctx.textAlign="center";
		ctx.font="bold 14px Arial";
		ctx.fillText(_text_icon,16,14);

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
		// console.log(coin.config)
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
					// console.log(_data)
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
		console.log("chrome runtime msg: ", message.type);
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