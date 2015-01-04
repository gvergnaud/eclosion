var Route = (function(){
	'use strict';
		
	// PRIVATE
	var _routeParams = {};

	var _root = '#';

	var _getParams = function(){
		var hashtab = window.location.hash.substring(1).split('/');

		if(hashtab[0] === 'mapbase'){
			_routeParams.mapbase = hashtab[1];
			_routeParams.word = hashtab[2];
			
		}else{
			_routeParams.word = hashtab[0];
		}
	};


	// PUBLIC
	var route = {

		params: function(){
			return _routeParams;
		},

		set: function(params){
			var path = _root;

			if(params.mapbase){
				path += 'mapbase/' + params.mapbase + '/';
			}

			if(params.word){
				path += encodeURI(params.word);
			}

			history.pushState({}, null, path);

			_getParams();
		},

		flush: function(){
			history.pushState({}, 'Home', window.location.href.split('#')[0]);

			_getParams();
		}
	};

	_getParams();

	return route;

})();