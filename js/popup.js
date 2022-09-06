let coin={
	init:()=>{
		document.addEventListener("click",coin.handleEvent,false);
		coin.initI18n();
	},
	handleEvent:e=>{
		switch(e.type){
			case"click":
				if(e.target.id=="li-reconnect"){
					coin.reconnect();
				}else if(e.target.id=="li-options"){
					coin.options();
				}else if(e.target.id=="li-tab"){
					coin.tab();
				}else if(e.target.id=="li-reload"){
					coin.reload();
				}
				break
		}
	},
	initI18n:()=>{
		var doms=document.querySelectorAll("*[data-i18n]");
		for( var i=0;i<doms.length;i++){
			doms[i].innerText=chrome.i18n.getMessage(doms[i].dataset.i18n);
		}
	},
	reconnect:async ()=>{
		await chrome.runtime.sendMessage({type:"reconnet",value:coin.config},(response)=>{
			console.log(response);
		});
		window.close();
	},
	options:()=>{
		chrome.tabs.create({url:"../html/options.html"})
		window.close();
	},
	tab:async ()=>{
		await chrome.runtime.sendMessage({type:"showintab",value:coin.config},(response)=>{
			console.log(response);
		});
		window.close();
	},
	reload:async ()=>{
		await chrome.runtime.sendMessage({type:"reload",value:coin.config},(response)=>{
			console.log(response);
		});
		window.close();
	}
};
(async ()=>{
	coin.init();
})();