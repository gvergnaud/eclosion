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
		nodeSizeCoefficient : 3,
		
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
			
			// Cr�ation du SVG
			this.svg = d3.select("#wordGraph").attr("width", width) 
			    .attr("pointer-events", "all")
			    .style("background-color", "black")
			    .attr("height", height);
		    	
		    this.g = this.svg.append('svg:g')
			   	.style("background-color", "black")
			    .append('svg:g')
			    .style("background-color", "black");
			
			this.g.append('svg:rect')
			    .attr('width', width)
			    .attr('height', height)
			    .attr('fill', 'black');
			    
			this.force
				.nodes(words.nodes)
				.links(words.links)
				.start();
			
			// Cr�ation des liens entre les noeuds
			var link = this.g.append("g")
				.attr("class", "links")
				.selectAll("link")
				.data(words.links)
				.enter().append("line")
				.attr("class", "link")
				.style("stroke", "white")
				.style("stroke-width", function(d) { return Math.sqrt(d.value); });
				
			// Cr�ation des noeuds
			var node = this.g.append("g").attr("class", "nodes")
	           	.selectAll("node")
				.data(words.nodes)
				.enter()
				.append("g");
	         
			node.append("circle")
	         	.attr("class", "node")
	         	.attr("pointer-events", "drag")
	         	.style('fill', "white")
	         	.attr("r", function(d) {return Math.sqrt(d.nbLinks) * self.nodeSizeCoefficient; })
	         	.call(self.force.drag);

			// Ajout d'un texte pour les noeuds
			node.append("text")
			     .attr("text-anchor", "middle")
			     .style("font-size", function(d) {return Math.sqrt(d.nbLinks) * 10 + "px"; })
			     .style("fill", "white")
			     .attr("transform",function(d) {
			            return "translate(0," + -(Math.sqrt(d.nbLinks) * (self.nodeSizeCoefficient + 2)) + ")";
			        })
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
			var self = this;
			
			this.svg.select("g").select("g").attr("transform",
			  "translate(" + d3.event.translate + ")"
			  + " scale(" + d3.event.scale + ")"
			);
			
			this.svg.selectAll(".nodes>g>circle").each(function(d, i){		
				var r = d3.select(this).attr("r");
				//var newR = 1/2 * r / d3.event.scale ;
				//d3.select(this).attr("r", newR);
			});
			
			this.svg.selectAll(".nodes>g").select("text").style("font-size", "20px");
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
				
				// Sinon il y a eu ajout d'un nouveau links seulement
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
		
		        var nodeEnter = node.enter().append("g");
		        
		        nodeEnter.append("circle")
		            .attr("class", "node")
		            .style('fill', "white")
					.attr("r", function(d) {return Math.sqrt(d.nbLinks) * self.nodeSizeCoefficient; })
		            .call(self.force.drag);
		
		        nodeEnter.append("text")
		            .attr("text-anchor", "middle")
				    .style("font-size", function(d) {return Math.sqrt(d.nbLinks) * 10 + "px";})
				    .style("fill", "white")
				    .attr("transform",function(d) {
			            return "translate(0," + -(Math.sqrt(d.nbLinks) * (self.nodeSizeCoefficient + 2)) + ")";
			        })
				    .text(function(d) {
					    return d.name;
				    });
		
		        node.exit().remove();
		
		        this.force.on("tick", function() {
		         	 link.attr("x1", function(d) { return d.source.x; })
		         	 	.attr("y1", function(d) { return d.source.y; })
		         	 	.attr("x2", function(d) { return d.target.x; })
		         	 	.attr("y2", function(d) { return d.target.y; });
		
		             node.attr("cx", function(d) { return d.x; })
						.attr("cy", function(d) { return d.y; })
						.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		        });
			
			    this.force.start();
			}
		},
		
		defineZoom : function(){
			// Dessiner le zoom sur barre verticale, d3.event.scale
		},
		
		searchNode : function(unselected, selected){
			var self = this;
	            
	        // On calcule le x et y du translate
	        var x = (window.innerWidth / 2) - selected.attr("cx");
	        var y = (window.innerHeight / 2) - selected.attr("cy");
	        
	        this.svg.select("g").select("g").transition().duration(1500).attr("transform",
			  "translate(" + x + " ," + y + ")"
			 + "scale(1.3)"
			);
			
			// On red�fini le zoom avec ses nouvelles valeurs d'origines
			this.svg.call(d3.behavior.zoom().scale(1.3).translate([x, y]).scaleExtent([0.25, 3]).on("zoom", function(){
		    		UI.d3.redrawGraph();
		    		// Dessiner le zoom sur barre verticale, d3.event.scale
		    }));
		}
	}
};