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
	
	d3: {
		createGraph: function(words){
			var self = this;
			var width = window.innerWidth,
				height = window.innerHeight;
	
			UI.wordGraph.innerHTML = '';
	
			var color = d3.scale.category20();
	
			var force = d3.layout.force()
			    .charge(-120)
			    .linkDistance(300)
			    .size([width, height]);
	
			this.svg = d3.select("#wordGraph").attr("width", width) 
			    .attr("pointer-events", "all")
			    .attr("height", height)
			    	.call(d3.behavior.zoom().on("zoom", function(){
			    		self.redrawGraph();
			    	}))
			    	.call(d3.behavior.drag().on("dragend", function(){
				    	console.log("end");
			    	}))
			    .append('svg:g')
			    .append('svg:g');
			    
			this.svg.append('svg:rect')
			    .attr('width', width)
			    .attr('height', height)
			    .attr('fill', 'white');
			force
				.nodes(words.nodes)
				.links(words.links)
				.start();
	
			var link = this.svg.selectAll(".link")
				.data(words.links)
				.enter().append("line")
				.attr("class", "link")
				.style("stroke-width", function(d) { return Math.sqrt(d.value); });
	
			/*var node = this.svg.selectAll(".node")
				.data(words.nodes)
				.enter().append("circle")
				.attr("class", "node")
				.attr("r", 3)
				.call(force.drag);*/
				
			var node = this.svg.append("g")
	           .selectAll("node")
	           .data(words.nodes)
	           .enter().append("circle")
	           .call(force.drag)
	           
	           // Add one g element for each data node here.
	           .append("g")
	           
	           // Position the g element like the circle element used to be.
	           .attr("transform", function(d, i) {
	           
	             // Set d.x and d.y here so that other elements can use it. d is 
	             // expected to be an object here.
	             d.x = i * 70 + 50,
	             d.y = height / 2;
	             return "translate(" + d.x + "," + d.y + ")"; 
	         });
	         
	         node.append("circle")
	         	.attr("class", "node")
	         	.attr("r", 3);

			// Add a text element to the previously added g element.
			node.append("text")
			     .attr("text-anchor", "middle")
			     .text(function(d) {
			       return d.name;
			});
	
			force.on("tick", function() {
				link.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });
	
				node.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; });
			});
		},
		
		redrawGraph : function(){
			this.svg.attr("transform",
			  "translate(" + d3.event.translate + ")"
			  + " scale(" + d3.event.scale + ")"
			);
		}
	}
};