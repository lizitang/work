$(function(){
	// localStorage.clear();
	var saveData = localStorage.valueOf()
	var tableHead = ['序号','状态','详情','标注结果'];
	var addLabel = [];
	
	//生成表头
	for(item in tableHead){
		$("thead tr").append('<th>'+tableHead[item]+'</th>')
	}
	function creatTable(tableHead,bodyData,saveData){
	 	var reg = /^\d{5}/;
	 	var reg0 = /^[0\:]/;
	 	var reg1 = /^[1\:]/;
	 	var serialNumber = [];
	 	var n = -1;
	 	var content=[];
	 	var m = 0;
	 	for(var line = 0; line < bodyData.length; line++){
		 	if(reg.test(bodyData[line])){
		 		m = 0;
		 		serialNumber.push(bodyData[line])
		 		n++;
		 		content[n] =[]
		 	}else{}
		 	content[n][m] = bodyData[line]
	 		m++
	 	  console.log(bodyData[line]);
	 	}
	 	console.log(content);
		//生成tbody
		for(var i = 0 ;i<serialNumber.length;i++){
			$("tbody").append('<tr>')
			for(item in tableHead){
				if(tableHead[item] == '详情'){
					$("tbody tr").last().append('<td><button class = "detail btn btn-xs">'+tableHead[item]+'</button></td>')
				}else if(tableHead[item] == '序号'){
					$("tbody tr").last().append('<td>'+serialNumber[i]+'</td>')
				}else if(tableHead[item] == '状态'){
					$("tbody tr").last().append('<td class="marked">'+'未标注'+'</td>')
				}else{
					$("tbody tr").last().append('<td class= "result">')
				}
			}
			$("tbody").append('<tr style="display:none;">')
			var tdHtml='<td colspan = "4" style="padding:10px 30px;">'+
						'<div style = "width:70%;overflow:hidden;" class = "contentBox">'+
						'</div>'+
						'<div style="float:right;">'+
	            			'<span  class="badge sav" style="margin-left:5px;">保存<span>'+
	            		'</div>'+
						'<div class="labels" style="float:right;">'+
							'<select class="first_level" name="first_level" data-live-search="false">'+
		                        // '<option value="">请选择一级标注</option>'+
		                    '</select>'+
		                    '<select class="second_level" name="second_level" data-live-search="false">'+
		                        // '<option value="">请选择二级标注</option>'+
		                    '</select>'+
						'</div>'+
						
	            	'</td>';
	       
	        $("tbody tr").last().append(tdHtml);

			//一级标注菜单
			console.log(data_json);
				var nn = 0;
			var keys=Object.keys(data_json);
			for (var index in keys) {
				var key = keys[index];
				$($(".first_level")[i]).append('<option value='+key+'>'+key+'</option>');
				$($(".second_level")[i]).append('<option value='+data_json['1级'][nn]+'>'+data_json['1级'][nn]+'</option>');
				nn++;
			}
		 	for(var line = 0; line < content[i].length; line++){
			 	if(reg0.test(content[i][line])){
			 		$(".contentBox").last().append('<div style = "overflow:hidden;"><div class = "dialog" style="float:left;width:auto;max-width:80%;padding:5px;background-color:#eee;border-radius:5px;margin:3px 0;">'+content[i][line]+'</div></div>')
			 	}else if(reg1.test(content[i][line])){
			 		$(".contentBox").last().append('<div style = "overflow:hidden;"><div class = "dialog" style="float:right;width:auto;max-width:80%;padding:5px;background-color:#b5f396;border-radius:5px;margin:3px 0;">'+content[i][line]+'</div></div>')
			 	}else{}
		 	}
		 	console.log(saveData)
		 	$.each(saveData,function(idx,obj){
		 		var objA = JSON.parse(obj)
		 		if(idx == serialNumber[i]){
		 			for(var j = 0;j<objA.length;j++){
		 				$($(".result")[i]).append('<span class="label label-info" >'+objA[j]+' '+'<span class="glyphicon glyphicon-remove" aria-hidden="true"></span></span>')
		 			}
		 			if(obj!="[]"){
		 				$($(".marked")[i]).html('已标注')
		 			}
		 			var child=$($(".result")[i]).children();
		 			var rChild=$($(".result")[i]).parent().next().children().children().eq(2).children();
		 			console.log($(rChild[0]).html());
		 			var con;
		 			for(var m=0;m<child.length;m++){
		 				con=$(child[m]).html();
		 				console.log(con);
		 				if(con == "Danger"|| con=="Warning"||con == "Info"||con == "Success"){
		 					
		 					for(var k=0;k<rChild.length;k++){
		 						if($(rChild[k]).html() == con){
		 							$(rChild[k]).addClass('active')
		 						}
		 						
		 					}
		 				}
		 			}
		 		}
		 	})
		}
		// $(".dialog").setSelectionRange(0, 2);
		// $(".dialog").focus();
	}
 	document.getElementById('file').onchange = function(){

 	  var file = this.files[0];
 	  var reader = new FileReader();
 	  // reader.readAsText(file, encoding);
 	  reader.onload = function(progressEvent){
 	    // Entire file
 	    // console.log(this.result);

 	    // By lines
 	    var lines = this.result.split('\n');
 	    $.each(lines,function(idx,obj){
 	    	lines[idx] = obj.replace(/[\r\n]/g, "")
 	    })
 	  	creatTable(tableHead,lines,saveData);
		//二级标注菜单
		$(".first_level").change(function(){
            var now_level=$(this).val();
            $(this).next().empty()
            for(var index in data_json[now_level])
            { 
               var row = data_json[now_level][index];
               console.log(row);
               $(this).next().append('<option value="">'+row+'</option>');
            }
        });
 	  	$(".labels").on("click",'.label',function(){
 	  		change($(this));
	  		})
	 	  $(".contentBox").mouseup(function(){
	 	  	TextHighlight();
	 	  	// var aaa = window.getSelection()
	 	  	// alert(aaa)
	 	  })
 	  };
 	  reader.readAsText(file,'gb2312');
 	};
	
	//绑定详情点击事件
	$(document).on("click",'.detail',function(){
		$(this).parent().parent().next().fadeToggle()
	})
	var markArray = [];
	$(document).on("click",'.sav',function(){
		markArray = []
		var aa=$(this).parent().parent().parent().prev().find("td").last().children()
		var keyNumber = $(this).parent().parent().parent().prev().find("td").first().html()
		$.each(aa,function(idx,obj){
			markArray.push(obj.innerHTML)
		})
		localStorage.setItem(keyNumber,JSON.stringify(markArray));
		var read=JSON.parse(localStorage.getItem(keyNumber));
		console.log(read);
		$(this).parent().parent().parent().prev().children().eq(1).html("已标注");
	})
	function change(obj){
		var context=$(obj).prop("outerHTML");
		var result=$(obj).parent().parent().parent().prev().children().eq(3);

		$(obj).toggleClass("active");
		var contents=$(obj).html();
		if($(obj).hasClass('active')){
			result.append(context);

		}else{
			var pro=$(obj).parent().parent().parent().prev().children().eq(3).children();
			for(var i=0;i<pro.length;i++){
				console.log(pro[i]);
				if($(pro[i]).html() == contents){
					pro[i].remove();
				}
			}
		}
	}
	var idTmr;  
    function  getExplorer() {  
        var explorer = window.navigator.userAgent ;  
        //ie  
        if (explorer.indexOf("MSIE") >= 0) {  
            return 'ie';  
        }  
        //firefox  
        else if (explorer.indexOf("Firefox") >= 0) {  
            return 'Firefox';  
        }  
        //Chrome  
        else if(explorer.indexOf("Chrome") >= 0){  
            return 'Chrome';  
        }  
        //Opera  
        else if(explorer.indexOf("Opera") >= 0){  
            return 'Opera';  
        }  
        //Safari  
        else if(explorer.indexOf("Safari") >= 0){  
            return 'Safari';  
        }  
    } 
	function method5(tableid) {  
        if(getExplorer()=='ie')  
        {  
            var curTbl = document.getElementById(tableid);  
            var oXL = new ActiveXObject("Excel.Application");  
            var oWB = oXL.Workbooks.Add();  
            var xlsheet = oWB.Worksheets(1);  
            var sel = document.body.createTextRange();  
            sel.moveToElementText(curTbl);  
            sel.select();  
            sel.execCommand("Copy");  
            xlsheet.Paste();  
            oXL.Visible = true;  

            try {  
                var fname = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");  
            } catch (e) {  
                print("Nested catch caught " + e);  
            } finally {  
                oWB.SaveAs(fname);  
                oWB.Close(savechanges = false);  
                oXL.Quit();  
                oXL = null;  
                idTmr = window.setInterval("Cleanup();", 1);  
            }  

        }  
        else  
        {  
            tableToExcel(tableid)  
        }  
    }  
    $("#excl").click(function(){
    	method5("table")
    	// localStorage.clear();
    })
    function Cleanup() {  
        window.clearInterval(idTmr);  
        CollectGarbage();  
    }  
    var tableToExcel = (function() {  
        var uri = 'data:application/vnd.ms-excel;base64,',  
                template = '<html><head><meta charset="UTF-8"></head><body><table>{table}</table></body></html>',  
                base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) },  
                format = function(s, c) {  
                    return s.replace(/{(\w+)}/g,  
                            function(m, p) { return c[p]; }) }  
        return function(table, name) {  
            if (!table.nodeType) table = document.getElementById(table)  
            var printContent = table.innerHTML.replace('style="display:none;"',"").replace('class="label label-info"','style = "display:none;"').replace('class="badge sav"','style = "display:none;"')
            var ctx = {worksheet: name || 'Worksheet', table: printContent}  
        	console.log(printContent)
            // window.location.href = uri + base64(format(template, ctx))  
        }  
    })()
    function init()
    {
        var div = document.getElementById("myDiv");
        div.oncontextmenu = function(event)
        {
            //屏蔽掉浏览器本身的右键菜单
　　　　　　　　  //如果存在方法event.preventDefault()，直接调用就行
　　　　　　　　　　event.preventDefault()
            // event.returnValue = false;
            //设置右键菜单的位置以及显示出来
            var menu = document.getElementById("myMenu");
            menu.style.left = event.clientX + "px";
            menu.style.top = event.clientY + "px";
            menu.style.visibility = "visible";
        }
        document.onclick = function(event)
        {
            //当左键点击的时候隐藏右键菜单
            document.getElementById("myMenu").style.visibility = "hidden";
        }
    }
    init();
});