let coin={
	config:null,
	verurl:{
		edition_normal:["www.1.com","www.2.com","www.3.com"],
		edition_chia:["","",""],
		edition_eth:["","",""],
		edition_btc:["","",""],
	},
	apiserve:[
		{
			name:"okx",
			url:"wss://ws.okx.com:8443/ws/v5/public"
		}/*,
		{
			name:"binance",
			url:"wss://stream.binance.com:9443/ws/!miniTicker@arr"
		}*/
	],
	init:(config)=>{
		console.log(config);
		coin.config=config;
		coin.initAPI();
		coin.initTradingpair("okx");
		coin.initTPEdit();
		coin.tabSwitch();
		coin.initI18n();
		coin.initVer();

		// coin.godInit();
		// coin.dataInit();
		document.addEventListener("click",coin.handleEvent,false);
	},
	handleEvent:e=>{
		switch(e.type){
			case"click":
				if(e.target.classList.contains("tp-add")){
					coin.tpAdd(e.target);
				}
				if(e.target.classList.contains("btn-del")){
					coin.tpDel(e.target);
				}
				if(e.target.classList.contains("tp-li")){
					coin.tabSwitch(e.target);
				}
				if(e.target.id=="save"){
					coin.confSave();
				}
				if(e.target.id=="reset"){
					coin.confReset();
				}
				if(e.target.id=="about"){
					coin.about();
				}
				if(e.target.id=="about-btn"){
					coin.aboutHide();
				}
				break;
		}
	},
	aboutHide:()=>{
		document.querySelector("aboutbground").remove()
	},
	about:()=>{
		var domBg=coin.domCreate("aboutbground");
		var domAbout=document.querySelector("about").cloneNode(true);
			domAbout.style.cssText+="display:block";
		domBg.appendChild(domAbout);
		document.body.appendChild(domBg);
	},
	initVer:()=>{
		var domVer=document.querySelector(".about-ver");
			domVer.innerText="(ver "+chrome.runtime.getManifest().version+")";
		var domName=document.querySelector(".about-name");
			domName.innerText=chrome.runtime.getManifest().name;

		var arrayVer=["edition_normal","edition_chia","edition_eth","edition_btc"]
		var allDivs=document.querySelectorAll(".about-editionlistwrap");
		for(var i=0;i<allDivs.length;i++){
			var _vers=allDivs[i].querySelectorAll("div");
			for(var ii=0;ii<_vers.length;ii++){
				_vers[ii].querySelector("a").innerText=coin.verurl[arrayVer[i]][ii];
				_vers[ii].querySelector("a").href=coin.verurl[arrayVer[i]][ii];
			}
		}
	},
	initI18n:()=>{
		var doms=document.querySelectorAll("*[data-i18n]");
		for( var i=0;i<doms.length;i++){
			doms[i].innerText=chrome.i18n.getMessage(doms[i].dataset.i18n);
		}
	},
	tpDel:(dom)=>{
		console.log(dom);
		var _group=dom.parentNode.parentNode.dataset.group;
		var _name=dom.nextSibling.innerText;
		console.log(_group)
		console.log(_name)

		if(coin.config[coin.config.apiserve][_group].length>1){
			for(var i in coin.config[coin.config.apiserve][_group]){
				if(coin.config[coin.config.apiserve][_group][i].name==_name){
					coin.config[coin.config.apiserve][_group].splice(i,1);
					console.log(coin.config);
					break;
				}
			}
		}else{
			if(Object.keys(coin.config[coin.config.apiserve]).length==1){
				alert(chrome.i18n.getMessage("tip_last"));
				return;
			}
			if(coin.config[coin.config.apiserve].length==1){return;}
			delete coin.config[coin.config.apiserve][_group];
			console.log(coin.config);
		}

		coin.initTPEdit();
		var _tab=document.querySelector("#tp-tab #tab-"+_group)
		coin.tabSwitch(_tab);
	},
	tpAdd:(dom)=>{
		console.log(dom);
		var _group=dom.previousSibling.previousSibling.dataset.group;
		var _name=dom.previousSibling.value;

		if(coin.config[coin.config.apiserve][_group]){
			for(var i in coin.config[coin.config.apiserve][_group]){
				if(coin.config[coin.config.apiserve][_group][i].name==_name){
					window.alert(chrome.i18n.getMessage("tip_tprepeat"));
					return;
				}
			}
		}else{
			coin.config[coin.config.apiserve][_group]=[];
		}

		var _conf={};
		for(var i in JSON.parse(JSON.stringify(coin.config[coin.config.apiserve]))){
			_conf=JSON.parse(JSON.stringify(coin.config[coin.config.apiserve]))[i][0];
			_conf.name=_name;
			break;
		}
		console.log(_name)
		coin.config[coin.config.apiserve][_group].push(_conf);
		console.log(coin.config);
		coin.initTPEdit();
		coin.tabSwitch();
	},
	initAPI:()=>{
		var dom=document.querySelector("#apiserve");
		for(var i=0;i<coin.apiserve.length;i++){
			var _radio=document.createElement("input");
				_radio.type="radio";
				_radio.name="api";
				_radio.id="api-"+coin.apiserve[i]["name"];
				_radio.className="api";
				_radio.dataset.api=coin.apiserve[i]["name"];
			var _label=document.createElement("label");
				_label.htmlFor="api-"+coin.apiserve[i]["name"];
				_label.innerText=coin.apiserve[i]["name"];
			dom.appendChild(_radio);
			dom.appendChild(_label);
			if(coin.apiserve[i]["name"]==coin.config.apiserve){
				_radio.checked=true;
			}
		}
	},
	domCreate:(domType,id,className,text,htmlFor,inputType,checked,inputVlue,data,css)=>{
		// if(data){
		// 	console.log(data)
		// }
		var dom=document.createElement(domType);
			id?dom.id=id:null;
			className?dom.className=className:null;
			text?dom.innerText=text:null;
			htmlFor?dom.htmlFor=htmlFor:null;
			domType=="input"&&inputType?dom.type=inputType:null;
			checked!==undefined&&domType=="input"?dom.checked=checked:null;
			inputVlue!==undefined&&domType=="input"?dom.value=inputVlue:null;
			data?dom.dataset[data[0]]=data[1]:null;
			css?dom.style.cssText+=css:null;
		return dom;
	},
	tabSwitch:(dom)=>{
		var tabs=document.querySelectorAll("#tp-tab>li"),
			tab=!dom?tabs[0]:dom;
		console.log(tab)
		var lists=document.querySelectorAll(".tp-list"),
			list=document.querySelector("#list"+tab.id.substr(tab.id.indexOf("-")));
		for(var i=0;i<tabs.length;i++){
			tabs[i].classList.contains("tp-tab-current")?tabs[i].classList.remove("tp-tab-current"):null;
			lists[i].classList.contains("tp-list-current")?lists[i].classList.remove("tp-list-current"):null;
		}
		tab.classList.add("tp-tab-current");
		list.classList.add("tp-list-current");
	},
	initTPcurrent:(dom)=>{
		if(!dom){
			dom=document.querySelectorAll("#tp-tab>li")[0];
		}
		var _list=document.querySelector("#list"+dom.id.substr(dom.id.indexOf("-")));
		console.log(_list)
	},
	initTPEdit:()=>{
		var domGroup=document.querySelector("#tp-listbox");
		var domTab=document.querySelector("#tp-tab");

		domGroup.innerText="";
		domTab.innerText="";
		
		for(var i in coin.config[coin.config.apiserve]){
			console.log(i)
			domTab.appendChild(coin.domCreate("li","tab-"+i,"tp-li",chrome.i18n.getMessage("okx_"+i)));
			var _domList=coin.domCreate("div","list-"+i,"tp-list",null,null,null,null,null,["group",i]);
			domGroup.appendChild(_domList);

			for(var ii in coin.config[coin.config.apiserve][i]){
				var _name=coin.config[coin.config.apiserve][i][ii].name,
					_conf=coin.config[coin.config.apiserve][i][ii];

				console.log(_name)

				var _tpBox=coin.domCreate("div",null,"tpbox");
				
				// bt delete =========
				var _btnDel=coin.domCreate("span",null,"btn-del","X");
					_tpBox.appendChild(_btnDel);
				// ===================

				var _tpName=coin.domCreate("span",null,"tpname",_conf.name);
				_tpBox.appendChild(_tpName);

				// icon ==============
				var _iconBox=coin.domCreate("div",null,"tp-wrap",null,null,null,null,null,null,"margin-top:-16px;");
				var _iconcolorBox=coin.domCreate("div");

				// bt bgcolor ===============
				var _btbgBox=coin.domCreate("div");
				var _domBtbgcolor_title=coin.domCreate("span",null,null,chrome.i18n.getMessage("color_main"));
				var _domBtbgcolor_value=coin.domCreate("input",null,null,null,null,"color",null,_conf.btbgcolor,["conf","btbgcolor"]);
				_btbgBox.appendChild(_domBtbgcolor_title);
				_btbgBox.appendChild(_domBtbgcolor_value);
				_iconcolorBox.appendChild(_btbgBox);



				var _iconcolorDiv=coin.domCreate("div"),
					_domIconcolor_title=coin.domCreate("span",null,null,chrome.i18n.getMessage("color_ext")),
					_domIconcolor_value=coin.domCreate("input",null,null,null,null,"color",null,_conf.iconcolor,["conf","iconcolor"]);
				_iconcolorDiv.appendChild(_domIconcolor_title);
				_iconcolorDiv.appendChild(_domIconcolor_value);
				_iconcolorBox.appendChild(_iconcolorDiv);

				var _iconbgcolorDiv=coin.domCreate("div"),
					_domIconbgcolor_title=coin.domCreate("span",null,null,chrome.i18n.getMessage("color_extbg")),
					_domIconbgcolor_value=coin.domCreate("input",null,null,null,null,"color",null,_conf.iconbgcolor,["conf","iconbgcolor"]);
				_iconbgcolorDiv.appendChild(_domIconbgcolor_title);
				_iconbgcolorDiv.appendChild(_domIconbgcolor_value);
				_iconcolorBox.appendChild(_iconbgcolorDiv);

				var _iconDiv=coin.domCreate("div"),
					_domIcon=coin.domCreate("input","icon-"+i+_name,null,null,null,"checkbox",_conf.icon,null,["conf","icon"]),
					_domIcon_label=coin.domCreate("label",null,null,chrome.i18n.getMessage("icon"),"icon-"+i+_name);
				_iconDiv.appendChild(_domIcon);
				_iconDiv.appendChild(_domIcon_label);

				// _iconBox.appendChild(_iconcolorBox);
				_iconBox.appendChild(_btbgBox)
				_iconBox.appendChild(_iconcolorDiv);
				_iconBox.appendChild(_iconbgcolorDiv);
				_iconBox.appendChild(_iconDiv);



				// _tpBox.appendChild(_btBox);
				// _tpBox.appendChild(_btbgBox);
				_tpBox.appendChild(_iconBox);
				// _tpBox.appendChild(_notifBox);

				_domList.appendChild(_tpBox);
			}
		}
	},
	initTradingpair:async (type)=>{
		// return
		var dom=document.getElementById("tp-add");
		var _conf=await coin.getTradingpair(type);
		console.log(type)
		for(var i in _conf){
			if(_conf[i].length==0){continue;}
			var _div=document.createElement("div");
			var _span=coin.domCreate("span",null,"tp-name",chrome.i18n.getMessage("okx_"+i)+": ",null,null,null,null,["group",i]);
			var _select=coin.domCreate("select",null,"tp-select");
			var _btn=coin.domCreate("button",null,"tp-add",chrome.i18n.getMessage("btn_add"));
			for(var ii in _conf[i]){
				var _option=coin.domCreate("option",null,null,_conf[i][ii]);
				_select.appendChild(_option);
			}

			_div.appendChild(_span);
			_div.appendChild(_select);
			_div.appendChild(_btn);
			dom.appendChild(_div);
		}
	},
	getTradingpair:async (type)=>{
		var _return=await chrome.storage.local.get();
		return _return[type];
	},
	dataInit:()=>{
		var doms=document.querySelectorAll(".data-init");
		for(var i=0;i<doms.length;i++){
			// console.log(doms[i]);
			switch(doms[i].tagName.toLowerCase()){
				case"input":
					if(doms[i].type=="checkbox"){
						doms[i].checked=coin.config[doms[i].dataset.conf];
					}else if(doms[i].type=="radio"){
						doms[i].checked=coin.config[doms[i].name]==doms[i].value?true:false;
					}else if(doms[i].type=="range"){
						doms[i].value=coin.config[doms[i].dataset.conf];
						doms[i].nextSibling.innerText=coin.config[doms[i].dataset.conf];
					}
					break;
				case"textarea":
					doms[i].value=coin.config[doms[i].dataset.conf];
					break;
			}
		}
	},
	dataGenerate:()=>{
		var doms=document.querySelectorAll(".data-init"),
			_conf={};
		for(var i=0;i<doms.length;i++){
			console.log(doms[i]);
			switch(doms[i].tagName.toLowerCase()){
				case"input":
					console.log(doms[i]);
					if(doms[i].type=="checkbox"){
						_conf[doms[i].dataset.conf]=doms[i].checked;
					}else if(doms[i].type=="radio"){
						if(doms[i].checked){
							_conf[doms[i].name]=doms[i].value;
						}
					}else if(doms[i].type=="range"){
						_conf[doms[i].dataset.conf]=doms[i].value;
					}
					break;
				case"textarea":
					_conf[doms[i].dataset.conf]=doms[i].value;
					break;
			}
		}
		_conf.god=document.querySelector(".godavatar-current").dataset.conf;
		_conf.pos=document.querySelector(".godpos-current").dataset.conf;
		console.log(_conf);
	},
	confSave:()=>{
		console.log("save");
		var _conf={}
			_conf.ver=coin.config.ver;
			_conf.apiserve=document.querySelector("#apiserve input:checked").dataset.api;
			_conf[_conf.apiserve]={};

		var _lists=document.querySelectorAll(".tp-list");
		for(var i=0;i<_lists.length;i++){
			var _groups=_lists[i].querySelectorAll(".tpbox");
			_conf[_conf.apiserve][_lists[i].dataset.group]=[];
			console.log(_groups)
			// var _theconf={};
			for(var ii=0;ii<_groups.length;ii++){
				var _theconf={};
					_theconf.name=_groups[ii].querySelector(".tpname").innerText;
				var _domdatas=_groups[ii].querySelectorAll("[data-conf]");
				for(var iii=0;iii<_domdatas.length;iii++){
					if(_domdatas[iii].type=="checkbox"){
						_theconf[_domdatas[iii].dataset.conf]=_domdatas[iii].checked?true:false;
					}else{
						_theconf[_domdatas[iii].dataset.conf]=_domdatas[iii].value;
					}
				}
				_conf[_conf.apiserve][_lists[i].dataset.group].push(_theconf);
			}
		}
		// _conf.apiserve=document.querySelector("#apiserve input:checked").dataset.api;
		console.log(_conf);

		// return;
		chrome.runtime.sendMessage({type:"confSave",value:_conf},(response)=>{
			console.log(response);
		});
		window.location.reload();
	},
	confReset:()=>{
		chrome.runtime.sendMessage({type:"confReset",value:coin.config},(response)=>{
			console.log(response);
		});
		window.location.reload();
	}
};
(async ()=>{
	var lastConf=await chrome.storage.sync.get();
	coin.init(lastConf);
})();