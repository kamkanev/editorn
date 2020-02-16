// var ace = require("lib/ace/ace.js");//ace/ext/language_tools

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/plain_text");
editor.session.setOption("useWorker", true);
editor.setOptions({
			enableLiveAutocompletion: true,
      enableBasicAutocompletion: true,
  fontSize: "15pt"
});
const remote = require('electron').remote;
const {BrowserWindow} = require('electron').remote;
const {dialog} = require('electron').remote
const path = require('path');
const fs = require('fs');
var Menu = require('electron').remote.Menu;

var mainWindow;

let tempMenu1 = [
  {
    label: "File",
		submenu: [
			{
				label: "New window",
				click(){
					Swal.fire({
						icon: "info",
						title: "Coming soon"
					});
				},
				accelerator: "CmdOrCtrl+Shift+N"
			},
			{
				label: "New file",
				click(){
					newFile();
				},
				accelerator: "CmdOrCtrl+N"
			},
			{
				label: "Open file...",
				click(){
					openFile();
				},
				accelerator: "CmdOrCtrl+O"
			},

			{ type: 'separator' },

			{
				label: "Save file",
				click(){
					saveFile();
				},
				accelerator: "CmdOrCtrl+S"
			},
			{
				label: "Save as...",
				click(){
					if(oFilePath != null){
						saveAsFile(oFilePath);
					}else{
						saveFile();
					}
				},
				accelerator: "CmdOrCtrl+Shift+S"
			},
			{role: "quit", accelerator: "CmdOrCtrl+Q"}
		]
  },
  {
    label: "Edit",
		submenu: [
			{
				label: "Word warp",
				click(){
					toggleWOrldwarp();
				},
				accelerator: "Alt+Shift+W"
			}
		]
  },
  {
    label: "View",
    submenu: [
      {role: 'reload', accelerator: "CmdOrCtrl+R"},
      { type: 'separator' },
      {role: 'togglefullscreen'}
    ]
  }
];

const menu = Menu.buildFromTemplate(tempMenu1);
Menu.setApplicationMenu(menu);


var oFilePath = null;

setInterval(function(){
  updateFooter();
}, 100);

function updateFooter() {

//on whitch row and col are you

  document.getElementById("rowsNcols").innerHTML = ""+ (editor.selection.getCursor().row+1) + ":" + (editor.selection.getCursor().column+1);


//length of selected text
  if(editor.getSelectedText() != ""){

    var rowDiff = editor.getSelectionRange().end.row - editor.getSelectionRange().start.row;

    document.getElementById("SelectedrowsNcols").style.display = "block";
    document.getElementById("SelectedrowsNcols").innerHTML = "("+ (rowDiff+1) + ", " + (editor.getSelectedText().length) + ")";
  }else{
    document.getElementById("SelectedrowsNcols").style.display = "none";
  }

  //on whitch langulage do you program prog-lang
  document.getElementById("prog-lang").innerHTML = editor.session.getMode().$id.split('/')[2];
}

async function changeLineCursor(){
var c = 1;

var cursor= {};

  var { value: text } = await Swal.fire({
    input: 'text',
      text: 'Enter <row> or <row>:<col> to go to there.'
  })

  if (text != undefined) {
    var arr = text.split(":");
    if(arr.length > 1){

      cursor =  {
        row: parseInt(arr[0]),
        column: parseInt(arr[1])
      };

    }else{

          cursor = {
            row: parseInt(arr[0]),
            column: c
          };
    }

  }else{
    cursor = {
      row: editor.selection.getCursor().row,
      column: editor.selection.getCursor().column
    };

  }


      editor.gotoLine(cursor.row, cursor.column-1);
}

async function selectLanguage(){
		const { value: lang } = await Swal.fire({
	  title: 'Select programming language',
	  input: 'select',
	  inputOptions: {
			auto_d: 'auto_detect',
	    c_cpp: 'C/C++',
	    html: 'HTML',
	    glsl: 'GLSL',
	    mysql: 'Mysql',
			javascript: "JavaScript",
			css: "CSS",
			json: "JSON",
			plain_text: "Plain text"
	  },
	  inputPlaceholder: 'Select a language',
	  showCancelButton: true,
	  inputValidator: (value) => {
	    // return new Promise((resolve) => {
	    //   if (value === 'oranges') {
	    //     resolve()
	    //   } else {
	    //     resolve('You need to select oranges :)')
	    //   }
	    // })
	  }
	})

	if (lang) {
		if(lang != "auto_d"){
			editor.session.setMode("ace/mode/"+lang);
		  Swal.fire(`You selected: ${lang}`);
		}else {
			// na kakvo zavurshva file
			if(oFilePath != null){
				auto_detect_lang(oFilePath);
			}else{
				Swal.fire({
					icon: "warning",
					title: "Auto detect work only with files."
				});
			}
		}
	}
}

function openFile() {
	// dialog.showOpenDialog({
  //       properties: ['openFile']//, 'multiSelections'
  //   },
	// 	(filename) => {
	// 	if(filename === undefined){
	// 		console.log("No files were selected");
	// 		return;
	// 	}
	// 	console.log(filename);
	// 	fs.readFile(filename[0], "utf-8", (err, data) => {
	// 		if(err){
	// 			console.log("Cannot read file");
	// 			return;
	// 		}
	// 		console.log(data);
	// 		//editor.setValue(data);
	// 	});
	// });
	dialog.showOpenDialog({properties: ['openFile']}).then(res => {
		// console.log(res.canceled);
		// console.log(res.filePaths);
		if(!res.canceled){
				fs.readFile(res.filePaths[0], "utf-8", (err, data) => {
					if(err){
					//	console.log("Cannot read file");
						return;
					}
					//console.log(data);
					oFilePath = res.filePaths[0];
					auto_detect_lang(res.filePaths[0]);
					editor.setValue(data, 1);
				});
		}
	}).catch(err => {
			console.error(err);
			oFilePath = null;
	});
}

function newFile(){
	editor.setValue("", 1);
	oFilePath = null;
}

function saveFile(){
	if(oFilePath != null){
		fs.writeFile(oFilePath, editor.getValue(), function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    //console.log("The file was saved!");
	});
}else{
//	console.log("No file is open");
let content = editor.getValue();

// You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
// dialog.showSaveDialog((fileName) => {
//     if (fileName === undefined){
//         console.log("You didn't save the file");
//         return;
//     }
// 		console.log(fileName);
//     // fileName is a string that contains the path and filename created in the save file dialog.
//     fs.writeFile(fileName, content, (err) => {
//         if(err){
//             alert("An error ocurred creating the file "+ err.message)
//         }
//
//         alert("The file has been succesfully saved");
//     });
// });

var filename = dialog.showSaveDialog({}
    ).then(result => {
      filename = result.filePath;
      if (filename === undefined) {
    //    alert('the user clicked the btn but didn\'t created a file');
        return;
      }
      fs.writeFile(filename, content, (err) => {
        if (err) {
        //  alert('an error ocurred with file creation ' + err.message);
          return
        }
      //  alert('WE CREATED YOUR FILE SUCCESFULLY');
				oFilePath = filename;
				auto_detect_lang(filename);
      })
    //  alert('we End');
    }).catch(err => {
    //  alert(err)
			oFilePath = null;
    })

}
}

function saveAsFile(file){

//	console.log("No file is open");
let content = editor.getValue();

// You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)
// dialog.showSaveDialog((fileName) => {
//     if (fileName === undefined){
//         console.log("You didn't save the file");
//         return;
//     }
// 		console.log(fileName);
//     // fileName is a string that contains the path and filename created in the save file dialog.
//     fs.writeFile(fileName, content, (err) => {
//         if(err){
//             alert("An error ocurred creating the file "+ err.message)
//         }
//
//         alert("The file has been succesfully saved");
//     });
// });

var filename = dialog.showSaveDialog({file}
    ).then(result => {
      filename = result.filePath;
      if (filename === undefined) {
    //    alert('the user clicked the btn but didn\'t created a file');
        return;
      }
      fs.writeFile(filename, content, (err) => {
        if (err) {
        //  alert('an error ocurred with file creation ' + err.message);
          return
        }
      //  alert('WE CREATED YOUR FILE SUCCESFULLY');
				oFilePath = filename;
				auto_detect_lang(filename);
      })
    //  alert('we End');
    }).catch(err => {
    //  alert(err)
			oFilePath = null;
    })


}

function auto_detect_lang(filename) {

	var m = filename.split(".");
	var n = m[m.length-1];

	//console.log(n);
	if(n == "html" || n == "htm"){
		editor.session.setMode("ace/mode/html");
	}else if(n == "sql"){
		editor.session.setMode("ace/mode/mysql");
	}else if(n == "cpp" || n=="c"){
		editor.session.setMode("ace/mode/c_cpp");
	}else if(n == "glsl"){
		editor.session.setMode("ace/mode/glsl");
	}else if(n == "js"){
		editor.session.setMode("ace/mode/javascript");
	}else if(n == "txt" || n == ""){
		editor.session.setMode("ace/mode/plain_text");
	}else if(n == "json"){
		editor.session.setMode("ace/mode/json");
	}else if(n == "xml"){
		editor.session.setMode("ace/mode/xml");
	}else if(n == "java"){
		editor.session.setMode("ace/mode/java");
	}else if(n == "css"){
		editor.session.setMode("ace/mode/css");
	}else if(n == "json"){
		editor.session.setMode("ace/mode/json");
	}

}

function toggleWOrldwarp() {
	editor.setOption("wrap",  editor.getOption("wrap") == "off")
}
