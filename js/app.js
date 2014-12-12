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

		model.initDictionaire();

		app.watchData();

		document.addEventListener('graphready', function (e) {
			console.log(e);
			app.graphCreated = true;
			app.proposeRandomWord();
		}, false);

		document.querySelector('#addContribution').addEventListener('keypress', app.addContribution);
		document.querySelector('div.filters button.reset').addEventListener('click', app.resetFilters);
	},

	createCustomEvents: function(){
		// Crée l'evenement
		app.event.graphReady = document.createEvent('Event');

		// Défini graphready comme nom d'evenement
		app.event.graphReady.initEvent('graphready', true, true);
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