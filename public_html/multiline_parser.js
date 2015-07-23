

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

//todo a lot of the todo's are from the orig pixel parser and need to be cleaned up
//todo the warnings are probably not working correctly


//todo also see this: https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications


//array to hold all the data that will go into the file
var output_array = [ ];


//pixel parser function
function parse_pixel(orig_querystring){		
			
        //NOTE that the regex can't have quotes around it
        var querystring = orig_querystring.replace(/&amp;/gi,'&');      
        
        //07-22-2015 remove newlines for a few reasons
        querystring = querystring.replace(/[\r\n]/gi,'');      
            
        var subTotal = 0;
        
        //if you set this to true, later will warn user about the subtotal
        var badSubtotal = false;
	
        var warnings = "";

        //parse pixel
       
        var pixelArray = querystring.split("&");
        var pixelDict = new Array();
              
        
                
        for(var i = 0; i < pixelArray.length; i++){
      
            
            //TODO valdiate that the pixel is correct before chopping it like this
            //and throw warnings, maybe even stop executing at that point
            //**branch the code before you start working on that, 
            //since may require major changes to the structure of the code
            //also note the for loop which goes through the ITEMs and stops when one is not found
            
            //look for AMTx etc
            //TODO do some changes to param names break parsing?
            //if the whole concept is to loop through ITEMx, that part needs to be correct
            //you could at least verify that's correct, and then later check the QTY and AMT
            usingX = pixelArray[i].match(/(dcntx)|(amtx)|(itemx)|(qtyx)/gi);
            if(usingX != null){
                    warnings += ' Warning: found bad parameter: ' + usingX;
                }
            
            var t = pixelArray[i].split("=");
            pixelDict[t[0].toUpperCase()] = t[1];
                
            
        }
			
            var itemList = "";
            var qtyBadChars = "";
            var itemBadChars = "";
            var amountBadChars = "";
            var amtBadChars = "";
            
            
            //store if we think tag is simple or item, etc
            var tagType = "";
            
            if(pixelDict["AMOUNT"] != undefined){
                
                amountBadChars = pixelDict["AMOUNT"].match(/[^0-9\.]/g);
                if(amountBadChars != null){
                    warnings += ' Warning: Illegal characters found in AMOUNT: ' + amountBadChars;
                    badSubtotal = true;
                }
                
                if( ! $.isNumeric(pixelDict["AMOUNT"])) {
                    
                    warnings += ' Warning: AMOUNT is not a numeric value: ' + pixelDict["AMOUNT"];
                    badSubtotal = true;
                }
                
                tagType = "simple";
		itemList = itemList + '<span class="params">AMOUNT</span>: ' + pixelDict["AMOUNT"]+'<br/>';
		subTotal = subTotal + parseFloat(pixelDict["AMOUNT"]);
            }
				
				
            if(pixelDict["CONTAINERTAGID"] != undefined){
		itemList = itemList + '<span class="params">CONTAINERTAGID</span>: ' + pixelDict["CONTAINERTAGID"]+'<br/>';
            }
				
            //show warning if coupon is missing
            if(pixelDict["COUPON"] == undefined){
                  warnings += ' Warning: COUPON is missing.';
            };
            
            
            if(pixelDict["COUPON"] != undefined){
		itemList = itemList + '<span class="params">COUPON</span>: ' + pixelDict["COUPON"]+'<br/>';
            }
				
            if(pixelDict["CURRENCY"] != undefined){
            itemList = itemList + '<span class="params">CURRENCY</span>: ' + pixelDict["CURRENCY"]+'<br/>';
            }
					
				
            if(pixelDict["DISCOUNT"] != undefined){
            itemList = itemList + '<span class="params">DISCOUNT</span>: ' + pixelDict["DISCOUNT"]+'<br/>';
            subTotal = subTotal - parseFloat(pixelDict["DISCOUNT"]);
            }
			
            itemList = itemList + '<img src="blue_line.png">';
			
			
            for(var n = 1; n < 100 + 1; n++){
				
            if(pixelDict["ITEM"+n] != undefined){
                
                //TODO add checks for all the other item-style params too
                //TODO BUG this is output too many times
                if(tagType == "simple"){
                    warnings += ' Warning: tag has both AMOUNT and ITEM params';
                    warnings += ' The subtotal will not be calculated for this reason.';
                    badSubtotal = true;
                }
                
                //match anything that is not dash, underscore, alphanumeric
                itemBadChars = pixelDict["ITEM"+n].match(/[^0-9A-Z\-_]/gi);

                if(itemBadChars != null){
                    warnings += ' Warning: Illegal characters found in ITEM'+n+': ' + itemBadChars;
                }
                
                
                itemList = itemList + '<br/>'+
                 '<span class="params_head">SKU GROUP NUMBER: '+n +'</span><br/>'+
                 '<span class="params">ITEM'+'</span>: ' + pixelDict["ITEM"+n]+'<br/>'+
                 '<span class="params">AMT'+'</span>: ' + pixelDict["AMT"+n] +'<br/>'+
                 '<span class="params">QTY'+'</span>: ' + pixelDict["QTY"+n] +'<br/>';

              
                //match anything that is not a number
                qtyBadChars = pixelDict["QTY"+n].match(/[^0-9]/g);

                if(qtyBadChars != null){
                    warnings += ' Warning: Illegal characters found in QTY'+n+': ' + qtyBadChars;
                    badSubtotal = true;
                }
	
					
		subTotal = subTotal + parseFloat(pixelDict["AMT"+n]) * parseFloat(pixelDict["QTY"+n]);
		
                amtBadChars = pixelDict["AMT"+n].match(/[^0-9\.]/g);
                if(amtBadChars != null){
                    warnings += ' Warning: Illegal characters found in AMT'+n+': ' + amtBadChars;
                    badSubtotal = true;
                }
                
                if( ! $.isNumeric(pixelDict["AMT"+n])) {
                    
                    warnings += ' Warning: AMT'+n+' is not a numeric value: ' + pixelDict["AMT"+n];
                    badSubtotal = true;
                }
                
                
         	if(pixelDict["DCNT"+n] != undefined){
                    itemList = itemList + '<span class="params">DCNT</span>: ' + pixelDict["DCNT"+n]+'<br/>';
                    subTotal = subTotal - parseFloat(pixelDict["DCNT"+n]);
		}
            }   else { 	
                
                    //TODO this is meant to stop normally when the array ends, 
                    //but note that it will stop if there is any break in the ITEMx consequtive order
                    break; 
                }
			
            }
			
			
            //show a warning if the subtoal is suspect
            if(badSubtotal === true){
                                
                warnings += ' Warning: Fields used in the order subtotal generated errors. The subtotal may be incorrect.';
            }
            
    
            
                    
            //07-22-2015 this was the way to write to the page itself (not usable)
            //$("#output_area").append(subTotal.toFixed(2) + "," + orig_querystring + "," + pixelDict["OID"] + "," + warnings + "<br>" );
            //here's the new way -- write to an array
            var debuginfo_arraysize = output_array.push(pixelDict["OID"] + "," + subTotal.toFixed(2) + "," + querystring + "," + warnings + "\n");
                        
            
            
              /*          
                //TODO check final HTML output for validity, there are a lot of randon DIVs etc
                $("#output_area").append('<br>' + warnings
                    +'<strong>SUBTOTAL: ' + subTotal + '</strong><br/><br/>'
                    +'<span class="params">CID</span>: ' + pixelDict["CID"] + '<br/>' 
                    +'<span class="params">TYPE</span>: ' + pixelDict["TYPE"] + '<br/>'
                    +'<span class="params">OID</span>: '+ pixelDict["OID"] + '<br/>'
                    + itemList 
                    +'</div></div><img src="blue_line.png">');
                */
                    
                //only toggle the area if it's hidden already, otherwise it gets hidden 
                if( $( "#output_area" ).is( ":hidden" ) ) {
                    
                    $( "#output_area" ).toggle( "slide","500" );    
                    
                }
      

                return;
}
 


//file load stuffs and other main stuffs
//also contains the stuff to save the file
  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var reader = new FileReader();
    
    
      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        
          
          
          return function() {
     
            var theText = reader.result;
            var myArray = theText.split(/[\n]/);
             
            //clear the div before adding output
            //$("#output_area").html("");
		
            for(var i=0;i<myArray.length;i++) {
                parse_pixel(myArray[i]);
            }
        
        /////////////////////////////////////////////////////
        /////////// NEW SAVE FILE STUFFS 07-22-2015 /////////
        
        //07-22-2015 I am creating a new array to hold all the data that will go in the file
        //instead of writing the output to the page
        
        var textFile = null,
        makeTextFile = function (text) {
            var data = new Blob([text], {type: 'text/plain'});

            // If we are replacing a previously generated file we need to
            // manually revoke the object URL to avoid memory leaks.
            if (textFile !== null) {
              window.URL.revokeObjectURL(textFile);
            }

            textFile = window.URL.createObjectURL(data);

            return textFile;
        };

     
        var link = document.getElementById('downloadlink');
        link.href = makeTextFile(output_array);
        link.style.display = 'block';
      
        
        
        ///////////////////////////////////////////
        /////////// END NEW SAVE FILE STUFFS //////
        
        
		
        };
      })(files[0]);

   reader.readAsText(files[0]);
	     
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);
  
  
  
  
  
/////////   writing the file  ////////////////////////////////
/////////from http://stackoverflow.com/questions/21012580/is-it-possible-to-write-data-to-file-using-only-javascript
///////////and http://jsfiddle.net/UselessCode/qm5AG/
  
/*  original sample code:

(function () {

    var textFile = null,
    makeTextFile = function (text) {
        var data = new Blob([text], {type: 'text/plain'});

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
          window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        return textFile;
  };


  var create = document.getElementById('create'),
    textbox = document.getElementById('textbox');

  create.addEventListener('click', function () {
    var link = document.getElementById('downloadlink');
    link.href = makeTextFile(textbox.value);
    link.style.display = 'block';
  }, false);
})();
*/
  
