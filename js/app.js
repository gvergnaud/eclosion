var app = {
	init: function(){

		UI.init();

		model.initFirebase();

		model.getData(function(words){
			
			//Crée le graph avec D3.js
			UI.createD3Graph(words);
			
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