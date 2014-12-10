var model = {

	mots: false,

	getData: function(calback){
		this.firebase = new Firebase('https://torid-inferno-6438.firebaseio.com');
		
		this.firebase.limitToLast(1).on('value', function (snapshot) {
			//GET DATA
			model.mots = snapshot.val();

			calback.call(this, model.mots);
		});
	},

	getNodes: function(calback){
		var fbNodes = new Firebase('https://torid-inferno-6438.firebaseio.com/mots/nodes');

		fbNodes.on('value', function (snapshot) {
			//GET DATA
			var nodes = snapshot.val();

			calback.call(this, nodes);
		});
	}
};