export class CanvasMapChart{
	constructor(object){
		this.container  		= object.container_id;  // DEFLINE Container ID
		this.controller 		= object.controller; 	// DEFLINE Controller Type

		this.style 	 			= object.style; 		// DEFLINE Canvas Style {background, cursor}

		this._scale 			= object.scale; 		// DEFLINE Scale Map
		this._move  			= object.move; 			// DEFLINE Move Map
		this._objects 			= object.objects;		// DEFLINE Object for draw
		this._chartCircles 		= [];					// DEFLINE Object for draw
		this._chartRects 		= [];					// DEFLINE Object for draw
		this._lines 			= [];
		this._dynemicObjects	= [];
		

		this.renderTime = [];
	}

	/*

	--- Init Canvas Map ---

	*/

	init(){
		let container = document.getElementById(this.container);	// Div Container
		let canvas = document.createElement("canvas");				// Create Canvas

		canvas.id 				= this.container + "___canvas";		// Set canvas ID
    	canvas.height 			= container.offsetHeight;			// Set canvas Height
    	canvas.width 			= container.offsetWidth;			// Set canvas Width
    	canvas.style.background = this.style.background;			// Set canvas Background
    	canvas.style.cursor 	= this.style.cursor;				// Set canvas Cursor

		container.appendChild(canvas);								// Append canvas

		this.canvas 	   		= canvas;								// DEFLINE Canvas Container
		this.canvasMap 	   		= canvas.getContext("2d");				// DEFLINE Canvas Drawing
		this.container 	   		= container;							// DEFLINE Div Container

		this.events();												// Start <ouseEvents
		this.renderMap();											// First Render
	};




	/*

	--- Set & Get Scale Values ---

	*/

	set scale(scale){
		this._scale.value.x = (this._scale.switch.x && (scale.x > this.scaleStep.x)) ? scale.x : this._scale.value.x;
		this._scale.value.y = (this._scale.switch.y && (scale.y > this.scaleStep.y)) ? scale.y : this._scale.value.y;
	}
	set scaleStep(scaleStep){
		this._scale.step.x = scaleStep.x;
		this._scale.step.y = scaleStep.y;
	}
	set scaleSwitch(scaleSwitch){
		this._scale.switch.x = scaleSwitch.x;
		this._scale.switch.y = scaleSwitch.y;
	}

	get scale(){
		return {
			"x": this._scale.value.x,
			"y": this._scale.value.y
		}
	}
	get scaleStep(){
		return {
			"x": this._scale.step.x,
			"y": this._scale.step.y
		}
	}
	get scaleSwitch(){
		return {
			"x": this._scale.switch.x,
			"y": this._scale.switch.y
		}
	}




	/*

	--- Set & Get Move Values ---

	*/


	set move(move){
		this._move.value.x = this._move.switch.x ? Math.round(move.x) : this._move.value.x;
		this._move.value.y = this._move.switch.y ? Math.round(move.y) : this._move.value.y;
	}
	set moveSwitch(moveSwitch){
		this._move.switch.x = moveSwitch.x;
		this._move.switch.y = moveSwitch.y;
	}

	get move(){
		return {
			"x": this._move.value.x,
			"y": this._move.value.y
		}
	}
	get moveSwitch(){
		return {
			"x": this._move.switch.x,
			"y": this._move.switch.y
		}
	}



	/*

	--- Set & Get Objects ---

	*/


	set addObjects(object){
		if (object.type == "rect") this._objects.push(Object.assign(object, {"coordinatesData": [object.coordinates.x, object.coordinates.y, object.side.x, object.side.y]}));
		if (object.type == "circle") this._object.push(Object.assign(object, {"coordinatesData": [object.coordinates.x - object.radius, object.coordinates.y - object.radius, object.radius*2, object.radius*2]}));
		if (object.type == "line") this._lines.push(object);
		if (object.type == "text") this._objects.push(object);
		if (object.type == "polygon") this._objects.push(object);
		this.renderMap();
	}

	set addChartObjectUnshift(object){
		if (object.type == "rect") this._chartRects.unshift(Object.assign(object, {"coordinatesData": [object.coordinates.x, object.coordinates.y, object.side.x, object.side.y]}));
		if (object.type == "circle") this._chartCircles.unshift(Object.assign(object, {"coordinatesData": [object.coordinates.x - object.radius, object.coordinates.y - object.radius, object.radius*2, object.radius*2]}));
		//if (object.type == "line") this._chartObjects.unshift(object);
		//if (object.type == "text") this._chartObjects.unshift(object);
		//if (object.type == "polygon") this._chartObjects.unshift(object);
		this.renderMap();
	}

	set addChartObjectPush(object){
		if (object.type == "rect") this._chartRects.push(Object.assign(object, {"coordinatesData": [object.coordinates.x, object.coordinates.y, object.side.x, object.side.y]}));
		if (object.type == "circle") this._chartCircles.push(Object.assign(object, {"coordinatesData": [object.coordinates.x - object.radius, object.coordinates.y - object.radius, object.radius*2, object.radius*2]}));
		//if (object.type == "line") this._chartObjects.unshift(object);
		//if (object.type == "text") this._chartObjects.unshift(object);
		//if (object.type == "polygon") this._chartObjects.unshift(object);
		this.renderMap();
	}

	set removeObjects(id){
		delete this._objects[id];
		this.renderMap();
	}

	set objects(objects){
		for (var i = 0; i < objects.length; i++) this.addObjects = objects[i];
	}

	get objects(){
		return this._objects;
	}




	set chartCircles(object){
		this._chartCircles = object;
	}

	set removeChartCircles(index){
		this._chartCircles.splice(index, 1);
	}

	get chartCircles(){
		return this._chartCircles;
	}

	set chartRects(object){
		this._chartRects = object;
	}

	set removeChartRects(index){
		this._chartRects.splice(index, 1);
	}

	get chartRects(){
		return this._chartRects;
	}





	set linesSet(object){
		this._lines = object;
	}

	get lines(){
		return this._lines;
	}

	set addDynemicObject(object){
		this._dynemicObjects.push(object);
	}

	set updateDynemicObject(object){
		this._dynemicObjects[this.dynemicObjects.findIndex(obj => obj.id == object.id)] = object;
	}

	get dynemicObjects(){
		return this._dynemicObjects;
	}





	/*

	set addRenderTimeObject(object){
		this.
	}

	get renderTime(){
		return this._re
	}
	
	*/



	/*

	--- Control Canvas Methods ---

	*/



	addDynemicObjectFunction(object){
		let id = this.dynemicObjects.length == 0 ? 1 : this.dynemicObjects[this.dynemicObjects.length - 1].id + 1;

		object.id = id;
		this.addDynemicObject = object;

		console.log(JSON.parse(JSON.stringify(this.dynemicObjects)), object);

		return id;
	}


	increaseScaleMap(move, scale){ 							// FUNCTION Increase Scale
		this.move = {
			"x": move.x,
			"y": move.y,
		}
		this.scale = {
			"x": scale.x,
			"y": scale.y,
		}
		this.renderMap();									// Render canvas map
	}

	decreaseScaleMap(move, scale){								// FUNCTION Decrease Scale
		this.move = {
			"x": move.x,
			"y": move.y,
		}
		this.scale = {
			"x": scale.x,
			"y": scale.y,
		}
		this.renderMap();									// Render canvas map
	}

	moveMap(move){											// FUNCTION Move Canvas Map
		this.move = {
			"x": move.x,
			"y": move.y,
		}
		this.renderMap();
	}
	


	/*

	--- Mouse Events ---

	*/

	events(){
		window.addEventListener("resize", e => {								// EVENT Window Resize
			this.canvas.height = this.container.offsetHeight;					// Set canvas Height
    		this.canvas.width  = this.container.offsetWidth;					// Set canvas Width	
    		this.renderMap();
		});
	}






	/*

	--- Drawing methods ---

	*/

	clearMap(){
		this.canvasMap.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawRect(object, viewZone){
		if (!((viewZone[0] < object.coordinates.x) && (object.coordinates.x < viewZone[2]))) return false;

		this.canvasMap.beginPath();
		this.canvasMap.fillStyle = object.color;
		this.canvasMap.rect(
			Math.floor((object.coordinates.x - this.move.x) * this.scale.x), 
			//Math.floor((this.canvas.height - (object.coordinates.y - this.move.y)) * this.scale.y), 
			Math.floor(Math.floor(this.canvas.height - object.coordinates.y) - Math.floor(object.side.y)), 
			Math.floor(object.side.x), 
			Math.floor(object.side.y)
		);
		this.canvasMap.fill();

		return true;
	}

	drawElipse(object, viewZone){
		if (!((viewZone[0] < object.coordinates.x) && (object.coordinates.x < viewZone[2]))) {
			return false;
		}

		this.canvasMap.beginPath();
		this.canvasMap.fillStyle = object.color;
		this.canvasMap.ellipse(
			Math.floor((object.isFixed) ? object.coordinates.x : (object.coordinates.x - this.move.x) * this.scale.x), 
			Math.floor((object.isFixed) ? this.canvas.height - object.coordinates.y : (this.canvas.height - (object.coordinates.y - this.move.y)) * this.scale.y), 
			Math.floor(object.radius * ((object.isScale) ? this.scale.x : 1)), 
			Math.floor(object.radius * ((object.isScale) ? this.scale.y : 1)), 
			0, 0, 2 * Math.PI);
		this.canvasMap.fill();

		return true;
	}

	drawLine(object){
		this.canvasMap.beginPath();

		if (object.dashed) this.canvasMap.setLineDash([15, 5]);
		if (!object.dashed) this.canvasMap.setLineDash([0, 0]);

		this.canvasMap.strokeStyle = object.color;
		this.canvasMap.moveTo(
			Math.floor((object.isFixed) ? object.coordinates.x : (object.coordinates[0].x - this.move.x)*this.scale.x), 
			Math.floor((object.isFixed) ? this.canvas.height - object.coordinates.y : (this.canvas.height - (object.coordinates[0].y - this.move.y))*this.scale.y)
		);
		this.canvasMap.lineTo(
			Math.floor((object.isFixed) ? object.coordinates.x : (object.coordinates[1].x - this.move.x)*this.scale.x), 
			Math.floor((object.isFixed) ? this.canvas.height - object.coordinates.y : (this.canvas.height - (object.coordinates[1].y - this.move.y))*this.scale.y)
		);
		this.canvasMap.stroke();
	}

	drawBrokenLine(object){
		this.canvasMap.beginPath();

		if (object.dashed) this.canvasMap.setLineDash([15, 5]);
		if (!object.dashed) this.canvasMap.setLineDash([0, 0]);

		this.canvasMap.strokeStyle = object.color;
		
		

		for (let i = 0; i < object.coordinates.length; i++) {
			if(i == 0){
				this.canvasMap.moveTo(
					Math.floor((object.isFixed) ? object.coordinates.x : (object.coordinates[i].x - this.move.x)*this.scale.x), 
					Math.floor((object.isFixed) ? this.canvas.height - object.coordinates.y : (this.canvas.height - (object.coordinates[i].y - this.move.y))*this.scale.y)
				);
			}
			if(i != 0){
				this.canvasMap.lineTo(
					Math.floor((object.isFixed) ? object.coordinates.x : (object.coordinates[i].x - this.move.x)*this.scale.x), 
					Math.floor((object.isFixed) ? this.canvas.height - object.coordinates.y : (this.canvas.height - (object.coordinates[i].y - this.move.y))*this.scale.y)
				);
			}
		}
		this.canvasMap.stroke();
	}

	drawPolygon(object){
		this.canvasMap.beginPath();
		this.canvasMap.fillStyle = object.color;

		for (var i = 0; i < object.points.length; i++) {
			if(i == 0){
				this.canvasMap.moveTo(
					Math.floor((object.isFixed) ? object.points[i].x : (object.points[i].x - this.move.x)*this.scale.x), 
					Math.floor((object.isFixed) ? this.canvas.height - object.startCoordinates.y : (this.canvas.height - (object.points[i].y - this.move.y))*this.scale.y)
				);
			}else{
				this.canvasMap.lineTo(
					Math.floor((object.isFixed) ? object.points[i].x : (object.points[i].x - this.move.x)*this.scale.x), 
					Math.floor((object.isFixed) ? this.canvas.height - object.points[i].y : (this.canvas.height - (object.points[i].y - this.move.y))*this.scale.y)
				);
			}
			
		}

		this.canvasMap.fill();
	}

	drawText(object){
		this.canvasMap.beginPath();
		this.canvasMap.font = object.size*((object.isScale) ? this.scale.y : 1) + "px " + object.fontFamily;
		this.canvasMap.fillStyle = object.color;
		this.canvasMap.fillText(
			object.text, 
			Math.floor((object.isFixed) ? object.coordinates.x : (object.coordinates.x - this.move.x)*this.scale.x), 
			Math.floor((object.isFixed) ? this.canvas.height - object.coordinates.y : (this.canvas.height - (object.coordinates.y - this.move.y + object.size))*this.scale.y)
		);
	}

	renderChartCircles(){
		
		if (this.chartCircles.length == 0 ) return false;

		let line = {
			"type": 'line',
			"color": "#b59a3a",
			"coordinates": [],
			"moving": true
		};

		let viewZone = [this.move.x, this.move.y, this.move.x + this.canvas.width/this.scale.x, this.canvas.height/this.scale.y];

		if(!(viewZone[0] < this.chartCircles[0].coordinates.x)) return false;
		if(!(viewZone[2] > this.chartCircles[this.chartCircles.length - 1].coordinates.x)) return false;

		let flag1 = false; let flag2 = false; let res = false; let c = 0; let f = 0; let timer = 0;

		//console.log(this.chartCircles.length);
		
		for (var i = 0; i < this.chartCircles.length; i++) {
			if(i == 0) timer = new Date().getTime();

			
			
			if (!flag1 || !flag2) {
				res = this.drawElipse(this.chartCircles[i], viewZone);
				line.coordinates.push({
					"x": this.chartCircles[i].coordinates.x,
					"y": this.chartCircles[i].coordinates.y
				})
			}

			if(res && !flag1) {flag1 = true;}
			if (flag1 && !flag2 && !res) {
				this.renderTime.push(new Date().getTime() - timer);
				this.drawBrokenLine(line);
				return false;
			}
			
		}

		this.drawBrokenLine(line);
	}


	renderChartRects(){
		if (this.chartRects.length == 0 ) return false;

		let viewZone = [this.move.x, this.move.y, this.move.x + this.canvas.width/this.scale.x, this.canvas.height/this.scale.y];

		if(!(viewZone[0] < this.chartRects[0].coordinates.x)) return false;
		if(!(viewZone[2] > this.chartRects[this.chartRects.length - 1].coordinates.x)) return false;

		let flag1 = false; let flag2 = false; let res = false; let c = 0; let f = 0; let timer = 0;

		for (var i = 0; i < this.chartRects.length; i++) {
			if(i == 0) timer = new Date().getTime();
			if (!flag1 || !flag2) {
				res = this.drawRect(this.chartRects[i], viewZone);
			}

			if(res && !flag1) {flag1 = true; /*console.log(1, i);*/}
			if (flag1 && !flag2 && !res) {
				this.renderTime.push(new Date().getTime() - timer);
				//console.log(2, i);
				return false;
			}			
		}
	}

	renderMap(){
		this.clearMap();

		for (var i3 = 0; i3 < this.dynemicObjects.length; i3++) {
			if (this.dynemicObjects[i3].type == "rect") this.drawRect(this.dynemicObjects[i3]);
			if (this.dynemicObjects[i3].type == "line") this.drawLine(this.dynemicObjects[i3]);
			if (this.dynemicObjects[i3].type == "text") this.drawText(this.dynemicObjects[i3]);
			if (this.dynemicObjects[i3].type == "polygon") this.drawPolygon(this.dynemicObjects[i3]);
		}

		for (var i = 0; i < this.lines.length; i++) {
			if (this.lines[i].type == "line") this.drawLine(this.lines[i]);
		}
		
		this.renderChartCircles();
		this.renderChartRects();

		for (var i2 = 0; i2 < this.objects.length; i2++) {
			if (this.objects[i2].type == "rect") this.drawRect(this.objects[i2]);
			if (this.objects[i2].type == "line") this.drawLine(this.objects[i2]);
			if (this.objects[i2].type == "text") this.drawText(this.objects[i2]);
			if (this.objects[i2].type == "polygon") this.drawPolygon(this.objects[i2]);
		}
	}
}











/*

Object types:

{
	"type": 'rect',
	"color": 'yellow',
	"coordinates": {
		"x": 13,
		"y": 29
	},
	"side":   
		"x": 235,
		"y": 167
	}
}

{
	"type": 'circle',
	"color": 'red',
	"coordinates": {
		"x": 300,
		"y": 400
	},
	"radius": 145
}

{
	"type": 'line',
	"color": 'blue',
	"coordinates": [
		{
			"x": 890,
			"y": 400
		},
		{
			"x": 760,
			"y": 600
		},
	]
}


{
	"type": 'text',
	"color": 'white',
	"text": "400",
	"size": "12",
	"coordinates": {
		"x": 300,
		"y": 400
	}
}


*/