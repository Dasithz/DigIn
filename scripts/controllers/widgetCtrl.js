/*
----------------------Summary-------------------------------
| all the individual widget settings controllers goes here |
------------------------------------------------------------
|      #facebook settings : fbInit                         |
|      #linkedIn settings : linkedInit                     |
|      #elastic settings  : elasticInit                    | 
|      #wordpress settings: wordpressInit                  |
|      #instagram settings: instaInit                      | 
|      #d3plugin settings : d3Init                         |
|      #sltskillwisecall  : sltskillInit                   |
|      #sltivr settings   : sltivrInit                     |
------------------------------------------------------------
*/
/*summary-
  fbInterface : (scripts/custom/fbInterface.js)
*/
 
 

function fbInit(scope, $mdDialog, widId, $rootScope) {

    scope.accounts = [];

    //get fb initial login state
    //scope.actIndicator = "false";
    fbInterface.getFbLoginState(scope);
    var objIndex = getRootObjectById(widId, $rootScope.dashboard.widgets);
    //add or remove account from the scope
    scope.addAccount = function() {
        if (fbInterface.state != 'connected')
            fbInterface.loginToFb(scope);
        else
            fbInterface.logoutFromFb(scope);
    };

    //cancel config
    scope.cancel = function() {
        $mdDialog.hide();
    };

    
    scope.chartConf = {"options":{"chart":{"type":"area"},"plotOptions":{"series":{"stacking":""}}},"series":[{"name":"Like Count","data":[],"id":"series-0","type":"line","dashStyle":"ShortDashDot","connectNulls":false}],"title":{"text":"Page Likes"},"credits":{"enabled":false},"loading":false,"xAxis":{"type":"datetime","currentMin":0},"yAxis":{"min":0}};
    scope.chartConfView
 = {"options":{"chart":{"type":"area"},"plotOptions":{"series":{"stacking":""}}},"series":[{"name":"View Count","data":[],"id":"series-0","type":"area","dashStyle":"ShortDashDot","connectNulls":false,"color":"#FF5722"}],"title":{"text":"Page Views"},"credits":{"enabled":false},"loading":false,"xAxis":{"type":"datetime","currentMin":0},"yAxis":{"min":0}};


    //complete config  
    scope.finish = function() {
        var likeCountArray = [];
        var startingDayStr;
        var dateObj = {
            until: new Date(),
            range: 7
        }

        //getting page likes insights
        fbInterface.getPageLikesInsight(scope.fbPageModel,dateObj, function(data) {
        console.log("**************************************");
        console.log("Like history:"+JSON.stringify(data));
        var likeHistory = fbInterface.getPageLikesObj(data);
        scope.chartConf.series[0].data = likeHistory.likeArr;
        scope.chartConf.series[0].pointStart = Date.UTC(likeHistory.start.getUTCFullYear(),likeHistory.start.getUTCMonth(),likeHistory.start.getUTCDate());;
        scope.chartConf.series[0].pointInterval = likeHistory.interval;

        var obj = {
            pgData : scope.pageData,
            likeData : scope.chartConf
        };   
        $rootScope.dashboard.widgets[objIndex].widData = obj; 
        });

        //getting page views insights
        fbInterface.getPageViewsInsight(scope.fbPageModel,dateObj, function(data) {
        console.log("**************************************");
        console.log("View history:"+JSON.stringify(data));
        var viewHistory = fbInterface.getPageLikesObj(data);
         scope.chartConfView.series[0].data = viewHistory.likeArr;
         scope.chartConfView.series[0].pointStart = Date.UTC(viewHistory.start.getUTCFullYear(),viewHistory.start.getUTCMonth(),viewHistory.start.getUTCDate());;
         scope.chartConfView.series[0].pointInterval = viewHistory.interval;

        var obj = {
            pgData : scope.pageData,
            likeData : scope.chartConf,
            viewData : scope.chartConfView
        };   
        $rootScope.dashboard.widgets[objIndex].widData = obj; 
        });
        

        $mdDialog.hide();
    };

    scope.pageData = {};

    

    //selecting pages  
    scope.changePage = function() {
        //get page data on change
        fbInterface.getPageData(scope, function(data) {  
        scope.pageData = data;          
           // $rootScope.dashboard.widgets[objIndex].widData = data;
        });
    };
};

/*summary-
  linkedinInterface : (scripts/custom/linkedinInterface.js)
    */
function linkedInit(scope, $mdDialog, widId, $rootScope) {

    scope.accounts = [];

    //get linkedin initial login state
    linkedinInterface.getLinkedinState(scope);

    //add or remove account from the scope
    scope.addAccount = function() {
        if (!linkedinInterface.state)
            linkedinInterface.loginToLinkedin(scope);
        else
            linkedinInterface.logoutFromLinkedin(scope);
    };

    //cancel config
    scope.cancel = function() {
        $mdDialog.hide();
    };

    //complete config  
    scope.finish = function() {
        linkedinInterface.getUserAccountOverview(scope, function(data) {
            var objIndex = getRootObjectById(widId, $rootScope.dashboard.widgets);
            $rootScope.dashboard.widgets[objIndex].widData = data;
        });
        $mdDialog.hide();
    };
};

 
 
      

function YoutubeInit($scope, $http, $objectstore, $mdDialog, $rootScope, widId) {
    $scope.search = function() {
        this.listResults = function(data) {
            results.length = 0;
            for (var i = data.items.length - 1; i >= 0; i--) {
                results.push({
                    id: data.items[i].id.videoId,
                    title: data.items[i].snippet.title,
                    description: data.items[i].snippet.description,
                    datetimee: data.items[i].snippet.publishedAt,
                    lbc: data.items[i].snippet.liveBroadcastContent,
                    ciid: data.items[i].snippet.channelId,
                    kidd: data.items[i].id.kind,
                    thumbnail: data.items[i].snippet.thumbnails.default.url,
                    author: data.items[i].snippet.channelTitle

                });
            }
            return results;
 
        }
 
        $http.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    key: 'AIzaSyAzf5VkNxCc-emzb5rujUSc9wSxoDla6AM',
                    type: 'video',
                    maxResults: '50',
                    part: 'id,snippet',
                    fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle,items/snippet/publishedAt,items/snippet/liveBroadcastContent,items/snippet/channelId,items/id/kind,items/id/videoId',
                    q: this.query
                }
            })
            .success(function(data) {
                VideosService.listResults(data);
                $log.info(data);
            })
            .error(function() {
                $log.info('Search error');
            });
    }

 
    $scope.tabulate = function(state) {
        $scope.playlist = state;
    }

}



//elastic controller
function elasticInit($scope, $http, $objectstore, $mdDialog, $rootScope, widId) {
    $scope.indexes = [];
    $scope.datasources = ['Object Store', 'Elastic search', 'CouchDB'];
    $scope.checkedFields = [];
    $scope.excelNamespace = "";
    $scope.excelClass = "";
    var objIndex = getRootObjectById(widId, $rootScope.dashboard.widgets);
    $scope.widget = $rootScope.dashboard.widgets[objIndex];
    var client = $objectstore.getClient("com.duosoftware.com", " ");
    client.onGetMany(function(data) {
        if (data) {
            $scope.indexes = data;
        }
    });
    client.onError(function(data) {

    });

    $scope.alert = function() {
  
            $mdDialog.show({
                controller: 'successCtrl',
                templateUrl: 'views/file-success.html',
                resolve: {
 
                }
            })
        }
        //cancel config
    $scope.cancel = function() {
        $mdDialog.hide();
    };
    $scope.toggleCheck = function(index) {
        if ($scope.checkedFields.indexOf(index) === -1) {
            $scope.checkedFields.push(index);
        } else {
            $scope.checkedFields.splice($scope.checkedFields.indexOf(index), 1);
        }
    };
    client.getClasses("com.duosoftware.com");
    $scope.getFields = function() {
        $scope.selectedFields = [];
        var client = $objectstore.getClient("com.duosoftware.com", $scope.ind);
        client.onGetMany(function(data) {
            if (data) {
                data.forEach(function(entry) {
                    $scope.selectedFields.push({
                        name: entry,
                        checked: false
                    });

                });
            }
        });

        client.getFields("com.duosoftware.com", $scope.ind);
    }

    $scope.getData = function() {
        var parameter = "";
        $scope.QueriedData = [];
        for (param in $scope.checkedFields) {

            parameter += " " + $scope.checkedFields[param].name;
            $rootScope.header = [];
            $rootScope.header.push({
                name: $scope.checkedFields[param].name,
                field: $scope.checkedFields[param].name
            });
        }
        var client = $objectstore.getClient("com.duosoftware.com", "");
        client.onGetMany(function(data) {
            if (data) {
                $rootScope.DashboardData = [];
                $rootScope.DashboardData = data;
                $mdDialog.show({
                    controller: 'ShowTableCtrl',
                    templateUrl: 'views/data-explorer.html',


                })

            }
        });
        client.getSelected(parameter);
    }


    $scope.executeQuery = function(widget) {

        var client = $objectstore.getClient("com.duosoftware.com", "testJay");
        client.onGetMany(function(data) {
            if (data) {
                $rootScope.DashboardData = [];
                $rootScope.DashboardData = data;
                $mdDialog.show({
                    controller: 'ShowTableCtrl',
                    templateUrl: 'views/data-explorer.html',


                })

            }
        });
        client.getByFiltering(widget.query);
    }

    $scope.buildchart = function(widget) {

        var parameter = "";
        $scope.QueriedData = [];
        $scope.chartSeries = [];
        $rootScope.header = [];
        for (param in $scope.checkedFields) {

            parameter += " " + $scope.checkedFields[param].name;
            $rootScope.header.push({
                name: $scope.checkedFields[param].name,
                field: $scope.checkedFields[param].name
            });
        }

        var client = $objectstore.getClient("com.duosoftware.com", $scope.ind);
        client.onGetMany(function(datai) {
            if (datai) {

                $rootScope.DashboardData = [];
                $rootScope.DashboardData = datai;
                widget.chartConfig.series = [];

                widget.chartConfig.series = $rootScope.DashboardData.map(function(elm) {
                    var _fieldData = [];

                    _fieldData.push(parseInt(elm[widget.dataname]))
                    return {
                        name: elm[widget.seriesname],
                        data: _fieldData
                    };
                });
                widget.chartSeries = [];
                widget.chartSeries = widget.chartConfig.series;
 
            }
 
        });
        client.getSelected(parameter);
    }
};
 

function InitConfigD3($scope, $mdDialog, widId, $rootScope, $sce) {

    $scope.activitylist = [];

    $scope.activitylist.push({
        Name: "Population Pyramid",
        Description: "Population Pyramid",
        icon: "styles/css/images/icons/d3/Population_Pyramid.png",
        link: "http://bl.ocks.org/mbostock/raw/4062085/"
    });

    $scope.activitylist.push({
        Name: "Aster Plot",
        Description: "Aster Plot",
        icon: "styles/css/images/icons/d3/Aster_Plot.png",
        link: "http://bl.ocks.org/bbest/raw/2de0e25d4840c68f2db1/"
    });
    $scope.activitylist.push({
        Name: "The JellyFish",
        Description: "For any geographical data",
        icon: "styles/css/images/icons/d3/JellyFish.png",
        initTemplate: "fbInitConfig",
        initController: "fbInit",
        widView: "views/chartview.html"
    });
    $scope.activitylist.push({
        Name: "Bubble Chart",
        Description: "Bubble Chart",
        icon: "styles/css/images/icons/d3/bubble.png",
        link: "http://bl.ocks.org/mbostock/raw/4063269/"
    });

    $scope.activitylist.push({
        Name: "Show reel",
        Description: "Show reel",
        icon: "styles/css/images/icons/d3/showreel.png",
        link: "http://bl.ocks.org/mbostock/raw/1256572/"
    });

    $scope.activitylist.push({
        Name: "Chord Diagram",
        Description: "Chord Diagram",
        icon: "styles/css/images/icons/d3/chord.png",
        link: "http://bl.ocks.org/mbostock/raw/4062006/"
    });

    $scope.activitylist.push({
        Name: "Circle Packing",
        Description: "Circle Packing",
        icon: "styles/css/images/icons/d3/circle_packing.png",
        link: "http://bl.ocks.org/mbostock/raw/4063530/"
    });

    $scope.activitylist.push({
        Name: "Sunburst Partition",
        Description: "Sunburst Partition",
        icon: "styles/css/images/icons/d3/sunburst.png",
        link: "http://bl.ocks.org/mbostock/raw/4063423/"
    });
    $scope.activitylist.push({
        Name: "Tree Map",
        Description: "Tree Map",
        icon: "styles/css/images/icons/d3/treemao.png",
        link: "http://bl.ocks.org/mbostock/raw/4063582/"
    });

    $scope.activitylist.push({
        Name: "Voronoi Tessellation",
        Description: "Voronoi Tessellation",
        icon: "styles/css/images/icons/d3/vorony.png",
        link: "http://bl.ocks.org/mbostock/raw/4060366/"
    });

    $scope.activitylist.push({
        Name: "Hierarchical Edge Bundling",
        Description: "Hierarchical Edge Bundling",
        icon: "styles/css/images/icons/d3/hierarchial.png",
        link: "http://mbostock.github.io/d3/talk/20111116/bundle.html"
    });

    $scope.activitylist.push({
        Name: "Epicyclic Gearing",
        Description: "Epicyclic Gearing",
        icon: "styles/css/images/icons/d3/epicycling.png",
        link: "http://bl.ocks.org/mbostock/raw/1353700/"
    });

    $scope.activitylist.push({
        Name: "Collision Detection",
        Description: "Collision Detection",
        icon: "styles/css/images/icons/d3/collision.png",
        link: "http://mbostock.github.io/d3/talk/20111018/collision.html"
    });

    $scope.activitylist.push({
        Name: "Collapsible Force ",
        Description: "Collapsible Force ",
        icon: "styles/css/images/icons/d3/Collapsible_Force.png",
        link: "http://mbostock.github.io/d3/talk/20111116/force-collapsible.html"
    });

    $scope.activitylist.push({
        Name: "Zoomable Sunburst",
        Description: "Zoomable Sunburst",
        icon: "styles/css/images/icons/d3/Zoomable_Sunburst.png",
        link: "http://bl.ocks.org/mbostock/raw/4348373/"
    });


    $scope.activitylist.push({
        Name: "Google maps",
        Description: "Google maps",
        icon: "styles/css/images/icons/d3/sunburst.png",
        link: "http://bl.ocks.org/mbostock/raw/899711/"
    });
  

    $scope.trustSrc = function(src) {
 
    }
 

    $scope.cancel = function() {
        $mdDialog.hide();
    };

};



 
function wordpressInit($scope, $http, $mdDialog, widId, $rootScope) {

    //cancel config
    $scope.cancel = function() {
        $mdDialog.hide();
    };

    //complete config  
    $scope.finish = function() {
        var wpapi = "http://public-api.wordpress.com/rest/v1/sites/";
        var choice = "/posts";
        var callbackString = '/?callback=JSON_CALLBACK';
  
        var message = $http.jsonp(wpapi + $scope.wpdomain + choice + callbackString).
        success(function(data, status) {
            var objIndex = getRootObjectById(widId, $rootScope.dashboard.widgets);
            //console.log(JSON.stringify(data));
            var posts = data.posts;
 

            var trimmedPosts = [];
            var tempTitle = "";
 
            for (i = 0; i < posts.length; i++) {
                var obj = {
                    picURL: "",
                    authorName: "",
                    title: "",
                    comments: "",
                    likes: ""
                };
                obj.picURL = posts[i].author.avatar_URL;
                obj.authorName = posts[i].author.name;
                obj.title = posts[i].title;
                obj.comments = posts[i].comment_count;
                
                trimmedPosts.push(obj);
            }
            var trimmedObj = {};
            trimmedObj.posts = trimmedPosts;
            $rootScope.dashboard.widgets[objIndex].widData = trimmedObj;
            //$rootScope.dashboard.widgets[objIndex].widData = data;
        }).
        error(function(data, status) {
    
            console.log(message);
        });
        $mdDialog.hide();
    };

};


function rssInit ($scope, $http, $mdDialog, widId, $rootScope){

    //cancel config
    $scope.cancel = function() {
        $mdDialog.hide();
    };

    //complete config  
    $scope.finish = function(rssAddress) {
        $rootScope.entryArray = [];
        google.load("feeds", "1");
        var feed = new google.feeds.Feed(rssAddress);
        feed.setNumEntries(100);
       
        feed.load(function(result) {


        if (!result.error) {
         
          for (var i = 0; i < result.feed.entries.length; i++) {

            var entry = result.feed.entries[i];

            $scope.entryContent = entry.content;
            $rootScope.entryArray.push(entry);
            
            $rootScope.$apply();
          }
          
            console.log($rootScope.entryArray);
        }
      });
      $mdDialog.hide();

    };
};

   
// todo...
 
function weatherInit(widId, $scope, $http, $rootScope, $mdDialog) {
    //cancel config
    $scope.cancel = function() {
        $mdDialog.hide();
    };

    //complete config  
    $scope.finish = function() {
        $http.get('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + $scope.locZip + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
 
    };

}
 

function googlePlusInit ($scope, $http, $mdDialog, widId, $rootScope){

   
    $scope.cancel = function() {
        $mdDialog.hide();
    };

    $scope.finish = function() {
       
      $mdDialog.hide();

    };
    
    }
 
 
 
function instaInit($scope, $http, $window) {

    var clientId = 'f22d4c5be733496c88c0e97f3f7f66c7';
    var redirectUrl = 'http://duoworld.duoweb.info/DuoDiggin_pinterest/'
    
 
    if ($window.location.href.indexOf("access_token") == -1) {
        $window.location.href = baseUrl;
 
    } else {
        var access_token = $window.location.hash.substring(14);
                    console.log(data);       

 
    }


}

routerApp.controller('sltivrInit', function($scope, $mdDialog, $rootScope) {
   
    $scope.countTo = 349;
    $scope.countFrom = 0;
    $scope.countToIvr = 21;
    $scope.countFromIvr = 0;


}
 );
 
routerApp.controller('sltqueueInit', function($scope, $mdDialog, $rootScope) {
   
    $scope.countTo = 234;
    $scope.countFrom = 0;

     $scope.countToqueue = 89;
    $scope.countFromqueue = 0;
    $scope.options = {
            chart: {
                type: 'pieChart',
                height: 450,
                donut: true,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,

                pie: {
                    startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
                    endAngle: function(d) { return d.endAngle/2 -Math.PI/2 }
                },
                transitionDuration: 500,
                legend: {
                    margin: {
                        top: 5,
                        right: 70,
                        bottom: 5,
                        left: 0
                    }
                }
            }
        };

        $scope.data = [
            {
                key: "Currently in queue",
                y: 34
            },
            {
                key: "Queued < 1 min",
                y: 2
            },
            {
                key: "Queued < 3 minutes",
                y: 9
            },
            {
                key: "Queued < 5 minutes",
                y: 7
            },
            {
                key: "Queued > 5 minutes",
                y: 4
            } 
        ];
    }
 );
routerApp.controller('sltqueuedetailsInit',function($scope,$mdDialog,$rootScope){
 $scope.options = {
            chart: {
                type: 'cumulativeLineChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 65
                },
                x: function(d){ return d[0]; },
                y: function(d){ return d[1]/100; },
                average: function(d) { return d.mean/100; },

                color: d3.scale.category10().range(),
                transitionDuration: 300,
                useInteractiveGuideline: true,
                clipVoronoi: false,

                xAxis: {
                    axisLabel: 'X Axis',
                    tickFormat: function(d) {
                        return d3.time.format('%m/%d/%y')(new Date(d))
                    },
                    showMaxMin: false,
                    staggerLabels: false
                },

                yAxis: {
                    axisLabel: 'Y Axis',
                    tickFormat: function(d){
                        return d3.format('')(d);
                    },
                    axisLabelDistance: 20
                }
            }
        };

        $scope.data = [
            {
                key: "Sinhala",
                values: [ [ 1083297600000 , -2.974623048543] , [ 1085976000000 , -1.7740300785979] , [ 1088568000000 , 4.4681318138177] , [ 1091246400000 , 7.0242541001353] , [ 1093924800000 , 7.5709603667586] , [ 1096516800000 , 20.612245065736] , [ 1099195200000 , 21.698065237316] , [ 1101790800000 , 40.501189458018] , [ 1104469200000 , 50.464679413194] , [ 1107147600000 , 48.917421973355] , [ 1109566800000 , 63.750936549160] , [ 1112245200000 , 59.072499126460] , [ 1114833600000 , 43.373158880492] , [ 1117512000000 , 54.490918947556] , [ 1120104000000 , 56.661178852079] , [ 1122782400000 , 73.450103545496] , [ 1125460800000 , 71.714526354907] , [ 1128052800000 , 85.221664349607] , [ 1130734800000 , 77.769261392481] , [ 1133326800000 , 95.966528716500] , [ 1136005200000 , 107.59132116397] , [ 1138683600000 , 127.25740096723] , [ 1141102800000 , 122.13917498830] , [ 1143781200000 , 126.53657279774] , [ 1146369600000 , 132.39300992970] , [ 1149048000000 , 120.11238242904] , [ 1151640000000 , 118.41408917750] , [ 1154318400000 , 107.92918924621] , [ 1156996800000 , 110.28057249569] , [ 1159588800000 , 117.20485334692] , [ 1162270800000 , 141.33556756948] , [ 1164862800000 , 159.59452727893] , [ 1167541200000 , 167.09801853304] , [ 1170219600000 , 185.46849659215] , [ 1172638800000 , 184.82474099990] , [ 1175313600000 , 195.63155213887] , [ 1177905600000 , 207.40597044171] , [ 1180584000000 , 230.55966698196] , [ 1183176000000 , 239.55649035292] , [ 1185854400000 , 241.35915085208] , [ 1188532800000 , 239.89428956243] , [ 1191124800000 , 260.47781917715] , [ 1193803200000 , 276.39457482225] , [ 1196398800000 , 258.66530682672] , [ 1199077200000 , 250.98846121893] , [ 1201755600000 , 226.89902618127] , [ 1204261200000 , 227.29009273807] , [ 1206936000000 , 218.66476654350] , [ 1209528000000 , 232.46605902918] , [ 1212206400000 , 253.25667081117] , [ 1214798400000 , 235.82505363925] , [ 1217476800000 , 229.70112774254] , [ 1220155200000 , 225.18472705952] , [ 1222747200000 , 189.13661746552] , [ 1225425600000 , 149.46533007301] , [ 1228021200000 , 131.00340772114] , [ 1230699600000 , 135.18341728866] , [ 1233378000000 , 109.15296887173] , [ 1235797200000 , 84.614772549760] , [ 1238472000000 , 100.60810015326] , [ 1241064000000 , 141.50134895610] , [ 1243742400000 , 142.50405083675] , [ 1246334400000 , 139.81192372672] , [ 1249012800000 , 177.78205544583] , [ 1251691200000 , 194.73691933074] , [ 1254283200000 , 209.00838460225] , [ 1256961600000 , 198.19855877420] , [ 1259557200000 , 222.37102417812] , [ 1262235600000 , 234.24581081250] , [ 1264914000000 , 228.26087689346] , [ 1267333200000 , 248.81895126250] , [ 1270008000000 , 270.57301075186] , [ 1272600000000 , 292.64604322550] , [ 1275278400000 , 265.94088520518] , [ 1277870400000 , 237.82887467569] , [ 1280548800000 , 265.55973314204] , [ 1283227200000 , 248.30877330928] , [ 1285819200000 , 278.14870066912] , [ 1288497600000 , 292.69260960288] , [ 1291093200000 , 300.84263809599] , [ 1293771600000 , 326.17253914628] , [ 1296450000000 , 337.69335966505] , [ 1298869200000 , 339.73260965121] , [ 1301544000000 , 346.87865120765] , [ 1304136000000 , 347.92991526628] , [ 1306814400000 , 342.04627502669] , [ 1309406400000 , 333.45386231233] , [ 1312084800000 , 323.15034181243] , [ 1314763200000 , 295.66126882331] , [ 1317355200000 , 251.48014579253] , [ 1320033600000 , 295.15424257905] , [ 1322629200000 , 294.54766764397] , [ 1325307600000 , 295.72906119051] , [ 1327986000000 , 325.73351347613] , [ 1330491600000 , 340.16106061186] , [ 1333166400000 , 345.15514071490] , [ 1335758400000 , 337.10259395679] , [ 1338436800000 , 318.68216333837] , [ 1341028800000 , 317.03683945246] , [ 1343707200000 , 318.53549659997] , [ 1346385600000 , 332.85381464104] , [ 1348977600000 , 337.36534373477] , [ 1351656000000 , 350.27872156161] , [ 1354251600000 , 349.45128876100]]
                ,
                mean: 250
            },
            {
                key: "English",
                values: [ [ 1083297600000 , -0.77078283705125] , [ 1085976000000 , -1.8356366650335] , [ 1088568000000 , -5.3121322073127] , [ 1091246400000 , -4.9320975829662] , [ 1093924800000 , -3.9835408823225] , [ 1096516800000 , -6.8694685316805] , [ 1099195200000 , -8.4854877428545] , [ 1101790800000 , -15.933627197384] , [ 1104469200000 , -15.920980069544] , [ 1107147600000 , -12.478685045651] , [ 1109566800000 , -17.297761889305] , [ 1112245200000 , -15.247129891020] , [ 1114833600000 , -11.336459046839] , [ 1117512000000 , -13.298990907415] , [ 1120104000000 , -16.360027000056] , [ 1122782400000 , -18.527929522030] , [ 1125460800000 , -22.176516738685] , [ 1128052800000 , -23.309665368330] , [ 1130734800000 , -21.629973409748] , [ 1133326800000 , -24.186429093486] , [ 1136005200000 , -29.116707312531] , [ 1138683600000 , -37.188037874864] , [ 1141102800000 , -34.689264821198] , [ 1143781200000 , -39.505932105359] , [ 1146369600000 , -45.339572492759] , [ 1149048000000 , -43.849353192764] , [ 1151640000000 , -45.418353922571] , [ 1154318400000 , -44.579281059919] , [ 1156996800000 , -44.027098363370] , [ 1159588800000 , -41.261306759439] , [ 1162270800000 , -47.446018534027] , [ 1164862800000 , -53.413782948909] , [ 1167541200000 , -50.700723647419] , [ 1170219600000 , -56.374090913296] , [ 1172638800000 , -61.754245220322] , [ 1175313600000 , -66.246241587629] , [ 1177905600000 , -75.351650899999] , [ 1180584000000 , -81.699058262032] , [ 1183176000000 , -82.487023368081] , [ 1185854400000 , -86.230055113277] , [ 1188532800000 , -84.746914818507] , [ 1191124800000 , -100.77134971977] , [ 1193803200000 , -109.95435565947] , [ 1196398800000 , -99.605672965057] , [ 1199077200000 , -99.607249394382] , [ 1201755600000 , -94.874614950188] , [ 1204261200000 , -105.35899063105] , [ 1206936000000 , -106.01931193802] , [ 1209528000000 , -110.28883571771] , [ 1212206400000 , -119.60256203030] , [ 1214798400000 , -115.62201315802] , [ 1217476800000 , -106.63824185202] , [ 1220155200000 , -99.848746318951] , [ 1222747200000 , -85.631219602987] , [ 1225425600000 , -63.547909262067] , [ 1228021200000 , -59.753275364457] , [ 1230699600000 , -63.874977883542] , [ 1233378000000 , -56.865697387488] , [ 1235797200000 , -54.285579501988] , [ 1238472000000 , -56.474659581885] , [ 1241064000000 , -63.847137745644] , [ 1243742400000 , -68.754247867325] , [ 1246334400000 , -69.474257009155] , [ 1249012800000 , -75.084828197067] , [ 1251691200000 , -77.101028237237] , [ 1254283200000 , -80.454866854387] , [ 1256961600000 , -78.984349952220] , [ 1259557200000 , -83.041230807854] , [ 1262235600000 , -84.529748348935] , [ 1264914000000 , -83.837470195508] , [ 1267333200000 , -87.174487671969] , [ 1270008000000 , -90.342293007487] , [ 1272600000000 , -93.550928464991] , [ 1275278400000 , -85.833102140765] , [ 1277870400000 , -79.326501831592] , [ 1280548800000 , -87.986196903537] , [ 1283227200000 , -85.397862121771] , [ 1285819200000 , -94.738167050020] , [ 1288497600000 , -98.661952897151] , [ 1291093200000 , -99.609665952708] , [ 1293771600000 , -103.57099836183] , [ 1296450000000 , -104.04353411322] , [ 1298869200000 , -108.21382792587] , [ 1301544000000 , -108.74006900920] , [ 1304136000000 , -112.07766650960] , [ 1306814400000 , -109.63328199118] , [ 1309406400000 , -106.53578966772] , [ 1312084800000 , -103.16480871469] , [ 1314763200000 , -95.945078001828] , [ 1317355200000 , -81.226687340874] , [ 1320033600000 , -90.782206596168] , [ 1322629200000 , -89.484445370113] , [ 1325307600000 , -88.514723135326] , [ 1327986000000 , -93.381292724320] , [ 1330491600000 , -97.529705609172] , [ 1333166400000 , -99.520481439189] , [ 1335758400000 , -99.430184898669] , [ 1338436800000 , -93.349934521973] , [ 1341028800000 , -95.858475286491] , [ 1343707200000 , -95.522755836605] , [ 1346385600000 , -98.503848862036] , [ 1348977600000 , -101.49415251896] , [ 1351656000000 , -101.50099325672] , [ 1354251600000 , -99.487094927489]]
                ,
                mean: -60
            },


            {
                key: "Tamil",
                mean: 125,
                values: [ [ 1083297600000 , -3.7454058855943] , [ 1085976000000 , -3.6096667436314] , [ 1088568000000 , -0.8440003934950] , [ 1091246400000 , 2.0921565171691] , [ 1093924800000 , 3.5874194844361] , [ 1096516800000 , 13.742776534056] , [ 1099195200000 , 13.212577494462] , [ 1101790800000 , 24.567562260634] , [ 1104469200000 , 34.543699343650] , [ 1107147600000 , 36.438736927704] , [ 1109566800000 , 46.453174659855] , [ 1112245200000 , 43.825369235440] , [ 1114833600000 , 32.036699833653] , [ 1117512000000 , 41.191928040141] , [ 1120104000000 , 40.301151852023] , [ 1122782400000 , 54.922174023466] , [ 1125460800000 , 49.538009616222] , [ 1128052800000 , 61.911998981277] , [ 1130734800000 , 56.139287982733] , [ 1133326800000 , 71.780099623014] , [ 1136005200000 , 78.474613851439] , [ 1138683600000 , 90.069363092366] , [ 1141102800000 , 87.449910167102] , [ 1143781200000 , 87.030640692381] , [ 1146369600000 , 87.053437436941] , [ 1149048000000 , 76.263029236276] , [ 1151640000000 , 72.995735254929] , [ 1154318400000 , 63.349908186291] , [ 1156996800000 , 66.253474132320] , [ 1159588800000 , 75.943546587481] , [ 1162270800000 , 93.889549035453] , [ 1164862800000 , 106.18074433002] , [ 1167541200000 , 116.39729488562] , [ 1170219600000 , 129.09440567885] , [ 1172638800000 , 123.07049577958] , [ 1175313600000 , 129.38531055124] , [ 1177905600000 , 132.05431954171] , [ 1180584000000 , 148.86060871993] , [ 1183176000000 , 157.06946698484] , [ 1185854400000 , 155.12909573880] , [ 1188532800000 , 155.14737474392] , [ 1191124800000 , 159.70646945738] , [ 1193803200000 , 166.44021916278] , [ 1196398800000 , 159.05963386166] , [ 1199077200000 , 151.38121182455] , [ 1201755600000 , 132.02441123108] , [ 1204261200000 , 121.93110210702] , [ 1206936000000 , 112.64545460548] , [ 1209528000000 , 122.17722331147] , [ 1212206400000 , 133.65410878087] , [ 1214798400000 , 120.20304048123] , [ 1217476800000 , 123.06288589052] , [ 1220155200000 , 125.33598074057] , [ 1222747200000 , 103.50539786253] , [ 1225425600000 , 85.917420810943] , [ 1228021200000 , 71.250132356683] , [ 1230699600000 , 71.308439405118] , [ 1233378000000 , 52.287271484242] , [ 1235797200000 , 30.329193047772] , [ 1238472000000 , 44.133440571375] , [ 1241064000000 , 77.654211210456] , [ 1243742400000 , 73.749802969425] , [ 1246334400000 , 70.337666717565] , [ 1249012800000 , 102.69722724876] , [ 1251691200000 , 117.63589109350] , [ 1254283200000 , 128.55351774786] , [ 1256961600000 , 119.21420882198] , [ 1259557200000 , 139.32979337027] , [ 1262235600000 , 149.71606246357] , [ 1264914000000 , 144.42340669795] , [ 1267333200000 , 161.64446359053] , [ 1270008000000 , 180.23071774437] , [ 1272600000000 , 199.09511476051] , [ 1275278400000 , 180.10778306442] , [ 1277870400000 , 158.50237284410] , [ 1280548800000 , 177.57353623850] , [ 1283227200000 , 162.91091118751] , [ 1285819200000 , 183.41053361910] , [ 1288497600000 , 194.03065670573] , [ 1291093200000 , 201.23297214328] , [ 1293771600000 , 222.60154078445] , [ 1296450000000 , 233.35556801977] , [ 1298869200000 , 231.22452435045] , [ 1301544000000 , 237.84432503045] , [ 1304136000000 , 235.55799131184] , [ 1306814400000 , 232.11873570751] , [ 1309406400000 , 226.62381538123] , [ 1312084800000 , 219.34811113539] , [ 1314763200000 , 198.69242285581] , [ 1317355200000 , 168.90235629066] , [ 1320033600000 , 202.64725756733] , [ 1322629200000 , 203.05389378105] , [ 1325307600000 , 204.85986680865] , [ 1327986000000 , 229.77085616585] , [ 1330491600000 , 239.65202435959] , [ 1333166400000 , 242.33012622734] , [ 1335758400000 , 234.11773262149] , [ 1338436800000 , 221.47846307887] , [ 1341028800000 , 216.98308827912] , [ 1343707200000 , 218.37781386755] , [ 1346385600000 , 229.39368622736] , [ 1348977600000 , 230.54656412916] , [ 1351656000000 , 243.06087025523] , [ 1354251600000 , 244.24733578385]]
            } 
        ];


});
routerApp.controller('sltagentInit', function($scope, $mdDialog, $rootScope) {
   
    $scope.countTo = 134;
    $scope.countFrom = 0;

 
     $scope.options = {
            chart: {
                type: 'pieChart',
                height: 500,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                transitionDuration: 500,
                labelThreshold: 0.01,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }
        };
        $scope.data = [
            {
                key: "Currently connected",
                y: 12
            },
            {
                key: "connected < 1 min",
                y: 2
            },
            {
                key: "connected < 3 minutes",
                y: 1
            },
            {
                key: "Queconnectedued < 5 minutes",
                y: 0
            },
            {
                key: "connected > 5 minutes",
                y: 4
            } 
        ];
    }
 );
