(async ()=>{
	var port;
	var cointicker={
		init:()=>{
			cointicker.connect();
			window.addEventListener("wheel",cointicker.handleEvent,false);
			window.addEventListener("click",cointicker.handleEvent,false);
			window.addEventListener("keydown",cointicker.handleEvent,false);
		},
		handleEvent:e=>{
			switch(e.type){
				case"wheel":
				case"click":
				case"keydown":
					port.disconnect()
					cointicker.connect();
					break;
			}
		},
		postMessage:()=>{
			port.postMessage({joke: "Knock knock"});
		},
		connect:()=>{
			port = chrome.runtime.connect({name: "knockknock"});
			cointicker.postMessage();
			port.onMessage.addListener(function(msg) {
				if (msg.question === "Who's there?"){
					console.log("dff")
					window.setTimeout(()=>{
						cointicker.postMessage();
					},5000)
				}
			});
			port.onDisconnect.addListener(()=>{
				cointicker.connect();
			});
		}
	}
	cointicker.init()
})();
