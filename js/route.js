var Route = (function(){
	'use strict';
		
	// PRIVATE
	var _routeParams = {};

	var _root = '#';

	var _getParams = function(){
		var hashtab = window.location.hash.split('/');
		_routeParams.word = hashtab[1];
	};


	// PUBLIC
	var route = {

		params: function(){
			_getParams();
			return _routeParams;
		},

		set: function(params){
			var path = _root;

			if(params.mapbase){
				path += '/' + params.mapbase;
			}

			if(params.word){
				path += '/' + encodeURI(params.word);
			}

			history.pushState({}, null, path);
		},

		flush: function(){
			history.pushState({}, 'Home', window.location.href.split('#')[0]);
		}
	};


	return route;

})();