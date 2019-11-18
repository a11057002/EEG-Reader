var totalPoint;
var channelNum;
var totalLengthOfGraph;
var channel;
var channelName; //2 dim
var cName; //1 dim
var data;
var choiceContainer;
var dataset2;
var dataset;
var downOffset = -4300;
var offset;
var interval_time;
var lval;
var rval;
var censorString = "";
// var colorArray = [];

var options;

$( document ).ready(function() { //initial plot area
    $.plot($("#flot-placeholder"), [], []);

    //plot signal
    $("#plotSignal").click(plotSignal);
	//next page
	$("#nextPage").click(nextPage);
	//back page
	$("#previousPage").click(previousPage);


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
		cName = new Array();
		channelRealtime = new Array();

				Swal.fire({
				  title:"加速解析中:D",		      
					onBeforeOpen:()=>{
						Swal.showLoading();
						downOffset = -4300; //讓每次parse回歸
						k=0;
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



	totalLengthOfGraph = parseInt(totalLengthOfGraph,10);
	$("#xPadding").val(totalLengthOfGraph);
	interval_time = $("#xPadding").val();
	interval_time = parseInt(interval_time);

	//console.log("TTT:"+totalPoint);
	//console.log("YYY:"+totalLengthOfGraph);
	//channel1
	for(var i=0;i<channelNum;i++){
		channel[i]=[]; //channel0~channel29
	}
	channelName = []; //initial channelName array
	cName = [];
	dataset = [];
	for(var i=0;i<channelNum;i++){
		for(var j=0;j<totalPoint;j++){
			var temp = [arguments[0].data[1][j],arguments[0].data[i+2][j+1]-downOffset];
			channel[i].push(temp);
		}
		var temp1 = [-downOffset,arguments[0].data[i+2][0]];//getChannel Name
		var temp2 = arguments[0].data[i+2][0];
		channelName.push(temp1);
		cName.push(temp2);
		downOffset += 150; //offset 
	}

	for(var i=0 ;i<channelNum;i++){ //<channelNum
	    dataset.push({label:cName[i], data: channel[i]});
	}

	console.log("channelName: "+channelName);
	console.log("Name: "+cName);



	var c = 0;
	$.each(dataset, function(key,val) { //set channel color
    console.log(dataset);
		val.color = "#4798B3";
    console.log(val);
		++c;
		//console.log("val: "+val);
		//console.log("val.label: "+val.label);
	});

	// insert checkboxes
	$("#choices").html("");//避免重複append
	choiceContainer = $("#choices");
	var count = 0;
		$.each(dataset, function(val) {
			choiceContainer.append("<br/><input type='checkbox' name='" + cName[count] +
			"' checked='checked' id='"+ count + "'hidden >");
      // </input>"
			// "<label for='id" + cName[count] + "'>"
			// + cName[count]
      // + "</label>");
		count++;
	});
	//console.log("choiceContainer:"+choiceContainer);

	choiceContainer.find("input").click(plotSignal);

  $("#eeg_pic_but").click(function(){
    var censorString = "";
    for(var i=0;i<channelNum;i++)
    {
          if($("#"+i+"").is(":checked"))
              censorString += "<div class='select_censor pink'><label for='"+i +"' onclick='labelChangeColor(this)' typein='"+ channelName[i][1] +"'></label></div>";
          else
              censorString += "<div class='select_censor white'><label for='"+i +"' onclick='labelChangeColor(this)' typein='"+ channelName[i][1] +"'></label></div>";
    }

      Swal.fire({
        title:"EEG censors",
        imageUrl:"../resources/eeg_33channels.png",
        html: censorString
      })

      // $("label").click(function(){
      //
      // })
  })


}//end completeFn

//plot signal flot
function plotSignal() {
	interval_time = $("#xPadding").val();
	interval_time = parseInt(interval_time);

	lval =0;
    rval = interval_time;
    

	checkBox();

	if(data.length > 0){
	  	$.plot($("#flot-placeholder"), data, {
				series:
				{
				    lines:
						{
				        show: true,
				        lineWidth: 0.5,
				    }
			  },
			  xaxis:
				{
				    show:true,
				    min:0,
				    max:interval_time,
					axisLabel:"milli seconds",

			  },
			  yaxis:
				{
					position:"left",
			    	show:true,
			    	max:4500,
			    	min:0,

					ticks:channelName
				},


			    legend: {
			    	show: false,
			    },
			    grid: {
			        backgroundColor: "#ffffff",
			    },

				});
	}


}

function checkBox(){
  // if(!isNaN(rval) && !isNaN(lval))
  //   options.xaxis.max = rval-lval;
	data = [];
	choiceContainer.find("input:checked").each(function () {
		var key = $(this).attr("name");
		var id= $(this).attr("id");
		// console.log("key:"+key);
		// console.log("id:"+id);
		// console.log("label:"+dataset[id].label);
		// console.log("lval: "+lval);
		// console.log("rval: "+rval);

		if (key && dataset[id].label) {
			data.push(dataset[id]);
		}
	});
}

function nextPage() {
	checkBox();
	
		if(rval<totalLengthOfGraph)
		{
			$.plot("#flot-placeholder", data, {
				series:{
	   				lines:{
			        	show: true,
			        	lineWidth: 0.5,
		    		}
  				},
				xaxis: {
					show:true,
					axisLabel:"milli seconds",
					min: lval+=interval_time,
					max: rval+=interval_time
				},
				yaxis: {
					position:"left",
    				show:true,
    				max:4500,
    				min:0,
					ticks:channelName
				},
				legend: {
	    			show: false,
    			},
				grid: {
        			backgroundColor: "#ffffff",
    			}
			});
		}
}

function previousPage() {
		checkBox();
		
		if(lval>0)
		{
			$.plot("#flot-placeholder", data, {
				series:{
	   				lines:{
		       			show: true,
	        			lineWidth: 0.5,
    				}
 				},
				xaxis: {
					show:true,
					axisLabel:"milli seconds",
					min: lval-=interval_time,
					max: rval-=interval_time
				},
				yaxis: {
					position:"left",
   					show:true,
   					max:4500,
    				min:0,
					ticks:channelName
				},
				legend: {
    				show: false,
    			},
				grid: {
       				backgroundColor: "#ffffff",
    			}
			});
		}
}


function labelChangeColor(self){
    if(self.parentElement.className.includes("white"))
        self.parentElement.className = "select_censor pink";
    else
        self.parentElement.className = "select_censor white";
}



/*
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  if(color=='"#ffffff')getRandomColor();//不要是白色
  return color;
}*/
