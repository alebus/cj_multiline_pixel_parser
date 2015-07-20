//note this needs html5
//
//some code from http://www.html5rocks.com/en/tutorials/file/dndfiles/

//todo also see this: https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications


  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    f = files[0];

    var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
     
		var theText = reader.result;
		var myArray = theText.split(/[\n]/);
		
			for(i=0;i<myArray.length;i++) {
		
				console.log(myArray[i]);
		
			}
		
	 
			
        };
      })(f);

   reader.readAsText(f);
	     
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);