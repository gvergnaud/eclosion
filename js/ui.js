var UI = {
    
    currentNotifications: [], //tableau qui contient toutes les notifications en cours
	
	init: function(){
		this.wordGraph = document.querySelector('#wordGraph');

		this.setSVGSize();
		this.nodeData.style();

		window.addEventListener('resize', function(){
			UI.setSVGSize();
			UI.nodeData.style();
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
		document.querySelector('#globalData span.words').innerText = nbWords;
		document.querySelector('#globalData span.connections').innerText = nbConnections;
		document.querySelector('#globalData span.contributors').innerText = nbContributors;
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
			this.element.querySelector('div.occurrence>p.data').innerText = nodeData.occurrence;
			
			//affiche le nombre de connexions
			this.element.querySelector('div.nbLinks>p.data').innerText = nodeData.nbLinks;

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
		nodeSizeCoefficient : 10,
		
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
			
			// Création des liens entre les noeuds
			var link = this.g.append("g")
				.attr("class", "links")
				.selectAll("link")
				.data(words.links)
				.enter().append("line")
				.attr("class", "link")
				.style("stroke", "white")
				.style("stroke-width", function(d) { return Math.sqrt(d.value); });
				
			// Création des noeuds
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
		
		searchNode : function(selectedVal){
			var self = this;
			
			var node = this.svg.selectAll(".nodes>g");
			
			var unselected = node.filter(function (d, i) {
	            return d.name != selectedVal;
	        });
	        
	        var selected = node.filter(function (d, i) {
	            return d.name == selectedVal;
	        });
	        
	        if(selected[0].length > 0){
	        
				// On calcule le x et y du translate
		        var x = (window.innerWidth / 2) - selected.attr("cx");
		        var y = (window.innerHeight / 2) - selected.attr("cy");
		        
		        this.svg.select("g").select("g").transition().duration(1500).attr("transform",
				  "translate(" + x + " ," + y + ")"
				 + "scale(1.3)"
				);
				
				// On redéfini le zoom avec ses nouvelles valeurs d'origines
				this.svg.call(d3.behavior.zoom().scale(1.3).translate([x, y]).scaleExtent([0.25, 3]).on("zoom", function(){
			    		UI.d3.redrawGraph();
			    		// Dessiner le zoom sur barre verticale, d3.event.scale
			    }));
			}else{
				UI.notification('error', "Pas de mots trouvés");
			}
		}
	},

	optionsMenu: {

		element: document.querySelectorAll('.hidden-option'),
		menuElement: document.getElementById('lateral-navigation'),
		searchWordModal: document.getElementById("searchWord"),
	    writehWordModal: document.getElementById("writeWord"),
	    filterWordModal: document.getElementById("filterWord"),
		// opened: false,

		closeModalView: function() {

	    	var closeAnim = [
	        	{
	        		elements: this.element, 
	        		properties: {left: '-1875px'},
	        		options: {duration: 250, easing: 'easeInOutBack'}
	        	}	        	
	        ];
			Velocity.RunSequence(closeAnim);

			setTimeout(function(){
				UI.optionsMenu.searchWordModal.classList.remove("modalApparition");
				UI.optionsMenu.writehWordModal.classList.remove("modalApparition");
				UI.optionsMenu.filterWordModal.classList.remove("modalApparition");
				UI.optionsMenu.menuElement.classList.remove("widthauto");
			}, 250);

		},

		searchBoxView: function() {
	        // Si on doit l'afficher, animation vers la droite
	        if(!model.toolbox.hasClassName(this.searchWordModal, "modalApparition")) {
		        var openAnim = [
		        	{
		        		elements: this.element,
		        		properties: {left: "-1875px"},
		        		options: {duration: 0, easing: 'easeInOutBack'}
		        	},	        	
		        	{
		        		elements: this.searchWordModal,
		        		properties: {left: "70px"},
		        		options: {duration: 250, easing: 'easeInOutBack'}
		        	}

		        ];
				Velocity.RunSequence(openAnim);
	        	this.writehWordModal.classList.remove("modalApparition");				
				this.filterWordModal.classList.remove("modalApparition");
	        	this.menuElement.classList.add("widthauto");
	        	this.searchWordModal.classList.add("modalApparition");

	        }
	        else {
		        var closeAnim = [
		        	{
		        		elements: this.element,
		        		properties: {left: "-1875px"},
		        		options: {duration: 0, easing: 'easeInOutBack'}
		        	},
		        	{
		        		elements: this.element,
		        		properties: {left: "-1875px"},
		        		options: {duration: 250, easing: 'easeInOutBack'}
		        	}
		        ];
				Velocity.RunSequence(closeAnim);
				this.writehWordModal.classList.remove("modalApparition");
		        this.filterWordModal.classList.remove("modalApparition");

				setTimeout(function(){
					UI.optionsMenu.searchWordModal.classList.remove("modalApparition");
		        	UI.optionsMenu.menuElement.classList.remove("widthauto");
				}, 250);

	        }
		},

		addWordBoxView: function() {
	        // Si on doit l'afficher, animation vers la droite
	        if(!model.toolbox.hasClassName(this.writehWordModal, "modalApparition")) {
		        var openAnim = [
		        	{
		        		elements: this.element,
		        		properties: {left: "-1875px"},
		        		options: {duration: 0, easing: 'easeInOutBack'}
		        	},
		        	{
		        		elements: this.writehWordModal,
		        		properties: {left: "70px"},
		        		options: {duration: 250, easing: 'easeInOutBack'}
		        	}
		        ];
				Velocity.RunSequence(openAnim);
	        	this.searchWordModal.classList.remove("modalApparition");
				this.filterWordModal.classList.remove("modalApparition");
	        	this.menuElement.classList.add("widthauto");		
	        	this.writehWordModal.classList.add("modalApparition");		

	        }
	        else {
		        var closeAnim = [
		        	{
		        		elements: this.element,
		        		properties: {left: "-1875px"},
		        		options: {duration: 250, easing: 'easeInOutBack'}
		        	}
		        ];
				Velocity.RunSequence(closeAnim);
				this.searchWordModal.classList.remove("modalApparition");
		        this.filterWordModal.classList.remove("modalApparition");

				setTimeout(function(){
					UI.optionsMenu.writehWordModal.classList.remove("modalApparition");
		        	UI.optionsMenu.menuElement.classList.remove("widthauto");
				}, 250);

	        }
		},

		filterWordBoxView: function() {
	        if(!model.toolbox.hasClassName(this.filterWordModal, "modalApparition")) {
		        var openAnim = [
		        	{
		        		elements: this.filterWordModal,
		        		properties: {left: "70px"},
		        		options: {duration: 250, easing: 'easeInOutBack'}
		        	}
		        ];
				Velocity.RunSequence(openAnim);
				this.searchWordModal.classList.remove("modalApparition");
		        this.writehWordModal.classList.remove("modalApparition");
	        	this.menuElement.classList.add("widthauto");
				this.filterWordModal.classList.add("modalApparition");
	        }
	        else {
		        var closeAnim = [
		        	{
		        		elements: this.element,
		        		properties: {left: "-1875px"},
		        		options: {duration: 250, easing: 'easeInOutBack'}
		        	}
		        ];
				Velocity.RunSequence(closeAnim);
				this.searchWordModal.classList.remove("modalApparition");
		        this.writehWordModal.classList.remove("modalApparition");

				setTimeout(function(){
					UI.optionsMenu.filterWordModal.classList.remove("modalApparition");
		        	UI.optionsMenu.menuElement.classList.remove("widthauto");
				}, 250);
	        }
		}
	},

};