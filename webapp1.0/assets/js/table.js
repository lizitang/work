$(function(){
  var head = ["标准问题","答案","标签","操作"]
  var widthclass = ["col-sm-2","col-sm-4","col-sm-4","col-sm-2"]
  var currentpage = 1,totalsq=123,perpagesq = 10,totalpage = parseInt(Math.ceil(totalsq/perpagesq));
  $.ajax({
     type: "GET",
     url: "http://192.168.2.89:8080/operation-tool/rest/faq/query?tags=%E4%BF%A1%E7%94%A8%E5%8D%A1,%E5%80%9F%E8%AE%B0%E5%8D%A1&operator=or&page_num=1&page_size=5",
     data: {},
     dataType: "json",
     success: function(data){
                 console.log(data)
              }
  });
  function creatTable(head,widthclass){
    $.each(head,function(index,val){
      $('thead tr').append('<th>');
      $("thead tr th").last().html(val);
      $("thead tr th").last().addClass(widthclass[index])
    })
  }
  creatTable(head,widthclass);
  //删除标签
  $(document).on("click",".labe",function(){
    $(this).parent().hide()
  })
  //取消保存
  $(document).on("click",".cance",function(){
    $(this).parent().prev().children().show()
  })
  //保存
  $(document).on("click",".sav",function(){
    $.each($(this).parent().prev().children(),function(index,that){
      if(that.style.display == "none"){
        console.log(index)
        that.remove()
      }
    })
  })
  //添加标签
  $(document).on("click",".ad",function(){
    $(this).parent().prev().children().last().after("<input type='text' style='margin-left:5px;padding-left:5px;' class='adding' placeholder='请输入标签名'>")
    $(".adding").focus()
  })
  //添加标签输入框失去焦点
  $(document).on("blur",".adding",function(){
    var val = $(this).val()
    var lastlabel = $(this).prev()
    $(this).remove()
    if(val){
      lastlabel.after('<span style="margin-left:5px;" class="badge">'+val+' <i class="glyphicon glyphicon-remove-circle labe"></i></span>')
    }
  })
  //分页
  //点击分页数字
  $(".pn").on("click",function(){
    if(!$(this).hasClass('disabled')){
      $(".pn").removeClass('active');
      $(this).addClass('active');
      currentpage = parseInt($(this).find("a").html())
    }else{
      return false;
    }
  })
  //点击左跳十页
  $(".left").on("click",function(){
    if(!$(".left").hasClass("disabled")){
      //重新计算当前页
      currentpage = currentpage-10;
      //每页数字变化
      $.each($(".pn a"),function(index,val){
        $(val).html(parseInt($(val).html())-10)
      })
      //添加翻页左禁止
      if(currentpage<=10){
        $(".left").addClass("disabled")
      }
      //解除右翻页禁止
      if(totalpage*10-currentpage>=10){
        $(".right").removeClass("disabled")
        $(".pn").removeClass("disabled")
      }
    }else{
      return false;
    }
  })
  //点击右跳十页
  $(".right").on("click",function(){
    if(!$(".right").hasClass("disabled")){
      //重新计算当前页
      currentpage = currentpage+10;
      //每页数字变化
      $.each($(".pn a"),function(index,val){
        $(val).html(parseInt($(val).html())+10)
      })
      //解除左翻页禁止
      if(currentpage>10){
        $(".left").removeClass("disabled")
      }
      //添加右翻页禁止
      if(totalpage*10-currentpage<10){
        $(".right").addClass("disabled")
        if(parseInt($(this).parent().children('li.active').find('a').html())>totalsq){
          $(".pn").removeClass("active")
          $($(".pn")[10-(totalpage*10-totalsq+1)]).addClass('active')
        }
        $.each($(".pn"),function(index,val){
          if((index+1)>10-(totalpage*10-totalsq)){
            $(val).addClass("disabled")
          }
        })
      }
    }else{
      return false;
    }
  })
});
//http://192.168.2.89:8080/operation-tool/rest/faq/query?tags=%E4%BF%A1%E7%94%A8%E5%8D%A1,%E5%80%9F%E8%AE%B0%E5%8D%A1&operator=and&page_num=1&page_size=5