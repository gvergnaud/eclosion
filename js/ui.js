var UI = {
    
    currentNotifications: [], //tableau qui contient toutes les notifications en cours
	
	init: function(){
		this.wordGraph = document.querySelector('#wordGraph');

		this.setSVGSize();
		this.nodeData.style();
		UI.menu.styleModal();

		window.addEventListener('resize', function(){
			UI.setSVGSize();
			UI.nodeData.style();
			UI.menu.styleModal();
		}, false);
	},

	setSVGSize: function(){
		this.wordGraph.style.width = window.innerWidth;
		this.wordGraph.style.height = window.innerHeight;
	},
	
	printWord: function(word){
		document.querySelector('#proposedWordText').innerText = word;
	},

	printGlobalData: function(nbWords, nbConnections, nbContributors){
		var words = new countUp(document.querySelector('#globalData span.words'), 1, nbWords, 0, 2);
		var connexions = new countUp(document.querySelector('#globalData span.connections'), 1, nbConnections, 0, 2);
		var contributors = new countUp(document.querySelector('#globalData span.contributors'), 1, nbContributors, 0, 2);
		
		words.start();
		connexions.start();
		contributors.start();
	},

	//Panneau de droite
	nodeData: {

		element: document.querySelector('#nodeData'),

		opened: false,

		openSection: function(){
			if(!this.opened){
				var openAnim = [
		        	{
		        		elements: this.element, 
		        		properties: {right: 0},
		        		options: {duration: 250, easing: 'easeInOutBack'}
		        	}
		        ];
		        
				this.element.style.display = 'block';

			    // var addContribution = document.querySelectorAll('.addContribution');
			    // addContribution[1].focus();

				Velocity.RunSequence(openAnim);

				this.opened = true;
			}
		},

		closeSection: function(){
			if(this.opened){
				var closeAnim = [
		        	{
		        		elements: this.element, 
		        		properties: {right: '-350px'},
		        		options: {duration: 250, easing: 'easeInOutBack'}
		        	}
		        ];

				Velocity.RunSequence(closeAnim);
				setTimeout(function(){
					UI.nodeData.element.style.display = 'none';
				}, 250);

				this.opened = false;
			}
		},

		printData: function(nodeData){
			

			this.element.querySelector('.nodeName').innerText = nodeData.name;

			//affiche le nombre d'utilisation du mot
			var occurrence = new countUp(this.element.querySelector('div.occurrence>p.data'), 1, nodeData.occurrence, 0, 1, {useEasing : false});
			occurrence.start();

			//affiche le nombre de connexions
			var nbLinks = new countUp(this.element.querySelector('div.nbLinks>p.data'), 1, nodeData.nbLinks, 0, 1, {useEasing : false});
			nbLinks.start();

			//affiche le nombre dutilisation par sexe
			this.element.querySelector('div.sexeOccurrence>div.male .data').innerText = nodeData.sexeOccurrence.male;
			this.element.querySelector('div.sexeOccurrence>div.female .data').innerText = nodeData.sexeOccurrence.female;
			this.element.querySelector('div.sexeOccurrence>div.unknown .data').innerText = nodeData.sexeOccurrence.unknown;

			//affiche le nombre dutilisation par age
			this.element.querySelector('div.ageOccurrence>div.under25 .data').innerText = nodeData.ageOccurrence['under25'];
			this.element.querySelector('div.ageOccurrence>div.from25to35 .data').innerText = nodeData.ageOccurrence['25to35'];
			this.element.querySelector('div.ageOccurrence>div.from35to45 .data').innerText = nodeData.ageOccurrence['35to45'];
			this.element.querySelector('div.ageOccurrence>div.above45 .data').innerText = nodeData.ageOccurrence['above45'];
			this.element.querySelector('div.ageOccurrence>div.unknown .data').innerText = nodeData.ageOccurrence.unknown;

			//affiche les mots les plus associés à celui la
			var associatedDataElm = this.element.querySelector('div.mostAssociatedWords>div.associatedWordsContainer');

			associatedDataElm.innerHTML = '';

			nodeData.mostAssociatedWords.forEach(function(word){
				var p = document.createElement('p');

				p.innerHTML = word.name + ' <span class="right"><span class="data">' + word.occurrence + '</span> fois</span>';
				p.classList.add('stat');

				associatedDataElm.appendChild(p);
			});
		},

		style: function(){
			this.element.querySelector('div.stats').style.maxHeight = window.innerHeight - 260 + 'px';
		}
	},

	notification: function(type, msg){
        //Si le message n'est pas déjà dans la liste d'attente
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


                }, 3000);

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
		nodeSizeCoefficient : 4,
		collision : 3,
		
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
			    .attr("height", height)
			    .call(d3.behavior.drag().on("dragstart", function(){
				    self.svg.style("cursor", "-webkit-grabbing");
			    }).on("dragend", function(){
				    self.svg.style("cursor", "default");
			    }));
		    	
		    this.g = this.svg.append('svg:g')
			   	.style("background-color", "transparent")
			    .append('svg:g')
			    .style("background-color", "transparent");
			    
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
				.append("g").call(d3.behavior.drag().on("drag", function(d, i){
					self.force.drag;
				}).on("dragend", function(d){
					self.force.resume();
				}));
	         
	        // Ajout d'un cercle pour chaque noeud
			node.append("circle")
	         	.attr("class", "node")
	         	.attr("pointer-events", "drag")
	         	.style('fill', "#b8b8b8")
	         	.style("cursor", "pointer")
	         	.attr("r", function(d){
	         		var nbLinks = Math.sqrt(d.nbLinks);
	         		if(nbLinks * (nbLinks * self.nodeSizeCoefficient) <= 60)
	         			return nbLinks * (nbLinks * self.nodeSizeCoefficient); 
	         		else
	         			return 60;
	         	})
	         	.call(self.force.drag);
	         	

			// Ajout d'un texte pour chaque noeud
			node.append("text")
			     .attr("text-anchor", "middle")
			     .style("font-size", function(d) {return Math.sqrt(d.nbLinks) * 10 + "px"; })
			     .style("fill", "#4b4b4b")
			     .attr("transform",function(d) {
			           return "translate(0," + -(Math.sqrt(d.nbLinks) * (Math.sqrt(d.nbLinks) * self.nodeSizeCoefficient + 2)) + ")";
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
			
			self.defineZoom();
			
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
		
		        var newLink = link.enter().insert("line");
		        
		        newLink.attr("class", "link")
					.style("stroke", "#3177df")
					.style("stroke-width", function(d) { return Math.sqrt(d.value); });
		
				newLink.transition().duration(5000).style("stroke", "#b8b8b8");
				
		        link.exit().remove();
		
		        var node = this.svg.select(".nodes").selectAll("g")
		            .data(self.previousWords.nodes);
		
		        var nodeEnter = node.enter().append("g").call(d3.behavior.drag().on("drag", function(d, i){
						self.force.drag;
					}).on("dragend", function(d){
						self.force.resume();
					}));
		        
		        nodeEnter.append("circle")
		            .attr("class", "node")
		            .style('fill', "#3177df")
					.attr("r", function(d) {
						var nbLinks = Math.sqrt(d.nbLinks);
						if(nbLinks * (nbLinks * self.nodeSizeCoefficient) <= 60)
		         			return nbLinks * (nbLinks * self.nodeSizeCoefficient); 
		         		else
		         			return 60; 
	         		})
		            .call(self.force.drag);
		
		        nodeEnter.append("text")
		            .attr("text-anchor", "middle")
				    .style("font-size", function(d) {return Math.sqrt(d.nbLinks) * 10 + "px";})
				    .style("fill", "#3177df")
				    .attr("transform",function(d) {
			            return "translate(0," + -(Math.sqrt(d.nbLinks) * (Math.sqrt(d.nbLinks) * self.nodeSizeCoefficient + 2)) + ")";
			        })
				    .text(function(d) {
					    return d.name.charAt(0).toUpperCase() + d.name.substring(1).toLowerCase();
				    });
		
				nodeEnter.select("circle").transition().duration(5000).style("fill", "#b8b8b8");
		        nodeEnter.select("text").transition().duration(5000).style("fill", "#4b4b4b");
		        
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
			var value;
			if(d3.event != null && d3.event.scale != undefined){
				value = d3.event.scale;
			}else{
				value = 1;
			}
			
			var zoombarHeight = document.getElementById("zoom").offsetHeight;
			
			// Déplacement du cursor
			document.querySelector("#cursor").style.top = ((100 - ((value - 0.5) * 100 / 2.5))) - ((100 * 7.5) / zoombarHeight) + "%";
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
	        
	        UI.d3.highlightOn(selected);
	        
	        // Si la recherche a donné quelque chose
	        if(selected[0].length > 0){
	        
	        	// Obtenir position du g
				var rect = document.querySelector("svg>g>g").getBoundingClientRect();
				
				// On calcule le x et y du translate
		        var x = ((window.innerWidth / 2) - (parseInt(selected.attr("cx")) + parseInt(rect.left))) 
		       		+ parseInt(rect.left);
		        var y = ((window.innerHeight / 2) - (parseInt(selected.attr("cy")) + parseInt(rect.top))) 
		        	+ parseInt(rect.top);
		        
		        this.svg.select("g").select("g").transition().duration(1500).attr("transform",
				  "translate(" + x + " ," + y + ")"
				);
				
				// On redéfini le zoom avec ses nouvelles valeurs d'origines
				this.svg.call(d3.behavior.zoom().translate([x, y]).scaleExtent([0.5, 3]).on("zoom", function(){
			    	UI.d3.redrawGraph();
			    	UI.d3.defineZoom();
			    }));
			    
			}else{
				UI.notification('error', "Pas de mots trouvés");
			}
			
			self.defineZoom();
		},
		
		selectNode : function(node){
			var self = this;
			
			// On met liens et nodes en highlight
			self.highlightOn(node);
						
	        var rect = document.querySelector("svg>g>g").getBoundingClientRect();
	        
	        var x = ((window.innerWidth / 2) - (parseInt(node.attr("cx")) + parseInt(rect.left))) 
		       		+ parseInt(rect.left);
	        var y = ((window.innerHeight / 2) - (parseInt(node.attr("cy")) + parseInt(rect.top))) 
	        	+ parseInt(rect.top);
			
			// On fait un translate pour avoir le noeud choisi au centre
			this.svg.select("g").select("g").transition().duration(1500).attr("transform",
				 "translate(" + x + " ," + y + ")"
			);
			
			self.defineZoom();
			
			// On redéfini le zoom avec ses nouvelles valeurs
			this.svg.call(d3.behavior.zoom().translate([x, y]).scaleExtent([0.5, 3]).on("zoom", function(){
		    	UI.d3.redrawGraph();
		    	UI.d3.defineZoom();
		    }));
        	
        	self.force.resume();
		},
		
		collide : function(alpha) {
			var self = this;
			var	radius = 8; 
			var quadtree = d3.geom.quadtree(self.previousWords.nodes);
			return function(d) {
			    var rb = 2 * radius + self.collision,
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
		},
		
		highlightOn : function(node){
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
	        
	        // Changement de couleur des cercles des noeuds
	        nodes.select("circle").transition().duration(1000).style("fill", function (o) {
	            return linkedByIndex[d.index + "," + o.index] | linkedByIndex[o.index + "," + d.index] ? "#72a1e9" : "#b8b8b8";
	        });
	        
	        // On remet les propriétés des noeuds à leur état d'origine
	        nodes.select("text").transition().duration(1000).style("fill", "#4b4b4b").style("font-weight", "400");
	      
	        // Changement de couleur des liens
	        links.transition().duration(1000).style("stroke", function (o) {
	            return d.index == o.source.index | d.index == o.target.index ? "#72a1e9" : "#b8b8b8";
	        });
	        
	        // On modifie l'apparence du noeud choisi
        	node.select("circle").transition().duration(1000).style("fill", "#3177df");
        	node.select("text").transition().duration(1000).style("fill", "#3177df").style("font-weight", "700");
		},
		
		highlightOff : function(){
			this.svg.selectAll("text").transition().duration(1000).style("fill", "#4b4b4b").style("font-weight", "400");
			this.svg.selectAll("circle").transition().duration(1000).style("fill", "#b8b8b8");
			this.svg.selectAll("line").transition().duration(1000).style("stroke", "#b8b8b8");
		}
	},

	about: {
		overlayApropos: document.querySelector('#aproposOverlay'),
		overlayContainer: document.querySelector('#overlay-container'),

		openOverlay: function() {
			// var nav = document.getElementById('lateral-navigation');
			this.overlayApropos.classList.add('active');
	    	var openAnim = [
	        	{
	        		elements: UI.about.overlayContainer, 
	        		properties: { marginTop: '0', opacity: 1},
	        		options: {duration: 500, easing: 'easeInOutBack'}
	        	},

	        ];
	        setTimeout(function(){
				Velocity.RunSequence(openAnim);
			}, 150);

		},
		closeOverlay: function() {
			var overlayContainer = document.querySelector('#overlay-container');

   //      	overlayContainer.onclick = function (e) {
			//   e = e || window.event;
			//   e.cancelBubble = true;
			//   if (e.stopPropagation)
			//     e.stopPropagation();
			// }

			UI.about.overlayApropos.classList.remove('active');
	    	var closeAnim = [
	        	{
	        		elements: UI.about.overlayContainer, 
	        		properties: { marginTop: '100px', opacity: 0},
	        		options: {duration: 500, easing: 'easeInOutBack'}
	        	}
	        ];
	        setTimeout(function(){
				Velocity.RunSequence(closeAnim);
			}, 150);
		}
	},

	menu: {

		allModals: document.querySelectorAll('.modal'),
		menuElement: document.querySelector('#lateral-navigation'),
		/* Les 3 fenêtres d'options */
		searchWordModal: document.querySelector("#searchWord"),
	    writehWordModal: document.querySelector("#writeWord"),
	    filterWordModal: document.querySelector("#filterWord"),
	    /* Les deux input à autofocus */
	    searchInput: document.querySelector("#searchInput"),
	    addContribution: document.querySelectorAll('.addContribution'),

	    opened: false,

	    styleModal: function() {
	    	if(UI.menu.opened){
	    		UI.menu.menuElement.style.width =  window.innerWidth + "px";
	    	}
	    },

		closeModal: function() {
			if(UI.menu.opened){
		    	var closeAnim = [
		        	{
		        		elements: UI.menu.allModals, 
		        		properties: { left: - window.innerWidth + 'px'},
		        		options: {duration: 250, easing: 'easeInOutBack'}
		        	}
		        ];
				Velocity.RunSequence(closeAnim);

				setTimeout(function(){
					[].forEach.call(UI.menu.allModals, function(element){
		        		element.classList.remove('activeTab');
		        	});

		        	UI.menu.menuElement.style.width = '70px';
		       		UI.menu.opened = false;
				}, 250);
			}

		},

		openModal: function(modal){

        	[].forEach.call(UI.menu.allModals, function(element){
        		element.classList.remove('activeTab');
        	});

			var openAnim = [
	        	{
	        		elements: UI.menu.allModals,
	        		properties: {left: - window.innerWidth + 'px'},
	        		options: {duration: 0, easing: 'easeInOutBack'}
	        	},
	        	{
	        		elements: modal,
	        		properties: {left: "70px", opacity: "0.9", width: window.innerWidth -70 + 'px'},
	        		options: {duration: 250, easing: 'easeInOutBack'}
	        	}
	        ];

	        UI.menu.menuElement.style.width = window.innerWidth + 'px';

	        UI.menu.opened = true;

			Velocity.RunSequence(openAnim);

        	modal.classList.add('activeTab');
		},

		searchBoxView: function() {
	        // Si on doit l'afficher, animation vers la droite
	        if(!UI.menu.searchWordModal.classList.contains('activeTab')) {
		        UI.menu.openModal(UI.menu.searchWordModal);
	        	UI.menu.searchInput.focus();
	        }
	        else {
		        UI.menu.closeModal();
	        }

		},

		addWordBoxView: function() {
	        // Si on doit l'afficher, animation vers la droite
	        if(!UI.menu.writehWordModal.classList.contains('activeTab')) {
		        UI.menu.openModal(UI.menu.writehWordModal);
	        	UI.menu.addContribution[0].focus();
	        }
	        else {
		        UI.menu.closeModal();
	        }
		},

		filterWordBoxView: function() {
	        if(!UI.menu.filterWordModal.classList.contains('activeTab')) {
		        UI.menu.openModal(UI.menu.filterWordModal);
	        }
	        else {
		        UI.menu.closeModal();
	        }

		},

		addActiveFilter: function(element){

			UI.menu.removeActiveFilter(element);

			element.classList.add('active');
		},

		removeActiveFilter: function(element){
			var filters;

			if(element.classList.contains('sexe')){
				filters = document.querySelectorAll('#lateral-navigation .filterbuttons.sexe');
			}else{
				filters = document.querySelectorAll('#lateral-navigation .filterbuttons.age');
			}

			[].forEach.call(filters, function(filter){
				filter.classList.remove('active');
			});
		},

		removeAllActiveFilter: function(element){
			var filters;

			filters = document.querySelectorAll('#lateral-navigation .filterbuttons');

			[].forEach.call(filters, function(filter){
				filter.classList.remove('active');
			});
		}
	}
};