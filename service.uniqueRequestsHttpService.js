(function(angular){
	'use strict';

	angular.module('App').decorator('$http', service);

	function service($delegate) {
		var $http = $delegate;
		
		var pendingRequests = [];
		
		var wrapper = function () {
		  return $http.apply($http, arguments);
		};
		
		Object.keys($http).filter(function (method) {
		  return (typeof $http[method] === 'function');
		}).forEach(function (method) {
		  wrapper[method] = function () {
		  
			if(method === 'get'){

				var uniqueId = arguments[0] + '?';
				if(arguments[1] && arguments[1].params){
					angular.forEach(arguments[1].params, function(value, key){
						uniqueId = uniqueId + key + '=' + value + '&';
					});
				}

				var found = false;
				var promise;

				if(pendingRequests[uniqueId]){
					found = true;
					promise = pendingRequests[uniqueId];
				}

				if(found){
					console.log('prevent multiple request for ', uniqueId); 
					return promise;
				} else {
					promise = $http[method].apply($http, arguments);
					promise.then(function(success) {
						delete pendingRequests[uniqueId];
					}, function(error) {
						delete pendingRequests[uniqueId];
					});
					//console.log('new request for ', uniqueId);
					pendingRequests[uniqueId] = promise;
					return promise;
				}
			}
			
		  };
		});

		return wrapper;
	}
	
})(angular);

