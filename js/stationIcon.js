function GetStationData(regionUrl, stationUrl, callback) {
    getMapData(regionUrl, function (regionList) {
        getMapData(stationUrl, function (stationList) {
            callback(regionList, stationList);
        })
    })
    function getMapData(url, callback) {
        $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            async: false,
            success: function (data) {
                callback(data);
            },
            error: function (json) {

            }
        });
    }
}
function InitMap(map, regionList, stationList) {
    var cityList = [
        {
            "cityname": "成都",
            "longtitude": 104.07123,
            "latitude": 30.66759
        },
        {
            "cityname": "杭州",
            "longtitude": 120.209576,
            "latitude": 30.266057
        },
        {
            "cityname": "重庆",
            "longtitude": 106.547966,
            "latitude": 29.574013
        },
        {
            "cityname": "绵阳",
            "longtitude": 104.651551,
            "latitude": 31.529239
        },
        {
            "cityname": "郑州",
            "longtitude": 113.678362,
            "latitude": 34.763515
        },
        {
            "cityname": "郑州",
            "longtitude": 112.607033,
            "latitude": 35.077639
        }
    ]

    return initMap(map, cityList, regionList, stationList);

    function initMap(map, cityList, regionList, stationList) {
        addInfoWindowStyle();

        var cityMarker = [];
        var regionMarker = [];
        var stationMarker = [];
        var labelArr = [];

        var allowMarkerShow = true;

        add(map, cityList, 'city');

        // 获取当前的缩放等级，如果等级没有变化，不处理图标
        var curZoomLevel = computedZoomLevel(map.getZoom());
        // 缩放
        map.addEventListener("zoomend", function(){
            var zoomLevel = computedZoomLevel(this.getZoom());
            if(curZoomLevel !== zoomLevel){
                curZoomLevel = zoomLevel;
                zoomLevelChanged(curZoomLevel);
            }
        });
        // 移动地图时
        map.addEventListener("moveend", function(){
            // 根据当前的缩放等级，渲染未渲染的图标
            switch (parseInt(curZoomLevel)){
                case 0:
                    add(map, cityList, 'city');
                    break;
                case 1:
                    add(map, regionList, 'region');
                    break;
                case 2:
                    add(map, stationList, 'station');
                    break;
            }
        });

        return {
            hideMarker: function () {
                switch (parseInt(curZoomLevel)){
                    case 0:
                        hideMarker(cityMarker);
                        break;
                    case 1:
                        hideMarker(labelArr);
                        hideMarker(regionMarker);
                        break;
                    case 2:
                        hideMarker(stationMarker);
                        break;
                }
                allowMarkerShow = false;
            },
            showMarker: function () {
                allowMarkerShow = true;
                switch (parseInt(curZoomLevel)){
                    case 0:
                        showMarker(cityMarker);
                        break;
                    case 1:
                        showMarker(labelArr);
                        showMarker(regionMarker);
                        break;
                    case 2:
                        showMarker(stationMarker);
                        break;
                }
            }
        }

        function zoomLevelChanged(level) {
            switch (parseInt(level)){
                case 0:
                    add(map, cityList, 'city');
                    hideMarker(stationMarker);
                    hideMarker(regionMarker);
                    hideMarker(labelArr);
                    showMarker(cityMarker);
                    break;
                case 1:
                    add(map, regionList, 'region');
                    hideMarker(stationMarker);
                    hideMarker(cityMarker);
                    showMarker(labelArr);
                    showMarker(regionMarker);
                    break;
                case 2:
                    add(map, stationList, 'station');
                    hideMarker(regionMarker);
                    hideMarker(labelArr);
                    hideMarker(cityMarker);
                    showMarker(stationMarker);
                    break;
            }
        }
        function computedZoomLevel(zoom) {
            if(zoom <= 9){
                // 城市
                return 0
            } else if(zoom > 9 && zoom < 12){
                // 区域
                return 1
            } else {
                // 具体站点
                return 2
            }
        }
        function showMarker(marker) {
            // 外部调用showMarker后，不显示图标
            if(allowMarkerShow === true){
                marker.forEach(function (lay) {
                    lay.show();
                });
            }
        }
        function hideMarker(marker) {
            // 外部调用hideMarker后，所有图标已经隐藏，不需要再执行
            if(allowMarkerShow !== false) {
                marker.forEach(function (lay) {
                    lay.hide();
                });
            }
        }
        function add(map, mark, type) {
            var notRenderPoint = [];
            // 获取可视区域，只渲染可视区域的图标
            var bounds = map.getBounds();
            for (var i = 0, len = mark.length; i < len; i++) {
                var p0 = mark[i].longtitude, p1 = mark[i].latitude;
                // 范围之外的点不渲染，将未渲染的点保存下来
                if(!(p0 >= bounds.xc && p0 <= bounds.uc && p1 >= bounds.wc && p1 <= bounds.tc)){
                    notRenderPoint.push(mark[i]);
                } else {
                    var point = new window.BMap.Point(p0, p1);
                    var maker;
                    if(type === 'city'){
                        maker = addMarker(map, point, i, type, './img/cityIcon.png')
                        cityMarker.push(maker);
                    } else if(type === 'region'){
                        maker = addMarker(map, point, i, type, './img/regionIcon.png')
                        regionMarker.push(maker);
                        var label = addLabel(point, mark[i].stationCount, mark[i].areaName);
                        labelArr.push(label);
                        maker.addEventListener("click", zoomAndCenterToRegion.bind(null, map, point));
                    } else {
                        maker = addMarker(map, point, i, type, './img/stationIcon.png')
                        stationMarker.push(maker);
                        addInfoWindow(maker, mark[i]);
                    }
                    if(allowMarkerShow === false){
                        maker.hide();
                        label && label.hide();
                    }
                }
            }
            // 将对应的数据替换为未渲染的点
            if(type === 'city'){
                cityList = notRenderPoint;
            } else if(type === 'region'){
                regionList = notRenderPoint;
            } else {
                stationList = notRenderPoint;
            }
        }

        function zoomAndCenterToRegion(map, point) {
            map.setZoom(12);
            map.panTo(point);
        }

        // 添加标注
        function addMarker(map, point, index, type, imgage) {
            var config = {}, xSize = 35, ySize = 47;
            if(type === 'city'){
                config = {
//                    offset: new BMap.Size(1000, 1000)
//                    imageOffset: new BMap.Size(0, -100)
                    anchor: new BMap.Size(30, 75)
                }
                xSize = 64, ySize = 78;
            } else if(type === 'region'){
                xSize = 48, ySize = 68;
                config = {
                    anchor: new BMap.Size(22, 70),
                    imageSize: new BMap.Size(xSize, ySize)
                }
            }
            var myIcon = new BMap.Icon(imgage, new BMap.Size(xSize, ySize), config);
            var marker = new BMap.Marker(point, {icon: myIcon, enableMassClear: false});
            map.addOverlay(marker);
            return marker;
        }

        function addLabel(point, num, areaName) {
            var html = "<div style='fontSize:10px;margin-bottom: 4px;'>" + num + "</div><div>" + areaName + "</div>"
            var label = new BMap.Label(html, {position: point});
            label.setStyle({
                width: "60px",
                color: "#4354a3",
                fontSize: "8px",
                textAlign: "center",
                fontFamily: "微软雅黑",
                border: "transparent",
                backgroundColor: "transparent",
                marginLeft: "-28px",
                marginTop: "-64px"
            });
            map.addOverlay(label);
            return label;
        }

        // 添加信息窗口
        function addInfoWindow(marker, point) {
            var title = '<div class="map-info-window-title">' + point.stationName + '</div>';
            //pop弹窗信息
            var html =
                '<div class="map-info-window">' +
                '<div class="map-info-window-row">地址：' + point.stationAddress + '</div>' +
                '<div class="map-info-window-row">车位数：' + point.parkingNum + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;空闲车辆数：' + point.freeVehicle + '</div>' +
                '<div class="map-info-window-row">车辆数：' + point.vehicleNum + '</div>' +
                '</div>';

            //pop弹窗标题
            var infoWindow = new BMap.InfoWindow(html, {title: title, width: 320, enableMessage: false});

            var openInfoWinFun = function () {
                marker.openInfoWindow(infoWindow);
            };
            marker.addEventListener("click", openInfoWinFun);
            return openInfoWinFun;
        }
        function addInfoWindowStyle() {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML=
                '.map-info-window{' +
                'font-family: "微软雅黑";' +
                'font-size: 16px;' +
                'color: #999;' +
                'border-radius: 5px;' +
                '}' +
                '.map-info-window-title{' +
                'margin: 0 7px;' +
                'padding: 0 7px 10px;' +
                'border-bottom: 1px solid #e5e5e5;' +
                'font-size: 18px;' +
                'color: #333;' +
                '}' +
                '.map-info-window-row{' +
                'margin: 10px 14px 0;' +
                '}'
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    }
}
