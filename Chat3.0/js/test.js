/**
 * Created by test on 2017/5/5.
 */

    var requestURL1 ='http://192.168.2.211:9500/nlu?text='+'你好';
    var url1 ='proxy.php?url=' + encodeURIComponent(requestURL1);
    $.ajax({
        url:url1,
        type:"GET",
        dataType:'json',
        success:function(data){
            var result1 = JSON.parse(decodeURIComponent(escape(data)));
            console.log(result1.text);
        }
    });


