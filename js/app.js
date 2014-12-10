var app = {
	init: function(){

		UI.init();

		model.getData(function(data){
			console.log(data);
			UI.createD3Graph(data.mots);
		});

		model.getNodes(function(nodes){
			console.log(nodes);
		});
	}
};

app.init();