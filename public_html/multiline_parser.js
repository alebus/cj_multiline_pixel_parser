

/*
 * 
 * 
 *07-20-2015
 *note this needs HTML5 
 *file load code was based on http://www.html5rocks.com/en/tutorials/file/dndfiles/ 
 * 
 * 
 * 
 * 
 */




//todo also see this: https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications


  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function() {
     
		var theText = reader.result;
		var myArray = theText.split(/[\n]/);
	
                for(i=0;i<myArray.length;i++) {
		
                console.log(myArray[i]);
		
		}
		
        };
      })(files[0]);

   reader.readAsText(files[0]);
	     
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);