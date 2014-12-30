var Model = (function(){
	'use strict';

	// PRIVATE
	var _firebase = new Firebase('https://torid-inferno-6438.firebaseio.com/mots');

	var _words = false;

	var _dico = false;

	var _ajax = function(fichier, callback){
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function(){
			if (xmlhttp.readyState==4 && xmlhttp.status==200)
				if(typeof callback !="undefined"){callback.call(this, xmlhttp.responseText);}
		};
		xmlhttp.open("GET", fichier, true);
		xmlhttp.setRequestHeader("Content-Type", "charset=utf-8");
		xmlhttp.send(null);
	};

	var ieFilterCompatibility = function(){
		if (!Array.prototype.filter) {
			Array.prototype.filter = function(fun /*, thisp*/) {
				var len = this.length >>> 0;
				if (typeof fun != "function"){
					throw new TypeError();
				}

				var res = [];
				var thisp = arguments[1];
				for (var i = 0; i < len; i++) {
					if (i in this) {
						var val = this[i]; // in case fun mutates this
						if (fun.call(thisp, val, i, this)){
							res.push(val);
						}
					}
				}
				return res;
			};
		}
	};


	return {

		getRandomWord: function(){
			return _words.nodes[Math.ceil(Math.random()*(_words.nodes.length))-1].name;
		},

		getNodeFromWord: function(word){

			var node = false;

			var BreakException = {};

			try {

				_words.nodes.forEach(function(element, index){
					if(word.toLowerCase() === element.name.toLowerCase()){
						node = element;
						throw BreakException;
					}
				});

			} catch(e) {

			    if (e !== BreakException) throw e;
			}

			return node;
		},

		getNodeFromIndex: function(index){

			var node = false;

			var BreakException = {};

			try {

				_words.nodes.forEach(function(element, index){
					if(index === element.index){
						node = element;
						throw BreakException;
					}
				});

			} catch(e) {

			    if (e !== BreakException) throw e;
			}

			return node;
		},

		getAllLinksFromNode: function(node){

			var links = _words.links.filter(function (link) {
				return link.source === node.index || link.target === node.index;
			});

			return links;
		},

		getNodeOccurrence: function(node){

			var occurrence = 0,
				links = model.getAllLinksFromNode(node);

			links.forEach(function(link){
				occurrence += link.value;
			});

			return occurrence;
		},

		getMostAssociatedWords: function(node){
			var mostAssociatedWords = [],
				links = model.getAllLinksFromNode(node),
				BreakException = {};


			links.sort(function(a, b) { //on trie le tableau par value décroissante
				return b.value - a.value;
			});

			/*var totalOccurrence = 0;

			links.forEach(function(link){
				totalOccurrence += link.value;
			});*/

			try{
				links.forEach(function(link){
					var word = {};

					if(link.source !== node.index){
						word.name = _words.nodes[link.source].name;
						word.occurrence = link.value;
						//word.occurrencePercentage = Math.round(link.value * 100 / totalOccurrence);
					}else{
						word.name = _words.nodes[link.target].name;
						word.occurrence = link.value;
						//word.occurrencePercentage = Math.round(link.value * 100 / totalOccurrence);
					}
					mostAssociatedWords.push(word);

					if(mostAssociatedWords.length === 5){
						throw BreakException;
					}
				});
			} catch(e) {
				if (e !== BreakException) throw e;
			}

			return mostAssociatedWords;
		},

		getSexeOccurrence: function(node){
			var total = node.sexe.female + node.sexe.male + node.sexe.unknown;

			var sexeOccurrence = {
				female: Math.round(node.sexe.female * 100 / total),
				male: Math.round(node.sexe.male * 100 / total),
				unknown: Math.round(node.sexe.unknown * 100 / total),
			};

			return sexeOccurrence;
		},

		getAgeOccurrence: function(node){
			var total = node.age.unknown + node.age.under25 + node.age['25to35'] + node.age['35to45'] + node.age.above45;

			var ageOccurrence = {
				unknown: Math.round(node.age.unknown * 100 / total),
				under25: Math.round(node.age.under25 * 100 / total),
				'25to35': Math.round(node.age['25to35'] * 100 / total),
				'35to45': Math.round(node.age['35to45'] * 100 / total),
				above45: Math.round(node.age.above45 * 100 / total),
			};

			return ageOccurrence;
		},


		// CREATE
		createNode: function(newWord, beforePush){
			var newNode = {
				name: newWord,
				index: _words.nodes.length,
				nbLinks: 0,
				sexe: {
					'male': 0,
					'female': 0,
					'unknown': 0
				},
				age: {
					'unknown': 0,
					'under25': 0,
					'25to35': 0,
					'35to45': 0,
					'above45': 0
				}
			};

			if(beforePush){
				beforePush.call(this, newNode);
			}

			_words.nodes.push(newNode);

			return newNode;
		},

		createLink: function(sourceNode, targetNode){
			var newLink = {
				source: sourceNode.index,
				target: targetNode.index,
				value: 1
			};

			//incrémente le nb de laison des nodes cocernés

			_words.nodes[sourceNode.index].nbLinks += 1;
			_words.nodes[targetNode.index].nbLinks += 1;

			//ajoute les states sur l'age et le sex au node
			_words.nodes[sourceNode.index].age[model.user.age] += 1;
			_words.nodes[targetNode.index].age[model.user.age] += 1;

			_words.nodes[sourceNode.index].sexe[model.user.sexe] += 1;
			_words.nodes[targetNode.index].sexe[model.user.sexe] += 1;

			_words.links.push(newLink);
		},

		updateLink: function(link){
			link.element.value += 1;

			_words.nodes[link.element.source].age[model.user.age] += 1;
			_words.nodes[link.element.target].age[model.user.age] += 1;

			_words.nodes[link.element.source].sexe[model.user.sexe] += 1;
			_words.nodes[link.element.target].sexe[model.user.sexe] += 1;

			_words.links[link.index] = link.element;
		},

		// ADD
		addContribution: function(newWord, proposedWord, successCallback, errorCallback){

			if(!newWord || !proposedWord) { console.log('argument manquant pour addContribution'); return; }

			if(model.isAFrenchWord(newWord)){ //le mot est français

				console.log('le mot est français');
				
				// si l'utilisateur est nouveau
				if(model.newUser){
					_words.contributors += 1;
					model.newUser = false;
				}

				var node = model.getNodeFromWord(newWord),
					proposedNode = model.getNodeFromWord(proposedWord);

				if(node){ //le mot est déjà present dans le tableau nodes

					console.log('le mot est déjà present dans le tableau nodes');

					var link = model.areLinked(node, proposedNode);

					if(link){// les deux mots sont déjà liés entre eux

						console.log('les deux mots sont déjà liés entre eux');

						//on ajoute 1 à la value de la liaison link
						model.updateLink(link);
						model.saveData();

						successCallback.call(this);

					}else{ //les deux mots ne sont pas liés entre eux

						//on ajoute une liaison entre les deux mots

						if(node.index > proposedNode.index){
							model.createLink(node, proposedNode);
							model.saveData();
						}else{
							model.createLink(proposedNode, node);
							model.saveData();
						}

						successCallback.call(this);
					}
				}else{ //le mot n'est n'est pas présent dans le tableau nodes

					//on ajoute le mot dans le tableau nodes, et on ajoute une liaison entre newWord et proposedWord
					var newNode = model.createNode(newWord);

					model.createLink(newNode, proposedNode);
					model.saveData();

					successCallback.call(this);
				}
			}else{ //le mot n'est pas français

				var error = 'le mot n\'est pas français';
				console.log(error);
				errorCallback.call(this, error);
			}
		},

		addUnlinkedNode: function(word, callback){
			
			model.createNode(word, function(newNode){
				newNode.age[model.user.age] += 1;
				newNode.sexe[model.user.sexe] += 1;
			});

			model.saveData();

			if(callback){
				callback.call(this);
			}
		},

		// TEST
		isAFrenchWord: function(word){
			//TODO check si le mot est français, api google translate ?
			function isFrench(){
				var drapeau = false;
				var ligne = 0;
				// Répéter tant que le mot n'a pas été trouvé ou que le dictionnaire n'a pas été lu entièrement.
				while(drapeau === false && ligne < _dico.length){
					if (_dico[ligne].trim() == word) { // Si mot trouvé
						drapeau = true; // drapeau pour sortir de la boucle si on a trouvé le mot
					}
					ligne++; 
				}
					
				return drapeau;
			}

			if(_dico){
				return isFrench();
			}
		},

		areLinked: function(node, proposedNode){

			function areLinked(source, target){
				var link = false;

				var BreakException = {};

				try {

					_words.links.forEach(function(element, index){
						if(element.source === source && element.target === target){
							link = {
								index: index,
								element: element
							};
							throw BreakException;
						}
					});

				} catch(e) {

				    if (e !== BreakException) throw e;
				}

				return link;
			}
			
			if(node.index > proposedNode.index){
				return areLinked(node.index, proposedNode.index);
			}else{
				return areLinked(proposedNode.index, node.index);
			}
		},

		//ApplyFilters
		applyFilters: function(words, filters, callback){

			//Compatibilité IE pour la methode filter de Array

			var filteredWords = {};

			if(filters.sexe && filters.age){

				filteredWords.nodes = words.nodes.filter(function (node) {
					return	node.sexe && node.sexe[filters.sexe] > 0  &&
							node.age && node.age[filters.age] > 0;
				});

			}else if(filters.sexe){

				filteredWords.nodes = words.nodes.filter(function (node) {
					return	node.sexe && node.sexe[filters.sexe] > 0;
				});

			}else if(filters.age){

				filteredWords.nodes = words.nodes.filter(function (node) {
					return	node.age && node.age[filters.age] > 0;
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

	};

})();