var totalPoint;
var channelNum;
var totalLengthOfGraph;
var channel;
var channelName;
var channelRealtime;//
var r=0;//
var dataset2;
var dataset;
var downOffset = -3400;
var scale;
var interval_time = 10000;
var lval;
var rval;

var options = {
	series:
	{
	    lines:
			{
	        show: true,
	        lineWidth: 1.2,
	    }
  },
  xaxis:
	{
	    show:true,
			mode:"time",
			axisLabel:"seconds",
			// max:60000
			max:1000
      //mode:"time",
      //tickSize: [1, "second"],// XXX:
  },
  yaxis:
	{
			position:"left",
    	show:true,
      // axisLabelUseCanvas: true,
      // axisLabelFontSizePixels: 12,
      // axisLabelFontFamily: 'Verdana, Arial',
      // axisLabelPadding: 10,
			ticks:channelName
	}
  ,
    // {
    // 	position:"left",
    // 	tickFormatter:function(v){
    // 		return v.toString();
    // 	},
    // }

    legend: {
        labelBoxBorderColor: "#fff",
				position:"sw"
    },
    grid: {
        backgroundColor: "#ffffff",
        tickColor: "#008040"
    },
    /*	zoom: {
			interactive: true
		},
		pan: {
			interactive: true
		}*/
};

$( document ).ready(function() { //initial plot area
    $.plot($("#flot-placeholder"), [], []);
		//next page
			$("#nextPage").click(function () {
				console.log("yeee");
				if(rval<totalLengthOfGraph)
				{
					$.plot("#flot-placeholder", dataset, {
						xaxis: {
							show:true,
							//autoScale: "none",
							//mode: "time",
							//minTickSize: [1, "month"],
							min: lval+=interval_time,
							max: rval+=interval_time
							//timeBase: "milliseconds"
						},
						yaxis: {
							ticks:channelName
							//show:false,
						}
					});
				}
			});
		//back page
			$("#previousPage").click(function () {
				if(lval>0)
				{
					$.plot("#flot-placeholder", dataset, {
						xaxis: {
							show:true,
							//autoScale: "none",
							//mode: "time",
							//minTickSize: [1, "month"],
							min: lval-=interval_time,
							max: rval-=interval_time
							//timeBase: "milliseconds"
						},
						yaxis: {
							ticks:channelName
							//show:false,
						}
					});
				}
			});

			// $("#zoomIn").click(function(){
			// 	 $("#flot-placeholder").zoom();
			// })
			//
			// $("#zoomOut").click(function(){
			// 	 $("#flot-placeholder").zoomOut();
			// })

});


$(function()
{
	//parse csv file to json file
	$('#submit-parse').click(function()
	{   
		channel = new Array();
		channelName = new Array();
		channelRealtime = new Array();

		Swal.mixin({ //使用者自設定interval_time and downOffset
			  input: 'number',
			  confirmButtonText: 'Next &rarr;',
			  showCancelButton: true,
			  progressSteps: ['1', '2']
			}).queue([
			  {
			    title: 'set Interval time',
			    text: 'default 10000ms',
			    //inputPlaceholder: "input number(ms)"
			    inputValue: 10000
			  },
			  {
			  	title: 'set scale',
			    text: 'default 150',
			    //inputPlaceholder: "input number"
			    inputValue: 150
			  }

			]).then((result) => {
			  	console.log(result.value);
			  	interval_time = result.value[0];
			  	scale = result.value[1];
			  	interval_time = parseInt(interval_time,10);
			  	scale = parseInt(scale,10);
			}).then(()=>{
				Swal.fire({
					title:"加速解析中:D",
			      html: "Input interval_time: " + interval_time +
				  		"<br> Input scale: " + scale,
			      confirmButtonText: 'complete!',
					showConfirmButton:false,
					onBeforeOpen:()=>{
						Swal.showLoading();
						downOffset = -3400; //讓每次parse回歸
						stepped = 0;
						chunks = 0;
						rows = 0;

						var txt = $('#input').val();
						//console.log("TEXT:"+txt);
						files.length=0;						
						files = $('#files')[0].files;
						console.log("File:"+files);
						var config = buildConfig();

						pauseChecked = $('#step-pause').prop('checked');
						printStepChecked = $('#print-steps').prop('checked');


						if (files.length > 0)
						{

							start = performance.now();

							$('#files').parse({
								config: config,
								before: function(file, inputElem)
								{
									console.log("Parsing file:", file);
								},
								complete: function()
								{
									console.log("Done with all files.");
									Swal.close();
								}
							});
						}
						else
						{
							start = performance.now();
							results = Papa.parse(txt, config);
							console.log("Synchronous parse results:", results);
						}
					}
				})
			})

	});


});
function buildConfig()
{
	return {

		newline: getLineEnding(),
		header: $('#header').prop('checked'),
		encoding: $('#encoding').val(),
		worker: $('#worker').prop('checked'),
		complete: completeFn,
		error: errorFn,
		download: $('#download').prop('checked'),
		beforeFirstChunk: undefined,
	};

	function getLineEnding()
	{
		if ($('#newline-n').is(':checked'))
			return "\n";
		else if ($('#newline-r').is(':checked'))
			return "\r";
		else if ($('#newline-rn').is(':checked'))
			return "\r\n";
		else
			return "";
	}
}



function errorFn(error, file)
{
	console.log("ERROR:", error, file);
}

function completeFn()
{
	end = performance.now();
	if (!$('#stream').prop('checked')
			&& !$('#chunk').prop('checked')
			&& arguments[0]
			&& arguments[0].data)
		rows = arguments[0].data.length;

	console.log("Finished input (async). Time:", end-start, arguments);
	console.log("Rows:", rows, "Stepped:", stepped, "Chunks:", chunks);
	//test for csv
	//console.log(arguments[0].data[0][0]); //title,intro
	//console.log(arguments[0].data[1][0]); //0.000
	//console.log(arguments[0].data[1][1]); //4.000
	//console.log(arguments[0].data[1][3]); //12.000
	console.log(arguments[0].data);
	console.log("channel: "+arguments[0].data.length); //-3後為channel數
	console.log("total points: "+arguments[0].data[1].length);//toal points
	totalPoint = arguments[0].data[1].length;
	totalLengthOfGraph = arguments[0].data[1][totalPoint-1];
	channelNum = (arguments[0].data.length)-3;
	//console.log("TTT:"+totalPoint);
	//console.log("YYY:"+totalLengthOfGraph);
	//channel1
	for(var i=0;i<channelNum;i++){
		channel[i]=[]; //channel0~channel29
		channelName[i] = [];
	}
	for(var i=0;i<channelNum;i++){
		for(var j=0;j<totalPoint;j++){
			var temp = [arguments[0].data[1][j],arguments[0].data[i+2][j+1]-downOffset];
			channel[i].push(temp);
		}
		temp1 = [-downOffset,arguments[0].data[i+2][0]];
		channelName.push(temp1);

		downOffset += scale; //
	}
	for(var i=0;i<channelNum;i++){
		var temp1 = [arguments[0].data[i+2][0],0]; //getChannel Name
		channelName[i].push(temp1);

	}

	/*
	real time
	*/
	for(var j=0;j<totalPoint;j++){
		channelRealtime[j] = [];
	}
	for(var j=0;j<totalPoint;j++){
		for(var i=0;i<channelNum;i++){
			var temp2 = [arguments[0].data[1][j],arguments[0].data[i+2][j+1]-downOffset];
			channelRealtime[j].push(temp2);
			downOffset += scale;
		}
		downOffset = -3400;
	}//end

	console.log("channelName: "+channelName);
	plotSignal();


	//plot signal flot


	function plotSignal() {
		lval = 0;
		rval = interval_time;

	    dataset = [];
	    //console.log("dataset: "+ dataset);

	    for(var i=0 ;i<2;i++) //<channelNum
	    	dataset.push({ data: channel[i],color: getRandomColor()});

	    $.plot($("#flot-placeholder"), dataset, options);

	 
	}
/*
	dataset2=[];
	//for(var j=0 ;j<totalPoint;j++) 
	 //   	dataset2.push({ data: channelRealtime[j], color: getRandomColor()});
	var plot = $.plot($("#flot-placeholder2"), dataset2, options);
	function realTime(){
		
		var updateInterval = 30;
		
		if(r <= totalPoint){
			plot.setData(channelRealtime[r]);
			plot.draw();
			r++;
		}
		setTimeout(realTime, updateInterval);
		
		
	}
	realTime();*/


}




function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  if(color=='"#ffffff')getRandomColor();//不要是白色
  return color;
}
