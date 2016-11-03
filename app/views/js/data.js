var data = angular.module("data", []);

data.controller("index", function($scope, $http) {
    $http.get('/visualData').success(function(data, status, headers, config) {
        $scope.gender = data.gender;
        $scope.age_range = data.age_range;
        $scope.age = data.age;
        $scope.keywords = data.keywords;
    });

    $http.get('/searchData').success(function(data, status, headers, config) {
        $scope.search_keywords = data.topicList;
    });

    $http.get('/personalityData').success(function(data, status, headers, config) {
        $scope.personality_traits = data.personality_traits;
        $scope.needs = data.needs;
        $scope.values = data.values;
        $scope.consumption_preferences = data.consumption_preferences;
    });
});
