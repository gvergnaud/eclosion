UI.userInfos = (function(){
	'use strict';

	// PRIVATE

	// PUBLIC
	var View = {

		element: document.getElementById('userInfoOverlay'),

		openOverlay: function() {
			
			Velocity(this.element, 'fadeIn');

		},

		closeOverlay: function() {

			Velocity(this.element, 'fadeOut');
			
		}
	};
	
	return View;

})();