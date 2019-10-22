var totalPoint;
var channelNum;
var channel = new Array();
var dataset;
var downOffset = -950;
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
    	show:false,
        //mode:"time",
        //tickSize: [1, "second"],
    },
    yaxis: {
    	show:false, 
    	min:-1000,
    	max:1000,
        axisLabel: "Channel",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 6
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


$(function()
{

	//parse csv file to json file
	$('#submit-parse').click(function()
	{
		downOffset = -950; //讓每次parse回歸
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
	}
	for(var i=0;i<channelNum;i++){
		for(var j=0;j<totalPoint;j++){
			var temp = [arguments[0].data[1][j],arguments[0].data[i+2][j+1]-downOffset];
			channel[i].push(temp);
		}
		downOffset += 50; //
	}
	plotSignal();


	//plot signal flot


	function plotSignal() {

	    dataset = [];
	    //console.log("dataset: "+ dataset);

	    for(var i=0 ;i<channelNum;i++)
	    	dataset.push({ data: channel[i], color: getRandomColor() });

	    $.plot($("#flot-placeholder"), dataset, options);
	}

	//next page
		$("#nextPage").click(function () {
			$.plot("#flot-placeholder", dataset, {
				xaxis: {
					show:false,
					//autoScale: "none",
					//mode: "time",
					//minTickSize: [1, "month"],
					min: lval,
					max: rval,
					//timeBase: "milliseconds"
				},
				yaxis: {
					//show:false,
				}
			});
			lval = rval;
			rval = rval+10000;
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




