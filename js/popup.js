let coin={
	init:()=>{
		document.addEventListener("click",coin.handleEvent,false);
		coin.initI18n();
	},
	handleEvent:e=>{
		switch(e.type){
			case"click":
				if(e.target.id="re-connect"){
					coin.reConnet();
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
	reConnet:async ()=>{
		await chrome.runtime.sendMessage({type:"reconnet",value:coin.config},(response)=>{
			console.log(response);
		});
		window.close();
	}
};
(async ()=>{
	coin.init();
})();