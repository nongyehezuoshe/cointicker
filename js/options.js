let coin={
	config:null,
	apiserve:[
		{
			name:"okx",
			nick:"okx.com",
			url:"wss://ws.okx.com:8443/ws/v5/public",
			referral:"https://www.okx.com/join/7564540"
		}/*,
		{
			name:"binance",
			url:"wss://stream.binance.com:9443/ws/!miniTicker@arr"
		}*/
	],
	init:(config)=>{
		coin.config=config;
		coin.initAPI();
		coin.initTradingpair("okx");
		coin.initCustomizeOpt();
		coin.initTPEdit();
		coin.tabSwitch();
		coin.initI18n();

		// coin.godInit();
		// coin.dataInit();
		document.addEventListener("click",coin.handleEvent,false);
		document.addEventListener("change",coin.handleEvent,false);

		document.querySelector(".about-name").innerText=chrome.runtime.getManifest().name;
		document.querySelector(".about-ver").innerText=`(ver ${chrome.runtime.getManifest().version})`;
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
				if(e.target.classList.contains("tpwrap-li")){
					coin.tpboxTabSwitch(e.target);
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
			case"change":
				console.log(e.target.nextSibling)
				if(e.target.nodeName&&e.target.nodeName.toLowerCase()=="input"&&e.target.type.toLowerCase()=="range"){
					e.target.parentNode.querySelector(".range-box").innerText=e.target.value;
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
	getRandomColor:()=>{
		return `#${Math.random().toString(16).substr(2, 6)}`;
	},
	initI18n:()=>{
		var doms=document.querySelectorAll("*[data-i18n]");
		for( var i=0;i<doms.length;i++){
			doms[i].innerText=coin.i18n(doms[i].dataset.i18n);
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
				alert(coin.i18n("tip_last"));
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
					window.alert(coin.i18n("tip_tprepeat"));
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
			_conf.badge.inicon=false;
			break;
		}
		for(var i in _conf.badge){
			if(i.indexOf("color")!=-1){
				_conf.badge[i]=coin.getRandomColor();
			}
		}
		for(var i in _conf.tab){
			if(i.indexOf("color")!=-1){
				_conf.tab[i]=coin.getRandomColor();
			}
		}
		console.log(_name)
		console.log(_group)
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
				_label.innerText=coin.apiserve[i]["nick"];
			var _reg=coin.domCreate("a",null,"api-reg",coin.i18n("reg"));
				_reg.href=coin.apiserve[i].referral;
				_reg.target="_blank";
				_label.appendChild(_reg);
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
			// data?dom.dataset[data[0]]=data[1]:null;
			if(data){
				for(var i=0;i<data.length;i++){
					dom.dataset[data[i][0]]=data[i][1];
				}
			}
			css?dom.style.cssText+=css:null;
		return dom;
	},
	tabSwitch:(dom)=>{
		var tabs=document.querySelectorAll("#tp-tab>li"),
			tab=!dom?tabs[0]:dom;
		// console.log(tab)
		var lists=document.querySelectorAll(".tp-list"),
			list=document.querySelector("#list"+tab.id.substr(tab.id.indexOf("-")));
		for(var i=0;i<tabs.length;i++){
			tabs[i].classList.contains("tp-tab-current")?tabs[i].classList.remove("tp-tab-current"):null;
			lists[i].classList.contains("tp-list-current")?lists[i].classList.remove("tp-list-current"):null;
		}
		tab.classList.add("tp-tab-current");
		list.classList.add("tp-list-current");
	},
	tpboxTabSwitch:(dom)=>{
		console.log("tpboxTabSwitch")
		console.log(dom)

		var tabs=dom.parentNode.querySelectorAll(".tpwrap-li"),
			tab=!dom?tabs[0]:dom;
		console.log(tabs)
		var lists=dom.parentNode.parentNode.querySelectorAll(".tp-wrap"),
			list=dom.parentNode.parentNode.querySelector("[data-wrap='"+tab.dataset.tab+"']");
		for(var i=0;i<tabs.length;i++){
			tabs[i].classList.contains("tpwrap-current")?tabs[i].classList.remove("tpwrap-current"):null;
			lists[i].classList.contains("tp-wrap-current")?lists[i].classList.remove("tp-wrap-current"):null;
		}
		tab.classList.add("tpwrap-current");
		list.classList.add("tp-wrap-current");
	},
	initTPcurrent:(dom)=>{
		if(!dom){
			dom=document.querySelectorAll("#tp-tab>li")[0];
		}
		var _list=document.querySelector("#list"+dom.id.substr(dom.id.indexOf("-")));
		console.log(_list)
	},
	initTPEdit:()=>{
		var _color=(conftype,conf)=>{
			// console.log(_conf[conftype][conf])
			var _dom=coin.domCreate("div",null,"tp-optionlist"),
				_name=coin.domCreate("span",null,null,coin.i18n("opt_"+conf)),
				_color=coin.domCreate("input",null,null,null,null,"color",null,_conf[conftype][conf]||coin.getRandomColor(),[["conftype",conftype],["conf",conf]]);
			_dom.appendChild(_name);
			_dom.appendChild(_color);
			return _dom;
		}
		var _range=(conftype,conf,data)=>{
			var _dom=coin.domCreate("div",null,"tp-optionlist"),
				_name=coin.domCreate("span",null,null,coin.i18n("opt_"+conf)),
				_range=coin.domCreate("input",null,null,null,null,"range",null,_conf[conftype][conf],[["conftype",conftype],["conf",conf]]),
				_text=coin.domCreate("span",null,null,data.value);
			_range.min=data.min;
			_range.max=data.max;
			_range.step=data.step;
			_dom.appendChild(_name);
			_dom.appendChild(_range);
			_dom.appendChild(_text);
			return _dom;
		}
		var _checkbox=(conftype,conf,data)=>{
			var _dom=coin.domCreate("div"),
				_check=coin.domCreate("input",data/*"check-"+conf*/,null,null,null,"checkbox",_conf[conftype][conf],null,[["conftype",conftype],["conf",conf]]),
				_domIcon_label=coin.domCreate("label",null,null,coin.i18n("opt_"+conf),data/*"check-"+conf*/);
			_dom.appendChild(_check);
			_dom.appendChild(_domIcon_label);
			return _dom;
		}
		var domGroup=document.querySelector("#tp-listbox");
		var domTab=document.querySelector("#tp-tab");

		domGroup.innerText="";
		domTab.innerText="";

		var _randColor=coin.getRandomColor();
		
		for(var i in coin.config[coin.config.apiserve]){
			// console.log(i)
			domTab.appendChild(coin.domCreate("li","tab-"+i,"tp-li",coin.i18n("okx_"+i)));
			var _domList=coin.domCreate("div","list-"+i,"tp-list",null,null,null,null,null,[["group",i]]);
			domGroup.appendChild(_domList);

			// console.log(coin.config[coin.config.apiserve][i])

			for(var ii in coin.config[coin.config.apiserve][i]){
				// console.log(_randColor)
				var _name=coin.config[coin.config.apiserve][i][ii].name,
					_conf=coin.config[coin.config.apiserve][i][ii];
				// console.log(_conf)
				var _tpBox=coin.domCreate("div",null,"tpbox");
					// _tpBox.style.cssText+="background-color:"+_randColor
				
				// btn delete =========
				var _btnDel=coin.domCreate("span",null,"btn-del","X");
					_tpBox.appendChild(_btnDel);

				// tp name ===================
				var _tpName=coin.domCreate("span",null,"tpname",_conf.name);
				// _tpName.style.cssText+="background-color:"+_randColor
				_tpBox.appendChild(_tpName);

				var _tpUl=coin.domCreate("ul",null,"tpwrap-ul");
				var _tpli_icon=coin.domCreate("li",null,"tpwrap-li",coin.i18n("name_inbadge"));
					_tpli_icon.dataset.tab="0";
					_tpli_icon.classList.add("tpwrap-current");
				var _tpli_tab=coin.domCreate("li",null,"tpwrap-li",coin.i18n("name_intab"));
					_tpli_tab.dataset.tab="1";
				_tpUl.appendChild(_tpli_icon);
				_tpUl.appendChild(_tpli_tab);
				_tpBox.appendChild(_tpUl);

				var _domBadge=coin.domCreate("div",null,"tp-wrap tp-wrap-"+i+"-"+ii);
				// _domBadge.appendChild(coin.domCreate("div",null,"tp-optionname",coin.i18n("name_inbadge")));
					_domBadge.dataset.wrap="0";
					_domBadge.classList.add("tp-wrap-current");
				_domBadge.appendChild(_checkbox("badge","inicon","check-inicon-"+i+"-"+ii));
				_domBadge.appendChild(_color("badge","badgebgcolor"));
				_domBadge.appendChild(_color("badge","iconcolor"));
				_domBadge.appendChild(_color("badge","iconbgcolor"));
				_domBadge.appendChild(_checkbox("badge","tpicon","check-tpicon-"+i+"-"+ii));
				_tpBox.appendChild(_domBadge);

				var _domTab=coin.domCreate("div",null,"tp-wrap tp-wrap-"+i+"-"+ii);
				// _domTab.appendChild(coin.domCreate("div",null,"tp-optionname",coin.i18n("name_intab")));
					_domTab.dataset.wrap="1";
				_domTab.appendChild(_checkbox("tab","intab","check-intab-"+i+"-"+ii));
				_domTab.appendChild(_color("tab","namecolor"));
				_domTab.appendChild(_color("tab","namebgcolor"));
				_domTab.appendChild(_color("tab","pricecolor"));
				_domTab.appendChild(_color("tab","pricebgcolor"));
				_domTab.appendChild(_color("tab","hlpricecolor"));
				_domTab.appendChild(_color("tab","hlpricebgcolor"));
				_domTab.appendChild(_color("tab","volumecolor"));
				_domTab.appendChild(_color("tab","volumebgcolor"));
				_tpBox.appendChild(_domTab);

				_domList.appendChild(_tpBox);
			}
		}
	},
	initCustomizeOpt:()=>{
		var _doms=document.querySelectorAll("#tp-customize>div *[data-conf]");
		// console.log(_doms)
		for(var i=0;i<_doms.length;i++){
			_conf=coin.config[_doms[i].dataset.conf];
			// console.log(_conf)
			if(_conf===undefined&&_doms[i].dataset.conf=="tabinterval"){
				_conf=500;
			}
			if(_doms[i].nodeName.toLowerCase()=="select"){
				_doms[i].value=_conf;
				continue;
			}
			switch(_doms[i].type.toLowerCase()){
				case"color":
					_doms[i].value=_conf;
					break;
				case"checkbox":
					_doms[i].checked=_conf;
					break
				case"range":
					_doms[i].value=_conf;
					_doms[i].parentNode.querySelector(".range-box").innerText=_doms[i].value;
					break;
			}
		}
	},
	i18n:msg=>{
		return chrome.i18n.getMessage(msg)||msg;
	},
	initTradingpair:async (type)=>{
		// return
		var dom=document.getElementById("tp-add");
		var _conf=await coin.getTradingpair(type);
		// console.log(type)
		for(var i in _conf){
			if(_conf[i].length==0){continue;}
			var _div=document.createElement("div");
			var _span=coin.domCreate("span",null,"tp-name",coin.i18n("okx_"+i)+": ",null,null,null,null,[["group",i]]);
			var _select=coin.domCreate("select",null,"tp-select");
			var _btn=coin.domCreate("button",null,"tp-add",coin.i18n("btn_add"));
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
		if(_return[type]){
			return _return[type];			
		}else{
			console.log("getpair");
			var _conf={};
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
					var _type_array=["SPOT"/*,"MARGIN"*/,"SWAP","FUTURES","OPTION","OPTION"];
					for(var i=0;i<_type_array.length;i++){
						_conf[type][_type_array[i]]=_conf[type][_type_array[i]]||[];
						var _data=await get_instrument(_type_array[i]);
						console.log(_data)
						for(var ii=0;_data&&ii<_data.data.length;ii++){
							_conf[type][_type_array[i]].push(_data.data[ii].instId);
						}
					}
					await chrome.storage.local.set(_conf);
					break;
			}
			return _conf[type];
		}

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

		var _domCus=document.querySelectorAll("#tp-customize>div *[data-conf]");
		for(var i=0;i<_domCus.length;i++){
			if(_domCus[i].nodeName.toLowerCase()=="select"){
				_conf[_domCus[i].dataset.conf]=_domCus[i].value;
				continue;
			}
			switch(_domCus[i].type.toLowerCase()){
				case"color":
				case"range":
					_conf[_domCus[i].dataset.conf]=_domCus[i].value;
					break;
				case"checkbox":
					_conf[_domCus[i].dataset.conf]=_domCus[i].checked?true:false;
					break;
			}
		}

		var _lists=document.querySelectorAll(".tp-list");
		for(var i=0;i<_lists.length;i++){
			var _groups=_lists[i].querySelectorAll(".tpbox");
			_conf[_conf.apiserve][_lists[i].dataset.group]=[];
			console.log(_lists[i])
			// var _theconf={};
			for(var ii=0;ii<_groups.length;ii++){
				var _theconf={};
					_theconf.name=_groups[ii].querySelector(".tpname").innerText;
				var _domdatas=_groups[ii].querySelectorAll("[data-conf]");
				for(var iii=0;iii<_domdatas.length;iii++){
					if(!_theconf[_domdatas[iii].dataset.conftype]){_theconf[_domdatas[iii].dataset.conftype]={};}
					if(_domdatas[iii].type=="checkbox"){
						_theconf[_domdatas[iii].dataset.conftype][_domdatas[iii].dataset.conf]=_domdatas[iii].checked?true:false;
					}else{
						_theconf[_domdatas[iii].dataset.conftype][_domdatas[iii].dataset.conf]=_domdatas[iii].value;
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