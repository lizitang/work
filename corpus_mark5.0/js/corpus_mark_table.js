$(function(){
	// localStorage.clear();
	var saveData = localStorage.valueOf()
		 	console.log(saveData)
		 	console.log(saveData['dialog.txt'])
	var tableHead = ['序号','状态','详情'];
	var addLabel = [];
	var keyNumber;
	var rightEle;
	var sentenceNum;
	var sign={};
	var sum=0;
	var length=0;
	var lock=true;
	var file;
	var fileName;
	var info;
	var num;
	//生成表头
	for(item in tableHead){
		$("thead tr").append('<th>'+tableHead[item]+'</th>')
	}
	function creatTable(tableHead,bodyData,saveData){
		if(saveData[fileName]!=undefined){
			saveData = JSON.parse(saveData[fileName])
			console.log(saveData)
		}
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
	 	}
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
				}
			}
			$("tbody").append('<tr style="display:none;">')
			var tdHtml='<td colspan = "4" style="padding:10px 30px;position:relative;">'+
						'<div style = "width:70%;overflow:hidden;float:left;" class = "contentBox">'+
						'</div>'+
						'<div style = "float:right;width:30%;overflow:hidden;padding:20px;" class = "showLabelbox">'+
						'</div>'+
	            	'</td>';
	       
	        $("tbody tr").last().append(tdHtml);
		 	for(var line = 0; line < content[i].length; line++){
			 	if(reg0.test(content[i][line])){
			 		$(".contentBox").last().append('<div style = "overflow:hidden;"><div class = "dialog noselect" style="float:left;width:auto;max-width:80%;padding:5px;background-color:#eee;border-radius:5px;margin:3px 0;">'+content[i][line]+'</div></div>')
			 		$(".dialog").last()[0].index=line
			 	}else if(reg1.test(content[i][line])){
			 		$(".contentBox").last().append('<div style = "overflow:hidden;"><div class = "dialog noselect" style="float:right;width:auto;max-width:80%;padding:5px;background-color:#b5f396;border-radius:5px;margin:3px 0;">'+content[i][line]+'</div></div>')
			 		$(".dialog").last()[0].index=line
			 	}else{}
		 	}
		 	//将savedata数据存入sign中再生成标注
		 	$.each(saveData,function(idx,obj){
		 		var objA = obj
		 		sign[fileName][idx]=objA
		 		console.log(sign)
		 		if(idx == serialNumber[i]){
		 			$.each(objA,function(inde,item){
		 				var yellowContent = $($($(".contentBox")[i]).find('div.dialog')[inde-1]).html()
		 				var l = yellowContent.substring(0,item.position[0])
		 				var c = '<span class="yellow">'+yellowContent.substring(item.position[0],item.position[1])+'</span>'
		 				var r = yellowContent.substring(item.position[1])
		 				var newContentt = l+c+r;
		 				$($($(".contentBox")[i]).find('div.dialog')[inde-1]).html(newContentt)
		 				$($(".showLabelbox")[i]).append('<div class = "showLabel"><span class="removeBigl glyphicon glyphicon-remove" aria-hidden="true" style = "padding:5px;float:right;"></span>第<span class = "num">'+inde+'</span>句内容及标签：<br>'+item.content+'<br></div>')
			 			for(var j = 0;j<item.markArray.length;j++){
			 				$(".showLabel").last().append('<span class="label label-info" >'+item.markArray[j]+'</span>')
			 			}
		 			})
		 		}
	 			if(obj!="[]"){
	 				$($(".marked")[i]).html('已标注')
	 			}
		 	})
		}
	}
	//////?????????????
		 	document.getElementById('mark').onchange = function(){

		 	  var markfile = this.files[0];
		 	  var reader = new FileReader();
		 	  // reader.readAsText(file, encoding);
		 	  reader.onload = function(progressEvent){
		 	    // Entire file
		 	    console.log(this.result);
		 	    console.log(JSON.parse(this.result));
		 	    // if(this.result)
		 	    //改变localstorage在刷新页面
		 	    if(fileName == undefined){
		 	    	alert("请先导入对话文件")
		 	    	return false;
		 	    }else{
		 	    	alert("重新导入对话文件即可查看标注文件内容")
		 	    	localStorage.clear();
		 	    	localStorage.setItem(fileName,JSON.stringify(JSON.parse(this.result)[fileName]));
		 	    	location.reload()
		 	    }
		 	  };
		 	  reader.readAsText(markfile,'gb2312');
		 	};
 	document.getElementById('file').onchange = function(){

 	  var file = this.files[0];
 	  var reader = new FileReader();
 	  // reader.readAsText(file, encoding);
 	  reader.onload = function(progressEvent){

 	    // Entire file
 	    // console.log(this.result);

 	    // By lines
 	    function getFileName(o){
 	        var pos=o.lastIndexOf("\\");
 	        return o.substring(pos+1);  
 	    }
 	    file = $("#file").val();
 	    fileName = getFileName(file);
		sign[fileName]={};
 	    var lines = this.result.split('\n');
 	    $.each(lines,function(idx,obj){
 	    	lines[idx] = obj.replace(/[\r\n]/g, "")
 	    })
 	  	creatTable(tableHead,lines,saveData);
		
 	  	
	 	  
		  init();
		  $(document).on('click',".tab1",function(){
		  	$(".pop-up-boxContent .contentCenter2").hide()
		  	$(".pop-up-boxContent .contentCenter").show()
		  })
		  $(document).on('click',".tab2",function(){
		  	$(".pop-up-boxContent .contentCenter").hide()
		  	$(".pop-up-boxContent .contentCenter2").show()
		  })
  		//二级标注菜单
  		$(document).on('click',".first_level li",function(){
              var now_level=$(this).html();
              var secondHead = []
              $(this).parent().parent().next().find("ul").empty()
              for(var index in data_json[now_level])
              { 
                 var row = data_json[now_level][index];
                 secondHead.push(row)
                 $(this).parent().parent().next().find("ul").append('<li>'+row+'</li>');
              }
              $(this).parent().prev().html($(this).html())
              $(this).parent().parent().next().find('button').html(secondHead[0])
          });
  			var  haslabelBox= false;
  			var  hasRepeat= false;
		  	$(document).on("click",'.second_level li',function(){
		  		var _that = $(this).text()
		  		if(!haslabelBox){
		  			$(".pop-up-boxContent .contentCenter2").append('<div class = "labelBox" style = "width:100%;overflow:auto;padding: 5px 10px;position:absolute;bottom:0;"></div>')
		  			haslabelBox = true;
		  		}else{
		  			$.each($(".labelBox").children(),function(index,item){
		  				if($(item).text()==_that){
		  					hasRepeat = true;
		  				}
		  			})
		  		}
		  		if(hasRepeat){
		  			hasRepeat= false
		  			return false;
		  		}
		  		$(".pop-up-boxContent .contentCenter2 .labelBox").append('<span class="label label-info" >'+$(this).html()+'<span class="removeL glyphicon glyphicon-remove" aria-hidden="true" style = "padding-left:5px;"></span></span>')
		  		$("#dropdownMenu2").html($(this).html())
	 		})
	 		$(document).on("click",'.removeL',function(){
		  		$(this).parent().remove()
	 		})
			//绑定详情点击事件
			$(document).on("click",'.detail',function(){
				$(this).parent().parent().next().fadeToggle()
				//高亮

				$(document).on('mouseup',".highlight",function(e){
					lock=true;
				 	$(".dialog").removeClass('noselect');
				 	$(document).on("mouseup",'.dialog',function(){
				 		if($(this).find('span.yellow').length ==0){
		            		TextHighlight();
		            	}else{
		            		return false;
		            	}
		            	length=$('.contentBox').find('span.yellow').length;
		            	if(length == sum){
		            	}else{
        			 	  	if(window.getSelection()!=""){
        		  		 	  	$(".pop-up-box").show()
        		  			  	$(".pop-up-boxContent .contentCenter").empty().show()
        		  			  	$(".pop-up-boxContent .contentCenter2").empty().hide()
        		  			  	haslabelBox= false;
        		  		 	  	$(".pop-up-boxContent .contentCenter").append("<textarea style = 'position:absolute;top:20px;left:5%;width:50%;'>"+window.getSelection()+"</textarea>")
        		  			  	var linkLabel = '<div class="labels">'+
        		  								'<div class="dropdown" style = "display:inline-block;padding:0 20px 0 0;">'+
        		  							    '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">'+
        		  							    Object.keys(data_json)[0]+
        		  							    '<span class="caret"></span>'+
        		  							    '</button>'+
        		  								'<ul class="first_level dropdown-menu" aria-labelledby="dropdownMenu1">'+
        		  			                    '</ul>'+
        		  			                    '</div>'+
        		  			                    '<div class="dropdown" style = "display:inline-block;">'+
        		  			                    '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">'+
        		  			                      data_json[Object.keys(data_json)[0]][0]+
        		  			                      '<span class="caret"></span>'+
        		  			                    '</button>'+
        		  			                    '<ul class="second_level dropdown-menu" aria-labelledby="dropdownMenu2">'+
        		  			                    '</ul>'+
        		  			                    '</div>'+
        		  								'</div>'
        		  				$(".pop-up-boxContent .contentCenter2").append(linkLabel)
        		  				//一级标注菜单
        		  				  var nn = 0;
        		  				  var keys=Object.keys(data_json);
        		  				  for (var index in keys) {
        		  				  	var key = keys[index];
        		  				  	$(".first_level").append('<li>'+key+'</li>');
        		  				  	$(".second_level").append('<li>'+data_json[keys[0]][nn]+'</li>');
        		  				  	nn++;
        		  				  }
        		  		 	  	rightEle = $(this).parent().parent()
        		  		 	  	sentenceNum = this.index
        		  		 	  }
		            		$('.dialog').addClass("noselect");
		            		sum=length;
		            	}
		        	})
			 	})
				
				

				
			})
			$(document).on("click",'.sav',function(){
	 	  		keyNumber = rightEle.parent().parent().prev().children().first().html()
	 	  		console.log(keyNumber)
	 	  		if(sign[fileName][keyNumber]!=undefined){

	 	  		}else{
	 	  			sign[fileName][keyNumber]={}
	 	  		}
				sign[fileName][keyNumber][sentenceNum] = {}
				sign[fileName][keyNumber][sentenceNum].content = $(".pop-up-boxContent .contentCenter textarea")[0].value;
				sign[fileName][keyNumber][sentenceNum].position = info;
				sign[fileName][keyNumber][sentenceNum].markArray= [];
				var aa=$('.labelBox').children()
				$.each(aa,function(idx,obj){
					sign[fileName][keyNumber][sentenceNum].markArray.push($(obj).text())
				})
				localStorage.setItem(fileName,JSON.stringify(sign[fileName]));
				var read=JSON.parse(localStorage.getItem(keyNumber));
				rightEle.parent().parent().parent().prev().children().eq(1).html("已标注");
				$.each($(".showLabel"),function(index,item){
					if($(item).find('span.num').html()==sentenceNum){
						$(item).remove()
					}
				})
				rightEle.next().append('<div class = "showLabel"><span class="removeBigl glyphicon glyphicon-remove" aria-hidden="true" style = "padding:5px;float:right;"></span>第<span class="num">'+sentenceNum+'</span>句内容及标签：<br>'+$(".pop-up-boxContent .contentCenter textarea")[0].value+'<br></div>')
				rightEle.next().find('div.showLabel').last().append($(".labelBox").children())
				$(".showLabel .removeL").remove()
				console.log(sign)
				$(".pop-up-box").hide()
			})
			$(document).on('click','.removeBigl',function(){
				keyNumber = $(this).parent().parent().parent().parent().prev().children().first().html()
				console.log(keyNumber)
				num = $(this).parent().find('span.num').html();
				// localStorage.removeItem('userinfo');
				delete sign[fileName][keyNumber][num];
				console.log(sign)
				localStorage.setItem(fileName,JSON.stringify(sign[fileName]));
				var read2=JSON.parse(localStorage.getItem(keyNumber));
				var le=$(this).parent().parent().prev().children().length;
				for(var k=0;k<le;k++){
					var that_=$(this).parent().parent().prev().find('div.dialog')[k]
					if( that_.index== num){
						var that=$(that_).find('span');
						var thatOuter=that.prop('outerHTML');
						thatText = thatOuter.replace(/<.*?>/ig,"");
						that.replaceWith(thatText);
					}
				}
				$(this).parent().remove()
			})
			$(document).on("click",'.cance',function(){
				$(".pop-up-box").hide();
				keyNumber = rightEle.parent().parent().prev().children().first().html();
				var wlen = rightEle.children().length;
				var wthat_ = rightEle.find('div.dialog')[sentenceNum-1];
				var wthat = $(wthat_).find('span');
				var wthatOuter=wthat.prop('outerHTML');
				wthatText = wthatOuter.replace(/<.*?>/ig,"");
				wthat.replaceWith(wthatText);	
				
				
			})




 	  };
 	  reader.readAsText(file,'gb2312');
 	};
	
	//高亮文字
	    function TextHighlight(obj) {
	    	if(!lock){
	    		return false;
	    	}

	    	var sel=window.getSelection();
	    	var selectText=sel.toString();//获取文字
	    	if(selectText.length>0){

		    	var anchorOffset = sel.anchorOffset;
				var	focusOffset = sel.focusOffset;	
				var span = document.createElement("span");
		        span.className = "yellow";
				sel.getRangeAt(0).surroundContents(span);
	    	}
	    	
			info=[anchorOffset,focusOffset];
			lock=false;
			return info;
	    }
	// 下载文件方法
	var funDownload = function (content, filename) {
	    var eleLink = document.createElement('a');
	    eleLink.download = filename;
	    eleLink.style.display = 'none';
	    // 字符内容转变成blob地址
	    var blob = new Blob([content]);
	    eleLink.href = URL.createObjectURL(blob);
	    // 触发点击
	    document.body.appendChild(eleLink);
	    eleLink.click();
	    // 然后移除
	    document.body.removeChild(eleLink);
	};

	if ('download' in document.createElement('a')) {
	    // 作为test.html文件下载
	    $("#excl").on('click', function () {
	        funDownload(JSON.stringify(sign), 'mark.txt');    
	    });
	} else {
	    eleButton.onclick = function () {
	        alert('浏览器不支持');    
	    };
	}
    function init(){
        $(".contentBox").contextmenu(function(event){
            //屏蔽掉浏览器本身的右键菜单
　　　　　　//如果存在方法event.preventDefault()，直接调用就行
　　　　　　event.preventDefault()
            // event.returnValue = false;
            //设置右键菜单的位置以及显示出来
            var menu = document.getElementById("myMenu");
            menu.style.left = event.clientX + "px";
            menu.style.top = event.clientY + $(document).scrollTop() + "px";
            menu.style.visibility = "visible";
        })
        document.onclick = function(event){
            //当左键点击的时候隐藏右键菜单
            document.getElementById("myMenu").style.visibility = "hidden";
        }
    }
});