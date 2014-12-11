var app = {

	proposedWord : false,

	filters : {},

	init: function(){

		UI.init();

		model.initFirebase();

		this.filters.sexe = 'unknown';
		this.filters.age = false;

		model.getData(function(words){
			
			//Crée le graph avec D3.js
			if(app.filters.sexe || app.filters.age){

				model.applyFilters(app.filters, function(filteredWords){

					function clone(obj) {
					    if (null == obj || "object" != typeof obj) return obj;
					    var copy = obj.constructor();
					    for (var attr in obj) {
					        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
					    }
					    return copy;
					}
					console.log(filteredWords);
					var test = clone(filteredWords);
					console.log(test);
					UI.createD3Graph( test );
					console.log(model.words)
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
	},

	addContribution: function(e){
		if(e.keyCode == 13){
			if(this.value){

				model.addContribution(this.value, app.proposedWord);
				
				this.value = '';
			}

		}
	}
};

app.init();