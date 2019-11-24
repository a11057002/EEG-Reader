var totalLengthOfGraph;
var channelName; //2 dim
var data; // after check
var cName;
var choiceContainer;
var dataset;
var downOffset = -9000;
var interval_time;
var lval;
var rval;
var sensorString = "";
var checksensor = ["FP1","FP2","F7","O1"]


$(document).ready(function() { //initial plot area
  $.plot($("#flot-placeholder"), [], []);
  //plot signal
  $("#plotSignal").click(plotSignalfromHead);
  //next page
  $("#nextPage").click(nextPage);
  //back page
  $("#previousPage").click(previousPage);
});


$(function() {
  $('#submit-parse').click(function() {
    Swal.fire({
      title: "加速解析中:D",
      allowOutsideClick: false,
      onBeforeOpen: () => {
        if(!$("#files")[0].files.length)
        {
          Swal.close();
          return;
        }
        Swal.showLoading();
        getData();
      }
    });
  });
});

//plot signal flot
function plotSignal() {

  checkBox();

  if (data.length > 0) {
    $.plot($("#flot-placeholder"), data, {
      series: {
        lines: {
          show: true,
          lineWidth: 0.5,
        }
      },
      xaxis: {
        show: true,
        min: lval,
        max: rval,
        axisLabel: "milli seconds",
      },
      yaxis: {
        position: "left",
        show: true,
        max: 9600,
        min: 0,
        ticks: channelName
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

function plotSignalfromHead(){
  interval_time = $("#xPadding").val();
  interval_time = parseInt(interval_time);
  lval = 0;
  rval = interval_time;
  plotSignal();
}


function checkBox() {
  data = [];
  choiceContainer.find("input:checked").each(function() {

    var input = dataset.findIndex((result)=>{if(result.label==$(this).attr("id")) return result});
    data.push(dataset[input]);

  });
}

function nextPage() {

  checkBox();

  if (rval < totalLengthOfGraph) {
    $.plot("#flot-placeholder", data, {
      series: {
        lines: {
          show: true,
          lineWidth: 0.5,
        }
      },
      xaxis: {
        show: true,
        axisLabel: "milli seconds",
        min: lval += interval_time,
        max: rval += interval_time
      },
      yaxis: {
        position: "left",
        show: true,
        max: 9600,
        min: 0,
        ticks: channelName
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

  if (lval > 0) {
    $.plot("#flot-placeholder", data, {
      series: {
        lines: {
          show: true,
          lineWidth: 0.5,
        }
      },
      xaxis: {
        show: true,
        axisLabel: "milli seconds",
        min: lval -= interval_time,
        max: rval -= interval_time
      },
      yaxis: {
        position: "left",
        show: true,
        max: 9600,
        min: 0,
        ticks: channelName
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


function labelChangeColor(self) {
  if (self.parentElement.className.includes("white"))
    self.parentElement.className = "select_sensor pink";
  else
    self.parentElement.className = "select_sensor white";
}

function getData(){

  var filename = $("#files")[0].files[0].name;

  $.ajax({
    url: "http://140.121.197.92:8787/getdata/" + filename,
    type: "GET",
    success: function(result) {
      dataset = [];
      channelName = [];
      dataresult = JSON.parse(result["data"]);

      cName = Object.keys(dataresult);
      var time = Object.keys(dataresult[cName[0]]);
      //console.log("time: "+ time);
      channelNum = cName.length;
      totalLengthOfGraph = time.length;
      totalLengthOfGraph = parseInt(totalLengthOfGraph, 10);

      $("#xPadding").val(totalLengthOfGraph);

      for (var i = 0; i < channelNum; i++) {
        channelName.push([-downOffset, cName[i]]);
        input = Object.values(dataresult[cName[i]]);
        data = time.map((value) => {
          //console.log("x-axis: "+value);
          //console.log("y-axis: "+input[value]);
          return [value, (input[value]*5) - downOffset]
          //*5放大波形
        });
        //console.log("yyyyyy: "+input[58330]);
        dataset.push({
          label: cName[i],
          color: "#4798B3",
          data: data
        });
        downOffset += 300;
      }
      $("#choices").html(""); //避免重複append
      choiceContainer = $("#choices");
      var count = 0;
      $.each(dataset, function(val) {
        choiceContainer.append("<br/><input type='checkbox' name='" + cName[count] + "' checked='checked' id='" + cName[count] + "'hidden >");
        count++;
      });

      choiceContainer.find("input").click(plotSignal);
      Swal.close();
    }
  });

  $("#eeg_pic_but").click(function() {
    var sensorString = "";
    for (var i = 0; i < channelNum; i++) {

      if(checksensor.includes(cName[i]))
        sensorString += "<div class='select_sensor'>&nbsp;</div>"

      if ($("#" + cName[i] + "").is(":checked"))
        sensorString += "<div class='select_sensor pink'><label for='" + cName[i] + "' onclick='labelChangeColor(this)' typein='" + cName[i] + "'></label></div>";
      else
        sensorString += "<div class='select_sensor white'><label for='" + cName[i] + "' onclick='labelChangeColor(this)' typein='" + cName[i] + "'></label></div>";
    }

    Swal.fire({
      title: "EEG sensors",
      imageUrl: "../resources/eeg_33channels.png",
      html: sensorString
    });
  });
}



// var totalPoint;
// var channelNum;
// var channel;

// $(function()
// {
// 	//parse csv file to json file
// 	{
// 		channel = new Array();
// 		channelName = new Array();
// 		cName = new Array();
// 		channelRealtime = new Array();
//
// 				Swal.fire({
// 				  title:"加速解析中:D",
// 					onBeforeOpen:()=>{
// 						Swal.showLoading();
// 						downOffset = -4300; //讓每次parse回歸
// 						k=0;
// 						stepped = 0;
// 						chunks = 0;
// 						rows = 0;
//
// 						var txt = $('#input').val();
// 						//console.log("TEXT:"+txt);
// 						files.length=0;
// 						files = $('#files')[0].files;
// 						console.log("File:"+files);
// 						var config = buildConfig();
//
// 						pauseChecked = $('#step-pause').prop('checked');
// 						printStepChecked = $('#print-steps').prop('checked');
//
//
// 						if (files.length > 0)
// 						{
//
// 							start = performance.now();
//
// 							$('#files').parse({
// 								config: config,
// 								before: function(file, inputElem)
// 								{
// 									console.log("Parsing file:", file);
// 								},
// 								complete: function()
// 								{
// 									console.log("Done with all files.");
// 									Swal.close();
// 								}
// 							});
// 						}
// 						else
// 						{
// 							start = performance.now();
// 							results = Papa.parse(txt, config);
// 							console.log("Synchronous parse results:", results);
// 						}
// 					}
// 				})
//
// 	});
//
//
// });
// function buildConfig()
// {
// 	return {
//
// 		newline: getLineEnding(),
// 		header: $('#header').prop('checked'),
// 		encoding: $('#encoding').val(),
// 		worker: $('#worker').prop('checked'),
// 		complete: completeFn,
// 		error: errorFn,
// 		download: $('#download').prop('checked'),
// 		beforeFirstChunk: undefined,
// 	};
//
// 	function getLineEnding()
// 	{
// 		if ($('#newline-n').is(':checked'))
// 			return "\n";
// 		else if ($('#newline-r').is(':checked'))
// 			return "\r";
// 		else if ($('#newline-rn').is(':checked'))
// 			return "\r\n";
// 		else
// 			return "";
// 	}
// }
//
//
//
// function errorFn(error, file)
// {
// 	console.log("ERROR:", error, file);
// }
//
// function completeFn()
// {
// 	end = performance.now();
// 	if (!$('#stream').prop('checked')
// 			&& !$('#chunk').prop('checked')
// 			&& arguments[0]
// 			&& arguments[0].data)
// 		rows = arguments[0].data.length;
//
// 	console.log("Finished input (async). Time:", end-start, arguments);
// 	console.log("Rows:", rows, "Stepped:", stepped, "Chunks:", chunks);
// 	//test for csv
// 	//console.log(arguments[0].data[0][0]); //title,intro
// 	//console.log(arguments[0].data[1][0]); //0.000
// 	//console.log(arguments[0].data[1][1]); //4.000
// 	//console.log(arguments[0].data[1][3]); //12.000
// 	console.log(arguments[0].data);
// 	console.log("channel: "+arguments[0].data.length); //-3後為channel數
// 	console.log("total points: "+arguments[0].data[1].length);//toal points
// 	totalPoint = arguments[0].data[1].length;
// 	totalLengthOfGraph = arguments[0].data[1][totalPoint-1];
// 	channelNum = (arguments[0].data.length)-3;
//
//
//
// 	totalLengthOfGraph = parseInt(totalLengthOfGraph,10);
// 	$("#xPadding").val(totalLengthOfGraph);
// 	interval_time = $("#xPadding").val();
// 	interval_time = parseInt(interval_time);
//
// 	//console.log("TTT:"+totalPoint);
// 	//console.log("YYY:"+totalLengthOfGraph);
// 	//channel1
// 	for(var i=0;i<channelNum;i++){
// 		channel[i]=[]; //channel0~channel29
// 	}
// 	channelName = []; //initial channelName array
// 	cName = [];
// 	dataset = [];
// 	for(var i=0;i<channelNum;i++){
// 		for(var j=0;j<totalPoint;j++){
// 			var temp = [arguments[0].data[1][j],arguments[0].data[i+2][j+1]-downOffset];
// 			channel[i].push(temp);
// 		}
// 		var temp1 = [-downOffset,arguments[0].data[i+2][0]];//getChannel Name
// 		var temp2 = arguments[0].data[i+2][0];
// 		channelName.push(temp1);
// 		cName.push(temp2);
// 		downOffset += 150; //offset
// 	}
//
// 	for(var i=0 ;i<3;i++){ //<channelNum
// 	    dataset.push({label:cName[i], data: channel[i]});
// 	}
//
// 	console.log("channelName: "+channelName);
// 	console.log("Name: "+cName);
//
//
//
// 	var c = 0;
// 	$.each(dataset, function(key,val) { //set channel color
//     console.log(dataset);
// 		val.color = "#4798B3";
//     console.log(val);
// 		++c;
// 		//console.log("val: "+val);
// 		//console.log("val.label: "+val.label);
// 	});
//
// 	// insert checkboxes
// 	$("#choices").html("");//避免重複append
// 	choiceContainer = $("#choices");
// 	var count = 0;
// 		$.each(dataset, function(val) {
// 			choiceContainer.append("<br/><input type='checkbox' name='" + cName[count] +
// 			"' checked='checked' id='"+ count + "'hidden >");
//       // </input>"
// 			// "<label for='id" + cName[count] + "'>"
// 			// + cName[count]
//       // + "</label>");
// 		count++;
// 	});
// 	//console.log("choiceContainer:"+choiceContainer);
//
// 	choiceContainer.find("input").click(plotSignal);
//
//
//
// }//end completeFn


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
