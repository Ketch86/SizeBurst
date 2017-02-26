angular.module("app", ['ngMaterial']).config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .dark();
});