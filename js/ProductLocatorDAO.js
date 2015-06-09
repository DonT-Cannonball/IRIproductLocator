/**
 * Created by dtinsley on 2/5/15.
 */
angular.module('myApp',['cb.x2js'])
    .factory('ProductLocatorDAO', ['$http','x2js',function($http, x2js){
    return {
        getProductsByStores: function(callback){

            ///http://productlocator.infores.com/productlocator/products/products.pli

            //http://productlocator.infores.com/productlocator/servlet/ProductLocatorEngine?client_id=156&brand_id=FARM&group_id=ANFP&zipcode=63126


            $http.get(
                'http://productlocator.infores.com/productlocator/servlet/ProductLocatorEngine',
                {transformResponse:function(data) {
                    // convert the data to JSON and provide
                    // it to the success function below
                    var x2js = new X2JS();
                    var json = x2js.xml_str2json( data );
                    return json;
                }
                }
            ).
                success(function(data, status) {
                    // send the converted data back
                    // to the callback function
                    callback(data);
                })
        },
        getProductGroups: function(callback){
            ///http://productlocator.infores.com/productlocator/products/products.pli
            //http://productlocator.infores.com/productlocator/products/products.pli?client_id=156&brand_id=FARM&prod_lvl=group
            //http://productlocator.infores.com/productlocator/servlet/ProductLocatorEngine?client_id=156&brand_id=FARM&group_id=ANFP&zipcode=63126
          //http://productlocator.infores.com/productlocator/products/products.pli?client_id=156&brand_id=FARM&prod_lvl=group
          var proxyUrl = 'proxy.php?url=' + encodeURIComponent('http://productlocator.infores.com/productlocator/products/products.pli?client_id=156&brand_id=FARM&prod_lvl=group');
         $http.get(
                proxyUrl,
                {transformResponse:function(data) {
                    // convert the data to JSON and provide
                    // it to the success function below
                    var x2js = new X2JS();
                  console.log(data);
                    var json = x2js.xml_str2json( data );
                    return json;
                }
                }
            ).
                success(function(data, status) {
                    // send the converted data back
                    // to the callback function
                    callback(data);
                })
        },
      convertToXml: function(json){
        // convert the data to JSON and provide
        // it to the success function below
        var x2js = new X2JS({escapeMode : false,stripWhitespaces : false});
        var xml = x2js.json2xml_str( json );
        return xml;
      }

    }
}]);

//angular.module('myApp',['myApp.service']);

