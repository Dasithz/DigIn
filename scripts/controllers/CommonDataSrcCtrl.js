/*controllers
 --- commonDataSrcInit
 --- commonSrcInit
 */
routerApp.controller('commonDataSrcInit', ['$scope', '$controller', '$mdSidenav', '$log', 'CommonDataSrc', '$mdDialog', '$rootScope', '$http', 'Digin_Engine_API', 'Digin_Engine_API_Namespace', '$diginengine', function($scope, $controller, $mdSidenav, $log, CommonDataSrc, $mdDialog, $rootScope, $http, Digin_Engine_API, Digin_Engine_API_Namespace, $diginengine) {

    $scope.initCtrl = function() {
        $scope.fieldArray = [];
        $scope.fieldString = [];
        $scope.dataArray = [];
        $scope.dataString = [];
        $scope.distinct = [];
        $scope.selTable = "";
        $scope.selSrc = "";

        $scope.queried = {};
        $scope.icon = "bower_components/material-design-icons/navigation/svg/production/ic_chevron_left_18px.svg";
        $scope.queried.state = false;
        $scope.datasources = [{
            name: "DuoStore"
        }, {
            name: "BigQuery"
        }, {
            name: "CSV/Excel"
        }, {
            name: "Rest/SOAP Service"
        }, {
            name: "MSSQL"
        }, {
            name: "SpreadSheet"
        }];

        //$scope.client = $diginengine.getClient("HutchDialogic", "MSSQL");

        //breaking the chart types into arrays, purpose: to display the icons in rows of 8
        function chunk(arr, size) {
            var newArr = [];
            for (var i = 0; i < arr.length; i += size) {
                newArr.push(arr.slice(i, i + size));
            }
            return newArr;
        }

        getJSONData($http, 'chartConfig', function(data) {
            $scope.chartTable = chunk(data, 8);
        });

    };

    $scope.toggleLeft = buildToggler('custom');

    $scope.isOpenRight = function() {
        return $mdSidenav('right').isOpen();
    };

    $scope.isOpenRight = function() {
        return $mdSidenav('custom').isOpen();
    };

    $scope.onChangeSource = function(src) {
        $scope.selSrc = src;
        $scope.client = $diginengine.getClient("Demo", src);
        $scope.client.getTables(function(data, status) {
            if (status) $scope.dataTables = data;
            else console.log("Tables not received due to:" + data);
        });
    };

    $scope.onChangeTable = function(tbl) {
        //clear fieldArray
        $scope.fieldArray = [];
        $scope.tblFields = [];
        $scope.selTable = tbl;
        $scope.client.getFields(tbl, function(data, status) {
            if (status)
                for (i = 0; i < data.length; i++) {
                    $scope.tblFields.push({
                        FieldName: data[i]['Fieldname'],
                        FieldType: data[i]['FieldType']
                    });

                } else console.log("Fields not received due to:" + data);
        });
    };

    function buildToggler(navID) {
        return function() {
            $mdSidenav(navID)
                .toggle()
                .then(function() {
                    $log.debug("toggle " + navID + " is done");
                });
        }
    };

    $scope.toggleCheck = function(field) {
        var i = $scope.fieldArray.indexOf(field);
        if (i > -1) {
            $scope.fieldArray.splice(i, 1);
        } else {
            $scope.fieldArray.push(field);
        }
    };

    $scope.toggleCheck2 = function(data) {
        console.log("toggleCheck2");
        var i = $scope.dataArray.indexOf(data);
        if (i > -1) {
            $scope.dataArray.splice(i, 1);
        } else {
            $scope.dataArray.push(data);
        }
    };


    $scope.configGraph = function(evt, chart) {
        //building the fields string
        $scope.fieldString = [];
        for (i = 0; i < $scope.fieldArray.length; i++) {
            $scope.fieldString.push("'" + $scope.fieldArray[i] + "'");
        }

        $scope.currWidget = {
            widData: {},
            widView: chart.resView,
            dataView: '',
            dataCtrl: 'widgetSettingsDataCtrl',
            initTemplate: chart.configView,
            initCtrl: "commonSrcInit",
            uniqueType: "Common Source",
            syncState: true,
            expanded: true,
            seriesname: "",
            externalDataURL: "",
            dataname: "",
            d3plugin: "",
            divider: false,
            id: "chart" + Math.floor(Math.random() * (100 - 10 + 1) + 10),
            type: "Visualization",
            width: '370px',
            height: '300px',
            mheight: '100%',
            highchartsNG: {
                size: {
                    height: 220,
                    width: 300
                },
            },
            commonSrcConfig: {
                src: $scope.selSrc,
                tbl: $scope.selTable,
                fields: $scope.fieldArray,
                initSerType: chart.type
            },
            winConfig: {}
        };

        $rootScope.dashboard.widgets.push($scope.currWidget);

        //open the config dialog
        function openConfig(fields, initTemp, data) {
            $mdDialog.show({
                    controller: 'commonSrcInit',
                    templateUrl: 'views/common-data-src/init-configs/' + initTemp + '.html',
                    targetEvent: evt,
                    locals: {
                        widId: $scope.currWidget.id,
                        fieldData: fields,
                        widData: data
                    }
                })
                .then(function() {
                    $mdDialog.hide();
                }, function() {
                    $mdDialog.hide();
                });
        };

        if ($scope.selSrc == 'DuoStore') {
            openConfig(null, "InitConfigCommonSrc");

        } else if ($scope.selSrc != 'DuoStore') {

            if ($scope.queried.state) {
                $scope.client.getExecQuery($scope.queried.value, function(data, status) {
                    openConfig(null, "InitConfigCommonSrcQueried", data);
                });
            } else {
                if ($scope.currWidget.commonSrcConfig.initSerType == "metric") {
                    $scope.client.getHighestLevel($scope.selTable, $scope.fieldString.toString(), function(data, status) {
                        if (status) openConfig(data, "InitConfigCommonSrcMetric");
                        else console.log("Get highest level not received due to:" + data);
                    });
                } else {
                    $scope.client.getHighestLevel($scope.selTable, $scope.fieldString.toString(), function(data, status) {
                        if (status) openConfig(data, "InitConfigCommonSrc");
                        else console.log("Get highest level not received due to:" + data);
                    });
                }

            }
        };
    };



    //developer
    //create pule
    ////update damith
    //on change chart type
    $scope.onChangeChartType = function(_chartType) {
        //dev damith
        //d3 visualization
        switch (_chartType) {
            case 'd3 visualization':
                var commonSrcConfig = {
                    src: $scope.selSrc,
                    tbl: $scope.selTable,
                    fields: $scope.fieldArray,
                    namespace: $scope.srcNamespace
                };

                $scope.fieldString = [];
                for (i = 0; i < $scope.fieldArray.length; i++) {
                    $scope.fieldString.push("'" + $scope.fieldArray[i] + "'");
                }
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function(e) {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            var data = JSON.parse(xhr.response);
                            $mdDialog.show({
                                templateUrl: 'views/InitConfigD3.html',
                                locals: {
                                    widId: $scope.currWidget,
                                    fieldData: data,
                                    commonSrcConfig: commonSrcConfig
                                },
                                controller: function d3CommonSrcCntrl($rootScope, $mdDialog, fieldData, commonSrcConfig) {
                                    $rootScope.d3CommonSrcData = {
                                        data: fieldData,
                                        srcConfig: commonSrcConfig
                                    }
                                }
                            });
                        }
                    }
                };
                xhr.ontimeout = function() {
                    console.error("request timedout: ", xhr);
                    alert("Please check you't connection...");
                };
                if ($scope.selSrc == 'BigQuery')
                    xhr.open("get", Digin_Engine_API + "gethighestlevel?tablename=[" + $scope.srcNamespace + "." + $scope.selTable + "]&id=1&levels=[" + $scope.fieldString.toString() + "]&plvl=All&db=" + $scope.selSrc, /*async*/ true);

                else
                    xhr.open("get", Digin_Engine_API + "gethighestlevel?tablename=" + $scope.selTable + "&id=1&levels=[" + $scope.fieldString.toString() + "]&plvl=All&db=" + $scope.selSrc, /*async*/ true);
                xhr.send();
                //it's d3 visualization

                break;
                //other charts
            default:

                break;
        }
    };


    $scope.getDataByFields = function(field) {

        //clear distinct scope array
        //$scope.distinct = [];
        $scope.distinct[field] = [];

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function(e) {
            var array1 = [];

            console.log(this);
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    //parse json data to string
                    var parsed = JSON.parse(xhr.response);
                    var JSONDataArray = [];
                    //json data string to array
                    for (var x in parsed) {
                        JSONDataArray.push(parsed[x]);
                    }
                    //push field value of each array slot to scope array
                    for (var i = 0; i < JSONDataArray.length; i++) {

                        $scope.distinct[field][i] = JSONDataArray[i][field];
                        //console.log($scope.distinct[field]);
                    }
                } else {
                    console.error("XHR didn't work: ", xhr.status);
                }
            }

        }

        xhr.ontimeout = function() {
            console.error("request timedout: ", xhr);
        }
        if ($scope.selSrc == "MSSQL") {
            var queryString = "SELECT " + field + " FROM " + "[" + "HutchDialogic" + "." + $scope.selTable + "]" + " GROUP BY " + field + " db=MSSQL";
        }
        if ($scope.selSrc == "BigQuery") {
            var limit = 1000;
            var queryString = "SELECT " + field + " FROM " + "[" + Digin_Engine_API_Namespace + "." + $scope.selTable + "]" + " GROUP BY " + field + " LIMIT " + limit.toString();
        }
        // xhr.open("get", Digin_Engine_API + "executeQuery?tablename=[" + $scope.selTable.split(":")[1] + "]&id=1&levels=[" + $scope.fieldString.toString() + "]&plvl=All", /*async*/ true);
        xhr.open("get", Digin_Engine_API + "executeQuery?query=" + queryString, /*async*/ true);

        console.log("queryString");
        console.log(queryString);

        xhr.send();

    };

    $scope.changeChartType = function(chartType) {
        if ($rootScope.Dashboards[0].widgets.length > 0) {
            for (var i = 0; i < $rootScope.Dashboards[0].widgets.length; i++) {
                var length = $rootScope.Dashboards[0].widgets[i].highchartsNG.series.length;
                for (var j = 0; j < length; j++) {
                    $rootScope.Dashboards[0].widgets[i].highchartsNG.series[j].type = chartType;
                };
            }
        }
    };

    var chartTypes = [];



}]);

routerApp.controller('commonSrcInit', ['$scope', '$mdDialog', '$rootScope', 'widId', '$state', 'fieldData', 'widData', 'Digin_Engine_API', 'Digin_Engine_API_Namespace', '$diginengine', function($scope, $mdDialog, $rootScope, widId, $state, fieldData, widData, Digin_Engine_API, Digin_Engine_API_Namespace, $diginengine) {

    var objIndex = getRootObjectById(widId, $rootScope.dashboard.widgets);
    $scope.widget = $rootScope.dashboard.widgets[objIndex];
    $scope.arrayAttributes = fieldData;
    $scope.fieldSelection = true;
    $scope.mappedArray = {};
    $scope.selMetCat = "";
    $scope.ser = {};
    $scope.seriesArray = [{
        name: 'series1',
        serName: '',
        filter: '',
        type: $scope.widget.commonSrcConfig.initSerType,
        color: '',
        turboThreshold: 3000
    }];

    $scope.categItem = {};
    $scope.client = $diginengine.getClient("HutchDialogic", "MSSQL");
    $scope.chartCategory = {
        groupField: '',
        drilledField: '',
        drilledArray: []
    };
    $scope.filterAttributes = [{
        name: 'Sum',
        method: 'SUM',
        isMet: false
    }, {
        name: 'Average',
        method: 'AVG',
        isMet: false
    }, {
        name: 'Count',
        method: 'COUNT',
        isMet: false
    }, {
        name: 'Mode',
        method: 'MODE',
        isMet: true
    }, {
        name: 'Mean',
        method: 'MEAN',
        isMet: true
    }, {
        name: 'Median',
        method: 'MEDIAN',
        isMet: true
    }];
    $scope.chartTypes = [{
        name: "Area",
        type: "area"
    }, {
        name: "Smooth area",
        type: "areaspline"
    }, {
        name: "Line",
        type: "line"
    }, {
        name: "Smooth line",
        type: "spline"
    }, {
        name: "Column",
        type: "column"
    }, {
        name: "Bar",
        type: "bar"
    }, {
        name: "Pie",
        type: "pie"
    }, {
        name: "Scatter",
        type: "scatter"
    }];

    if (typeof $scope.widget.commonSrcConfig.arrAttributes != 'undefined') {
        $scope.arrayAttributes = $scope.widget.commonSrcConfig.arrAttributes;
        if (typeof $scope.widget.commonSrcConfig.drilled != 'undefined') {
            $scope.queryDrilled = $scope.widget.commonSrcConfig.drilled;
            $scope.categItem.item = $scope.widget.commonSrcConfig.catItem;
            $scope.seriesArray = $scope.widget.commonSrcConfig.serObjs;
            $scope.categItem.drillItem = $scope.widget.commonSrcConfig.drillItem;
        } else {
            $scope.categItem = $scope.widget.commonSrcConfig.metCat;
            $scope.selectedFilter = $scope.widget.commonSrcConfig.metFil;
            $scope.queryGrouped = $scope.widget.commonSrcConfig.metGrp;
            $scope.metric = $scope.widget.commonSrcConfig.metGrpF;
        }
    }

    /*TEMP*/
    if ($scope.widget.commonSrcConfig.src == "DuoStore") {
        var parameter = "";
        var w = new Worker("scripts/webworkers/elasticWorker.js");
        $scope.mappedArray = {};
        $scope.chartCategory = {
            groupField: '',
            drilledField: '',
            drilledArray: []
        };
        var selFields = $scope.widget.commonSrcConfig.fields;
        var selTbl = $scope.widget.commonSrcConfig.tbl;
        for (i = 0; i < selFields.length; i++) {
            parameter += " " + selFields[i];
        }

        $scope.getFilters = function() {
            for (var key in $scope.mappedArray) {
                if (Object.prototype.hasOwnProperty.call($scope.mappedArray, key)) {
                    if ($scope.mappedArray[key].isNaN) $scope.filtersAvailable = ['Count'];
                    else $scope.filtersAvailable = $scope.filterAttributes;
                }
            }
        };

        function mapRetrieved(event) {
            var obj = JSON.parse(event.data);
            console.log(JSON.stringify(obj));

            //creating the array to map dynamically
            $scope.arrayAttributes = [];
            for (var key in obj[0]) {
                if (Object.prototype.hasOwnProperty.call(obj[0], key)) {
                    var val = obj[0][key];
                    console.log(key);
                    $scope.mappedArray[key] = {
                        name: key,
                        data: [],
                        isNaN: true
                    };
                    $scope.arrayAttributes.push(key);
                }
            }

            //mapping the dynamically created array
            for (i = 0; i < obj.length; i++) {
                for (var key in obj[i]) {
                    if (Object.prototype.hasOwnProperty.call(obj[i], key)) {
                        var val = obj[i][key];
                        var parsedVal = parseFloat(val);
                        if (!isNaN(parsedVal)) {
                            $scope.mappedArray[key].data.push(parsedVal);
                            $scope.mappedArray[key].isNaN = false;
                        } else {
                            $scope.mappedArray[key].data.push(val);
                        }
                        $scope.fieldRetrieved = $scope.mappedArray[key].name;
                    }
                }
            }

            //getting the unique score to determine the hierarchy
            for (var key in $scope.mappedArray) {
                if (Object.prototype.hasOwnProperty.call($scope.mappedArray, key)) {
                    if ($scope.mappedArray[key].isNaN) {
                        $scope.mappedArray[key].unique = Enumerable.From($scope.mappedArray[key].data).Select().Distinct().ToArray().length;
                    }
                }
            }


            $scope.getFilters();
        };

        w.postMessage(selTbl + "," + parameter + "," + false);
        w.addEventListener('message', function(event) {
            mapRetrieved(event);
        });
    }

    $scope.cancel = function() {
        $mdDialog.hide();
    }

    $scope.getDrillArray = function() {
        console.log(JSON.stringify($scope.arrayAttributes));
        if ($scope.widget.commonSrcConfig.src == "DuoStore") {
            var uniqueScore = eval('$scope.mappedArray.' + $scope.chartCategory.groupField + '.unique');
            console.log('unique score:' + uniqueScore);
            for (var key in $scope.mappedArray) {
                if (Object.prototype.hasOwnProperty.call($scope.mappedArray, key)) {
                    if ($scope.mappedArray[key].unique > uniqueScore && $scope.mappedArray[key].unique != 0)
                        $scope.chartCategory.drilledArray.push($scope.mappedArray[key].name);
                }
            }
        }
    };

    $scope.filterData = function(c) {

        var filter = eval('new ' + c.toUpperCase() + '();');
        $scope.filtering = new Filtering();
        $scope.filtering.setFilter(filter);
        $scope.seriesAttributes = $scope.filtering.filterFields();
        $scope.widgetValidity = 'fade-out';
    };


    /* Strategy1 begin */
    var Filtering = function() {
        this.filter = "";
    };

    Filtering.prototype = {
        setFilter: function(filter) {
            this.filter = filter;
        },

        calculate: function(orderedObj, catMappedData, serMappedData, drillData) {
            return this.filter.calculate(orderedObj, catMappedData, serMappedData, drillData);
        },

        filterFields: function() {
            return this.filter.filterFields();
        }
    };

    var SUM = function() {
        this.calculate = function(orderedObj, catMappedData, serMappedData, drillData) {
            console.log("calculations... for the sum filter");
            if (typeof drillData == 'undefined') {
                for (j = 0; j < serMappedData.length; j++) {
                    orderedObj[catMappedData[j]].val += serMappedData[j];
                }
            } else if (serMappedData == null) {
                for (j = 0; j < orderedObj.length; j++) {
                    catMappedData[orderedObj[j].drill].val += orderedObj[j].val;
                }
                return catMappedData;
            } else {
                for (j = 0; j < serMappedData.length; j++) {
                    orderedObj[catMappedData[j]].val += serMappedData[j];
                    orderedObj[catMappedData[j]].arr.push({
                        val: serMappedData[j],
                        drill: drillData[j]
                    });
                }
            }
        }

        this.filterFields = function() {
            return getFilteredFields(false);
        }
    };

    var AVERAGE = function() {
        this.calculate = function(orderedObj, catMappedData, serMappedData, drillData) {
            console.log("calculations... for the average filter");
            if (typeof drillData == 'undefined') {
                for (j = 0; j < serMappedData.length; j++) {
                    orderedObj[catMappedData[j]].val += serMappedData[j];
                    orderedObj[catMappedData[j]].count += 1;
                }
                for (attr in orderedObj) {
                    if (Object.prototype.hasOwnProperty.call(orderedObj, attr)) {
                        orderedObj[attr].val = Number((orderedObj[attr].val / orderedObj[attr].count).toFixed(2));
                    }
                }
            } else if (serMappedData == null) {
                for (j = 0; j < orderedObj.length; j++) {
                    catMappedData[orderedObj[j].drill].val += orderedObj[j].val;
                    catMappedData[orderedObj[j].drill].count += 1;
                }
                for (attr in catMappedData) {
                    if (Object.prototype.hasOwnProperty.call(catMappedData, attr)) {
                        catMappedData[attr].val = Number((catMappedData[attr].val / catMappedData[attr].count).toFixed(2));
                    }
                }
                return catMappedData;
            } else {
                for (j = 0; j < serMappedData.length; j++) {
                    orderedObj[catMappedData[j]].val += serMappedData[j];
                    orderedObj[catMappedData[j]].arr.push({
                        val: serMappedData[j],
                        drill: drillData[j]
                    });
                }
                for (attr in orderedObj) {
                    if (Object.prototype.hasOwnProperty.call(orderedObj, attr)) {
                        orderedObj[attr].val = Number((orderedObj[attr].val / orderedObj[attr].arr.length).toFixed(2));
                    }
                }
            }
        }

        this.filterFields = function() {
            return getFilteredFields(false);
        }
    };

    var PERCENTAGE = function() {
        this.calculate = function(orderedObj, catMappedData, serMappedData, drillData) {
            console.log("calculations... for the prcentage filter");
            var total;
            if (typeof drillData == 'undefined') {
                total = 0;
                for (j = 0; j < serMappedData.length; j++) {
                    orderedObj[catMappedData[j]].val += serMappedData[j];
                    total += serMappedData[j];
                }
                for (attr in orderedObj) {
                    if (Object.prototype.hasOwnProperty.call(orderedObj, attr)) {
                        orderedObj[attr].val = Number(((orderedObj[attr].val / total) * 100).toFixed(2));
                    }
                }
            } else if (serMappedData == null) {
                total = 0;
                for (j = 0; j < orderedObj.length; j++) {
                    catMappedData[orderedObj[j].drill].val += orderedObj[j].val;
                    total += orderedObj[j].val;
                }
                for (attr in catMappedData) {
                    if (Object.prototype.hasOwnProperty.call(catMappedData, attr)) {
                        catMappedData[attr].val = Number(((catMappedData[attr].val / total) * 100).toFixed(2));
                    }
                }
                return catMappedData;
            } else {
                total = 0;
                for (j = 0; j < serMappedData.length; j++) {
                    orderedObj[catMappedData[j]].val += serMappedData[j];
                    total += serMappedData[j];
                    orderedObj[catMappedData[j]].arr.push({
                        val: serMappedData[j],
                        drill: drillData[j]
                    });
                }
                for (attr in orderedObj) {
                    if (Object.prototype.hasOwnProperty.call(orderedObj, attr)) {
                        orderedObj[attr].val = Number(((orderedObj[attr].val / total) * 100).toFixed(2));
                    }
                }
            }
        }

        this.filterFields = function() {
            return getFilteredFields(false);
        }
    };

    var COUNT = function() {
        this.calculate = function(orderedObj, catMappedData, serMappedData, drillData) {
            console.log("calculations... for the count filter");
            if (typeof drillData == 'undefined') {
                for (j = 0; j < serMappedData.length; j++) {
                    orderedObj[catMappedData[j]].val += 1;
                }
            } else if (serMappedData == null) {
                for (j = 0; j < orderedObj.length; j++) {
                    catMappedData[orderedObj[j].drill].val += 1;
                }
                return catMappedData;
            } else {
                for (j = 0; j < serMappedData.length; j++) {
                    orderedObj[catMappedData[j]].val += 1;
                    orderedObj[catMappedData[j]].arr.push({
                        val: serMappedData[j],
                        drill: drillData[j]
                    });
                }
            }
        }

        this.filterFields = function() {
            return getFilteredFields(true);
        }
    };

    //returns the series array according to the filter selected
    function getFilteredFields(isNaN) {
        var objArr = [];
        for (var key in $scope.mappedArray) {
            if (Object.prototype.hasOwnProperty.call($scope.mappedArray, key)) {
                if (!isNaN) !$scope.mappedArray[key].isNaN && objArr.push($scope.mappedArray[key].name);
                else objArr.push($scope.mappedArray[key].name);
            }
        }
        return objArr;
    };


    /* Strategy1 end */


    /*TEMP*/

    //adds new series to the chart
    $scope.addSeries = function() {
        $scope.seriesArray.push({
            name: 'series1',
            serName: '',
            filter: '',
            type: 'area',
            color: '',
            drilled: false,
            turboThreshold: 3000
        });
    }


    //removes the clicked series
    $scope.removeSeries = function(ind) {
        $scope.seriesArray.splice(ind, 1);
    };

    //builds the chart
    $scope.buildchart = function(widget) {
        widget.chartSeries = [];

        if ($scope.catItem != '') {
            $scope.widgetValidity = 'fade-out';
            if ($scope.seriesArray[0].serName != '') {
                if ($scope.queryDrilled) {
                    if ($scope.drillItem != '') {
                        $scope.orderByDrilledCat(widget);
                        $state.go('Dashboards');
                        widget.commonSrcConfig['drilled'] = true;
                        widget.commonSrcConfig['arrAttributes'] = $scope.arrayAttributes;
                        widget.commonSrcConfig['catItem'] = $scope.categItem.item;
                        widget.commonSrcConfig['serObjs'] = $scope.seriesArray;
                        widget.commonSrcConfig['drillItem'] = $scope.categItem.drillItem;

                        $mdDialog.hide();
                        //$scope.widgetValidity = 'fade-out';
                    } else {
                        //$scope.validationMessage = "Please select the category to drill-down from";
                        //$scope.widgetValidity = 'fade-in';
                    }
                } else {
                    $scope.orderByCat(widget);
                    $state.go('Dashboards');
                    widget.commonSrcConfig['drilled'] = false;
                    widget.commonSrcConfig['arrAttributes'] = $scope.arrayAttributes;
                    widget.commonSrcConfig['catItem'] = $scope.categItem.item;
                    widget.commonSrcConfig['serObjs'] = $scope.seriesArray;

                    $mdDialog.hide();
                    //$scope.widgetValidity = 'fade-out';
                }
            } else {
                //$scope.validationMessage = "Please select a series";
                //$scope.widgetValidity = 'fade-in';
            }
        } else {
            //$scope.validationMessage = "Please select a category";
            //$scope.widgetValidity = 'fade-in';
        }
    }

    //generate workers parameters
    $scope.generateParamArr = function(httpMethod, host, ns, tbl, method, gBy, agg, aggF, cons, oBy) {
        return {
            webMethod: httpMethod,
            host: host,
            method: method,
            params: [{
                name: 'tablenames',
                //            value: "[" + tbl + "]"    //fix it for big query
                value: "{1:'" + tbl + "'}"
            }, {
                name: 'group_by',
                value: "{'" + gBy + "':1}"
            }, {
                name: 'agg',
                value: "{'" + aggF + "':" + "'" + agg.toLowerCase() + "'" + "}",
            }, {
                name: 'cons',
                value: cons
            }, {
                name: 'order_by',
                value: oBy
            }, {
                name: 'db',
                value: ns
            }]
        };
    };

    //order by category
    $scope.orderByCat = function(widget) {

        widget.highchartsNG = {
            options: {
                chart: {

                },
                drilldown: {
                    drillUpButton: {
                        relativeTo: 'plotBox',
                        position: {
                            y: 0,
                            x: 0
                        },
                        theme: {
                            fill: 'white',
                            'stroke-width': 1,
                            stroke: 'silver',
                            r: 0,
                            states: {
                                hover: {
                                    fill: '#303F9F'
                                },
                                select: {
                                    stroke: '#039',
                                    fill: '#303F9F'
                                }
                            }
                        }

                    },
                    series: [{
                        "turboThreshold": 5000
                    }],
                    plotOptions: {
                        series: {
                            borderWidth: 0,
                            turboThreshold: 5000,
                            dataLabels: {
                                enabled: true,
                            }
                        }
                    }
                }
            },
            xAxis: {
                type: 'category'
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            title: {
                text: ''
            },
            size: {
                width: 300,
                height: 220
            }
        };


        if ($scope.widget.commonSrcConfig.src == "DuoStore") {
            console.log('$scope.mappedArray.' + $scope.chartCategory.groupField + '.data');
            var cat = Enumerable.From(eval('$scope.mappedArray.' + $scope.chartCategory.groupField + '.data')).Select().Distinct().ToArray();
            var orderedObjArray = [];

            for (i = 0; i < $scope.seriesArray.length; i++) {
                var serMappedData = eval('$scope.mappedArray.' + $scope.seriesArray[i].serName + '.data');
                var catMappedData = eval('$scope.mappedArray.' + $scope.chartCategory.groupField + '.data');

                var orderedArrayObj = {};
                var orderedObj = {};
                var data = [];
                for (k = 0; k < cat.length; k++) {
                    orderedObj[cat[k]] = {
                        val: 0,
                        count: 0
                    };
                }

                if (typeof $scope.filtering == 'undefined') {
                    $scope.filterData($scope.seriesArray[i].filter);
                }
                $scope.filtering.calculate(orderedObj, catMappedData, serMappedData);

                for (var key in orderedObj) {
                    if (Object.prototype.hasOwnProperty.call(orderedObj, key)) {
                        data.push({
                            name: key,
                            y: orderedObj[key].val
                        });
                    }
                }

                orderedArrayObj["data"] = data;
                orderedArrayObj["name"] = $scope.seriesArray[i].name;
                orderedArrayObj["color"] = $scope.seriesArray[i].color;
                orderedArrayObj["type"] = $scope.seriesArray[i].type;
                orderedObjArray.push(orderedArrayObj);
            }

            widget.highchartsNG['series'] = orderedObjArray;


        } else if ($scope.widget.commonSrcConfig.src != "DuoStore") {
            $scope.srcNamespace = $scope.widget.commonSrcConfig.namespace;
            $scope.catItem = $scope.categItem.item;
            $scope.seriesArray.forEach(function(entry) {
                if ($scope.widget.commonSrcConfig.src == 'BigQuery')
                    var tblVal = "[" + "Demo" + '.' + widget.commonSrcConfig.tbl + "]";
                else
                    var tblVal = widget.commonSrcConfig.tbl;

                entry['data'] = [];
                var paramArr = $scope.generateParamArr('get', Digin_Engine_API, $scope.widget.commonSrcConfig.src, tblVal, 'aggregatefields', $scope.catItem.value, entry.filter, entry.serName.value, "", "{}");
                var w = new Worker("scripts/webworkers/commonSrcWorker.js");
                w.postMessage(JSON.stringify(paramArr));
                w.addEventListener('message', function(event) {
                    var objArr = [];
                    var filter = entry.filter.toLowerCase();
                    var evData = JSON.parse(event.data);
                    for (i = 0; i < evData.length; i++) {
                        entry['data'].push({
                            name: evData[i][$scope.catItem.value],
                            y: evData[i][filter + "_" + entry.serName.value]
                        });
                    }
                    //create  mapped data
                    var selectedFiled = $scope.widget.commonSrcConfig.fields;
                    for (var c = 0; c < selectedFiled.length; c++) {
                        var val = selectedFiled[c];
                        $scope.mappedArray[val] = {
                            data: []
                        };
                    }
                    //y get series name
                    var ySer = entry.serName.value;
                    for (i = 0; i < evData.length; i++) {
                        var val = evData[i];
                        var index = 0;
                        for (var key in val) {
                            if (val.hasOwnProperty(key)) {
                                if (key == "" || key == null) {
                                    var arr = Object.keys(val).map(function(k) {
                                        return val[k]
                                    });
                                    $scope.mappedArray[ySer].data.push(arr[index]);
                                } else {
                                    if (key.indexOf('sum') >= 0) {
                                        originalkey = key;
                                        key = key.replace('sum_', '');
                                        $scope.mappedArray[key].data.push(val[originalkey]);
                                    } else if (key.indexOf('average') >= 0) {
                                        originalkey = key;
                                        key = key.replace('average_', '');
                                        $scope.mappedArray[key].data.push(val[originalkey]);
                                    } else if (key.indexOf('count') >= 0) {
                                        originalkey = key;
                                        key = key.replace('count_', '');
                                        $scope.mappedArray[key].data.push(val[originalkey]);
                                    } else {
                                        $scope.mappedArray[key].data.push(val[key]);
                                    }


                                }
                            }
                            index++;
                        }
                    }
                    widget.winConfig['mappedData'] = $scope.mappedArray;
                    widget.highchartsNG['series'] = $scope.seriesArray;
                    console.log("widget name " + JSON.stringify(widget.highchartsNG));
                });
            });
        }
    };


    //order by category (drilled)
    $scope.orderByDrilledCat = function(widget) {
        $scope.objArr = [];
        $scope.orderedArrayObj = [];
        var requestCounter = $scope.seriesArray.length; //main request completion counter

        widget.highchartsNG = {
            chart: {

            },
            plotOptions: {
                series: {
                    turboThreshold: 5000,
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                    }
                }
            },
            title: {
                text: widget.uniqueType
            },
            xAxis: {
                type: 'category'
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            drilldown: {
                drillUpButton: {
                    relativeTo: 'spacingBox',
                    position: {
                        y: 0,
                        x: 0
                    },
                    theme: {
                        fill: 'white',
                        'stroke-width': 1,
                        stroke: 'silver',
                        r: 0,
                        states: {
                            hover: {
                                fill: '#bada55'
                            },
                            select: {
                                stroke: '#039',
                                fill: '#bada55'
                            }
                        }
                    }

                }
            },
            title: {
                text: ''
            },
            size: {
                width: 300,
                height: 220
            }
        };

        if ($scope.widget.commonSrcConfig.src == "DuoStore") {
            var drilledSeries = [];
            var cat = Enumerable.From(eval('$scope.mappedArray.' + $scope.chartCategory.groupField + '.data')).Select().Distinct().ToArray();
            var orderedObjArray = [];
            var drilledCat = Enumerable.From(eval('$scope.mappedArray.' + $scope.chartCategory.drilledField + '.data')).Select().Distinct().ToArray();

            for (i = 0; i < $scope.seriesArray.length; i++) {
                var serMappedData = eval('$scope.mappedArray.' + $scope.seriesArray[i].serName + '.data');
                var catMappedData = eval('$scope.mappedArray.' + $scope.chartCategory.groupField + '.data');
                var drillData = eval('$scope.mappedArray.' + $scope.chartCategory.drilledField + '.data');

                var orderedArrayObj = {};
                var orderedObj = {};
                var drilledObj = {};
                var data = [];

                for (k = 0; k < cat.length; k++) {

                    orderedObj[cat[k]] = {
                        val: 0,
                        arr: []
                    };
                }

                for (k = 0; k < drilledCat.length; k++) {
                    drilledObj[drilledCat[k]] = {
                        val: 0,
                        count: 0
                    };
                }

                if (typeof $scope.filtering == 'undefined') {
                    $scope.filterData($scope.seriesArray[i].filter);
                }

                $scope.filtering.calculate(orderedObj, catMappedData, serMappedData, drillData);

                for (var key in orderedObj) {
                    if (Object.prototype.hasOwnProperty.call(orderedObj, key)) {

                        var drilledArray = $scope.filtering.calculate(orderedObj[key].arr, drilledObj, null, null);

                        var drilledSeriesObj = [];
                        for (var key1 in drilledArray) {
                            if (Object.prototype.hasOwnProperty.call(drilledArray, key1)) {
                                if (drilledArray[key1].val > 0)
                                    drilledSeriesObj.push([key1, drilledArray[key1].val]);
                            }
                        }

                        var test = {
                            id: '',
                            data: []
                        };
                        test.id = key;
                        test.data = drilledSeriesObj;

                        drilledSeries.push(test);

                        data.push({
                            name: key,
                            y: orderedObj[key].val,
                            //changed by sajee 9/19/2015
                            drilldown: key
                        });
                    }
                }
                console.log("Drilled series is");
                console.log(drilledSeries);
                orderedArrayObj["data"] = data;
                orderedArrayObj["name"] = $scope.seriesArray[i].name;
                orderedArrayObj["color"] = $scope.seriesArray[i].color;
                orderedArrayObj["type"] = $scope.seriesArray[i].type;
                orderedObjArray.push(orderedArrayObj);
            }

            widget.highchartsNG['series'] = orderedObjArray;
            widget.highchartsNG.drilldown['series'] = drilledSeries;

        } else if ($scope.widget.commonSrcConfig.src != "DuoStore") {
            $scope.seriesArray.forEach(function(entry) {
                var serObj = {
                    name: '',
                    color: '',
                    type: '',
                    data: []
                };

                entry['data'] = [];

                var paramArr = $scope.generateParamArr('get', Digin_Engine_API, $scope.widget.commonSrcConfig.src, widget.commonSrcConfig.tbl, 'aggregatefields', $scope.categItem.item.value, entry.filter, entry.serName.value);
                var w = new Worker("scripts/webworkers/commonSrcWorker.js");
                requestCounter--;
                w.postMessage(JSON.stringify(paramArr));
                w.addEventListener('message', function(event) {

                    var evData = JSON.parse(event.data);
                    serObj.name = entry.name;
                    serObj.type = entry.type;
                    serObj.color = entry.color;
                    for (i = 0; i < evData.length; i++) {
                        serObj.data.push({
                            drilldown: evData[i][$scope.categItem.item.value],
                            name: evData[i][$scope.categItem.item.value],
                            y: evData[i]['']
                        });
                        entry['data'].push({
                            drilldown: evData[i][$scope.categItem.item.value],
                            name: evData[i][$scope.categItem.item.value],
                            y: evData[i]['']
                        });
                    }
                    if (requestCounter == 0) {
                        setWidget();
                    }
                });
                $scope.orderedArrayObj.push(serObj);
            });

            function setWidget() {
                var requestCounter = 0;
                $scope.seriesArray.forEach(function(entry) {
                    requestCounter = entry.data.length;
                    entry.data.forEach(function(enData) {
                        var con = "WHERE " + $scope.categItem.item.value + "='" + enData.name + "'";
                        var drillParams = $scope.generateParamArr('get', Digin_Engine_API, $scope.widget.commonSrcConfig.src, widget.commonSrcConfig.tbl, 'aggregatefields', $scope.categItem.drillItem.value, entry.filter, entry.serName.value, con);
                        var w1 = new Worker("scripts/webworkers/commonSrcWorker.js");

                        w1.postMessage(JSON.stringify(drillParams));
                        w1.addEventListener('message', function(event) {
                            requestCounter--;
                            var drilledData = JSON.parse(event.data);
                            var dataArr = [];
                            for (j = 0; j < drilledData.length; j++) {
                                dataArr.push([
                                    drilledData[j][$scope.categItem.drillItem.value],
                                    drilledData[j]['']
                                ]);
                            }
                            $scope.objArr.push({
                                id: enData.name,
                                data: dataArr
                            });

                            if (requestCounter == 0) {
                                widget.highchartsNG['series'] = $scope.orderedArrayObj;
                                widget.highchartsNG.drilldown['series'] = $scope.objArr;
                            }
                        });


                    });


                });
                widget.highchartsNG['series'] = $scope.orderedArrayObj;
                widget.highchartsNG.drilldown['series'] = $scope.objArr;
                console.log('highchartng:' + JSON.stringify(widget.highchartsNG));
                $state.go('Dashboards');
            }
        }

    };

    $scope.cancel = function() {
        $mdDialog.hide();
    }

    $scope.buildMetric = function(widget) {
        widget.commonSrcConfig['arrAttributes'] = $scope.arrayAttributes;
        widget.commonSrcConfig['metCat'] = $scope.categItem;
        widget.commonSrcConfig['metFil'] = $scope.selectedFilter;
        if ($scope.queryGrouped) {
            widget.commonSrcConfig['metGrp'] = true;
            widget.commonSrcConfig['metGrpF'] = $scope.metric;
            $scope.client.getAggData(widget.commonSrcConfig.tbl, $scope.selectedFilter, $scope.categItem, function(data, status) {
                if (status) {
                    var filterkey = $scope.selectedFilter+ "_"+$scope.categItem;
                    widget.widData.value = data[0][filterkey] ;
                    $mdDialog.hide();
                } else console.log("Aggregation not received due to:" + data);
            }, $scope.metric.gField, "WHERE%20" + $scope.metric.gField + "=%27" + $scope.metric.gFieldVal + "%27");
        } else {
            widget.commonSrcConfig['metGrp'] = false;
            $scope.client.getAggData(widget.commonSrcConfig.tbl, $scope.selectedFilter, $scope.categItem, function(data, status) {
                if (status) {
                     var filterkey = $scope.selectedFilter+"_"+$scope.categItem;
                    widget.widData.value = data[0][filterkey] ;
                    $mdDialog.hide();
                } else console.log("Aggregation not received due to:" + data);
            });
        }
        $state.go('Dashboards');
    };

    $scope.buildQueriedChart = function(widget) {

        widget.highchartsNG = {
            options: {

            },
            series: [],
            xAxis: {
                type: 'category'
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            title: {
                text: ''
            },
            size: {
                width: 300,
                height: 220
            }
        };

        //getting the category name
        var catName = "";
        var configData = [];
        for (var key in widData[0]) {
            if (Object.prototype.hasOwnProperty.call(widData[0], key)) {
                if (key != "") catName = key;
            }
        }

        widData.forEach(function(entry) {
            configData.push({
                name: entry[catName],
                y: entry['']
            });
        });

        widget.highchartsNG.series.push({
            name: $scope.ser.name,
            color: $scope.ser.color,
            type: $scope.ser.type,
            data: configData
        });
        $mdDialog.hide();
        $state.go('Dashboards');
    };
}]);
