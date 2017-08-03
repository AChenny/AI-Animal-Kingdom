//draw - fill container, draw first node, draw second node
function draw(container, ctx, node1, node2, muscle) {
	//draw in the container
	ctx.fillStyle = "#000000";
	ctx.fillRect(container.y, container.x, container.width, container.height);

	//draw first node
	ctx.arc(node1.x, node1.y, node1.r, 0, 2 * Math.PI);
	ctx.fillStyle = node1.color;
	ctx.closePath();
	ctx.fill();

	//draw second node
	ctx.arc(node2.x, node2.y, node2.r, 0, 2 * Math.PI);
	ctx.strokeStyle = node2.color;
	ctx.fillStyle = node2.color;
	ctx.closePath();
	ctx.fill();

	//draw muscle
	ctx.beginPath();
	ctx.moveTo(muscle.node1x, muscle.node1y);
	ctx.lineTo(muscle.node2x, muscle.node2y);
	ctx.strokeStyle = muscle.color;
	ctx.lineWidth = muscle.width;
	ctx.closePath();
	ctx.stroke();
}

//function node - contain all node values

function Node(x, y, r, color) {
	this.x = x;
	this.y = y;
	this.r = r || 20;
	this.color = color || "#ff0"
};

/*funciton muscle - set the muscle values and hold them in this function
*/

function Muscle(node1, node2, width, color) {
	this.node1 = node1;
	this.node2 = node2;
	this.width = width || 5;
	this.color = color || "#f00";

	// get set methods to access/modify the positions of the nodes
	Object.defineProperties(this, {

		node1x: {
			"get": () => this.node1.x,
			"set": x => {
				this.node1.x = x
			}
		},

		node1y: {
			"get": () => this.node1.y,
			"set": y => {
				this.node1.y = y
			}
		},

		node2x: {
			"get": () => this.node2.x,
			"set": x => {
				this.node2.x = x
			}
		},

		node2y: {
			"get": () => this.node2.y,
			"set": y => {
				this.node2.x = y
			}
		}
	});
};

//function handlemousedrag variables for dragging, object for offset containing x, y, x0, y0

function handleMouseDrag(canvas, nodes) {
	var isDrag = false;
	var dragNode = undefined; // node to be dragged
	var offset = {
		x: 0,
		y: 0,
		x0: 0,
		y0: 0
	};

	//handle mousedown
	canvas.addEventListener("mousedown", function (e) {
		var x = e.offsetX,
				y = e.offsetY;

		// do a for loop to find which node it is targetting
		for (var i in nodes) {
			// check if where the user clicked is within the radius of the node
			if (Math.pow(x - nodes[i].x, 2) + Math.pow(y - nodes[i].y, 2) < Math.pow(nodes[i].r, 2)) {
				isDrag = true;
				dragNode = nodes[i];
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
		if (isDrag) {
			dragNode.x = e.offsetX - offset.x0 + offset.x;
			dragNode.y = e.offsetY - offset.y0 + offset.y;
		}
	});

	canvas.addEventListener("mouseup", function (e) {
		isDrag = false;
	});

	canvas.addEventListener("mouseleave", function (e) {
		isDrag = false;
	});
};

//function main new object calls for nodes and muscle, instantiate the canvas and container, call handlemousedrag and then update frame

function main() {
	var node1 = new Node(300, 300);
	var node2 = new Node(200, 200);
	var muscle = new Muscle(node1, node2);

	var canvas = document.getElementById("canvas");
	var container = {
		x: 0,
		y: 0,
		get width() {
			return canvas.width
		},
		get height() {
			return canvas.height
		}
	};
	var ctx = canvas.getContext("2d");

	handleMouseDrag(canvas, [node1, node2]);
	// refresh and redraw with new properties in an updateframe
	function updateFrame() {
		ctx.save();
		draw(container, ctx, node1, node2, muscle);
		ctx.restore();
		requestAnimationFrame(updateFrame);
	}
	updateFrame();
};

main();
