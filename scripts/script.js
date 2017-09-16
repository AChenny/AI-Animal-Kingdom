/*jshint esversion: 6 */
//TODO: Change use of canvas to a container and moving elements around to avoid the buffer of frame drawing
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
//Node class
class Node {
	constructor(x, y, r, color, highlight, highlightColor, nodeType) {
		this.x = x;
		this.y = y;
		this.r = r || 20;
		this.color = color || "#ff0";
		this.highlight = highlight || false;
		this.highlightColor = highlightColor || "#0000FF";
		this.nodeType = nodeType || "blank";
	}
	//TODO: **priority** Add movement node and incorporate it with muscle to move the whole creature
	eat(otherCreature) {
		for (let i = 0; i < creatures.length; i++) {
			if (otherCreature == creatures[i]) {
				creatures.splice(i, 1);
				break;
			}
		}
	}
}

//Muscle class
class Muscle {
	constructor(node1, node2, width, color, highlight, highlightColor) {
		this.node1 = node1;
		this.node2 = node2;
		this.width = width || 10;
		this.color = color || "#f00";
		this.highlight = highlight || false;
		this.highlightColor = highlightColor || "#0000FF";
		this.parentCreature;

		//Properties of the nodes this muscle attaches to 
		Object.defineProperties(this, {

			node1x: {
				"get": () => this.node1.x,
				"set": x => {
					this.node1.x = x;
				}
			},

			node1y: {
				"get": () => this.node1.y,
				"set": y => {
					this.node1.y = y;
				}
			},

			node2x: {
				"get": () => this.node2.x,
				"set": x => {
					this.node2.x = x;
				}
			},

			node2y: {
				"get": () => this.node2.y,
				"set": y => {
					this.node2.y = y;
				}
			},

			maxLength: {
				"get": () => this.maxLength,
				"set": maxLength => {
					this.maxLength = maxLength;
				}
			},

			length: {
				"get": () => {
					var dx = (this.node1.x - this.node2.x),
						dy = (this.node1.y - this.node2.y);
					let dist = Math.sqrt((dx * dx) + (dy * dy));
					return dist;
				}
			}
		})
	}

	expandMuscle(maxLength) {
		var expansion = 1;
		var self = this;
		var anchor;
		var mNode;
		//TODO: Implement dragging when contracting muscle

		if (this.node1.nodeType = "movement") {
			anchor = this.node2;
			mNode = this.node1;
		}
		else if (this.node2.nodeType = "movement") {
			anchor = this.node1;
			mNode = this.node2;
		}
		else {
			anchor = false;
		}
		
		if (anchor != false) {
			var startX = mNode.x;
			var startY = mNode.y;
			
			var interval = setInterval(function() {
				var slope = (mNode.y - anchor.y) / (mNode.x - anchor.x);
				var theta = Math.atan(slope);
				var addLength;
				var finish =false;
				
				if (expansion > maxLength) {
					expansion = maxLength;
					finish = true;
				}
				
				// Check which node is closer to the upper left corner
				if (anchor.x + anchor.y > mNode.x + mNode.y) {
					addLength = expansion * -1;
				}
				else {
					addLength = expansion;
				}

				mNode.x = startX + addLength * Math.cos(theta);
				mNode.y = startY + addLength * Math.sin(theta);
				
				expansion += expansion;
				
				if (finish == true) {
					clearInterval(interval);
				}

			}, 32);
		}
		// For expanding a line both ways
		// ---------

		//		var interval = setInterval(function() {
		//			//amount of pixels to add / 2 for each node * slope(rise/run)
		//			let addDX = (expansion / 2);
		//			let addDY = (expansion / 2) * ((self.node2.y - self.node1.y) / (self.node2.x - self.node1.x));
		//
		//			//To check which node is closer to the upper left corner 
		//			if (self.node1.x + self.node1.y > self.node2.x + self.node2.y) {
		//				self.node1.x += addDX;
		//				self.node1.y += addDY;
		//				self.node2.x -= addDX;
		//				self.node2.y -= addDY;
		//			}
		//			else {
		//				self.node2.x += addDX;
		//				self.node2.y += addDY;
		//				self.node1.x -= addDX;
		//				self.node1.y -= addDY;
		//			}
		//			expansion += expansion;
		//			if (expansion > maxLength) {
		//				clearInterval(interval);
		//			}
		//		}, 32);
	}
	//TODO: **priority** Contract muscle function or work it into the expand muscle function
}

//TODO: move these functions within the creature class
function setParentForNodes() {
	this.nodes.forEach(node => {
		node.parentCreature = this;
	});
}

function setParentForMuscles() {
	this.muscles.forEach(muscle => {
		muscle.parentCreature = this;
	});
}

class Creature {
	constructor(nodes, muscles, nodeColors) {
		this.nodes = nodes;
		this.muscles = muscles;
		this.nodeColors = nodeColors || "#ff0";
		setParentForNodes.call(this);
		setParentForMuscles.call(this);

		Object.defineProperties(this, {

			creatureNumber: {
				"get": () => creatures.indexOf(this),
			}
		});
	}

	addNewNode(newNode) {
		newNode.parentCreature = this;
		this.nodes.push(newNode);
	}
	addNewNodes(newNodes) {
		newNodes.forEach(function(node) {
			node.parentCreature = this;
		}, this);
		this.nodes = this.nodes.concat(newNodes);
	}
}

var nodes = [
	new Node(100, 100),
	new Node(200, 200)
];

var muscles = [
	new Muscle(nodes[0], nodes[1])
];

var creatures = [
	new Creature(nodes, muscles)
];

var addNodePressed = false;
var attachMusclePressed = false;
var addLimbPressed = false;

function draw(container, ctx, nodes, creatureMuscles) {

	//draw in the container
	ctx.fillStyle = "#000000";
	ctx.fillRect(container.x, container.y, container.width, container.height);

	// for loop to draw all objects of nodes 
	for (let i = 0; i < creatures.length; i++) {

		var creatureNodes = creatures[i].nodes;

		for (let i = 0; i < creatureNodes.length; i++) {
			ctx.beginPath();
			ctx.arc(creatureNodes[i].x, creatureNodes[i].y, creatureNodes[i].r, 0, 2 * Math.PI);
			ctx.fillStyle = creatureNodes[i].color;
			ctx.closePath();
			ctx.fill();

			//check if node needs to be highlighted
			if (creatureNodes[i].highlight == true) {
				ctx.beginPath();
				ctx.arc(creatureNodes[i].x, creatureNodes[i].y, creatureNodes[i].r, 0, 2 * Math.PI);
				ctx.strokeStyle = creatureNodes[i].highlightColor;
				ctx.lineWidth = 5; // for now
				ctx.closePath();
				ctx.stroke();
			}
		}
		creatureMuscles = creatures[i].muscles;
		//loop and draw every muscle
		for (let i = 0; i < creatureMuscles.length; i++) {
			ctx.beginPath();
			ctx.moveTo(creatureMuscles[i].node1x, creatureMuscles[i].node1y);
			ctx.lineTo(creatureMuscles[i].node2x, creatureMuscles[i].node2y);
			ctx.strokeStyle = creatureMuscles[i].color;
			ctx.lineWidth = creatureMuscles[i].width;
			ctx.closePath();
			ctx.stroke();

			//check if muscle needs to be highlighted
			if (creatureMuscles[i].highlight) {
				creatureMuscles[i].color = "#0000FF";
			}
			else {
				creatureMuscles[i].color = "#f00";
			}
		}
	}
}

//Handle checking if click is on stroke
function handleStrokeCheck() {
	canvas.addEventListener("mousedown", function(e) {
		var x = e.clientX,
			y = e.clientY;

		for (let i = 0; i < creatures.length; i++) {
			var creature = creatures[i];

			for (let i = 0; i < creature.muscles.length; i++) {
				ctx.beginPath();
				ctx.moveTo(creature.muscles[i].node1x, creature.muscles[i].node1y);
				ctx.lineTo(creature.muscles[i].node2x, creature.muscles[i].node2y);
				ctx.lineWidth = creature.muscles[i].width;
				ctx.closePath();

				if (ctx.isPointInStroke(x, y) && creature.muscles[i].highlight == false) {
					creature.muscles[i].highlight = true;
				}

				else if (ctx.isPointInStroke(x, y) && creature.muscles[i].highlight == true) {
					creature.muscles[i].highlight = false;
				}

			}
		}
	});
}

//Handle moving a node with mousedrag
function handleMouseDrag(canvas, creatureNodes) {
	var isDrag = false;
	var dragNode;
	var offset = {
		x: 0,
		y: 0,
		x0: 0,
		y0: 0
	};


	canvas.addEventListener("mousedown", function(e) {
		//mousedown then save the position in var x and y
		var x = e.offsetX,
			y = e.offsetY;

		//loop through all the nodes to find the first node that is within radius of the mouse click
		for (let i = 0; i < creatures.length; i++) {
			var creatureNodes = creatures[i].nodes;

			for (let i = 0; i < creatureNodes.length; i++) {
				if (Math.pow(x - creatureNodes[i].x, 2) + Math.pow(y - creatureNodes[i].y, 2) < Math.pow(creatureNodes[i].r, 2)) {
					isDrag = true;
					dragNode = creatureNodes[i];

					//offset.x&y = where the node is currently
					//offset x0&y0 = where the user clicked
					offset = {
						x: dragNode.x,
						y: dragNode.y,
						x0: x,
						y0: y
					};
					return;
				}
			}
		}
	});
	// when mouse moves and isDrag is true, move the node's position
	canvas.addEventListener("mousemove", function(e) {
		/*when the user moves the mouse, take the difference of where his mouse is right now and where the user clicked.
		Then, add that to where the node is right now to find the correct placement of the node without centering on your mouse 
		*/
		if (isDrag) {
			dragNode.x = e.offsetX - offset.x0 + offset.x; // where the mouse is right now - where the user mousedown + where the node is right now
			dragNode.y = e.offsetY - offset.y0 + offset.y;
		}
	});

	canvas.addEventListener("mouseup", function(e) {
		isDrag = false;
	});

	canvas.addEventListener("mouseleave", function(e) {
		isDrag = false;
	});
}

//Handle highlighting and button functionality
function handleMouseClick(canvas, nodes, muscles) {
	var nodeIsHighlighted;
	var highlightedNode;
	var muscleIsHighlighted;
	var highlightedMuscle;

	canvas.addEventListener("mousedown", function(e) {
		var x = e.offsetX,
			y = e.offsetY;

		var loopbreak = false;

		for (let i = 0; i < creatures.length; i++) {

			var creatureNodes = creatures[i].nodes;

			for (let i = 0; i < creatureNodes.length; i++) {
				// check if click is within radius of a node, if it is, highlight and set highlight boolean to true.

				if (Math.pow(x - creatureNodes[i].x, 2) + Math.pow(y - creatureNodes[i].y, 2) < Math.pow(creatureNodes[i].r, 2)) {
					var clickedNode = creatureNodes[i];

					if (addNodePressed) {
						console.log("Not valid. Cannot add a node on top of another node.");
						loopbreak = true;
						break;
					}

					else if (addLimbPressed) {
						console.log("Not valid. Cannot add a limb on top of another node.");
						loopbreak = true;
						break;
					}
					else if (attachMusclePressed) {
						if (highlightedNode == clickedNode) {
							console.log("Not valid. Cannot attach muscle to the same node.");
							loopbreak = true;
							break;
						}
						else {
							var newMuscle;

							if (highlightedNode.parentCreature.creatureNumber == clickedNode.parentCreature.creatureNumber) {
								newMuscle = new Muscle(highlightedNode, clickedNode);
								highlightedNode.parentCreature.muscles.push(newMuscle);
								attachMuscle();
								highlightedNode.highlight = false;
								nodeIsHighlighted = false;
								devTools(true, false, false, false);
							}
							else {
								var newNodes = [];
								var newMuscles = [];

								if (highlightedNode.parentCreature.creatureNumber > clickedNode.parentCreature.creatureNumber) {
									highlightedNode.parentCreature.nodes.forEach(function(node) {
										newNodes.push(node);
									});
									highlightedNode.parentCreature.muscles.forEach(function(muscle) {
										newMuscles.push(muscle);
									});
									newMuscle = new Muscle(highlightedNode, clickedNode);
									clickedNode.parentCreature.muscles.push(newMuscle);
									clickedNode.parentCreature.muscles = clickedNode.parentCreature.muscles.concat(newMuscles);
									creatures.splice(creatures.indexOf(highlightedNode.parentCreature), 1);
									clickedNode.parentCreature.addNewNodes(newNodes);
								}
								else {
									clickedNode.parentCreature.nodes.forEach(function(node) {
										newNodes.push(node);
										console.log("Clicked node is bigger.");
									});
									clickedNode.parentCreature.muscles.forEach(function(muscle) {
										newMuscles.push(muscle);
									});
									newMuscle = new Muscle(highlightedNode, clickedNode);
									highlightedNode.parentCreature.muscles.push(newMuscle);
									highlightedNode.parentCreature.muscles = highlightedNode.parentCreature.muscles.concat(newMuscles);
									creatures.splice(creatures.indexOf(clickedNode.parentCreature), 1);
									highlightedNode.parentCreature.addNewNodes(newNodes);
								}
								highlightedNode.highlight = false;
								attachMuscle();
								devTools(true, false, false, false);
							}
						}
					}
					//no button pressed - highlight/unhighlight node or muscle
					else {
						if (muscleIsHighlighted) {
							muscleIsHighlighted = false;
							highlightedMuscle.highlight = false;
							highlightedMuscle = undefined;
						}

						if (nodeIsHighlighted || creatureNodes[i].highlight) {

							if (highlightedNode != creatureNodes[i]) { //Highlights another node if its not the same node
								highlightedNode.highlight = false;
								highlightedNode = creatureNodes[i];
								highlightedNode.highlight = true;
								devTools(false, true, true, true);
							}
							else { // Unhighlights the node if clicked twice
								highlightedNode = creatureNodes[i];
								highlightedNode.highlight = false;
								nodeIsHighlighted = false;
								highlightedNode = undefined;
								devTools(true, false, false, false);
							}
						}
						else { // Highlights the node
							highlightedNode = creatureNodes[i];
							highlightedNode.highlight = true;
							nodeIsHighlighted = true;
							devTools(false, true, true, true);
						}
						loopbreak = true;
						break;
					}
				}
			}
		}

		// if click was not in radius of any nodes then check for add limb or create node button press. 
		if (!loopbreak) {
			loopbreak = false;
			var newNode;
			if (addNodePressed) {
				newNode = new Node(x, y);
				let newNodes = [];
				let newMuscles = [];
				newNodes.push(newNode);
				var newCreature = new Creature(newNodes, newMuscles);
				creatures.push(newCreature);
				addNode();
				addNodePressed = false;
				devTools(true, false, false, false);
			}
			else if (addLimbPressed) {
				newNode = new Node(x, y);
				let newMuscle = new Muscle(newNode, highlightedNode);
				highlightedNode.parentCreature.addNewNode(newNode);
				highlightedNode.parentCreature.muscles.push(newMuscle);
				addLimb();
				addLimbPressed = false;
				highlightedNode.highlight = false;
				nodeIsHighlighted = false;
				highlightedNode = undefined;
				devTools(true, false, false, false);
			}
			else {
				for (let i = 0; i < creatures.length; i++) {
					var creature = creatures[i];

					for (let i = 0; i < creature.muscles.length; i++) {
						ctx.beginPath();
						ctx.moveTo(creature.muscles[i].node1x, creature.muscles[i].node1y);
						ctx.lineTo(creature.muscles[i].node2x, creature.muscles[i].node2y);
						ctx.lineWidth = creature.muscles[i].width;
						ctx.closePath();

						if (ctx.isPointInStroke(x, y) && creature.muscles[i].highlight == false) {
							creature.muscles[i].highlight = true;
							muscleIsHighlighted = true;
							highlightedMuscle = creature.muscles[i];
							if (nodeIsHighlighted) {
								highlightedNode.highlight = false;
								nodeIsHighlighted = false;
								highlightedNode = undefined;
							}
							devTools(false, false, false, false, true, true);
							break;
						}
						else if (ctx.isPointInStroke(x, y) && creature.muscles[i].highlight == true) {
							creature.muscles[i].highlight = false;
							muscleIsHighlighted = false;
							highlightedMuscle = undefined;
							devTools(true, false, false, false, false, false);
							break;
						}
					}
				}
			}
		}
	});
}

//Handle Devtools
function devTools(addNode, removeNode, attachMuscle, addLimb, increaseLength, decreaseLength) {
	//TODO: add remove Muscle functionality
	var creatureNumberHTML = document.getElementById("creatureNumber");
	var selectedHTML = document.getElementById("selected");
	var addNodeB = document.getElementById("addNode");
	var removeNodeB = document.getElementById("removeNode");
	var attachMuscleB = document.getElementById("attachMuscle");
	var addLimbB = document.getElementById("addLimb");
	var increaseLengthB = document.getElementById("increaseLength");
	var decreaseLengthB = document.getElementById("decreaseLength");

	addNodeB.disabled = (addNode) ? false : true;
	removeNodeB.disabled = (removeNode) ? false : true;
	attachMuscleB.disabled = (attachMuscle) ? false : true;
	addLimbB.disabled = (addLimb) ? false : true;
	increaseLengthB.disabled = (increaseLength) ? false : true || false;
	decreaseLengthB.disabled = (decreaseLength) ? false : true || false;

	loop:
		for (let i = 0; i < creatures.length; i++) {
			var creatureNumber = i;
			var creature = creatures[i];
			var selected = false;

			for (let i = 0; i < creature.nodes.length; i++) {
				if (creature.nodes[i].highlight == true) {
					selectedHTML.innerHTML = `Selected: ${i} node`;
					creatureNumberHTML.innerHTML = `Creature Number: ${creatureNumber}`;
					selected = true;
					break loop;
				}
			}
			for (let i = 0; i < creature.muscles.length; i++) {
				if (creature.muscles[i].highlight) {
					selectedHTML.innerHTML = `Selected: ${i} muscle`;
					creatureNumberHTML.innerHTML = `Creature Number: ${creatureNumber}`;
					selected = true;
					break loop;
				}
			}

			if (!selected) {
				creatureNumberHTML.innerHTML = "Creature Number: -";
				selectedHTML.innerHTML = "Selected: None";
			}
		}
}

//Handle add node button
function addNode() {
	var addNodeB = document.getElementById("addNode");

	if (addNodePressed) {
		addNodePressed = false;
		addNodeB.style.background = "";
	}
	else {
		addNodePressed = true;
		addNodeB.style.backgroundColor = "#808080";
		//and unhighlight
	}
}

//Handle remove node button
function removeNode() {
	for (let i = 0; i < creatures.length; i++) {
		var creatureNodes = creatures[i].nodes;
		var creatureMuscles = creatures[i].muscles;

		for (let i = 0; i < creatureNodes.length; i++) {
			if (creatureNodes[i].highlight == true) {

				let highlightedNode = creatureNodes[i];

				for (let i = 0; i < creatureMuscles.length; i++) {
					if (creatureMuscles[i].node1 == highlightedNode || creatureMuscles[i].node2 == highlightedNode) {
						creatureMuscles.splice(i, 1);
						i--;
					}
				}
				creatureNodes.splice(i, 1);
			}
		}
	}
	devTools(true, false, false, false);
}

//Handle attach muscle button
function attachMuscle() {
	var attachMuscleB = document.getElementById("attachMuscle");

	if (attachMusclePressed) {
		attachMusclePressed = false;
		attachMuscleB.style.background = "";
	}
	else {
		attachMusclePressed = true;
		attachMuscleB.style.backgroundColor = "#808080";
	}
}

//Handle add limb button 
function addLimb() {
	var addLimbB = document.getElementById("addLimb");

	if (addLimbPressed) {
		addLimbPressed = false;
		addLimbB.style.background = "";
	}
	else {
		addLimbPressed = true;
		addLimbB.style.backgroundColor = "#808080";
	}
}

//TODO: Function to check if any offense nodes are in the vicinity of other creatures to eat
function checkIfEat(node1, node2, radius) {
	//radius is around 37-38 for this formula to work
	var x1 = node1.x,
		y1 = node1.y,
		x2 = node2.x,
		y2 = node2.y;

	var dx = x2 - x1;
	var dy = y2 - y1;
	var radiusSum = radius + radius;
	var dist = Math.sqrt((dx * dx) + (dy * dy));


	if (dist < radiusSum) {
		console.log("Has eaten.");
	}
	else if (dist > radiusSum) {
		console.log("Has not eaten.");
	}
}

//Dropdown menu for commands queue
function dropDownMenu(id) {
	var arrayDropdown = document.getElementById("arrayDropdown");
	var typeDropdown = document.getElementById("typeDropdown");
	var creatureDropdown = document.getElementById("creatureDropdown");

	if (id == "arrayButton") {
		//if type content is showing, remove it
		if (typeDropdown.classList.contains("show")) {
			typeDropdown.classList.remove("show");
		}
		else if (creatureDropdown.classList.contains("show")) {
			creatureDropdown.classList.remove("show");
		}
		arrayDropdown.classList.toggle("show");

	}
	else if (id == "typeButton") {
		if (arrayDropdown.classList.contains("show")) {
			arrayDropdown.classList.remove("show");
		}
		else if (creatureDropdown.classList.contains("show")) {
			creatureDropdown.classList.remove("show");
		}
		typeDropdown.classList.toggle("show");
	}
	else if (id == "creatureButton") {
		if (arrayDropdown.classList.contains("show")) {
			arrayDropdown.classList.remove("show");
		}
		else if (typeDropdown.classList.contains("show")) {
			typeDropdown.classList.remove("show");
		}
		creatureDropdown.classList.toggle("show");


	}

}

window.onclick = function(event) {
	if (!event.target.matches('.dropbtn')) {

		var dropdowns = document.getElementsByClassName("dropdown-content");
		var i;
		for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
	}
}

function populateSelections() {
	var creatureSel = document.getElementById("creatureSelection");
	var typeSelection = document.getElementById("typeSelection");
	var arraySelection = document.getElementById("arraySelection");
	var cFragment = document.createDocumentFragment();
	var aFragment = document.createDocumentFragment();

	creatures.forEach(function(creature, index) {
		let opt = document.createElement('option');
		opt.innerHTML = creature.creatureNumber;
		opt.value = index;
		cFragment.appendChild(opt);
	})
	if (typeSelection.options[typeSelection.selectedIndex].value == "muscle") {
		var selectedCreatureIndex = creatureSelection.options[creatureSelection.selectedIndex].value;

		creatures[selectedCreatureIndex].muscles.forEach(function(muscle, index) {
			let opt = document.createElement('option');
			opt.innerHTML = index;
			opt.value = muscle;
			aFragment.appendChild(opt);
		});
	}
	arraySelection.appendChild(aFragment);
	creatureSel.appendChild(cFragment);
}

//Main - Grabs document elements to draw a canvas on, init node and muscle arrays and then continuously updates frame to redraw
function main() {
	var container = {
		x: 0,
		y: 0,
		get width() {
			return canvas.width;
		},
		get height() {
			return canvas.height;
		}
	};
	//	handleStrokeCheck();
	handleMouseDrag(canvas, nodes);
	handleMouseClick(canvas, nodes, muscles);
	populateSelections();
	// refresh and redraw with new properties in an updateframe infinite loop
	function updateFrame() {
		draw(container, ctx, nodes, muscles);
		requestAnimationFrame(updateFrame);

	}
	updateFrame();
}

main();
