/**
 * Created by Administrator on 2016/11/3.
 */
$(function(){
    /*input搜索框start*/
    var $input = $("#header .search input");
    $input.on("focus",function() {
        if (this.value == this.defaultValue) {
            this.value = "";
        }

    }).on('blur',function() {
        if (this.value == '') {
            this.value = this.defaultValue;
        }
    })
    $input.on("keypress",function(event){
        if ( event.which == 13 && this.value!="") {
            alert(this.value);
        }
    });
    /*input搜索框end*/
    /*变换主题颜色start*/
    var $skinLi = $("#skin li");
    $skinLi.on("click",function(){
        $("#"+this.id).addClass("selected").siblings().removeClass("selected");
        $("#cssfile").attr("href","css/skin/"+ this.id +".css"); //设置不同皮肤
    });
    /*变换主题颜色end*/
    /*轮播图start*/
    var timer;
    var $aImg = $("#img-turns a");
    /*$aImg.each(function(index){
        $(this).css({"z-index":$aImg.size()-index}) ;
    });*/
    $aImg.mouseenter(function(){
        clearInterval(timer);
    });
    var $imgLi = $("#img-turns .img-link li");
    var iNow = 0;
    $imgLi.hover(function(){
        changeImg($(this).index());
        iNow = $(this).index();
        clearInterval(timer);
    },function(){
        run();
    });
    function changeImg(index){
        $imgLi.eq(index).addClass("selected").siblings().removeClass('selected');
        $aImg.eq(index).stop(true).fadeIn().siblings().hide();
    }
    function run(){
        timer = setInterval(function(){
            iNow++;
            if(iNow == $imgLi.size()){
                iNow = 0;
            }
            changeImg(iNow);
        },2000);
    }
    run();
    /*轮播图end*/
    /*下面的轮播图start*/
    var $tabContent = $("#tab-content");
    var contentWidth = $tabContent.width();
    $tabContent.width(4 * contentWidth);
    $tabContent.html($tabContent.html() + $tabContent.html() + $tabContent.html() + $tabContent.html());
    var $tabA = $("#tab a");
    $("#tab li").mouseover(function(){
        $(this).addClass("selected").siblings().removeClass("selected");
        $tabA.removeClass("select");
        $tabA.eq($(this).index()).addClass("select");
        $tabContent.animate({
            left:-$(this).index() * contentWidth
        },1000);
    });
    /*下面的轮播图end*/

});