UI.about = (function(){
	'use strict';

	// PRIVATE

	// PUBLIC
	var View = {

		overlayApropos: document.querySelector('#aproposOverlay'),
		overlayContainer: document.querySelector('#overlay-container'),
		soundButton: document.querySelector("#soundOption>i"),
		soundPlayer: document.querySelector("#player"),

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
			if(this.soundButton.classList.contains("icon-volume-down")){
				this.soundPlayer.pause();
				this.soundButton.classList.add("icon-volume-off");
				this.soundButton.classList.remove("icon-volume-down");
			}else{
				this.soundPlayer.play();
				this.soundButton.classList.remove("icon-volume-off");
				this.soundButton.classList.add("icon-volume-down");
			}
		}
	};

	(function Init(){
		View.soundPlayer.play();
	})();

	return View;

})();