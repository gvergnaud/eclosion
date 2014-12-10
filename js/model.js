var model = {

	words: false,

	initFirebase: function(){
		this.firebase = new Firebase('https://torid-inferno-6438.firebaseio.com/mots');
	},

	getData: function(calback){
		this.firebase.on('value', function (snapshot) {
			//GET DATA
			model.words = snapshot.val();
			calback.call(this, model.words);
		});
	},

	createNode: function(word){
		var newWordIndex = model.words.nodes.length;
		this.firebase.child('nodes').child(newWordIndex).set(word);
		return newWordIndex;
	},

	createLink: function(source, target){
		var newLink = {
			source: source,
			target: target,
			value: 1
		};

		this.firebase.child('links').child(model.words.links.length).set(newLink);
	},

	addContribution: function(newWord, previousWord){ 
	//newWord et previousWord sont des objets avec un attribue name, dans le quel est contenu le mot entré par le user

		if(model.isAFrenchWord(newWord)){
			//le mot est français
			console.log('le mot est français');
			var node = model.isInNodes(newWord);

			if(node){
				//le mot est déjà present dans le tableau nodes
				console.log('le mot est déjà present dans le tableau nodes');
				var link = model.areLinked(newWord, previousWord);
				console.log(link);
				if(link){
					// les deux mots sont déjà liés entre eux
					console.log('les deux mots sont déjà liés entre eux');
					//on ajoute 1 à la value de la liaison link
					link.element.value += 1;
					
					this.firebase.child('links').child(link.index).set(link.element);

				}else{
					//les deux mots ne sont pas liés entre eux
					//on ajoute une liaison entre les deux mots
					var newWordIndex = model.words.nodes.indexOf(newWord),
						previousWordIndex = model.words.nodes.indexOf(previousWord);

					if(newWordIndex > previousWordIndex){
						model.createLink(newWordIndex, previousWordIndex);
					}else{
						model.createLink(previousWordIndex, newWordIndex);
					}
				}
			}else{
				//le mot n'est n'est pas présent dans le tableau nodes
				//TODO ajouter le mot dans le tableau nodes, et ajouter une liaison entre newWord et previousWord
				var newWordIndex = model.createNode(newWord);

				console.log(previousWord);
				model.createLink(newWordIndex, previousWord.index);
			}
		}else{
			//le mot n'est pas français
			//TODO message d'erreur
		}
	},

	isAFrenchWord: function(word){
		//TODO check si le mot est français, api google translate ?
		return true;
	},

	isInNodes: function(word){

		var node = false;

		var BreakException = {};

		try {

			model.words.nodes.forEach(function(element, index){
				if(word.name.toLowerCase() === element.name.toLowerCase()){
					node = {
						index: index,
						element: element
					};
					throw BreakException;
				}
			});

		} catch(e) {

		    if (e !== BreakException) throw e;
		}

		return node;
	},

	areLinked: function(newWord, previousWord){
		console.log(newWord);
		console.log(previousWord);
		var newWordIndex = model.words.nodes.indexOf(newWord),
			previousWordIndex = previousWord.index;

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
		
		if(newWordIndex > previousWordIndex){
			return areLinked(newWordIndex, previousWordIndex);
		}else{
			return areLinked(previousWordIndex, newWordIndex);
		}
	}
};