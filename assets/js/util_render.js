var fs = require('fs');
var stream = require('stream');
var readline = require('readline')

// http://cwestblog.com/2013/09/05/javascript-snippet-convert-number-to-column-name/
var __colNameList = [];
var __maxColCount = 1024;
function _prepareColName(){
  var index = 1;
  for(index = 1; index <= __maxColCount; index++){
    num = index;
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
     __colNameList.push(ret);
  }
}
_prepareColName();

function getColName(num) {
  return __colNameList[num-1];
}

function getColInfos(col_count){
  var columns = [
		{id: "id", name: "id", field: "id", cssClass: "grid-row-hader", selectable: false}
	];
  for(index = 0; index < col_count; index++){
    var colname = getColName(index+1)
    var item = {id: colname, name: colname, field: colname, editor: Slick.Editors.LongText};
    columns.push(item);
  }
  return columns;
}

function apiReceiver(data){
  var api = data["api"];
  var action = data["action"];
  var param = data["param"]

  switch(api){
    case "loadFileData": loadFileData(action, param);break;
    case "loadFile": loadFile(action, param);break;
    default:break;
  }

}

var __loading_time;
function loadFile(action, param){
  var filepath = param["filepath"];
  __loading_time = new Date();
  
  var curLine = 0;
  var totalLine = 0;
  var rowdata = [];

  loadingModal("start", "loading file ...", "count line");

  // https://coderwall.com/p/ohjerg/read-large-text-files-in-nodejs
  var instream = fs.createReadStream(filepath);
  var outstream = new stream;
  readline.createInterface(instream, outstream)
    .on('line', function(line) {
      totalLine++;
    })
    .on('close', function() {
      var spend_time = ((new Date)-__loading_time) / 1000;
	    console.log("_readFile count line done : " + spend_time);
      _readFile(filepath, totalLine);
    });

}

function _readFile(filepath, totalLine){
  var curLine = 0;
  // var rowdata = [];
  var rowdata = new Array(totalLine);
  var lastPercent = 0;

  console.log('loadFileData start');

  var instream = fs.createReadStream(filepath);
  var outstream = new stream;
  readline.createInterface(instream, outstream)
    .on('line', function(line) {
      if(curLine == 0){
        // var data = {api: "loadFileData", action: "start", param: {}}
        // sendRenderAPI(data);
      }
      curLine++;
      var curPercent = parseInt(curLine / totalLine * 100);
      if(lastPercent != curPercent){
        var data = {api: "loadFileData", action: "percent", param: {percent:curPercent}}
        console.log("loadFileData percent : " + curPercent + "%" );
        // sendRenderAPI(data);
        loadingModal(curPercent, "loading file ...");
      }
      
      lastPercent = curPercent

      var items = line.split(",");
      var colcount = items.length;
      var index = 0;
      var rowItem = {id: curLine };
      for(index=0; index < colcount ; index++ ){
        var colname = getColName(index+1);
        rowItem[colname] = items[index];
      }
      
      // rowdata.push(rowItem);
      rowdata[curLine - 1] = rowItem;
    })
    .on('error', function(err) {
      console.log('Error while reading file.', err);
    })
    .on('close', function() {
      console.log('loadFileData end');

      var spend_time = ((new Date)-__loading_time) / 1000;
      console.log("_readFile prepare data done: " + spend_time);

      var data = {api: "loadFileData", action: "end", param: {rowdata:rowdata}}
      // sendRenderAPI(data);
      loadGrid(rowdata);
      loadingModal("end");
      console.log("_readFile end: " + spend_time);
    });


}


function loadFileData(action, param){
  if(action == "start"){
    console.log("loadFileData start");
    return;
  }
  else if(action == "percent"){
    var percent = param["percent"];
    console.log("loadFileData process : " + percent + "%");
    return;
  }
  
}

function loadGrid(gridData){
  var col_count = Object.keys(gridData[0]).length - 1;

  var colInfos = getColInfos(col_count);
  grid.setColumns(colInfos);
  grid.setData(gridData);
  grid.render();
}