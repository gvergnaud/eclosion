var App = (function(Words, User, UI){

	// PRIVATE
	var _routeParams = {};

	var _proposedWord = false;

	var _activeWord = false;

	var _filters = {
		age: false,
		sexe: false
	};

	// PUBLIC
	var app = {

		event: {},

		startStoryTelling : function(){
			UI.animation.start();
			
			/* Gestion du Story Telling */
	        document.getElementById('startExperience').addEventListener("click", function(e){
	        	e.preventDefault();
	        	UI.animation.skip();
		        app.init();
	        }, false);

	        document.getElementById('skip').addEventListener("click", function(e){
	        	e.preventDefault();
	        	UI.animation.skip();
		        app.init();
	        }, false);
	        
		},
		
		init: function(){

			app.getRouteParams();

			UI.init();

			app.createCustomEvents();

			app.watchData();
			
			//lorsque le graph principale a été crée
			document.addEventListener('graphready', app.onGraphReady, false);

			// lorsque les données sont mises à jour
			document.addEventListener('dataupdate', app.onDataUpdate, false);

			//lorsque l'utilisateur ajoute un mot
			document.addEventListener('usercontribution', app.onUserContribution, false);
			
			// Fermeture de la fenetre droite au clic sur la croix
			document.querySelector("#nodeData .close").addEventListener("click", app.blurWord, false);

			//applique l'evenement addContribution à tous les elements ayant la class
			[].forEach.call(document.querySelectorAll('.addContribution'), function (element) {
				element.addEventListener('keyup', app.addContribution, false);
			});

			// lorsque l'utilisateur tape un caractère dans l'espace recherche
			document.querySelector('#searchInput').addEventListener('keyup', app.searchNode, false);

			/* Gestion des fenêtres du menu */
	        document.getElementById('searchBox').addEventListener("click", function(){
	        	UI.menu.searchBoxView();
	        	UI.menu.addClickStyle(this);
	        	app.blurWord();
	        }, false);

	        document.getElementById('addWordBox').addEventListener("click", function(){
	        	UI.menu.addWordBoxView();
	        	UI.menu.addClickStyle(this);
	        	app.blurWord();
	        }, false);

	        document.getElementById('filterBox').addEventListener("click", function(){
	        	UI.menu.filterWordBoxView();
	        	UI.menu.addClickStyle(this);
	        	app.blurWord();
	        }, false);

	        /* Gestion du footer */
	        document.getElementById('aproposButton').addEventListener("click", function() {
	        	UI.about.openOverlay();
	        }, false);
	        
	        document.getElementById('soundOption').addEventListener("click", function() {
	        	UI.about.soundMute();
	        }, false);

	        document.getElementById('aproposOverlay').addEventListener("click", function() {
	        	UI.about.closeOverlay();
	        }, false);

	        // Overlay d'unfo utilisateur
	        document.querySelector('#userInfoOverlay .userInfoForm').addEventListener('submit', app.onUserInfoSubmit, false);		
		},

		getRouteParams: function(){
			var hashtab = window.location.hash.split('/');
			_routeParams.word = hashtab[1];
		},

		createCustomEvents: function(){
			// CrÃ©e l'evenement
			app.event.graphReady = document.createEvent('Event');
			app.event.graphReady.initEvent('graphready', true, true);

			app.event.dataUpdate = document.createEvent('Event');
			app.event.dataUpdate.initEvent('dataupdate', true, true);

			app.event.userContribution = document.createEvent('Event');
			app.event.userContribution.initEvent('usercontribution', true, true);

			app.event.userInfoSubmit = document.createEvent('Event');
			app.event.userInfoSubmit.initEvent('userinfosubmit', true, true);
		},

		onGraphReady: function (e) {

			app.graphCreated = true;
			
			// Lancement du son
			document.querySelector("#player").play();

			app.proposeRandomWord();

			UI.d3.svg.call(d3.behavior.zoom().scaleExtent([UI.d3.zoomMin, UI.d3.zoomMax]).on("zoom", function(){
				UI.d3.redrawGraph();
				UI.d3.defineCursor();
			}));

			//si un mot est passé en parametre, on le focus
			if(_routeParams.word){
				setTimeout(function(){
					app.focusWord( decodeURI(_routeParams.word));
				}, 1500);
			}

			//remove l'event listener
			e.target.removeEventListener(e.type, arguments.callee);
		},

		onDataUpdate: function(){

			//on affiche les données globales
			UI.printGlobalData(Words.get().nodes.length,  Words.get().links.length, Words.get().contributors);
			
			//si le panneau est ouvert, et qu'il y a un mot actif, on update les données
			if(_activeWord){
				app.getNodeData(Words.getNodeFromWord(_activeWord), function(nodeData){
					UI.nodeData.printData(nodeData);
				});
			}

			//au click sur un node, on ouvre le panneau droit et on recupérer toutes les données de ce node
			UI.d3.svg.selectAll(".nodes>g>circle").on("mouseup", 	function(node){
				if(d3.event.defaultPrevented == false){
					UI.d3.selectNode(d3.select(this.parentNode));
					app.focusWord(node.name);
				}
			});
			
			// On désactive le double click sur les noeuds
			UI.d3.svg.selectAll(".nodes>g>circle").on("dblclick", 	function(node){
				d3.event.stopPropagation();
			});
		},

		onUserContribution: function (e) {
			setTimeout(function(){
				app.focusWord(app.lastUserContribution);
			}, 1500);

			app.proposeRandomWord();
			if(UI.menu.opened){
				UI.menu.closeModal();
			}

			UI.removeAllNotifications();
		},

		onUserInfoSubmit: function(e){
			e.preventDefault();

			var radioMale = document.querySelector('#userInfoOverlay .userSexe.male'),
				radioFemale = document.querySelector('#userInfoOverlay .userSexe.female'),
				selectAge = document.querySelector('#userInfoOverlay .userAge'),
				sexe,
				age;

			if(radioMale.checked || radioFemale.checked){
				if(radioMale.checked){
								
					sexe = 'male';

				}else if(radioFemale.checked){
					
					sexe = 'female';
				}

				age = selectAge.options[selectAge.selectedIndex].value;

				User.update(sexe, age);

				UI.userInfo.closeOverlay();

				document.dispatchEvent(app.event.userInfoSubmit);
			}else{
				
				UI.notification(document.querySelector('#userInfoOverlay p.error'), 'Veillez spécifier votre sexe');
			}

		},

		watchData: function(){
			Words.watchData(function(words){
				//CrÃ©e le graph avec D3.js
				if(_filters.sexe || _filters.age){

					Words.applyFilters(words, _filters, function(filteredWords){
						
						if(!app.graphCreated){ //si le graph n'est pas crÃ©Ã© on le crÃ©e
							UI.d3.createGraph( filteredWords );
							app.graphCreated = true;

						}else{ //si il est crÃ©Ã© on update
							UI.d3.updateGraph( filteredWords );
						}
					});

				}else{
					if(!app.graphCreated){ //si le graph n'est pas crÃ©Ã© on le crÃ©e
						UI.d3.createGraph( words );
						app.graphCreated = true;

					}else{ //si il est crÃ©Ã© on update
						UI.d3.updateGraph( words );
					}
				}

				document.dispatchEvent(app.event.dataUpdate);
			});
		},


		reloadData: function(){
			Words.getDataOnce(function(words){
				if(_filters.sexe || _filters.age){

					Words.applyFilters(words, _filters, function(filteredWords){
								
						UI.d3.createGraph( filteredWords );

						//redraw pour eviter les problèmes de zoom
						UI.d3.svg.call(d3.behavior.zoom().scaleExtent([UI.d3.zoomMin, UI.d3.zoomMax]).on("zoom", function(){
							UI.d3.redrawGraph();
							UI.d3.defineCursor();
						}));
					});

				}else{
					UI.d3.createGraph( words );
					
					//redraw pour eviter les problèmes de zoom
					UI.d3.svg.call(d3.behavior.zoom().scaleExtent([UI.d3.zoomMin, UI.d3.zoomMax]).on("zoom", function(){
						UI.d3.redrawGraph();
						UI.d3.defineCursor();
					}));
				}

				document.dispatchEvent(app.event.dataUpdate);
			});
		},

		getNodeData: function(node, callback){
			var nodeData = {};

			nodeData.name = node.name;

			//nombre de connexions
			nodeData.nbLinks = node.nbLinks;
			
			//nombre d'apparition du mot
			nodeData.occurrence = Words.getNodeOccurrence(node);

			//les mots les plus associés
			nodeData.mostAssociatedWords = Words.getMostAssociatedWords(node);

			//apparition par sexe
			nodeData.sexeOccurrence = Words.getSexeOccurrence(node);

			//apparition par age
			nodeData.ageOccurrence = Words.getAgeOccurrence(node);

			if(callback){
				callback.call(this, nodeData);
			}
		},

		proposeRandomWord: function(){
			//rÃ©cupÃ¨re un mot au hasard pour faire contribuer l'utilisateur
			_proposedWord = Words.getRandomWord();

			UI.printWord(_proposedWord);
		},

		//User interaction
		focusWord: function(word){
			UI.d3.searchNode(word);
			var selectedNode = Words.getNodeFromWord(word);

			app.getNodeData(selectedNode, function(nodeData){
				UI.nodeData.openSection();
				UI.nodeData.printData(nodeData);
				_activeWord = nodeData.name;
			});
			UI.menu.closeModal();

			history.pushState({}, word, '#/' + encodeURI(word));

			/* Social share */
			app.twitterShareWord(word);
		},

		blurWord: function(){
			UI.nodeData.closeSection();
			UI.d3.highlightOff();
			_activeWord = false;
			
			history.pushState({}, 'Home', window.location.href.split('#')[0]);
		},

		addContribution: function(e){
			if(e.keyCode == 13){

				if(this.value){

					var contribution = this.value.toLowerCase();
					var linkedWord;

					if(Words.isAFrenchWord(contribution)){

						// si la contribution vien de la fenetre nodeData
						if(e.target.getAttribute('data-activeWord') === 'activeWord'){
							linkedWord = _activeWord;
						}else{
							linkedWord = _proposedWord;
						}

						//si le mot tapé par l'utilisateur n'est pas le mot proposé
						if(contribution !== linkedWord){
							// si les infos d'utilisateur sont remplies
							if(!(User.get().sexe === 'unknown') && !(User.get().age === 'unknown')){
												
								Words.addContribution(contribution, linkedWord, 
									function(){ //success
										app.lastUserContribution = contribution;
										document.dispatchEvent(app.event.userContribution);
									},
									function(error){}
								);

							}else{

								UI.userInfo.openOverlay();
								UI.menu.closeModal();

								document.addEventListener('userinfosubmit', function(e){
									
									Words.addContribution(contribution, linkedWord, 
										function(){ //success
											app.lastUserContribution = contribution;
											document.dispatchEvent(app.event.userContribution);
										},
										function(error){}
									);

									//remove l'event listener
									e.target.removeEventListener(e.type, arguments.callee);
								});

							}

							this.value = '';
						
						}else{
							if(e.target.getAttribute('data-activeWord') === 'activeWord'){
								UI.notification(document.querySelector('#nodeData .error'), 'Choisissez un mot différent !');
							}else{
								UI.notification(document.querySelector('.addWordBox .error'), 'Choisissez un mot différent !');
							}
						}

					}else{
						if(e.target.getAttribute('data-activeWord') === 'activeWord'){
							UI.notification(document.querySelector('#nodeData .error'), 'le mot n\'est pas français');
						}else{
							UI.notification(document.querySelector('.addWordBox .error'), 'le mot n\'est pas français');
						}
					}
					
				}
			}
		},

		addUnlinkedWord: function(word){
			Words.addUnlinkedNode(word, function(){
				app.lastUserContribution = word.toLowerCase();
				document.dispatchEvent(app.event.userContribution);
			});
		},

		addFilter: function(e, filter, value){

			var filterType;

			if(e.target.classList.contains('sexe')){
				filterType = 'sexe';
			}else{
				filterType = 'age';
			}

			if(!e.target.classList.contains('active')){
				UI.menu.addActiveFilter(e.target);
				_filters[filter] = value;

			}else{
				UI.menu.removeActiveFilter(filterType);
				_filters[filter] = false;
			}

			app.reloadData();		
		},

		resetFilters: function(filter){
			if(!filter){
				_filters.sexe = false;
				_filters.age = false;
				UI.menu.removeAllActiveFilter();
			}else{
				_filters[filter] = false;
				UI.menu.removeActiveFilter(filter);
			}
			
			app.reloadData();		
			
		},

		searchNode: function(e){
			
			var value = this.value.toLowerCase();

			//auto completion avec les mots qui matches avec la recherche
			if(value){
				var matches = Words.get().nodes.filter(function (node) {
					return	node.name.substring(0, value.length) === value;
				});
			}else{
				UI.removeAllNotifications();
			}

			var list = document.getElementById('searchAutoComplete');

			list.innerHTML = '';

			if(matches){
				matches.forEach(function(match){
					var option = document.createElement('p');
					option.innerHTML = match.name;
					list.appendChild(option);
					option.addEventListener('click', function(){
						app.focusWord(match.name);
					},false);
				});
			}

			//envoi de la recherche
			if(e.keyCode === 13){
				//si il y a une valeur
				if(value){
					var node = Words.getNodeFromWord(value);

					if(node){

						app.focusWord(value);
						this.value = '';

					}else{
						
						if(Words.isAFrenchWord(value)){

							var notifElement = document.querySelector('.searchBox p.error');

							UI.notification(
								notifElement,
								'Le mot que vous recherchez n\'est pas dans la carte. voulez vous le rajouter ?',
								function(){ // lorsque l'utilisateur check

									//lorsque son age et son sexe sont bien renseignés
									if(!(User.get().sexe === 'unknown') && !(User.get().age === 'unknown')){
										
										app.addUnlinkedWord(value);

									}else{

										UI.userInfo.openOverlay();
										UI.menu.closeModal();

										document.addEventListener('userinfosubmit', function(e){
											app.addUnlinkedWord(value);
											//remove l'event listener
											e.target.removeEventListener(e.type);
										});

									}
									
								},
								function(){ // lorsque l'utilisateur cancel
									e.target.value = '';
									e.target.focus();
								}
							);

						}else{

							UI.notification(
								document.querySelector('.searchBox p.error'),
								'Le mot que vous avez tapé n\'est pas français'
							);
						}
					}
				}
			}
		},

		twitterShareWord: function(nodeName) {
			/* Twitter button */
			var parent = document.getElementById("twitterButton");
			var link = document.createElement('a');
			link.setAttribute('href', 'https://twitter.com/share');
			link.setAttribute('class', 'twitter-share-button');
			link.setAttribute('id', 'custom-twitter-button');
			link.setAttribute('data-hashtags', 'eclosion');
			link.setAttribute("data-text" , 'Si je vous dit '+nodeName+'... Faites naître les associations autour de ce mot');
			link.setAttribute("data-count" ,"none");
			link.setAttribute("data-via", "eclosionLeSite");
			link.setAttribute("data-url" ,window.location);

			if (parent.hasChildNodes() != false){
				parent.removeChild(parent.childNodes[0]);
			}

			parent.appendChild(link);
			twttr.widgets.load();  //very important
		}
	};

	return app;

})(Words, User, UI);

window.addEventListener("load", function(){
	App.startStoryTelling();
});
