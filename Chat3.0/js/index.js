/**
 * Created by test on 2017/5/5.
 */
var BOT_NAME = "客服小A";
var DEFAULT_USER = "栗子";
// msg separator to split to multiple msg
var MSG_SEPARATOR = '\001';
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
// when DOM is ready
$(document).ready(function(){
    $('div.nano-content').scroll(function(){
        $(".content-log .has-scrollbar").scrollTop($('div.nano-content').scrollTop());
    })
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
    // bind clear chat on body
    $('#clear-chat').click(function(event){
        chatContainer.empty();
        $("#logbody").empty();
        //empty the third content
        $(".bot-content").empty();
    })
    // create hello event from bot when page is loaded
    var helloMsg = generateHelloMsg(userName);
    var errorMsg = generateErrorMsg(userName);
    chatContainer.append(answerFromBot(helloMsg, BOT_NAME));
    // binding click call back fucntion
    $("button[type='submit']").click(function(event){
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
        var content = answerFromCustomer(userMsg, userName);
        appendContent(content);
        // trigger to wait bot msg
        waitBotResponse(userMsg);
        //append userMsg2   修改部分还加了个id logbody
        $("#logbody").append('<div class="userMsgs" style="padding:15px;"></div>')
        //给一个定位和对话位置匹配
        $("#logbody .userMsgs").last().css({"height":$('.speech-right').last().height(),"position":"absolute","top":$('.speech-right').last()[0].offsetTop});

        $("#logbody .userMsgs").last().append('<div class="aa">User内容：</div>');
        $("#logbody .userMsgs").last().append('<div class="userMsglist"></div>');
        $("#logbody .userMsgs").last().find(".aa").html("User内容是："+userMsg);
        $("#logbody .userMsgs").last().append('<span class="user-request canname"><!--request+price(category=面膜)--></span>');
        $("#logbody .userMsgs").last().append('<span class="alter-btn modify cc" onclick="change(this)">修改</span>');
        $("#logbody").append('<div style="clear:both;"></div>');

        //append botconversation
        var botHtml='<div class="bot-conversation" style="padding:0;">'+
            '<div class="bb">Bot内容：</div>'+
            '<div>'+
            '<div>'+
            '<span>1.NLG是否合适</span>'+
            '<button type="button" class="btn btn-success">是</button>'+
            '<button type="button" class="btn btn-danger">否</button>'+
            '</div>'+
            '<input type="text" placeholder="请输入理想的回复或建议"/>'+
            '<div>'+
            '<div>2.Act内容识别显示： </div>'+
            '<span class="bot-act canname" ></span>'+
            '<span class="alter-btn modify dd" onclick="change(this)">修改</span>'+
            '<span class="alter-btn bttn">X</span>'+
            '</div>'+
            '</div>'+
            '</div>';
        $("#logbody .userMsgs").last().append(botHtml);
        //给bot对话定位\
        // $("#logbody .bot-conversation").last().css({"height":$('.speech-left2').last().height(),"position":"absolute","top":$('.speech-left2').last()[0].offsetTop})
        $("#logbody").append('<div style="clear:both;"></div>')
       /* $('.bot-content').scrollTop( $('.bot-content')[0].scrollHeight );*/

        // avoid fresh
        return false;
    });

    // function to append content
    var appendContent = function(/*string of html tag*/content){
        chatContainer.append(content);
        scrolled=scrolled+300;
        // scroll to bottom
        scrollContainer.animate({scrollTop: scrolled}, 1000);
        return true;
    };
    // function to wait for bot response
    var waitBotResponse = function (/*String*/userMsg){
        // encode url, need to encode twice because use the php proxy
        var requestURL = 'http://192.168.2.197:8081/cu?UniqueID=123&UserID=100&robot=proactive&Text1=' + encodeURIComponent(userMsg);
        var url ='proxy.php?url=' + encodeURIComponent(requestURL);
        // ajax get response
        $.ajax({
            url: url,
            dataType:"json",
            type: 'GET',
            error: function(event){
                console.log(event);
                // create error msg from bot
                var content = answerFromBot(errorMsg, BOT_NAME);
                appendContent(content);
                $("#logbody .bot-conversation").last().css({"height":$('.speech-left2').last().height(),"position":"absolute","top":$('.speech-left2').last()[0].offsetTop})
            },
            success: function (data) {
                // decode and convert data to JSON
                var result = JSON.parse(decodeURIComponent(escape(data)));
                var memory = result.memory;
                // whether bot has sent response
                var hasResponse = false;
                // if memory is not undefined
                if(memory !== void 0){
                    $.each(memory, function(i, memoryFeature){
                        // get proactive
                        if(memoryFeature.type == 'proactive'){
                            // get answer
                            var answer = memoryFeature.candidateAnswer;
                            // split answer
                            var answerArray = answer.split(MSG_SEPARATOR);
                            // response the first msg
                            var content = answerFromBot(answerArray[0], BOT_NAME);
                            hasResponse = appendContent(content);
                            console.log(answer);
                            $(".bb").last().text("Bot内容："+answer);
                           /* $(".bot-act").last().text();*/
                            // delay to append other msg
                            if(answerArray.length >= 2){
                                // index to get msg
                                var index = 1;
                                // delay to show other msg
                                var deplyMsg = function(/*intervalID*/intervalID){
                                    // append msg
                                    if(index < answerArray.length){
                                        var content = answerFromBot(answerArray[index], BOT_NAME);
                                        appendContent(content);

                                        index ++;

                                    }else{
                                        // clear interval
                                        window.clearInterval(intervalID);
                                    }
                                };
                                // delay to append other information
                                var intervalID = window.setInterval(function(){
                                    deplyMsg(intervalID);}, 700);
                            }
                            return false;
                        }
                    });
                }
                // if bot has no response
                if(!hasResponse){
                    // create error msg from bot
                    var content = answerFromBot(errorMsg, BOT_NAME);
                    appendContent(content);
                }
            }
        });
        var requestURL1 ='http://192.168.2.211:9500/nlu?text='+ encodeURIComponent(userMsg);
        var url1 ='proxy.php?url=' + encodeURIComponent(requestURL1);
        $.ajax({
            url:url1,
            type:"GET",
            dataType:'json',
            success:function(data){
                var result1 = JSON.parse(decodeURIComponent(escape(data)));
                console.log(result1.act);
                $(".user-request").text(result1.act);
            }
        });
    };
    //user conversation start


    //user conversation end
});
// assembe html tag for bot answer
function answerFromBot(/* string msg to sentd*/msg, /* bot name */botName){
    // get current date
    var now = new Date();
    var time = formatAMPM(now);
    var msgHtml = '<li class="mar-btm"><div class="media-left"><img src="img/avatar1.jpg" class="img-circle img-sm" alt="Profile Picture">'
        + '</div> <div class="media-body pad-hor speech-left2"><div class="speech"><a href="#" class="media-heading">'
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
    return 'Hello ' + userName + ampm + '好啊，我能为你做些什么呢？';
};
// generate error msg
function generateErrorMsg(/*String*/userName){
    return '对不起' + userName + '，我刚刚掉线了^-^';
};
var prevalue,lock="open";
function change(obj){
    var xg=$(obj).html();
    if(xg=="修改") {
        if(lock=="open"){
            prevalue=$(obj).siblings(".user-request").html();
            lock="close";
        }
        
        $canname=$(obj).parent("div").children(".canname");
        var old=$canname.text();
        $canname.html("<input type='text' name='editname' class='text' value="+old+">");
        $(obj).html("保存");
    }else if(xg=="保存"){


        $input=$(obj).siblings(".canname").children("input[name=editname]");
        var newtxt=$input.val();

        $input.parent("span").text(newtxt);
        $(obj).text('修改');
        console.log(prevalue)
        console.log(newtxt)
        if(newtxt==prevalue){

        }else{
            console.log($(".request").last()[0]);
            $(".request").last().html(prevalue);
            $(".request-alter").last().html(newtxt);
        }
    }

}
