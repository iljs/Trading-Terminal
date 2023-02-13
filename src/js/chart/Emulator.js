export class Emulator{
	constructor(object){
		this.balance			= object;
	}

	init(){
		this._orders 			= [];
		this.lastOrders 		= [];

		this.limit				= [];
		this.lastLimit			= [];

		this.market 			= [];
		this.lastMarket 		= [];

		this.closeLimit 		= [];
		this.lastCloseLimit 	= [];

		this.closeMarket 		= [];
		this.lastCloseMarket 	= [];

		this.stopLoss 			= [];

		this.exchangeInfo 		= [];

		
		this.blockBalance 		= 0;
	}

	set addOrder(object){
		this._orders.push(object)
	}

	set setOrder(object){
		this._orders[this._orders.findIndex(obj => obj.id == object.id)] = object;
	}

	set removeOrder(id){
		this._orders.splice([this._orders.findIndex(object => object.id == id)], 1);
	}

	get orders(){
		return this._orders;
	}

	set orders(object){
		this._orders = object;
	}





	getLeverage(symbol){
		let index = this.exchangeInfo.findIndex(object => object.symbol == symbol.toLowerCase());
		if(index == -1){
			this.exchangeInfo.push({
				"symbol": symbol.toLowerCase(),
				"leverage": 20,
				"maxLeverage": 100
			});
			return 20;
		}

		return this.exchangeInfo[index].leverage;
	}

	setLeverage(symbol, leverage){
		let index = this.exchangeInfo.findIndex(object => object.symbol == symbol.toLowerCase());
		if(index == -1){
			this.exchangeInfo.push({
				"symbol": symbol.toLowerCase(),
				"leverage": 20,
				"maxLeverage": 100
			});
			return 20;
		}

		this.exchangeInfo[index].leverage = (leverage < this.exchangeInfo[index].maxLeverage) ? leverage : this.exchangeInfo[index].maxLeverage;

		return this.exchangeInfo[index].leverage;
	}



	updatePrice(price, symbol){
		console.log(this.limit);
		for (var i = 0; i < this.market.length; i++) {
			if (symbol == this.market[i].symbol) {
				if (this.market[i].type == "long"){
					let quantity = this.market[i].order / price;

					this.market[i].price 		= price;
					this.market[i].quantity 	= quantity;

					let index = this.orders.findIndex(object => (object.type == this.market[i].type && object.symbol == this.market[i].symbol));

					if(index == -1){
						this.addOrder = {
							"id": new Date().getTime(),
							"symbol": this.market[i].symbol,
							"type": this.market[i].type,
							"order": 0,
							"blockedBalance": 0,
							"quantity": 0,
							"leverage": 0,
							"price": 0
						}

						index = this.orders.findIndex(object => (object.type == this.market[i].type && object.symbol == this.market[i].symbol));
					}

					let order = this.orders[index];
					order.quantity += quantity;
					order.order += price*quantity;
					order.blockedBalance += price*quantity/this.getLeverage(symbol);
					order.id = new Date().getTime();
					order.leverage = this.getLeverage(symbol);
					order.price = price;

					this.balance -= price*quantity/this.getLeverage(symbol);

					this.setOrder = order;
				}

				if (this.market[i].type == "short"){
					let quantity = this.market[i].order / price;

					this.market[i].price 	= price;
					this.market[i].quantity 	= quantity;

					let index = this.orders.findIndex(object => (object.type == this.market[i].type && object.symbol == this.market[i].symbol));

					if(index == -1){
						this.addOrder = {
							"id": new Date().getTime(),
							"symbol": this.market[i].symbol,
							"type": this.market[i].type,
							"order": 0,
							"blockedBalance": 0,
							"quantity": 0,
							"leverage": 0,
							"price": 0
						}

						index = this.orders.findIndex(object => (object.type == this.market[i].type && object.symbol == this.market[i].symbol));
					}

					let order = this.orders[index];
					order.quantity += quantity;
					order.blockedBalance += price*quantity/this.getLeverage(symbol);
					order.order += price*quantity;
					order.id = new Date().getTime();
					order.leverage = this.getLeverage(symbol);
					order.price = price;

					this.balance -= price*quantity/this.getLeverage(symbol);

					this.setOrder = order;
				}

				this.market.splice(i, 1);
			}
		}

		for (var i = 0; i < this.limit.length; i++) {
			if (symbol == this.limit[i].symbol) {
				if ((this.limit[i].type == "long") && (this.limit[i].price >= price)) {
					let quantity = this.limit[i].quantity;

					let index = this.orders.findIndex(object => (object.type == this.limit[i].type && object.symbol == this.limit[i].symbol));

					if(index == -1){
						this.addOrder = {
							"id": new Date().getTime(),
							"symbol": this.limit[i].symbol,
							"type": this.limit[i].type,
							"order": 0,
							"blockedBalance": 0,
							"quantity": 0,
							"leverage": 0,
							"price": 0
						}

						index = this.orders.findIndex(object => (object.type == this.limit[i].type && object.symbol == this.limit[i].symbol));
					}

					let order = this.orders[index];
					order.quantity += quantity;
					order.order += this.limit[i].price*quantity;
					order.blockedBalance += this.limit[i].price*quantity/this.getLeverage(symbol);
					order.leverage = this.getLeverage(symbol);
					order.price = price;

					this.balance -= this.limit[i].price*quantity/this.getLeverage(symbol);

					this.setOrder = order;

					this.limit.splice(i, 1);
				}
				else if ((this.limit[i].type == "short") && (this.limit[i].price <= price)) {
					let quantity = this.limit[i].quantity;

					let index = this.orders.findIndex(object => (object.type == this.limit[i].type && object.symbol == this.limit[i].symbol));

					if(index == -1){
						this.addOrder = {
							"id": new Date().getTime(),
							"symbol": this.limit[i].symbol,
							"type": this.limit[i].type,
							"order": 0,
							"blockedBalance": 0,
							"quantity": 0,
							"leverage": 0,
							"price": 0
						}

						index = this.orders.findIndex(object => (object.type == this.limit[i].type && object.symbol == this.limit[i].symbol));
					}

					let order = this.orders[index];
					order.quantity += quantity;
					order.blockedBalance += this.limit[i].price*quantity/this.getLeverage(symbol);
					order.order += this.limit[i].price*quantity;
					order.leverage = this.getLeverage(symbol);
					order.price = price;



					this.balance -= this.limit[i].price*quantity/this.getLeverage(symbol);

					this.setOrder = order;

					this.limit.splice(i, 1);
				}
			}
		}

		for (var i = 0; i < this.closeMarket.length; i++) {
			if (symbol == this.closeMarket[i].symbol) {
				if (this.closeMarket[i].type == "long"){
					let index = this.orders.findIndex(object => (object.type == this.closeMarket[i].type && object.symbol == this.closeMarket[i].symbol));

					if(index != -1){
						let percent = this.closeMarket[i].quantity / this.orders[index].quantity;

						let quantity = this.orders[index].quantity * percent;
						let order = this.orders[index];

						this.balance += (price*quantity - order.order * percent) + order.blockedBalance * percent;

						order.order -= order.order * percent;
						order.quantity -= quantity;
						order.blockedBalance -= order.blockedBalance * percent;

						

						this.setOrder = order;

						if(order.blockedBalance == 0) {
							this.removeOrder = order.id;

							let closeLimitsDelete = this.closeLimit.filter(object => ((object.symbol == symbol.toLowerCase()) && (object.type == this.closeMarket[i].type.toLowerCase())));
							for (let i = 0; i < closeLimitsDelete.length; i++) {
								const element = closeLimitsDelete[i];
								let indexDelete = this.closeLimit.findIndex(object => object.id == element.id);
								this.closeLimit.splice(indexDelete, 1);
							}
							
				
							let stopLossDelete = this.stopLoss.findIndex(object => ((object.symbol == symbol.toLowerCase()) && (object.type == this.closeMarket[i].type.toLowerCase())));
							if(stopLossDelete != -1) this.stopLoss.splice(stopLossDelete, 1);
				
							return true;
							
						}
					}
				}

				if (this.closeMarket[i].type == "short"){
					let index = this.orders.findIndex(object => (object.type == this.closeMarket[i].type && object.symbol == this.closeMarket[i].symbol));

					if(index != -1){
						let percent = this.closeMarket[i].quantity / this.orders[index].quantity;

						let quantity = this.orders[index].quantity * percent;
						let order = this.orders[index];

						this.balance += (order.order * percent - price * quantity) + order.blockedBalance * percent;

						order.order -= order.order * percent;
						order.quantity -= quantity;
						order.blockedBalance -= order.blockedBalance * percent;
						
						this.setOrder = order;

						if(order.blockedBalance == 0) {
							this.removeOrder = order.id;

							let closeLimitsDelete = this.closeLimit.filter(object => ((object.symbol == symbol.toLowerCase()) && (object.type == this.closeMarket[i].type.toLowerCase())));
							for (let i = 0; i < closeLimitsDelete.length; i++) {
								const element = closeLimitsDelete[i];
								let indexDelete = this.closeLimit.findIndex(object => object.id == element.id);
								this.closeLimit.splice(indexDelete, 1);
							}
							
				
							let stopLossDelete = this.stopLoss.findIndex(object => ((object.symbol == symbol.toLowerCase()) && (object.type == this.closeMarket[i].type.toLowerCase())));
							if(stopLossDelete != -1) this.stopLoss.splice(stopLossDelete, 1);
				
							return true;
							
						}
					}
				}


				this.closeMarket.splice(i, 1);
			}
		}

		for (var i = 0; i < this.closeLimit.length; i++) {
			if (symbol == this.closeLimit[i].symbol) {
				if ((this.closeLimit[i].type == "long") && (this.closeLimit[i].price <= price)){
					let index = this.orders.findIndex(object => (object.type == this.closeLimit[i].type && object.symbol == this.closeLimit[i].symbol));

					if(index != -1){
						let percent = this.closeLimit[i].quantity / this.orders[index].quantity;

						let quantity = this.orders[index].quantity * percent;
						let order = this.orders[index];

						this.balance += (this.closeLimit[i].price*quantity - order.order * percent) + order.blockedBalance * percent;

						order.order -= order.order * percent;
						order.quantity -= quantity;
						order.blockedBalance -= order.blockedBalance * percent;

						this.setOrder = order;

						this.closeLimit.splice(i, 1);

						if(order.blockedBalance == 0) {
							this.removeOrder = order.id;

							let closeLimitsDelete = this.closeLimit.filter(object => ((object.symbol == symbol.toLowerCase()) && (object.type == this.closeMarket[i].type.toLowerCase())));
							for (let i = 0; i < closeLimitsDelete.length; i++) {
								const element = closeLimitsDelete[i];
								let indexDelete = this.closeLimit.findIndex(object => object.id == element.id);
								this.closeLimit.splice(indexDelete, 1);
							}
							
				
							let stopLossDelete = this.stopLoss.findIndex(object => ((object.symbol == symbol.toLowerCase()) && (object.type == this.closeMarket[i].type.toLowerCase())));
							if(stopLossDelete != -1) this.stopLoss.splice(stopLossDelete, 1);
				
							return true;
							
						}
					}
				}else if ((this.closeLimit[i].type == "short") && (this.closeLimit[i].price >= price)){
					let index = this.orders.findIndex(object => (object.type == this.closeLimit[i].type && object.symbol == this.closeLimit[i].symbol));

					if(index != -1){
						let percent = this.closeLimit[i].quantity / this.orders[index].quantity;

						let quantity = this.orders[index].quantity * percent;
						let order = this.orders[index];

						this.balance += (order.order * percent-this.closeLimit[i].price*quantity) + order.blockedBalance * percent;

						order.order -= order.order * percent;
						order.quantity -= quantity;
						order.blockedBalance -= order.blockedBalance * percent;
						
						this.setOrder = order;

						this.closeLimit.splice(i, 1);

						if(order.blockedBalance == 0) {
							this.removeOrder = order.id;

							let closeLimitsDelete = this.closeLimit.filter(object => ((object.symbol == symbol.toLowerCase()) && (object.type == this.closeMarket[i].type.toLowerCase())));
							for (let i = 0; i < closeLimitsDelete.length; i++) {
								const element = closeLimitsDelete[i];
								let indexDelete = this.closeLimit.findIndex(object => object.id == element.id);
								this.closeLimit.splice(indexDelete, 1);
							}
							
				
							let stopLossDelete = this.stopLoss.findIndex(object => ((object.symbol == symbol.toLowerCase()) && (object.type == this.closeMarket[i].type.toLowerCase())));
							if(stopLossDelete != -1) this.stopLoss.splice(stopLossDelete, 1);
				
							return true;
							
						}
					}
				}
			}
		}

		for (var i = 0; i < this.stopLoss.length; i++) {
			if (symbol == this.stopLoss[i].symbol) {
				if ((this.stopLoss[i].type == "long") && (this.stopLoss[i].price >= price)){
					let index = this.orders.findIndex(object => (object.type == this.stopLoss[i].type && object.symbol == this.stopLoss[i].symbol));

					if(index != -1){
						this.closeMarketOrder(this.orders[index].symbol, this.orders[index].type, 1);
						this.stopLoss.splice(i, 1);
					}
				}

				if ((this.stopLoss[i].type == "short") && (this.stopLoss[i].price <= price)){
					let index = this.orders.findIndex(object => (object.type == this.stopLoss[i].type && object.symbol == this.closeMarket[i].symbol));

					if(index != -1){
						this.closeMarketOrder(this.orders[index].symbol, this.orders[index].type, 1);
						this.stopLoss.splice(i, 1);
					}
				}
			}
		}
	}

	createLimitOrder(symbol, type, price, order){
		let object = {
			"id": new Date().getTime(),
			"clientID": new Date().getTime(),
			"symbol": symbol,
			"type": type,
			"price": price,
			"quantity": order/price,
			"order": order
		}

		this.limit.push(object);

		return object;
	}	

	createMarketOrder(symbol, type, order){
		let object = {
			"id": new Date().getTime(),
			"symbol": symbol,
			"type": type,
			"order": order,
			"margin": order/this.getLeverage(symbol)
		}

		this.market.push(object);

		return object;
	}

	closeLimitOrder(symbol, type, price, percent){
		let index = this.orders.findIndex(object => (object.type == type && object.symbol == symbol));

		if (index != -1) {
			let object = {
				"id": new Date().getTime(),
				"clientID": new Date().getTime(),
				"symbol": symbol,
				"type": type,
				"price": price,
				"quantity": percent * this.orders[index].quantity,
			}

			this.closeLimit.push(object);

			return object;
		}

		return false;
	}

	closeMarketOrder(symbol, type, percent){
		let index = this.orders.findIndex(object => (object.type == type && object.symbol == symbol));

		if (index != -1) {
			let object = {
				"id": new Date().getTime(),
				"clientID": new Date().getTime(),
				"symbol": symbol,
				"type": type,
				"quantity": percent * this.orders[index].quantity,
			}

			this.closeMarket.push(object);

			return object;
		}

		return false;
	}

	createStopLoss(symbol, type, price){
		let index = this.orders.findIndex(object => (object.type == type && object.symbol == symbol));
		let isset = this.stopLoss.findIndex(object => (object.type == type && object.symbol == symbol));

		if(isset != -1){
			this.stopLoss[isset].id = new Date().getTime();
			this.stopLoss[isset].price = price;
		}else{
			if (index != -1) {
				let object = {
					"id": new Date().getTime(),
					"clientID": new Date().getTime(),
					"symbol": symbol,
					"type": type,
					"price": price
				}

				this.stopLoss.push(object);

				console.log(this.stopLoss);

				return object;
			}
		}

		return false;
	}

	cancelBuy(){
		this.limit = [];
		this.closeLimit = [];
	}	

	sellAll(){
		for (var i = 0; i < this.orders.length; i++) {
			this.closeMarketOrder(this.orders[i].symbol, this.orders[i].type, 1);
		}
	}
}