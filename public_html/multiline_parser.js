

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



//pixel parser function
	function parse_pixel(orig_querystring){		
			
        //NOTE that the regex can't have quotes around it
        var querystring = orig_querystring.replace(/&amp;/gi,'&');      
        	
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
            
    
            
                    
            
            $("#output_area").append(subTotal.toFixed(2) + "," + orig_querystring + "," + pixelDict["OID"] + "," + warnings + "<br>" );
            
            
            
            
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
      

                return orig_querystring;
}
 

//todo try it without this
var myArray = [];


//file load stuffs
  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var reader = new FileReader();
    
    
      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        
          
          //todo does this have to return as anon func etc? think that is causing me issues
          return function() {
     
		var theText = reader.result;
                
                //todo is this how it was before? I was going to try and make it a global variable 
                //becuase I think there are scope
		myArray = theText.split(/[\n]/);
             
              //clear the div before adding output
                $("#output_area").html("");
		
                
                for(var i=0;i<myArray.length;i++) {

                    //the parser pixel function is now returning the original querystring, so you can log it and it will write to the console
                    //console.log(parse_pixel(myArray[i]));
                    //console.log(myArray[i]);
                    parse_pixel(myArray[i]);
                }
        
		
        };
      })(files[0]);

   reader.readAsText(files[0]);
	     
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);
  
  
  
  
  
  