var app = {

	proposedWord : false,

	filters : {
		age: false,
		sexe: false
	},

	event: {},

	init: function(){

		app.createCustomEvents();

		UI.init();

		model.initFirebase();

		model.getDico();

		app.watchData();
		
		//lorsque le graph principale a �t� cr�e

		document.addEventListener('graphready', function (e) {
			app.graphCreated = true;
			app.proposeRandomWord();
			
			UI.d3.svg.call(d3.behavior.zoom().on("zoom", function(){
				UI.d3.redrawGraph();
			}));
			
			//remove l'event listener
			e.target.removeEventListener(e.type, arguments.callee);
		}, false);

		//lorsque l'utilisateur ajoute un mot
		document.addEventListener('usercontribution', function (e) {
			app.proposeRandomWord();
		});

		document.querySelector('#addContribution').addEventListener('keypress', app.addContribution);
		document.querySelector('div.filters button.reset').addEventListener('click', app.resetFilters);
	},

	createCustomEvents: function(){
		// Crée l'evenement
		app.event.graphReady = document.createEvent('Event');
		app.event.graphReady.initEvent('graphready', true, true);

		app.event.userContribution = document.createEvent('Event');
		app.event.userContribution.initEvent('usercontribution', true, true);
	},

	watchData: function(){
		model.watchData(function(words){
			//Crée le graph avec D3.js
			if(app.filters.sexe || app.filters.age){

				model.applyFilters(words, app.filters, function(filteredWords){
					
					if(!app.graphCreated){ //si le graph n'est pas créé on le crée
						UI.d3.createGraph( filteredWords );
						app.graphCreated = true;

					}else{ //si il est créé on update
						UI.d3.updateGraph( filteredWords );
					}
				});

			}else{
				if(!app.graphCreated){ //si le graph n'est pas créé on le crée
					UI.d3.createGraph( words );
					app.graphCreated = true;

				}else{ //si il est créé on update
					UI.d3.updateGraph( words );
				}
			}
		});
	},

	reloadData: function(){
		model.getDataOnce(function(words){
			if(app.filters.sexe || app.filters.age){

				model.applyFilters(words, app.filters, function(filteredWords){
							
					UI.d3.createGraph( filteredWords );
				});

			}else{
				UI.d3.createGraph( words );
			}
		});
	},
	
	searchNode : function(){
		var selectedVal = document.getElementById("search").value;
		var node = UI.d3.svg.selectAll(".nodes>g");
		
		// Recherche de nodes
		model.searchNode(selectedVal, node, function(unselected, selected){
			if(selected[0].length > 0){
				UI.d3.searchNode(unselected, selected);
			}else{
				console.log("Pas de mots trouv�s");
			}
		});
	},

	proposeRandomWord: function(){
		//récupère un mot au hasard pour faire contribuer l'utilisateur
		app.proposedWord = model.getRandomWord();

		UI.printWord(app.proposedWord);
	},
	
	//Filters
	addContribution: function(e){
		if(e.keyCode == 13){
			if(this.value){

				model.addContribution(this.value, app.proposedWord);
				
				this.value = '';

				document.dispatchEvent(app.event.userContribution);
			}

		}
	},

	//Filters 
	addFilter: function(filter, value){

		app.filters[filter] = value;

		app.reloadData();		
	},

	resetFilters: function(){
		
		app.filters.sexe = false;
		app.filters.age = false;
		
		app.reloadData();		
		
	}
};

app.init();