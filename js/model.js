var model = {

	words: false,

	// INIT
	initFirebase: function(){
		this.firebase = new Firebase('https://torid-inferno-6438.firebaseio.com/mots');
	},

	// GET
	getData: function(calback){
		this.firebase.on('value', function (snapshot) {
			//GET DATA
			model.words = snapshot.val();
			calback.call(this, snapshot.val());
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


	// CREATE
	createNode: function(newWord){
		var newNode = {
			name: newWord,
			index: model.words.nodes.length,
			nbLinks: 0
		};

		model.words.nodes.push(newNode);

		this.firebase.child('nodes').set(model.words.nodes);

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

		model.words.links.push(newLink);

		this.firebase.set(model.words);
	},

	// ADD
	addContribution: function(newWord, proposedWord){

		if(!newWord || !proposedWord) { console.log('argument manquant pour addContribution'); return; }

		if(model.isAFrenchWord(newWord)){ //le mot est français

			console.log('le mot est français');

			var node = model.getNodeFromWord(newWord),
				proposedNode = model.getNodeFromWord(proposedWord);

			if(node){ //le mot est déjà present dans le tableau nodes

				console.log('le mot est déjà present dans le tableau nodes');

				var link = model.areLinked(node, proposedNode);

				if(link){// les deux mots sont déjà liés entre eux

					console.log('les deux mots sont déjà liés entre eux');

					//on ajoute 1 à la value de la liaison link
					link.element.value += 1;
					
					this.firebase.child('links').child(link.index).set(link.element);

				}else{ //les deux mots ne sont pas liés entre eux

					//on ajoute une liaison entre les deux mots

					if(node.index > proposedNode.index){
						model.createLink(node, proposedNode);
					}else{
						model.createLink(proposedNode, node);
					}
				}
			}else{ //le mot n'est n'est pas présent dans le tableau nodes

				//on ajoute le mot dans le tableau nodes, et on ajoute une liaison entre newWord et proposedWord
				var newNode = model.createNode(newWord);

				model.createLink(newNode, proposedNode);
			}
		}else{ //le mot n'est pas français

			//TODO message d'erreur
		}
	},


	// TEST
	isAFrenchWord: function(word){
		//TODO check si le mot est français, api google translate ?
		return true;
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
	}
};