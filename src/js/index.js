
import {Chart} from "./chart/Chart.js";
import {ApiWithServer} from "./api.js";





let savedSymbols 	= [];  	// Saved Symbols
let activeSymbol 	= 'btcusdt';				// Symbol on the Chart
let viewOrderType 	= 'orders';					
let viewOrderTime 	= 'now';

let setSymbolMode   = 'set';



let orderValues   = [0, 0, 0, 0];


let order 			= 1000;
let leverage 		= 10;
let closePercent 	= 1;









let savedSymbolsContainer = document.getElementById("Terminal__SavedSymbols");
let setSymbolTable = document.getElementById("SetSymbol__TableContainer");
let signalSymbolsContainer = document.getElementById("Terminal__Strategies");










signalSymbolsContainer.addEventListener("click", (e) => {
	let addStrategy = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("strategy-block-add") != -1;
	});

	if(addStrategy!= undefined){
		document.getElementById("Strategy").classList.add("active");
		document.getElementById("StrategyInput__Actions").value = "new";

		document.getElementById("StrategyInput__Name").value 		= "";
		document.getElementById("StrategyInput__Timeout").value 	= 15;
		document.getElementById("StrategyInput__Delta15Min").value 	= 0;
		document.getElementById("StrategyInput__Delta1Hour").value 	= 0;
		document.getElementById("StrategyInput__Volume15Min").value = 0;
		document.getElementById("StrategyInput__Volume1Hour").value = 0;
	}

	let block = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("strategy-symbol ") != -1;
	});

	let symbol = (block != undefined) ? block.classList[1] : "";

	if(symbol != "") {
		let activeSymbolsList = chart.getRequestMode();

		if(!(activeSymbolsList.findIndex(object => object.toLowerCase() == symbol) != -1)) chart.setRequestMode(symbol);
		setActiveSymbol(symbol);
		if(!(chart.getViewMode())) chart.setViewMode();
		

		document.getElementById("Terminal__Setting__Mode__View__P").innerHTML = "Stright";
		return true;
	}
	


	let removeStrategy = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("strategy-remove-block-action ") != -1;
	});

	let removeId = (removeStrategy != undefined) ? removeStrategy.classList[1] : "";

	if(removeId != "") {
		chart.removeStrategy(Number(removeId));
	}


	let editStrategy = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("strategy-block-name ") != -1;
	});

	let id = (editStrategy != undefined) ? editStrategy.classList[1] : "";

	if(id != "") {
		document.getElementById("Strategy").classList.add("active");
		document.getElementById("StrategyInput__Actions").value = "edit";
		document.getElementById("StrategyInput__Id").value = id;

		let info = chart.getStrategy(id);

		document.getElementById("StrategyInput__Name").value 		= info.name;
		document.getElementById("StrategyInput__Timeout").value 	= info.timeout / 60 / 1000;
		document.getElementById("StrategyInput__Delta15Min").value 	= info.delta.min15;
		document.getElementById("StrategyInput__Delta1Hour").value 	= info.delta.hour1;
		document.getElementById("StrategyInput__Volume15Min").value = info.volume.min15;
		document.getElementById("StrategyInput__Volume1Hour").value = info.volume.hour1;
	}
});


document.getElementById("Strategy__Cancel").addEventListener("click", () => {
	document.getElementById("Strategy").classList.remove("active");
});

document.getElementById("Strategy__Save").addEventListener("click", () => {
	let type = document.getElementById("StrategyInput__Actions").value;

	if(type == "new"){
		chart.addStrategy({
            "name": document.getElementById("StrategyInput__Name").value, 
            "timeout": parseFloat(document.getElementById("StrategyInput__Timeout").value) * 60 * 1000,
            "delta": {
                "min15": parseFloat(document.getElementById("StrategyInput__Delta15Min").value),
                "hour1": parseFloat(document.getElementById("StrategyInput__Delta1Hour").value)
            },
            "volume":{
                "min15": parseFloat(document.getElementById("StrategyInput__Volume15Min").value),
                "hour1": parseFloat(document.getElementById("StrategyInput__Volume1Hour").value)
            },
            "sound": {
                "url": "./audio/test.mp3",
                "volume": 100
            },
            "symbols": []
        });

		viewStrategies();
		document.getElementById("Strategy").classList.remove("active");
	}

	if(type == "edit"){
		chart.removeStrategy(Number(document.getElementById("StrategyInput__Id").value));
		chart.addStrategy({
            "name": document.getElementById("StrategyInput__Name").value, 
            "timeout": parseFloat(document.getElementById("StrategyInput__Timeout").value) * 60 * 1000,
            "delta": {
                "min15": parseFloat(document.getElementById("StrategyInput__Delta15Min").value),
                "hour1": parseFloat(document.getElementById("StrategyInput__Delta1Hour").value)
            },
            "volume":{
                "min15": parseFloat(document.getElementById("StrategyInput__Volume15Min").value),
                "hour1": parseFloat(document.getElementById("StrategyInput__Volume1Hour").value)
            },
            "sound": {
                "url": "./audio/test.mp3",
                "volume": 100
            },
            "symbols": []
        });

		viewStrategies();
		document.getElementById("Strategy").classList.remove("active");
	}
});



// Saved Symbols Actions 

savedSymbolsContainer.addEventListener("click", (e) => {

	//
	// Add Saved Symbol
	//

	let issetAdd = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("savedSymbol__add") != -1;
	});

	if(issetAdd != undefined){
		setTypeSymbolSave();
		return true;
	}



	//
	// Remove Saved Symbol
	//

	let issetRemove = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("savedSymbol__block__close") != -1;
	});

	if(issetRemove != undefined){
		removeSavedSymbol(issetRemove.classList[1].toUpperCase())
		return true;
	}




	//
	// Set Symbol
	//

	let block = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("savedSymbol__block ") != -1;
	});

	let symbol = (block != undefined) ? block.classList[1] : "";

	if(symbol != "") {
		setActiveSymbol(symbol);
		return true;
	}
});




//
// Hover Saved Symbol
//

savedSymbolsContainer.addEventListener("mouseover", (e) => {
	let block = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("savedSymbol__block ") != -1;
	});

	let symbol = (block != undefined) ? block.classList[1] : "";
});

savedSymbolsContainer.addEventListener("mouseout", (e) => {
	let block = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("savedSymbol__block ") != -1;
	});

	let symbol = (block != undefined) ? block.classList[1] : "";
});




// Set Symbol

setSymbolTable.addEventListener("click", (e) => {
	let issetSymbol = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("setSymbol__symbol__block ") != -1;
	});

	if(issetSymbol != undefined){
		console.log(setSymbolMode);
		if(setSymbolMode == 'set'){
			setActiveSymbol(issetSymbol.classList[1]);
		}

		if(setSymbolMode == 'save'){
			addSavedSymbol(issetSymbol.classList[1]);
			setActiveSymbol(issetSymbol.classList[1]);
		}

		closeSetSymbol();
		return true;
	}



	let issetMode = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("setSymbol__mode__block ") != -1;
	});

	if(issetMode != undefined){
		chart.setRequestMode(issetMode.classList[1]);
		viewSymbolsForSet();
		return true;
	}
});



function viewSymbolsForSet(){
	let symbolsList = chart.getSymbols();
	let activeSymbolsList = chart.getRequestMode();

	setSymbolTable.innerHTML = "";
	console.log(symbolsList);

	for (var i = 0; i < symbolsList.length; i++) {
		
		setSymbolTable.innerHTML += '\
		 	<div class="setSymbol__block">\
                <div class="setSymbol__symbol__block ' + symbolsList[i].symbol + '">\
                    <div class="setSymbol__text setSymbol__symbol">\
                        <p>' + symbolsList[i].symbol.toUpperCase() + '</p>\
                    </div>\
                    <div class="setSymbol__text setSymbol__price">\
                        <p>' + symbolsList[i].price + ' USDT</p>\
                    </div>\
                    <div class="setSymbol__text setSymbol__volume">\
                        <p>' + (Math.round(symbolsList[i].volume/ 100) * 100) + ' USDT</p>\
                    </div>\
					<div class="setSymbol__text setSymbol__delta">\
                        <p>' + symbolsList[i].priceDelta15 + ' %</p>\
                    </div>\
                    <div class="setSymbol__text setSymbol__delta">\
                        <p>' + symbolsList[i].priceDelta60 + ' %</p>\
                    </div>\
                </div>\
                <div class="setSymbol__mode__block ' + symbolsList[i].symbol + '">\
                    <div class="setSymbol__text">\
                        <p>' + ((activeSymbolsList.find(object => object == symbolsList[i].symbol) != undefined) ? "Active" : "Sleep") + '</p>\
                    </div>\
                </div>\
                \
            </div>\
		';
	}
}




function openSetSymbol(){
	document.getElementById("SetSymbol").classList.add("active");
	viewSymbolsForSet();
}

function closeSetSymbol(){
	document.getElementById("SetSymbol").classList.remove("active");
}

function setTypeSymbolSave(){
	setSymbolMode = 'save';
	openSetSymbol();
}

function setTypeSymbolSet(){
	setSymbolMode = 'set';
	openSetSymbol();
}

document.getElementById("chart__symbol").addEventListener("click", () => {
	setTypeSymbolSet()
});







function removeSavedSymbol(symbol){
	console.log(symbol);
	savedSymbols.splice(savedSymbols.findIndex(object => object == symbol),1);
	viewSavedSymbols();

}

function addSavedSymbol(symbol){
	savedSymbols.push(symbol.toUpperCase());
	viewSavedSymbols();
}


function setActiveSymbol(symbol){
	chart.setSymbol(symbol); activeSymbol = symbol;
	viewSavedSymbols(); let activeSymbolsList = chart.getRequestMode();

	document.getElementById("Terminal__Setting__Mode__Request__P").innerHTML = (activeSymbolsList.findIndex(object => object.toLowerCase() == activeSymbol) != -1) ? "Active" : "Sleep";
	document.getElementById("Terminal__Setting__Order__Leverage__Input").value = chart.getLeverage();
}






function viewSavedSymbols(){

	ApiWithServer.setSavedSymbols(savedSymbols);
	savedSymbolsContainer.innerHTML = "";


	for (var i = 0; i < savedSymbols.length; i++) {
		savedSymbolsContainer.innerHTML += '										\
			<div class="savedSymbol__block ' + savedSymbols[i].toLowerCase() + '">	\
		        <div class="savedSymbol__block__leftElement ' + ((savedSymbols[i].toLowerCase() == activeSymbol) ? "active" : "") +  '"></div>				\
		        <div class="savedSymbol__block__leftElement__radius"></div>			\
		        <div class="savedSymbol__symbol ' + ((savedSymbols[i].toLowerCase() == activeSymbol) ? "active" : "") +  '">								\
		            <p>' + savedSymbols[i] + '</p>									\
		        </div>																\
		        <div class="savedSymbol__block__rightElement ' + ((savedSymbols[i].toLowerCase() == activeSymbol) ? "active" : "") +  '"></div>			\
		        <div class="savedSymbol__block__rightElement__radius" ></div>		\
		        <div class="savedSymbol__block__close ' + savedSymbols[i].toLowerCase() + ' icon close-icon"></div>		\
		    </div>																	\
		';
	}

	savedSymbolsContainer.innerHTML += '		\
		<div class="savedSymbol__add" onclick="setTypeSymbolSave()">			\
        	<div class="icon add-icon"></div>	\
    	</div>									\
    ';
}





function setViewOrderType(type) {
	let limitBlock = document.getElementById("Terminal__Orders__Type__Limit");
	let ordersBlock = document.getElementById("Terminal__Orders__Type__Orders");
	let tpBlock = document.getElementById("Terminal__Orders__Type__TP");
	let slBlock = document.getElementById("Terminal__Orders__Type__SL");


	limitBlock.classList.remove("active"); ordersBlock.classList.remove("active"); tpBlock.classList.remove("active"); slBlock.classList.remove("active");


	if(type == "limit") limitBlock.classList.add("active");
	if(type == "orders") ordersBlock.classList.add("active");
	if(type == "tp") tpBlock.classList.add("active");
	if(type == "sl") slBlock.classList.add("active");

	viewOrderType = type;
}


document.getElementById("Terminal__Orders__Type").addEventListener("click", (e) => {
	let issetLimit = e.path.find(object => {return (object.id == "Terminal__Orders__Type__Limit")});

	if(issetLimit != undefined){
		setViewOrderType('limit')
		return true;
	}


	let issetOrder = e.path.find(object => {return (object.id == "Terminal__Orders__Type__Orders")});

	if(issetOrder != undefined){
		setViewOrderType('orders')
		return true;
	}


	let issetSL = e.path.find(object => {return (object.id == "Terminal__Orders__Type__SL")});

	if(issetSL != undefined){
		setViewOrderType('sl')
		return true;
	}



	let issetTP = e.path.find(object => {return (object.id == "Terminal__Orders__Type__TP")});

	if(issetTP != undefined){
		setViewOrderType('tp')
		return true;
	}
});





function setViewOrderTime(type) {
	let historyBlock = document.getElementById("Terminal__Orders__Time__History");
	let nowBlock = document.getElementById("Terminal__Orders__Time__Now");


	historyBlock.classList.remove("active"); nowBlock.classList.remove("active");


	if(type == "now") nowBlock.classList.add("active");
	if(type == "history") historyBlock.classList.add("active");

	viewOrderType = type;
}

function setClosePercent(closePercentSet){
	let block = document.getElementById("Terminal__Setting__Order__Close__1");
	let blockHalf = document.getElementById("Terminal__Setting__Order__Close__1/2");
	let blockQuarter = document.getElementById("Terminal__Setting__Order__Close__1/4");


	block.classList.remove("active"); blockHalf.classList.remove("active"); blockQuarter.classList.remove("active");


	if(closePercentSet == 1) block.classList.add("active");
	if(closePercentSet == 0.5) blockHalf.classList.add("active");
	if(closePercentSet == 0.25) blockQuarter.classList.add("active");

	closePercent = closePercentSet;
	chart.setClosePercent(closePercentSet);
}


document.getElementById("Terminal__Setting__Order__Close").addEventListener("click", (e) => {
	let isset1 = e.path.find(object => {return (object.id == "Terminal__Setting__Order__Close__1")});

	if(isset1 != undefined){
		setClosePercent(1);
		return true;
	}


	let isset2 = e.path.find(object => {return (object.id == "Terminal__Setting__Order__Close__1/2")});

	if(isset2 != undefined){
		setClosePercent(0.5);
		return true;
	}


	let isset3 = e.path.find(object => {return (object.id == "Terminal__Setting__Order__Close__1/4")});

	if(isset3 != undefined){
		setClosePercent(0.25);
		return true;
	}

});




function viewOrderValues(){
	document.getElementById("Terminal__Setting__Order__Order_1P").innerHTML = "$" + orderValues[0];
	document.getElementById("Terminal__Setting__Order__Order_2P").innerHTML = "$" + orderValues[1];
	document.getElementById("Terminal__Setting__Order__Order_3P").innerHTML = "$" + orderValues[2];
	document.getElementById("Terminal__Setting__Order__Order_4P").innerHTML = "$" + orderValues[3];

	ApiWithServer.setOrders(orderValues);
}


function setOrderValue(index){
	let block1 = document.getElementById("Terminal__Setting__Order__Order_1");
	let block2 = document.getElementById("Terminal__Setting__Order__Order_2");
	let block3 = document.getElementById("Terminal__Setting__Order__Order_3");
	let block4 = document.getElementById("Terminal__Setting__Order__Order_4");


	block1.classList.remove("active"); block2.classList.remove("active"); block3.classList.remove("active"); block4.classList.remove("active");


	if(index == 0) block1.classList.add("active");
	if(index == 1) block2.classList.add("active");
	if(index == 2) block3.classList.add("active");
	if(index == 3) block4.classList.add("active");

	order = orderValues[index];
	chart.setOrder(orderValues[index]);
}


document.getElementById("Terminal__Setting__Order__Options").addEventListener("click", (e) => {
	let isset1 = e.path.find(object => {return (object.id == "Terminal__Setting__Order__Order_1")});

	if(isset1 != undefined){
		setOrderValue(0);
		return true;
	}


	let isset2 = e.path.find(object => {return (object.id == "Terminal__Setting__Order__Order_2")});

	if(isset2 != undefined){
		setOrderValue(1);
		return true;
	}


	let isset3 = e.path.find(object => {return (object.id == "Terminal__Setting__Order__Order_3")});

	if(isset3 != undefined){
		setOrderValue(2);
		return true;
	}



	let isset4 = e.path.find(object => {return (object.id == "Terminal__Setting__Order__Order_4")});

	if(isset4 != undefined){
		setOrderValue(3);
		return true;
	}
});






document.getElementById("Terminal__Setting__Order__Order_Edit").addEventListener("click", () => {
	document.getElementById("Terminal__Setting__Order__Options").classList.remove("view");
	document.getElementById("Terminal__Setting__Order__Set").classList.add("view");

	document.getElementById('Terminal__Setting__Order__Set__Block__Input1').value = orderValues[0];
	document.getElementById('Terminal__Setting__Order__Set__Block__Input2').value = orderValues[1];
	document.getElementById('Terminal__Setting__Order__Set__Block__Input3').value = orderValues[2];
	document.getElementById('Terminal__Setting__Order__Set__Block__Input4').value = orderValues[3];
});


document.getElementById("Terminal__Setting__Order__Set_Sumbit").addEventListener("click", () => {
	document.getElementById("Terminal__Setting__Order__Options").classList.add("view");
	document.getElementById("Terminal__Setting__Order__Set").classList.remove("view");

	orderValues[0] = document.getElementById('Terminal__Setting__Order__Set__Block__Input1').value;
	orderValues[1] = document.getElementById('Terminal__Setting__Order__Set__Block__Input2').value;
	orderValues[2] = document.getElementById('Terminal__Setting__Order__Set__Block__Input3').value;
	orderValues[3] = document.getElementById('Terminal__Setting__Order__Set__Block__Input4').value;

	viewOrderValues();
});




document.getElementById("Terminal__Setting__Mode__View").addEventListener("click", () => {
	chart.setViewMode();
	document.getElementById("Terminal__Setting__Mode__View__P").innerHTML = (chart.getViewMode()) ? "Stright" : "Merge";
});

document.getElementById("Terminal__Setting__Mode__Request").addEventListener("click", () => {
	chart.setRequestMode(activeSymbol); let activeSymbolsList = chart.getRequestMode();
	document.getElementById("Terminal__Setting__Mode__Request__P").innerHTML = (activeSymbolsList.findIndex(object => object.toLowerCase() == activeSymbol) != -1) ? "Active" : "Sleep";
});

document.getElementById("Terminal__Setting__Order__Leverage__Input").addEventListener("change", (e) => {
	chart.setLeverage(e.target.value);
	document.getElementById("Terminal__Setting__Order__Leverage__Input").value = chart.getLeverage();
});











document.getElementById("Terminal__Orders__Container").addEventListener("click", (e) => {
	let isset = e.path.find(object => {
		if(object.classList == undefined) return false
		if(object.classList.length == 0) return false;
		return object.classList.value.search("order-block order-remove ") != -1;
	});

	if(isset != undefined){
		if(viewOrderType == 'limit'){
			chart.cancelLimit(isset.classList[2]);
		}

		if(viewOrderType == 'orders'){
			chart.closePositions(isset.classList[2]);
		}

		if(viewOrderType == 'tp'){
			chart.cancelCloseLimit(isset.classList[2]);
		}

		if(viewOrderType == 'sl'){
			chart.cancelStoploss(isset.classList[2]);
		}
		
		return true;
	}
});


let lastObjectOrders = "[]";
let lastObjectOrdersAll = "[]";

function viewOrders(){
	let newOrders = chart.getAllOrders();
	let block  = document.getElementById("Terminal__Orders__Container");
	let orders = chart.getOrders(viewOrderType)

	if((lastObjectOrdersAll != JSON.stringify(newOrders)) || (lastObjectOrders != JSON.stringify(orders))){
		lastObjectOrdersAll = JSON.stringify(newOrders);
		lastObjectOrders    = JSON.stringify(orders);
		ApiWithServer.setOpenOrders(newOrders);
		
		
		
		if(orders.length == 0){
			block.innerHTML = '\
					<div id="Terminal__Orders__None">\
						<p>You have no orders now</p>\
					</div>\
			';
			return true;
		}

		let text = '';


		text = '						<div id="Terminal__Orders__Container__AllOrders">';
		text += '							<div class="orders-table orders-table-title">';
		text += '								<div class="order-block order-block-title order-number"><p>#</p></div>';
		text += '								<div class="order-block order-block-title order-symbol"><p>Symbol</p></div>';
		text += ((orders[0].blockedBalance) ? ('<div class="order-block order-block-title order-margin"><p>Margin</p></div>') : '');
		text += ((orders[0].order) 			? ('<div class="order-block order-block-title order-order"><p>Order</p></div>') : '');
		text += ((orders[0].quantity) 		? ('<div class="order-block order-block-title order-quantity"><p>Quantity</p></div>') : '');
		text += '								<div class="order-block order-block-title order-type"><p>Type</p></div>';		
		text += ((orders[0].price) 			? ('<div class="order-block order-block-title order-price"><p>Price</p></div>') : '');
		text += ((orders[0].profit) 		? ('<div class="order-block order-block-title order-profit"><p>Profit</p></div>') : '');
		text += '							</div>';

		for (var i = 0; i < orders.length; i++) {
			text += '							<div class="orders-table">';
			text += '								<div class="order-block order-number"><p>' + i + '</p></div>';
			text += '								<div class="order-block order-symbol"><p>' + orders[i].symbol.toUpperCase() + '</p></div>';
			text += ((orders[i].blockedBalance) ? ('<div class="order-block order-margin"><p>' + (Math.round(orders[i].blockedBalance * 100) / 100) + ' USDT</p></div>') : '');
			text += ((orders[i].order) ? ('			<div class="order-block order-order"><p>' + (Math.round(orders[i].order * 100) / 100) + '  USDT</p></div>') : '');
			text += ((orders[i].quantity) ? ('		<div class="order-block order-quantity"><p>' + orders[i].quantity.toString().substr(0, 6) + '</p></div>') : '');
			text += '								<div class="order-block order-type"><p>' + orders[i].type + '</p></div>';
			text += ((orders[i].price) ? ('			<div class="order-block order-price"><p>' + orders[i].price + '  USDT</p></div>') : '');
			text += ((orders[i].profit) ? ('		<div class="order-block order-profit"><p>' + orders[i].profit + '</p></div>') : '');
			text += '								<div class="order-block order-remove ' + orders[i].id + '"><div class="icon remove-icon"></div></div>';
			text += '							</div>';
		}


		text += '</div>';

		block.innerHTML = text;
	}
}



let lastObjectStrategies = "";

function viewStrategies(){
	
	let strategies = chart.getStrategies();
	let block  = document.getElementById("Terminal__Strategies");
	if(lastObjectStrategies != JSON.stringify(strategies)){
		ApiWithServer.setStrategies(chart.getStrategiesFull());
		let text = '';

		

		if(strategies.length == 0){
			text += "<div class='strategy-block'>";
			text += "	<div class='strategy-block-add'>";
			text += "		<p>Add strategy</p>";
			text += "	</div>"
			text += "</div>";
			text += "<div class='strategy-symbols'>";
			text += "	<div id='Terminal__Orders__None'>"
			text += "		<p>You have no strategies</p>"
			text += "	</div>"
			text += "</div>";

			block.innerHTML = text;
			lastObjectStrategies = JSON.stringify(strategies);
			return true;
		}
	
		text += "<div class='strategy-block'>";
		for (let i = 0; i < strategies.length; i++) {
			text += "	<div class='strategy-block-name " + strategies[i].id + "'>";
			text += "		<p>" + strategies[i].name + "</p>";
			text += "	</div>";
		}

		text += "	<div class='strategy-block-add'>";
		text += "		<p>Add strategy</p>";
		text += "	</div>";

		text += "</div>";

		text += "<div class='strategy-remove-block'>";
		for (let i = 0; i < strategies.length; i++) {
			text += "	<div class='strategy-remove-block-action " + strategies[i].id + "'>";
			text += "		<div class='icon remove-icon'></div>";
			text += "	</div>";
		}
		text += "</div>";

		text += "<div class='strategy-symbols'>";
		for (let i = 0; i < strategies.length; i++) {
			console.log(strategies[i]);
			for (let i2 = 0; i2 < strategies[i].symbols.length; i2++) {
				text += "	<div class='strategy-symbol " + strategies[i].symbols[i2].symbol + "'>";
				text += "		<p>" + strategies[i].symbols[i2].symbol + "</p>";
				text += "	</div>";
			}
		}
		text += "</div>";
	
		block.innerHTML = text;
		lastObjectStrategies = JSON.stringify(strategies);
	}
	
}




function addStrategies(objects){
	for (let i = 0; i < objects.length; i++) {
		chart.addStrategy(objects[i]);
	}
}









let chart;

async function startTerminal(){

	let object = await ApiWithServer.getConfig();
	let config = object.config;

	chart = new Chart(config);

	chart.setAllOrders(object.openOrders);

	

	orderValues = config.savedInfo.orders;
	savedSymbols = config.savedInfo.symbols;

	viewSavedSymbols();
	viewOrderValues();

	addStrategies(config.savedInfo.strategies);

	let viewFirstLeverage = true;

	let lastBalance = 0;

	setInterval(() => {
		if(lastBalance != chart.getBalance()){lastBalance = chart.getBalance(); ApiWithServer.setBalance(chart.getBalance())}
		document.getElementById("Terminal__Info__Params__Ping").innerHTML 	= "Ping: " 			+ chart.getPing() 	+ "ms";
		document.getElementById("Terminal__Info__Params__Render").innerHTML = "Render: " 		+ chart.getRender() + "ms";
		document.getElementById("Terminal__Info__Params__Items").innerHTML = "Items: " 			+ chart.getItems();
		document.getElementById("Terminal__Info__Params__InternalScale").innerHTML = "Internal Scale: " + chart.getScale();
		document.getElementById("Terminal__Info__Params__Scale").innerHTML = "Scale: " + chart.getFactScale() + "%";

		document.getElementById("Terminal__Setting__Order__Balance__P").innerHTML = "Balance: " + Math.round(chart.getBalance() * 100) / 100 + " USDT";

		document.getElementById("chart__symbol-text").innerHTML = chart.getSymbol();

		viewOrders();
		viewStrategies();

		if(viewFirstLeverage) {
			let leverage = chart.getLeverage();

			if(leverage != -1){
				document.getElementById("Terminal__Setting__Order__Leverage__Input").value = leverage;
				viewFirstLeverage = false;
			}
		}
	}, 100);
}





startTerminal();






