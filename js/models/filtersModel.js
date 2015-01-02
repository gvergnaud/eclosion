var Filters = (function(){
	'use strict';
		
	// PRIVATE
	var _filters = {
		age: false,
		sexe: false
	};

	// PUBLIC
	var filtersModel = {

		set: function(filter, value){
			if(filter === 'age' || filter === 'sexe'){
				_filters[filter] = value;
			}
		},

		apply: function(words, callback){

			// si aucun filtre est actif, on execute le callback tout de suite
			if(_filters.sexe === false && _filters.age === false) { 
				
				callback.call(this, words); 
				
			}else{

				var filteredWords = {};

				if(_filters.sexe && _filters.age){

					filteredWords.nodes = words.nodes.filter(function (node) {
						return	node.sexe && node.sexe[_filters.sexe] > 0  &&
								node.age && node.age[_filters.age] > 0;
					});

				}else if(_filters.sexe){

					filteredWords.nodes = words.nodes.filter(function (node) {
						return	node.sexe && node.sexe[_filters.sexe] > 0;
					});

				}else if(_filters.age){

					filteredWords.nodes = words.nodes.filter(function (node) {
						return	node.age && node.age[_filters.age] > 0;
					});
				}

				filteredWords.links = words.links.filter(function (link) {

					return	(function(link){
						var ok = false;
						var BreakException = {};
						try{
							filteredWords.nodes.forEach(function(node, index){
								if(link.source === node.index){
									link.source = index;
									ok = true;
									throw BreakException;
								}
							});
						} catch(e) {
							if (e !== BreakException) throw e;
						}
						return ok;
					})(link) 

					&&

					(function(link){
						var ok = false;
						var BreakException = {};
						try{
							filteredWords.nodes.forEach(function(node, index){
								if(link.target === node.index){
									link.target = index;
									ok = true;
									throw BreakException;
								}
							});
						} catch(e) {
							if (e !== BreakException) throw e;
						}
						return ok;
					})(link);
				});

				callback.call(this, filteredWords);
			}
		}
	};

	return filtersModel;

})();