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
		            			'<span  class="badge sav" >保存<span>'+
		            		'</div>'+
							'<div class="labels" style="float:right;">'+
								'<span class="label label-info" >Success</span>'+
								'<span class="label label-info" >Info</span>'+
								'<span class="label label-info" >Warning</span>'+
								'<span class="label label-info" >Danger</span>'+
							'</div>'+
							
		            	'</td>';
			$("tbody tr").last().append(tdHtml)
		 	for(var line = 0; line < content[i].length; line++){
			 	if(reg0.test(content[i][line])){
			 		$(".contentBox").last().append('<div style = "overflow:hidden;"><div style="float:left;width:auto;max-width:80%;padding:5px;background-color:#eee;border-radius:5px;margin:3px 0;">'+content[i][line]+'</div></div>')
			 	}else if(reg1.test(content[i][line])){
			 		$(".contentBox").last().append('<div style = "overflow:hidden;"><div style="float:right;width:auto;max-width:80%;padding:5px;background-color:#eee;border-radius:5px;margin:3px 0;">'+content[i][line]+'</div></div>')
			 	}else{}
		 	}
		 	console.log(saveData)
		 	$.each(saveData,function(idx,obj){
		 		var objA = JSON.parse(obj);
		 		if(idx == serialNumber[i]){
		 			for(var j = 0;j<objA.length;j++){
		 				$($(".result")[i]).append('<span class="label label-info" >'+objA[j]+'</span>')
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
 	  	$(document).on("click",'.label',function(){
 	  		change($(this));
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

});