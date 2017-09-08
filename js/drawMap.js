(function () {
    window.DrawMap = function ($imgs, $canvas) {
        var $canvas2d = $canvas.getContext("2d");
        var imgTopArr = getImgTopArr($imgs);
        var sortImgArr = sortImg(groupImg($imgs, imgTopArr));

        var x = 0, y = 0;
        sortImgArr.forEach(function (ele) {
            ele.forEach(function (img) {
                img.setAttribute('crossOrigin', 'Anonymous');
                $canvas2d.drawImage(img, 0, 0, 256, 256, x, y, 256, 256);
                x += 256;
            });
            x = 0;
            y += 256
        });
        // $canvas2d.drawImage(document.getElementById('result'), 0, 0, 256, 256, x, y, 256, 256);
        // var img = document.createElement('img');
        // img.crossOrigin = "Anonymous";
        var img = new Image();
        img.setAttribute('crossO0rigin', 'Anonymous');
        img.src = $canvas.toDataURL("image/png");
        // document.getElementById('result').src = $canvas.toDataURL("image/png")
        // img.src = $canvas.toDataURL("image/png");
        // document.getElementsByTagName('bdoy')[0].appendChild(img);

        function getImgTopArr(imgs) {
            var arr = [];
            var top;
            for(var i = 0, len = imgs.length; i < len; i++){
                top = $(imgs[i]).css('top');
                if(arr.indexOf(top) === -1){
                    arr.push(top);
                }
            }
            return arr.sort(function (ele1, ele2) {
                return parseInt(ele1) - parseInt(ele2);
            });
        }
        function groupImg(imgs, imgTopArr) {
            var arr = [];
            imgTopArr.forEach(function () {
                arr.push([]);
            })
            var top;
            for(var i = 0, len = imgs.length; i < len; i++){
                top = $(imgs[i]).css('top');
                arr[imgTopArr.indexOf(top)].push(imgs[i]);
            }
            return arr;
        }
        function sortImg(groupImgs) {
            var arr = [];
            groupImgs.forEach(function (ele) {
                arr.push(ele.sort(function (img1, img2) {
                    return parseInt($(img1).css('left')) - parseInt($(img2).css('left'));
                }));
            });
            return arr;
        }
    }
})()