import {Requests} from "./Requests.js";

export class Chart{
	constructor(object){
		this.requests = new Requests({
			"price": 0,
			"timeFrame": "t",
			"container_id": "chart",
			"terminalInfo": object.terminalInfo
		});

		this.requests.init(object);
		this.requests.streamSetSymbol("btcusdt");
		this.requests.data.setActiveSymbol("btcusdt");
		this.setSymbol("btcusdt");
	}






	getSymbols(){
		return JSON.parse(JSON.stringify(this.requests.data.symbols)).sort(function(a, b){
			return b.volume - a.volume;
		}); 
	}

	setSymbol(symbol){
		this.requests.streamRemoveDepthSymbol(this.getSymbol().toLowerCase());

		this.requests.data.setActiveSymbol(symbol);
		this.requests.streamSetDepthSymbol(symbol);
	}





	getStrategies(){
		return this.requests.data.strategies;
	}

	getStrategiesFull(){
		return this.requests.data.alert.strategies;
	}

	getStrategy(id){
		return this.requests.data.alert.getStrategy(id);
	}

	removeStrategy(id){
		this.requests.data.alert.removeStrategy(id);
	}

	addStrategy(object){
		this.requests.data.alert.addStrategy(object);
	}




	

	getRequestMode(){
		return this.requests.data.activeSymbols;
	}

	setRequestMode(symbol){
		let requestMode = this.getRequestMode();

		if(requestMode.findIndex(object => object == symbol.toLowerCase()) != -1){
			this.requests.streamRemoveSymbol(symbol);
		}else{
			this.requests.streamSetSymbol(symbol);
		}

		return this.requests.data.activeSymbols;
	}	





	setViewMode(){
		this.requests.data.straightMode = !this.requests.data.straightMode;
		return this.requests.data.straightMode;
	}

	getViewMode(){
		return this.requests.data.straightMode;
	}






	getBalance(){
		return this.requests.data.core.orderManager.getBalance();
	}

	setBalance(value){
		this.requests.data.core.orderManager.setBalance(value);
	}



	getOrder(){
		return this.requests.data.core.order;
	}

	setOrder(order){
		this.requests.data.core.order = order;
	}


	getClosePercent(){
		return this.requests.data.core.percent;
	}

	setClosePercent(closePercent){
		this.requests.data.core.percent = closePercent;
	}



	getLeverage(){
		return this.requests.data.core.orderManager.getLeverage(this.getSymbol());
	}

	setLeverage(leverage){
		return this.requests.data.core.orderManager.setLeverage(this.getSymbol(), leverage)
	}







	getOrders(type){
		if(type == 'limit') return this.requests.data.core.orderManager.getAllLimits();
		if(type == 'orders') return this.requests.data.core.orderManager.getAllOrders();
		if(type == 'sl') return this.requests.data.core.orderManager.getAllStopLoss();
		if(type == 'tp') return this.requests.data.core.orderManager.getAllCloseLimits();
	}

	getAllOrders(){
		return {
			limits: this.requests.data.core.orderManager.getAllLimits(),
			orders: this.requests.data.core.orderManager.getAllOrders(),
			stopLoss: this.requests.data.core.orderManager.getAllStopLoss(),
			closeLimits: this.requests.data.core.orderManager.getAllCloseLimits(),
		}
	}

	setAllOrders(object){
		if(object.limits == undefined) return 0;
		this.requests.data.core.orderManager.setAllLimits(object.limits);
		this.requests.data.core.orderManager.setAllOrders(object.orders);
		this.requests.data.core.orderManager.setAllStopLoss(object.stopLoss);
		this.requests.data.core.orderManager.setAllCloseLimits(object.closeLimits);
	}





	






	cancelLimit(id){
		console.log(id);
		this.requests.data.core.orderManager.cancelLimit(id);
	}


	cancelCloseLimit(id){
		this.requests.data.core.orderManager.cancelCloseLimit(id);
	}

	cancelStoploss(id){
		this.requests.data.core.orderManager.cancelStoploss(id);
	}

	closePositions(id){
		this.requests.data.core.orderManager.closePositions(id);
	}






	getPing(){
		return this.requests.getPing();
	}

	getRender(){
		return this.requests.data.core.getRenderPing();
	}

	getItems(){
		return this.requests.data.core.getItems();
	}

	getSymbol(){
		return this.requests.data.core.symbol.toUpperCase();
	}

	getScale(){
		return Math.round(this.requests.data.core.scale.x*100)/100 + " / " + Math.round(this.requests.data.core.scale.y*100)/100;
	}

	getFactScale(){
		return this.requests.data.core.factScale;
	}
}