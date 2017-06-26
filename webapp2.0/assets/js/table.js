$(function(){
  var heads = ["编号","标准问题","答案","标签","操作"]
  var widthclass = ["col-sm-1","col-sm-2","col-sm-5","col-sm-2","col-sm-2"]
  var results;
  var tableArea=$('.table-responsive');
  var table;
 
  // var currentpage = 1,totalsq=123,perpagesq = 10,totalpage = parseInt(Math.ceil(totalsq/perpagesq));
  $.ajax({
     type: "GET",
     url: "http://192.168.2.89:8080/operation-tool/rest/faq/query?page_num=1&page_size=5",
     data: {},
     dataType: "json",
     success: function(data){
                results=data.faqs;
                table=createTable(results,heads,widthclass);
                tableArea.append(table);
                var lastHtml='<td>'+
                              '<span style="" class="badge cance">取消</span>'+
                            '<span style="" class="badge sav">保存</span>'+
                            '<span style="" class="badge ad">添加</span>'+
                            '</td>';
                $('tbody tr').append(lastHtml);
                creatPage(data.pages,data.pageSize,data.totalRows,data.currentPage)
              }
  });
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
    $("input[type='text']").bind('keypress', function(e) {
        if(e.keyCode==13){
            // trigger button submit
            $(this).trigger('blur');
        }
    });
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

  //分页函数
  function creatPage(totalpage,perpagesq,totalsq,currentpage){
    //点击分页数字
    $(".pn").off("click").on("click",function(){
      if(!$(this).hasClass('disabled')){
        $(".pn").removeClass('active');
        $(this).addClass('active');
        currentpage = parseInt($(this).find("a").html())
        $.ajax({
           type: "GET",
           url: "http://192.168.2.89:8080/operation-tool/rest/faq/query",
           data: {
            page_num:currentpage,
            page_size:5
           },
           dataType: "json",
           success: function(data){
                       console.log(data)
                       results=data.faqs;
                       table=createTable(results,heads,widthclass);
                       tableArea.append(table);
                       var lastHtml='<td>'+
                                     '<span style="" class="badge cance">取消</span>'+
                                   '<span style="" class="badge sav">保存</span>'+
                                   '<span style="" class="badge ad">添加</span>'+
                                   '</td>';
                       $('tbody tr').append(lastHtml);
                       creatPage(data.pages,data.pageSize,data.totalRows,data.currentPage)
                    }
        });
      }else{
        return false;
      }
    })
    //点击左跳十页
    $(".left").off("click").on("click",function(){
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
        if(totalpage-currentpage>=10){
          $(".right").removeClass("disabled")
          $(".pn").removeClass("disabled")
        }
        $.ajax({
           type: "GET",
           url: "http://192.168.2.89:8080/operation-tool/rest/faq/query",
           data: {
            page_num:currentpage,
            page_size:5
           },
           dataType: "json",
           success: function(data){
                       console.log(data)
                       results=data.faqs;
                       table=createTable(results,heads,widthclass);
                       tableArea.append(table);
                       var lastHtml='<td>'+
                                     '<span style="" class="badge cance">取消</span>'+
                                   '<span style="" class="badge sav">保存</span>'+
                                   '<span style="" class="badge ad">添加</span>'+
                                   '</td>';
                       $('tbody tr').append(lastHtml);
                       creatPage(data.pages,data.pageSize,data.totalRows,data.currentPage)
                    }
        });
      }else{
        return false;
      }
    })
    //点击右跳十页
    $(".right").off("click").on("click",function(){
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
        if(totalpage-currentpage<(totalpage%10)){
          $(".right").addClass("disabled")
          if(currentpage>totalpage){
           currentpage = totalpage
            $(".pn").removeClass("active")
            $($(".pn")[(totalpage%10)-1]).addClass('active')
          }
          $.each($(".pn"),function(index,val){
            if((index+1)>(totalpage%10)){
              $(val).addClass("disabled")
            }
          })
        }
        $.ajax({
           type: "GET",
           url: "http://192.168.2.89:8080/operation-tool/rest/faq/query",
           data: {
            page_num:currentpage,
            page_size:5
           },
           dataType: "json",
           success: function(data){
                       console.log(data)
                       results=data.faqs;
                                       table=createTable(results,heads,widthclass);
                                       tableArea.append(table);
                                       var lastHtml='<td>'+
                                                     '<span style="" class="badge cance">取消</span>'+
                                                   '<span style="" class="badge sav">保存</span>'+
                                                   '<span style="" class="badge ad">添加</span>'+
                                                   '</td>';
                                       $('tbody tr').append(lastHtml);
                       creatPage(data.pages,data.pageSize,data.totalRows,data.currentPage)
                    }
        });
      }else{
        return false;
      }
    })
  }
  
  $('#queryBtn').on('click',function(){
  	var text=$("input[name='max_score']")
  		$.ajax({
  			type: 'GET',
  			url: "http://192.168.2.89:8080/operation-tool/rest/faq/query?tags=信用卡,借记卡&operator=and&page_num=1&page_size=5",
  			dataType:"json",
  			success:function(data){
  				console.log(data);
  			}
  			
  			
  		})
  })
    function createTable(resultArray,heads,widthclass){
      tableArea.empty()
      table=$('<table>');
      table.addClass('table table-striped');
      var thead=$('<thead>');
      var tbody = $('<tbody>');
      var tr = $('<tr>');
      thead.append(tr)
      for(var index in heads){
        var head=heads[index];
        var th=$('<th>');
        th.addClass(widthclass[index]);
        th.text(head);
        tr.append(th);
      }
      
      // create table rows
        
      for (var idx in resultArray) {
          var tr = $('<tr>');
          for(var i in resultArray[idx]){
              var td = $('<td>');
              if(i == 'tags'){
                 var span='<span class="badge"> '+resultArray[idx][i]+'<i class="glyphicon glyphicon-remove-circle labe">'+
                 '</i>'+
                 '</span>';
                 td.append(span);
              }else{
                td.text(resultArray[idx][i]);
              }
              
              tr.append(td);
          }
          
          tbody.append(tr);
      }
      
      table.append(thead);
      table.append(tbody);
      return table;
    }
});
//http://192.168.2.89:8080/operation-tool/rest/faq/query?tags=信用卡,借记卡&operator=and&page_num=1&page_size=5