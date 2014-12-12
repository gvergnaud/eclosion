var app = {

	proposedWord : false,

	filters : {
		age: false,
		sexe: false
	},

	create: false,

	init: function(){

		UI.init();

		model.initFirebase();

		app.watchData(function(){
			app.svg = UI.d3.svg;
			
			app.svg.call(d3.behavior.zoom().scaleExtent([0.25, 3]).on("zoom", function(){
	    		UI.d3.redrawGraph();
	    		UI.d3.defineZoom();
		    }));
		});

		document.querySelector('#addContribution').addEventListener('keypress', app.addContribution);
		document.querySelector('div.filters button.reset').addEventListener('click', app.resetFilters);
	},

	watchData: function(callback){
		model.getData(function(words){
		
			//Crée le graph avec D3.js
			if(app.filters.sexe || app.filters.age){

				model.applyFilters(words, app.filters, function(filteredWords){
					if(app.create === false){
						UI.d3.createGraph( filteredWords );
						app.create = true;
					}else{
						UI.d3.updateGraph( filteredWords );
					}
				});

			}else{
				if(app.create === false){
					UI.d3.createGraph( words );
					app.create = true;
				}else{
					UI.d3.updateGraph( words );
				}
			}
			
			//récupère un mot au hasard pour faire contribuer l'utilisateur
			app.proposedWord = model.getRandomWord();

			UI.printWord(app.proposedWord);
			callback.call(this);
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

	addContribution: function(e){
		if(e.keyCode == 13){
			if(this.value){

				model.addContribution(this.value, app.proposedWord);
				
				this.value = '';
			}

		}
	},

	addFilter: function(filter, value){

		app.filters[filter] = value;
		
		app.reloadData();		
	},

	resetFilters: function(){
		
		app.filters.sexe = false;
		app.filters.age = false;
		
		app.reloadData();		
		
	},
	
	searchNode : function(){
		var selectedVal = document.getElementById("search").value;
		var node = app.svg.selectAll(".nodes>g");
		
		// Recherche de nodes
		model.searchNode(selectedVal, node, function(unselected, selected){
			if(selected[0].length > 0){
				UI.d3.searchNode(unselected, selected);
			}else{
				console.log("Pas de mots trouvés");
			}
		});
	}
};

app.init();