/*jshint esversion: 6 */
//draw everything on canvas
//TODO: Change use of canvas to a container and moving elements around to avoid the buffer of frame drawing
//Node class
class Node {
	constructor(x, y, r, color, highlight, highlightColor) {
		this.x = x;
		this.y = y;
		this.r = r || 20;
		this.color = color || "#ff0";
		this.highlight = highlight || false;
		this.highlightColor = highlightColor || "#0000FF";
	}
}

//Muscle class
class Muscle {
	constructor(node1, node2, width, color) {
		this.node1 = node1;
		this.node2 = node2;
		this.width = width || 5;
		this.color = color || "#f00";


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
					this.node2.x = y;
				}
			}
		});
	}
}

var nodes = [
		new Node(100, 100),
		new Node(200, 200)
];

var muscles = [
		new Muscle(nodes[0], nodes[1])
];

var addNodePressed = false;
var removeNodePressed = false;
var attachMusclePressed = false;
var addLimbPressed = false;


function draw(container, ctx, nodes, muscles) {

	//draw in the container
	ctx.fillStyle = "#000000";
	ctx.fillRect(container.y, container.x, container.width, container.height);

	// for loop to draw all objects of nodes 
	for (var i = 0; i < nodes.length; i++) {
		ctx.beginPath();
		ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, 2 * Math.PI);
		ctx.fillStyle = nodes[i].color;
		ctx.closePath();
		ctx.fill();

		//check if node needs to be highlighted
		if (nodes[i].highlight == true) {
			ctx.beginPath();
			ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, 2 * Math.PI);
			ctx.strokeStyle = nodes[i].highlightColor;
			ctx.lineWidth = 5; // for now
			ctx.closePath();
			ctx.stroke();
		}
	}
	//loop and draw every muscle
	for (i = 0; i < muscles.length; i++) {
		ctx.beginPath();
		ctx.moveTo(muscles[i].node1x, muscles[i].node1y);
		ctx.lineTo(muscles[i].node2x, muscles[i].node2y);
		ctx.strokeStyle = muscles[i].color;
		ctx.lineWidth = muscles[i].width;
		ctx.closePath();
		ctx.stroke();
	}
}

//Handle moving a node with mousedrag
function handleMouseDrag(canvas, nodes) {
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
		for (var i in nodes) {

			if (Math.pow(x - nodes[i].x, 2) + Math.pow(y - nodes[i].y, 2) < Math.pow(nodes[i].r, 2)) {
				isDrag = true;
				dragNode = nodes[i];

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

//Handle highlighting and adding nodes
function handleMouseClick(canvas, nodes, muscles) {
	var node1;
	var node2;
	var highlighted;
	var highlightedNode;

	canvas.addEventListener("mousedown", function (e) {
		var x = e.offsetX,
				y = e.offsetY;

		var loopbreak = false;

		for (var i = 0; i < nodes.length; i++) {
			// check if click is within radius of a node, if it is, highlight and set highlight boolean to true.
			// TODO: Finish add limb functionality
			// TODO: Unhighlight functionality

			if (Math.pow(x - nodes[i].x, 2) + Math.pow(y - nodes[i].y, 2) < Math.pow(nodes[i].r, 2)) {
				var clickedNode = nodes[i];

				if (addNodePressed) {
					// FIXME: Will still add the node (break call doesnt work)
					console.log("Not valid. Cannot add a node on top of another node.");
					lookbreak = true;
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
					}
					else {
						newMuscle = new Muscle (highlightedNode, clickedNode);
						muscles.push(newMuscle);
						attachMuscle();
						highlightedNode.highlight = false;
					}
				}
				//no button pressed - highlight node
				else {
					highlighted = true;
					highlightedNode = nodes[i];
					nodes[i].highlight = true;
					devTools(nodes, false, true, true, true);
					loopbreak = true;
					break;
				}
			}
		}
		// if click was not in radius of any nodes then check for add limb or create node button press. 
		if (!loopbreak) {
			loopbreak = false;
			if (addNodePressed) {
				var newNode = new Node(x, y);
				nodes.push(newNode);
				addNode();
				addNodePressed = false;
			} else if (addLimbPressed) {
				var newNode = new Node(x, y);
				var newMuscle = new Muscle(newNode, highlightedNode);
				nodes.push(newNode);
				muscles.push(newMuscle);
				addLimbPressed = false;
			}
			devTools(nodes, true, false, false, false);
		}
	})
}

//Function to handle Devtools
function devTools(nodes, addNode, removeNode, attachMuscle, addLimb) {

	var selected = document.getElementById("selected");
	var commands = document.getElementById("commands")
	var addNodeB = document.getElementById("addNode");
	var removeNodeB = document.getElementById("removeNode");
	var attachMuscleB = document.getElementById("attachMuscle");
	var addLimbB = document.getElementById("addLimb");

	(addNode) ? addNodeB.disabled = false: addNodeB.disabled = true;
	(removeNode) ? removeNodeB.disabled = false: removeNodeB.disabled = true;
	(attachMuscle) ? attachMuscleB.disabled = false: attachMuscleB.disabled = true;
	(addLimb) ? addLimbB.disabled = false: addLimbB.disabled = true;


	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i].highlight == true) {
			selected.innerHTML = `Selected: ${i} node`;
			return;
		} else {
			selected.innerHTML = "Selected: None";
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
	// FIXME: If there are more than 1 muscle, than it will not remove all the muscles. 
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i].highlight == true) {

			for (var x = 0; x < muscles.length; x++) {
				if (muscles[x].node1 == nodes[i] || muscles[x].node2 == nodes[i]) {
					muscles.splice(x, 1);
				}
			}
			nodes.splice(i, 1);

		}
	}

	devTools(nodes, true, false, false, false);
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
}


//Main - Grabs document elements to draw a canvas on, init node and muscle arrays and then continuously updates frame to redraw
function main() {
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
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

	handleMouseDrag(canvas, nodes);
	handleMouseClick(canvas, nodes, muscles);

	// refresh and redraw with new properties in an updateframe infinite loop
	function updateFrame() {
		ctx.save();
		draw(container, ctx, nodes, muscles);
		ctx.restore();
		requestAnimationFrame(updateFrame);
	}
	updateFrame();
}

main();
