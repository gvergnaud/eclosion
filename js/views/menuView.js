UI.menu = (function(){
	'use strict';

	// PRIVATE

	// PUBLIC
	var View = {

		allModals: document.querySelectorAll('.modal'),
		menuElement: document.querySelector('#lateral-navigation'),
		/* Les 3 fenêtres d'options */
		searchWordModal: document.querySelector("#searchWord"),
	    writehWordModal: document.querySelector("#writeWord"),
	    filterWordModal: document.querySelector("#filterWord"),
	    /* Les deux input à autofocus */
	    searchInput: document.querySelector("#searchInput"),
	    addContribution: document.querySelectorAll('.addContribution'),

	    opened: false,

	    style: function() {
	    	if(View.opened){
	    		View.menuElement.style.width = window.innerWidth + "px";
	    		View.menuElement.querySelector('.activeTab').style.width = window.innerWidth -70 + "px";
	    		View.menuElement.querySelector('.activeTab').style.left = "70px";
	    	}
	    },

		closeModal: function() {
			if(View.opened){
		    	var closeAnim = [
		        	{
		        		elements: View.allModals, 
		        		properties: { left: - window.innerWidth + 'px'},
		        		options: {duration: 250, easing: 'easeInOutBack'}
		        	}
		        ];
				Velocity.RunSequence(closeAnim);
				

				setTimeout(function(){
					[].forEach.call(View.allModals, function(element){
		        		element.classList.remove('activeTab');
		        	});
		        	View.removeAllClickStyle();

		        	View.menuElement.style.width = '70px';
		       		View.opened = false;
				}, 250);
			}

		},

		openModal: function(modal){

        	var openTab = document.querySelector('.activeTab');
        	
        	if(openTab){
        		openTab.classList.remove('activeTab');
        	}

			var openAnim = [
	        	{
	        		elements: View.allModals,
	        		properties: {left: - window.innerWidth + 'px'},
	        		options: {duration: 0, easing: 'easeInOutBack'}
	        	},
	        	{
	        		elements: modal,
	        		properties: {left: "0", width: window.innerWidth + 'px'},
	        		options: {duration: 250, easing: 'easeInOutBack'}
	        	}
	        ];

	        View.menuElement.style.width = window.innerWidth + 'px';

	        View.opened = true;

			Velocity.RunSequence(openAnim);

        	modal.classList.add('activeTab');
		},

		searchBoxView: function() {
	        // Si on doit l'afficher, animation vers la droite
	        if(!View.searchWordModal.classList.contains('activeTab')) {
		        View.openModal(View.searchWordModal);
	        	View.searchInput.focus();
	        }
	        else {
		        View.closeModal();
	        }

		},

		addWordBoxView: function() {
	        // Si on doit l'afficher, animation vers la droite
	        if(!View.writehWordModal.classList.contains('activeTab')) {
		        View.openModal(View.writehWordModal);
	        	View.addContribution[0].focus();
	        }
	        else {
		        View.closeModal();
	        }
		},

		filterWordBoxView: function() {
	        if(!View.filterWordModal.classList.contains('activeTab')) {
		        View.openModal(View.filterWordModal);
	        }
	        else {
		        View.closeModal();
	        }

		},
		
		addClickStyle: function(element){
			View.removeAllClickStyle();
			element.parentNode.classList.add("optionClick");
		},
		
		removeAllClickStyle: function(element){
			var elements = document.getElementsByClassName("optioncontainer");
			[].forEach.call(elements, function(element){
				element.classList.remove('optionClick');
			});
		},

		addActiveFilter: function(element){

			var filterSign = document.createElement('div');
			filterSign.innerText = element.innerText;
			filterSign.classList.add('filterSign');

			filterSign.addEventListener('click', function(){
				View.filterWordBoxView();
			}, false);

			var closeIcon = document.createElement('i');
			closeIcon.classList.add('icon-cancel');

			filterSign.appendChild(closeIcon);

			//Si il sagit de du filtre sexe
			if(element.classList.contains('sexe')){
				
				View.removeActiveFilter('sexe');

				closeIcon.addEventListener('click', function(e){
					e.stopPropagation();
					App.removeFilter('sexe');
				}, false);

				document.querySelector('.activeFilter.sexe').innerHTML = '';
				document.querySelector('.activeFilter.sexe').appendChild(filterSign);
			

			//Si il sagit de du filtre age
			}else{

				View.removeActiveFilter('age');

				closeIcon.addEventListener('click', function(e){
					e.stopPropagation();
					App.removeFilter('age');
				}, false);

				document.querySelector('.activeFilter.age').innerHTML = '';
				document.querySelector('.activeFilter.age').appendChild(filterSign);
			}
			
			element.classList.add('active');
		},

		removeActiveFilter: function(filter){
			var filters;

			if(filter === 'sexe'){

				document.querySelector('.activeFilter.sexe').innerHTML = '';
				filters = document.querySelectorAll('#lateral-navigation .filterbuttons.sexe');

			}else{

				document.querySelector('.activeFilter.age').innerHTML = '';
				filters = document.querySelectorAll('#lateral-navigation .filterbuttons.age');
			}

			[].forEach.call(filters, function(filter){
				filter.classList.remove('active');
			});
		},

		removeAllActiveFilter: function(element){
			var filters;

			filters = document.querySelectorAll('#lateral-navigation .filterbuttons');

			[].forEach.call(filters, function(filter){
				filter.classList.remove('active');
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