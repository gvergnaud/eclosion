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
			
			UI.d3.svg.call(d3.behavior.zoom().scaleExtent([0.25, 3]).on("zoom", function(){
				UI.d3.redrawGraph();
			}));
			
			//remove l'event listener
			e.target.removeEventListener(e.type, arguments.callee);
		}, false);

		//lorsque l'utilisateur ajoute un mot
		document.addEventListener('usercontribution', function (e) {
			app.proposeRandomWord();
		});

		document.querySelector('#addContribution').addEventListener('keypress', app.addContribution, false);
		document.querySelector('#search').addEventListener('keyup', app.searchNode, false);
		document.querySelector('div.filters button.reset').addEventListener('click', app.resetFilters, false);
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

	//User interaction
	addFilter: function(filter, value){

		app.filters[filter] = value;

		app.reloadData();		
	},

	resetFilters: function(){
		
		app.filters.sexe = false;
		app.filters.age = false;
		
		app.reloadData();		
		
	},

	searchNode: function(e){
		var value = this.value;
		
		if(value){
			var matches = model.words.nodes.filter(function (node) {
				return	node.name.substring(0, value.length) === value;
			});
		}

		var datalist = document.getElementById('searchAutoComplete');

		datalist.innerHTML = '';

		matches.forEach(function(match){
			var option = document.createElement('option');
			option.innerHTML = match.name;
			datalist.appendChild(option);
		});

		if(e.keyCode === 13){
			var selectedVal = document.getElementById("search").value;
			UI.d3.searchNode(selectedVal);
			this.value = '';
		}
	},
};

app.init();