/**
 * Created by test on 2017/5/5.
 */
    //create session_id
var BOT_NAME = "导购机器人";
var DEFAULT_USER ="栗子";
// msg separator to split to multiple msg
/*var MSG_SEPARATOR = '\001';*/
var scrolled = 0;
// create function to extract URL parameter
$.urlParam = function(name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if(results == null) {
        return null;
    } else {
        return results[1] || 0;
    }
}
// get user name from url
var userName = decodeURIComponent($.urlParam('name'));
// default user is "栗子"
userName = (userName === void 0 || userName == "null")? DEFAULT_USER:userName;
// get user id from url
var userId =  $.urlParam('id');
// default id is 1
userId = (userId === void 0 || userId == "null")? '100':userId;

//create only session_id
    var sessionID;
    var timeStamp;
//save sessionid to sessionStorage

var frames_length = 0;

var nlgprevalue=[];
// when DOM is ready
$(document).ready(function(){

    $('div.nano-content').scroll(function(){
        $(".content-log .has-scrollbar").scrollTop($('div.nano-content').scrollTop());
        $("#list3").scrollTop($('div.nano-content').scrollTop());
        // $("#list4").scrollTop($('div.nano-content').scrollTop());
    })
    $('.content-log .has-scrollbar').scroll(function(){
        $('div.nano-content').scrollTop($(".content-log .has-scrollbar").scrollTop());
        $('#list3').scrollTop($(".content-log .has-scrollbar").scrollTop());
        // $('#list4').scrollTop($(".content-log .has-scrollbar").scrollTop());
    })
    $('#list3').scroll(function(){
        $('div.nano-content').scrollTop($("#list3").scrollTop());
        $('.content-log .has-scrollbar').scrollTop($("#list3").scrollTop());
        // $('#list4').scrollTop($("#list3").scrollTop());
    })
    // $('#list4').scroll(function(){
    //     $('div.nano-content').scrollTop($("#list4").scrollTop());
    //     $('#list3').scrollTop($("#list4").scrollTop());
    //     $('.content-log .has-scrollbar').scrollTop($("#list4").scrollTop());
    // })
    // get chat container
    var chatContainer= $('#chat_container');
    // get scroll container
    var scrollContainer = $('div.nano-content');
    // bind enter event on inpu ttext
    $('#user_msg').bind('keypress', function(e) {
        if(e.keyCode==13){
            // trigger button submit
            $("button[type='submit']").trigger('click');
        }
    });
    function createID(){
        var requestURL0 = "session";
        $.ajax({
            url:requestURL0,
            type:"GET",
            dataType:'json',
            success:function(data){
                sessionID=data.id;
                timeStamp=data.timestamp;
                $.cookie("session_id",sessionID);
            }
        });
    }
    var content;
    var content;
    function creatrecord(sessionID){
        var requestURL00 = "qa";
        $.ajax({
            url:requestURL00,
            type:"GET",
            dataType:'json',
            data:{
                "session_id":sessionID
            },
            success:function(data){
                //显示聊天记录
                indx = data.result.length
                var useract,userner,useractnew,usernernew;
                for(var i = 0;i<data.result.length;i++){
                    nlgprevalue.push(data.result[i].robot_answer.content)
                    content = answerFromCustomer(data.result[i].user_question.content, userName);
                    // appendContent(content);
                    chatContainer.append(content);
                    var h = parseInt($("#chat_container").css("height"))
                    $(".bot-content").css({"height":h+400+"px"})
                    $(".conversation-alter").css({"height":h+400+"px"})
                    // $(".iframe").css({"height":h+400+"px"})
                    scrolled=scrolled+300;
                    scrollContainer[0].scrollTop=scrolled
                    content = answerFromBot(data.result[i].robot_answer.content, BOT_NAME);
                    // appendContent(content);a
                    chatContainer.append(content);
                    $(".bot-content").css({"height":h+400+"px"})
                    $(".conversation-alter").css({"height":h+400+"px"})
                    // $(".iframe").css({"height":h+400+"px"})
                    scrolled=scrolled+300;
                    scrollContainer[0].scrollTop=scrolled
                    //生成第二列
                    appendlist2()
                    $($(".userMsgs")[i]).attr("seq",i+1);
                    $($(".bot-conversation")[i]).attr("seq",i+1);
                    userner = data.result[i].user_question.act.slice(data.result[i].user_question.act.indexOf("?")+1,100);
                    useract = data.result[i].user_question.act.slice(0,data.result[i].user_question.act.indexOf("?"));
                    if(data.result[i].user_question.refined_act){
                        useractnew = data.result[i].user_question.refined_act.slice(0,data.result[i].user_question.refined_act.indexOf("?"));
                        $($("#logbody .userMsgs")[i]).find(".user-request").html(useractnew);
                        if(useractnew!=useract){
                            liTop=$("#logbody").find(".userMsgs").last()[0].offsetTop+65;
                            //生成第三列
                            appendlist3()
                            $(".user-alter .user-alter-act").last().find(".alter-after").css({"color":"#31cbf1"})
                            $(".user-alter").last().css({"width":"100%","padding":0,"position":"absolute","top":liTop-80});
                            $(".user-alter .user-alter-act").last().find(".sq").html(i+1);
                            $(".user-alter .user-alter-act").last().find(".sq").css("opacity","0");
                            $(".conversation-alter").find(".user-alter").last().find(".sign").html("ACT:")
                            $(".conversation-alter").find(".user-alter").last().find(".alter-before").html(useract)
                            $(".conversation-alter").find(".user-alter").last().find(".alter-after").last().html(useractnew)
                        }
                    }else{
                        $($("#logbody .userMsgs")[i]).find(".user-request").html(useract);
                    }
                    if(data.result[i].user_question.refined_act){
                        usernernew = data.result[i].user_question.refined_act.slice(data.result[i].user_question.refined_act.indexOf("?")+1,100);
                        $($("#logbody .userMsgs")[i]).last().find(".user-ner").html(usernernew);
                        if(usernernew!=userner){
                            liTop=$("#logbody").find(".userMsgs").last()[0].offsetTop+115;
                            //生成第三列
                            appendlist3()
                            $(".user-alter").last().css({"width":"100%","padding":0,"position":"absolute","top":liTop-80});
                            $(".user-alter .user-alter-act").last().find(".sq").html(i+1);
                            $(".user-alter .user-alter-act").last().find(".sq").css("opacity","0");
                            $(".conversation-alter").find(".user-alter").last().find(".sign").html("NER:")
                            $(".conversation-alter").find(".user-alter").last().find(".alter-before").html(userner)
                            $(".conversation-alter").find(".user-alter").last().find(".alter-after").last().html(usernernew)
                        }
                    }else{
                        $($("#logbody .userMsgs")[i]).last().find(".user-ner").html(userner);
                    }
                    if(data.result[i].robot_answer.refined_act && data.result[i].robot_answer.refined_act!=data.result[i].robot_answer.act){
                        $($(".bot-act")[i]).html(data.result[i].robot_answer.refined_act);
                        liTop=$("#logbody").find(".bot-conversation").last()[0].offsetTop+65;
                        //生成第三列
                        appendlist3()
                        $(".user-alter .user-alter-act").last().find(".alter-after").css({"color":"red"})
                        $(".user-alter").last().css({"width":"100%","padding":0,"position":"absolute","top":liTop-80});
                        $(".user-alter .user-alter-act").last().find(".sq").html(i+1);
                        $(".user-alter .user-alter-act").last().find(".sq").css("opacity","0");
                        $(".conversation-alter").find(".user-alter").last().find(".sign").html("Act:")
                        $(".conversation-alter").find(".user-alter").last().find(".alter-before").html(data.result[i].robot_answer.act)
                        $(".conversation-alter").find(".user-alter").last().find(".alter-after").last().html(data.result[i].robot_answer.refined_act)
                    }else{
                        $($(".bot-act")[i]).html(data.result[i].robot_answer.act);
                    }
                    if(data.result[i].robot_answer.refined_content && data.result[i].robot_answer.refined_content!=data.result[i].robot_answer.content){
                        $($(".bot-nlg")[i]).html(data.result[i].robot_answer.refined_content);
                        liTop=$("#logbody").find(".bot-conversation").last()[0].offsetTop+115;
                        //生成第三列
                        appendlist3()
                        $(".user-alter").last().css({"width":"100%","padding":0,"position":"absolute","top":liTop-80});
                        $(".user-alter .user-alter-act").last().find(".sq").html(i+1);
                        $(".user-alter .user-alter-act").last().find(".sq").css("opacity","0");
                        $(".conversation-alter").find(".user-alter").last().find(".sign").html("NLG:")
                        $(".conversation-alter").find(".user-alter").last().find(".alter-before").html(data.result[i].robot_answer.content)
                        // $(".conversation-alter").find(".user-alter").last().find(".alter-after").last().html(data.result[i].robot_answer.refined_content)
                        $(".conversation-alter").find(".user-alter").last().find(".alter-after").last().html("已修改!请在后台读取修改结果^_^");
                        $(".conversation-alter").find(".sign").next().last().html("");
                        $(".conversation-alter").find(".bf").last().remove();
                    }else{
                        // $($(".bot-nlg")[i]).html(data.result[i].robot_answer.content);
                    }
                }
            }
        });
    }
    $("#demo-chat-body .has-scrollbar").height($(window).height()-150)
    $(".content-log").height($(window).height()-100)
    $(".content-alter").height($(window).height()-100)
    $(".content-tracking").height($(window).height()-100)
    //刷新页面读取查看cookie中是否有值
    if($.cookie('session_id')!=null){
        sessionID = $.cookie('session_id')
        //将cookie中id返给后台获取聊天记录
        creatrecord(sessionID)
        //获取第一列高度给第二三和四列
        // setTimeout(function () {
        //     var hh = parseInt($("#chat_container").css("height"))
        //     $(".bot-content").css({"height":hh+100+"px"})
        //     $(".conversation-alter").css({"height":hh+100+"px"})
        //     $(".iframe").css({"height":hh+100+"px"})
        // },50)
    }else{
        createID();
    }
    function appendlist2(){
        //append userMsg2   修改部分还加了个id logbody
        $("#logbody").append('<div class="userMsgs" style="padding:15px;"></div>')
        //给一个定位和对话位置匹配
        $("#logbody .userMsgs").last().css({"width":"100%","padding":0,"position":"absolute","top":$('.speech-right').last()[0].offsetTop});
        var customerHtml='<div>' +
            '<span class="userMsglist aa">ACT:</span>'+
            '<span class="user-request canname"></span>'+
            '<span class="alter-btn modify cc" style="cursor: pointer; margin-right:2px;"onclick="change(this)">修改</span>'+
            '</div>' +
            '<div style="margin-top:10px;">'+
            '<span class = "aa">NER:</span>'+
            '<span class="user-ner canname"><!--request+price(category=面膜)--></span>'+
            '<span class="alter-btn modify cc" style="cursor: pointer;margin-right:2px;" onclick="change(this)">修改</span>'+
            '</div>';
        $("#logbody .userMsgs").last().append(customerHtml);
        //append botconversation
        var botHtml='<div class="bot-conversation" style="padding:0;width:100%;">'+
            '<div >'+
            '<span class = "aa" >Act:</span>'+
            '<span class="bot-act canname" ><!--request+price(category=面膜)--></span>'+
            '<span class="alter-btn modify cc" style="cursor: pointer;margin-right:2px;" onclick="change(this)">修改</span>'+
            '</div>'+
            '<div style="margin-top:10px;">'+
            '<span class = "aa" style="display:inline-block;position: absolute;top:30px;">NLG:</span>'+
            '<span class="bot-nlg canname" style="display:inline-block;margin-left:35px;width: 70%;"><!--request+price(category=面膜)--></span>'+
            '<span class="alter-btn modify cc" style="cursor: pointer;margin-right:2px;" onclick="change(this)">修改</span>'+
            '</div>'+
            '</div>';
        $("#logbody .userMsgs").last().after(botHtml);
        $("#logbody .bot-conversation").last().css({"position":"absolute","top":$('.speech-left2').last()[0].offsetTop})
    }
    //发送个人id
    $("#inputid").on('click',function(){
        chatContainer.empty();
        $("#logbody").empty();
        //empty the third content
        $(".conversation-alter").empty();
        chatContainer.append(answerFromBot(helloMsg, BOT_NAME));
        //显示该id聊天记录
        sessionID = $("#idcontent").val()
        creatrecord(sessionID)
        $.cookie("session_id",sessionID);
        //生成第二列

    })
//end
    // bind clear chat on body
    var helloMsg = generateHelloMsg(userName);
    var errorMsg = generateErrorMsg(userName);
    chatContainer.append(answerFromBot(helloMsg, BOT_NAME));
    var act0;
    var answer;
    var ner;
    var bact;
    var actframe;
    var frames;
    var lost_connection = false;
    $('#clear-chat').click(function(event){
        indx = 0
        chatContainer.empty();
        $("#logbody").empty();
        //empty the third content
        $(".conversation-alter").empty();
        chatContainer.append(answerFromBot(helloMsg, BOT_NAME));
        createID();

    })
    //post the conversation to server


    // create hello event from bot when page is loaded

    // binding click call back fucntion点击发送
    var indx=0;
    //点击发送
    $("button[type='submit']").click(function(event){
        if($("#idcontent2").val()==""){
            alert("userid不能为空！")
            return false;
        }
        userName = $("#idcontent2").val();
        //mark sequence
        indx++;
        // get user msg
        var userMsg = $("#user_msg").val();
        if(userMsg === void 0 || userMsg === '') {
            // clear focus on button
            $(document).focus();
            return false;
        }
        // clear input fild
        $("#user_msg").val('');
        // clear focus on button
        $(document).focus();
        // append user input
        content = answerFromCustomer(userMsg, userName);
        appendContent(content);
        // trigger to wait bot msg
        waitBotResponse(userMsg);
        appendlist2()
        $($(".userMsgs").last()[0]).attr("seq",indx);
        $($(".bot-conversation").last()[0]).attr("seq",indx);


        //save one sequence conversaion
        function test(){
            var requestURL2 = "qa";
            var data0={
                "session_id":sessionID,
                "sequence":indx,
                "timestamp":"????",
                "user_question":{
                    "content":userMsg,
                    "act":act0+"?"+ner
                },
                "robot_answer":{
                    "content":answer,
                    "act":bact
                }
            };
            $.ajax({
                type: "POST",
                url:requestURL2,
                dataType:"json",
                contentType: "application/json;charset=utf-8",
                processData:false,
                headers:{
                    speciLan:"ch",
                    devicetype:"web",
                    userkey:12345
                },
                data:JSON.stringify(data0),
               /* dataType: 'json',*/
                success: function (data) {
                }
            });
        }
        setTimeout(function(){
            test()
            $(".iframe").empty()
            appendlist4();
            for(var i=0;i<frames_length;i++){
                $(".iframes").last().append('<p style = "margin: 0;"><p class="framesid" onclick="flipobj(this);" style = "margin: 0;">1</p><p class="frame"  style = "display:none;margin: 0;"></p></p>');
                $(".framesid").last().html(i+":"+"▼")
                $(".frame").last().html(JSON.stringify(frames[i]));
                if(i==actframe){
                    $(".framesid")[i].innerHTML = $(".framesid")[i].innerHTML+"<span style='color:#21ce21;'> active </span>"
                    $(".frame").last().addClass("text-primary")
                }
            }
            ;}, 500);
        $(".conversation-alter").css({"height":$("#chat_container").css("height")})
        //获取第一列高度给第三和四列
        // setTimeout(function () {
        //     var hhh = parseInt($("#chat_container").css("height"))
        //     console.log(($("#chat_container").css("height")))
        //     $(".bot-content").css({"height":hhh+100+"px"})
        //     $(".conversation-alter").css({"height":hhh+100+"px"})
        //     $(".iframe").css({"height":hhh+100+"px"})
        // },200)
        // avoid fresh
        return false;
    });

    // function to append content
    var appendContent = function(/*string of html tag*/content){
        chatContainer.append(content);
        scrolled=scrolled+300;
        // scroll to bottom
        scrollContainer.animate({scrollTop: scrolled},200,function(){
            //获取第一列高度给第三和四列
            var hhh = parseInt($("#chat_container").css("height"))
            $(".bot-content").css({"height":hhh+100+"px"})
            $(".conversation-alter").css({"height":hhh+100+"px"})
            // $(".iframe").css({"height":hhh+100+"px"})
            $(".content-log .has-scrollbar").scrollTop(hhh);
        });
        // scrollContainer[0].scrollTop=scrolled
        return true;
    };


    // function to wait for bot response
    var ner0;
    var waitBotResponse = function (/*String*/userMsg){
        //得到user的act
        var requestURL1 ='http://192.168.2.211:9500/nlu?text='+ encodeURIComponent(userMsg);
        var url1 ="http://localhost:8089/proxy?target=" + encodeURIComponent(requestURL1);
        $.ajax({
            url:url1,
            type:"GET",
            dataType:'json',
            success:function(data){
                var result1 = data;
                act0=result1.act;
                ner0 = JSON.stringify(result1.ner);
                ner=JSON.stringify(result1.ner).replace("{","").replace("}","");
                $("#logbody .userMsgs").last().find(".user-request").html(result1.act);
                $("#logbody .userMsgs").last().find(".user-ner").html(ner);
            }
        });

        //最后给的链接返回用户信息获取机器人信息
            setTimeout(function(){
                ner0 = JSON.parse(ner0);
                var text1=JSON.stringify({"act":act0,"ner":ner0,"text":userMsg});
                text1=encodeURIComponent(text1);
                var text2=encodeURIComponent($("#idcontent2").val());
                var requestURL6 ='http://192.168.2.211:9900/sales_bot?text='+text1+"&uid="+text2;
                var url6 ="http://localhost:8089/proxy?target=" + encodeURIComponent(requestURL6);
                $.ajax({
                    type: "GET",
                    url:url6,
                    dataType:"json",
                     timeout:2000,
                    error: function(data){
                        // create error msg from bot
                        content = answerFromBot(errorMsg, BOT_NAME);
                        lost_connection = true;
                        appendContent(content);
                        $("#logbody .bot-conversation").last().css({"position":"absolute","top":$('.speech-left2').last()[0].offsetTop})
                    },
                    success: function (data) {
                        //获取bot 的act
                        bact = data.act;
                        $(".bot-act").last().html(data.act);
                        lost_connection = false;
                        answer =data.text;
                        nlgprevalue.push(answer)
                        console.log(nlgprevalue)
                        actframe=data.activeFrame;
                        frames=data.frames;
                        function getJsonLength(jsonData){

                            var jsonLength = 0;

                            for(var item in jsonData){

                                jsonLength++;

                            }
                            return jsonLength;
                        }
                        frames_length=getJsonLength(frames);
                        // whether bot has sent response
                        var hasResponse = false;
                        if(answer !== void 0){
                            // response the first msg
                            var content = answerFromBot(answer, BOT_NAME);
                            hasResponse = appendContent(content);
                            $("#logbody .bot-conversation").last().css({"height":$('.speech-left2').last().height(),"position":"absolute","top":$('.speech-left2').last()[0].offsetTop})
                            $(".bot-nlg").last().html(answer);
                            return false;
                        }
                        // if bot has no response
                        if(!hasResponse){
                            lost_connection = true;
                            // create error msg from bot
                            var content = answerFromBot(errorMsg, BOT_NAME);
                            appendContent(content);
                            $("#logbody .bot-conversation").last().css({"position":"absolute","top":($('.speech-left2').last()[0].offsetTop-10)+'px'})
                        }
                    }
                });
            },50);

    };
});

    function appendlist4(){
        var framelist= '<li class="iframeli" style="width:95%;">'+
            '<div>'+
            '</div>'+
            '<div class="frames" style="word-break:break-all;width:99%;overflow-y:auto;z-index:1000;cursor:pointer;">'+
            '<p class="iframes" style="height:auto;">frames:</p >'+
            '<div>'+
            // '<p class="flip"  style="border-radius:5px;" onclick="flipobj(this);">点击这里查看更多!</p >'+
            '</li>';
        ;
        $(".iframe").append(framelist);
        $(".iframeli").last().css({"position":"absolute","top":"50px"});
    }
// assembe html tag for bot answer
function answerFromBot(/* string msg to sentd*/msg, /* bot name */botName){
    // get current date
    var now = new Date();
    var time = formatAMPM(now);
    var msgHtml = '<li class="mar-btm"><div class="media-left"><img src="img/avatar1.jpg" class="img-circle img-sm" alt="Profile Picture">'
        + '</div> <div class="media-body pad-hor speech-left2"><div class="speech" style="padding:20px 10px;"><a href="#" class="media-heading">'
        + botName + '</a><p>' + msg + '</p><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>&nbsp;'
        + time + '</p></div></div></li>';
    return msgHtml;
};
// assemble html tag for customer
function answerFromCustomer(/* string msg to sentd*/msg, /* bot name */userName){
    // get current date
    var now = new Date();
    var time = formatAMPM(now);
    var msgHtml = '<li class="mar-btm"><div class="media-right"><img src="img/avatar2.jpg" class="img-circle img-sm" alt="Profile Picture"></div>'
        + '<div class="media-body pad-hor speech-right"><div class="speech">'
        + '<a href="#" class="media-heading">' + userName + '</a><p>'
        + msg + '</p><p class="speech-time"><i class="fa fa-clock-o fa-fw"></i>&nbsp;'
        + time + '</p></div></div></li>';
    return msgHtml;
};
// format date to time
function formatAMPM(/* Date Object */date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
};
    // generate hello msg
    function generateHelloMsg(/*String*/userName, /*String*/userId){
        var now = new Date();
        var hours = now.getHours();
        var ampm = hours >= 12 ? '，下午' : '，上午';
        return 'Hello '  + ampm + '好啊，我能为你做些什么呢？';
    };
    // generate error msg
    function generateErrorMsg(/*String*/userName){
        return '对不起'  + '，我刚刚掉线了^-^';
    };
    function appendlist3(){
        var altercontent='<li class="user-alter" style="padding: 9px 9px;">'+
            '<div class="user-alter-act">'+
            '<div class="bf">'+
            '<span class="sign"></span><span>before：</span><span class="alter-before"></span>'+
            '</div>'+
            '<div class="af">'+
            '<span class="sign"></span><span>after：</span><span class="alter-after"></span><span class="sq"></span>'+
            '</div>'+
            '</div>'+
            '</li>';
            $(".conversation-alter").last().append(altercontent);
    }
    function flipobj(obj){
        $(obj).next().slideToggle("slow");

    }
    var prevalue,sign,lock2 = "open",liTop;
    function change(obj){

     var xg=$(obj).html();
         seeq=$(obj).parent().parent().attr("seq");
        if(xg =="修改" && lock2 == "open") {
            lock2 = "close";
            //获取到sign，为ACT后者nlg,ner
            sign=$(obj).siblings(".aa").html();
            //获取修改之前的内容
            $canname=$(obj).parent("div").children(".canname");
            prevalue=$canname.text();
            //text变为输入框,
            $canname.html("<input type='text' id='kk' style='display: inline;' name='editname' class='text'>");
            $("#kk").val(prevalue);
            $(obj).html("保存");
        }else if(xg=="保存"){
            lock2 = "open";
            var $input=$(obj).siblings(".canname").children("input[name=editname]");
            //获取到新内容
            var newtxt=$input.val();
            $input.parent("span").html(newtxt);
            //获取第二列定位高度
            if(sign == "ACT:" || sign == "Act:"){
                liTop=$(obj).parent().parent()[0].offsetTop+65;
            }else{
                liTop=$(obj).parent().parent()[0].offsetTop+115;
            }
            $(obj).text('修改');
            //遍历匹配


        var lock="open";
            for(var i=0;i<$(".conversation-alter").children().length;i++){

                if((sign==$($(".conversation-alter").children()[i]).find(".sign").html()) && (seeq==$($(".conversation-alter").children()[i]).find(".sq").html())){
                    lock="close";
                    //修改第i块内容
                    if(prevalue!=newtxt){
                        $($(".conversation-alter").children()[i]).find(".alter-after").html(newtxt);
                        if(sign == "NLG:"){
                            $($(".conversation-alter").children()[i]).find(".alter-after").html("已修改!请在后台读取修改结果^_^");
                            $($(".conversation-alter").children()[i]).find(".sign").next().html("");
                            $($(".conversation-alter").children()[i]).find(".bf").remove();
                        }
                    }
                    console.log(nlgprevalue[$(obj).parent().parent().attr("seq")-1])
                    console.log("??"+newtxt)
                    //删除第i块
                    if($($(".conversation-alter").children()[i]).find(".alter-before").html() == $($(".conversation-alter").children()[i]).find(".alter-after").html()||(nlgprevalue[$(obj).parent().parent().attr("seq")-1]==newtxt)){

                        $($(".conversation-alter").children()[i]).remove();
                    }

                    // if($($(".conversation-alter").children()[i]).find(".alter-after").html() == "已修改!请在后台读取修改结果^_^" && nlgprevalue[i]==newtxt){
                    //     $($(".conversation-alter").children()[i]).html("");
                    // }
                }
            }
        if(lock=="open" && prevalue!=newtxt){
            appendlist3();
            if(sign == "ACT:"){
                $(".user-alter .user-alter-act").last().find(".alter-after").css({"color":"#31cbf1"})
            }
            if(sign == "Act:"){
                $(".user-alter .user-alter-act").last().find(".alter-after").css({"color":"red"})
            }
            $(".user-alter").last().css({"width":"100%","padding":0,"position":"absolute","top":liTop-80});
            $(".user-alter .user-alter-act").last().find(".sq").html(seeq);
            $(".user-alter .user-alter-act").last().find(".sq").css("opacity","0");
            $(".user-alter .user-alter-act").last().find(".sign").html(sign);
            $(".user-alter .user-alter-act").last().find(".alter-before").html(prevalue);
            $(".user-alter .user-alter-act").last().find(".alter-after").html(newtxt);
            if(sign == "NLG:"){
                $(".user-alter .user-alter-act").last().find(".alter-after").html("已修改!请在后台读取修改结果^_^");
                $(".user-alter .user-alter-act").last().find(".sign").next().html("");
                $(".user-alter .user-alter-act").last().find(".bf").remove();
            }
        }
        var seq;
            seq=$($(obj).parent().parent()[0]).attr("seq")
        var param;
        if($(obj).siblings(".user-request")[0]!=undefined){
            param = {
                "session_id":sessionID,
                "sequence":seq,
                "user_question":{
                    "refined_act":newtxt+"?"+$(obj).parent().parent().find(".user-ner").html()
                },
                "robot_answer":{
                }
            }
        }else if($(obj).siblings(".user-ner")[0]!=undefined){
            param = {
                "session_id":sessionID,
                "sequence":seq,
                "user_question":{
                    "refined_act":$(obj).parent().parent().find(".user-request").html()+"?"+newtxt
                },
                "robot_answer":{
                }
            }
        }else if($(obj).siblings(".bot-nlg")[0]!=undefined){
            param = {
                "session_id":sessionID,
                "sequence":seq,
                "user_question":{
                },
                "robot_answer":{
                    "refined_content":newtxt
                }
            }
        }else if($(obj).siblings(".bot-act")[0]!=undefined){
            param = {
                "session_id":sessionID,
                "sequence":seq,
                "user_question":{
                },
                "robot_answer":{
                    "refined_act":newtxt
                }
            }
        }else{alert(1)}
        $.ajax({
            url:"qa",
            type:"PUT",
            dataType:'json',
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(param),
            success:function(data){

            }
        });
    }

}