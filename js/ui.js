var UI = {
    
    currentNotifications: [], //tableau qui contient toutes les notifications en cours
	
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

	printGlobalData: function(nbWords, nbConnections, nbContributors){
		document.querySelector('#globalData>p.words').innerText = nbWords + ' Mots';
		document.querySelector('#globalData>p.connections').innerText = nbConnections + ' Connexions';
		document.querySelector('#globalData>p.contributors').innerText = nbContributors + ' Contributeurs';
	},

	notification: function(type, msg){
            //Si le message n'est pas d√©j√† dans la liste d'attente
            if(UI.currentNotifications.indexOf(msg) === -1){

                //si il n'y a rien dans la liste d'attente, on affiche la notif
                if(UI.currentNotifications.length === 0){
                    //on met le messsage en liste d'attente
                    UI.currentNotifications.push(msg);


                    var notifContainer = document.querySelector('aside#notifications');
                    var newNotif = document.createElement('p');

                    newNotif.innerHTML = msg;

                    newNotif.classList.add('notification');
                    if(type){
                        newNotif.classList.add(type);
                    }

                    notifContainer.innerHTML = '';
                    notifContainer.style.display = 'block';
                    notifContainer.appendChild(newNotif);

                    setTimeout(function(){	
                        newNotif.classList.add('show');
                    }, 100);

                    setTimeout(function(){
                        //on cache la notif 
                        newNotif.classList.remove('show');

                        setTimeout(function(){

                            notifContainer.style.display = 'none';
                        	newNotif.parentNode.removeChild(newNotif);
                            //on retire le message de la liste d'attente
                            UI.currentNotifications.splice(UI.currentNotifications.indexOf(msg), 1);
                        }, 650);


                    }, 4000);

                    newNotif.addEventListener('click', function(){
                        notifContainer.style.display = 'none';
                        newNotif.parentNode.removeChild(newNotif);
                        //on retire le message de la liste d'attente
                        UI.currentNotifications.splice(UI.currentNotifications.indexOf(msg), 1);
                    });

                }else{
                    setTimeout(function(){
                        UI.notification(type, msg);
                    }, 1000);
                }
            }
        },
	
	// D3.js 
	d3: {
		previousWords : false,
		nodeSizeCoefficient : 3,
		padding : 1,
		
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
			    .style("background-color", "white")
			    .attr("height", height);
		    	
		    this.g = this.svg.append('svg:g')
			   	.style("background-color", "white")
			    .append('svg:g')
			    .style("background-color", "white");
			
			this.g.append('svg:rect')
			    .attr('width', width)
			    .attr('height', height)
			    .attr('fill', 'white');
			    
			this.force
				.nodes(words.nodes)
				.links(words.links)
				.start();
			
			// Création des liens entre les noeuds
			var link = this.g.append("g")
				.attr("class", "links")
				.selectAll("link")
				.data(words.links)
				.enter().append("line")
				.attr("class", "link")
				.style("stroke", "#dfdede")
				.style("stroke-width", function(d) { return Math.sqrt(d.value); });
				
			// Création des noeuds
			var node = this.g.append("g").attr("class", "nodes")
	           	.selectAll("node")
				.data(words.nodes)
				.enter()
				.append("g").style("opacity", 0.8).call(d3.behavior.drag().on("drag", function(d, i){
					self.force.drag;
					
				}).on("dragend", function(d){
					self.force.resume();
				}));
	         
			node.append("circle")
	         	.attr("class", "node")
	         	.attr("pointer-events", "drag")
	         	.style('fill', "#3177df")
	         	.style("cursor", "pointer")
	         	.attr("r", function(d){
	         		var nbLinks = Math.sqrt(d.nbLinks);
	         		return nbLinks * self.nodeSizeCoefficient; 
	         	})
	         	.call(self.force.drag);
	         	

			// Ajout d'un texte pour les noeuds
			node.append("text")
			     .attr("text-anchor", "middle")
			     .style("font-size", function(d) {return Math.sqrt(d.nbLinks) * 10 + "px"; })
			     .style("fill", "#4b4b4b")
			     .attr("transform",function(d) {
			            return "translate(0," + -(Math.sqrt(d.nbLinks) * (self.nodeSizeCoefficient + 2)) + ")";
			        })
			     .text(function(d) {
			       return d.name.charAt(0).toUpperCase() + d.name.substring(1).toLowerCase();
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
			    node.each(self.collide(0.5));
			});
			
			this.previousWords = words;
			
			document.dispatchEvent(app.event.graphReady);
		},
		
		redrawGraph : function(){
			var self = this;
			
			this.svg.select("g").select("g").attr("transform",
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
				
				// Sinon il y a eu ajout d'un nouveau links seulement
				else if(this.previousWords.links.length < words.links.length){
				
					// Ajout du dernier links
					this.previousWords.links.push(words.links[words.links.length - 1]);
				}
				
				var link = this.svg.select(".links").selectAll(".link")
		            .data(self.previousWords.links);
		
		        link.enter().insert("line")
		            .attr("class", "link")
					.style("stroke", "#dfdede")
					.style("stroke-width", function(d) { return Math.sqrt(d.value); });
		
		        link.exit().remove();
		
		        var node = this.svg.select(".nodes").selectAll("g")
		            .data(self.previousWords.nodes);
		
		        var nodeEnter = node.enter().append("g").style("opacity", 0.8)
		        .call(d3.behavior.drag().on("drag", function(d, i){
					self.force.drag;
				}).on("dragend", function(d){
					self.force.resume();
				}));
		        
		        nodeEnter.append("circle")
		            .attr("class", "node")
		            .style('fill', "#3177df")
					.attr("r", function(d) {return Math.sqrt(d.nbLinks) * self.nodeSizeCoefficient; })
		            .call(self.force.drag);
		
		        nodeEnter.append("text")
		            .attr("text-anchor", "middle")
				    .style("font-size", function(d) {return Math.sqrt(d.nbLinks) * 10 + "px";})
				    .style("fill", "#4b4b4b")
				    .attr("transform",function(d) {
			            return "translate(0," + -(Math.sqrt(d.nbLinks) * (self.nodeSizeCoefficient + 2)) + ")";
			        })
				    .text(function(d) {
					    return d.name.charAt(0).toUpperCase() + d.name.substring(1).toLowerCase();
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
					node.each(self.collide(0.5));
		        });
			
			    this.force.start();
			}
		},
		
		defineZoom : function(){
			// Dessiner le zoom sur barre verticale, d3.event.scale
		},
		
		searchNode : function(selectedVal){
			var self = this;
			
			var node = this.svg.selectAll(".nodes>g");
			
			var unselected = node.filter(function (d, i) {
	            return d.name != selectedVal;
	        });
	        
	        var selected = node.filter(function (d, i) {
	            return d.name == selectedVal;
	        });
	        
	        // Si la recherche a donné quelque chose
	        if(selected[0].length > 0){
	        
				// On calcule le x et y du translate
		        var x = (window.innerWidth / 2) - selected.attr("cx");
		        var y = (window.innerHeight / 2) - selected.attr("cy");
		        
		        this.svg.select("g").select("g").transition().duration(1500).attr("transform",
				  "translate(" + x + " ," + y + ")"
				 + "scale(1.3)"
				);
				
				// On red√©fini le zoom avec ses nouvelles valeurs d'origines
				this.svg.call(d3.behavior.zoom().scale(1.3).translate([x, y]).scaleExtent([0.25, 3]).on("zoom", function(){
			    		UI.d3.redrawGraph();
			    		// Dessiner le zoom sur barre verticale, d3.event.scale
			    }));
			}else{
				UI.notification('error', "Pas de mots trouv√©s");
			}
		},
		
		selectNode : function(node){
			var self = this;
			var nodes = d3.selectAll(".nodes>g");
			var links = d3.selectAll(".links>line");
        		
			var linkedByIndex = {};
			for (i = 0; i < self.previousWords.length; i++) {
			    linkedByIndex[i + "," + i] = 1;
			};
			
			self.previousWords.links.forEach(function (d) {
			    linkedByIndex[d.source.index + "," + d.target.index] = 1;
			});
			
	        d = node.node().__data__;
	        
	        // Réduction de l'opacité en fonction de la proximité des noeuds
	        nodes.transition().duration(1000).style("opacity", function (o) {
	            return linkedByIndex[d.index + "," + o.index] | linkedByIndex[o.index + "," + d.index] ? 0.8 : 0.2;
	        });
	      
	        // Réduction de l'opacité des links en fonction des noeuds voisins
	        links.transition().duration(1000).style("opacity", function (o) {
	            return d.index==o.source.index | d.index==o.target.index ? 1 : 0.2;
	        });
	        
	        // Noeud choisi en pleine opacité
        	node.transition().duration(1000).style("opacity", 1);
        	
        	self.force.resume();
        	
        	// Class open window de datas
		},
		
		collide : function(alpha) {
			var self = this;
			var	radius = 8; 
			var quadtree = d3.geom.quadtree(self.previousWords.nodes);
			return function(d) {
			    var rb = 2 * radius + self.padding,
			        nx1 = d.x - rb,
			        nx2 = d.x + rb,
			        ny1 = d.y - rb,
			        ny2 = d.y + rb;
				    quadtree.visit(function(quad, x1, y1, x2, y2) {
						if (quad.point && (quad.point !== d)) {
							var x = d.x - quad.point.x,
								y = d.y - quad.point.y,
								l = Math.sqrt(x * x + y * y);
							if (l < rb) {
								l = (l - rb) / l * alpha;
								d.x -= x *= l;
								d.y -= y *= l;
								quad.point.x += x;
								quad.point.y += y;
							}
						}
						return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
				    });
			};
		}
	}
};