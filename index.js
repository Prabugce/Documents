 
const app = angular.module("myApp", ["ngRoute"]); 
app.config(function($routeProvider) { 
    $routeProvider 
    .when("/courses", { 
        templateUrl :"Collection1.html"  
    }) 
    .when("/internships", { 
      templateUrl :"Collection3.html"  
    }) 
    .otherwise({ 
      templateUrl :"Collection3.html"  
    }); 
});  