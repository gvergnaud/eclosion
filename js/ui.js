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
	
	printWord: function(word){
		document.querySelector('#proposedWord').innerText = word;
	},
	
	d3: {
		previousWords : false,
		
		createGraph: function(words){
			var self = this;
			
			var width = window.innerWidth,
				height = window.innerHeight;
	
			UI.wordGraph.innerHTML = '';
	
			var color = d3.scale.category20();
	
			this.force = d3.layout.force()
				.gravity(.05)
			    .charge(-5000)
			    .linkDistance(30)
			    .size([width, height]);
			
			// Création du SVG
			this.svg = d3.select("#wordGraph").attr("width", width) 
			    .attr("pointer-events", "all")
			    .style("background-color", "black")
			    .attr("height", height)
			    	.call(d3.behavior.zoom().on("zoom", function(){
			    		self.redrawGraph();
			    	}))
			    .append('svg:g')
			    	 .style("background-color", "black")
			    .append('svg:g')
			    	 .style("background-color", "black");
			
			this.svg.append('svg:rect')
			    .attr('width', width)
			    .attr('height', height)
			    .attr('fill', 'black');
			    
			this.force
				.nodes(words.nodes)
				.links(words.links)
				.start();
			
			// Création des liens entre les noeuds
			var link = this.svg.append("g")
				.attr("class", "links")
				.selectAll("link")
				.data(words.links)
				.enter().append("line")
				.attr("class", "link")
				.style("stroke", "white")
				.style("stroke-width", function(d) { return Math.sqrt(d.value); });
				
			// Création des noeuds
			var node = this.svg.append("g").attr("class", "nodes")
	           .selectAll("node")
	           .data(words.nodes)
	           .enter()
	           .append("g");
	         
	         node.append("circle")
	         	.attr("class", "node")
	         	.style('fill', "white")
	         	.attr("r", 3)//function(d) { return Math.sqrt(d.liaison); })
	         	.call(self.force.drag);

			// Ajout d'un texte pour les noeuds
			node.append("text")
			     .attr("text-anchor", "middle")
			     .style("font-size", "12px")
			     .style("fill", "white")
			     .attr("transform","translate(0, -10)")
			     .text(function(d) {
			       return d.name;
			     });
	
			this.force.on("tick", function() {
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
			
			this.previousWords = words;
		},
		
		redrawGraph : function(){
			this.svg.attr("transform",
			  "translate(" + d3.event.translate + ")"
			  + " scale(" + d3.event.scale + ")"
			);
		},
		
		updateGraph : function(words){
			if(this.previousWords){
				var self = this;
				
				// Si il y a eu ajout d'un nouveau noeud
				if(this.previousWords.nodes.length < words.nodes.length){
				
					// Ajout du dernier Node et du dernier links
					this.previousWords.nodes.push(words.nodes[words.nodes.length - 1]);
					this.previousWords.links.push(words.links[words.links.length - 1]);
				}
				
				else if(this.previousWords.links.length < words.links.length){
					// Ajout du dernier links
					this.previousWords.links.push(words.links[words.links.length - 1]);
				}
				
				var link = this.svg.select(".links").selectAll(".link")
		            .data(self.previousWords.links);
		
		        link.enter().insert("line")
		            .attr("class", "link")
					.style("stroke", "white")
					.style("stroke-width", function(d) { return Math.sqrt(d.value); });
		
		        link.exit().remove();
		
		        var node = this.svg.select(".nodes").selectAll("g")
		            .data(self.previousWords.nodes);
		
		        var nodeEnter = node.enter().append("g")
		        	.append("circle")
		            .attr("class", "node")
		            .style('fill', "white")
					.attr("r", 3)//function(d) { return Math.sqrt(d.liaison); })
		            .call(self.force.drag);
		
		        node.append("text")
		            .attr("text-anchor", "middle")
				    .style("font-size", "12px")
				    .style("fill", "white")
				    .attr("transform","translate(0, -10)")
				    .text(function(d) {
					    return d.name;
				    });
		
		        node.exit().remove();
		
		        this.force.on("tick", function() {
		          link.attr("x1", function(d) { return d.source.x; })
		              .attr("y1", function(d) { return d.source.y; })
		              .attr("x2", function(d) { return d.target.x; })
		              .attr("y2", function(d) { return d.target.y; });
		
		          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		        });
		
		        
					
			    this.force.start();
			}
		}
	}
};