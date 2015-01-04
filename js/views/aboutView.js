UI.about = (function(){
	'use strict';

	// PRIVATE

	// PUBLIC
	var View = {

		overlayApropos: document.querySelector('#aproposOverlay'),
		overlayContainer: document.querySelector('#overlay-container'),

		openOverlay: function() {
			var self = this;
			Velocity(self.overlayApropos, "fadeIn", 800);

	    	var openAnim = [
	        	{
	        		elements: UI.about.overlayContainer, 
	        		properties: { marginTop: '0', opacity: 1},
	        		options: {duration: 500, easing: 'easeInOutBack'}
	        	}
	        ];
			Velocity.RunSequence(openAnim);

		},
		closeOverlay: function() {
			var overlayContainer = document.querySelector('#overlay-container');
			
			var self = this;
			Velocity(self.overlayApropos, "fadeOut", 800);

	    	var closeAnim = [
	        	{
	        		elements: UI.about.overlayContainer, 
	        		properties: { marginTop: '100px', opacity: 0},
	        		options: {duration: 500, easing: 'easeInOutBack'}
	        	}
	        ];

			Velocity.RunSequence(closeAnim);
		},
		
		soundMute : function(){
			if(document.querySelector("#soundOption>i").classList.contains("icon-volume-down")){
				document.querySelector("#player").pause();
				document.querySelector("#soundOption>i").classList.add("icon-volume-off");
				document.querySelector("#soundOption>i").classList.remove("icon-volume-down");
			}else{
				document.querySelector("#player").play();
				document.querySelector("#soundOption>i").classList.remove("icon-volume-off");
				document.querySelector("#soundOption>i").classList.add("icon-volume-down");
			}
		}
	};

	return View;

})();