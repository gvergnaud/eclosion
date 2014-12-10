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
			    .charge(-5000)
			    .linkDistance(30)
			    .size([width, height]);
	
			this.svg = d3.select("#wordGraph").attr("width", width) 
			    .attr("pointer-events", "all")
			    .style("background-color", "black")
			    .attr("height", height)
			    	.call(d3.behavior.zoom().on("zoom", function(){
			    		self.redrawGraph();
			    	}))
			    	.call(d3.behavior.drag().on("dragend", function(){
				    	console.log("end");
			    	}))
			    .append('svg:g')
			    	 .style("background-color", "black")
			    .append('svg:g')
			    	 .style("background-color", "black");
			
			this.svg.append('svg:rect')
			    .attr('width', width)
			    .attr('height', height)
			    .attr('fill', 'black');
			    
			force
				.nodes(words.nodes)
				.links(words.links)
				.start();
	
			var link = this.svg.selectAll(".link")// Remettre this et non self
				.data(words.links)
				.enter().append("line")
				.attr("class", "link")
				.style("stroke", "white")
				.style("stroke-width", function(d) { return Math.sqrt(d.value); });
				
			var node = this.svg.append("g")
	           .selectAll("node")
	           .data(words.nodes)
	           .enter()
	           
	           // Add one g element for each data node here.
	           .append("g");
	         
	         node.append("circle")
	         	.attr("class", "node")
	         	.style('fill', "white")
	         	.attr("r", 3)//function(d) { return Math.sqrt(d.liaison); })
	         	.call(force.drag);

			// Add a text element to the previously added g element.
			node.append("text")
			     .attr("text-anchor", "middle")
			     .style("font-size", "12px")
			     .style("fill", "white")
			     .attr("transform","translate(0, -10)")
			     .text(function(d) {
			       return d.name;
			     });
	
			force.on("tick", function() {
				link.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });
	
				node.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; })
					.attr("transform", function(d) {
			            return "translate(" + d.x + "," + d.y + ")";
			        }); 
			});
		},
		
		redrawGraph : function(){
			this.svg.attr("transform",
			  "translate(" + d3.event.translate + ")"
			  + " scale(" + d3.event.scale + ")"
			);
		}//,
		
		/*addNode : function(data){
			var node = this.svg.selectAll("g.node")
	            .data(data);
	
	        var nodeEnter = node.enter().append("circle")
	         	.attr("class", "node")
	         	.style('fill', "white")
	         	.attr("r", 3)//function(d) { return Math.sqrt(d.liaison); })
	         	.call(force.drag);
	
	        nodeEnter.append("text")
			     .attr("text-anchor", "middle")
			     .style("font-size", "12px")
			     .style("fill", "white")
			     .attr("transform","translate(0, -10)")
			     .text(function(d) {
			       return d.name;
			     });
	
	        node.exit().remove();
		}*/
	}
};