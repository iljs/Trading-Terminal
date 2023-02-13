
import {Core} from "./Core.js";
import {Alert} from "./Alert.js";

export class Data{
	constructor(object){
		this.activeSymbols 		= [];
		this.symbols 			= [];
		this.lastPrice 			= 0;
		this._update     		= {"type": "wait","data": []};
		this.straightMode 		= false;
		this.straightModeTime	= new Date().getTime();
		this.straightModeUpdate	= new Date().getTime();

		this.straightModeCashe  = {
			price: {
				value: 0,
				length: 0
			},
			volume: 0,
			index: -1,
			name: ""
		}

		this.active 			= {
			"symbol": "",
			"scaleX": 1
		};

		this.scales = [{
			"min": 5,
			"max": 7,
			"step": 20,
			"lastUpdate": 0,
			"symbols": []
		},{
			"min": 4,
			"max": 5,
			"step": 80,
			"lastUpdate": 0,
			"symbols": []
		},{
			"min": 3,
			"max": 4,
			"step": 160,
			"lastUpdate": 0,
			"symbols": []
		},{
			"min": 2.4,
			"max": 3,
			"step": 240,
			"lastUpdate": 0,
			"symbols": []
		},{
			"min": 1.7,
			"max": 2.4,
			"step": 320,
			"lastUpdate": 0,
			"symbols": []
		},{
			"min": 1.2,
			"max": 1.7,
			"step": 460,
			"lastUpdate": 0,
			"symbols": []
		},{
			"min": 1,
			"max": 1.2,
			"step": 640,
			"lastUpdate": 0,
			"symbols": []
		},{
			"min": 0.7,
			"max": 1,
			"step": 1280,
			"lastUpdate": 0,
			"symbols": []
		},{
			"min": 0.45,
			"max": 0.7,
			"step": 2560,
			"lastUpdate": 0,
			"symbols": []
		},{
			"min": 0.15,
			"max": 0.45,
			"step": 5120,
			"lastUpdate": 0,
			"symbols": []
		},{
			"min": 0.09,
			"max": 0.15,
			"step": 10240,
			"lastUpdate": 0,
			"symbols": []
		}];

		this.depth = {
			"asks": [],
			"bids": []
		};



		this.null = new Date().getTime();

		this.core = new Core({
			"container_id": "chart",
			"null": this.null,
			"terminalInfo": object.terminalInfo
		});
		this.core.init();

		this.alert = new Alert({
			"step": 15000,
			"strategies": []
		});

		this.strategies = this.alert.getStrategies();
	}

	init(){
		
	}




	get update(){
		return (this._update.type == "update") ? () => {
			this._update.type = "wait";
			return this._update.data;
		} : () => {
			return "wait";
		};
	}

	set update(object){
		this._update = {
			"type": "update",
			"data": object
		}
	}




	addSymbol(symbol){
		//this.requests.streamSetSymbol(symbol);
		this.activeSymbols.push(symbol);
	}

	removeSymbol(symbol){
		//this.requests.streamRemoveSymbol(symbol);
		this.activeSymbols.splice(this.activeSymbols.findIndex(object => object == symbol), 1);
	}



	getFilters(){
		let data = this.alert.getFilters();

		for (let i = 0; i < data.length; i++) {
			const element = data[i];
			
			let index = this.symbols.findIndex(object => object.symbol == element.symbol);

			if(index != -1){this.symbols[index].priceDelta15 = element.filters.price.min15.delta; this.symbols[index].priceDelta60 = element.filters.price.hour1.delta;}
		}
	}



	dataManager(symbol, price, volume){
		let dateNow = new Date().getTime();

		this.core.orderManager.updatePrice(price, symbol);
		this.alert.dataManager(symbol, price, volume);
		this.getFilters();

		let alertsUpdate = this.alert.getAlerts(symbol);

		if(alertsUpdate.update) this.strategies = this.alert.getStrategies();

		for (let i = 0; i < alertsUpdate.strategies.length; i++) {
			let index = this.strategies.findIndex(object => object.id == alertsUpdate[i].id);
			this.strategies[index].symbols = alertsUpdate[i].symbols;
		}

		if ((new Date().getTime()) - this.straightModeTime > 3000) {
			this.core.removeStrightPoints();
			this.straightModeTime = new Date().getTime();
		}

		if(this.straightMode && (symbol.toLowerCase() == this.active.symbol)){
			if(symbol.toLowerCase() != this.straightModeCashe.name){
				this.straightModeCashe.index = this.scales[0].symbols.findIndex(object => object.symbol.toLowerCase() == symbol.toLowerCase());
				this.straightModeCashe.name = symbol.toLowerCase();
			}

			this.straightModeCashe.price.value += parseFloat(price);
			this.straightModeCashe.price.length++;
			this.straightModeCashe.volume += volume;

			if(2 < (dateNow - this.straightModeUpdate)){
				let newObject = {
					"price": this.straightModeCashe.price.value / this.straightModeCashe.price.length,
					"volume": this.straightModeCashe.volume,
					"date": dateNow,
					"type": (price >= this.scales[0].symbols[this.straightModeCashe.index].chart[0].price) ? "up" : "down",
					"typePoint": "straight"
				};

				this.core.updater(newObject);

				this.straightModeCashe.price.value = 0;
				this.straightModeCashe.price.length = 0;
				this.straightModeCashe.volume = 0;
				this.straightModeUpdate = dateNow;
			}

			
		}
		
		for (var i = 0; i < this.scales.length; i++) {
			let index = this.scales[i].symbols.findIndex(object => object.symbol.toLowerCase() == symbol.toLowerCase());

			if(index == -1){
				this.scales[i].symbols.push({
					"symbol": symbol.toLowerCase(),
					"chart": [],
					"buffer": {
						"price": [],
						"volume": 0,
					},
					"lastUpdate": 0
				});

				index = this.scales[i].symbols.length - 1;
			}

			this.scales[i].symbols[index].buffer.price.push(parseFloat(price));
			this.scales[i].symbols[index].buffer.volume += volume;

			if(this.scales[i].step < (dateNow - this.scales[i].symbols[index].lastUpdate)){
				this.scales[i].symbols[index].lastUpdate = dateNow;

				let newObject = {
					"price": (this.scales[i].symbols[index].buffer.price.reduce((acc, number) => acc + number, 0) / this.scales[i].symbols[index].buffer.price.length),
					"volume": this.scales[i].symbols[index].buffer.volume,
					"date": dateNow,
					"typePoint": "default"
				};

				newObject.type = ((this.scales[i].symbols[index].chart.length == 0) ? true : newObject.price >= this.scales[i].symbols[index].chart[0].price) ? "up" : "down";

				this.scales[i].symbols[index].chart.unshift(newObject);

				this.scales[i].symbols[index].buffer.price = [];
				this.scales[i].symbols[index].buffer.volume = 0;

				if((this.active.symbol == this.scales[i].symbols[index].symbol) && ((this.scales[i].min <= this.core.scale.x) && (this.core.scale.x < this.scales[i].max))){
					this.core.updater(newObject);
				}
			}
		}

		this.core.data = this.scales;
	}



	dataUpdater(result){
		result = result.filter(object => object.s.toLowerCase().search("usdt") != -1);

		for (var i = 0; i < result.length; i++) {
			if(this.activeSymbols.findIndex(object => object == result[i].s.toLowerCase()) == -1){
				let index = this.symbols.findIndex(object => object.symbol == result[i].s.toLowerCase());
			
				let volumeDelta = result[i].q - this.symbols[index].volume; if(volumeDelta < 0) volumeDelta = 0;

				this.symbols[index].price = result[i].c;
				this.symbols[index].volume = result[i].q;
				this.symbols[index].update = result[i].E;

				this.dataManager(result[i].s.toLowerCase(), this.symbols[index].price, volumeDelta);
			}
		}
	}

	tradeUpdater(result){
		this.dataManager(result.symbol, result.price, result.price*result.quantity);
	}



	depthUpdater(asks, bids){
		// Asks - Спрос Sell
		// Bids - Предложение Buy

		for (let ia = 0; ia < asks.length; ia++) {
			asks[ia][0] = parseFloat(asks[ia][0]);
			asks[ia][1] = parseFloat(asks[ia][1]);

			let index = this.depth.asks.findIndex(object => parseFloat(object[0]) == parseFloat(asks[ia][0]));

			if(0 == Number(asks[ia][1])){
				if(index != -1) this.depth.asks.splice(index, 1);
			}else{
				if(index != -1) {
					this.depth.asks[index][1] = asks[ia][1];
				}else{
					this.depth.asks.push(asks[ia]);
				}
				
				
			}
		}

		for (let ib = 0; ib < bids.length; ib++) {
			bids[ib][0] = parseFloat(bids[ib][0]);
			bids[ib][1] = parseFloat(bids[ib][1]);

			let index = this.depth.bids.findIndex(object => parseFloat(object[0]) == parseFloat(bids[ib][0]));

			if(0 == Number(bids[ib][1])){
				if(index != -1) this.depth.bids.splice(index, 1);
			}else{
				if(index != -1) {
					this.depth.bids[index][1] = bids[ib][1];
				}else{
					this.depth.bids.push(bids[ib]);
				}
				
				
			}
		}

		this.depth.asks.sort((a, b) => (a[0] > b[0]) ? 1 : -1);
		this.depth.bids.sort((a, b) => (a[0] < b[0]) ? 1 : -1);

		this.core.chartDepth(this.depth.asks, this.depth.bids);
	}





	getLastData(symbol){
		for (var i = 0; i < this.scales.length; i++) {
			if((this.scales[i].min <= this.active.scaleX) && (this.active.scaleX < this.scales[i].max)){
				let index = this.scales[i].symbols.findIndex(object => object.symbol == symbol);

				if(index != -1) {
					let result = this.scales[i].symbols[index].chart[0].price
					return result;
				}
			}
		}

		return -1;
	}

	setScale(scale){
		this.active.scaleX = scale;

		this.core.scale.x = scale;
		this.core.scale.y = scale;

		this.core.lastStep.x = scale;
		this.core.lastStep.y = scale;

		this.scaleIndex = 0;

		this.core.setScale(scale);
	}

	setActiveSymbol(symbol){
		this.setScale(1);
		this.active.symbol = symbol;

		this.core.symbol = symbol;

		this.depth.asks = [];
		this.depth.bids = [];

		let lastPrice = this.getLastData(symbol);
		if(lastPrice != -1) this.core.startSymbol(lastPrice, new Date().getTime());	
	}

	
}


// 5.01+ 		- 20ms
// 4.01-5 		- 40ms
// 3.01-4 		- 80ms
// 2.01-3 		- 160ms
// 1.51-2 		- 320ms
// 1.01-1.5 	- 620ms
// 0.71-1 		- 960ms
// 0.51-0.7 	- 1280ms
// 0.31-0.5 	- 2560ms
// 0.1-0.3 		- 5120ms