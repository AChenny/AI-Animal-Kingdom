/*jshint esversion: 6 */
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
		this.attachedMuscles = [];
	}
	eat(otherCreature) {
		for (let i = 0; i < creatures.length; i++) {
			if (otherCreature == creatures[i]) {
				creatures.splice(i, 1);
				break;
			}
		}
	}
}

function setParentMuscleforNodes() {
	this.node1.attachedMuscles.push(this);
	this.node2.attachedMuscles.push(this);
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
		this.parentCreature = undefined;
		this.normalLength = 150;
		this.maxLength = 200;
		this.activated = undefined;
		setParentMuscleforNodes.call(this);

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

			//			maxLength: {
			//				"get": () => this.maxLength,
			//				"set": maxLength => {
			//					this.maxLength = maxLength;
			//				}
			//			},

			length: {
				"get": () => {
					var dx = (this.node1.x - this.node2.x),
						dy = (this.node1.y - this.node2.y);
					let dist = Math.sqrt((dx * dx) + (dy * dy));
					return dist;
				}
			}
		});
	}

	expandMuscle(maxLength, _anchor) {
		var expansion = 1;
		//		var self = this;
		var anchor;
		var mNode;
		var node1 = this.node1;
		var node2 = this.node2;

		if (node1.nodeType == "movement" || node2.nodeType == "movement") {
			mNode = node1.nodeType == "movement" ? node2 : node1;
			anchor = node1.nodeType == "movement" ? node1 : node2;
		} else {
			anchor = _anchor || node1;
			mNode = node1 == anchor ? node2 : node1;
		}
		//and anchor is stated and will expand one side of the muscle
		if (anchor != false) {
			var startX = mNode.x;
			var startY = mNode.y;
			var addLength;

			var interval = setInterval(function () {
				var slope = (mNode.y - anchor.y) / (mNode.x - anchor.x);
				var theta = Math.atan(slope);
				var finish = false;

				if (expansion > maxLength) {
					expansion = maxLength;
					finish = true;
				}

				// this will check which node is closer to the left and will expand the muscle the right way
				addLength = mNode.x < anchor.x ? -expansion : expansion;

				mNode.x = startX + addLength * Math.cos(theta);
				mNode.y = startY + addLength * Math.sin(theta);

				expansion += expansion; // add length exponentially to simulate acceleration

				if (finish == true) {
					clearInterval(interval);
				}

			}, 32);
		}
		// TODO: If an anchor is not specified, then expand both nodes equally by the expansion

	}

	contractMuscle(reduceLength, _anchor) {

		var node1 = this.node1;
		var node2 = this.node2;
		var anchor;
		var mNode;
		var self = this;

		//If there is a movement node, set it as the anchor 
		if (node1.nodeType == "movement" || node2.nodeType == "movement") {
			mNode = node1.nodeType == "movement" ? node2 : node1;
			anchor = node1.nodeType == "movement" ? node1 : node2;
		} else {
			// if the anchor is specified when called, set it as the anchor, and then set the other node as the mNode
			anchor = _anchor || node1;
			mNode = node1 == anchor ? node2 : node1;
		}
		//TODO: Add functionality when there is no movement node nor the anchor node is not specified
		var startX = mNode.x;
		var startY = mNode.y;
		var stop = false;
		var reduction = 1;

		//find how which node is closer to the left to find which way to move the nodes
		reduction = mNode.x < anchor.x ? -reduction : reduction;

		var interval = setInterval(function () {

			if (Math.abs(reduction) > reduceLength) {
				stop = true;
				reduction = reduction > 0 ? reduceLength : -reduceLength;
			}

			var slope = (mNode.y - anchor.y) / (mNode.x - anchor.x);
			var theta = Math.atan(slope);
			mNode.x = startX - reduction * Math.cos(theta);
			mNode.y = startY - reduction * Math.sin(theta);

			if (stop == true) {
				//once the muscle is contracted, check other muscles connected to the mNode, if their length has changed, contract it back to normalLength
				for (let i = 0; i < mNode.attachedMuscles.length; i++) {
					if (mNode.attachedMuscles[i] == self) {
						continue;
					}
					if (mNode.attachedMuscles[i].length != mNode.attachedMuscles[i].normalLength) {
						//missing length = current muscle length - normal length
						var missingLength = mNode.attachedMuscles[i].length - mNode.attachedMuscles[i].normalLength;

						if (missingLength > 0) {
							mNode.attachedMuscles[i].contractMuscle(Math.abs(missingLength), mNode);
						} else {
							mNode.attachedMuscles[i].expandMuscle(Math.abs(missingLength), mNode);
						}
					}
				}
				clearInterval(interval);
			}
			reduction += reduction;
		}, 32);
	}
}
//TODO: #2 Priority: Move these functions within the creature class
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
		newNodes.forEach(function (node) {
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
			} else {
				creatureMuscles[i].color = "#f00";
			}
		}
	}
}

//Handle checking if click is on stroke
function handleStrokeCheck() {
	canvas.addEventListener("mousedown", function (e) {
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
				} else if (ctx.isPointInStroke(x, y) && creature.muscles[i].highlight == true) {
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


	canvas.addEventListener("mousedown", function (e) {
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
	canvas.addEventListener("mousemove", function (e) {
		/*when the user moves the mouse, take the difference of where his mouse is right now and where the user clicked.
		Then, add that to where the node is right now to find the correct placement of the node without centering on your mouse 
		*/
		if (isDrag) {
			dragNode.x = e.offsetX - offset.x0 + offset.x; // where the mouse is right now - where the user mousedown + where the node is right now
			dragNode.y = e.offsetY - offset.y0 + offset.y;
		}
	});

	canvas.addEventListener("mouseup", function (e) {
		isDrag = false;
	});

	canvas.addEventListener("mouseleave", function (e) {
		isDrag = false;
	});
}



//Handle highlighting and button functionality
function handleMouseClick(canvas, nodes, muscles) {
	var nodeIsHighlighted;
	var highlightedNode;
	var muscleIsHighlighted;
	var highlightedMuscle;

	canvas.addEventListener("mousedown", function (e) {
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
					} else if (addLimbPressed) {
						console.log("Not valid. Cannot add a limb on top of another node.");
						loopbreak = true;
						break;
					} else if (attachMusclePressed) {
						if (highlightedNode == clickedNode) {
							console.log("Not valid. Cannot attach muscle to the same node.");
							loopbreak = true;
							break;
						} else {
							var newMuscle;

							if (highlightedNode.parentCreature.creatureNumber == clickedNode.parentCreature.creatureNumber) {
								newMuscle = new Muscle(highlightedNode, clickedNode);
								highlightedNode.parentCreature.muscles.push(newMuscle);
								attachMuscle();
								highlightedNode.highlight = false;
								nodeIsHighlighted = false;
								devTools(true, false, false, false);
							} else {
								var newNodes = [];
								var newMuscles = [];

								if (highlightedNode.parentCreature.creatureNumber > clickedNode.parentCreature.creatureNumber) {
									highlightedNode.parentCreature.nodes.forEach(function (node) {
										newNodes.push(node);
									});
									highlightedNode.parentCreature.muscles.forEach(function (muscle) {
										newMuscles.push(muscle);
									});
									newMuscle = new Muscle(highlightedNode, clickedNode);
									clickedNode.parentCreature.muscles.push(newMuscle);
									clickedNode.parentCreature.muscles = clickedNode.parentCreature.muscles.concat(newMuscles);
									creatures.splice(creatures.indexOf(highlightedNode.parentCreature), 1);
									clickedNode.parentCreature.addNewNodes(newNodes);
								} else {
									clickedNode.parentCreature.nodes.forEach(function (node) {
										newNodes.push(node);
										console.log("Clicked node is bigger.");
									});
									clickedNode.parentCreature.muscles.forEach(function (muscle) {
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
							} else { // Unhighlights the node if clicked twice
								highlightedNode = creatureNodes[i];
								highlightedNode.highlight = false;
								nodeIsHighlighted = false;
								highlightedNode = undefined;
								devTools(true, false, false, false);
							}
						} else { // Highlights the node
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
			} else if (addLimbPressed) {
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
			} else {
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
						} else if (ctx.isPointInStroke(x, y) && creature.muscles[i].highlight == true) {
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
		populateArraySelection('typeSelection', 'creatureSelection', 'arraySelection');
		populateSelections();
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
	} else {
		addNodePressed = true;
		addNodeB.style.backgroundColor = "#808080";
		//and unhighlight
	}
}

//Handle remove node button
function removeNode() {
	//FIXME: Removing a node doesnt remove the creature if its the last node 
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
	} else {
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
	} else {
		addLimbPressed = true;
		addLimbB.style.backgroundColor = "#808080";
	}
}

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
	} else if (dist > radiusSum) {
		console.log("Has not eaten.");
	}
}

var commands = [];

function playCommands() {
	//for the length of the commands, run an interval of about 1 second to run a command
	var interval = setInterval(function () {
		if (commands.length == 0) {
			clearInterval(interval);
		} else if (commands[0].type == "muscle") {
			let selected = creatures[commands[0].creatureNumber].muscles[commands[0].arrayNumber];
			if (selected.activated) {
				selected.contractMuscle(selected.length - selected.normalLength);
				selected.activated = false;
			} else {
				selected.expandMuscle(selected.maxLength - selected.length);
				selected.activated = true;
			}
		} else if (commands[0].type == "node") {
			let selected = creatures[commands[0].creatureNumber].nodes[commands[0].arrayNumber];
			console.log("Node activated");
			console.log(selected);
		}
		commands.splice(0, 1);
	}, 1000);
}

function handleAddtoQueue() {
	var commandForm = document.getElementById("commandForm");
	var creatureSelection = document.getElementById("creatureSelection");
	var typeSelection = document.getElementById("typeSelection");
	var arraySelection = document.getElementById("arraySelection");

	if (typeSelection.value == "muscle") {
		//change these commands to add to commands rather than do them
		var command = {
			creatureNumber: creatureSelection.value,
			type: typeSelection.value,
			arrayNumber: arraySelection.value
		};
		commands.push(command);
	} else if (typeSelection.value == "node") {

		let command = {
			creatureNumber: creatureSelection.value,
			type: typeSelection.value,
			arrayNumber: arraySelection.value
		};
		commands.push(command);
	}

	commandForm.reset();
}

//FIXME: Populate selections needs to update whenever i remove a node
function populateSelections() {
	var creatureSel = document.getElementById("creatureSelection");
	creatureSel.innerHTML = "";

	for (let i = 0; i < creatures.length; i++) {
		//for every creature create an option with value of i, and an innerHTML of i
		let newOption = document.createElement("option");
		newOption.innerHTML = i;
		newOption.value = i;
		creatureSel.options.add(newOption);
	}
}

function populateArraySelection(type, creature, array) {
	var type = document.getElementById(type);
	var creature = document.getElementById(creature);
	var array = document.getElementById(array);
	//remove all other innerHTML in this and then for look to take the values of the other selections 
	//Take the id of this (whatever called the onchance) and the array selection, and the creature number to populate the array
	//check if type or creature is empty - if it is, then array.innerHTML will remain empty. 
	array.innerHTML = "";

	//if they both have a value, take both those values and plug them into a function to populate the requested arraylist
	var creatureNumber = creature.value;
	var typeValue = type.value;

	if (typeValue == "muscle") {
		for (let i = 0; i < creatures[creatureNumber].muscles.length; i++) {
			var newOption = document.createElement("option");
			newOption.innerHTML = i;
			newOption.value = i;
			array.options.add(newOption);
		}
	} else if (typeValue == "node") {
		for (let i = 0; i < creatures[creatureNumber].nodes.length; i++) {
			let newOption = document.createElement("option");
			newOption.innerHTML = i;
			newOption.value = i;
			array.options.add(newOption);
		}
	}
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
	populateArraySelection('typeSelection', 'creatureSelection', 'arraySelection');
	// refresh and redraw with new properties in an updateframe infinite loop
	function updateFrame() {
		draw(container, ctx, nodes, muscles);
		requestAnimationFrame(updateFrame);

	}
	updateFrame();
}

main();
