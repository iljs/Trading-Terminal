import {Data} from "./Data.js";

export class Requests{
	constructor(object){
		this._data 	  		   	= [];
		this._updateSymbol     	= {"type": "wait","data": []};
		this._updateTicker     	= {};
		this.streams  		   	= [];
		this.streamOpen 	   	= false
		this.streamId 		   	= 1;

		this.ping = 0;
		
		this.data = new Data(object);
	}

	init(){
		this.symbols = JSON.parse(this.getRequest('https://fapi.binance.com/fapi/v1/ticker/24hr')).filter(object => object.symbol.toLowerCase().search("usdt") != -1).map((object) => { 
			
			this.data.dataManager(object.symbol.toLowerCase(), object.lastPrice, 0);

			return {
				"symbol": object.symbol.toLowerCase(),
				"price": object.lastPrice,
				"volume": object.quoteVolume,
				"priceDelta15": 0,
				"priceDelta60": 0,
				"update": object.closeTime
			}
		});

		this.data.symbols = this.symbols;

		//this.data.addSymbol("btcusdt");
		//this.data.active.symbol = "btcusdt";



		this.socket = new WebSocket("wss://fstream.binance.com/stream");	
		this.socket.onopen = () => {this.streamOpen = true};

		this.streamSend({
			"id": this.streamId,
			"method": "SUBSCRIBE",
			"params": ["!ticker@arr"]
		});

		this.socket.onmessage = event => {
			let object = JSON.parse(event.data);

			if ((object.result == null) && (object.stream == null)) return true;

			let split = object.stream.split("@");

			if (split[0] == "!ticker") {
				this.data.dataUpdater(object.data);

				return true;
			}

			if (split[1] == "aggTrade") {
				this.ping = new Date().getTime() - object.data.E;	

			 	this.data.tradeUpdater({
					"time": object.data.E, // 300ms = 1px
			 		"price": object.data.p,
			 		"quantity": object.data.q,
			 		"symbol": object.data.s.toLowerCase()
			 	});

			 	return true;
			}

			if (split[1] == "depth") {
				this.ping = new Date().getTime() - object.data.E;	

			 	this.data.depthUpdater(object.data.a, object.data.b);

			 	return true;
			}
		
		}
	}

	get data(){
		return this._data;
	}
	set data(object){
		this._data = object;
	}

	get updateSymbol(){
		return (this._updateSymbol.type == "update") ? () => {
			//console.log('log', this._updateSymbol.data);
			this._updateSymbol.type = "wait";
			return this._updateSymbol.data;
		} : () => {
			//console.log('log',{"type": "wait"});
			return "wait";
		};
	}

	set updateSymbol(object){
		if(this._updateSymbol.type == "wait") this._updateSymbol = {"type": "update","data": []};
		this._updateSymbol.data.push(object);
	}




	get updateTicker(){
		return (this._updateTicker.type == "update") ? (() => {
				this._updateTicker.type = "wait";
				return this._updateTicker.data;
		}) : () => {
			return "wait";
		};
	}

	set updateTicker(object){
		this._updateTicker = {
			"type": "update",
			"data": object
		}
	}






	streamSend(object){
		this.streamId++;

		if (this.streamOpen) {
			this.socket.send(JSON.stringify(object));
		}else{
			let waitStreamOpen = setInterval(() => {
				if (this.streamOpen) {
					this.socket.send(JSON.stringify(object));
					clearInterval(waitStreamOpen);
				};
			}, 100);
		}
	}

	streamSetSymbol(symbol){
		this.data.addSymbol(symbol);

		this.streamSend({
			"id": this.streamId,
			"method": "SUBSCRIBE",
			"params": [(symbol + "@aggTrade"), (symbol + "@depth@100ms")]
		});
	}

	streamRemoveSymbol(symbol){
		this.data.removeSymbol(symbol);

		this.streamSend({
			"id": this.streamId,
			"method": "UNSUBSCRIBE",
			"params": [(symbol + "@aggTrade"), (symbol + "@depth@100ms")]
		});

		this.streamId++;
	}





	streamSetDepthSymbol(symbol){
		this.streamSend({
			"id": this.streamId,
			"method": "SUBSCRIBE",
			"params": [(symbol + "@depth")]
		});

		this.streamId++;
	}

	streamRemoveDepthSymbol(symbol){
		console.log(symbol);
		this.streamSend({
			"id": this.streamId,
			"method": "UNSUBSCRIBE",
			"params": [(symbol + "@depth")]
		});

		this.streamId++;
	}






	getRequest(theUrl)
	{
	    var xmlHttp = new XMLHttpRequest();
	    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
	    xmlHttp.send( null );
	    return xmlHttp.responseText;
	}


	getPing(){
	 	return this.ping;
	}
}



