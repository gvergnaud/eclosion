var UI = (function(){
	'use strict';

	var View = {

		printWord: function(word){
			document.querySelector('#proposedWordText').innerText = word;
		},

		notification: function(element, msg, checkCallback, cancelCallback){

			element.innerHTML = msg;

			if(checkCallback){
				var checkIcon = document.createElement('i');
				checkIcon.classList.add('icon-check');

				checkIcon.addEventListener('click', function(){
					element.innerHTML = '';
					checkCallback.call(this);
				}, false);

				element.appendChild(checkIcon);
			}
			
			var cancelIcon = document.createElement('i');
			cancelIcon.classList.add('icon-cancel');
			
			cancelIcon.addEventListener('click', function(){

				if(cancelCallback){
					cancelCallback.call(this);
				}
				element.innerHTML = '';

			}, false);

			element.appendChild(cancelIcon);
		},

		removeAllNotifications: function(){
			document.querySelector('.searchBox p.error').innerHTML = '';
			document.querySelector('#nodeData .error').innerHTML = '';
			document.querySelector('.addWordBox .error').innerHTML = '';
		}
	};
	

	return View;
})();