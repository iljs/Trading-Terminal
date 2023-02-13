export class Alert{
    constructor(object){
        this.strategies = object.strategies;
        this.step       = object.step;
        this.update     = false;

        this.symbols    = [];

        this.strategies = [];

       
    }




    setData15min(index){
        let min15Array = this.symbols[index].data.slice(0,60);

        this.symbols[index].filters.price.min15.min = min15Array.reduce(function(prev, curr) {
            return prev.min < curr.min ? prev : curr;
        }).min;
        this.symbols[index].filters.price.min15.max = min15Array.reduce(function(prev, curr) {
            return prev.max > curr.max ? prev : curr;
        }).max;
        this.symbols[index].filters.price.min15.delta = Math.round((this.symbols[index].filters.price.min15.max / this.symbols[index].filters.price.min15.min - 1)*10000)/100;
        this.symbols[index].filters.volume.min15 = min15Array.reduce((acc, number) => acc + number.volume, 0);

        this.symbols[index].update = true;

        
    }

    setData1hour(index){
        let hour1Array = this.symbols[index].data.slice(0,240);

        this.symbols[index].filters.price.hour1.min = hour1Array.reduce(function(prev, curr) {
            return prev.min < curr.min ? prev : curr;
        }).min;
        this.symbols[index].filters.price.hour1.max = hour1Array.reduce(function(prev, curr) {
            return prev.max > curr.max ? prev : curr;
        }).max;
        this.symbols[index].filters.price.hour1.delta = Math.round((this.symbols[index].filters.price.hour1.max / this.symbols[index].filters.price.hour1.min - 1)*10000)/100;
        this.symbols[index].filters.volume.hour1 = hour1Array.reduce((acc, number) => acc + number.volume, 0);

        this.symbols[index].update = true;
    }



    dataManager(symbol, price, volume){
        let dateNow = new Date().getTime();

        let index = this.symbols.findIndex(object => object.symbol.toLowerCase() == symbol.toLowerCase());

        if(index == -1){
            this.symbols.push({
                "symbol": symbol.toLowerCase(),
                "data": [],
                "update": false,
                "buffer": {
                    "min": 0,
                    "max": 0,
                    "volume": 0,
                },
                "filters": {
                    "volume": {
                        "min15": 0,
                        "hour1": 0
                    },
                    "price": {
                        "min15": {
                            "min": 0,
                            "max": 0,
                            "delta": 0
                        },
                        "hour1": {
                            "min": 0,
                            "max": 0,
                            "delta": 0
                        }
                    }
                },
                "lastUpdate": 0
            });

            index = this.symbols.length - 1;
        }


        this.symbols[index].buffer.min = ((this.symbols[index].buffer.min == 0) || (this.symbols[index].buffer.min > price)) ? price : this.symbols[index].buffer.min;
        this.symbols[index].buffer.max = ((this.symbols[index].buffer.max == 0) || (this.symbols[index].buffer.max < price)) ? price : this.symbols[index].buffer.max;
		this.symbols[index].buffer.volume += volume;
        


        if(this.symbols[index].filters.price.min15.min > price) {this.symbols[index].update = true; this.symbols[index].filters.price.min15.min = price; this.symbols[index].filters.price.min15.delta = Math.round((this.symbols[index].filters.price.min15.max / this.symbols[index].filters.price.min15.min - 1)*10000)/100;}
        if(this.symbols[index].filters.price.min15.max < price) {this.symbols[index].update = true; this.symbols[index].filters.price.min15.max = price; this.symbols[index].filters.price.min15.delta = Math.round((this.symbols[index].filters.price.min15.max / this.symbols[index].filters.price.min15.min - 1)*10000)/100;}

        if(this.symbols[index].filters.price.hour1.min > price) {this.symbols[index].update = true; this.symbols[index].filters.price.hour1.min = price; this.symbols[index].filters.price.hour1.delta = Math.round((this.symbols[index].filters.price.hour1.max / this.symbols[index].filters.price.hour1.min - 1)*10000)/100;}
        if(this.symbols[index].filters.price.hour1.max < price) {this.symbols[index].update = true; this.symbols[index].filters.price.hour1.max = price; this.symbols[index].filters.price.hour1.delta = Math.round((this.symbols[index].filters.price.hour1.max / this.symbols[index].filters.price.hour1.min - 1)*10000)/100;}







        if(this.step < (dateNow - this.symbols[index].lastUpdate)){
            this.symbols[index].data.unshift({
                "min": this.symbols[index].buffer.min,
                "max": this.symbols[index].buffer.max,
                "volume": this.symbols[index].buffer.volume
            });

            this.symbols[index].buffer.min = 0;
            this.symbols[index].buffer.max = 0;
            this.symbols[index].buffer.volume = 0;


            this.setData15min(index); this.setData1hour(index);
            

            this.symbols[index].update = true;
            this.symbols[index].lastUpdate = dateNow;
        }
    }


    getFilters(){
        return this.symbols.filter(object => object.update == true).map((object, i) => {
            this.symbols[i].update = false;
            return {
                symbol: object.symbol,
                filters: object.filters
            }
        })
    }

    getAlerts(symbol){
        let dateNow = new Date().getTime();

        let returnArray = {
            update: this.update,
            strategies: []
        };

        for (let i = 0; i < this.strategies.length; i++) {
            let indexInSymbols = this.symbols.findIndex(object => object.symbol == symbol);
           
            if((this.symbols[indexInSymbols].filters.volume.min15 >= this.strategies[i].volume.min15) && (this.symbols[indexInSymbols].filters.volume.hour1 >= this.strategies[i].volume.hour1) && (this.symbols[indexInSymbols].filters.price.min15.delta >= this.strategies[i].delta.min15) && (this.symbols[indexInSymbols].filters.price.hour1.delta >= this.strategies[i].delta.hour1)){
                let indexSymbolInStrategy = this.strategies[i].symbols.findIndex(object => object.symbol == this.symbols[indexInSymbols].symbol);
                console.log(this.strategies[i].symbols, this.symbols[indexInSymbols].symbol);
                if(indexSymbolInStrategy == -1){
                    this.strategies[i].symbols.push({
                        "symbol": this.symbols[indexInSymbols].symbol,
                        "update": dateNow
                    });
    
                    var audio = new Sound(this.strategies[i].sound.url, this.strategies[i].sound.volume, false);
                    audio.start();

                    returnArray.strategies.push({
                        "id": this.strategies[i].id,
                        "symbols": this.strategies[i].symbols
                    });
                }else{
                    if(this.strategies[i].symbols[indexSymbolInStrategy].update + this.strategies[i].timeout < dateNow) {
                        this.strategies[i].symbols.splice(indexSymbolInStrategy, 1);

                        returnArray.strategies.push({
                            "id": this.strategies[i].id,
                            "symbols": this.strategies[i].symbols
                        });
                    }
                }
            }
        }

        return returnArray;
    }










    addStrategy(object){
        object.id = this.strategies.length + 1;
        this.strategies.push(object);
        this.update     = true;
    }

    removeStrategy(id){
        this.strategies.splice(this.strategies.findIndex(object => object.id == id), 1);
        this.update     = true;
    }

    getStrategy(id){
        return this.strategies.find(object => object.id == id);
    }

    getStrategies(){
        this.update     = false;
        return this.strategies.map((object) => {
            return {
                "id": object.id,
                "name": object.name,
                "symbols": object.symbols
            }
        })
    }
    
}

function Sound(source, volume, loop){
    this.source = source;
    this.volume = volume;
    this.loop = loop;
    var son;
    this.son = son;
    this.finish = false;
    this.stop = function()
    {
        document.body.removeChild(this.son);
    }
    this.start = function()
    {
        if (this.finish) return false;
        this.son = document.createElement("embed");
        this.son.setAttribute("src", this.source);
        this.son.setAttribute("hidden", "true");
        this.son.setAttribute("volume", this.volume);
        this.son.setAttribute("autostart", "true");
        this.son.setAttribute("loop", this.loop);
        document.body.appendChild(this.son);
    }
    this.remove = function()
    {
        document.body.removeChild(this.son);
        this.finish = true;
    }
    this.init = function(volume, loop)
    {
        this.finish = false;
        this.volume = volume;
        this.loop = loop;
    }
}


