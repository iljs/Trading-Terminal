import {Emulator} from "./Emulator.js";
import {BinanceApi} from "./BinanceApi.js";

export class OrderManager{
	constructor(){
		this.type;
	}

	initEmulator(balance){
		this.emulator = new Emulator(balance);
		this.emulator.init();

		this.type = "emulator";
	}

	initBinance(object){
		this.binanceApi = new BinanceApi();
		console.log(object);
		this.binanceApi.init(object.publicKey, object.secretKey);

		this.type = "binance";
	}



	createLimitOrder(symbol, type, price, order){
		if(this.type == "emulator"){
			return this.emulator.createLimitOrder(symbol, type, price, order);
		}

		if(this.type == "binance"){
			return this.binanceApi.createLimitOrder(symbol, type, (order/price), price);
		}
	}	

	createMarketOrder(symbol, type, price, order){
		if(this.type == "emulator"){
			return this.emulator.createMarketOrder(symbol, type, order);
		}

		if(this.type == "binance"){
			return this.binanceApi.createMarketOrder(symbol, type, (order/price));
		}
	}

	closeLimitOrder(symbol, type, price, percent){
		if(this.type == "emulator"){
			return this.emulator.closeLimitOrder(symbol, type, price, percent);
		}

		if(this.type == "binance"){
			return this.binanceApi.createLimitCloseOrder(symbol, type, percent, price);
		}
	}

	closeMarketOrder(symbol, type, price, percent){
		if(this.type == "emulator"){
			return this.emulator.closeMarketOrder(symbol, type, percent);
		}

		if(this.type == "binance"){
			return this.binanceApi.createCloseMarketOrder(symbol, type, percent);
		}
	}

	createStopLoss(symbol, type, price){
		if(this.type == "emulator"){
			return this.emulator.createStopLoss(symbol, type, price);
		}

		if(this.type == "binance"){
			return this.binanceApi.createStopLoss(symbol, type, price);
		}
	}





	setLimit(id, price, set){
			if(this.type == "emulator"){
				let index = this.emulator.limit.findIndex(object => object.clientID == id);

				if(index == -1) return false;
				let newId = new Date().getTime();
	
				this.emulator.limit[index].id = newId;
				this.emulator.limit[index].price = price;
			}
	
			if(this.type == "binance"){
				let index = this.binanceApi.limit.findIndex(object => object.clientID == id);

				if(index == -1) return false;
				let newId = new Date().getTime();
	
				this.binanceApi.limit[index].id = newId;
				this.binanceApi.limit[index].price = price;
				
				if(set) this.binanceApi.setLimitOrder(id);
			}
		
	}

	setCloseLimit(id, price, set){
		if(this.type == "emulator"){
			let index = this.emulator.closeLimit.findIndex(object => object.id == id);

			this.emulator.closeLimit[index].id = new Date().getTime();
			this.emulator.closeLimit[index].price = price;
		}

		if(this.type == "binance"){
			let index = this.binanceApi.closeLimit.findIndex(object => object.clientID == id);

			console.log(id, this.binanceApi.closeLimit);

			if(index == -1) return false;
			let newId = new Date().getTime();

			this.binanceApi.closeLimit[index].id = newId;
			this.binanceApi.closeLimit[index].price = price;
			
			if(set) this.binanceApi.setLimitCloseOrder(id);
		}
	}

	setStopLoss(id, price, set){
		if(this.type == "emulator"){
			let index = this.emulator.stopLoss.findIndex(object => object.id == id);

			this.emulator.stopLoss[index].id = new Date().getTime();
			this.emulator.stopLoss[index].price = price;
		}

		if(this.type == "binance"){
			let index = this.emulator.stopLoss.findIndex(object => object.id == id);

			this.binanceApi.stopLoss[index].id = new Date().getTime();
			this.binanceApi.stopLoss[index].price = price;
		}
	}






	cancelLimit(id){
		if(this.type == "emulator"){
			this.emulator.limit.splice(this.emulator.limit.findIndex(object => object.id == id), 1);
		}

		if(this.type == "binance"){
			this.binanceApi.removeLimitOrder((this.binanceApi.limit.find(object => object.id == id)).clientID);
		}
	}


	cancelCloseLimit(id){
		if(this.type == "emulator"){
			this.emulator.closeLimit.splice(this.emulator.closeLimit.findIndex(object => object.id == id), 1);
		}

		if(this.type == "binance"){
			this.binanceApi.removeLimitCloseOrder((this.binanceApi.closeLimit.find(object => object.id == id)).clientID);
		}
	}

	cancelStoploss(id){
		if(this.type == "emulator"){
			this.emulator.stopLoss.splice(this.emulator.stopLoss.findIndex(object => object.id == id), 1);
		}

		if(this.type == "binance"){
			this.binanceApi.stopLoss.splice(this.binanceApi.stopLoss.findIndex(object => object.id == id), 1);
		}
	}

	closePositions(id){
		if(this.type == "emulator"){
			let position = this.emulator.orders.find(object => object.id == id);
			this.emulator.closeMarketOrder(position.symbol, position.type, 1);
		}

		if(this.type == "binance"){
			let position = this.binanceApi.positions.find(object => object.id == id);
			this.binanceApi.createCloseMarketOrder(position.symbol, position.type, 1);
		}
	}






	getActiveOrders(symbol){
		if(this.type == "emulator"){
			return this.emulator.orders.filter(object => object.symbol == symbol);
		}

		if(this.type == "binance"){
			return this.binanceApi.positions.filter(object => object.symbol == symbol);
		}
	}

	getLimitOrders(symbol){
		if(this.type == "emulator"){
			return this.emulator.limit.filter(object => object.symbol == symbol);
		}

		if(this.type == "binance"){
			return this.binanceApi.limit.filter(object => object.symbol == symbol);
		}
	}

	getCloseLimit(symbol){
		if(this.type == "emulator"){
			return this.emulator.closeLimit.filter(object => object.symbol == symbol);
		}

		if(this.type == "binance"){
			return this.binanceApi.closeLimit.filter(object => object.symbol == symbol);
		}
	}

	getStopLoss(symbol){
		if(this.type == "emulator"){
			return this.emulator.stopLoss.filter(object => object.symbol == symbol);
		}

		if(this.type == "binance"){
			return this.binanceApi.stopLoss.filter(object => object.symbol == symbol);
		}
	}

	getAllOrders(){
		if(this.type == "emulator"){
			return this.emulator.orders;
		}

		if(this.type == "binance"){
			return this.binanceApi.positions;
		}
	}

	getAllLimits(){
		if(this.type == "emulator"){
			return this.emulator.limit;
		}

		if(this.type == "binance"){
			return this.binanceApi.limit;
		}
	}

	getAllStopLoss(){
		if(this.type == "emulator"){
			return this.emulator.stopLoss;
		}

		if(this.type == "binance"){
			return this.binanceApi.stopLoss;
		}
	}

	getAllCloseLimits(){
		if(this.type == "emulator"){
			return this.emulator.closeLimit;
		}

		if(this.type == "binance"){
			return this.binanceApi.closeLimit;
		}
	}

	getBalance(){
		if(this.type == "emulator"){
			return this.emulator.balance;
		}

		if(this.type == "binance"){
			return this.binanceApi.balance;
		}
	}

	setBalance(value){
		if(this.type == "emulator"){
			this.emulator.balance = value;
		}
	}

	getLeverage(symbol){
		if(this.type == "emulator"){
			return this.emulator.getLeverage(symbol);
		}

		if(this.type == "binance"){
			return (this.binanceApi.exchangeInfo.find(object => object.symbol == symbol.toUpperCase()) != undefined) ? (this.binanceApi.exchangeInfo.find(object => object.symbol == symbol.toUpperCase())).leverage : -1;
		}
	}




	async setLeverage(symbol, leverage){
		if(this.type == "emulator"){
			return this.emulator.setLeverage(symbol, leverage);
		}

		if(this.type == "binance"){
			return (await this.binanceApi.setLeverage(symbol, leverage));
		}
	}


	sellAll(){
		if(this.type == "emulator"){
			this.emulator.sellAll();
		}
	}

	cancelBuy(){
		if(this.type == "emulator"){
			this.emulator.cancelBuy();
		}
	}


	updatePrice(price, symbol){
		if(this.type == "emulator"){
			this.emulator.updatePrice(price, symbol);
		}

		if(this.type == "binance"){
			this.binanceApi.updatePrice(price, symbol);
		}
	}





	setAllOrders(object){
		if(this.type == "emulator"){
			this.emulator.orders = object;
		}

		if(this.type == "binance"){
			this.binanceApi.positions = object;
		}
	}

	setAllLimits(object){
		if(this.type == "emulator"){
			this.emulator.limit = object;
		}

		if(this.type == "binance"){
			this.binanceApi.limit = object;
		}
	}

	setAllStopLoss(object){
		if(this.type == "emulator"){
			this.emulator.stopLoss = object;
		}

		if(this.type == "binance"){
			this.binanceApi.stopLoss = object;
		}
	}

	setAllCloseLimits(object){
		if(this.type == "emulator"){
			this.emulator.closeLimit = object;
		}

		if(this.type == "binance"){
			this.binanceApi.closeLimit = object;
		}
	}
}