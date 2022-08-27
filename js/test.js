let coin={
	config:null,
	apiserve:[
		{
			name:"oke",
			ulr:"wss://ws.okx.com:8443/ws/v5/public"
		},
		{
			name:"binance",
			url:"wss://stream.binance.com:9443/ws/!miniTicker@arr"
		}
	],
	init:()=>{
		// console.log(config);
		// coin.config=config;
		// coin.initAPI();
		// coin.initTradingpair("oke");
		// coin.godInit();
		// coin.dataInit();
		document.addEventListener("click",coin.handleEvent,false);
	},
	handleEvent:e=>{
		console.log(e.target)
	},
	test:()=>{
		console.log("ss")
	}
};
(async ()=>{
	coin.init()
})();
