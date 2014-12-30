var User = (function(){
	'use strict';

	// PRIVATE
	var _user = false;

	// initialisation
	(function init(){

		var user = JSON.parse(localStorage.getItem('EchoUser'));

		if(!user){
			user = {
				age: 'unknown',
				sexe: 'unknown'
			};

			model.newUser = true;
		}

		_user = user;

	})();

	// PUBLIC
	return {

		get: function(){
			return _user;
		},

		update: function(sexe, age){
			_user.sexe = sexe;
			_user.age = age;
			localStorage.setItem('EchoUser', JSON.stringify(_user));
		},

		getAgeRange: function(age){
			var ageRange;

			if(age === 'unknown'){

				ageRange = 'unknown';

			}else if(age < 25){

				ageRange = 'under25';

			}else if(25 <= age < 35){
				
				ageRange = '25to35';

			}else if(35 <= age < 45){
				
				ageRange = '35to45';

			}else if(45 <= age){

				ageRange = 'above45';
			}

			return ageRange;
		}
	};

})();