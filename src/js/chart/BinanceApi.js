import CryptoJS from 'crypto-js';

export class BinanceApi{
    constructor(){
        this.limit          = [];
        this.market         = [];

        this.positions      = [];

        this.closeLimit     = [];
        this.closeMarket    = [];

        this.stopLoss       = [];

        this.balance        = 0;

        this.lastQuery      = 0;

        this.exchangeInfo = [];
		
	}

    init(public_key, secret_key){
        this.public_key     = public_key;
        this.secret_key	    = secret_key;

        this.getInitInformation();

        
    }

    getSignature(query){
        return CryptoJS.HmacSHA256(query, this.secret_key).toString(CryptoJS.enc.Hex);
    }


    async getRequest(url){
        this.lastQuery = Date.now();
    

        let response = await fetch(url);

        if (response.ok) {
            return await response.json();
        } 
    }



    async binanceDeleteRequest(url){
        this.lastQuery = Date.now();
    

        let response = await fetch(url, {
            method: 'DELETE',
            headers: {
                "X-MBX-APIKEY": this.public_key
            }
          });

        if (response.ok) {
            return await response.json();
        } 
    }

    async binanceGetRequest(url){
        this.lastQuery = Date.now();
    

        let response = await fetch(url, {
            headers: {
                "X-MBX-APIKEY": this.public_key
            }
          });

        if (response.ok) {
            return await response.json();
        } 
    }

    async binancePostRequest(url, type, params){
        this.lastQuery = Date.now();

        var xmlHttp = new XMLHttpRequest(); 
        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader('X-MBX-APIKEY', this.public_key);
        xmlHttp.send( null );

        let answer = await new Promise((resolve, reject) => {
            xmlHttp.onreadystatechange = () => {
                if(xmlHttp.readyState == XMLHttpRequest.DONE && xmlHttp.status == 200) {
                    resolve(JSON.parse(xmlHttp.responseText));
                }
            }
        });

        return answer;
    }






    createQuery(object){
        let str = "";
        let keys = Object.keys(object);

        for (let i = 0; i < keys.length; i++) {
            if(str != "") str += "&";
            str += (keys[i] + "=" + object[keys[i]]);
        }

        return str;
    }


    async updatePrice(price, symbol){
        for (var i = this.limit.length - 1; i >= 0; i--) {
            const element = this.limit[i];
            if((element.symbol == symbol) && ((Date.now() - this.lastQuery) > 350)){
                if(((element.type == "long") && (element.price >= price)) || ((element.type == "short") && (element.price <= price))){
                    let query = this.createQuery({
                        symbol: element.symbol,
                        origClientOrderId: element.clientID,
                        timestamp: Date.now()
                    });
            
                    let url     = "https://fapi.binance.com/fapi/v1/order?" + query + "&signature=" + this.getSignature(query);
                    let answer  = await this.binanceGetRequest(url);
                    
    
                    if((this.market[i] != undefined) || ((answer.status == "FILLED") && (this.limit[i].clientID == element.clientID))){
                        this.limit.splice(i, 1);
                        this.positionUpdateAdd(answer);
                    }

                    if(answer.status == "CANCELED"){
                        this.limit.splice(i, 1);
                    }
                }
            }
        }


        for (var i = this.market.length - 1; i >= 0; i--) {
            const element = this.market[i];

            if((element.symbol == symbol) && (Date.now() - this.lastQuery > 350)){
                let query = this.createQuery({
                    symbol: element.symbol,
                    origClientOrderId: element.clientID,
                    timestamp: Date.now()
                });
        
                let url     = "https://fapi.binance.com/fapi/v1/order?" + query + "&signature=" + this.getSignature(query);
                let answer  = await this.binanceGetRequest(url);

                if((this.market[i] != undefined) || ((answer.status == "FILLED") && (this.market[i].clientID == element.clientID))){
                    this.market.splice(i, 1);
                    this.positionUpdateAdd(answer);
                }

                this.lastQuery = Date.now();
            }
        }



        for (var i = this.closeLimit.length - 1; i >= 0; i--) {
            const element = this.closeLimit[i];

            if((element.symbol == symbol) && (Date.now() - this.lastQuery > 350)){
                if(((element.type == "long") && (element.price <= price)) || ((element.type == "short") && (element.price >= price))){
                    let query = this.createQuery({
                        symbol: element.symbol,
                        origClientOrderId: element.clientID,
                        timestamp: Date.now()
                    });
            
                    let url     = "https://fapi.binance.com/fapi/v1/order?" + query + "&signature=" + this.getSignature(query);
                    let answer  = await this.binanceGetRequest(url);
                    
    
                    if((this.market[i] != undefined) || ((answer.status == "FILLED") && (this.closeLimit[i].clientID == element.clientID))){
                        this.closeLimit.splice(i, 1);
                        this.positionUpdateClose(answer);
                    }

                    if(answer.status == "CANCELED"){
                        this.closeLimit.splice(i, 1);
                    }
                }
            }
        }


        for (var i = this.closeMarket.length - 1; i >= 0; i--) {
            const element = this.closeMarket[i];

            if((element.symbol == symbol) && (Date.now() - this.lastQuery > 350)){
                let query = this.createQuery({
                    symbol: element.symbol,
                    origClientOrderId: element.clientID,
                    timestamp: Date.now()
                });
        
                let url     = "https://fapi.binance.com/fapi/v1/order?" + query + "&signature=" + this.getSignature(query);
                let answer  = await this.binanceGetRequest(url);
                

                if((this.market[i] != undefined) || ((answer.status == "FILLED") && (this.closeMarket[i].clientID == element.clientID))){
                    this.closeMarket.splice(i, 1);
                    this.positionUpdateClose(answer);
                }

                if(answer.status == "CANCELED"){
                    this.closeMarket.splice(i, 1);
                }
                
            }
        }

        for (var i = 0; i < this.stopLoss.length; i++) {
            const element = this.stopLoss[i];

			if (symbol == element.symbol) {
				if ((element.type == "long") && (element.price >= price)){
					let index = this.positions.findIndex(object => (object.type == element.type && object.symbol == element.symbol));

					if(index != -1){
						this.createCloseMarketOrder(this.positions[index].symbol, this.positions[index].type, 1);
						this.stopLoss.splice(i, 1);
					}
				}

				if ((element.type == "short") && (element.price <= price)){
					let index = this.positions.findIndex(object => (object.type == this.stopLoss[i].type && object.symbol == element.symbol));

					if(index != -1){
						this.createCloseMarketOrder(this.positions[index].symbol, this.positions[index].type, 1);
						this.stopLoss.splice(i, 1);
					}
				}
			}
		}
    }









    positionUpdateAdd(data){
        let index = this.positions.findIndex(object => ((object.symbol == data.symbol.toLowerCase()) && (object.type == data.positionSide.toLowerCase())));

        if(index == -1){
            this.positions.push({
                id: new Date().getTime(),
                symbol: data.symbol.toLowerCase(),
                type: data.positionSide.toLowerCase(),
                price: 0,
                quantity: 0,
                order: 0,
            });
        }

        index = this.positions.findIndex(object => ((object.symbol == data.symbol.toLowerCase()) && (object.type == data.positionSide.toLowerCase())));

        this.positions[index].quantity  += Number(data.executedQty);
        this.positions[index].order     += (Number(data.avgPrice) * Number(data.executedQty));
        this.positions[index].price     = Number(this.positions[index].order) / Number(this.positions[index].quantity);

        this.positions[index].id        = new Date().getTime();
    }


    positionUpdateClose(data){
        let index = this.positions.findIndex(object => ((object.symbol == data.symbol.toLowerCase()) && (object.type == data.positionSide.toLowerCase())));

        if((this.positions[index].quantity - Number(data.executedQty) <= 0)) {
            let closeLimitsDelete = this.closeLimit.filter(object => ((object.symbol == data.symbol.toLowerCase()) && (object.type == data.positionSide.toLowerCase())));
            for (let i = 0; i < closeLimitsDelete.length; i++) {
                const element = closeLimitsDelete[i];
                let indexDelete = this.closeLimit.findIndex(object => object.id == element.id);
                this.closeLimit.splice(indexDelete, 1);
            }
            

            let stopLossDelete = this.stopLoss.findIndex(object => ((object.symbol == data.symbol.toLowerCase()) && (object.type == data.positionSide.toLowerCase())));
            if(stopLossDelete != -1) this.stopLoss.splice(stopLossDelete, 1);

            this.positions.splice(index, 1); 

            return true;
        };

        this.positions[index].order     -= (this.positions[index].order * (Number(data.executedQty) / this.positions[index].quantity));
        this.positions[index].quantity  -= Number(data.executedQty);

        this.positions[index].id        = new Date().getTime();
    }





    async setLeverage(symbol, leverage){
        let index = this.exchangeInfo.findIndex(object => object.symbol == symbol.toUpperCase());

        leverage = (leverage > this.exchangeInfo[index].maxLeverage) ? this.exchangeInfo[index].maxLeverage : leverage;

        this.exchangeInfo[index].leverage = leverage;

        let query = this.createQuery({
            symbol: symbol,
            leverage: leverage,
            timestamp: Date.now()
        });

        let url     = "https://fapi.binance.com/fapi/v1/leverage?" + query + "&signature=" + this.getSignature(query);

        await this.binancePostRequest(url);
    }




    async createLimitOrder(symbol, side, quantity, price){
        let exchangeInfo = this.exchangeInfo.find(object => object.symbol == symbol.toUpperCase());

        let query = this.createQuery({
            symbol: symbol,
            side: (side == "long") ? "BUY" : "SELL",
            positionSide: side.toUpperCase(),
            type: "LIMIT",
            quantity: Math.round(quantity*exchangeInfo.qtyStep)/exchangeInfo.qtyStep,
            price: Math.round(price*exchangeInfo.tickSize)/exchangeInfo.tickSize,
            timeInForce: "GTC",
            timestamp: Date.now()
        });

        let url     = "https://fapi.binance.com/fapi/v1/order?" + query + "&signature=" + this.getSignature(query);

        let answer = await this.binancePostRequest(url);

        this.limit.push({
            id: new Date().getTime(),
            clientID: answer.clientOrderId,
            symbol: answer.symbol.toLowerCase(),
            type: answer.positionSide.toLowerCase(),
            price: answer.price,
            quantity: answer.origQty,
            order: Math.round(Number(answer.price)*Number(answer.origQty)*100)/100
        });

        await this.getInformation();
    }


    async removeLimitOrder(id){
        let index = this.limit.findIndex(object => object.clientID == id);

        let queryDelete = this.createQuery({
            symbol: this.limit[index].symbol.toUpperCase(),
            origClientOrderId: this.limit[index].clientID,
            timestamp: Date.now()
        });

        let urlDelete     = "https://fapi.binance.com/fapi/v1/order?" + queryDelete + "&signature=" + this.getSignature(queryDelete);

        await this.binanceDeleteRequest(urlDelete);

        this.limit.splice(index, 1);

        await this.getInformation();
    }


    async setLimitOrder(id){
        let index = this.limit.findIndex(object => object.clientID == id);

        const element = this.limit[index];

        let exchangeInfo = this.exchangeInfo.find(object => object.symbol == element.symbol.toUpperCase());

        this.removeLimitOrder(id); 
        this.createLimitOrder(element.symbol, element.type, Math.round((element.order / element.price)*exchangeInfo.qtyStep)/exchangeInfo.qtyStep, Math.round(element.price*exchangeInfo.tickSize)/exchangeInfo.tickSize);
        
        await this.getInformation();
    }








    async createLimitCloseOrder(symbol, side, percent, price){
        let index = this.positions.findIndex(object => (object.type == side && object.symbol == symbol));

        let exchangeInfo = this.exchangeInfo.find(object => object.symbol == symbol.toUpperCase());

        let query = this.createQuery({
            symbol: symbol,
            side: (side == "long") ? "SELL" : "BUY",
            positionSide: side.toUpperCase(),
            type: "LIMIT",
            quantity: Math.round((this.positions[index].quantity * percent)*exchangeInfo.qtyStep)/exchangeInfo.qtyStep,
            price: Math.round(price*exchangeInfo.tickSize)/exchangeInfo.tickSize,
            timeInForce: "GTC",
            timestamp: Date.now()
        });

        let url     = "https://fapi.binance.com/fapi/v1/order?" + query + "&signature=" + this.getSignature(query);

        let answer = await this.binancePostRequest(url);

        this.closeLimit.push({
            id: new Date().getTime(),
            clientID: answer.clientOrderId,
            symbol: answer.symbol.toLowerCase(),
            type: answer.positionSide.toLowerCase(),
            price: answer.price,
            quantity: answer.origQty,
            order: Math.round(Number(answer.price)*Number(answer.origQty)*100)/100,
            percent: percent
        });

        await this.getInformation();
    }


    async removeLimitCloseOrder(id){
        let index = this.closeLimit.findIndex(object => object.clientID == id);

        let queryDelete = this.createQuery({
            symbol: this.closeLimit[index].symbol.toUpperCase(),
            origClientOrderId: this.closeLimit[index].clientID,
            timestamp: Date.now()
        });

        let urlDelete     = "https://fapi.binance.com/fapi/v1/order?" + queryDelete + "&signature=" + this.getSignature(queryDelete);

        await this.binanceDeleteRequest(urlDelete);

        this.closeLimit.splice(index, 1);

        await this.getInformation();
    }


    async setLimitCloseOrder(id){
        let index = this.closeLimit.findIndex(object => object.clientID == id);

        const element = this.closeLimit[index];

        let exchangeInfo = this.exchangeInfo.find(object => object.symbol == element.symbol.toUpperCase());

        this.removeLimitCloseOrder(id);
        setTimeout(() => {
            this.createLimitCloseOrder(element.symbol, element.type, element.percent, Math.round(element.price*exchangeInfo.tickSize)/exchangeInfo.tickSize);

            
        }, 200); 

        await this.getInformation();
        
        
    }











    async createMarketOrder(symbol, side, quantity){
        let exchangeInfo = this.exchangeInfo.find(object => object.symbol == symbol.toUpperCase());

        let query = this.createQuery({
            symbol: symbol,
            side: (side == "long") ? "BUY" : "SELL",
            positionSide: side.toUpperCase(),
            type: "MARKET",
            quantity: Math.round(quantity*exchangeInfo.qtyStep)/exchangeInfo.qtyStep,
            timestamp: Date.now()
        });

        let url     = "https://fapi.binance.com/fapi/v1/order?" + query + "&signature=" + this.getSignature(query);
        let answer = await this.binancePostRequest(url);

        this.market.push({
            id: new Date().getTime(),
            clientID: answer.clientOrderId,
            symbol: answer.symbol.toLowerCase(),
            type: answer.positionSide.toLowerCase(),
            price: answer.price,
            quantity: answer.origQty,
            order: Math.round(Number(answer.price)*Number(answer.origQty)*100)/100,
            executedQty: 0
        });

        await this.getInformation();
    }





    async createCloseMarketOrder(symbol, side, percent){
        let exchangeInfo = this.exchangeInfo.find(object => object.symbol == symbol.toUpperCase());

        let index = this.positions.findIndex(object => (object.type == side && object.symbol == symbol));

        let query = this.createQuery({
            symbol: symbol,
            side: (side == "long") ? "SELL" : "BUY",
            positionSide: side.toUpperCase(),
            type: "MARKET",
            quantity: Math.round((this.positions[index].quantity * percent)*exchangeInfo.qtyStep)/exchangeInfo.qtyStep,
            timestamp: Date.now()
        });

        let url     = "https://fapi.binance.com/fapi/v1/order?" + query + "&signature=" + this.getSignature(query);
        let answer = await this.binancePostRequest(url);

        this.closeMarket.push({
            id: new Date().getTime(),
            clientID: answer.clientOrderId,
            symbol: answer.symbol.toLowerCase(),
            type: answer.positionSide.toLowerCase(),
            price: answer.price,
            quantity: answer.origQty,
            order: Math.round(Number(answer.price)*Number(answer.origQty)*100)/100,
            executedQty: 0
        });

        await this.getInformation();
    }




    createStopLoss(symbol, type, price){
		let index = this.positions.findIndex(object => (object.type == type && object.symbol == symbol));
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

				return object;
			}
		}

		return false;
	}




    async getInformation(){
        let query = this.createQuery({timestamp: Date.now()});
        let url     = "https://fapi.binance.com/fapi/v2/account?" + query + "&signature=" + this.getSignature(query);

        let answer = await this.binanceGetRequest(url);
        this.balance = Math.round(answer.availableBalance * 100) / 100;

        return answer;
    }




    async getInitInformation(){
        let query = this.createQuery({timestamp: Date.now()});

        console.log(query, this.secret_key);

        let url     = "https://fapi.binance.com/fapi/v1/leverageBracket?" + query + "&signature=" + this.getSignature(query);

        let maxLeverage = (await this.binanceGetRequest(url)).map((object) => {
            return {
                symbol: object.symbol,
                maxLeverage: object.brackets[0].initialLeverage
            }
        }).filter(object => object.symbol.toLowerCase().search("usdt") != -1);

        let leverage = (await this.getInformation()).positions.map((object) => {
            return {
                symbol: object.symbol,
                leverage: object.leverage
            }
        }).filter(object => object.symbol.toLowerCase().search("usdt") != -1);


        url     = "https://fapi.binance.com/fapi/v1/exchangeInfo";

        let sizes = (await this.getRequest(url)).symbols.map((object) => {
            return {
                symbol: object.symbol,
                tickSize: (object.filters.find(object => object.filterType == "PRICE_FILTER")).tickSize,
                qtyStep: (object.filters.find(object => object.filterType == "LOT_SIZE")).stepSize
            }
        }).filter(object => object.symbol.toLowerCase().search("usdt") != -1);



        


        for (let i = 0; i < sizes.length; i++) {
            this.exchangeInfo.push({
                symbol: sizes[i].symbol,
                tickSize: 1/Number(sizes[i].tickSize),
                qtyStep: 1/Number(sizes[i].qtyStep),
                leverage: Number(leverage.find(object => object.symbol == sizes[i].symbol).leverage),
                maxLeverage: Number(maxLeverage.find(object => object.symbol == sizes[i].symbol).maxLeverage),
            });
        }

        console.log(this.exchangeInfo);
    }

/*
    testLimit(){
        this.createMarket("BTCUSDT", "SHORT", "0.001", 20);

    }
    */
}