var app = {

	proposedWord : false,

	activeWord : false,

	filters : {
		age: false,
		sexe: false
	},

	event: {},

	init: function(){

		model.initFirebase();

		model.initUser();

		model.getDico();

		UI.init();

		app.createCustomEvents();

		app.watchData();
		
		//lorsque le graph principale a été crée
		document.addEventListener('graphready', app.onGraphReady, false);

		// lorsque les données sont mises à jour
		document.addEventListener('dataupdate', app.onDataUpdate, false);

		//lorsque l'utilisateur ajoute un mot
		document.addEventListener('usercontribution', function (e) {
			app.proposeRandomWord();
			UI.menu.closeModal();
		}, false);
		
		// Gestion du drag du zoom
		var zoomCursor = document.querySelector('#cursor');
		var draggie = new Draggabilly( zoomCursor, {
		  axis: 'y',
		  containment: '#zoomBar'
		});
		
		draggie.on( 'dragMove', function(instance, event, pointer){
			var zoombarHeight = document.getElementById("zoom").offsetHeight;
			var scale = 1;
			//console.log(scale);
			UI.d3.svg.select("g").select("g").attr("transform"," scale(" + scale + ")");
		});
		
		// Fermeture de la fenetre droite au clic sur la croix
		document.getElementsByClassName("close")[0].addEventListener("click", function(){
			UI.nodeData.closeSection();
			UI.d3.highlightOff();
		}, false);

		//applique l'evenement addContribution à tous les elements ayant la class
		[].forEach.call(document.querySelectorAll('.addContribution'), function (element) {
			element.addEventListener('keyup', app.addContribution, false);
		});

		document.querySelector('#searchInput').addEventListener('keyup', app.searchNode, false);
		document.querySelector('div.filters button.resetFilters').addEventListener('click', app.resetFilters, false);
	
		/* Gestion des fenêtres du menu */
        document.getElementById('searchBox').addEventListener("click", UI.menu.searchBoxView, false);
        document.getElementById('addWordBox').addEventListener("click", UI.menu.addWordBoxView, false);
        document.getElementById('filterBox').addEventListener("click", UI.menu.filterWordBoxView, false);
	},

	createCustomEvents: function(){
		// CrÃ©e l'evenement
		app.event.graphReady = document.createEvent('Event');
		app.event.graphReady.initEvent('graphready', true, true);

		app.event.dataUpdate = document.createEvent('Event');
		app.event.dataUpdate.initEvent('dataupdate', true, true);

		app.event.userContribution = document.createEvent('Event');
		app.event.userContribution.initEvent('usercontribution', true, true);
	},

	onGraphReady: function (e) {

		app.graphCreated = true;

		app.proposeRandomWord();

		UI.d3.svg.call(d3.behavior.zoom().scaleExtent([0.5, 3]).on("zoom", function(){
			UI.d3.redrawGraph();
			UI.d3.defineZoom();
		}));

		//remove l'event listener
		e.target.removeEventListener(e.type, arguments.callee);
	},

	onDataUpdate: function(){

		//on affiche les données globales
		UI.printGlobalData(model.words.nodes.length,  model.words.links.length, model.words.contributors);
		
		//si le panneau est ouvert, et qu'il y a un mot actif, on update les données
		if(app.activeWord){
			app.getNodeData(model.getNodeFromWord(app.activeWord), function(nodeData){
				UI.nodeData.printData(nodeData);
			});
		}

		//au click sur un node, on ouvre le panneau droit et on recupérer toutes les données de ce node
		UI.d3.svg.selectAll(".nodes>g>circle").on("click", 	function(node){
			if(d3.event.defaultPrevented == false){ 
				UI.d3.selectNode(d3.select(this.parentNode));
				app.getNodeData(node, function(nodeData){
					UI.nodeData.printData(nodeData);
					UI.nodeData.openSection();
					app.activeWord = nodeData.name;

				});	
			}
		});
		
		// On désactive le double click sur les noeuds
		UI.d3.svg.selectAll(".nodes>g>circle").on("dblclick", 	function(node){
			d3.event.stopPropagation();
		});
	},

	watchData: function(){
		model.watchData(function(words){
			//CrÃ©e le graph avec D3.js
			if(app.filters.sexe || app.filters.age){

				model.applyFilters(words, app.filters, function(filteredWords){
					
					if(!app.graphCreated){ //si le graph n'est pas crÃ©Ã© on le crÃ©e
						UI.d3.createGraph( filteredWords );
						app.graphCreated = true;

					}else{ //si il est crÃ©Ã© on update
						UI.d3.updateGraph( filteredWords );
					}
				});

			}else{
				if(!app.graphCreated){ //si le graph n'est pas crÃ©Ã© on le crÃ©e
					UI.d3.createGraph( words );
					app.graphCreated = true;

				}else{ //si il est crÃ©Ã© on update
					UI.d3.updateGraph( words );
				}
			}

			document.dispatchEvent(app.event.dataUpdate);
		});
	},


	reloadData: function(){
		model.getDataOnce(function(words){
			if(app.filters.sexe || app.filters.age){

				model.applyFilters(words, app.filters, function(filteredWords){
							
					UI.d3.createGraph( filteredWords );

					//redraw pour eviter les problèmes de zoom
					UI.d3.svg.call(d3.behavior.zoom().scaleExtent([0.25, 3]).on("zoom", function(){
						UI.d3.redrawGraph();
					}));
				});

			}else{
				UI.d3.createGraph( words );
				
				//redraw pour eviter les problèmes de zoom
				UI.d3.svg.call(d3.behavior.zoom().scaleExtent([0.25, 3]).on("zoom", function(){
					UI.d3.redrawGraph();
				}));
			}

			document.dispatchEvent(app.event.dataUpdate);
		});
	},

	getNodeData: function(node, callback){
		var nodeData = {};

		nodeData.name = node.name;

		//nombre de connexions
		nodeData.nbLinks = node.nbLinks;
		
		//nombre d'apparition du mot
		nodeData.occurrence = model.getNodeOccurrence(node);

		//les mots les plus associés
		nodeData.mostAssociatedWords = model.getMostAssociatedWords(node);

		//apparition par sexe
		nodeData.sexeOccurrence = model.getSexeOccurrence(node);

		//apparition par age
		nodeData.ageOccurrence = model.getAgeOccurrence(node);

		if(callback){
			callback.call(this, nodeData);
		}
	},

	proposeRandomWord: function(){
		//rÃ©cupÃ¨re un mot au hasard pour faire contribuer l'utilisateur
		app.proposedWord = model.getRandomWord();

		UI.printWord(app.proposedWord);
	},
	
	//User interaction
	addContribution: function(e){
		if(e.keyCode == 13){
			if(this.value){

				var proposedWord;

				if(e.target.getAttribute('data-activeWord') === 'activeWord'){
					proposedWord = app.activeWord;
				}else{
					proposedWord = app.proposedWord;
				}

				model.addContribution(this.value.toLowerCase(), proposedWord, 
					function(){ //success
						document.dispatchEvent(app.event.userContribution);
					},
					function(error){
						UI.notification('error', error);
					}
				);
				
				this.value = '';

			}

		}
	},

	addFilter: function(e, filter, value){

		if(!e.target.classList.contains('active')){
			UI.menu.addActiveFilter(e.target);
			app.filters[filter] = value;

		}else{
			UI.menu.removeActiveFilter(e.target);
			app.filters[filter] = false;
		}

		app.reloadData();		
	},

	resetFilters: function(){
		
		app.filters.sexe = false;
		app.filters.age = false;
		
		UI.menu.removeAllActiveFilter();
		
		app.reloadData();		
		
	},

	searchNode: function(e){
		
		var value = this.value;

		//auto completion avec les mots qui matches avec la recherche
		if(value){
			var matches = model.words.nodes.filter(function (node) {
				return	node.name.substring(0, value.length) === value;
			});
		}

		var datalist = document.getElementById('searchAutoComplete');

		datalist.innerHTML = '';

		if(matches){
			matches.forEach(function(match){
				var option = document.createElement('option');
				option.innerHTML = match.name;
				datalist.appendChild(option);
			});
		}

		//envoi de la recherche
		if(e.keyCode === 13){
			var selectedVal = document.getElementById("searchInput").value;

			UI.d3.searchNode(selectedVal);

			var selectedNode = model.getNodeFromWord(selectedVal);

			app.getNodeData(selectedNode, function(nodeData){
				UI.nodeData.openSection();
				UI.nodeData.printData(nodeData);
				app.activeWord = nodeData.name;
			});
			

			this.value = '';
			
			UI.menu.closeModal();
		}
	}
};

app.init();