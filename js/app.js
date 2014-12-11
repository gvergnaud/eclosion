var app = {

	proposedWord : false,

	filters : {},

	init: function(){

		UI.init();

		model.initFirebase();

		this.filters.sexe = false;
		this.filters.age = false;

		model.getData(function(words){
			//Crée le graph avec D3.js
			if(app.filters.sexe || app.filters.age){

				model.applyFilters(words, app.filters, function(filteredWords){
					
					UI.createD3Graph( filteredWords );
				});

			}else{
				UI.createD3Graph(words);
			}
			
			//récupère un mot au hasard pour faire contribuer l'utilisateur
			app.proposedWord = model.getRandomWord();

			UI.printWord(app.proposedWord);
		});

		/*model.getNodes(function(nodes){
			console.log(nodes);
		});*/

		document.querySelector('#addContribution').addEventListener('keypress', app.addContribution);

		var sexeFilterElements = document.querySelectorAll('.filter.sexe');
		
		[].forEach.call(sexeFilterElements, function(element){
			element.addEventListener('change', function(e){
				console.log(e);
				//app.addFilter('sexe', e.target)
			});
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

		console.log(e);

		app.filters[filter] = value;
				
		// model.getDataOnce(function(words){

		// 	if(app.filters.sexe || app.filters.age){

		// 		model.applyFilters(words, app.filters, function(filteredWords){
							
		// 			UI.createD3Graph( filteredWords );
		// 		});

		// 	}else{
		// 		UI.createD3Graph(words);
		// 	}

		// });
	}
};

app.init();