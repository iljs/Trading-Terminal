export class CanvasMap{
	constructor(object){
		this.container  = object.container_id;  // DEFLINE Container ID
		this.controller = object.controller; 	// DEFLINE Controller Type

		this.style 	 	= object.style; 		// DEFLINE Canvas Style {background, cursor}

		this._scale 	= object.scale; 		// DEFLINE Scale Map
		this._move  	= object.move; 			// DEFLINE Move Map
		this._objects 	= object.objects;		// DEFLINE Object for draw
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
		if (object.type == "circle") this._objects.push(Object.assign(object, {"coordinatesData": [object.coordinates.x - object.radius, object.coordinates.y - object.radius, object.radius*2, object.radius*2]}));
		if (object.type == "line") this._objects.push(object);
		if (object.type == "text") this._objects.push(object);
		if (object.type == "polygon") this._objects.push(object);
		this.renderMap();
	}

	set removeObjects(id){
		delete this._objects[id];
		this.renderMap();
	}

	set setAllObjects(object){
		this._objects = object;
		this.renderMap();
	}

	set objects(objects){
		for (var i = 0; i < objects.length; i++) this.addObjects = objects[i];
	}

	get objects(){
		return this._objects;
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





	addDynemicObjectFunction(object){
		let id = this.dynemicObjects.length;

		object.id = id;
		this.addDynemicObject = object;

		return id;
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
		//if (this.macroCollision(viewZone, object.coordinatesData)) return false;

		this.canvasMap.beginPath();
		this.canvasMap.fillStyle = object.color;
		this.canvasMap.rect(
			Math.floor((object.isFixed) ? object.coordinates.x : ((object.coordinates.x - this.move.x) * this.scale.x)), 
			Math.floor((object.isFixed) ? (this.canvas.height - object.coordinates.y) : ((this.canvas.height - (object.coordinates.y - this.move.y)) * this.scale.y)), 
			Math.floor(object.side.x * ((object.isScale) ? this.scale.x : 1)), 
			Math.floor(object.side.y * ((object.isScale) ? this.scale.y : 1))
		);
		this.canvasMap.fill();
	}

	drawElipse(object){
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
		let fontSize = object.size*((object.isScale) ? this.scale.y : 1);
		this.canvasMap.beginPath();
		this.canvasMap.font = "700 " + fontSize + "px " + object.fontFamily;
		this.canvasMap.fillStyle = object.color;
		this.canvasMap.fillText(
			object.text, 
			Math.floor((object.isFixed) ? object.coordinates.x : (object.coordinates.x - this.move.x)*this.scale.x), 
			Math.floor((object.isFixed) ? this.canvas.height - object.coordinates.y : (this.canvas.height - (object.coordinates.y - this.move.y))*this.scale.y)
		);
	}

	renderMap(){
		this.clearMap();

		for (var i = 0; i < this.objects.length; i++) {
			if (this.objects[i].type == "rect") this.drawRect(this.objects[i]);
			if (this.objects[i].type == "circle") this.drawElipse(this.objects[i]);
			if (this.objects[i].type == "line") this.drawLine(this.objects[i]);
			if (this.objects[i].type == "text") this.drawText(this.objects[i]);
			if (this.objects[i].type == "polygon") this.drawPolygon(this.objects[i]);
		}

		for (var i2 = 0; i2 < this.dynemicObjects.length; i2++) {
			if (this.dynemicObjects[i2].type == "rect") this.drawRect(this.dynemicObjects[i2]);
			if (this.dynemicObjects[i2].type == "line") this.drawLine(this.dynemicObjects[i2]);
			if (this.dynemicObjects[i2].type == "text") this.drawText(this.dynemicObjects[i2]);
			if (this.dynemicObjects[i2].type == "polygon") this.drawPolygon(this.dynemicObjects[i2]);
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