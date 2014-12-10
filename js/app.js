var app = {
	init: function(){

		UI.init();

		model.initFirebase();

		model.getData(function(words){
			UI.createD3Graph(words);
		});

		/*model.getNodes(function(nodes){
			console.log(nodes);
		});*/

		document.querySelector('#addContribution').addEventListener('keypress', app.addContribution);
	},

	addContribution: function(e){
		if(e.keyCode == 13){
			if(this.value){
				var newWord = {
					name: this.value
				};

				model.addContribution(newWord, model.words.nodes[0]);
				
				this.value = '';
			}

		}
	}
};

app.init();