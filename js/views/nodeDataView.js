UI.nodeData = (function(){
	'use strict';

	// PRIVATE
	var _previous = {
		occurrence: false,
		nbLinks: false,
		sexeOccurrence: false,
		ageOccurrence: false,
		mostAssociatedWords: false
	};

	// PUBLIC
	var View = {

		element: document.querySelector('#nodeData'),

		opened: false,

		style: function(){
			this.element.querySelector('div.stats').style.maxHeight = window.innerHeight - 260 + 'px';
		},

		openSection: function(){
			if(!this.opened){
				var openAnim = [
		        	{
		        		elements: this.element, 
		        		properties: {right: 0},
		        		options: {duration: 250, easing : "easeIn"}
		        	}
		        ];
		        
				this.element.style.display = 'block';

				Velocity.RunSequence(openAnim);

				this.opened = true;
			}
		},

		closeSection: function(){
			if(this.opened){
				var closeAnim = [
		        	{
		        		elements: this.element, 
		        		properties: {right: '-350px'},
		        		options: {duration: 250, easing: 'easeOut'}
		        	}
		        ];

				Velocity.RunSequence(closeAnim);
				setTimeout(function(){
					View.element.style.display = 'none';
				}, 250);

				this.opened = false;
			}
		},

		printData: function(nodeData){
			
			//affiche le mot en haut du panneau
			this.element.querySelector('.nodeName').innerText = nodeData.name;
			this.element.querySelector('.addContribution').setAttribute('placeholder', 'Si je vous dis ' + nodeData.name + '...');

			//affiche le nombre d'utilisation du mot
			if (nodeData.occurrence !== _previous.occurrence) {
				this.printOccurrence(nodeData.occurrence);
			}

			//affiche le nombre de connexions
			if (nodeData.nbLinks !== _previous.nbLinks) {
				this.printNbLinks(nodeData.nbLinks);
			}

			//affiche le nombre dutilisation par sexe
			if(nodeData.sexeOccurrence !== _previous.sexeOccurrence){
				this.printSexeOccurrence(nodeData.sexeOccurrence);
			}

			//affiche le nombre dutilisation par age
			if(nodeData.ageOccurrence !== _previous.ageOccurrence){
				this.printAgeOccurrence(nodeData.ageOccurrence);
			}

			//affiche les mots les plus associés à celui la
			if(nodeData.mostAssociatedWords !== _previous.mostAssociatedWords){
				this.printAssociatedWords(nodeData.mostAssociatedWords);
			}

			_previous = nodeData;
		},

		printOccurrence: function(occurrence){
			var occurrenceCountUp = new countUp(this.element.querySelector('div.occurrence>p.data'), 1, occurrence, 0, 1, {useEasing : false});
			occurrenceCountUp.start();
		},

		printNbLinks: function(nbLinks){
			var nbLinksCountUp = new countUp(this.element.querySelector('div.nbLinks>p.data'), 1, nbLinks, 0, 1, {useEasing : false});
			nbLinksCountUp.start();
		},

		printSexeOccurrence: function(sexeOccurrence){
			this.element.querySelector('div.sexeOccurrence>div.male .data').innerText = sexeOccurrence.male;
			this.element.querySelector('div.sexeOccurrence>div.female .data').innerText = sexeOccurrence.female;
		},

		printAgeOccurrence: function(ageOccurrence){
			this.element.querySelector('div.ageOccurrence>div.under25 .data').innerText = ageOccurrence['under25'];
			this.element.querySelector('div.ageOccurrence>div.from25to35 .data').innerText = ageOccurrence['25to35'];
			this.element.querySelector('div.ageOccurrence>div.from35to45 .data').innerText = ageOccurrence['35to45'];
			this.element.querySelector('div.ageOccurrence>div.above45 .data').innerText = ageOccurrence['above45'];
		},

		printAssociatedWords: function(mostAssociatedWords){
			var associatedDataElm = this.element.querySelector('div.mostAssociatedWords>div.associatedWordsContainer');

			associatedDataElm.innerHTML = '';

			mostAssociatedWords.forEach(function(word){
				var p = document.createElement('p');

				p.innerHTML = word.name + ' <span class="right"><span class="data">' + word.occurrence + '</span> fois</span>';
				p.classList.add('stat');

				associatedDataElm.appendChild(p);
			});
		}
	};

	//initialisation
	View.style();
	window.addEventListener('resize', function(){
		View.style();
	}, false);


	return View;

})();