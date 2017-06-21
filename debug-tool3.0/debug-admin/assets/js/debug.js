// color type
type = ['','info','success','warning','danger'];
// action config
actionConfig = {};

var eValueArry = [];
var data0;

function toArray(str)  
{  
  var list = str.split("\n");  
  var myStr = "{";  
  for(var i=0;i<list.length;i++)  
  {  
    try{  
      var keys = list[i].split("=");  
      var key = Trim(keys[0]);   
      var value= Trim(keys[1]);  
      if(i>0)  
      {  
        myStr += ",";  
      }  
      myStr += "\""+key+"\":\""+value+"\"";  
    }catch(e)  
    {  
      continue;  
    }  
  }  
  myStr += "}";  
  return myStr;  
}  
function transText(str) {
		const titleArr = str.match(/\[\w+\]/g)
		.map(el => el.slice(1, -1))//分割出头部
		const kvArr = str.split(/\n?\[\w+\]\n?/)
		.filter(el => el.length)
		.map(el => el.split('\n'))
		
		return titleArr.reduce((prev, name, idx) => {
		return Object.assign(prev, {
		[name]: kvArr[idx].reduce((prev, el) => {
		const [key, val] = el.split(/\s?=\s?/)

		return Object.assign(prev, {
			[key]: val
		})
}, {})
})
}, {})
}


//替换掉字符串中头尾的空格  
function Trim(str){    
    return str.replace(/(^\s*)|(\s*$)/g, "");    
}   
debugTool = {
	// color picker
    initPickColor: function(){
        $('.pick-class-label').click(function(){
            var new_class = $(this).attr('new-class');
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if(display_div.length) {
            var display_buttons = display_div.find('.btn');
            display_buttons.removeClass(old_class);
            display_buttons.addClass(new_class);
            display_div.attr('data-class', new_class);
            }
        });
    },
	// initial demo chart
    initChartist: function(){
        var dataPreferences = {
            series: [
                [25, 30, 20, 25]
            ]
        };
        var optionsPreferences = {
            donut: true,
            donutWidth: 40,
            startAngle: 0,
            total: 100,
            showLabel: false,
            axisX: {
                showGrid: false
            }
        };
        
        Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);

        Chartist.Pie('#chartPreferences', {
          labels: ['5%','32%','62%', '1%'],
          series: [5, 32, 62, 1]
        });
    }, 
    // init button control, both debug button and result option button
    initBtns: function(){
    		// load action config
    		$.ajax({
    			type:"get",
      			url:"http://localhost:5000/rest/config/get",
//  			url:"rest/config/get",
    			contentType:"application/json",
    			dataType:"json",
    			async:true
    		}).success(function(data){
    			if(data.config != void 0){
    				// show config
    				var actionEdits = $('div.stats').children('a');
    				$.each(actionEdits, function(index, e) {
	    				//get data
	    				var editE = $(e);
	    				var source = editE.data('source');
	    				var eValue = "";
	    				if(source == 'segment'){
	    					eValue = convertDicToStr(data.config.segment);
	    				}else if(source == 'solr'){
	    					eValue = convertDicToStr(data.config.solr);
	    				}else if(source == 'ranker'){
	    					var keys = Object.keys(data.config);
	    					
	    					$.each(keys, function(index, key) {
	    						// not segment and solr
	    						if(key != 'segment' && key != 'solr'){
	    							var dic = data.config[key];
	    							eValue += '[' + key + ']\n';
	    							eValue += convertDicToStr(dic);	
	    						}
	    					});
	    				}else if(source == 'summary'){
	    					var keys = Object.keys(data.config);
	    					$.each(keys, function(index, key) {
	    						// not segment and solr
	    						if(key != 'segment' && key != 'solr'){
	    							var dic = data.config[key];
	    							// has score weight
	    							if(dic['scoreweight'] != void 0){
	    								eValue += '[' + key + ']\n';
	    								eValue += 'scoreweight = ' + dic['scoreweight'] + '\n';
	    							}		
	    						}
	    					});
	    				}
	    				eValueArry.push(eValue)
	    				$(".modal-body textarea")[index].value=eValue
	    				$(".stats")[index].index=index
	    				$(".btn-success")[index].index=index
    				});
    				$(".stats").unbind("click").click(function(){
    					$($(".mymodal2")[this.index]).show();
    					$($(".modal-dialog2")[this.index]).show();
    				});
    				$(".btn-danger").unbind("click").click(function(){
    					$(".mymodal2").hide();
    					$(".modal-dialog2").hide();
    				});
    				$(".btn-success").unbind("click").click(function(){
    					if((this.index==0) && ($(".modal-body textarea")[0].value!=eValueArry[0])){
    						data0 = "{"+"\"config\":"+"{"+"\"segment\":"+Trim(toArray($(".modal-body textarea")[0].value))+"}"+"}";
    					}
    					else if((this.index==1) && ($(".modal-body textarea")[1].value!=eValueArry[1])){
    						data0 = "{"+"\"config\":"+"{"+"\"solr\":"+Trim(toArray($(".modal-body textarea")[1].value))+"}"+"}";
    					}
    					else if((this.index==2) && ($(".modal-body textarea")[2].value!=eValueArry[2])){
    						data0 = "{"+"\"config\":"+JSON.stringify(transText($(".modal-body textarea")[2].value))+"}";
    					}
    					else if((this.index==3) && ($(".modal-body textarea")[3].value!=eValueArry[3])){
    						data0 ="{"+"\"config\":"+ JSON.stringify(transText($(".modal-body textarea")[3].value))+"}";
    					}
    					console.log(data0);
    					$(".mymodal2").hide();
    					$(".modal-dialog2").hide();
    					$.ajax({
    						type:"post",
    						url:"http://localhost:5000/rest/config/all/update",
    						contentType:"application/json",
    						dataType:"json",
    						data:data0
    					})
    				});
    			}
    		});
    		//click plus button,appear input box
    		$("#plusBtn").on("click",function(){
    			var oInput='<div class="input-group" style="width:100%;border:1px solid rgba(0,0,0,0.3);margin-bottom:5px;">'+
									      	'<input type="text" class="form-control plus" style="width:100%;" placeholder="Search for..." ">'+
									      	'<span class="input-group-addon" ><i class="ti-close" style="color:#9a9696;"></i></span>'+
									    '</div>';
    			$(".row:first .inputList").append(oInput);
    			$(".ti-close").on("click",function(){
    				$(this).parent().parent("div").hide();
    			});
    		});
    		$(".test").on("click",function(){
    				$(".test").toggleClass("active");
    				$(".inputList").toggle();
    		})
    		
    		// button to execute query
    		$('#debugBtn').on('click', function(e){
    				
    			//取消事件的默认行为
    			e.preventDefault();
    			// show wait
    			$('#pleaseWaitDialog').modal('show');
    			// get input value
    			var sentence = $(this).closest('div.input-group').children("input:first").val();
    			var inputArray=[];
    			var standardSentence=$(".standardQuery").val();
    			var inputSentence=$(".inputList").html();
    			console.log(sentence);
    			console.log(standardSentence);
    			console.log(inputSentence=='');
    			if (sentence == void 0 || sentence == "") {
    				var msg = "Debug内容不能为空！";
    				debugTool.showNotification(4,msg,'top','center');
    			} else{
    				//判断是否有多个input搜索框，没有就get方式，有就post方式
    				if(inputSentence == ""){
		            $.ajax({
		                type:"get",
		                url:"http://localhost:5000/rest/debug/trace",
		//  						url:"rest/debug/trace",
		                contentType:"application/json",
		                dataType:"json",
		                async:true,
		                data:{
		                    text:sentence
		                }
		            }).success(function(data){
		                var results = data.result;
		                if(results != void 0){
		                    var times = {};
		                    var totals = 0;
		                    var actionResult = {};
		                    for (var index in results) {
		                        var result = results[index];
		                        // get action name
		                        var name = result.name;
		                        // get start time and end time
		                        var end = result.end
		                        var start = result.start
		                        var cost = end -start;
		                        times[name] = cost;
		                        totals += cost;
		                        //
		                        if(name == 'segment'){
		                            if(result.result != void 0
		                                && result.result[0].segment != void 0
		                                && result.result[0].segment instanceof Array){
		                                actionResult['segment'] = result.result[0].segment;
		                            }
		                        }else if(name == 'solr'){
		                            if(result.result.response != void 0
		                                && result.result.response.docs != void 0
		                                && result.result.response.docs instanceof Array){
		                                actionResult['solr'] = result.result.response.docs;
		                            }
		                        }else if(name == 'ranker'){
		                            if(result.result != void 0
		                                && result.result instanceof Array){
		                                actionResult['ranker'] = result.result;
		                            }
		                        }else if(name == 'summary'){
		                            if(result.result != void 0
		                                && result.result instanceof Array){
		                                actionResult['summary'] = result.result;
		                            }
		                        }
		                    }
		                    var timeArray = [];
		                    var segmentTime = (times.segment != void 0)? times.segment:-1;
		                    var solrTime = (times.solr != void 0)? times.solr:-1;
		                    var rankTime = (times.ranker != void 0)? times.ranker:-1;
		                    var summaryTime = (times.summary != void 0)? times.summary:-1;
		                    timeArray.push(segmentTime);
		                    timeArray.push(solrTime);
		                    timeArray.push(rankTime);
		                    timeArray.push(summaryTime);
		                    // refresh action card
		                    debugTool.refreshActionCards(timeArray);
		                    // refresh chart
		                    debugTool.refreshChartist(timeArray, totals);
		                    // refresh tables
		                    debugTool.refreshTable(actionResult);
		                    var arr = [];
		                    $("#summarytable tbody tr").each(function(){
		                        var td = $(this).find("td");
		                        arr.push(td.eq(0).text())
		                    })
		                    for(var i=0;i<arr.length;i++){
		                        if(standardSentence == arr[i]){
		                            var index=i;
		                            $("#summarytable tbody tr").eq(index).css("background","#8ef3c5");
		                            return false;
		                        }else{
		                            var message="not fonud!";
		                            debugTool.showNotification(4,message,'top','center');
		                            return false;
		                        }
		                    }
		
							/*$("#summarytable").find("td:first").each(function(i) {
							 var t = $(this).text();
							 console.log(t);
							 })*/
		                }
		            }).error(function(xhr, status, error){
		                debugTool.showNotification(4, xhr.statusText,'top','center');
		            }).always(function(){
		                $('#pleaseWaitDialog').modal('hide');
		            });
    		}else{
    			 
    				var arr0=[];
    				$(".inputList input").each(function(){
    					  
                var inputVal= $(this).val();
                arr0.push(inputVal);
            })
    				console.log(arr0);
    				var data0={
                    text:sentence,
                    extended:arr0
               };
             var data1=JSON.stringify(data0);  
            $.ajax({
                type:"post",
                url:"http://127.0.0.1:5000/rest/debug/trace",
								//url:"rest/debug/trace",
                contentType:"application/json",
               	dataType:"json",
                async:true,
                data:data1
            }).success(function(data){
                var results = data.result;
                if(results != void 0){
                    var times = {};
                    var totals = 0;
                    var actionResult = {};
                    for (var index in results) {
                        var result = results[index];
                        // get action name
                        var name = result.name;
                        // get start time and end time
                        var end = result.end
                        var start = result.start
                        var cost = end -start;
                        times[name] = cost;
                        totals += cost;
                        //
                        if(name == 'segment'){
                            if(result.result != void 0
                                && result.result[0].segment != void 0
                                && result.result[0].segment instanceof Array){
                                actionResult['segment'] = result.result[0].segment;
                            }
                        }else if(name == 'solr'){
                            if(result.result.response != void 0
                                && result.result.response.docs != void 0
                                && result.result.response.docs instanceof Array){
                                actionResult['solr'] = result.result.response.docs;
                            }
                        }else if(name == 'ranker'){
                            if(result.result != void 0
                                && result.result instanceof Array){
                                actionResult['ranker'] = result.result;
                            }
                        }else if(name == 'summary'){
                            if(result.result != void 0
                                && result.result instanceof Array){
                                actionResult['summary'] = result.result;
                            }
                        }
                    }
                    var timeArray = [];
                    var segmentTime = (times.segment != void 0)? times.segment:-1;
                    var solrTime = (times.solr != void 0)? times.solr:-1;
                    var rankTime = (times.ranker != void 0)? times.ranker:-1;
                    var summaryTime = (times.summary != void 0)? times.summary:-1;
                    timeArray.push(segmentTime);
                    timeArray.push(solrTime);
                    timeArray.push(rankTime);
                    timeArray.push(summaryTime);
                    // refresh action card
                    debugTool.refreshActionCards(timeArray);
                    // refresh chart
                    debugTool.refreshChartist(timeArray, totals);
                    // refresh tables
                    debugTool.refreshTable(actionResult);
                    var arr = [];
                    $("#summarytable tbody tr").each(function(){
                        var td = $(this).find("td");
                        arr.push(td.eq(0).text())
                    })
                    for(var i=0;i<arr.length;i++){
                        if(standardSentence == arr[i]){
                            var index=i;
                            $("#summarytable tbody tr").eq(index).css("background","#8ef3c5");
                            return false;
                        }else{
                            var message="not fonud!";
                            debugTool.showNotification(4,message,'top','center');
                            return false;
                        }
                    }

					/*$("#summarytable").find("td:first").each(function(i) {
					 var t = $(this).text();
					 console.log(t);
					 })*/
                }
            }).error(function(xhr, status, error){
                debugTool.showNotification(4, xhr.statusText,'top','center');
            }).always(function(){
                $('#pleaseWaitDialog').modal('hide');
            });
					}

    			}
    		});
    		// button to change table content
    		$('#selectResult li a').on('click', function(e){
    			var selected = $(this).parent('li');
    			var selectedResult = selected.data('result');
    			// get active content
    			var active = selected.siblings('li.active');
    			var activeResult = active.data('result');
    			// if click on the same, then ignore
    			if(activeResult != selectedResult){
    				active.removeClass('active');
    				selected.addClass('active');
    				$('#selectResultContent').text($(this).text());
    				if(selectedResult != 'all'){
    					// show only related table
    					var tableToShow = $("table[id^=" + selectedResult + "]");
    					tableToShow.removeClass('hidden');
    					tableToShow.siblings('table').addClass('hidden');
    				}else{
    					// show all tables
    					var tableToShow = $("table.hidden");
    					tableToShow.removeClass('hidden');
    				}
    					
    			}
    		});
    },
    // show notification
    showNotification: function(colorIndex, msg, from, align){
	    	$.notify({
	        	icon: "ti-volume",
	        	message: msg,
	        },{
	            type: type[colorIndex],
	            timer: 2000,
	            placement: {
	                from: from,
	                align: align
	            }
	        });
	},
    // refresh chart by data 
    refreshChartist: function(/* array of time cost of each step */ times, /* total times */totalTimes){
        var data = [];
        var labelData = [];
        // iterator times to assemble data
        $.each(times, function(index, time) {
        		var rate = Math.round(time/totalTimes*100);
        		data.push(rate);
        		labelData.push(String(rate).concat('%'));
        });
        // update pie chart
        Chartist.Pie('#chartPreferences', {
          labels: labelData,
          series: data
        });
        // update total time
        $('#total_time').text(totalTimes);
    },
    // refresh action card
    refreshActionCards: function(/* array of time cost of each step */ times){
    		switchActionCard(times[0], '#segment', '#segmentCard'); 
    		switchActionCard(times[1], '#solr', '#solrCard'); 
    		switchActionCard(times[2], '#rank', '#rankCard'); 
    		switchActionCard(times[3], '#summary', '#summaryCard'); 
    },
    // refresh table content
    refreshTable:function(/* JSON summary for each action */ results){
    		// clear existing table content
    		var tableArea = $('#tableArea');
    		tableArea.html("");
    		// key is action name, value is result array
    		var keys = Object.keys(results);
    		for (var index in keys) {
    			var key = keys[index];
    			var hidden = true;
    			if (key == 'summary') {
    				hidden = false;
    			}
    			var table = createTable(results[key], hidden);
    			table.attr('id', key + 'table');
    			tableArea.append(table);
    		}
    		// create data table and destory exsting
//  		$('#summaryTable').dataTable({
//		  "search": false,
//		  "destroy": true
//		});
    }
};

/**
 * switch action card status between success and fail by value
 */
function switchActionCard(/* number */value, /* string */contentId, /* string*/ cardId){
	var content = $(contentId);
	var card = $(cardId);
	if(value >= 0) {
		content.text(value);
		// if card shows error, change to success
		if(card.hasClass('icon-danger')) {
			// change card to check
			card.find('i.ti-close').removeClass('ti-close').addClass('ti-check');
			// change card to success
			card.removeClass('icon-danger').addClass('icon-success');
		}
	} else {
		content.text('0');
		// if card shows success, change to error
		if(card.hasClass('icon-success')) {
			// change card to close
			card.find('i.ti-check').removeClass('ti-check').addClass('ti-close');
			// change card to danger
			card.removeClass('icon-success').addClass('icon-danger');
		}
	}
}

/**
 * create table element by result array 
 */
function createTable(/* Array of JSON */ resultArray, /* boolean whether to hidden */ hidden){
	var table = $('<table>');
	table.addClass('table table-striped');
	if(hidden){
		table.addClass('hidden');
	}
	var thead = $('<thead>');
	var tbody = $('<tbody>');
	// get keys create table thead
	var keys = Object.keys(resultArray[0]);
	console.log(keys);
	for (var index in keys) {
		var key = keys[index];
		var th = $('<th>');
		th.text(key);
		thead.append(th);
	}
	// create table rows
	for (var index in resultArray) {
		var row = resultArray[index];
		var tr = $('<tr>');
		for (var i in keys) {
			var key = keys[i];
			var td = $('<td>');
			td.text(row[key]);
			tr.append(td);
		}
		tbody.append(tr);
	}
	table.append(thead);
	table.append(tbody);
	return table;
}

/*
 * convert json dictionary to string format
 */
function convertDicToStr(/*JSON Dictionary*/ dic){
	var str = "";
	// get keys 
	var keys = Object.keys(dic);
	$.each(keys, function(index, key) {
		var value = dic[key];
		str += key + " = " + value + "\n";
	});
	return str;
}

