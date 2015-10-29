UI.userInfoOverlay = (function(){
	'use strict';

	// PRIVATE

	// PUBLIC
	var View = {

		element: document.getElementById('userInfoOverlay'),

		open: function() {
			
			Velocity(this.element, 'fadeIn');

		},

		close: function() {

			Velocity(this.element, 'fadeOut');
			
		}
	};
	
	return View;

})();