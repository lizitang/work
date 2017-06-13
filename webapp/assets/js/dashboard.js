// color type
type = ['','info','success','warning','danger'];
// action config
actionConfig = {};

operationTool = {
	// initial data time picker
	 initPickTime: function(){
	 var startTime = $('input[name="start_time"]');
	 var endTime = $('input[name="end_time"]');
	 var endTimeValue = moment().format('YYYY-MM-DD HH:mm');
	 var startTimeValue = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm');
	 startTime.val(startTimeValue);
	 endTime.val(endTimeValue);
     startTime.datetimepicker({language :"zh-CN"}).on('show', function(ev) {
     	console.log("data time picker shows");
     }).on('hide', function(ev) {
     	console.log("data time picker close")
     });
     endTime.datetimepicker({language :"zh-CN"});
    },
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
    		// initialize line chart
    		var dataSales = {
          labels: ['9:00AM', '12:00AM', '3:00PM', '6:00PM', '9:00PM', '12:00PM', '3:00AM', '6:00AM'],
          series: [
             [287, 385, 490, 562, 594, 626, 698, 895, 952],
            [67, 152, 193, 240, 387, 435, 535, 642, 744]
          ]
        };

        var optionsSales = {
          lineSmooth: false,
          low: 0,
          high: 1000,
          showArea: false,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 3
          }),
          showLine: true,
          showPoint: true,
        };

        var responsiveSales = [
          ['screen and (max-width: 640px)', {
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];
        Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);
        // initialize pie chart
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
    		// button to execute query
    		$('#queryBtn').on('click', function(e){
    			e.preventDefault();
    			// show wait
    			$('#pleaseWaitDialog').modal('show');
    			// get start time and end time value
    			var startTime = $('input[name="start_time"]').val();
    			var endTime = $('input[name="end_time"]').val();
    			if (startTime == void 0 || startTime == "" || endTime == void 0 || endTime == "") {
    				var msg = "时间范围不能为空！";
    				operationTool.showNotification(4,msg,'top','center');
    			} else{
    				// get score limt
    				var minScore = $('input[name="min_score"]').val();
    				var maxScore = $('input[name="max_score"]').val();
    				minScore = (minScore == void 0 || minScore == "")? -1 : Number(minScore);
    				maxScore = (maxScore == void 0 || maxScore == "")? -1 : Number(maxScore);
    				var requestData = {};
    				if(minScore > 0 && maxScore > 0){
    					requestData.min = minScore;
    					requestData.max = maxScore;
    				}
    				// set time range
    				requestData.from = startTime; 
    				requestData.end = endTime;
    				$.ajax({
    					type:"get",
    					//url:"http://localhost:8080/operation-tool/rest/faq/get",
    					url:"rest/faq/get",
    					contentType:"application/json",
    					dataType:"json",
    					async:true,
    					data:requestData
    				}).done(function(data){
    					var results = data;
    					if(results != void 0){ 	
    						try{
    							// refresh tables
	    						operationTool.refreshTable(results);
	    						// refresh chart
	    						operationTool.refreshChartist(results);
    						}catch(e){
    							operationTool.showNotification(4, e,'top','center');
    						}	
    					}
    				}).fail(function(xhr, status, error){
    					operationTool.showNotification(4, xhr.statusText,'top','center');
    				}).always(function(){
    					$('#pleaseWaitDialog').modal('hide');
    				});
    			}
    		});
    		// button to import select data into database
    		$('#operateBtn').on('click', function(e){
    			// find selected td
    			var selected = $('#tableArea').find('td i.fa-check-square-o');
    			// if selected found
    			if(selected.length > 0){
    				var selectedIds = [];
    				// get all selected ids
    				$.each(selected, function(index, selectedI) {
    					var id = $(selectedI).parent('td').data('id');
    					// check status
    					var statusColumn = $(selectedI).parent('td').siblings('td[data-name="status"]');
    					// only status be empty then could be imported
    					if(id != void 0 && (statusColumn.length == 0 || statusColumn.is(':empty'))){
    						selectedIds.push(id);
    					}	
    				});
				if(selectedIds.length == 0){
					operationTool.showNotification(3, "数据已经导入，不允许重复导入！",'top','center');	
					return false;
				}
    				// show wait
    				$('#pleaseWaitDialog').modal('show');
    				// post id to import into database
    				var postData = {
    						ids : selectedIds
    				};
    				$.ajax({
    					type:"post",
    					//url:"http://localhost:8080/operation-tool/rest/faq/exportToSolr",
    					url:"rest/faq/exportToSolr",
    					contentType:"application/json",
    					dataType:"json",
    					data:JSON.stringify(postData),
    					async:true
    				}).done(function(data){
    					var results = data;
    					if(results != void 0){
    						var table = $('#tableArea');
    						// refresh tables by updated status
    						$.each(results, function(index, result) {
    							setRowStatus(result['status'], result['id'],table);
    						});
    						operationTool.showNotification(2, "导入成功！",'top','center');
    					}
    				}).fail(function(xhr, status, error){
    					operationTool.showNotification(4, xhr.statusText,'top','center');
    				}).always(function(){
    					$('#pleaseWaitDialog').modal('hide');
    				});
    			}else{
    				operationTool.showNotification(3, "未选择任何导入数据！",'top','center');	
    			}
    		});
    },
    // show notification
    showNotification: function(colorIndex, msg, from, align){
	    	$.notify({
	        	icon: "ti-volume",
	        	message: msg
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
    refreshChartist: function(/* array of FAQ objects */ results){
    		// aggregate data by time and score 
    		var totalSize = results.length;
    		var totalScore = 0;
        var pieData = [];
        var pieLabel = [];
        var lineLabels = [];
        var linePass = [];
        var lineFail = [];
        // if user query with max score < 80, then user query not pass
        var passSerial = {}; 
        var failSerial = {};
        var lineKeys = {};
        // data count of each group
        var pieGroupCount = [0,0,0,0];
        // iterator results to assemble data
        $.each(results, function(index, result) {
        		var score = result['score'];
        		totalScore += score;
        		// pie four groups: 80 - 100; 70 - 80; 60 -70; 0 - 60
        		if(score < 60){
        			var count = pieGroupCount[3];
        			count += 1;
        			pieGroupCount[3] = count;
        		}else if(score < 70 && score >= 60){
        			var count = pieGroupCount[2];
        			count += 1;
        			pieGroupCount[2] = count;
        		}else if(score < 80 && score >= 70){
        			var count = pieGroupCount[1];
        			count += 1;
        			pieGroupCount[1] = count;
        		}else if(score >= 80){
        			var count = pieGroupCount[0];
        			count += 1;
        			pieGroupCount[0] = count;
        		}
        		// assemble data for line chart
        		var time = moment(result['createTime'], "YYYY-MM-DD HH:mm:ss");
        		// remove minutes and seconds
        		var dataTime = time.format("YYYY-MM-DD-HH");
        		if(score >= 80){
        			var count = passSerial[dataTime] == void 0 ? 0 : passSerial[dataTime];
        			count += 1;
        			passSerial[dataTime] = count;
        		}else{
        			var count = failSerial[dataTime] == void 0 ? 0 : failSerial[dataTime];
        			count += 1;
        			failSerial[dataTime] = count;
        		}
        });
        // assemble pie data
        $.each(pieGroupCount, function(index, count) {
        		var rate = Math.round(count/totalSize*100);
        		pieData.push(rate);
        		pieLabel.push(String(rate).concat('%'));
        });
       	// assemble line data
       	var passKeys = Object.keys(passSerial);
       	var failKeys = Object.keys(failSerial);
       	// merge all keys
       	$.each(passKeys, function(index, key) {
       		lineKeys[key] = 1;
       	});
       	$.each(failKeys, function(index, key) {
       		lineKeys[key] = 1;
       	});
       	// traverse all keys to set labels and data
       	var keys = Object.keys(lineKeys);
       	$.each(keys, function(index, key) {
       		// key is moment object
       		var time = moment(key, "YYYY-MM-DD-HH").format("h:ssA");
       		lineLabels.push(time);
       		var passCount = passSerial[key] == void 0 ? 0:passSerial[key];
       		var failCount = failSerial[key] == void 0 ? 0:failSerial[key];
       		linePass.push(passCount);
       		lineFail.push(failCount);
       	});
        // update pie chart
        Chartist.Pie('#chartPreferences', {
          labels: pieLabel,
          series: pieData
        });
        // update average score 
        $('#avg_score').text((Math.floor(totalScore/totalSize)).toFixed(1));
        // when line data is not empty
        if(lineLabels.length != 0 && linePass.length != 0 && lineFail.length != 0){
	        	 // update line chart
	        Chartist.Line('#chartHours', {
	          labels: lineLabels,
	          series: [linePass, lineFail]
	        });
        }
       
    },
    // refresh table content
    refreshTable:function(/* JSON summary for each action */ results){
    		// clear existing table content
    		var tableArea = $('#tableArea');
    		tableArea.html("");
    		// table head labels
    		var heads = ["用户输入","SOLR匹配", "标准问题", "分值","创建时间","状态"];
    		// data colum names
    		var columns = ["userQ", "solrMatch", "standardQ", "score", "createTime", "status"];
    		// function to preprocess data before append to table
    		var dataPreprocess = function(/* String */columnName, columnValue, /* TD element*/ td){
    			if(columnName == 'status'){
    				if(columnValue == 1){
					// if row has been processed
					var tdStatus = '<i class="ti-cloud-up text-center text-success"></i>';
				}else{
					// if row has been not been processed, then empty
					var tdStatus = '';	
				}
				td.html(tdStatus);
    			}else{
    				td.text(columnValue);
    			}
    		}
    		var table = createTable(results, heads, columns, "id", dataPreprocess);
    		tableArea.append(table);
    		// update totoal size
    		$('#total_count').text(results.length);
    		// create data table and destory exsting
//  		$('#tableArea').dataTable({
//		  "search": false,
//		  "destroy": true
//		});
    }
};

/**
 * create table element by result array and columns identification
 */
function createTable( /* Array of JSON */ resultArray, /*Array of String*/ headLables, /*Array of String*/ dataColumns, /* String */ idColumn,/* function */ dataPreprocess) {
	var table = $('<table>');
	table.addClass('table table-striped');
	var thead = $('<thead>');
	var theadTr = $('<tr>');
	var tbody = $('<tbody>');
	// check callback for table head
	var theadCheck = function(event){
		event.preventDefault();
		event.stopPropagation();
		var self = $(this);
		var check = self.find("i.fa");
		// if current is unchecked
		if(check.hasClass('fa-square')){
			// set current checked
			check.removeClass('fa-square').addClass('fa-check-square-o');
			// set all rows checked
			self.closest('table').find('td i.fa-square').removeClass('fa-square').addClass('fa-check-square-o');
		}else{
			// set current unchecked
			check.removeClass('fa-check-square-o').addClass('fa-square');
			// set all rows unchecked
			self.closest('table').find('td i.fa-check-square-o').removeClass('fa-check-square-o').addClass('fa-square');
		}
	};
	// check callback for table td
	var tdCheck = function(event){
		event.preventDefault();
		event.stopPropagation();
		var self = $(this);
		var check = self.find("i.fa");
		// if current is unchecked
		if(check.hasClass('fa-square')){
			// set current checked
			check.removeClass('fa-square').addClass('fa-check-square-o');
		}else{
			// set current unchecked
			check.removeClass('fa-check-square-o').addClass('fa-square');
		}
	};
	// add check box in thead
	var thCheckbox = $('<th><i class="first-icon fa fa-square fa-base"></i></th>');
	thCheckbox.on('click', theadCheck);
	theadTr.append(thCheckbox);
	// get keys of table head
	for(var index in headLables) {
		var key = headLables[index];
		var th = $('<th>');
		th.text(key);
		theadTr.append(th);
	}
	thead.append(theadTr);
	// create table rows
	for(var index in resultArray) {
		var row = resultArray[index];
		var tr = $('<tr>');
		// add checkbox for each row
		var tdCheckbox = $('<td><i class="first-icon fa fa-square fa-base"></i></td>');
		// set data id for row
		tdCheckbox.attr('data-id', row[idColumn]);
		tdCheckbox.on('click', tdCheck);
		tr.append(tdCheckbox);
		// append data
		for(var i in dataColumns) {
			var key = dataColumns[i];
			var td = $('<td>');
			// set td column name
			td.attr('data-name', key);
			dataPreprocess(key, row[key], td);
			tr.append(td);
		}
		tbody.append(tr);
	}
	table.append(thead);
	table.append(tbody);	
	return table;
}

/**
 * set table row status
 */
function setRowStatus(/* int */ status, /* id */ id, /* table element*/ table){
	// find match td
	var td = table.find('td[data-id="'+ id +'"]');
	if(td.length > 0){
		// find status column
		var statusColumn = td.siblings('td[data-name="status"]');
		if(statusColumn.length > 0){
			if(status == 1){
				statusColumn.html('<i class="ti-cloud-up text-center text-success"></i>');
			}
		}
	}
}
