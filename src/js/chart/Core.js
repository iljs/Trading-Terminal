import {CanvasMap} from "./CanvasMap.js";
import {CanvasMapChart }from "./CanvasMapChart.js";
import {OrderManager} from "./OrderManager.js";

export class Core{
	constructor(object){
		//this.price 		  = object.price;
		//this.timeFrame 	  = object.timeFrame;
		this.container_id 	= object.container_id;
		this.null 			= object.null;

		this.orderManager = new OrderManager();
		//

		if(object.terminalInfo.terminalMode == "emulator") this.orderManager.initEmulator(object.terminalInfo.balance);
		if(object.terminalInfo.terminalMode == "binance") this.orderManager.initBinance(object.terminalInfo.keys);
	}

	init(){
		this.container 			= document.getElementById(this.container_id);

		this.mousePosition 		= {"x": 0, 	 "y": 0};
		this.moveStart 	   		= {"x": 0, 	 "y": 0};
		this.scale 		   		= {"x": 1, 	 "y": 1};
		this.move 		   		= {"x": 0, 	 "y": 0};
		this.scaleStep 	   		= {"x": 0.05, "y": 0.05};
		this.lastStep 	   		= {"x": 1, 	 "y": 1};
		this.scaleIndex 		= 0;
		this.symbol 	   		= "";
		this.data 				= [];

		this.mapMoving 			= true;
		this.mapMovingObject 	= {"type": "", "id": -1, "internalId": -1};
		this.mapMovingObjectNow = false;

		this.limit 				= [];
		this.orders 			= [];
		this.close 				= [];
		this.stopLoss 			= [];

		this.lastUpdateOrders 	= 0;

		this.delitel 			= 0;
		this.maxVolume 			= 0;
		
		this.price 				= 0;

		this.order 				= 1000;
		this.percent 			= 1;

		this.cursorLinesX  		= -1;
		this.cursorLinesY  		= -1;

		this.cursorPrice  		= -1;
		this.cursorDate  		= -1;

		this.cursorLineOrder  	= -1;
		this.cursorTextOrder  	= -1;

		this.priceLineId 		= -1;
		this.textPriceMarkId 	= -1;

		this.factScale 			= 0;

		this.canvases = {
			"chartPrice": new CanvasMap({
				"container_id": "chart__price",
				"controller": "default",
				"style": {
					"background": "#0c142c",
					"cursor": "n-resize"
				},
				"scale": {
					"value": {
						"x": 1,
						"y": 1
					},
					"switch": {
						"x": false,
						"y": true
					},
					"step": {
						"x": 0.05,
						"y": 0.05
					}
				},
				"move": {
					"value": {
						"x": 0,
						"y": 0
					},
					"switch": {
						"x": false,
						"y": true
					}
				},
				"circles": [],
				"objects": []
			}),
			"chartContainer": new CanvasMapChart({
				"container_id": "chart__container",
				"controller": "default",
				"style": {
					"background": "#0c142c",
					"cursor": "crosshair"
				},
				"scale": {
					"value": {
						"x": 1,
						"y": 1
					},
					"switch": {
						"x": true,
						"y": true
					},
					"step": {
						"x": 0.05,
						"y": 0.05
					}
				},
				"move": {
					"value": {
						"x": 0,
						"y": 0
					},
					"switch": {
						"x": true,
						"y": true
					}
				},
				"chartObjects": [],
				"objects":[]
			}),
			
			"chartOrderBook": new CanvasMap({
				"container_id": "chart__order-book",
				"controller": "default",
				"style": {
					"background": "#0c142c",
					"cursor": "crosshair"
				},
				"scale": {
					"value": {
						"x": 1,
						"y": 1
					},
					"switch": {
						"x": false,
						"y": true
					},
					"step": {
						"x": 0.05,
						"y": 0.05
					}
				},
				"move": {
					"value": {
						"x": 0,
						"y": 0
					},
					"switch": {
						"x": false,
						"y": true
					}
				},
				"circles": [],
				"objects": []
			}),
			"chartDate": new CanvasMap({
				"container_id": "chart__date",
				"controller": "default",
				"style": {
					"background": "#0c142c",
					"cursor": "e-resize"
				},
				"scale": {
					"value": {
						"x": 1,
						"y": 1
					},
					"switch": {
						"x": true,
						"y": false
					},
					"step": {
						"x": 0.05,
						"y": 0.05
					}
				},
				"move": {
					"value": {
						"x": 0,
						"y": 0
					},
					"switch": {
						"x": true,
						"y": false
					}
				},
				"circles": [],
				"objects": []
			})
		}

		this.canvases.chartPrice.init();
		this.canvases.chartContainer.init();
		this.canvases.chartOrderBook.init();
		this.canvases.chartDate.init();

		this.controllerManager();
		this.listnersHandle();
		this.listeners();

		//this.orderManager = new OrderManager();
		//this.orderManager.initEmulator();
		//this.orderManager.initBinance();

		//this.data = new Data();
		//this.data.init();

		//this.data.addSymbol("btcusdt");
		//this.data.active.symbol = "btcusdt";


		//this.requests = new Requests();
		//this.requests.init();
		//this.requestManager();
		
	}


	chartCirclesDrow(object, delay, now, scaleIndex, push){
		setTimeout(() => {
			if(object == undefined) return false;
			if(scaleIndex != this.scaleIndex) return false;

			object.time = (object.date - this.null) / 300;

			this.price = object.price;

			let coordinateY = object.price / this.delitel;
			if(!push){
				this.canvases.chartContainer.addChartObjectUnshift = {
					"type": 'circle',
					"color": (object.type == "up") ? "#02EB5F" : "#D61E40",
					"coordinates": {
						"x": object.time,
						"y": coordinateY
					},
					"radius": 4,
					"typePoint": object.typePoint
				};
			}

			if(push){
				this.canvases.chartContainer.addChartObjectPush = {
					"type": 'circle',
					"color": (object.type == "up") ? "#02EB5F" : "#D61E40",
					"coordinates": {
						"x": object.time,
						"y": coordinateY
					},
					"radius": 4,
					"typePoint": object.typePoint
				};
			}

			if(now) this.setPriceNow(coordinateY, object.price);
			//this.emulator.updatePrice(object.price, this.symbol);

			//this.limitLines();
			//this.orderLines();
			//this.closeLines();
		}, delay);
	}

	chartRectDrow(object, delay, now, scaleIndex, push){
		setTimeout(() => {
			if(object == undefined) return false;
			if(scaleIndex != this.scaleIndex) return false;

			object.time = (object.date - this.null) / 300;

			if(!push){
				this.canvases.chartContainer.addChartObjectUnshift = {
					"type": 'rect',
					"color": (object.type == "up") ? "#02EB5F" : "#D61E40",
					"coordinates": {
						"x": object.time,
						"y": 0
					},
					"side": { 
						"x": 1,
						"y": object.volume / (this.maxVolume / 100)
					},
					"typePoint": object.typePoint
				};
			}

			if(push){
				this.canvases.chartContainer.addChartObjectPush = {
					"type": 'rect',
					"color": (object.type == "up") ? "#02EB5F" : "#D61E40",
					"coordinates": {
						"x": object.time,
						"y": 0
					},
					"side": { 
						"x": 1,
						"y": object.volume / (this.maxVolume / 100)
					},
					"typePoint": object.typePoint
				};
			}
		}, delay);
	}




	chartDepth(asks, bids){
		let height = this.canvases.chartContainer.canvas.height; 

		let bottom = parseFloat(((this.move.y + height - 0 / this.scale.y)* this.delitel).toString().substr(0, 9)); 
		let top = parseFloat(((this.move.y + height - height / this.scale.y)* this.delitel).toString().substr(0, 9));

		let sortAsks = asks.filter(object => (bottom > object[0]) && (top < object[0])); let sortBids = bids.filter(object => (bottom > object[0]) && (top < object[0]));
		let sumAsks = 0; let sumBids = 0;

		let asksAfter = []; let bidsAfter = [];

		for (let ia1 = 0; ia1 < sortAsks.length; ia1++) {
			sumAsks += sortAsks[ia1][1];
			asksAfter.push([sortAsks[ia1][0], sortAsks[ia1][1], sumAsks]);
		}

		for (let ib1 = 0; ib1 < sortBids.length; ib1++) {
			sumBids += sortBids[ib1][1];
			bidsAfter.push([sortBids[ib1][0], sortBids[ib1][1], sumBids]);
		}
		


		let asksPolygon = this.getPolygonObject();
		let bidsPolygon = this.getPolygonObject();

		bidsPolygon.color = 'green';

		let maxSum = (sumAsks < sumBids) ? sumBids : sumAsks;

		

		for (let i = 0; i < asksAfter.length; i++) {
			if(i == 0){
				asksPolygon.points.push({
					"x": 250 - (250 * (asksAfter[i][2] / maxSum)),
					"y": asksAfter[i][0] / this.delitel
				});
				asksPolygon.points.push({
					"x": 250,
					"y": asksAfter[i][0] / this.delitel
				});
			}else{
				asksPolygon.points.splice(i, 0, {
					"x": 250 - (250 * (asksAfter[i][2] / maxSum)),
					"y": asksAfter[i][0] / this.delitel
				});
				asksPolygon.points.splice(i+1, 0, {
					"x": 250,
					"y": asksAfter[i][0] / this.delitel
				});
			}
		}

		for (let i = 0; i < bidsAfter.length; i++) {
			if(i == 0){
				bidsPolygon.points.push({
					"x": 250 - (250 * (bidsAfter[i][2] / maxSum)),
					"y": bidsAfter[i][0] / this.delitel
				});
				bidsPolygon.points.push({
					"x": 250,
					"y": bidsAfter[i][0] / this.delitel
				});
			}else{
				bidsPolygon.points.splice(i, 0, {
					"x": 250 - (250 * (bidsAfter[i][2] / maxSum)),
					"y": bidsAfter[i][0] / this.delitel
				});
				bidsPolygon.points.splice(i+1, 0, {
					"x": 250,
					"y": bidsAfter[i][0] / this.delitel
				});
			}
		}

		this.canvases.chartOrderBook.setAllObjects = [asksPolygon, bidsPolygon];
		
		return true;
	}




	getCircleObject(object){
		object.time = (object.date - this.null) / 300; let coordinateY = object.price / this.delitel;

		return {
			"type": 'circle',
			"color": (object.type == "up") ? "#02EB5F" : "#D61E40",
			"coordinates": {
				"x": object.time,
				"y": coordinateY
			},
			"coordinatesData": [object.time - 4, coordinateY - 4, 4*2, 4*2],
			"radius": 4,
			"typePoint": object.typePoint
		}
	}

	getRectObject(object){
		object.time = (object.date - this.null) / 300;

		return {
			"type": 'rect',
			"color": (object.type == "up") ? "#02EB5F" : "#D61E40",
			"coordinates": {
				"x": object.time,
				"y": 0
			},
			"side": { 
				"x": 1,
				"y": object.volume / (this.maxVolume / 100)
			},
			"typePoint": object.typePoint
		}
	}

	setCirclesChart(object){
		let circles = [];
		let rects 	= [];

		for (let i = 0; i < object.length; i++) {
			circles.push(this.getCircleObject(object[i]));
			rects.push(this.getRectObject(object[i]));
		}

		this.canvases.chartContainer.chartCircles = circles;
		this.canvases.chartContainer.chartRects = rects;
	}






	removeStrightPoints(){
		let circles = this.canvases.chartContainer.chartCircles;
		let rects = this.canvases.chartContainer.chartRects;

		for (var i = 0; i < circles.length; i++) {
			if(circles[i].typePoint == "straight") this.canvases.chartContainer.removeChartCircles = i;
		}
		for (var i = 0; i < rects.length; i++) {
			if(rects[i].typePoint == "straight") this.canvases.chartContainer.removeChartRects = i;
		}

	}


	scaleManager(newScale){
		if(this.scaleIndex == this.getScaleIndex()) return false;
		this.scaleIndex = this.getScaleIndex();

		//this.canvases.chartContainer.chartCircles = []; this.canvases.chartContainer.chartRects = [];
		
		let chartData = this.getData();
		this.maxVolume = Math.max.apply(null, chartData.map((object) => object.volume));

		this.setCirclesChart(chartData);
	}

	startSymbol(price, now){
		this.delitel = price * 0.00001;

		let time = (now - this.null) / 300;

		let width = this.canvases.chartContainer.canvas.width; let height = this.canvases.chartContainer.canvas.height;


		this.move.x = 0; this.move.y = 0;

		this.chartContainer.moveMap({"x": - time + (width/2),"y": (price / this.delitel) - (height/2)});

		this.scaleIndex = 0;
		this.maxVolume = 0;

		this.priceCanvasManager(this.scale.y);
		this.dateCanvasManager(this.scale.x);
		this.scaleManager(this.scale.y);

		let coordinateY = price / this.delitel; let moveX = this.move.x; let scaleX = this.scale.x;


		if(this.priceLineId == -1){
			this.priceLineId = this.canvases.chartContainer.addDynemicObjectFunction({
				"type": 'line',
				"color": '#bababa',
				"coordinates": [
					{
						"x": Math.round(moveX - 3000/scaleX),
						"y": coordinateY
					},
					{
						"x": Math.round(moveX + width/scaleX + 3000/scaleX),
						"y": coordinateY
					},
				]
			});
		}
		if(this.textPriceMarkId == -1){
			this.textPriceMarkId = this.canvases.chartPrice.addDynemicObjectFunction({
				"type": 'text',
				"color": 'white',
				"isScale": false,
				"isFixed": false,
				"fontFamily": "Montserrat",
				"text": price.toString().substr(0, 9),
				"size": 12,
				"coordinates": {
					"x": 20,
					"y": coordinateY + 6
				}
			})
		}
	}

	updater(result){
		if (this.delitel == 0) { 
			this.startSymbol(result.price, result.now);
		}

		if(result.volume > this.maxVolume){
			let chartData = this.getData(); this.maxVolume = Math.max.apply(null, chartData.map((object) => object.volume)); this.canvases.chartContainer.chartRects = [];
			for (var i = 0; i < chartData.length; i++) this.chartRectDrow(chartData[i], i*4, false, this.scaleIndex, true);
		}

		this.chartCirclesDrow(result, 0, true, this.scaleIndex);
		this.chartRectDrow(result, 0, true, this.scaleIndex);

		this.limitLines();
		this.orderLines();
		this.closeLines();
		this.stopLossLines();
	}

	limitLines(){
		let width = this.canvases.chartContainer.canvas.width; 

		let limitsFact = JSON.parse(JSON.stringify(this.orderManager.getLimitOrders(this.symbol)));
		let limitsDrow = JSON.parse(JSON.stringify(this.limit));

		let listFromRemove = [];

		for (var i = limitsFact.length - 1; i >= 0; i--) {
			for (var i2 = limitsDrow.length - 1; i2 >= 0; i2--) {
				if(limitsFact[i].id == limitsDrow[i2][0]){
					listFromRemove.push([i, i2]);
				}
			}
		}

		for (var i3 = 0; i3 < listFromRemove.length; i3++) {
			limitsFact.splice(listFromRemove[i3][0], 1); limitsDrow.splice(listFromRemove[i3][1], 1);
		}
	

		for (var i4 = 0; i4 < limitsDrow.length; i4++) {
			let lineId = limitsDrow[i4][1];
			let textId = limitsDrow[i4][2];

			let index1 = this.canvases.chartContainer.dynemicObjects.findIndex(object => object.id == lineId);
			let index2 = this.canvases.chartPrice.dynemicObjects.findIndex(object => object.id == textId);
			let index3 = this.limit.findIndex(object => object[1] == lineId);

			this.canvases.chartContainer.dynemicObjects.splice(index1, 1);
			this.canvases.chartPrice.dynemicObjects.splice(index2, 1);
			this.limit.splice(index3, 1);
		}

		for (var i5 = 0; i5 < limitsFact.length; i5++) {
			let lineId = this.canvases.chartContainer.addDynemicObjectFunction({
				"type": 'line',
				"dashed": true,
				"color": limitsFact[i5].type == "long" ? "#02EB5F" : "#ff0000",
				"coordinates": [
					{
						"x": Math.round(this.move.x - 3000/this.scale.x),
						"y": limitsFact[i5].price/this.delitel
					},
					{
						"x": Math.round(this.move.x + width/this.scale.x + 3000/this.scale.x),
						"y": limitsFact[i5].price/this.delitel
					},
				],
				"moving": true
			});

			let textId = this.canvases.chartPrice.addDynemicObjectFunction({
				"type": 'text',
				"color": limitsFact[i5].type == "long" ? "#02EB5F" : "#ff0000",
				"isScale": false,
				"isFixed": false,
				"fontFamily": "Montserrat",
				"text": (limitsFact[i5].price).toString(),
				"size": 12,
				"coordinates": {
					"x": 20,
					"y": limitsFact[i5].price
				}
			});

			this.limit.push([limitsFact[i5].id, lineId, textId, limitsFact[i5].clientID]);
		}
	}

	orderLines(){
		let width = this.canvases.chartContainer.canvas.width; 

		let ordersFact = JSON.parse(JSON.stringify(this.orderManager.getActiveOrders(this.symbol)));
		let ordersDrow = JSON.parse(JSON.stringify(this.orders));

		let listFromRemove = [];

		for (var i = ordersFact.length - 1; i >= 0; i--) {
			for (var i2 = ordersDrow.length - 1; i2 >= 0; i2--) {
				if(ordersFact[i].id == ordersDrow[i2][0]){
					listFromRemove.push([i, i2]);
				}
			}
		}



		for (var i3 = 0; i3 < listFromRemove.length; i3++) {
			ordersFact.splice(listFromRemove[i3][0], 1); ordersDrow.splice(listFromRemove[i3][1], 1);
		}
	



		for (var i4 = 0; i4 < ordersDrow.length; i4++) {
			let lineId = ordersDrow[i4][1];
			let textId = ordersDrow[i4][2];

			let index1 = this.canvases.chartContainer.dynemicObjects.findIndex(object => object.id == lineId);
			let index2 = this.canvases.chartPrice.dynemicObjects.findIndex(object => object.id == textId);
			let index3 = this.orders.findIndex(object => object[1] == lineId);

			this.canvases.chartContainer.dynemicObjects.splice(index1, 1);
			this.canvases.chartPrice.dynemicObjects.splice(index2, 1);
			this.orders.splice(index3, 1);
		}

		for (var i5 = 0; i5 < ordersFact.length; i5++) {
			
			let lineId = this.canvases.chartContainer.addDynemicObjectFunction({
				"type": 'line',
				"color": ordersFact[i5].type == "long" ? "#02EB5F" : "#ff0000",
				"coordinates": [
					{
						"x": Math.round(this.move.x - 3000/this.scale.x),
						"y": (ordersFact[i5].order / ordersFact[i5].quantity)/this.delitel
					},
					{
						"x": Math.round(this.move.x + width/this.scale.x + 3000/this.scale.x),
						"y": (ordersFact[i5].order / ordersFact[i5].quantity)/this.delitel
					},
				]
			});

			let textId = this.canvases.chartPrice.addDynemicObjectFunction({
				"type": 'text',
				"color": ordersFact[i5].type == "long" ? "#02EB5F" : "#ff0000",
				"isScale": false,
				"isFixed": false,
				"fontFamily": "Montserrat",
				"text": (Math.round(ordersFact[i5].order / ordersFact[i5].quantity * 100)/100).toString(),
				"size": 12,
				"coordinates": {
					"x": 20,
					"y": (ordersFact[i5].order / ordersFact[i5].quantity)/this.delitel
				}
			});

			this.orders.push([ordersFact[i5].id, lineId, textId]);
		}
	}

	closeLines(){
		let width = this.canvases.chartContainer.canvas.width; 

		let closesFact = JSON.parse(JSON.stringify(this.orderManager.getCloseLimit(this.symbol)));
		let closesDrow = JSON.parse(JSON.stringify(this.close));

		let listFromRemove = [];

		for (var i = closesFact.length - 1; i >= 0; i--) {
			for (var i2 = closesDrow.length - 1; i2 >= 0; i2--) {
				if(closesFact[i].id == closesDrow[i2][0]){
					listFromRemove.push([i, i2]);
				}
			}
		}

		for (var i3 = 0; i3 < listFromRemove.length; i3++) {
			closesFact.splice(listFromRemove[i3][0], 1); closesDrow.splice(listFromRemove[i3][1], 1);
		}
	

		for (var i4 = 0; i4 < closesDrow.length; i4++) {
			let lineId = closesDrow[i4][1];
			let textId = closesDrow[i4][2];

			let index1 = this.canvases.chartContainer.dynemicObjects.findIndex(object => object.id == lineId);
			let index2 = this.canvases.chartPrice.dynemicObjects.findIndex(object => object.id == textId);
			let index3 = this.close.findIndex(object => object[1] == lineId);

			this.canvases.chartContainer.dynemicObjects.splice(index1, 1);
			this.canvases.chartPrice.dynemicObjects.splice(index2, 1);
			this.close.splice(index3, 1);
		}

		for (var i5 = 0; i5 < closesFact.length; i5++) {
			let lineId = this.canvases.chartContainer.addDynemicObjectFunction({
				"type": 'line',
				"dashed": true,
				"color": closesFact[i5].type == "long" ? "#9ecc08" : "#cc9108",
				"coordinates": [
					{
						"x": Math.round(this.move.x - 3000/this.scale.x),
						"y": closesFact[i5].price/this.delitel
					},
					{
						"x": Math.round(this.move.x + width/this.scale.x + 3000/this.scale.x),
						"y": closesFact[i5].price/this.delitel
					},
				],
				"moving": true
			});

			let textId = this.canvases.chartPrice.addDynemicObjectFunction({
				"type": 'text',
				"color": closesFact[i5].type == "long" ? "#9ecc08" : "#cc9108",
				"isScale": false,
				"isFixed": false,
				"fontFamily": "Montserrat",
				"text": (closesFact[i5].price).toString(),
				"size": 12,
				"coordinates": {
					"x": 20,
					"y": closesFact[i5].price/this.delitel
				}
			});

			this.close.push([closesFact[i5].id, lineId, textId, closesFact[i5].clientID]);
		}
	}

	stopLossLines(){
		let width = this.canvases.chartContainer.canvas.width; 

		let stopLossFact = JSON.parse(JSON.stringify(this.orderManager.getStopLoss(this.symbol)));
		let stopLossDrow = JSON.parse(JSON.stringify(this.stopLoss));

		let listFromRemove = [];

		if (stopLossFact.length != stopLossDrow.length) {
			for (var i = stopLossFact.length - 1; i >= 0; i--) {
				for (var i2 = stopLossDrow.length - 1; i2 >= 0; i2--) {
					if(stopLossFact[i].id == stopLossDrow[i2][0]){
						listFromRemove.push([i, i2]);
					}
				}
			}

			for (var i3 = 0; i3 < listFromRemove.length; i3++) {
				stopLossFact.splice(listFromRemove[i3][0], 1); stopLossDrow.splice(listFromRemove[i3][1], 1);
			}
		}

		for (var i4 = 0; i4 < stopLossDrow.length; i4++) {
			let lineId = stopLossDrow[i4][1];
			let textId = stopLossDrow[i4][2];

			let index1 = this.canvases.chartContainer.dynemicObjects.findIndex(object => object.id == lineId);
			let index2 = this.canvases.chartPrice.dynemicObjects.findIndex(object => object.id == textId);
			let index3 = this.stopLoss.findIndex(object => object[1] == lineId);

			this.canvases.chartContainer.dynemicObjects.splice(index1, 1);
			this.canvases.chartPrice.dynemicObjects.splice(index2, 1);
			this.stopLoss.splice(index3, 1);
		}

		for (var i5 = 0; i5 < stopLossFact.length; i5++) {
			let lineId = this.canvases.chartContainer.addDynemicObjectFunction({
				"type": 'line',
				"color": "#69cdff",
				"coordinates": [
					{
						"x": Math.round(this.move.x - 3000/this.scale.x),
						"y": stopLossFact[i5].price/this.delitel
					},
					{
						"x": Math.round(this.move.x + width/this.scale.x + 3000/this.scale.x),
						"y": stopLossFact[i5].price/this.delitel
					},
				],
				"moving": true
			});

			let textId = this.canvases.chartPrice.addDynemicObjectFunction({
				"type": 'text',
				"color": "#69cdff",
				"isScale": false,
				"isFixed": false,
				"fontFamily": "Montserrat",
				"text": (Math.round(stopLossFact[i5].price * 100)/100).toString(),
				"size": 12,
				"coordinates": {
					"x": 20,
					"y": stopLossFact[i5].price/this.delitel
				}
			});

			this.stopLoss.push([stopLossFact[i5].id, lineId, textId, stopLossFact[i5].clientID]);
		}
	}




	checkMapMovingObjects(cursorY){
		for (var i = 0; i < this.limit.length; i++) {
			let lineId = this.limit[i][1];
			let line = this.canvases.chartContainer.dynemicObjects.find(object => object.id == lineId);

			let objectY = line.coordinates[0].y;

			if(((objectY + 8) >= cursorY) && ((objectY - 8) <= cursorY)){
				this.mapMoving = false;
				this.mapMovingObject.type 		= "limit";
				this.mapMovingObject.id 		= this.limit[i][3];

				return true;
			}
		}

		for (var i2 = 0; i2 < this.close.length; i2++) {
			let lineId = this.close[i2][1];
			let line = this.canvases.chartContainer.dynemicObjects.find(object => object.id == lineId);

			let objectY = line.coordinates[0].y;

			//console.log(this.close, line, this.close, this.canvases.chartContainer.dynemicObjects);


			if(((objectY + (5 / this.scale.y)) >= cursorY) && ((objectY - (5 / this.scale.y)) <= cursorY)){
				this.mapMoving = false;
				this.mapMovingObject.type 	= "closeLimit";
				this.mapMovingObject.id 	= this.close[i2][3];

				return true;
			}
		}

		for (var i3 = 0; i3 < this.stopLoss.length; i3++) {
			let lineId = this.stopLoss[i3][1];
			let line = this.canvases.chartContainer.dynemicObjects.find(object => object.id == lineId);

			let objectY = line.coordinates[0].y;

			if(((objectY + (5 / this.scale.y)) >= cursorY) && ((objectY - (5 / this.scale.y)) <= cursorY)){
				this.mapMoving = false;
				this.mapMovingObject.type 	= "stopLoss";
				this.mapMovingObject.id 	= this.stopLoss[i3][3];

				return true;
			}
		}

		this.mapMovingObject.id = -1;
		this.mapMoving 			= true;
	}


	cursorLines(event){
		let width = this.canvases.chartContainer.canvas.width; 
		let height = this.canvases.chartContainer.canvas.height; 

		let date = new Date((this.null + (this.move.x + event.offsetX/this.scale.x) * 300));

		//console.log(this.null);

		if((this.cursorLinesY == -1) && (this.cursorLinesX == -1)){
			this.cursorLinesY = this.canvases.chartContainer.addDynemicObjectFunction({
				"type": 'line',
				"color": 'white',
				"coordinates": [
					{
						"x": Math.round(this.move.x - 3000/this.scale.x),
						"y": this.move.y + height - event.offsetY /this.scale.y
					},
					{
						"x": Math.round(this.move.x + width/this.scale.x + 3000/this.scale.x),
						"y": this.move.y + height - event.offsetY /this.scale.y
					},
				]
				// event = (this.canvas.height - (object.coordinates.y - this.move.y)) * this.scale.y)
				// event = this.canvas.height * scale - object.coordinates.y * scale + this.move.y * scale
				// object.coordinates.y * scale = this.canvas.height * scale + this.move.y * scale - event
				// object.coordinates.y = this.canvas.height + this.move.y - event/scale
			});

			this.cursorLinesX = this.canvases.chartContainer.addDynemicObjectFunction({
				"type": 'line',
				"color": 'white',
				"coordinates": [
					{
						"x": this.move.x + event.offsetX*this.scale.x,
						"y": Math.round(this.move.y - 3000/this.scale.y)
					},
					{
						"x": this.move.x + event.offsetX*this.scale.x,
						"y": Math.round(this.move.y + height/this.scale.y + 3000/this.scale.y)
					},
				]
			});



			this.cursorPrice = this.canvases.chartPrice.addDynemicObjectFunction({
				"type": 'text',
				"color": 'white',
				"isScale": false,
				"isFixed": false,
				"fontFamily": "Montserrat",
				"text": ((this.move.y + height - event.offsetY /this.scale.y)* this.delitel).toString().substr(0, 9),
				"size": 12,
				"coordinates": {
					"x": 20,
					"y": (this.move.y + height - event.offsetY /this.scale.y)
				}
			})


			this.cursorDate = this.canvases.chartDate.addDynemicObjectFunction({
				"type": 'text',
				"color": 'white',
				"isScale": false,
				"isFixed": false,
				"fontFamily": "Montserrat",
				"text": (date.getHours() + ":" +  date.getMinutes() + ":" + date.getSeconds()).toString(),
				"size": 12,
				"coordinates": {
					"x": this.move.x + event.offsetX*this.scale.x - 22,
					"y": 15
				}
			})



			this.cursorLineOrder = this.canvases.chartOrderBook.addDynemicObjectFunction({
				"type": 'line',
				"color": 'white',
				"coordinates": [
					{
						"x": Math.round(this.move.x - 3000/this.scale.x),
						"y": this.move.y + height - event.offsetY /this.scale.y
					},
					{
						"x": Math.round(this.move.x + width/this.scale.x + 3000/this.scale.x),
						"y": this.move.y + height - event.offsetY /this.scale.y
					},
				]
				// event = (this.canvas.height - (object.coordinates.y - this.move.y)) * this.scale.y)
				// event = this.canvas.height * scale - object.coordinates.y * scale + this.move.y * scale
				// object.coordinates.y * scale = this.canvas.height * scale + this.move.y * scale - event
				// object.coordinates.y = this.canvas.height + this.move.y - event/scale
			});

			this.cursorTextOrder = this.canvases.chartOrderBook.addDynemicObjectFunction({
				"type": 'text',
				"color": 'white',
				"isScale": false,
				"isFixed": false,
				"fontFamily": "Montserrat",
				"text": (0).toString().substr(0, 9),
				"size": 10,
				"coordinates": {
					"x": 5,
					"y": (this.move.y + height - event.offsetY /this.scale.y)
				}
			})
		}


		let lineObjectY = this.canvases.chartContainer.dynemicObjects[this.canvases.chartContainer.dynemicObjects.findIndex(object => object.id == this.cursorLinesY)]

		lineObjectY.coordinates[0].y = this.move.y + height - event.offsetY/this.scale.y;
		lineObjectY.coordinates[0].x = Math.round(this.move.x - 3000/this.scale.x);

		lineObjectY.coordinates[1].y = this.move.y + height-event.offsetY/this.scale.y;
		lineObjectY.coordinates[1].x = Math.round(this.move.x + width/this.scale.x + 3000/this.scale.x);



		let lineObjectX = this.canvases.chartContainer.dynemicObjects[this.canvases.chartContainer.dynemicObjects.findIndex(object => object.id == this.cursorLinesX)]

		lineObjectX.coordinates[0].y = Math.round(this.move.y - 3000/this.scale.y);
		lineObjectX.coordinates[0].x = this.move.x + event.offsetX/this.scale.x;

		lineObjectX.coordinates[1].y = Math.round(this.move.y + height/this.scale.y + 3000/this.scale.y);
		lineObjectX.coordinates[1].x = this.move.x + event.offsetX/this.scale.x;


		let textObjectPrice = this.canvases.chartPrice.dynemicObjects[this.canvases.chartPrice.dynemicObjects.findIndex(object => object.id == this.cursorPrice)]
		textObjectPrice.coordinates.y = this.move.y + height-event.offsetY/this.scale.y;
		textObjectPrice.text = ((this.move.y + height - event.offsetY /this.scale.y)* this.delitel).toString().substr(0, 9);



		let textObjectDate = this.canvases.chartDate.dynemicObjects[this.canvases.chartDate.dynemicObjects.findIndex(object => object.id == this.cursorDate)]
		textObjectDate.coordinates.x = this.move.x + event.offsetX/this.scale.x - 22;
		textObjectDate.text = (date.getHours() + ":" +  date.getMinutes() + ":" + date.getSeconds()).toString();


		let lineOrderBook = this.canvases.chartOrderBook.dynemicObjects[this.canvases.chartOrderBook.dynemicObjects.findIndex(object => object.id == this.cursorLineOrder)]

		lineOrderBook.coordinates[0].y = this.move.y + height - event.offsetY/this.scale.y;
		lineOrderBook.coordinates[0].x = 0;

		lineOrderBook.coordinates[1].y = this.move.y + height-event.offsetY/this.scale.y;
		lineOrderBook.coordinates[1].x = 250;

		let textOrderBook = this.canvases.chartOrderBook.dynemicObjects[this.canvases.chartOrderBook.dynemicObjects.findIndex(object => object.id == this.cursorTextOrder)]
		textOrderBook.coordinates.y = this.move.y + height-(event.offsetY - 3)/this.scale.y;
		textOrderBook.text = Math.round((((this.move.y + height - event.offsetY /this.scale.y)* this.delitel) / this.price - 1) *10000)/100 + "%";

		this.canvases.chartOrderBook.renderMap();


		this.checkMapMovingObjects(this.move.y + height - event.offsetY/this.scale.y);

		this.limitLines();
		this.orderLines();
		this.closeLines();
		this.stopLossLines();


		this.canvases.chartContainer.renderMap();
		this.canvases.chartPrice.renderMap();
		this.canvases.chartDate.renderMap();

		//console.log(date);
	}

	setPriceNow(coordinateY, text){
		let width = this.canvases.chartContainer.canvas.width; let scaleX = this.scale.x; let moveX = this.move.x;

		let lineObject = this.canvases.chartContainer.dynemicObjects[this.canvases.chartContainer.dynemicObjects.findIndex(object => object.id == this.priceLineId )]

		lineObject.coordinates[0].y = coordinateY;
		lineObject.coordinates[0].x = Math.round(moveX - 3000/scaleX);

		lineObject.coordinates[1].y = coordinateY;
		lineObject.coordinates[1].x = Math.round(moveX + width/scaleX + 3000/scaleX);

		// let rectObject = this.canvases.chartPrice.dynemicObjects[this.canvases.chartPrice.dynemicObjects.findIndex(object => object.id == rectId)]
		// rectObject.coordinates.y = coordinateY + 13;

		let textObject = this.canvases.chartPrice.dynemicObjects[this.canvases.chartPrice.dynemicObjects.findIndex(object => object.id == this.textPriceMarkId)]
		textObject.coordinates.y = coordinateY;
		textObject.text = (text).toString().substr(0, 9);

		this.canvases.chartContainer.renderMap();
		this.canvases.chartPrice.renderMap();
	}

	priceCanvasManager(scaleY){
		this.canvases.chartContainer.linesSet = [];
		this.canvases.chartPrice.setAllObjects = [];

		this.lastStep.y = scaleY;

		let height = this.canvases.chartPrice.canvas.height; let moveY = this.move.y; let shag = Math.round(85 / scaleY);
		let width = this.canvases.chartPrice.canvas.width; let scaleX = this.scale.x; let moveX = this.move.x;

		let viewZone = [Math.round(moveY - 3000/scaleY), Math.round(moveY + height/scaleY + 3000/scaleY)];

		let firstPriceValue = 0;
		let secondPriceValue = 0;

		for (var i = 0; i <  viewZone[1] - viewZone[0]; i++) {
			if ((viewZone[0] + i) % shag == 0) {

				if((secondPriceValue == 0) && (firstPriceValue != 0)) secondPriceValue = ((viewZone[0] + 3000/scaleY + i) * this.delitel);
				if(firstPriceValue == 0) firstPriceValue = ((viewZone[0] + 3000/scaleY + i) * this.delitel);
				this.canvases.chartPrice.addObjects = {
					"type": 'text',
					"color": '#bababa',
					"isScale": false,
					"isFixed": false,
					"fontFamily": "Montserrat",
					"text": ((viewZone[0] + i) * this.delitel).toString().substr(0, 9),
					"size": 12,
					"coordinates": {
						"x": 20,
						"y": viewZone[0] + i
					}
				};

				this.canvases.chartContainer.addObjects = {
					"type": 'line',
					"color": '#283763',
					"coordinates": [
						{
							"x": Math.round(moveX - 3000/scaleX),
							"y": viewZone[0] + i
						},
						{
							"x": Math.round(moveX + width/scaleX + 3000/scaleX),
							"y": viewZone[0] + i
						},
					]
				};
			}
		}

		this.factScale =  (Math.round((secondPriceValue / firstPriceValue - 1)*10000)/100);
	}

	dateCanvasManager(scaleX){
		this.canvases.chartDate.setAllObjects = [];
		this.lastStep.x = scaleX;

		let width = this.canvases.chartPrice.canvas.width; let moveX = this.move.x; let shag = Math.round(150 / scaleX);
		let height = this.canvases.chartPrice.canvas.height; let scaleY = this.scale.y; let moveY = this.move.y;

		let viewZone = [Math.round(moveX - 3500/scaleX), Math.round(moveX + width/scaleX + 3500/scaleX)];

		for (var i = 0; i <  viewZone[1] - viewZone[0]; i++) {
			if ((viewZone[0] + i) % shag == 0) {
				let date = new Date((this.null + (viewZone[0] + i) * 300));
				this.canvases.chartDate.addObjects = {
					"type": 'text',
					"color": '#bababa',
					"isScale": false,
					"isFixed": false,
					"fontFamily": "Montserrat",
					"text": (date.getHours() + ":" +  date.getMinutes() + ":" + date.getSeconds()),
					"size": 12,
					"coordinates": {
						"x": viewZone[0] + i - 22,
						"y": 15
					}
				};

				this.canvases.chartContainer.addObjects = {
					"type": 'line',
					"color": '#283763',
					"coordinates": [
						{
							"x": viewZone[0] + i,
							"y": Math.round(moveY - 3500/scaleY)
						},
						{
							"x": viewZone[0] + i,
							"y": Math.round(moveY + height/scaleY + 3500/scaleY)
						},
					]
				};
			}
		}
	}

	controllerManager(){
		this.chartPrice = {
			"mapMovingNow": false,
			"increaseScaleMap": () => {
				this.scale = {
					"x": this.scale.x,
					"y": this.scale.y + this.scaleStep.y,
				};
				this.move = {
					"x": this.move.x,
					"y": this.move.y - (((this.canvases.chartContainer.canvas.height / this.scale.y) - (this.canvases.chartContainer.canvas.height/(this.scale.y + this.scaleStep.y)))/2)
				};



				this.canvases.chartPrice.increaseScaleMap(this.move, this.scale);
				this.canvases.chartContainer.increaseScaleMap(this.move, this.scale);
				this.canvases.chartOrderBook.increaseScaleMap(this.move, this.scale);
				this.canvases.chartDate.increaseScaleMap(this.move, this.scale);

				if((Math.round(this.scale.y*100) % 25 == 0) || Math.round(this.scale.x*100) % 25 == 0){this.priceCanvasManager(this.scale.y); this.dateCanvasManager(this.scale.x);}
			},
			"decreaseScaleMap": () => {
				if (this.scale.y > (this.scaleStep.y*2)){
					this.scale = {
						"x": this.scale.x,
						"y": this.scale.y - this.scaleStep.y,
					};
					this.move = {
						"x": this.move.x,
						"y": this.move.y + (((this.canvases.chartContainer.canvas.height / this.scale.y) - (this.canvases.chartContainer.canvas.height/(this.scale.y + this.scaleStep.y)))/2)
					};

					this.canvases.chartPrice.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartContainer.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartOrderBook.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartDate.decreaseScaleMap(this.move, this.scale);

					if((Math.round(this.scale.y*100) % 25 == 0) || Math.round(this.scale.x*100) % 25 == 0){}
				}else{
					this.priceCanvasManager(this.scale.y);
					this.dateCanvasManager(this.scale.x);
				}
			},
			"moveMap": (data) => {
				this.move = {
					"x": this.move.x,
					"y": this.move.y + data.y
				};

				this.canvases.chartPrice.moveMap(this.move);
				this.canvases.chartContainer.moveMap(this.move);
				this.canvases.chartOrderBook.moveMap(this.move);
				this.canvases.chartDate.moveMap(this.move);
			}
		}

		this.chartContainer = {
			"mapMovingNow": false,
			"increaseScaleMap": () => {
				this.scale = {
					"x": this.scale.x + this.scaleStep.x,
					"y": this.scale.y + this.scaleStep.y,
				};
				this.move = {
					"x": this.move.x + (((this.canvases.chartContainer.canvas.width / (this.scale.x - this.scaleStep.x)) - (this.canvases.chartContainer.canvas.width/this.scale.x)) / this.canvases.chartContainer.canvas.width * this.mousePosition.x),
					"y": this.move.y - (((this.canvases.chartContainer.canvas.height / (this.scale.y - this.scaleStep.y)) - (this.canvases.chartContainer.canvas.height/this.scale.y)) / this.canvases.chartContainer.canvas.height * this.mousePosition.y)
				};

				this.canvases.chartPrice.increaseScaleMap(this.move, this.scale);
				this.canvases.chartContainer.increaseScaleMap(this.move, this.scale);
				this.canvases.chartOrderBook.increaseScaleMap(this.move, this.scale);
				this.canvases.chartDate.increaseScaleMap(this.move, this.scale);

				this.scaleManager(this.scale.x);

				if((Math.round(this.scale.y*100) % 25 == 0) || Math.round(this.scale.x*100) % 25 == 0){this.priceCanvasManager(this.scale.y); this.dateCanvasManager(this.scale.x);}
			},
			"decreaseScaleMap": () => {
				if ((this.scale.x > (this.scaleStep.x*2)) && (this.scale.y > (this.scaleStep.y*2))){
					this.scale = {
						"x": this.scale.x - this.scaleStep.x,
						"y": this.scale.y - this.scaleStep.y,
					};
					this.move = {
						"x": this.move.x - (((this.canvases.chartContainer.canvas.width / this.scale.x) - (this.canvases.chartContainer.canvas.width/(this.scale.x + this.scaleStep.x)))/2),
						"y": this.move.y + (((this.canvases.chartContainer.canvas.height / this.scale.y) - (this.canvases.chartContainer.canvas.height/(this.scale.y + this.scaleStep.y)))/2)
					};

					this.canvases.chartPrice.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartContainer.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartOrderBook.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartDate.decreaseScaleMap(this.move, this.scale);

					this.scaleManager(this.scale.x);

					if((Math.round(this.scale.y*100) % 25 == 0) || Math.round(this.scale.x*100) % 25 == 0){this.priceCanvasManager(this.scale.y); this.dateCanvasManager(this.scale.x);}

				}else{
					this.priceCanvasManager(this.scale.y);
					this.dateCanvasManager(this.scale.x);
				}
			},
			"moveMap": (data) => {
				this.move = {
					"x": this.move.x - data.x,
					"y": this.move.y + data.y
				};

				this.canvases.chartPrice.moveMap(this.move);
				this.canvases.chartContainer.moveMap(this.move);
				this.canvases.chartOrderBook.moveMap(this.move);
				this.canvases.chartDate.moveMap(this.move);
			}
		}

		this.chartOrderBook = {
			"mapMovingNow": false,
			"increaseScaleMap": () => {
				this.scale = {
					"x": this.scale.x,
					"y": this.scale.y + this.scaleStep.y,
				};
				this.move = {
					"x": this.move.x,
					"y": this.move.y - (((this.canvases.chartOrderBook.canvas.height / this.scale.y) - (this.canvases.chartOrderBook.canvas.height/(this.scale.y + this.scaleStep.y)))/2)
				};

				this.canvases.chartPrice.increaseScaleMap(this.move, this.scale);
				this.canvases.chartContainer.increaseScaleMap(this.move, this.scale);
				this.canvases.chartOrderBook.increaseScaleMap(this.move, this.scale);
				this.canvases.chartDate.increaseScaleMap(this.move, this.scale);

				if((Math.round(this.scale.y*100) % 25 == 0) || Math.round(this.scale.x*100) % 25 == 0){this.priceCanvasManager(this.scale.y); this.dateCanvasManager(this.scale.x);}
			},
			"decreaseScaleMap": () => {
				if (this.scale.y > (this.scaleStep.y*2)){
					this.scale = {
						"x": this.scale.x,
						"y": this.scale.y - this.scaleStep.y,
					};
					this.move = {
						"x": this.move.x,
						"y": this.move.y + (((this.canvases.chartOrderBook.canvas.height / this.scale.y) - (this.canvases.chartOrderBook.canvas.height/(this.scale.y + this.scaleStep.y)))/2)
					};

					this.canvases.chartPrice.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartContainer.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartOrderBook.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartDate.decreaseScaleMap(this.move, this.scale);

					if((Math.round(this.scale.y*100) % 25 == 0) || Math.round(this.scale.x*100) % 25 == 0){this.priceCanvasManager(this.scale.y); this.dateCanvasManager(this.scale.x);}
				}else{
					this.priceCanvasManager(this.scale.y);
					this.dateCanvasManager(this.scale.x);
				}
			},
			"moveMap": (data) => {
				this.move = {
					"x": this.move.x,
					"y": this.move.y + data.y
				};

				this.canvases.chartPrice.moveMap(this.move);
				this.canvases.chartContainer.moveMap(this.move);
				this.canvases.chartOrderBook.moveMap(this.move);
				this.canvases.chartDate.moveMap(this.move);
			}
		}

		this.chartDate = {
			"mapMovingNow": false,
			"increaseScaleMap": () => {
				this.scale = {
					"x": this.scale.x + this.scaleStep.x,
					"y": this.scale.y,
				};
				this.move = {
					"x": this.move.x + (((this.canvases.chartContainer.canvas.width / this.scale.x) - (this.canvases.chartContainer.canvas.width/(this.scale.x + this.scaleStep.x)))/2),
					"y": this.move.y
				};

				this.canvases.chartPrice.increaseScaleMap(this.move, this.scale);
				this.canvases.chartContainer.increaseScaleMap(this.move, this.scale);
				this.canvases.chartOrderBook.increaseScaleMap(this.move, this.scale);
				this.canvases.chartDate.increaseScaleMap(this.move, this.scale);

				this.scaleManager(this.scale.x);

				if((Math.round(this.scale.y*100) % 25 == 0) || Math.round(this.scale.x*100) % 25 == 0){this.priceCanvasManager(this.scale.y); this.dateCanvasManager(this.scale.x);}
			},
			"decreaseScaleMap": () => {
				if (this.scale.x > (this.scaleStep.x*2)){
					this.scale = {
						"x": this.scale.x - this.scaleStep.x,
						"y": this.scale.y,
					};
					this.move = {
						"x": this.move.x - (((this.canvases.chartContainer.canvas.width / this.scale.x) - (this.canvases.chartContainer.canvas.width/(this.scale.x + this.scaleStep.x)))/2),
						"y": this.move.y
					};

					this.canvases.chartPrice.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartContainer.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartOrderBook.decreaseScaleMap(this.move, this.scale);
					this.canvases.chartDate.decreaseScaleMap(this.move, this.scale);

					if((Math.round(this.scale.y*100) % 25 == 0) || Math.round(this.scale.x*100) % 25 == 0){this.priceCanvasManager(this.scale.y); this.dateCanvasManager(this.scale.x);}
				}else{
					this.priceCanvasManager(this.scale.y);
					this.dateCanvasManager(this.scale.x);
				}
			},
			"moveMap": (data) => {
				this.move = {
					"x": this.move.x - data.x,
					"y": this.move.y
				};

				this.canvases.chartPrice.moveMap(this.move);
				this.canvases.chartContainer.moveMap(this.move);
				this.canvases.chartOrderBook.moveMap(this.move);
				this.canvases.chartDate.moveMap(this.move);
			}
		}
	}

	listnersHandle(){
		this.listnersHandles = {
			"wheel": (event, object) => {
				event.preventDefault();

				if (event.deltaY/125 < 0) object.increaseScaleMap();
				if (event.deltaY/125 > 0) object.decreaseScaleMap();
			},
			"mousedown": (event, object) => {
				if(event.button == 0){
					if(this.mapMoving){
						this.moveStart.x = event.offsetX;
						this.moveStart.y = event.offsetY;
						object.mapMovingNow = true;	
					}else{
						this.mapMovingObjectNow = true;	
					}
				}

				if(event.button == 1){
					let height 		= this.canvases.chartContainer.canvas.height; 
					let percent		= this.percent;

					let absoluteY 	= event.offsetY;
					let coordinateY = this.move.y + height - absoluteY / this.scale.y;
					let alt			= event.altKey;
					let type;

					let price 		= Number((coordinateY * this.delitel).toString().substr(0, 9));

					if(!alt){
						type = "long";
						this.orderManager.createStopLoss(this.symbol, type, price);
					}

					if(alt){
						type = "short";
						this.orderManager.createStopLoss(this.symbol, type, price);
					}
				}

				if(event.button == 2){
					let height 		= this.canvases.chartContainer.canvas.height; 
					let percent		= this.percent;

					let absoluteY 	= event.offsetY;
					let coordinateY = this.move.y + height - absoluteY / this.scale.y;
					let alt			= event.altKey;
					let type;

					let price 		= Number((coordinateY * this.delitel).toString().substr(0, 9));

					if(!alt){
						type = "long";
						if(price <= this.price){
							this.orderManager.closeMarketOrder(this.symbol, type, price, percent);
						}

						if(price > this.price){
							this.orderManager.closeLimitOrder(this.symbol, type, price, percent);
						}
					}

					if(alt){
						type = "short";
						if(price >= this.price){
							this.orderManager.closeMarketOrder(this.symbol, type, price, percent);
						}

						if(price < this.price){
							this.orderManager.closeLimitOrder(this.symbol, type, price, percent);
						}
					}
				}
			},
			"mousemove": (event, object) => {
				this.mousePosition.x = event.offsetX;								
				this.mousePosition.y = event.offsetY;					

				if(this.mapMoving){
					if (object.mapMovingNow) {
						object.moveMap({
							"x": ((event.offsetX - this.moveStart.x)/this.scale.x),
							"y": ((event.offsetY - this.moveStart.y)/this.scale.y)
						});

						this.moveStart.x = event.offsetX;
						this.moveStart.y = event.offsetY;
					}
				}else{
					if(this.mapMovingObjectNow){
						let height 		= this.canvases.chartContainer.canvas.height; 

						let absoluteY 	= event.offsetY;
						let coordinateY = this.move.y + height - absoluteY / this.scale.y;

						let price 		= Number((coordinateY * this.delitel).toString().substr(0, 9));

						console.log(this.mapMovingObject.type);

						if(this.mapMovingObject.type == "limit"){
							this.orderManager.setLimit(this.mapMovingObject.id, price, false);
						}

						if(this.mapMovingObject.type == "closeLimit"){
							this.orderManager.setCloseLimit(this.mapMovingObject.id, price, false);
						}

						if(this.mapMovingObject.type == "stopLoss"){
							this.orderManager.setStopLoss(this.mapMovingObject.id, price, false);
						}
					}
				}
			},
			"dblclick": (event) => {
				let height 		= this.canvases.chartContainer.canvas.height; 
				let order		= this.order;

				let absoluteY 	= event.offsetY;
				let coordinateY = this.move.y + height - absoluteY / this.scale.y;
				let alt			= event.altKey;
				let type;

				let price 		= Number((coordinateY * this.delitel).toString().substr(0, 9));

				if(!alt){
					type = "long";
					if(price >= this.price){
						this.orderManager.createMarketOrder(this.symbol, type, price, order);
					}

					if(price < this.price){
						this.orderManager.createLimitOrder(this.symbol, type, price, order);
					}
				}

				if(alt){
					type = "short";
					if(price <= this.price){
						this.orderManager.createMarketOrder(this.symbol, type, price, order);
					}

					if(price > this.price){
						this.orderManager.createLimitOrder(this.symbol, type, price, order);
					}
				}
			},
			"contextmenu": (event) => {
				
			},
			"mouseup": (event) => {
				if(this.mapMoving){

					this.chartPrice.mapMovingNow = false;
					this.chartContainer.mapMovingNow = false;
					this.chartOrderBook.mapMovingNow = false;
					this.chartDate.mapMovingNow = false;

					this.priceCanvasManager(this.lastStep.y);
					this.dateCanvasManager(this.lastStep.x);
				}else{
					if(this.mapMovingObjectNow){
						this.mapMovingObjectNow = false;
						let height 		= this.canvases.chartContainer.canvas.height; 

						let absoluteY 	= event.offsetY;
						let coordinateY = this.move.y + height - absoluteY / this.scale.y;

						let price 		= Number((coordinateY * this.delitel).toString().substr(0, 9));

						if(this.mapMovingObject.type == "limit") this.orderManager.setLimit(this.mapMovingObject.id, price, true);
						if(this.mapMovingObject.type == "closeLimit") this.orderManager.setCloseLimit(this.mapMovingObject.id, price, true);
						if(this.mapMovingObject.type == "stopLoss") this.orderManager.setStopLoss(this.mapMovingObject.id, price, true);
						
					}
				}
			}
		}
	}

	listeners(){
		this.canvases.chartPrice.canvas.addEventListener('wheel', 	  e => this.listnersHandles.wheel(e, this.chartPrice));
		this.canvases.chartPrice.canvas.addEventListener('mousedown', e => this.listnersHandles.mousedown(e, this.chartPrice));
		window.addEventListener('mousemove', e => this.listnersHandles.mousemove(e, this.chartPrice));

		this.canvases.chartContainer.canvas.addEventListener('wheel', 	  e => this.listnersHandles.wheel(e, this.chartContainer));
		this.canvases.chartContainer.canvas.addEventListener('mousedown', e => this.listnersHandles.mousedown(e, this.chartContainer));
		this.canvases.chartContainer.canvas.addEventListener('mousemove', e => this.cursorLines(e));
		this.canvases.chartContainer.canvas.addEventListener('dblclick', e => this.listnersHandles.dblclick(e));
		this.canvases.chartContainer.canvas.addEventListener('contextmenu', e => this.listnersHandles.contextmenu(e));
		window.addEventListener('mousemove', e => this.listnersHandles.mousemove(e, this.chartContainer));

		this.canvases.chartOrderBook.canvas.addEventListener('wheel', 	  e => this.listnersHandles.wheel(e, this.chartOrderBook));
		this.canvases.chartOrderBook.canvas.addEventListener('mousedown', e => this.listnersHandles.mousedown(e, this.chartOrderBook));
		window.addEventListener('mousemove', e => this.listnersHandles.mousemove(e, this.chartOrderBook));

		this.canvases.chartDate.canvas.addEventListener('wheel', 	  e => this.listnersHandles.wheel(e, this.chartDate));
		this.canvases.chartDate.canvas.addEventListener('mousedown', e => this.listnersHandles.mousedown(e, this.chartDate));
		window.addEventListener('mousemove', e => this.listnersHandles.mousemove(e, this.chartDate));

		window.addEventListener('mouseup', e => this.listnersHandles.mouseup(e));
	}



	setScale(scale){
		this.canvases.chartContainer.scale = {
			"x": scale,
			"y": scale
		}

		this.canvases.chartPrice.scale = {
			"x": scale,
			"y": scale
		}

		this.canvases.chartDate.scale = {
			"x": scale,
			"y": scale
		}

		this.priceCanvasManager(this.scale.y);
		this.dateCanvasManager(this.scale.x);
	}



	getData(){
		for (var i = 0; i < this.data.length; i++) {
			if((this.data[i].min <= this.scale.x) && (this.scale.x < this.data[i].max)){
				let index = this.data[i].symbols.findIndex(object => object.symbol == this.symbol);
				
				if(index != -1) {
					let result = this.data[i].symbols[index].chart.slice(0,1000);
					return result;
				}
			}
		}

		return [];
	}

	getScaleIndex(){
		return this.data.findIndex(object => ((object.min <= this.scale.x) && (this.scale.x < object.max)));
	}


	

	getRenderPing(){
		return (this.canvases.chartContainer.renderTime.length != 0) ? this.canvases.chartContainer.renderTime[this.canvases.chartContainer.renderTime.length - 1] : 0;
	}

	getItems(){
		return this.canvases.chartContainer.chartCircles.length;
	}










	getPolygonObject(){
		return {
			"type": 'polygon',
			"color": 'red',
			"isFixed": false,
			"points": []
		}
	}
}
