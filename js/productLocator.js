//var myAppModule = angular.module('myApp', ['ngMap']);

var myAppModule = angular.module('myApp', ['ngMap', 'cb.x2js'])
  .controller('MapsController', [
    '$scope', 'dao', 'ZipCodeLookupSvc',

    function ($scope, dao, ZipCodeLookupSvc ) {
      $scope.productGroups = [];
      $scope.selectedGroup = {};
      $scope.products = [];
      $scope.selectedProduct = "";
      $scope.storeLocations = [];
      $scope.latlng = {};
      $scope.latlngJson = JSON.stringify($scope.latlng, null, 2);
      $scope.positions = [{lat:37.7699298,lng:-122.4469157}];
      $scope.center =  "38.6527064, -90.3451408";
      $scope.productSelected = false;
      $scope.loadingData = true;
      $scope.tileSelected = false;
      $scope.noStoreData = true;
      $scope.currentAddress = "";

      $scope.zoom = 8;
      $scope.control = {};
      $scope.greeting = 'Hola!' + dao.getStuff();

      $scope.zipCode = null;
      $scope.message = 'Finding zip code...';

      ZipCodeLookupSvc.lookup().then(function (zipCode) {
        $scope.zipCode = zipCode;
      }, function (err) {
        $scope.message = err;
      });

      ZipCodeLookupSvc.lookupLatLong().then(function (zipCode) {
        $scope.zipCode = zipCode;
      }, function (err) {
        $scope.message = err;
      });


      $scope.getLatFromZip = function(){
      ZipCodeLookupSvc.lookupByZip($scope.zipCode).then(function (addressObj) {

        var latLngStr = "";
        latLngStr += ""+addressObj.latlng.lat +","+addressObj.latlng.lng
        $scope.center =latLngStr;
        $scope.currentAddress = addressObj.address;

        $scope.latlng = {
          latitude: addressObj.latlng.lat,
          longitude: addressObj.latlng.lng
        };

        $scope.center = $scope.latlng.latitude +","+  $scope.latlng.longitude;
        $scope.latlngJson = JSON.stringify($scope.latlng, null, 2);

        //console.log(JSON.stringify($scope.latlng, null, 2));
      }, function (err) {
        $scope.message = err;
      });

      }

      function setProductGroups(data) {

        $scope.productGroups = data.groups.group;

        //$scope.loadingData = false

      }

      $scope.setProductGroup = function (group_name, group_id, $event) {

        var obj = $event.target;
        $scope.tileSelected = true;
        $scope.selectedGroup = {id: group_id, name: group_name};

        $scope.positions = [];
        dao.getProductsForGroup(setProductList, $scope.selectedGroup.id)
        //$scope.loadingData = false;

      }

      function setProductList(data) {

        console.log("is product list an array or no? : " + window._.isArray(data.products.product));
        if (window._.isArray(data.products.product)) {
          $scope.products = data.products.product;
        } else {
          $scope.products.push(data.products.product);
        }

        $scope.productSelected = true;
        $scope.loadingData = false;
        console.log(JSON.stringify($scope.products, null, 2));

      }

      $scope.setSelectedProduct = function (product_name, product_id) {


        $scope.selectedProduct = {id: product_id, name: product_name};

        //$scope.loadingData = true;
        dao.getProductsByStores(setStoresList, $scope.selectedProduct.id, $scope.zipCode)

      }


      function setStoresList(data) {

        //console.log("is stores list an array or no? : " + window._.isArray(data.RESULTS.STORES.STORE));

        $scope.storeLocations = [];
        if (_.isArray(data.RESULTS.STORES.STORE)) {
          $scope.storeLocations = data.RESULTS.STORES.STORE;
        } else {
          $scope.storeLocations.push(data.RESULTS.STORES.STORE);
        }
        //console.log(JSON.stringify($scope.storeLocations, null, 2));
        console.log("no stores? : " + $scope.storeLocations.length)
        console.log("store array value : " + $scope.storeLocations[0])

        $scope.noStoreData = ($scope.storeLocations[0] === undefined);

        //$scope.loadingData = false;
      }

      $scope.getLocation = function () {
        var x = document.getElementById("location");

        function getLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
          } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
          }
        }

        function showPosition(position) {
          x.innerHTML = "Latitude: " + position.coords.latitude +
          "<br>Longitude: " + position.coords.longitude;

          $scope.center =  ""+position.coords.latitude +","+ position.coords.longitude
          //{
          //  latitude: position.coords.latitude,
          //  longitude: position.coords.longitude
          //};
          dao.getProductGroups(setProductGroups)
        }

        getLocation()
      }

      $scope.backToProductGroups = function(){

        $scope.tileSelected = false;
        $scope.productSelected = false;
        $scope.loadingData = true;
      }

      $scope.getLocation();

    }]);

myAppModule.factory('dao', ['$http', 'x2js', function ($http, x2js) {
  var DAO = {
    getProductsByStores: function (callback, productId, zipCode) {

      ///http://productlocator.infores.com/productlocator/products/products.pli

      //http://productlocator.infores.com/productlocator/servlet/ProductLocatorEngine?client_id=156&brand_id=FARM&group_id=ANFP

      // gets stores for a product: http://productlocator.infores.com/productlocator/servlet/ProductLocatorEngine?clientid=156&productfamilyid=FARM&producttype=upc&productid=4900002890&zip=63126
      var query = "";
      query += "clientid=156&productfamilyid=FARM&producttype=upc"
      query += "&productid=" + productId;
      query += "&zip=" + zipCode

      var proxyUrl = 'proxy.php?url=' + encodeURIComponent('http://productlocator.infores.com/productlocator/servlet/ProductLocatorEngine?' + query);
      console.log("proxyUrl" + proxyUrl)
      $http.get(
        proxyUrl,
        {
          transformResponse: function (data) {
            // convert the data to JSON and provide
            // it to the success function below
            var x2js = new X2JS();
            var json = x2js.xml_str2json(data);
            return json;
          }
        }
      ).
        success(function (data, status) {
          // send the converted data back
          // to the callback function
          callback(data);
        })
    },
    getProductsForGroup: function (callback, selectedGroup) {

      //http://productlocator.infores.com/productlocator/products/products.pli?client_id=156&brand_id=FARM&group_id=ANFP

      var proxyUrl = 'proxy.php?url=' + encodeURIComponent('http://productlocator.infores.com/productlocator/products/products.pli?client_id=156&brand_id=FARM&group_id=' + selectedGroup);
      $http.get(proxyUrl,
        {
          transformResponse: function (data) {
            // convert the data to JSON and provide
            // it to the success function below
            var x2js = new X2JS();
            var json = x2js.xml_str2json(data);
            return json;
          }
        }
      ).
        success(function (data, status) {
          // send the converted data back
          // to the callback function
          callback(data);
        })
    },
    getProductGroups: function (callback) {
      ///http://productlocator.infores.com/productlocator/products/products.pli
      //http://productlocator.infores.com/productlocator/products/products.pli?client_id=156&brand_id=FARM&prod_lvl=group
      //http://productlocator.infores.com/productlocator/servlet/ProductLocatorEngine?client_id=156&brand_id=FARM&group_id=ANFP&zipcode=63126
      //http://productlocator.infores.com/productlocator/products/products.pli?client_id=156&brand_id=FARM&prod_lvl=group
      var proxyUrl = 'proxy.php?url=' + encodeURIComponent('http://productlocator.infores.com/productlocator/products/products.pli?client_id=156&brand_id=FARM&prod_lvl=group');
      $http.get(
        proxyUrl,
        {
          transformResponse: function (data) {
            // convert the data to JSON and provide
            // it to the success function below
            var x2js = new X2JS();
            var json = x2js.xml_str2json(data);
            return json;
          }
        }
      ).
        success(function (data, status) {
          // send the converted data back
          // to the callback function
          callback(data);
        })
    },
    convertToXml: function (json) {
      // convert the data to JSON and provide
      // it to the success function below
      var x2js = new X2JS({escapeMode: false, stripWhitespaces: false});
      var xml = x2js.json2xml_str(json);
      return xml;
    },

    getStuff: function () {
      return "stuff"
    }

  };
  // factory function body that constructs shinyNewServiceInstance
  return DAO;
}]);

myAppModule.factory('GeolocationSvc', [
  '$q', '$window',
  function ($q, $window) {
    return function () {
      var deferred = $q.defer();

      if (!$window.navigator) {
        deferred.reject(new Error('Geolocation is not supported'));
      } else {
        $window.navigator.geolocation.getCurrentPosition(function (position) {
          deferred.resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        }, deferred.reject);
      }

      return deferred.promise;
    };
  }]);

myAppModule.factory('ZipCodeLookupSvc', [
  '$q', '$http', 'GeolocationSvc',
  function ($q, $http, GeolocationSvc) {
    var MAPS_ENDPOINT = 'http://maps.google.com/maps/api/geocode/json?latlng={POSITION}&sensor=false';
    var MAPS_ENDPOINT_ADDRESS = 'http://maps.google.com/maps/api/geocode/json?address={ZIP}&sensor=false';

    return {
      urlForLatLng: function (lat, lng) {
        return MAPS_ENDPOINT.replace('{POSITION}', lat + ',' + lng);
      },

      urlForZip: function (zipCode) {
        return MAPS_ENDPOINT_ADDRESS.replace('{ZIP}', zipCode);
      },

      lookupByLatLng: function (lat, lng) {
        var deferred = $q.defer();
        var url = this.urlForLatLng(lat, lng);

        $http.get(url).success(function (response) {
          // hacky
          var zipCode;
          angular.forEach(response.results, function (result) {
            if (result.types[0] === 'postal_code') {
              zipCode = result.address_components[0].short_name;
            }
          });
          deferred.resolve(zipCode);
        }).error(deferred.reject);

        return deferred.promise;
      },

      lookupByZip: function (zip) {
        var deferred = $q.defer();
        var url = this.urlForZip(zip);

        $http.get(url).success(function (response) {
          //hacky
          var latlng, address, addressObj ={};

          angular.forEach(response.results, function (result) {
            if (result.types[0] === 'postal_code') {
              addressObj.latlng = result.geometry.location;
            }
            addressObj.address = result.formatted_address;
          });
          deferred.resolve(addressObj);
        }).error(deferred.reject);

        return deferred.promise;
      },


      lookup: function () {
        var deferred = $q.defer();
        var self = this;

        GeolocationSvc().then(function (position) {
          deferred.resolve(self.lookupByLatLng(position.lat, position.lng));
        }, deferred.reject);

        return deferred.promise;
      },

      lookupLatLong: function () {
        var deferred = $q.defer();
        var self = this;

        GeolocationSvc().then(function (position) {
          deferred.resolve(self.lookupByLatLng(position.lat, position.lng));
        }, deferred.reject);

        return deferred.promise;
      }
    };
  }
]);
// configure the module.0
// in this example we will create a greeting filter
//myAppModule.filter('greet', function() {
//  return function(name) {
//    return 'Hello, ' + name + '!';
//  };
//});
//
//myAppModule.controller('MapController', ['$scope', function($scope) {
//  $scope.greeting = 'Hola!';
//}]);