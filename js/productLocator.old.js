'use strict';

angular.module('myApp.productLocator', ['ngRoute', 'ui.ace'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/productLocator', {
    templateUrl: 'productLocator/productLocator.html',
    controller: 'ProductLocatorCtrl'
  });
}])

.controller('ProductLocatorCtrl', ['$scope', 'ProductLocatorDAO', function($scope, ProductLocatorDAO) {

    $scope.aceJsonChanged = null;
    $scope.dataSet = null;
    $scope.aceJsonEditor = null;
    $scope.aceJsonEditorSession = null;
    $scope.aceXmlEditor = null;
    $scope.brands = [];
    $scope.categories = [];
    $scope.products = [];
    $scope.showXML = true;
    $scope.showJSON = true;


    $scope.getGroupProducts = function(item){
      var itemAt = _.indexOf($scope.brands, item.ExternalId);
      $scope.brands[itemAt] = {Name: item.Name, ExternalId: item.ExternalId};
    };

    $scope.getStoresForLocation = function(item){
      $scope.brands.push({Name: item.Name, ExternalId: item.ExternalId});
    };


    //This is the callback function
    var setData = function(data) {
        $scope.dataSet = data;
        //$scope.aceJsonEditor.setValue(JSON.stringify($scope.dataSet, null, 4))
        $scope.brands = $scope.dataSet.Feed.Brands.Brand;
        $scope.category = $scope.dataSet.Feed.Categories.Category;
        $scope.products = $scope.dataSet.Feed.Products.Product;

    };

    $scope.setSelectedItem = function(i){
      $scope.selectedItem = i;
    };

    $scope.deleteBrandItem = function(){
      if ($scope.selectedItem >= 0) {
        $scope.brands.splice($scope.selectedItem,1);
      }
    };

    ProductLocatorDAO.getProductGroups(setData);

    //$scope.aceJsonLoaded = function(_editor) {
    //  // Options
    //  console.log("ace loaded")
    //  $scope.aceJsonEditor = _editor;
    //  _editor.getSession().setMode('ace/mode/json');
    //  $scope.aceJsonEditorSession = _editor.getSession();
    //  _editor.setValue($scope.dataSet);
    //
    //  _editor.setReadOnly(false);
    //
    //};
    //  $scope.aceJsonChanged = function (e) {
    //    //
    //    console.log("The ace data changed")
    //    var code = $scope.aceJsonEditor.getValue();
    //    $scope.dataSet = JSON.parse(code);
    //  };
    //
    //
    //$scope.aceXmlLoaded = function(_editor) {
    //    // Options
    //    console.log("ace loaded")
    //    $scope.aceXmlEditor = _editor
    //    _editor.getSession().setMode('ace/mode/xml');
    //    _editor.setReadOnly(false);
    //};
    //
    //$scope.aceXmlChanged = function(e) {
    //
    //    console.log("ace changed")
    //
    //};
    //
    //$scope.convertToXml = function(){
    //  var data = ProductLocatorDAO.convertToXml($scope.dataSet);
    //
    //  function formatXml(xml) {
    //    var formatted = '';
    //    var reg = /(>)(<)(\/*)/g;
    //    xml = xml.replace(reg, '$1\r\n$2$3');
    //    var pad = 0;
    //    jQuery.each(xml.split('\r\n'), function(index, node) {
    //      var indent = 0;
    //      if (node.match( /.+<\/\w[^>]*>$/ )) {
    //        indent = 0;
    //      } else if (node.match( /^<\/\w/ )) {
    //        if (pad != 0) {
    //          pad -= 1;
    //        }
    //      } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
    //        indent = 1;
    //      } else {
    //        indent = 0;
    //      }
    //
    //      var padding = '';
    //      for (var i = 0; i < pad; i++) {
    //        padding += '  ';
    //      }
    //
    //      formatted += padding + node + '\r\n';
    //      pad += indent;
    //    });
    //
    //    return formatted;
    //  }
    //
    //  $scope.aceXmlEditor.getSession().setValue(formatXml(data))
    //
    //}



}]);