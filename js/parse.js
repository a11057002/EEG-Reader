var totalPoint;
var channelNum;
var channel = new Array();
var channelName = new Array();
var dataset;
var downOffset = -3400;
//next button 推進

var lval=0;
var rval=10000; //10sec

var options = {
	series: {
        lines: {
            show: true,
            lineWidth: 1.2,
        }
    },
    xaxis: {
    	show:true,
		axisLabel:"milliseconds(4ms per point)"
        //mode:"time",
        //tickSize: [1, "second"],
        
    },
    yaxis:
    {
    	show:true,
    	min:-1000,
    	max:3500,
        axisLabel: "Channel",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 10,
    },
    legend: {
        labelBoxBorderColor: "#fff"
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
});


$(function()
{

	//parse csv file to json file
	$('#submit-parse').click(function()
	{
		downOffset = -3400; //讓每次parse回歸
		stepped = 0;
		chunks = 0;
		rows = 0;

		var txt = $('#input').val();
		//console.log("TEXT:"+txt);
		var files = $('#files')[0].files;
		//console.log("File:"+files);
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
				}
			});
		}
		else
		{
			start = performance.now();
			var results = Papa.parse(txt, config);
			console.log("Synchronous parse results:", results);
		}
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
	channelNum = (arguments[0].data.length)-3;
	//channel1
	for(var i=0;i<channelNum;i++){
		channel[i]=[]; //channel0~channel29
		channelName[i]=[];//initialize channelname array
	}
	for(var i=0;i<channelNum;i++){
		for(var j=0;j<totalPoint;j++){
			var temp = [arguments[0].data[1][j],arguments[0].data[i+2][j+1]-downOffset];
			channel[i].push(temp);
		}
		downOffset += 150; //
	}
	//console.log("channel: "+channel);

	for(var i=0;i<channelNum;i++){
		var temp1 = arguments[0].data[i+2][0]; //getChannel Name 
		channelName[i].push(temp1);
		//channelName[i] = [0,arguments[0].data[i+2][0]];
	}
	console.log("channelName: "+channelName);
	plotSignal();


	//plot signal flot


	function plotSignal() {

	    dataset = [];
	    //console.log("dataset: "+ dataset);

	    for(var i=0 ;i<channelNum;i++)
	    	dataset.push({ data: channel[i], color: getRandomColor()});
	    //console.log("DataSet:"+dataset);
	    $.plot($("#flot-placeholder"), dataset, options);	
	    }

	//next page
		$("#nextPage").click(function () {
			$.plot("#flot-placeholder", dataset, {
				xaxis: {
					show:true,
					//autoScale: "none",
					//mode: "time",
					//minTickSize: [1, "month"],
					min: lval+=10000,
					max: rval+=10000,
					//timeBase: "milliseconds"
				},
				yaxis: {
					//show:false,
				}
			});
		/*	if(rval!=((totalPoint*4)+10000)){//totalPoint*4: time upper bound,加10000給他足夠顯示空間
				lval = rval;
				rval = rval+10000;
			}*/
		});
	//back page
		$("#previousPage").click(function () {
			$.plot("#flot-placeholder", dataset, {
				xaxis: {
					show:true,
					//autoScale: "none",
					//mode: "time",
					//minTickSize: [1, "month"],
					min: lval-=10000,
					max: rval-=10000,
					//timeBase: "milliseconds"
				},
				yaxis: {
					//show:false,
				}
			});
		});
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
