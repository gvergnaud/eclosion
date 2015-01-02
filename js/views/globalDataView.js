UI.globalData = (function(){
	'use strict';

	// PRIVATE
	var _previous = {
		words: false,
		connections: false,
		contributors: false
	};

	// PUBLIC
	var View = {

		print: function(nbWords, nbConnections, nbContributors){
			
			if (nbWords !== _previous.words) {
				this.printNbWords(nbWords);
				_previous.words = nbWords;
			}

			if (nbConnections !== _previous.connections) {
				this.printNbConnections(nbConnections);
				_previous.connections = nbConnections;
			}

			if (nbContributors !== _previous.contributors) {
				this.printNbContributors(nbContributors);
				_previous.contributors = nbContributors;
			}
		},

		printNbWords: function(nbWords){
			var words = new countUp(document.querySelector('#globalData span.words'), 1, nbWords, 0, 2);
			words.start();
		},

		printNbConnections: function(nbConnections){
			var connections = new countUp(document.querySelector('#globalData span.connections'), 1, nbConnections, 0, 2);
			connections.start();
		},

		printNbContributors: function(nbContributors){
			var contributors = new countUp(document.querySelector('#globalData span.contributors'), 1, nbContributors, 0, 2);
			contributors.start();
		}
	};

	return View;

})();