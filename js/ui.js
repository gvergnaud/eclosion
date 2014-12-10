var UI = {

	init: function(){
		this.wordGraph = document.querySelector('#wordGraph');
		this.setSVGSize();
		window.addEventListener('resize', this.setSVGSize, false);
	},

	setSVGSize: function(){
		this.wordGraph.style.width = window.innerWidth;
		this.wordGraph.style.height = window.innerHeight;
	},

	createD3Graph: function(mots){
		var width = window.innerWidth,
			height = window.innerHeight;

		this.wordGraph.innerHTML = '';

		var color = d3.scale.category20();

		var force = d3.layout.force()
		    .charge(-120)
		    .linkDistance(30)
		    .size([width, height]);

		var svg = d3.select("#wordGraph");

		force
			.nodes(mots.nodes)
			.links(mots.links)
			.start();

		var link = svg.selectAll(".link")
			.data(mots.links)
			.enter().append("line")
			.attr("class", "link")
			.style("stroke-width", function(d) { return Math.sqrt(d.value); });

		var node = svg.selectAll(".node")
			.data(mots.nodes)
			.enter().append("circle")
			.attr("class", "node")
			.attr("r", 5)
			.style("fill", function(d) { return color(d.group); })
			.call(force.drag);

		node.append("title")
			.text(function(d) { return d.name; });

		force.on("tick", function() {
			link.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

			node.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; });
		});
	}
};