var model = {

	words: false,

	dico: false,
	
	//Toolbox

	toolbox: {
		ajax: function(fichier, callback){
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function(){
				if (xmlhttp.readyState==4 && xmlhttp.status==200)
					if(typeof callback !="undefined"){callback.call(this, xmlhttp.responseText);}
			};
			xmlhttp.open("GET", fichier, true);
			xmlhttp.setRequestHeader("Content-Type", "charset=utf-8");
			xmlhttp.send(null);
		},

		ieFilterCompatibility: function(){
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
		}
	},

	// INIT
	initFirebase: function(){
		this.firebase = new Firebase('https://torid-inferno-6438.firebaseio.com/mots');
	},

	initUser: function(){

		var user = JSON.parse(localStorage.getItem('EchoUser'));

		if(!user){
			user = {
				age: 'unknown',
				sexe: 'unknown'
			};

			localStorage.setItem('EchoUser', JSON.stringify(user));

			model.newUser = true;
		}

		this.user = user;
	},

	// GET
	getDico: function(){
		model.toolbox.ajax("res/liste.de.mots.francais.frgut.txt", function(data){
			model.dico = data.split(/\n/g); // On analyse ligne par ligne
		});
	},

	watchData: function(callback){
		this.firebase.on('value', function (snapshot) {
			//GET DATA
			model.words = snapshot.val();
			callback.call(this, snapshot.val());
		});
	},

	getDataOnce: function(callback){
		this.firebase.once("value", function (snapshot) {
			//GET DATA
			model.words = snapshot.val();
			callback.call(this, snapshot.val());
		});
	},

	getRandomWord: function(){
		return model.words.nodes[Math.ceil(Math.random()*(model.words.nodes.length))-1].name;
	},

	getNodeFromWord: function(word){

		var node = false;

		var BreakException = {};

		try {

			model.words.nodes.forEach(function(element, index){
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

			model.words.nodes.forEach(function(element, index){
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
		//Compatibilité IE pour la methode filter de Array
		model.toolbox.ieFilterCompatibility();

		var links = model.words.links.filter(function (link) {
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

		try{
			links.forEach(function(link){
				if(link.source !== node.index){
					var word = model.words.nodes[link.source].name;
				}else{
					var word = model.words.nodes[link.target].name;
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
			female: node.sexe.female * 100 / total,
			male: node.sexe.male * 100 / total,
			unknown: node.sexe.unknown * 100 / total,
		};

		return sexeOccurrence;
	},

	getAgeOccurrence: function(node){
		var total = node.age.unknown + node.age.under25 + node.age['25to35'] + node.age['35to45'] + node.age.above45;

		var ageOccurrence = {
			unknown: node.age.unknown * 100 / total,
			under25: node.age.under25 * 100 / total,
			'25to35': node.age['25to35'] * 100 / total,
			'35to45': node.age['35to45'] * 100 / total,
			above45: node.age.above45 * 100 / total,
		};

		return ageOccurrence;
	},

	getUserAgeRange: function(age){
		var ageRange;

		if(age === 'unknown'){

			ageRange = 'unknown';

		}else if(age < 25){

			ageRange = 'under25';

		}else if(25 <= age < 35){
			
			ageRange = '25to35';

		}else if(35 <= age < 45){
			
			ageRange = '35to45';

		}else if(45 <= age){

			ageRange = 'above45';
		}

		return ageRange;
	},

	// CREATE
	createNode: function(newWord){
		var newNode = {
			name: newWord,
			index: model.words.nodes.length,
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

		model.words.nodes.push(newNode);

		return newNode;
	},

	createLink: function(sourceNode, targetNode){
		var newLink = {
			source: sourceNode.index,
			target: targetNode.index,
			value: 1
		};

		//incrémente le nb de laison des nodes cocernés

		model.words.nodes[sourceNode.index].nbLinks += 1;
		model.words.nodes[targetNode.index].nbLinks += 1;

		//ajoute les states sur l'age et le sex au node
		model.words.nodes[sourceNode.index].age[model.getUserAgeRange(model.user.age)] += 1;
		model.words.nodes[targetNode.index].age[model.getUserAgeRange(model.user.age)] += 1;

		model.words.nodes[sourceNode.index].sexe[model.user.sexe] += 1;
		model.words.nodes[targetNode.index].sexe[model.user.sexe] += 1;

		model.words.links.push(newLink);

		this.firebase.set(model.words);
	},

	updateLink: function(link){
		link.element.value += 1;

		model.words.nodes[link.element.source].age[model.getUserAgeRange(model.user.age)] += 1;
		model.words.nodes[link.element.target].age[model.getUserAgeRange(model.user.age)] += 1;

		model.words.nodes[link.element.source].sexe[model.user.sexe] += 1;
		model.words.nodes[link.element.target].sexe[model.user.sexe] += 1;

		model.words.links[link.index] = link.element;

		this.firebase.set(model.words);
	},

	// ADD
	addContribution: function(newWord, proposedWord, successCallback, errorCallback){

		if(!newWord || !proposedWord) { console.log('argument manquant pour addContribution'); return; }

		if(model.isAFrenchWord(newWord)){ //le mot est français

			console.log('le mot est français');
			
			// si l'utilisateur est nouveau
			if(model.newUser){
				model.words.contributors += 1;
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

					successCallback.call(this);

				}else{ //les deux mots ne sont pas liés entre eux

					//on ajoute une liaison entre les deux mots

					if(node.index > proposedNode.index){
						model.createLink(node, proposedNode);
					}else{
						model.createLink(proposedNode, node);
					}

					successCallback.call(this);
				}
			}else{ //le mot n'est n'est pas présent dans le tableau nodes

				//on ajoute le mot dans le tableau nodes, et on ajoute une liaison entre newWord et proposedWord
				var newNode = model.createNode(newWord);

				model.createLink(newNode, proposedNode);

				successCallback.call(this);
			}
		}else{ //le mot n'est pas français

			//TODO message d'erreur
			var error = 'le mot n\'est pas français';
			console.log(error);
			errorCallback.call(this, error);
		}
	},

	// TEST
	isAFrenchWord: function(word){
		//TODO check si le mot est français, api google translate ?
		function isFrench(){
			var drapeau = false;
			var ligne = 0;
			// Répéter tant que le mot n'a pas été trouvé ou que le dictionnaire n'a pas été lu entièrement.
			while(drapeau === false && ligne < model.dico.length){
				if (model.dico[ligne].trim() == word) { // Si mot trouvé
					drapeau = true; // drapeau pour sortir de la boucle si on a trouvé le mot
				}
				ligne++; 
			}
				
			return drapeau;
		}

		if(model.dico){
			return isFrench();
		}
	},

	areLinked: function(node, proposedNode){

		function areLinked(source, target){
			var link = false;

			var BreakException = {};

			try {

				model.words.links.forEach(function(element, index){
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
		model.toolbox.ieFilterCompatibility();

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

	},
};