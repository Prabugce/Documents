var apply_Button= false; 
var DefalutLength,UpperCaseLength,Digitslength,specialCaseLength,LowerCaseLength,configValues,userpasscheck,pass_value,user,Snmp_v3Check1,Snmp_v3Check2;
var  authPass_Error=[];
var Privacypass_Errors=[];
var common_check=[];
var Auth_logic=false;
var correct= "&#10004;";

function validatePerc(tabName,cellVal)
{
        var table_ = document.getElementById(tabName);
        var num_rows = table_.rows.length;
        var arrLoop=0;
        var bigPerc=0;
        var totPerc=0;
        var remPerc=0;
        var index=0;
        var tabIndex=0;
        var yvalues = new Array(num_rows-1);

            for(var tLoop=1;tLoop<num_rows;tLoop++){
                yvalues[arrLoop] = table_.rows[tLoop].cells[cellVal].children[0].value;
                if(bigPerc < yvalues[arrLoop]) {
                 bigPerc = yvalues[arrLoop];
                 index = arrLoop;
            }
            totPerc = parseFloat(totPerc) + (parseFloat(yvalues[arrLoop]));
            arrLoop++;
            }
            totPerc=totPerc.toFixed(2);
            if(totPerc > 100) {
                remPerc = totPerc - 100;
                remPerc = parseFloat(remPerc).toFixed(2);
                yvalues[index] = (((parseFloat(yvalues[index])) - parseFloat(remPerc)).toFixed(2));
             }
             if(totPerc < 100) {
                 remPerc = 100 - totPerc;
                 yvalues[index] = (((parseFloat(yvalues[index])) + parseFloat(remPerc)).toFixed(2));
             }
             for( var tLoop=1;tLoop<num_rows;tLoop++){
                 table_.rows[tLoop].cells[cellVal].children[0].value = yvalues[tabIndex];
                 tabIndex++;
             }
}

function recordValues(recordedVals, typeVals) {
    var entryForm = document.forms[0];
    var j = 0, k = 0;
    var selElems = entryForm.getElementsByTagName('select');
    var selName = '';

    for (j = 0; j < selElems.length; j++) {
        if (selElems[j].disabled) {
            // skip disabled items
            continue;
        }
        // suffix the name with every selection index
        for (k = 0; k < selElems[j].options.length; k++) {
            selName = selElems[j].name + '_' + k;
            recordedVals[selName] = selElems[j].options[k].selected;
            if (arguments.length > 1) {
                typeVals[selName] = selElems[j].type;
            }
        }
    }

    // gather other input items
    var elems = entryForm.getElementsByTagName('input');
    var oldName = '';
    var ind = 0;
    var inTypes = '';
    lineStr = 'inTypes: ';
    for (j = 0; j < elems.length; j++) {
        if (elems[j].readOnly) {
            continue;
        }
        if (elems[j].disabled) {
            continue;
        }
        if (elems[j].type == 'hidden') {
            continue;
        }

        if (elems[j].type == 'checkbox' || elems[j].type == 'radio') {
            if (oldName != elems[j].name) {
                oldName = elems[j].name;
                ind = 0;
            } else {
                ind++;
            }
            elemName = elems[j].name + '_' + ind;
            recordedVals[elemName] = elems[j].checked;
            if (arguments.length > 1) {
                typeVals[elemName] = elems[j].type;
            }
        } else {
            oldName = elems[j].name;
            recordedVals[elems[j].name] = elems[j].value;
            if (arguments.length > 1) {
                typeVals[elems[j].name] = elems[j].type;
            }
        }
    }
}

function checkFormChanges() {
    // generic  method to check if user changeable fields in the form
    // changed which may require resetting the radio.
    var name;
    var name1;
    var entryForm = document.forms[0];
    var finalValues = new Array();
    var typeValues  = new Array();
    recordValues(finalValues, typeValues);

    // check if radio requires reset.
    // logic - for backhaul radio, most changes do not require reset of radio
    // those fields whose changes require radio to be reset are listed
    // in bhRadioResetFields.
    // for non-backhaul radios (eg. client access radios like b/g or
    // non backhaul A radio), all changes are considred for reset of radios.

    entryForm.resetRadio.value = 'FALSE';
    entryForm.dataChanged.value = 'FALSE';
    for (name in finalValues) {
        if (typeof initValues[name] == 'undefined') {
            continue;
        }
        if (finalValues[name] != initValues[name]) {
            entryForm.dataChanged.value = 'TRUE';
            if (entryForm.is_backhaul.value == "TRUE") {
                // set radioReset = TRUE only if a bhradioReset field is changed
                for (name1 in bhRadioResetFields) {
                    if (name.indexOf(name1) >= 0) {
                        entryForm.resetRadio.value = 'TRUE';
                        break;
                    }
                }
            } else { // A radio - not backhaul
                // all field changes are considered to require radio reset.
                entryForm.resetRadio.value = 'TRUE';
            }
        }
    }
}


function debugMsg(msg){
  if(debugOn) alert("[DEBUG]"+msg);
}
function extraDebugMsg(msg){
  if(extraDebugOn) alert("[EXTRA-DEBUG]"+msg);
}
function errMsg(msg){
  alert("[ERROR]"+msg);
}
/* Functions used by banner */

function saveConfigAction(){
     if(confirm(top.ARE_YOU_SURE_TO_SAVE_CFG)){
	   document.forms[0].buttonClicked.value = SAVECONFIG_CLICKED;
	   document.forms[0].submit();
     }

}

function pingAction(Msg,val){
    if(Msg == null)
        var address = prompt(top.ENTER_IP_ADDR,"");
    else
        var address = prompt(Msg,val); 

	if(address == null || address == "")
            return false;

    var res = address.substring(0,4)
    var interface = null;
    if( (res.match("FE80")) || (res.match("fe80")) )
    {
        interface =  prompt("Link Layer Address,requires Mandatory Source Interface(management/service-port)","");
        if(interface == null || interface ==  ""){
            return false;
        }
    }
	if(address != null){
        document.forms[0].interfaceType.value = interface;
        document.forms[0].ping_address.value = address;
        document.forms[0].buttonClicked.value = PING_CLICKED;
        document.forms[0].submit();
	}
}

//Added by jjain for mobility groups
function validateMac(macAddress){
	var value = trim(macAddress);
	var alertMsg = null;
	extraDebugMsg("<validateForm> value is "+value);
	if(value.length != macAddress.length){
	    alertMsg = macAddress +" : "+ top.MAC_ADDR_HAS_SPACES + "\n\n";
	    return alertMsg;
 	}

	if(value.length == 0) {
	    if (formAttrs.macAttrs[loop].isMandatory){
	        extraDebugMsg("<validateForm> length is zero and attr mandatory");
                alertMsg = top.MAC_ADDR_IS_MANDATORY+ "\n\n";
	    }
	    return alertMsg;
	}

	var pieces = value.split(":");
	if(pieces.length < 6 || pieces.length > 6){
	     alertMsg = value +" : "+top.MAC_ADDR_IS_INVALID +top.MAC_ADDR_FORMAT+"\n\n";
	     return alertMsg;
	}

	for(var k=0;k<6;k++){
	    if(pieces[k].length !=2){
		    alertMsg = value+" : "+top.MAC_ADDR_IS_INVALID +top.MAC_ADDR_BYTE +" : "+(k+1)+"\n\n";
		    return alertMsg;
	    }
	    if((isNaN(parseInt(pieces[k].substring(0,1),16)) || isNaN(parseInt(pieces[k].substring(1,2),16)))){
            alertMsg = value+" : "+top.MAC_ADDR_IS_INVALID +top.MAC_ADDR_BYTE +" : "+(k+1)+"\n\n";
	        return alertMsg;
	    }
	    if((pieces[k].indexOf(" ")>-1)){
	        alertMsg = value+" : "+top.MAC_ADDR_IS_INVALID +top.MAC_ADDR_BYTESPACE +" : "+(k+1)+"\n\n";
	        return alertMsg;
	    }
	}
	return alertMsg;
}

function validateMacFormat(macAddress){
    var value = trim(macAddress);
    var alertMsg = null;
    var FormatString ="Needs to have any one of the format (aa:bb:cc:dd:ee:ff) or (aa-bb-cc-dd-ee-ff) or (aabb.ccdd.eeff) or (aabbcc-ddeeff) or (aabbccddeeff)."
    extraDebugMsg("<validateForm> value is "+value);
    if(value.length != macAddress.length){
        alertMsg = macAddress +" : "+ top.MAC_ADDR_HAS_SPACES + "\n\n";
        return alertMsg;
    }

    if(value.length == 0) {
        if (formAttrs.macAttrs[loop].isMandatory){
            extraDebugMsg("<validateForm> length is zero and attr mandatory");
                alertMsg = top.MAC_ADDR_IS_MANDATORY+ "\n\n";
        }
        return alertMsg;
    }
    var pieces = 0;
    var macstring;
    if(value.length == 17){
    
    if(value.indexOf(":") >= 0){
       pieces = value.split(":");
       if(((pieces.length != 6) || (value.substring(2,3) != ":" ) || (value.substring(5,6) != ":" ) || (value.substring(8,9) != ":") || (value.substring(11,12) != ":") || (value.substring(14,15) != ":"))){
         alertMsg = value +" : "+top.MAC_ADDR_IS_INVALID +FormatString+"\n\n";
         return alertMsg;
    }
    }else{
       pieces = value.split("-");
       if((pieces.length != 6) || (value.substring(2,3) != "-" ) || (value.substring(5,6) != "-" ) || (value.substring(8,9) != "-") || (value.substring(11,12) != "-") || (value.substring(14,15) != "-") ){
            alertMsg = value +" : "+top.MAC_ADDR_IS_INVALID +FormatString+"\n\n";
            return alertMsg;
      }
    }
    macstring = pieces.join(""); 
    }else if(value.length == 14 && (value.substring(4,5) == ".") && (value.substring(9,10) == ".")){
        pieces = value.split(".");
        if(pieces.length < 3 || pieces.length > 3){
            alertMsg = value +" : "+top.MAC_ADDR_IS_INVALID +FormatString+"\n\n";
            return alertMsg;
        }
         macstring = pieces.join("");
    }else if(value.length == 13 && (value.substring(6,7) == "-")){
        pieces = value.split("-");
        if(pieces.length < 2 || pieces.length > 2){
            alertMsg = value +" : "+top.MAC_ADDR_IS_INVALID +FormatString+"\n\n";
            return alertMsg;
        }
         macstring = pieces.join("");
    }else if(value.length == 12){
        macstring = value;
    }else{
        alertMsg = value +" : "+top.MAC_ADDR_IS_INVALID +FormatString+"\n\n";
        return alertMsg;
    }
   if(macstring.length !=12){
        alertMsg = value+" : "+top.MAC_ADDR_IS_INVALID +top.MAC_ADDR_BYTE +"\n\n";
        return alertMsg;
   }
   if((/^[a-fA-F0-9]*$/.test(macstring)) == false){
      alertMsg = value+" : "+top.MAC_ADDR_IS_INVALID +top.MAC_ADDR_BYTE +"\n\n";
      return alertMsg;
   }
   if(macstring == "000000000000"){
      alertMsg = value+" : "+top.MAC_ADDR_IS_INVALID+"\n\n";
      return alertMsg;
   }
   return alertMsg;
}

function validateIp(ipAddress){
	var value = trim(ipAddress);
	var alertMsg = null;
	extraDebugMsg("<validateForm> value is "+value);
	if(value.length != ipAddress.length){
	  alertMsg = top.IP_ADDR_SPACES;
	  return alertMsg;
 	}

	if(value.length == 0){
	 if( formAttrs.ipAttrs[loop].isMandatory){
	  extraDebugMsg("<validateForm> length is zero and attr mandatory");
          alertMsg = top.IP_ADDR_MANDATORY;
	 }
	 return alertMsg;
	}

	var pieces = value.split(".");
	if(pieces.length < 4 || pieces.length > 4){
	   alertMsg = value+" : "+ top.IP_ADDR_INVALID+ " "+ top.IP_ADDR_DOTS;
	   return alertMsg;
	}

	for(var k=0;k<4;k++){
	  if(isNaN((pieces[k]))|| (pieces[k].length ==0)|| (pieces[k]>255 || pieces[k]<0)){
             alertMsg = value+" : "+  top.IP_ADDR_INVALID+ " "+ top.IP_ADDR_NOT_NUMBER +" : "+ (k+1);
	     return alertMsg;
	  }
	  if((pieces[k].indexOf(" ")>-1)){
	     alertMsg = value+" : "+  top.IP_ADDR_INVALID+ " "+ top.IP_ADDR_SPACE_NUMBER +" : "+ (k+1);
	     return alertMsg;
	  }
	}
    return alertMsg;
   }

function logoutAction(){
     debugMsg("<exitAction>");
     parent.location.href = "logout.html";



}


function editAction(index) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
     debugMsg("<editAction> index is "+index);
	document.forms[0].indexClicked.value = index;
	document.forms[0].buttonClicked.value = EDIT_CLICKED;
	debugMsg("<editAction> Calling submit");
	document.forms[0].submit();
}

function custom4ListAction(index) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
     debugMsg("<custom4ListAction> index is "+index);
        document.forms[0].indexClicked.value = index;
        document.forms[0].buttonClicked.value = CUSTOM4_CLICKED;
        debugMsg("<custom4ListAction> Calling submit");
        document.forms[0].submit();
}

function custom5ListAction(index) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
     debugMsg("<custom5ListAction> index is "+index);
        document.forms[0].indexClicked.value = index;
        document.forms[0].buttonClicked.value = CUSTOM5_CLICKED;
        debugMsg("<custom5ListAction> Calling submit");
        document.forms[0].submit();
}
function custom6ListAction(index) {
     debugMsg("<custom6ListAction> index is "+index);
        document.forms[0].indexClicked.value = index;
        document.forms[0].buttonClicked.value = CUSTOM6_CLICKED;
        debugMsg("<custom6ListAction> Calling submit");
        document.forms[0].submit();
}

function custom12ListAction(index) {
     debugMsg("<custom12ListAction> index is "+index);
        document.forms[0].indexClicked.value = index;
        document.forms[0].buttonClicked.value = CUSTOM12_CLICKED;
        debugMsg("<custom12ListAction> Calling submit");
        document.forms[0].submit();
}

function custom25ListAction(index) {
     debugMsg("<custom25ListAction> index is "+index);
        document.forms[0].indexClicked.value = index;
        document.forms[0].buttonClicked.value = CUSTOM25_CLICKED;
        debugMsg("<custom25ListAction> Calling submit");
        document.forms[0].submit();
}
function custom13ListAction(index) {
     debugMsg("<custom13ListAction> index is "+index);
        document.forms[0].indexClicked.value = index;
        document.forms[0].buttonClicked.value = CUSTOM13_CLICKED;
        debugMsg("<custom13ListAction> Calling submit");
        document.forms[0].submit();
}

function custom14ListAction(index) {
     debugMsg("<custom14ListAction> index is "+index);
        document.forms[0].indexClicked.value = index;
        document.forms[0].buttonClicked.value = CUSTOM14_CLICKED;
        debugMsg("<custom14ListAction> Calling submit");
        document.forms[0].submit();
}

function custom15ListAction(index) {
     debugMsg("<custom15ListAction> index is "+index);
        document.forms[0].indexClicked.value = index;
        document.forms[0].buttonClicked.value = CUSTOM15_CLICKED;
        debugMsg("<custom15ListAction> Calling submit");
        document.forms[0].submit();
}

function custom17ListAction(index) {
    debugMsg("<custom17ListAction> index is "+index);
    document.forms[0].indexClicked.value = index;
    document.forms[0].buttonClicked.value = CUSTOM17_CLICKED;
    debugMsg("<custom17ListAction> Calling submit");
    document.forms[0].submit();
}



function editList1Action(index) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
     debugMsg("<editAction> index is "+index);
	document.forms[0].indexClicked.value = index;
	document.forms[0].buttonClicked.value = LIST1_EDIT_CLICKED;
	debugMsg("<editAction> Calling submit");
	document.forms[0].submit();
}

function editList2Action(index) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
     debugMsg("<editAction> index is "+index);
	document.forms[0].indexClicked.value = index;
	document.forms[0].buttonClicked.value = LIST2_EDIT_CLICKED;
	debugMsg("<editAction> Calling submit");
	document.forms[0].submit();
}

function custom1ListAction(index) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
     debugMsg("<editAction> index is "+index);
	document.forms[0].indexClicked.value = index;
	document.forms[0].buttonClicked.value = CUSTOM1_CLICKED;
	debugMsg("<editAction> Calling submit");
	document.forms[0].submit();
}

function custom2ListAction(index) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
     debugMsg("<editAction> index is "+index);
	document.forms[0].indexClicked.value = index;
	document.forms[0].buttonClicked.value = CUSTOM2_CLICKED;
	debugMsg("<editAction> Calling submit");
	document.forms[0].submit();
}

function custom3ListAction(index) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
     debugMsg("<editAction> index is "+index);
	document.forms[0].indexClicked.value = index;
	document.forms[0].buttonClicked.value = CUSTOM3_CLICKED;
	debugMsg("<editAction> Calling submit");
	document.forms[0].submit();
}

function createNewAction(link) {
//******************************************************************************
//* Purpose: called when create new button is clicked
//*
//* Inputs: link to the page
//*
//* Return:  none
//******************************************************************************
     debugMsg("<createAction> link is "+link);
	var noerror = true;
	if(createNewBusinessLogicImplemented)
		noerror = validateCreateNewBusinessLogic();
	if(noerror) document.location.href = link;
}

function deleteActionWithNoMsg(index) {
//******************************************************************************
//* Purpose: delete Action
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<deleteAction> index is "+index);
     document.forms[0].indexClicked.value = index;
     document.forms[0].buttonClicked.value = DELETE_CLICKED;
     document.forms[0].submit();
}

function deleteAction(index) {
//******************************************************************************
//* Purpose: delete Action
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<deleteAction> index is "+index);
	if(confirm(top.ARE_YOU_SURE_DELETE)){
		document.forms[0].indexClicked.value = index;
		document.forms[0].buttonClicked.value = DELETE_CLICKED;
		document.forms[0].submit();
	}
}/*	var editWindow = window.open(window.location.href,"editWindow","width=500,height=500,status=yes,resizable=yes");*/

function submitAction() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<submitAction>");
	var noerror = true;
    if(InitializeArray)
            InitializedArray();
	if(thisFormAttrs != null)
		noerror = validateForm(document.forms[0],thisFormAttrs);
        if(noerror && businessLogicImplemented)
		noerror = validateBusinessLogic(document.forms[0].thisFormAttrs);
	if(noerror){
	        document.forms[0].buttonClicked.value = SUBMIT_CLICKED;
		document.forms[0].submit();
	}else if(onErrorFormSubmit) {
         assignOldFormValue();
    }
}
function clearAction() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<clearAction>");
     document.forms[0].buttonClicked.value = CLEAR_CLICKED;
     document.forms[0].submit();
}
function exitAction() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<exitAction>");
     if(confirm(""))
     window.close(self);
}
function custom1Action() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<custom1Action>");
	var noerror = true;
	if(noerror){
	        document.forms[0].buttonClicked.value = CUSTOM1_CLICKED;
		document.forms[0].submit();
	}
}

function custom2Action() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<custom2Action>");
	var noerror = true;
	if(noerror){
	        document.forms[0].buttonClicked.value = CUSTOM2_CLICKED;
		document.forms[0].submit();
	}
}

function custom1ActionWithMsg(msg) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<custom1Action>");
	var noerror = confirm(msg);
	if(noerror){
	        document.forms[0].buttonClicked.value = CUSTOM1_CLICKED;
		document.forms[0].submit();
	}
}
function custom2ActionWithMsg(msg) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<custom2Action>");
	var noerror = confirm(msg);
	if(noerror){
	        document.forms[0].buttonClicked.value = CUSTOM2_CLICKED;
		document.forms[0].submit();
	}
}

function custom3ActionWithMsg(msg) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<custom3Action>");
	var noerror = confirm(msg);
	if(noerror){
	        document.forms[0].buttonClicked.value = CUSTOM3_CLICKED;
		document.forms[0].submit();
	}
}


function custom6ActionWithMsg(msg) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<custom6Action>");
        var noerror = confirm(msg);
        if(noerror){
                document.forms[0].buttonClicked.value = CUSTOM6_CLICKED;
                document.forms[0].submit();
        }
}

function custom7ActionWithMsg(msg) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<custom7Action>");
        var noerror = confirm(msg);
        if(noerror){
                document.forms[0].buttonClicked.value = CUSTOM7_CLICKED;
                document.forms[0].submit();
        }
}

function custom8ActionWithMsg(msg) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<custom8Action>");
        var noerror = confirm(msg);
        if(noerror){
                document.forms[0].buttonClicked.value = CUSTOM8_CLICKED;
                document.forms[0].submit();
        }
}

function custom9ActionWithMsg(msg) {
//******************************************************************************//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************
     debugMsg("<custom9Action>");
        var noerror = confirm(msg);
        var CUSTOM9_CLICKED = PORT_CONFIG_CLICKED;
        if(noerror){
                document.forms[0].buttonClicked.value = CUSTOM9_CLICKED;
                document.forms[0].submit();
        }
}

function custom14ActionWithMsg(msg) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<custom14Action>");
        var noerror = confirm(msg);
        if(noerror){
                document.forms[0].buttonClicked.value = CUSTOM14_CLICKED;
                document.forms[0].submit();
        }
}


function submitActionWithMsg(msg) {
        var noerror = true;
        if(thisFormAttrs != null)
                noerror = validateForm(document.forms[0],thisFormAttrs);
        if(noerror)
                noerror = confirm(msg);
        if(noerror){
                document.forms[0].buttonClicked.value = SUBMIT_CLICKED;
                document.forms[0].submit();
        }
}

function customActionWithMsg(msg) {
        var noerror = true;
        if(thisFormAttrs != null)
                noerror = validateForm(document.forms[0],thisFormAttrs);
        if(noerror)
                noerror = confirm(msg);
        if(noerror){
                document.forms[0].buttonClicked.value = CUSTOM1_CLICKED;
                document.forms[0].submit();
        }
}
function createSubmitAction() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

  debugMsg("<createSubmitAction>");
	var noerror = true;
	if(thisFormAttrs != null)
		noerror = validateForm(document.forms[0],thisFormAttrs);
        if(noerror && businessLogicImplemented)
		noerror = validateBusinessLogic(document.forms[0].thisFormAttrs);
        if(noerror){
		document.forms[0].buttonClicked.value = SUBMIT_CLICKED;
		document.forms[0].submit();
	}
}
function cancelAction() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

     debugMsg("<cancelAction> ");
      document.forms[0].buttonClicked.value = CANCEL_CLICKED;
      document.forms[0].submit();
}

function portConfigAction(index) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
     debugMsg("<portConfigAction> index is "+index);
	document.forms[0].indexClicked.value = index;
	document.forms[0].buttonClicked.value = PORT_CONFIG_CLICKED;
	debugMsg("<portConfigAction> Calling submit");
	document.forms[0].submit();
}
function listofAps(index) {
        debugMsg("<listofAps> index is "+index);
	document.forms[0].indexClicked.value = index;
	document.forms[0].buttonClicked.value = CUSTOM1_CLICKED;
	debugMsg("<listofAps> Calling submit");
	document.forms[0].submit();
}

function portStpAction(index) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
     debugMsg("<portStpAction> index is "+index);
	document.forms[0].indexClicked.value = index;
	document.forms[0].buttonClicked.value = PORT_STP_CLICKED;
	debugMsg("<portStpAction> Calling submit");
	document.forms[0].submit();
}

/*
function helpAction(pageId,startpage) {
//******************************************************************************
//* Purpose: invoked when edit button is pressed
//*
//* Inputs: index
//*
//* Return:  none
//******************************************************************************
//     debugMsg("<helpAction> helpHref is "+helpHref);
     var baseHref = window.location.href;
     var index = baseHref.indexOf("/screens");
     baseHref = baseHref.substring(0,index);
     var href ="/helpfiles/oweb/index.html";
     var editWindow = window.open(baseHref+href,"editWindow","left=100 top=50 menubar=no,toolbar=yes,width=800,height=600,status=yes,resizable=yes");
     if(navigator.appName != "Netscape"){
       editWindow.location.href = baseHref + href;
       editWindow.location.reload(true);
      }
     editWindow.focus();
}
*/

function getHtmlForRegenerateCertificateButton(){
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
<input type="button" name="regenerate" value="',top.REGEN_CERT,'" class="buttonstretch" onClick="javascript:custom1Action();">\
');
}

function getHtmlForRegenerateCertificateButton(msg){
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
<input type="button" name="regenerate" value="',top.REGEN_CERT,'" class="buttonstretch" onClick="custom1ActionWithMsg(\'',msg,'\');">\
');
}

function getHtmlForRegenerateCertificateButton(msg){
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
<input type="button" name="regenerate" value="',top.REGEN_CERT,'" class="buttonstretch" onClick="custom1ActionWithMsg(\'',msg,'\');">\
');
}

function getHtmlForRegenerateCertificateButton(msg){
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
<input type="button" name="regenerate" value="',top.REGEN_CERT,'" class="buttonstretch" onClick="custom1ActionWithMsg(\'',msg,'\');">\
');
}

function getHtmlForDeleteCertificateButton(msg){
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
<input type="button" name="delete" value="',top.DELETE_CERT,'" class="buttonstretch" onClick="custom2ActionWithMsg(\'',msg,'\');">\
');
}

function getHtmlForSaveAndRebootButton(){
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
<input type="button" name="apply" value="',top.SAVE_REBOOT,'" class="buttonstretch" onClick="this.blur();rebootSubmitAction();">\
');
}
/*functions used by  save_check.html*/

function getHtmlForRebootWithoutSaveButton(){
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
<input type="button" name="apply" value="',top.REBOOT_WITHOUT_SAVE,'" class="buttonstretch" onClick="this.blur();rebootCustom1Action();">\
');
}

function getHtmlForRebootButton() {
    document.writeln('<input type="button" name="apply" value="Reboot" class="buttonstretch" onClick="this.blur();rebootCustom2Action();">');
}


function getHtmlForSetToFactoryDefaultButton80211a(){
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
        <table cellpadding="0" cellspacing="0" border="0">\
          <tr>\
            <td class="label1" colspan="2" nowrap>',top.FAC_DEF,'</td>\
          </tr>\
          <tr>\
            <td colspan="2" class="horizLine"><img src="../../images/spacer.gif" width="1" height="1"></td>\
          </tr>\
\
          <tr>\
            <td class="label2" colspan="2">',top.SET_ALL_802_11a_PARMS,'</td>\
          </tr>\
          <tr>\
            <td class="label2">\
                <input type="button" name="default" value="',top.SET_TO_FAC_DEF,'" class="buttonstretch" onClick="javascript:custom3ActionWithMsg(top.ARE_YOU_SURE_RESET_802_11a);">\
            </td>\
          </tr>\
        </table>\
');
}

function getHtmlForSetToFactoryDefaultButton80211b(){
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
        <table cellpadding="0" cellspacing="0" border="0">\
          <tr>\
            <td class="label1" colspan="2" nowrap>',top.FAC_DEF,'</td>\
          </tr>\
          <tr>\
            <td colspan="2" class="horizLine"><img src="../../images/spacer.gif" width="1" height="1"></td>\
          </tr>\
\
          <tr>\
            <td class="label2" colspan="2">',top.SET_ALL_802_11b_PARMS,'</td>\
          </tr>\
          <tr>\
            <td class="label2">\
                <input type="button" name="default" value="',top.SET_TO_FAC_DEF,'" class="buttonstretch" onClick="javascript:custom3ActionWithMsg(top.ARE_YOU_SURE_RESET_802_11b);">\
            </td>\
          </tr>\
        </table>\
');
}


function rebootSubmitAction(){
 if(confirm(top.CFG_SAVE_REBOOT))
   submitAction();
}

function rebootCustom1Action(){
 if(confirm(top.CFG_NOT_SAVE_REBOOT))
   custom1Action();
}

function rebootCustom2Action() {
    if(confirm("Click OK to continue the reboot."))
        custom2Action();
}

/* USed by mobile_station_list page */
function drawClientNextButton(){
  var start = document.forms[0].start_index.value;
  var end   = document.forms[0].end_index.value;
  var total = document.forms[0].total_ms.value;
//  alert("start is "+start+" end is "+end+" total is "+total);
//  alert((total-end) > 0);
  if((total-end) > 0){
//     alert("next button case");
     document.writeln('<input type="button" name="next" value="',top.NEXT,'" class="button" onClick="javascript:custom1Action();">');
  }else if(start > 1){
//  alert("back to start case");
 document.writeln('<input type="button" name="next" value="',top.BACK_TO_START,'" class="buttonstretch" onClick="javascript:custom1Action();">');
  }
}

function drawPagingNextButton(){
  var start = document.forms[0].start_index.value;
  var end   = document.forms[0].end_index.value;
  var total = document.forms[0].total_rows.value;
//  alert("start is "+start+" end is "+end+" total is "+total);
//  alert((total-end) > 0);
  if((total-end) > 0){
//     alert("next button case");
     document.writeln('<input type="button" name="next" value="',top.NEXT,'" class="button" onClick="javascript:custom1Action();">');
  }else if(start > 1){
//  alert("back to start case");
 document.writeln('<input type="button" name="next" value="',top.BACK_TO_START,'" class="buttonstretch" onClick="javascript:custom1Action();">');
  }
}

function drawPagingPreviousButton(){
  var start = document.forms[0].start_index.value;
  //alert("start is "+start+" end is "+end+" total is "+total);
  //alert((total-end) > 0);
  if(start > 1)
//   alert("previous button case");
     document.writeln('<input type="button" name="previous" value="',top.PREVIOUS,'" class="button" onClick="javascript:custom2Action();">');
}

function drawRogueNextButton(){
  var start = document.forms[0].start_index.value;
  var end   = document.forms[0].end_index.value;
  var total = document.forms[0].total_rogues.value;
  //alert("start is "+start+" end is "+end+" total is "+total);
  //alert((total-end) > 0);
  if((total-end) > 0){
//   alert("next button case");
     document.writeln('<input type="button" name="next" value="',top.NEXT,'" class="button" onClick="javascript:custom1Action();">');
  }else if(start > 1){
//   alert("back to start case");
     document.writeln('<input type="button" name="next" value="',top.BACK_TO_START,'" class="buttonstretch" onClick="javascript:custom1Action();">');
  }
}

function drawRoguePreviousButton(){
  var start = document.forms[0].start_index.value;
  //alert("start is "+start+" end is "+end+" total is "+total);
  //alert((total-end) > 0);
  if(start > 1)
//   alert("previous button case");
     document.writeln('<input type="button" name="previous" value="',top.PREVIOUS,'" class="button" onClick="javascript:custom2Action();">');
}

function DisplayErrorMsg()
//******************************************************************************
//* Purpose: Display an input error message.
//* Return:  none
//******************************************************************************
{
    alert(document.forms[0].err_msg.value);
}
function DisplayInfoMsg()
//******************************************************************************
//* Purpose: Display an input error message.
//* Return:  none
//******************************************************************************
{
    //alert(document.forms[0].info_msg.value);

}

//******************************************************************************
//* Purpose: Display an input info message.
//* Return:  none
//******************************************************************************
function displayInfo()
{
	if (displayInfoMsg && document.forms[0].info_flag &&
	document.forms[0].info_flag.value == 1) {
	    alert(document.forms[0].info_msg.value);
	}
}

function CheckErrorAndSetAutoRefresh(){
CheckError();
window.setTimeout(screen_refresh,30000);
}

function CheckErrorWithVisio(){
	visioAction();
	CheckError();
}
function CheckError()
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

{
   debugMsg("<CheckError> Entering");
   if (document.forms[0].err_flag.value == 1) {
      DisplayErrorMsg();
   }
   if (displayInfoMsg && document.forms[0].info_flag &&
	document.forms[0].info_flag.value == 1) {
      DisplayInfoMsg();
   }
   debugMsg("<CheckError> Leaving");
}

function CheckEditError()
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

{
   if(document.forms[0].actionStatus.value == ACTION_SUCCESS){
      //success
/*      window.opener.location.reload(true);
      window.close();*/
   }
   if (document.forms[0].err_flag.value == 1) {
      DisplayErrorMsg();
   }
}


function reload() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

	debugMsg("reload");
	window.location.reload()
}
saveConfigString = top.SAVE_CFG;

function writeConfigSaveString() {
//******************************************************************************
//* Purpose:
//*/*	var editWindow = window.open(window.location.href,"editWindow","width=500,height=500,status=yes,resizable=yes");*/

//* Inputs:
//*
//* Return:  none
//******************************************************************************

document.writeln('\
		<table>\
			<tr><td width="25">&nbsp;\
			</td><td>\
			<script>\
			document.writeln(saveConfigString)\
			</script>\
			</td><td width="25">&nbsp;\
			</td></tr>\
		</table>')

}

function screen_refresh()
{
    document.forms[0].buttonClicked.value = REFRESH_CLICKED;
    document.forms[0].submit();
}

function contentframe_screen_refresh()
{
   //get hold of subframe reference
    var doc = top.frames[1].content.document;
    var len;

    if(top.disableFormTextArea == true){
    var elements = doc.forms[0].getElementsByTagName("textarea");
    for (var i = 0, len = elements.length; i < len; i++) {
        elements[i].disabled = true;
    }
    }
    //if subform implented then check if form1 is present
    //or subFormUrl is present
    if ( top.subFormImplemented == true){
        if(doc.forms[1] != null){
          doc.forms[1].buttonClicked.value = REFRESH_CLICKED;
          doc.forms[1].submit();
        }
        else{
          //this is case  where page can be loaded by URL
          // from navigation page- just reload the content URL
          mainframe=top.frames[1].document;
          mainframe.getElementById('content').src=doc.URL;
          
        }
    }else{
        doc.forms[0].buttonClicked.value = REFRESH_CLICKED;
        doc.forms[0].submit();
    }
}



function drawEditButton(index) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawEditButton>index is"+index);
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td align="middle"class="form-buttons"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:editAction(',index,');">',top.EDIT,'</a></td>')

}

function drawDetailButton(index) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawEditButton>index is"+index);
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td align="middle"class="form-buttons"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:editAction(',index,');">',top.DETAIL,'</a></td>')

}

function drawCustomEditButton(str,index) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawEditButton>index is"+index);
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td align="middle"class="form-buttons"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:editAction(',index,');">',str,'</a></td>')

}

function drawCustom1ListButton(str,index) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawEditButton>index is"+index);
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td align="middle"class="form-buttons"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:custom1ListAction(',index,');">',str,'</a></td>')

}

function drawCustom2ListButton(str,index) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawEditButton>index is"+index);
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td align="middle"class="form-buttons"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:custom2ListAction(',index,');">',str,'</a></td>')

}

function drawCustom3ListButton(str,index) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawEditButton>index is"+index);
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td align="middle"class="form-buttons"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:custom3ListAction(',index,');">',str,'</a></td>')

}

function getHtmlForRemoveButton(index){
debugMsg("<getHtmlForRemoveButton>index is"+index);
//if(document.forms[0].access_control.value != 1) return;
debugMsg("<getHtmlForRemoveButton> access granted");
document.writeln('\
<a href="javascript:deleteAction(',index,')">',top.REMOVE,'</a>\
');
}
function drawDeleteButton(index) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawDeleteButton>index is"+index);
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td align="middle" class="form-buttons"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:deleteAction(',index,');">',top.REMOVE,'</a></td>')

}

function getHtmlForButton(nameStr, str, bClass,onClickFn){

    if(nameStr == null || nameStr ==""
      || str == null || str ==""
      || onClickFn == null || onClickFn =="") {
        debugMsg("One of the input params for the button is not available");
        return;
    }
    document.writeln('\
    <input type="button" name="',nameStr,'" value="',str,'" class="',bClass,'"  onClick="',onClickFn,'">\
    ')
}

function getHtmlForApplyButton(str){
//debugMsg("getHtmlForApplyButton");
//if(document.forms[0].access_control.value != 1) return;
debugMsg("getHtmlForApplyButton access granted");
if(str == null || str =="") {
	document.writeln('\
	<input type="button" name="apply" value="',top.APPLY,'" class="button" onClick="javascript:submitAction()">\
	')
}
else{
	document.writeln('\
	<input type="button" name="apply" value="',str,'" class="button" onClick="javascript:submitAction()">\
	')
}
}

function getHtmlForSubmitButton(){
debugMsg("getHtmlForApplyButton access granted");
document.writeln('\
	<input type="button" name="apply" value="Submit" onClick="javascript:submitAction()">\
	')
}

function getHtmlForDetailButton(index){
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:editAction(',index,');">',top.DETAIL,'</a>\
	')
}
function getHtmlForCustom4ListButton(str,index) {
//debugMsg("getHtmlForCustom4ListButton");
        document.writeln('\
        <a href="javascript:custom4ListAction(',index,');">',str,'</a>\
        ')
} 
function getHtmlForCustom5ListButton(str,index) {
//debugMsg("getHtmlForCustom5ListButton");
        document.writeln('\
        <a href="javascript:custom5ListAction(',index,');">',str,'</a>\
        ')
}
function getHtmlForEditButton(index){
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:editAction(',index,');">',top.EDIT,'</a>\
	')
}

function getHtmlForEdit(index){
//debugMsg("getHtmlForEditButton");
        document.writeln('\
        <a onclick="javascript:editAction(',index,');">')
}
function getHtmlForCustom12(index){
      document.writeln('\
          <a onclick="javascript:custom12ListAction(',index,');">')
}
function getHtmlForCustom25(index){
      document.writeln('\
                <a onclick="javascript:custom25ListAction(',index,');">')
}
function endHtmlEdit(){
	document.writeln('\
	</a> ');
}
function getHtmlForCustomEditButton(str,index){
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:editAction(',index,');">',str,'</a>\
	')
}

function getHtmlForCustom2ListButton(str,index){
//if(document.forms[0].access_control.value != 1) return;
debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:custom2ListAction(',index,');">',str,'</a>\
	')
}

function getHtmlForCustom3ListButton(str,index){
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:custom3ListAction(',index,');">',str,'</a>\
	')
}


function getHtmlForCustom1Button(str){
//if(document.forms[0].access_control.value != 1) return;
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:custom1Action();">',str,'</a>\
	')
}

function getHtmlForCustom2Button(str){
//if(document.forms[0].access_control.value != 1) return;
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:custom2Action();">',str,'</a>\
	')
}

function getHtmlForCustomEditList1Button(str,index){
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:editList1Action(',index,');">',str,'</a>\
	')
}

function getHtmlForCustomEditList2Button(str,index){
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:editList2Action(',index,');">',str,'</a>\
	')
}

function getHtmlForPortButton(str,index){
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:portConfigAction(',index,');">',str,'</a>\
	')
}
function getHtmlForAPlist(str,index){
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:listofAps(',index,');">',str,'</a>\
	')
}


function getHtmlForCustom1ListButton(str,index){
//debugMsg("getHtmlForEditButton");
	document.writeln('\
	<a href="javascript:custom1ListAction(',index,');">',str,'</a>\
	')
}

function drawSubmitButton(str) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************
//if(document.forms[0].access_control.value != 1) return;
if(str == null || str =="") {
document.writeln('\
                            <td align="middle" class="form-buttons"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:submitAction();">',top.APPLY,'</a></td>\
			')
}else{
document.writeln('\
                            <td align="middle" class="form-buttons" \
                              valign="center"><a class="form-buttons"\
                              href="javascript:submitAction();">',str,'</a></td>\
			')
}
debugMsg("<drawSubmitButton>");

}

function getHtmlForRefreshButton(){
document.writeln('\
<input type="button" name="refresh" value="',top.REFRESH,'" class="button" onclick="screen_refresh()">\
');
}

function drawRefreshButton() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************
document.writeln('\
                            <td class="form-buttons" align="center"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:screen_refresh();">',top.REFRESH,'</a></td>\
			')


debugMsg("<drawSubmitButton>");

}

function getHtmlForClearCounterButton(str){
//if(document.forms[0].access_control.value != 1) return;
if(str == null || str =="")
document.writeln('<input type="button" name="clear" value="',top.CL_COUNTERS,' Counters" class="buttonstretch" onclick="clearAction()">');
else
document.writeln('<input type="button" name="clear" value="',str,'" class="buttonstretch" onclick="clearAction()">');
}

function drawClearCounterButton(str) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************
if(str == null || str =="") {
document.writeln('\
                            <td align="middle" class="form-buttons"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:clearAction();">',top.CL_COUNTERS,'</a></td>\
			')
}else{
document.writeln('\
                            <td align="middle" class="form-buttons" \
                              valign="center"><a class="form-buttons"\
                              href="javascript:clearAction();">',str,'</a></td>\
			')
}
debugMsg("<drawSubmitButton>");

}


function drawCustom1Button(str) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawCustom1Button>");
document.writeln('\
                            <td align="left" class="form-buttons" \
                              valign="center"><a class="form-buttons"\
                              href="javascript:custom1Action();">',str,'</a></td>\
			')
}

function drawAdjCustom1Button(str) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawCustom1Button>");
document.writeln('\
                            <a class="form-buttons"\
                              href="javascript:custom1Action();">',str,'</a>\
			')
}


function drawCustom1Link(str) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawCustom1Button>");
document.writeln('\
                            <td align="left" COLSPAN=2\
                              valign="center"><a class="form-links"\
                              href="javascript:custom1Action();">',str,'</a></td>\
			')
}


function drawCustom2Button(str) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawCustom2Button>");
document.writeln('\
                            <td align="middle" class="form-buttons" \
                              valign="center"><a class="form-buttons"\
                              href="javascript:custom2Action();">',str,'</a></td>\
			')
}

function drawCustom1ButtonWithMsg(str,msg) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawCustom1Button>");
document.writeln('\
                            <td align="left" class="form-buttons" \
                              valign="center"><a class="form-buttons"\
                              href="javascript:custom1ActionWithMsg(\'',msg,'\');">',str,'</a></td>\
			')
}


function drawCustom2ButtonWithMsg(str,msg) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawCustom2Button>");
document.writeln('\
                            <td align="left" class="form-buttons" \
                              valign="center"><a class="form-buttons"\
                              href="javascript:custom2ActionWithMsg(\'',msg,'\');">',str,'</a></td>\
			')
}

function drawCustom3ButtonWithMsg(str,msg) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawCustom3Button>");
document.writeln('\
                            <td align="left" class="form-buttons" \
                              valign="center"><a class="form-buttons"\
                              href="javascript:custom3ActionWithMsg(\'',msg,'\');">',str,'</a></td>\
			')
}

function drawCancelButton() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawCancelButton>");
document.writeln('<td><TABLE align="right"><tr>\
                            <td class="form-buttons"\
                              align="right"><a class="form-buttons"\
                              href="javascript:cancelAction();">',top.BACK,'</a></td></tr></TABLE></td>')
}

function getHtmlForHelpButton(pageId){
//debugMsg("getHtmlForHelpButton");
//document.writeln('&nbsp;')
//document.writeln('\
//<input type="button" name="help" value="',top.HELP,'" class="button" onClick="javascript:helpAction(\''+pageId+'\',\''+"undefined"+'\')">\
//')

}


function getHtmlForHelpButton(pageId,startpage){
//debugMsg("getHtmlForHelpButton");
//document.writeln('&nbsp;')
//document.writeln('\
//<input type="button" name="help" value="',top.HELP,'" class="button" onClick="javascript:helpAction(\''+pageId+'\',\''+startpage+'\')">\
//')

}


function getHtmlForCustom2ButtonOnPage(str){
//if(document.forms[0].access_control.value != 1) return;
debugMsg("getHtmlForEditButton");
	document.writeln('\
	<input type="button" name="remove" value=',str,' class="button" onClick="javascript:custom2Action();">\
	')
}

function getHtmlForBackButton(){
debugMsg("getHtmlForBackButton");
document.writeln('\
<input type="button" name="back" value="&lt; ',top.BACK,'" class="button" onclick="javascript:cancelAction()">\
')

}

function drawHelpButton(helpHref) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************
debugMsg("<drawHelpButton>");
//document.writeln('<td><TABLE align="right"><tr>\
//                            <td class="form-buttons"\
//                              align="right"><a class="form-buttons"\
//                              href="javascript:helpAction(\'',helpHref,'\')">Help</a></td></tr>')
//
//document.writeln('</TABLE></td>')
}

function getHtmlForCreateNewButton(link){
debugMsg("getHtmlForCreateNewButton link is "+link);
//if(document.forms[0].access_control.value != 1) return;
debugMsg("getHtmlForCreateNewButton access granted");
document.writeln('\
 <input type="button" name="new" value="',top.bNEW,'" class="button" onclick="javascript:createNewAction(\'',link,'\');">\
');
}

function getHtmlForCustomCreateNewButton(str,link){
debugMsg("getHtmlForCreateNewButton link is "+link);
//if(document.forms[0].access_control.value != 1) return;
debugMsg("getHtmlForCreateNewButton access granted");
document.writeln('\
 <input type="button" name="new" value=',str,' class="buttonstretch" onclick="javascript:createNewAction(\'',link,'\');">\
');
}

function drawCreateNewButton(name,link) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawCreateButton> name is "+name+" and link is "+link);
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td align="middle" class="form-buttons" \
                              valign="center"><a class="form-buttons"\
                              href="javascript:createNewAction(\'',link,'\');">',name,'</a></td>')

}
 
	

function ConfigPolicy1()
{
var text= '<ul style="list-style-type:none;"><li style="display:none;" id="cisco_password" class="gray"></li> <li id="minlength" style="display:none;" class="gray"></li><li id="User_Pass" style="display:none;" class="gray"></li><li id="UpperCheck" style="display:none;" class="gray"> </li><li id="LowerCheck" style="display:none;" class="gray"><li id="DigitCheck" style="display:none;" class="gray"></li><li id="netuserSpecialCheck" style="display:none;" class="gray"></li><li id="SpecialCheck" style="display:none;" class="gray"></li><li id="consectiveCheck" style="display:none;"class="gray"></li></ul>';

document.getElementById("Net_user_ErrorContent").innerHTML= text;
var lengthcheck= document.getElementById("minlength");
var passcheck= document.getElementById("cisco_password");
userpasscheck= document.getElementById("User_Pass");
 
var consecutive= document.getElementById("consectiveCheck");
configValues= document.getElementById("ConfigLength").value; 
 
var uppercase= document.getElementById("UpperCheck");
var lowercase= document.getElementById("LowerCheck"); 
var specialcase= document.getElementById("netuserSpecialCheck");


lengthcheck.style.display="block";
lengthcheck.innerHTML=  "<span class='symbol1'>&#10004;</span>  Password is must contain minimum of" +" "+8; 
 
 passcheck.style.display="block";
passcheck.innerHTML=   "<span class='symbol1'>&#10004;</span>"+ " "+ "Password should  not contain 'cisco'";

var Defaluterror= "<span class='symbol1'>&#10004;</span> Password is must contain minimum of";
 
	
	if((16&configValues)||(1&configValues)) 
	{
			uppercase.style.display="block";
			lowercase.style.display="block";
			specialcase.style.display="block";
			uppercase.innerHTML=Defaluterror+ " " + "one Uppercase character";		
			lowercase.innerHTML=Defaluterror+ " " + "one Lowercase character";
			specialcase.innerHTML= "<span class='symbol1'>&#10004;</span> Password is should contain one Digits or one Special character Exceptional \[\" \? \'\] ";
	}
	if(2&configValues)
	{
		consecutive.style.display="block";
		consecutive.innerHTML= "<span class='symbol1'>&#10004;</span>"+" "+"Password is should not contain three consecutive character";
		
	}
	if(8&configValues)
	{
		userpasscheck.style.display="block";
		userpasscheck.innerHTML=   "<span class='symbol1'>&#10004;</span>" + " "+ "User Name and password can\'t be same";
	}

}

  
function ConfigPolicy(val)
{
var text= '<ul style="list-style-type:none;"><li id="cisco_password" style="display:none; class="gray"></li><li id="minlength" style="display:none;" class="gray"></li><li id="User_Pass" style="display:none;" class="gray"></li><li id="UpperCheck" style="display:none;" class="gray"> </li><li id="LowerCheck" style="display:none;" class="gray"><li id="DigitCheck" style="display:none;" class="gray"></li><li id="netuserSpecialCheck" style="display:none;" class="gray"></li><li id="SpecialCheck" style="display:none;" class="gray"></li><li id="netuserSpecialCheck" style="display:none;" class="gray"></li><li id="consectiveCheck" style="display:none;"class="gray"></li></ul>';

document.getElementById("errorcontent").innerHTML= text;
var lengthcheck= document.getElementById("minlength");
var passcheck= document.getElementById("cisco_password");
userpasscheck= document.getElementById("User_Pass");

passcheck.style.display="block";
		if(val==3 || val==31)
		{
			passcheck.innerHTML=   "<span style='display:inline;' class='symbol1'>&#10004;</span> <span style='display:inline;' class='symbol2'>&#10004;</span>" + " "+ "Password should  not contain 'cisco'";
		}
		else
		{
			passcheck.innerHTML= "<span style='display:inline;' class='symbol1'>&#10004;</span>"+" "+"Password should  not contain 'cisco'";
		}

var consecutive= document.getElementById("consectiveCheck");
configValues= document.getElementById("ConfigLength").value; 
 
var uppercase= document.getElementById("UpperCheck");
var lowercase= document.getElementById("LowerCheck");
var digitcase= document.getElementById("DigitCheck");
var specialCaseval= document.getElementById("SpecialCheck");

var specialcase= document.getElementById("netuserSpecialCheck");
 
UpperCaseLength= parseInt(document.getElementById("Upperlength").value);
LowerCaseLength= parseInt(document.getElementById("LowerLength").value);
Digitslength= parseInt(document.getElementById("DigitsLength").value);
specialCaselength= parseInt(document.getElementById("SpecialCaseLength").value);

var lengthvalues= document.getElementById("minlength1").value;
 
 

if(val==3 || val==31)
	{ 
			lengthcheck.style.display="block";
			lengthcheck.innerHTML=  "<span style='display:inline;' class='symbol1'>&#10004;</span> <span style='display:inline;' class='symbol2'>&#10004;</span> Password is must contain minimum of" +" "+12; 
	 }
 else
	{
			lengthcheck.style.display="block";
			lengthcheck.innerHTML= "<span style='display:inline;' class='symbol1'>&#10004;</span>  Password should be minimum length is" +" " +lengthvalues;
	}
 
 
if(val==3 || val==31)
{
var Defaluterror= "<span  style='display:inline;' class='symbol1'>&#10004;</span> <span style='display:inline;' class='symbol2'>&#10004;</span> Password is must contain minimum of"+ " ";
}
else
{
	var Defaluterror= " <span style='display:inline;' class='symbol1'>&#10004;</span> Password is must contain minimum of";
}
 
 
	var specialcaseCheck=true;
	
 
	
	if(1&configValues && !(16&configValues)) 
	{ 
		
			if(UpperCaseLength>=2)
			{ 
				uppercase.style.display="block";
				uppercase.innerHTML=Defaluterror+ " " + UpperCaseLength+ " "+"Uppercase Characters";		

			}
			else
			{
				uppercase.style.display="block";
				uppercase.innerHTML=Defaluterror+ " " + "one Uppercase character";		
			}
			
			if(LowerCaseLength>=2)
			{
				lowercase.style.display="block";
				lowercase.innerHTML= Defaluterror+ " " + LowerCaseLength+ " "+"Lowercase Characters";
			}
			else
			{
				lowercase.style.display="block";
				lowercase.innerHTML=Defaluterror+ " " + "one Lowercase character";

			}
			
			if(Digitslength==0 && specialCaselength==0)
			{
				specialCaseval.style.display="block";
				
				if(val==3 || val==31)
				{
					specialCaseval.innerHTML= "<span  style='display:inline;'  class='symbol1'>&#10004;</span> <span  style='display:inline;'  class='symbol2'>&#10004;</span> Password is should contain one Digits or one Special character Exceptional \[\" \? \'\] ";
				}
				else
				{
					specialCaseval.innerHTML= "<span  style='display:inline;'  class='symbol1'>&#10004;</span> Password is should contain one Digits or one Special character Exceptional \[\" \? \'\] ";
				}
				specialcaseCheck=false;
			 
			}
			
			if(Digitslength>=2 && specialcaseCheck)
			{
				digitcase.style.display="block";
				digitcase.innerHTML= Defaluterror+ " " + Digitslength +" "+"Digits";
			 
			}
			else if (specialcaseCheck)
			{
				digitcase.style.display="block";
				digitcase.innerHTML= Defaluterror+ " " + "one Digits";
			}
			
			if(specialCaselength>=2 && specialcaseCheck)
			{
				specialCaseval.style.display="block";
				specialCaseval.innerHTML= Defaluterror+ " " +specialCaselength+ " "+"Special Character Exceptional \[\" \? \'\]";
			} 
			else if(specialcaseCheck)
			{
				specialCaseval.style.display="block";
				specialCaseval.innerHTML= Defaluterror+ " "+"one Special Character Exceptional \[\" \? \'\]";
			}
	}
	
	if(2&configValues)
	{
		consecutive.style.display="block";
		if(val==3 || val==31)
		{
			consecutive.innerHTML=   "<span style='display:inline;'  class='symbol1'>&#10004;</span> <span style='display:inline;'  class='symbol2'>&#10004;</span>" + " "+ "Password is should not contain three consecutive character";
		}
		else
		{
			consecutive.innerHTML= "<span style='display:inline;'  class='symbol1'>&#10004;</span>"+" "+"Password is should not contain three consecutive character";
		}
		
	}
	if(8&configValues)
	{
		userpasscheck.style.display="block";
		if(val==3 || val==31)
		{
			userpasscheck.innerHTML=   "<span style='display:inline;'  class='symbol1'>&#10004;</span> <span style='display:inline;'  class='symbol2'>&#10004;</span>" + " "+ "User Name and password can\'t be same";
		}
		else
		{
			userpasscheck.innerHTML= "<span style='display:inline;'  class='symbol1'>&#10004;</span>"+" "+"User Name and password can\'t be same";
		}
	}
	
	
 	
	if(16&configValues) 
	{
	 
			if(UpperCaseLength>=1)
			{ 
				uppercase.style.display="block";
				uppercase.innerHTML=Defaluterror+ " " + UpperCaseLength+ " "+"Uppercase Characters";		

			}
			else
			{
				uppercase.style.display="block";
				uppercase.innerHTML=Defaluterror+ " " + "one Uppercase character";		
			}
			
			if(LowerCaseLength>=1)
			{
				lowercase.style.display="block";
				lowercase.innerHTML= Defaluterror+ " " + LowerCaseLength+ " "+"Lowercase Characters";
			}
			else
			{
				lowercase.style.display="block";
				lowercase.innerHTML=Defaluterror+ " " + "one Lowercase character";

			}
			if(Digitslength>=1)
			{
				digitcase.style.display="block";
				digitcase.innerHTML= Defaluterror+ " " + Digitslength +" "+"Digits";
				specialcaseCheck= false;
			}
			else
			{
				digitcase.style.display="block";
				digitcase.innerHTML= Defaluterror+ " " + "one Digits";
				specialcaseCheck= false;
			}
			
			if(specialCaselength>=1)
			{
				specialCaseval.style.display="block";
				specialCaseval.innerHTML= Defaluterror+ " " +specialCaselength+ " "+"Special Character Exceptional \[\" \? \'\]";
				specialcaseCheck= false;

			}
			else
			{
				specialCaseval.style.display="block";
				specialCaseval.innerHTML= Defaluterror+ " " + " "+"one Special Character Exceptional \[\" \? \'\]";
				specialcaseCheck= false;
			}
			
			if(specialcaseCheck)
			{
				specialcase.style.display="block"; 
				specialcase.innerHTML=Defaluterror+ " " + "one Digits or one Special character Exceptional \[\" \? \'\]";
			}
	}

}



function CheckPasspolicy(val)
{
	
//******************************************************************************
//* Purpose: Checking password policy
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************
var Uppercase= /[^A-Z]/g;
var Lowercase= /[^a-z]/g;
var digits= /[^0-9]/g;
var Specialcharacter= /[^`@%#~,.<>;:\/\[\]\|{}()=_+-]/g;
var DontuseSpecialcharacter= /(?=.*["?'])/; 
var digitcase; 

var lengthcheck= document.getElementById("minlength");
var passcheck= document.getElementById("cisco_password");
userpasscheck= document.getElementById("User_Pass");

 
var uppercase= document.getElementById("UpperCheck");
var lowercase= document.getElementById("LowerCheck");
var consecutive= document.getElementById("consectiveCheck");
 configValues= document.getElementById("ConfigLength").value;

var gray = document.getElementsByClassName("gray");
user= document.getElementById("username").value; 

if(val==1 ||val==2 || val==4)
{
var confirm_pass_value= document.getElementById("pwdconfirm").value; 
}

if(val==3)
{
	var confirm_pass_value= document.getElementById("auth_pwd_cfrm").value; 
}
if(val==31)
{
	var confirm_pass_value= document.getElementById("priv_pwd_cfrm").value; 
}



if(val==1 ||val==2 || val==3 || val==4)
{
pass_value= document.getElementById("userpwd").value;
Snmp_v3Check1=true;
}

if (val==31)
{
pass_value=event.target.value;
Snmp_v3Check2=true;
}

 
if(val==2)
{
var lengthvalues= document.getElementById("minlength1").value;
}

 
var specialCaseval;

if(val==1)
{
var specialcase= document.getElementById("netuserSpecialCheck");
}
else
{
	specialCaseval= document.getElementById("SpecialCheck");
	UpperCaseLength= parseInt(document.getElementById("Upperlength").value);
	
	LowerCaseLength= parseInt(document.getElementById("LowerLength").value);
	Digitslength= parseInt(document.getElementById("DigitsLength").value);
	specialCaselength= parseInt(document.getElementById("SpecialCaseLength").value);
	digitcase= document.getElementById("DigitCheck"); 
}

 
 
	if((pass_value.length < 8 && val==1) || (pass_value.length < 8 && val==4))
		{
			lengthcheck.style.color= "red";
			checksnmp(val,lengthcheck,false); 
		}
		
	else if(((val==3)|| (val==31))&& (pass_value.length < 12))
		{
			lengthcheck.style.color= "red";
			checksnmp(val,lengthcheck,false); 
		}
	else if(val==2)
	{
		if(pass_value.length < lengthvalues)
		{
			lengthcheck.style.color= "red";
			checksnmp(val,lengthcheck,false); 
		}
		else
		{
			lengthcheck.style.color= "green";
			checksnmp(val,lengthcheck,true); 
		}
	}
	else
		{
			lengthcheck.style.color= "green";
			checksnmp(val,lengthcheck,true); 
		}
				
	
//Case-check enabled validation	 or Case-digit-check validation
var check= true;
if(val>=2)
{
	if((16&configValues)||(1&configValues)) 
	{ 
	 
		if(UpperCaseLength!=0 ||pass_value.replace(Uppercase, "").length)
		 {
			 if(pass_value.replace(Uppercase, "").length>=UpperCaseLength)
			 {
				uppercase.style.color= "green"; 
				checksnmp(val,uppercase,true); 
			 }
			 else
			 {
				 uppercase.style.color= "red";
				 checksnmp(val,uppercase,false); 
			 }
		 }
		 else
		 {
			uppercase.style.color= "red"; 
			checksnmp(val,uppercase,false);
		 }
		 
		if(LowerCaseLength!=0 || pass_value.replace(Lowercase, "").length)
		 {
			 if(pass_value.replace(Lowercase, "").length>=LowerCaseLength)
			 {
			  lowercase.style.color= "green"; 
			  checksnmp(val,lowercase,true);
			 }
			 else
			 {
				 lowercase.style.color= "red";
				 checksnmp(val,lowercase,false);
			 }
		 }
		 else
		 {
			lowercase.style.color= "red"; 
			checksnmp(val,lowercase,false);
		 }
		 
		 
		if((specialCaselength==0 &&  Digitslength==0) && !(16&configValues ))
		{
			if((specialCaselength==0 &&  Digitslength==0) && ((pass_value.replace(digits, "").length>=1) || (pass_value.replace(Specialcharacter, "").length>=1)))
			{
				specialCaseval.style.color= "green";
				checksnmp(val,specialCaseval,true);
				check=false;
			}
			else
			 {
				 specialCaseval.style.color= "red";
				 checksnmp(val,specialCaseval,false);
				 check=false;
			 }
			if(pass_value.match(DontuseSpecialcharacter))
			{
			 specialCaseval.style.color= "red";
			 checksnmp(val,specialCaseval,false);
			}
		}
		else
		{ 	 
			 if(Digitslength>=1 && check)
			 {
				if(pass_value.replace(digits, "").length>=Digitslength)
				{
				 digitcase.style.color= "green"; 
				 checksnmp(val,digitcase,true);
				}
				else
				{
				digitcase.style.color= "red";
				checksnmp(val,digitcase,false);
				}
			 }
			 else if(Digitslength==0 && check)
			 {
				 if(pass_value.replace(digits, "").length>=1)
				 {
					 digitcase.style.color= "green";
					 checksnmp(val,digitcase,true);
				 }
				 else
				 {
					 digitcase.style.color= "red";
					 checksnmp(val,digitcase,false);
				 }
			 }
				 
			
			 if(specialCaselength>=1 && check) 
				{	
					 
					if(pass_value.replace(Specialcharacter, "").length>=specialCaselength)
					{
						specialCaseval.style.color= "green";
						checksnmp(val,specialCaseval,true);
					}
					else
					{
						specialCaseval.style.color= "red";
						checksnmp(val,specialCaseval,false);
						
					}
				}
			 else if(specialCaselength==0 && check)
			 {
				 if(pass_value.replace(Specialcharacter, "").length>=1)
				 {
					 specialCaseval.style.color= "green";
					 checksnmp(val,specialCaseval,true);
				 }
				 else
				 {
					 specialCaseval.style.color= "red";
					 checksnmp(val,specialCaseval,false);
				 }
			 }
				
			if(pass_value.match(DontuseSpecialcharacter))
			{
			 specialCaseval.style.color= "red";
			 checksnmp(val,specialCaseval,false);
			}
		} 
		 
	}

}

else
{
 Uppercase= /(?=.*[A-Z])/;
 Lowercase= /(?=.*[a-z])/;
 digits= /(?=.*[0-9])/;
 Specialcharacter= /(?=.*[`@%#~,.<>;:\/\[\]\|{}()=_+-])/;
 DontuseSpecialcharacter= /(?=.*["?'])/; 

	if((16&configValues)||(1&configValues))
	{	
		if(pass_value.match(Uppercase))
			{
				uppercase.style.color= "green"; 
				checksnmp(val,uppercase,true);
			}
		else
			{	
				uppercase.style.color= "red";
				checksnmp(val,uppercase,false);
			}
		

		if(pass_value.match(Lowercase))
			{
				lowercase.style.color= "green";
				checksnmp(val,lowercase,true);
			}
		else
			{
				lowercase.style.color= "red";
				checksnmp(val,lowercase,false);
			}
		 
		if(pass_value.match(DontuseSpecialcharacter))
		{
			specialcase.style.color= "red";
			checksnmp(val,specialcase,false);
		}
			
		else
		{
			if(pass_value.match(Specialcharacter)|| (pass_value.match(digits)))
			{ 
				specialcase.style.color= "green";
				checksnmp(val,specialcase,true);
			}	 
		else
			{
				specialcase.style.color= "red";
				checksnmp(val,specialcase,false);
			}
		}	
	}
}
	

		
if(2&configValues)
{
	//consecutive-check enabled validation
	pass_value= pass_value.toLowerCase();
	var val_pass= pass_value.split("");
	console.log(val_pass);
	for (var t=0;t<val_pass.length;t++)
		{
			if((val_pass[t]==val_pass[t+1])&&((val_pass[t+1])==(val_pass[t+2]))&&((val_pass[t])&&(val_pass[t+2])))
			{
				consecutive.style.color= "red"; 
				checksnmp(val,consecutive,false);
				break;
			}
			else
			{
				consecutive.style.color= "green";
				checksnmp(val,consecutive,true);
				 
			}
		}
	if(val_pass.length==0)
	{
		consecutive.style.color= "green";
		checksnmp(val,consecutive,true);
		 
	}
}   

//username-check==> user name and password not be same
 if(8&configValues )
{
	pass_value= pass_value.toLowerCase();
	user= user.toLowerCase();
	
	if(pass_value !=user)
		{
			userpasscheck.style.color= "green"; 
			checksnmp(val,userpasscheck,true);
			
		}
	else
		{
			userpasscheck.style.color= "red";
			checksnmp(val,userpasscheck,false);
		}
}
	
	if(pass_value.includes("cisco")==1)
	{
		passcheck.style.color= "red";
		checksnmp(val,passcheck,false);
	}
	else
	{
		passcheck.style.color= "green";
		checksnmp(val,passcheck,true);
	}
	
	if (pass_value.includes(" "))
	{
		alert("Password space is not allowed");
		return false;
	}
	
	if (confirm_pass_value.includes(" "))
	{
		alert("Confirm Password space is not allowed");
		return false;
	}
	 
	 
}

 
 
function checksnmp(val,elements,arg)
{
	var correct= "&#10004;";
	var wrong="&#10008;";
 

	if(val==3 || val==31)
	{	
		 var field1 = document.getElementById("listVal").value;
		 var field2 = document.getElementById("listVal1").value;
		 
 
		if(val==3 && arg==true)
		{
			elements.getElementsByClassName("symbol1")[0].innerHTML=correct;	
			elements.getElementsByClassName("symbol1")[0].style.color="green";
			
		}
		else if(val==3)
		{
			elements.getElementsByClassName("symbol1")[0].innerHTML=wrong;
			elements.getElementsByClassName("symbol1")[0].style.color="red";
			
		}
		
		if(val==3 && field2=="None")
		{
			if(elements.getElementsByClassName("symbol1")[0].style.color=="green")
				{
					elements.style.color= "green"; 
				}
			else
			{
				elements.style.color= "red"; 
			}
		}
		
 
			if(val==31 && arg==true)
			{
				elements.getElementsByClassName("symbol2")[0].innerHTML=correct;
				elements.getElementsByClassName("symbol2")[0].style.color="green"; 
			}
			else if(val==31)
			{
				elements.getElementsByClassName("symbol2")[0].innerHTML=wrong;
				elements.getElementsByClassName("symbol2")[0].style.color="red";
			}
	 
		
		if(val==31 && field1=="None")
		{
			if(elements.getElementsByClassName("symbol2")[0].style.color=="green")
				{
					elements.style.color= "green"; 
				}
			else
			{
				elements.style.color= "red"; 
			}
		}
		
  
		if((val==3 || val==31) && (field1!="None" && field2!="None"))
		{
			if(elements.getElementsByClassName("symbol1")[0].style.color=="green" &&  elements.getElementsByClassName("symbol2")[0].style.color=="green" && field2!="None")
				{
					elements.style.color= "green"; 
				}
				else
				{
				elements.style.color= "red"; 
				}
		}
		 
			
	 

	}

	else
	{
		if(arg==true)
		{
			elements.getElementsByClassName("symbol1")[0].innerHTML=correct;	
			elements.getElementsByClassName("symbol1")[0].style.color="green";
			
		}
		else
		{
			elements.getElementsByClassName("symbol1")[0].innerHTML=wrong;
			elements.getElementsByClassName("symbol1")[0].style.color="red";
			
		}
		
	}
	
}
 
function UserNameCheck(vales)
{
	 if(8&configValues)
	{
		var pass_value= document.getElementById("userpwd").value;
		var user= document.getElementById("username").value;
		var userpasscheck= document.getElementById("User_Pass");
		if(pass_value!="")
		{
			pass_value= pass_value.toLowerCase();
			user= user.toLowerCase();
			if(pass_value !=user)
			{
				userpasscheck.style.color= "green";
				checksnmp(vales,userpasscheck,true);
				apply_Button= true;
			}
			else
			{
				userpasscheck.style.color= "red";
				checksnmp(vales,userpasscheck,false);
				apply_Button= false;
			}
		}
		
	}
}



function getHtmlForNewApplyButton(){
	document.writeln('\
	<input type="button" name="apply" value="',top.APPLY,'" class="button" onClick="javascript:createSubmitAction()">\
	')
}

function drawCreateSubmitButton() {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawCreateSubmitButton>");
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td valign="middle" class="form-buttons" \
                              align="center" ><a class="form-buttons"\
                              href="javascript:createSubmitAction();">',top.CREATE,'</a></td>')

}



function drawPortButton(str,index) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawPortButton>index is"+index);
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td align="middle" class="form-buttons"\
                              valign="center"><a class="form-buttons"\
                              href="javascript:portConfigAction(',index,');">',str,'</a></td>')

}

function drawPortStpButton(index) {
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

debugMsg("<drawPortConfigButton>index is"+index);
//if(document.forms[0].access_control.value != 1) return;
document.writeln('\
                            <td align="middle" class="form-buttons" \
                              valign="center"><a \
                              href="javascript:portStpAction(',index,');">STP</a></td>')

}


function formAttrs(numberAttrs,textAttrs,ipAttrs,macAttrs){
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

this.numberAttrs = numberAttrs;
this.textAttrs   = textAttrs;
this.ipAttrs     = ipAttrs;
this.macAttrs    = macAttrs;
}

function numberAttr(name,displayName,minVal,maxVal,notAllowedValues,isMandatory,value){  
    
 //use value attribute only when the name cannot be sent. Suppose the name is like   
 //'1.0.8.dscp' javascript will not be able to recognise with document.forms[0].1.0.8.dscp.   
 //If value needs to be passed set this numberAttr at the time of submit so that it gets   
 //the latest value for this field 

//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

this.name = name;
this.displayName = displayName;
this.minVal = minVal;
this.maxVal = maxVal;
this.notAllowedValues = notAllowedValues;
this.isMandatory = isMandatory;
this.value = value;   
} 


function textAttr(name,displayName,maxLength,notAllowedChars,notAllowedValues,isMandatory){
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

    this.name = name;
    this.displayName = displayName;
    this.maxLength = maxLength;
    this.notAllowedChars = notAllowedChars;
    this.notAllowedValues = notAllowedValues;
    this.isMandatory = isMandatory;
    if (arguments.length > 6) {
        this.allowedCharsPattern = arguments[6];
    }  
}

function ipAttr(name,displayName,notAllowedValues,isMandatory){
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

this.displayName = displayName;
this.name = name;
this.notAllowedValues = notAllowedValues;
this.isMandatory = isMandatory;
}

function macAttr(name,displayName,notAllowedValues,isMandatory){
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

this.name = name;
this.displayName = displayName;
this.notAllowedValues = notAllowedValues;
this.isMandatory = isMandatory;
}

function validateForm(form,formAttrs){
//******************************************************************************
//* Purpose:
//*
//* Inputs:
//*
//* Return:  none
//******************************************************************************

// go over all the fields and accumulate errors
  debugMsg("<validateForm> Entering formAttrs is"+formAttrs);
  var alertMsg = "";
  var value = 0;
  var prevValue = 0;
  var numValue = 0;
  var text = null;
  var temp = 0;
  var numPattern = /\s*\d+\s*/;
  var numberCheckFailed = false;
  // go over number attrs if not null

  if(formAttrs.numberAttrs != null &&
     formAttrs.numberAttrs.length > 0){
    debugMsg("<validateForm> validating numberAttrs size is "+formAttrs.numberAttrs.length);
    for(var i=0;i < formAttrs.numberAttrs.length;i++){
    if(formAttrs.numberAttrs[i]==null){
      continue;
    }
	if(formAttrs.numberAttrs[i].name != null)   
    { 
		extraDebugMsg("Name of Attr is "+formAttrs.numberAttrs[i].name);
		prevValue = eval("form."+formAttrs.numberAttrs[i].name+".value");
		value = trim(prevValue);
	}   
    if(formAttrs.numberAttrs[i].name == null && formAttrs.numberAttrs[i].value != null)   
    {   
        prevValue = formAttrs.numberAttrs[i].value;   
        value = trim(formAttrs.numberAttrs[i].value);   
    } 
	extraDebugMsg("<validateForm> value is "+value);
	if(value.length != prevValue.length){
	  alertMsg += formAttrs.numberAttrs[i].displayName + " : "+value+" : "+top.ATTRIB_SPACE +"\n\n";
	  continue;
 	}
	if(value.length == 0){
	  extraDebugMsg("<validateForm> length is zero isMandatory"+formAttrs.numberAttrs[i].isMandatory);
	  if(formAttrs.numberAttrs[i].isMandatory){
            alertMsg += formAttrs.numberAttrs[i].displayName +" : "+ top.ATTRIB_MANDATORY +"\n\n";
	  }
  	  continue;
	}
	numberCheckFailed = false;
	for(var numberCheckCount=0;numberCheckCount < value.length;numberCheckCount++){
          var digit = value.substring(numberCheckCount,numberCheckCount+1);
	  if(numberCheckCount==0 &&  digit == "-") continue;	  
     	  if(isNaN(parseInt(digit))){
	    if(digit == ".")
     	    alertMsg += formAttrs.numberAttrs[i].displayName +" : "+value+" : "+ top.ATTRIB_DECIMAL_POINT+"\n\n";
	  else if (digit == " ")
     	    alertMsg += formAttrs.numberAttrs[i].displayName + " : "+value+" : "+ top.ATTRIB_NO_SPACES+"\n\n";
	  else
     	    alertMsg += formAttrs.numberAttrs[i].displayName + " : "+value+" : "+ top.ATTRIB_NO_VALUE+"\n\n";
	  numberCheckFailed = true;
	  break;
     	    
     	  }
        }	
	if(numberCheckFailed) continue;
	result = value.match(numPattern);

	if(!result){
	   alertMsg += formAttrs.numberAttrs[i].displayName + " : "+value+" : "+ top.ATTRIB_NO_VALUE+"\n\n";
	     continue;
	}
	extraDebugMsg("<validateForm> pattern matched "+result);
	numValue = parseFloat(value);
	extraDebugMsg("<validateForm> numeric value is "+numValue);
	if(numValue == NaN){
	   alertMsg += formAttrs.numberAttrs[i].displayName + " : "+value+" : "+ top.ATTRIB_NO_VALUE+"\n\n";
	     continue;
	}

	if((numValue > formAttrs.numberAttrs[i].maxVal) ||
	(numValue < formAttrs.numberAttrs[i].minVal)){
          alertMsg += formAttrs.numberAttrs[i].displayName +" : "+value+" : "+ top.VALID_RANGE+"  "+formAttrs.numberAttrs[i].minVal+" <>  "+formAttrs.numberAttrs[i].maxVal+"\n\n";
	}else if(formAttrs.numberAttrs[i].notAllowedValues != null){
	//check not allowed values
	    for(var j =0;j < formAttrs.numberAttrs[i].notAllowedValues.length;j++){
		temp = formAttrs.numberAttrs[i].notAllowedValues[j];
		if(numValue == temp){
		    alertMsg += formAttrs.numberAttrs[i].displayName +" : "+value+" "+top.VALUE_NOT_ALLOWED+"\n\n";
		}
	    }
	}

    }
  }
   value = 0;
   prevValue = 0;
  if(formAttrs.textAttrs != null &&
     formAttrs.textAttrs.length > 0){
   debugMsg("<validateForm> validating textAttrs size is "+formAttrs.textAttrs.length);

    for(var loop=0;loop < formAttrs.textAttrs.length;loop++){

        extraDebugMsg("<formValidate> validating text attr "+formAttrs.textAttrs[loop].displayName);

	prevValue = eval("form."+formAttrs.textAttrs[loop].name+".value");
	value = trim(prevValue);
	extraDebugMsg("<validateForm> value is "+value);
	if(value.length != prevValue.length){
	  alertMsg += formAttrs.textAttrs[loop].displayName + " : "+value+" : "+top.ATTRIB_TL_SPACE +"\n\n";
	  continue;
 	}

	if(value.length > formAttrs.textAttrs[loop].maxLength){
	extraDebugMsg("<validateForm> length exceeds maxLength");
	if(value.length > 130){
	var res = value.substr(0,130);
	var res1 = value.substr(131,value.length);
	
          alertMsg += formAttrs.textAttrs[loop].displayName + " : "+ res + "\n" + res1 +" : "+top.VALUE_TOO_LONG +" : " + formAttrs.textAttrs[loop].maxLength+"\n\n";
	}
	else
          alertMsg += formAttrs.textAttrs[loop].displayName + " : "+ value + " : "+top.VALUE_TOO_LONG +" : " + formAttrs.textAttrs[loop].maxLength+"\n\n";

	}else if(value.length == 0 && formAttrs.textAttrs[loop].isMandatory){
	  extraDebugMsg("<validateForm> length is zero and attr mandatory");
          alertMsg += formAttrs.textAttrs[loop].displayName +" : "+ top.ATTRIB_MANDATORY +"\n\n";

	}else{
	   if(formAttrs.textAttrs[loop].notAllowedValues != null){
	   //check not allowed values
	     for(var j =0;j < formAttrs.textAttrs[loop].notAllowedValues.length;j++){
		temp = formAttrs.textAttrs[loop].notAllowedValues[j];
		if(value == temp){
		    alertMsg += formAttrs.textAttrs[loop].displayName +" : "+value+"  "+top.VALUE_NOT_ALLOWED+"\n";
		}
	     }

           }
	   if(formAttrs.textAttrs[loop].notAllowedChars != null){
		extraDebugMsg("<validateForm> total notAllowedChars are "+formAttrs.textAttrs[loop].notAllowedChars.length);
	   //check not allowed values
	    for(var j =0;j < formAttrs.textAttrs[loop].notAllowedChars.length;j++){
            temp = formAttrs.textAttrs[loop].notAllowedChars[j];
            if(value.indexOf(temp) >= 0){
                if(temp == " ")
                    alertMsg += formAttrs.textAttrs[loop].displayName + " : "+value+" : "+top.ATTRIB_SPACE +"\n\n";
                else{
                    alertMsg += formAttrs.textAttrs[loop].displayName +" : "+temp+"  "+top.CHAR_NOT_ALLOWED+"\n\n";
                }
            }
	    }
	   }
	}
    }
  }
  value = 0;
  prevValue = 0;
  if(formAttrs.ipAttrs != null &&
     formAttrs.ipAttrs.length > 0){
   debugMsg("<validateForm> validating ipAttrs size is "+formAttrs.ipAttrs.length);

    for(var loop=0;loop < formAttrs.ipAttrs.length;loop++){
	var errorOccured = false;

        extraDebugMsg("<formValidate> validating ip attr "+formAttrs.ipAttrs[loop].displayName);

	prevValue = eval("form."+formAttrs.ipAttrs[loop].name+".value");
	value = trim(prevValue);
	extraDebugMsg("<validateForm> value is "+value);
	if(value.length != prevValue.length){
	  alertMsg += formAttrs.ipAttrs[loop].displayName + " : "+value+" : "+top.ATTRIB_SPACE +"\n\n";
	  continue;
 	}

	if(value.length == 0){
	 if( formAttrs.ipAttrs[loop].isMandatory){
	  extraDebugMsg("<validateForm> length is zero and attr mandatory");
          alertMsg += formAttrs.ipAttrs[loop].displayName +" : "+ top.ATTRIB_MANDATORY +"\n\n";
	 }
	 continue;
	}

	var pieces = value.split(".");
	if(pieces.length < 4 || pieces.length > 4){
	   alertMsg += formAttrs.ipAttrs[loop].displayName+" : "+value+" : "+ top.IP_ADDR_INVALID+ top.IP_ADDR_DOTS+ "\n\n";
	   continue;
	}

	for(var k=0;k<4;k++){
	  if(isNaN((pieces[k]))|| (pieces[k].length ==0)|| (pieces[k]>255 || pieces[k]<0)){
             alertMsg += formAttrs.ipAttrs[loop].displayName+" : "+value+" : "+  top.IP_ADDR_INVALID+ top.IP_ADDR_NOT_NUMBER +" : "+ (k+1)+"\n\n";
	  errorOccured = true;
	  }
	  if(!errorOccured && (pieces[k].indexOf(" ")>-1)){
	     alertMsg += formAttrs.ipAttrs[loop].displayName+" : "+value+" : "+  top.IP_ADDR_INVALID+ top.IP_ADDR_SPACE_NUMBER +" : "+ (k+1)+"\n\n";
	  errorOccured = true;
	  break;
	  }
	}
	if(errorOccured) continue;

	if(formAttrs.ipAttrs[loop].notAllowedValues != null){
	//check not allowed values
	    for(var j =0;j < formAttrs.ipAttrs[loop].notAllowedValues.length;j++){
		temp = formAttrs.ipAttrs[loop].notAllowedValues[j];
		if(value == temp){
		    alertMsg += formAttrs.ipAttrs[loop].displayName +" : "+value+"  "+top.VALUE_NOT_ALLOWED+"\n\n";
		}
	    }
	}

    }
  }
  value = 0;
  prevValue = 0;
  if(formAttrs.macAttrs != null &&
     formAttrs.macAttrs.length > 0){
   debugMsg("<validateForm> validating macAttrs size is "+formAttrs.macAttrs.length);

    for(var loop=0;loop < formAttrs.macAttrs.length;loop++){
	var errorOccured = false;

	prevValue = eval("form."+formAttrs.macAttrs[loop].name+".value");
	value = trim(prevValue);
	extraDebugMsg("<validateForm> value is "+value);
	if(value.length != prevValue.length){
	  alertMsg += formAttrs.macAttrs[loop].displayName + " : "+value+" : "+top.ATTRIB_SPACE +"\n\n";
	  continue;
 	}

	if(value.length == 0) {
	 if (formAttrs.macAttrs[loop].isMandatory){
	  extraDebugMsg("<validateForm> length is zero and attr mandatory");
          alertMsg += formAttrs.macAttrs[loop].displayName +" : "+ top.ATTRIB_MANDATORY +"\n\n";
	 }
	 continue;
	}

	var pieces = value.split(":");
	if(pieces.length < 6 || pieces.length > 6){
	   alertMsg += formAttrs.macAttrs[loop].displayName+" : "+value +" : "+top.MAC_ADDR_IS_INVALID +top.MAC_ADDR_FORMAT+"\n\n";
	   continue;
	}

	for(var k=0;k<6;k++){
	  if(pieces[k].length !=2){
		alertMsg += formAttrs.macAttrs[loop].displayName+" : "+value+" : "+top.MAC_ADDR_IS_INVALID +top.MAC_ADDR_BYTE +" : "+(k+1)+"\n\n";
		errorOccured = true;
	  }
	  if(!errorOccured && (isNaN(parseInt(pieces[k].substring(0,1),16)) || isNaN(parseInt(pieces[k].substring(1,2),16)))){
	  	alertMsg += formAttrs.macAttrs[loop].displayName+" : "+value+" : "+top.MAC_ADDR_IS_INVALID + "The Bytes are not 2 digit hex numbers." +"\n\n";
	  errorOccured = true;
	  }
	  if(!errorOccured && (pieces[k].indexOf(" ")>-1)){
	     alertMsg +=formAttrs.macAttrs[loop].displayName+" : "+value+" : "+top.MAC_ADDR_IS_INVALID +top.MAC_ADDR_BYTESPACE +" : "+(k+1)+"\n\n";
	  errorOccured = true;
	  break;
	  }
	}
	if(errorOccured) continue;

	if(formAttrs.macAttrs[loop].notAllowedValues != null){
	//check not allowed values
	    for(var j =0;j < formAttrs.macAttrs[loop].notAllowedValues.length;j++){
		temp = formAttrs.macAttrs[loop].notAllowedValues[j];
		if(value == temp){
		    alertMsg += formAttrs.macAttrs[loop].displayName +" : "+value+" "+top.VALUE_NOT_ALLOWED+"\n\n";
		}
	    }
	}

    }
  }


  if(alertMsg != ""){
	alertMsg = "___________________________"+ top.ERRORS+" ____________________________"+"\n\n\n"+ alertMsg;
	alertMsg += "\n"+top.MAKE_NECCESSARY_CORRECTION+ "\n"
	alert(alertMsg);
	return false;
  }else {
	debugMsg("<validateForm>alert msg is empty");
	return true;
  }
}

function trim(str){
  var newStr;
  var length = str.length;
  if(length == 0) return str;

  if(str.indexOf(" ") < 0 ) return str;


  for(var j = length-1;j > -1;j--){
   if(str.charAt(j) == " ") continue;
   else break;
  }
  var endIndex = j;

  str =  str.substring(0,(endIndex+1));

  for(var k=0;k < length;k++){
   if(str.charAt(k) == " ") continue;
   else break;
  }
  return str.substring(k,length+1);
}


// MAIN BEGINS HERE

// This variable is used in refresh to disable the textarea in the form to reduce the HTTP Post size.
top.disableFormTextArea = false;
var debugOn = false;
var extraDebugOn = false;
var thisFormAttrs = null;
var businessLogicImplemented = false;
var InitializeArray = false;
var displayInfoMsg = false;
var createNewBusinessLogicImplemented = false;
//This variable is used to display exists form contents while submit fails
var onErrorFormSubmit = false;
//this variable is used in refresh so that whole form is not submitted rather 
// smaller one is submitted so that it does not cross buffer
top.subFormImplemented= false;
/* Bug #2220 made sure CLEAR_CLICKED here and in web.h
   has same value for clear stats to work */

var CREATE_CLICKED = 0x01;
var EDIT_CLICKED  =  0x02;
var SUBMIT_CLICKED = 0x04;
var DELETE_CLICKED  = 0x08;
var SAVECONFIG_CLICKED = 0x10;
var CUSTOM1_CLICKED  = 0x20;
var CUSTOM2_CLICKED  = 0x40;
var CUSTOM3_CLICKED  = 0x80;
var PORT_CONFIG_CLICKED  = 0x100;
var PORT_STP_CLICKED = 0x200;
var CLEAR_CLICKED    = 0x400;

var CANCEL_CLICKED = 0x800;
var REFRESH_CLICKED = 0x1000;
var LIST1_EDIT_CLICKED = 0x2000;
var LIST2_EDIT_CLICKED = 0x4000;
var PING_CLICKED = 0x8000;
var CUSTOM4_CLICKED  = 0x10000;
var CUSTOM5_CLICKED  = 0x20000;
var CUSTOM6_CLICKED  = 0x40000;
var CUSTOM7_CLICKED  = 0x80000;
var CUSTOM8_CLICKED  = 0x100000;

//CUSTOM 9-11 is already defined using existing macros.

var CUSTOM12_CLICKED  = 0x200000;
var CUSTOM13_CLICKED  = 0x400000;
var CUSTOM14_CLICKED  = 0x800000;
var CUSTOM15_CLICKED  = 0x1000000;
var CUSTOM16_CLICKED  = 0x2000000;
var CUSTOM17_CLICKED  = 0x4000000;
var CUSTOM19_CLICKED  = 0x8000000;
var CUSTOM20_CLICKED  = 0x10000000;
var CUSTOM21_CLICKED  = 0x20000000;
var CUSTOM22_CLICKED  = 0x10000010;
var CUSTOM23_CLICKED  = 0x40000000;
var CUSTOM24_CLICKED  = 0x80000000;
var CUSTOM25_CLICKED  = 0x1020000;
var CUSTOM26_CLICKED  = 0x80000002;
var CUSTOM27_CLICKED  = 0x80000004;

var CREATE_VIEW = 0x01;
var EDIT_VIEW  =  0x02;

/* Bug #2220 */
var ACTION_SUCCESS = 1;
var ACTION_ERROR   = 2 ;
var ACTION_WARNING = 3;
var ACTION_UNKNOWN = 0;


function drawBasicHeader(){
return;
document.writeln('\
<table border="1" width="800" align="center" bgcolor=#b0c4de>\
<tr>\
<td>')
}

function drawHeader(){
drawBasicHeader();
/*drawErrorInfoMessages();*/
}

function drawPeerTabs(currentTabId) {
return;
}

function drawFooter(){
return;
document.writeln('</td>\
</tr>\
')
}

function drawErrorInfoMessages(){
  alert("In ErrorInfoMessages info msg is "+document.forms[0].info_msg.value);
  if(document.forms[0].err_flag &&
	document.forms[0].err_flag.value == 1){
    document.writeln('<p class="errorattributes">',top.ERROR,':',document.forms[0].err_msg.value,'</p>');
  }else if (document.forms[0].info_flag &&
	document.forms[0].info_flag.value == 1) {
    document.writeln('<p class="infoattributes">',top.INFO,':',document.forms[0].info_msg.value,'</p>');
 }
}

function getStrongPassword() {
	var rc = "";
	var len;
	rc = rc + getRandomChar();
	len = getRandomNum(10,20);
	for (var idx = 1; idx < len; ++idx) {
		rc = rc + getRandomChar(1);
	}
	return rc;
}
function getPassword() {
	var rc = "";
	rc = rc + getRandomChar();
	for (var idx = 1; idx < 8; ++idx) {
		rc = rc + getRandomChar();
	}
	return rc;
}

function getRandomNum(lbound, ubound) {
    return (Math.floor(Math.random() * (ubound - lbound)) + lbound);
}

function getRandomChar(strong) {
    var numberChars = "0123456789";
    var lowerChars = "abcdefghijklmnopqrstuvwxyz";
    var upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var otherChars = "`~!@#$%^&*()-_=+[{]}\\|;:',<.>/";
    var charSet = "";

    charSet += numberChars;
    charSet += lowerChars;
    charSet += upperChars;
	if(strong == 1)
	{
		charSet += otherChars;
	}
    return charSet.charAt(getRandomNum(0, charSet.length));
 }
 
 //get the row element value based on index.here the elements are created in automatically EMWEB loop.
function getEmRowElmValue(form1, elmName, indexVal)
{  
  var findName = "." + elmName;
  for(var loop=0; loop < form1.elements.length;loop++)
  {    
    var elmN = form1.elements[loop].name;
    if(elmN && elmN.indexOf(findName) > -1)
    {
         //get the index of element (1.0.18.rule_name --  (1.0.18) - format is (pageNum.index.totalEntries)
         var pieces = elmN.split(".");
         if(pieces.length > 1 && indexVal == pieces[1])
         {
             return form1.elements[loop].value;               
         }        
    }
  }   
}

 // find the count of elements with matching name passed
 // This method calculates the count for elements in the list
 // name element is like 1.0.3.name
// returns count of entries

 function getElementCount(form,name)
 {
     var count=0;
     var matchStr='/\\d.'+name+'/g';
     var elms=document.forms[0].elements;
     for(index=0; index< elms.length ; index++)
     {
        var str=elms[index].name;
        if(str && (str.match(eval(matchStr))!= null)){
         count++;
        }
     }
     return count;
 }

//This function checks for duplicate enteries in the list and compare with valueStr
// form     - form object
// valueStr - Value to compare against
// nameStr  - Look for this name in list. This name should me like 1.0.1.name
// return - true - if entry exists
//          false - if entry does not exist.

function checkForDuplicateEntriesInList(form,valueStr,nameStr)
{
    var count=0;
    var matchStr='/\\d.'+nameStr+'/g';
    var elms=form.elements;
    for(index=0; index< elms.length ; index++)
    {
         var str=elms[index].name;
         if(str && (str.match(eval(matchStr))!= null)){
            if(elms[index].value == valueStr)
              return true;
         }
    }
     return false;
}


//validates email syntax - aaa@abc.com
// returns - false - if validation fails
//           true - if validation passes

function emailcheck(str)
{
    var at="@"
    var dot="."
    var lat=str.indexOf(at)
    var lstr=str.length
    var ldot=str.indexOf(dot)
    if (str.indexOf(at)==-1){
       return false
    }

    if (str.indexOf(at)==-1 || str.indexOf(at)==0 || str.indexOf(at)==lstr){
       return false
    }

    if (str.indexOf(dot)==-1 || str.indexOf(dot)==0 || str.indexOf(dot)==lstr){
        return false
    }

     if (str.indexOf(at,(lat+1))!=-1){
        return false
     }

     if (str.substring(lat-1,lat)==dot || str.substring(lat+1,lat+2)==dot){
        return false
     }

     if (str.indexOf(dot,(lat+2))==-1){
        return false
     }

     if (str.indexOf(" ")!=-1){
        return false
     }

     return true
}

//this funcion replaces the spaces with the character '+', and the '+' should be replaced with ' ' in the backend.
function replaceSpaceWithPlus(str)
{
   if(str == null) return null;
   return str.replace(/ /g,'+');   
}

function replaceSpecialCharacter(str)
{
   if(str == null) return null;
   return String(str).replace(/</g, '&lt;');   
}

//This function is to get the values on the list page. 
//mainly to fix the FireFox issue, 1.0.1.elementName not working in FF and IE properly,
//so we need enumurate all the elements to find out the value.
function getListPageElementValue(form1,elName)
{
	for (var loop = 0; loop < form1.elements.length; loop++) 
	{
		 if( form1.elements[loop].name == elName)
		    return form1.elements[loop].value;
	}
	return null;
}

//this function will select all the check boxes in the form, which are starting with name.
//chkflg -- this flag shows to select or not to select the check boxes.
function selectAllChkBox(chk_name,chkflg,tarform)
{
  var form1 = tarform?tarform:document.forms[0];
  for(var loop=0; loop < form1.elements.length;loop++)
  {        
    var elmN = form1.elements[loop].name;
    if(elmN && elmN.indexOf(chk_name) > -1)
    {
          form1.elements[loop].checked = chkflg;
    }
  }	
}

// RxSop threshold validation //

function func_rx_a(is_checked)
{

	if (is_checked) {
         document.getElementById('rxSop_802_11a').disabled = true;
         document.getElementsByName("threshold_a")[0].disabled = false;   
	}else{
         document.getElementById('rxSop_802_11a').disabled = false;
         document.getElementsByName("threshold_a")[0].disabled = true; 
        }

}

function func_rx_b(is_checked)
{
        if (is_checked) {
         document.getElementById('rxSop_802_11b').disabled = true;
         document.getElementsByName("threshold_b")[0].disabled = false;
        }else{
         document.getElementById('rxSop_802_11b').disabled = false;
         document.getElementsByName("threshold_b")[0].disabled = true;
        }

}

function funcRF_profile(is_checked)
{
        if (is_checked) {
         document.getElementById('rxSop_802_11a_b').disabled = true;
         document.getElementsByName("threshold_pprofile")[0].disabled = false;
        }else{
         document.getElementById('rxSop_802_11a_b').disabled = false;
         document.getElementsByName("threshold_pprofile")[0].disabled = true;
        }
}

// Support function to validate IPv6 address.
// It returns the number of times the substr substring occurs in the str string.
// This function doesn't count overlapped substrings.
// Parameters
// str: 
//	The string to search in 
// substr:
//	The substring to search for 
// offset:
//	The offset where to start counting 
// length:
//	The maximum length after the specified offset to search for the substring.
//	It outputs a warning if the offset plus the length is greater than the str length. 
function  subStrCount (str, substr, offset, length)
{
    var pos = 0, cnt = 0;
 
    str += '';
    substr += '';
    if (isNaN(offset)) {offset = 0;}
    if (isNaN(length)) {length = 0;}
    offset--;
 
    while ((offset = str.indexOf(substr, offset+1)) != -1){
        if (length > 0 && (offset+substr.length) > length){
            return false;
        } else{
            cnt++;
        }
    }
 
    return cnt;
}

// Test for a valid dotted IPv4 address.
function validIPv4(ip)
{
   var match = ip.match(/(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|255[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/);
   return match != null;
}

// Test if the input is a valid ipv6 address. 
function validIPv6(ip)
{
  if (ip.length<3)
  {
    return ip == "::";
  }
 
  // Check if part is in IPv4 format
  if (ip.indexOf('.')>0)
  {
        lastcolon = ip.lastIndexOf(':');
 
        if (!(lastcolon && validIPv4(ip.substr(lastcolon + 1))))
            return false;
 
        // replace IPv4 part with dummy
        ip = ip.substr(0, lastcolon) + ':0:0';
  }
 
  // Check uncompressed
  if (ip.indexOf('::')<0)
  {
    var match = ip.match(/^(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4}$/i);
    return match != null;
  }

  // Check colon-count for compressed format
  if (subStrCount(ip, ':'))
  {
    var match = ip.match(/^(?::|(?:[a-f0-9]{1,4}:)+):(?:(?:[a-f0-9]{1,4}:)*[a-f0-9]{1,4})?$/i);
    return match != null;
  }
 
  // Not a valid IPv6 address
  return false;
}
//Test if number
function isNumber(evt) {
     evt = (evt) ? evt : window.event;
     var charCode = (evt.which) ? evt.which : evt.keyCode;
     if (charCode > 31 && (charCode < 48 || charCode > 57)) {
         return false;
     }
     return true;
}

