// =========== VARS ===========================
//var channel_1_flashtime = 0;
var todo = false;
var string= "" ;
var ch = 1 ;
var model = "SHURE QLX-D" ;
var contain = {
	"name"	:	["Name", "s", "CHAN_NAME"],
	"trans" : ["Transmitter", "s","TX_TYPE"],
	"gain" : ["Audio Gain", "s","AUDIO_GAIN"],
	"rfpower" : ["RF Power", "s","TX_RF_PWR"],
	"frequ" : ["Frequency", "s","FREQUENCY"],
	"rfgroup" : ["RF Group", "s","GROUP_CHAN"],
	"rfchann" : ["RF Channel", "s",""],
	"antenna" : ["Antenna", "s","RF_ANTENNA"],
	"rflvl" : ["RF", "s", ""],
	"rfgpeak" : ["RF Level", "f1", "RX_RF_LVL"],
	"audiolvl" : ["Audio Level", "s", ""],
	"audlvlpk" : ["Audio Level Peak", "f2", "AUDIO_LVL"],	
	"encrypt" : ["Encryption", "s", ""],
	"battrun" : ["Battery Runtime", "s", "BATT_RUN_TIME"],
	"battcycle" : ["Battery Cycles", "s", ""],
	"battype" : ["Battery Type", "s", "BATT_TYPEBATT_CYCLE"],
	"battcharge" : ["Battery Charge", "f3", "BATT_BARS"],
	"battbars" : ["Battery Bars", "en", ""]};

// =======================================
//			FUNCTION INIT
// =======================================

function init() {
  script.setUpdateRate(1);
  //request all value fields
  getAll();
  
//------------------ Insert Parameters ------------------------
	reset = local.parameters.addTrigger("Reset" , "Reset Update Rate Values" , false);
  	rCh= local.parameters.addEnumParameter("Update Rate Ch 1", "Update Rate Ch 1","no Updates","00000","very slow (15sec)","15000","slow (5sec)","05000","medium (2,5sec)","02500","fast (1sec)","01000","faster (0,5sec)","00500","very fast (0.2sec)","00200","fastest (0,1sec)","00100");
	
  
// =======================================
//			CREATE CONTAINERS
// =======================================

  
//=============== Device Container ==================
	var dev = local.values.addContainer("Device");
	//	dev.setCollapsed(true);		
		r=dev.addStringParameter("Model Name", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("Receiver ID", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("MAC Address", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("RF Band", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("Power Lock", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("Menu Lock", "","");
		r.setAttribute("readonly" ,true);
		r=dev.addStringParameter("FW Version", "","");
		r.setAttribute("readonly" ,true);
		
//============== Channels Container ==================
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	 var chan = local.values.addContainer("Channel 1");
		chan.setCollapsed(true);	
		chan.addTrigger("Update", "Request all the Values from the Hardware !!" , false);			
		var champs = util.getObjectProperties(contain);
		for (var n = 0; n < champs.length; n++) {
			if (contain[champs[n]][1] == "s") {
			p=chan.addStringParameter(contain[champs[n]][0], "", ""); 
			p.setAttribute("readonly" ,true);}			
			else if (contain[champs[n]][1] == "f1") {
			p=chan.addFloatParameter(contain[champs[n]][0], "", -115,-115,-1); 
			p.setAttribute("readonly" ,true);}			
			else if (contain[champs[n]][1] == "f2") {
			p=chan.addFloatParameter(contain[champs[n]][0], "", -50,-50,-1);
			p.setAttribute("readonly" ,true);}			
			else if (contain[champs[n]][1] == "f3") {
			p=chan.addFloatParameter(contain[champs[n]][0], "", 0,0,100); 
			p.setAttribute("readonly" ,true);} 
			else if (contain[champs[n]][1] == "en") {	
			p=chan.addEnumParameter("Battery Bars", "Battery Bars","unknown","255","5/5 full","5","4/5 bars","4","3/5 bars","3","2/5 bars","2","1/5 bars","1","0/5 alerte !", "0");
			p.setAttribute("readonly" ,true);	}		}
			
	
			
}

function update(delta){
  }
  
// =======================================
//			HELPER
// =======================================

function toInt(input) {
  //function is used to parse strings with leading 0 to int, parseInt assumes a number in octal representation due to the leading 0, so 05000 becomes 2560. with this function 05000 will be parsed as 5000.
  string = input;
  notNull = false;
  res = "";
  for (indx = 0; indx < string.length; indx++) {
    char = string.substring(indx, indx + 1);
    if (char != 0 || notNull) {
      res += char;
      notNull = true;
    }
  }

  return parseInt(res);
}

// =======================================
//			DATA RECEIVED
// =======================================

function dataReceived(inputData) {

  splitData = inputData.split(">");
  for (item = 0; item < splitData.length; item++) {
    data = splitData[item];
    // Removing the surrounding "<" and ">"
    trimmedStr = data.substring(2, data.length - 1);
    // remove possible string answers
    if (trimmedStr.indexOf("{") > -1) {
      string = trimmedStr.substring(
        trimmedStr.indexOf("{"),
        trimmedStr.indexOf("}") + 1
      );
      trimmedStr = trimmedStr.replace(string, "");
      string = string.replace("{", "").replace("}", "");
    }

// ========= Splitting the string by spaces ==========
    parts = trimmedStr.split(" ");

    if (parts[0] == "REP") {
      //message is a return value from the receiver
      //TODO: do something with it
      //script.log(parts[2]);

// =======================================
// 				DEVICE INFOS 
// =======================================
      
        local.values.device.modelName.set(model);
     
      if (parts[1] == "DEVICE_ID") {
        local.values.device.receiverID.set(string);
      }
      
      if (parts[1] == "MAC_ADDR") {
        local.values.device.macAddress.set(parts[2]);
      }
      if (parts[1] == "FW_VER") {
        local.values.device.fwVersion.set(string);
      }
      if (parts[1] == "RF_BAND") {
        local.values.device.rfBand.set(string);
      }
      if (parts[1] == "FLASH") {
        if (parts[2] == "ON") {
          local.values.device.flashing.set(true);
        } else {
          local.values.device.flashing.set(false);
        }
      }
// =======================================
//			 CHANNEL INFOS 
// =======================================


      if (parts[2] == "CHAN_NAME") {
        local.values.channel1.getChild("name")
          .set(string);
      } 
      if (parts[2] == "TX_TYPE") {
        local.values.channel1.getChild("transmitter")
          .set(parts[3]);
      }
       if (parts[2] == "TX_PWR_LOCK") {
        local.values.device.powerLock.set(parts[3]);
      }
      if (parts[2] == "TX_MENU_LOCK") {
        local.values.device.menuLock.set(parts[3]);
      }
      if (parts[2] == "METER_RATE") {
        local.parameters.getChild("updateRateCh" + parts[1]).setData(parts[3]);
      }
      if (parts[2] == "GROUP_CHAN") {
      	var grp_chan = parts[3];
        grp_chan =  grp_chan.split(",");
          
        local.values.channel1.rfGroup.set(grp_chan[0]);
        local.values.channel1.rfChannel.set(grp_chan[1]);
      }
      if (parts[2] == "AUDIO_GAIN") {
          parts[3] = parts[3].substring(1, parts[3].length);
          var val = parseFloat(parts[3]) - 18 ;
          val = val+" db" ;
        //root.modules.shureQLX_D.parameters.updateRateCh1
        local.values.channel1.audioGain.set(val);
      }
      if (parts[2] == "RX_RF_LVL") {
      var rfparse = parseFloat(parts[3]) -115;
      	if (rfparse > -10) {rf = rfparse+" dBm - OverLoad!";}
         else if (rfparse < -75) {rf = "RF too low !";}
         else {rf = rfparse+" dBm";}
        local.values.channel1.rf.set(rf);
        local.values.channel1.rfLevel.set(rfparse);
      }
               
      if (parts[2] == "AUDIO_LVL") {
      var parselvl = parseFloat(parts[3]);
      var level = parselvl - 50 ;
      if (level < -47)
        {var lvlstring = "NO SIGNAL" ;}
      else {lvlstring = level+" dbFS" ;}
     	local.values.channel1.audioLevel.set(lvlstring);
        local.values.channel1.audioLevelPeak.set(level);
      }
           
      if (parts[2] == "TX_RF_PWR") {
        local.values.channel1.rfPower.set(parts[3]);
      }
      
      if (parts[2] == "RF_ANTENNA") {
      	var ant = parts[3];
      	if (ant== "XX" || ant== "" ){ ant = "RF no antenna" ;}
      	if (ant== "AX"){ ant = "antenna A" ;}
      	if (ant== "XB"){ ant = "antenna B" ;}
        local.values.channel1.antenna.set(ant);
      }
      if (parts[2] == "FREQUENCY") {
        dec = parts[3].substring(parts[3].length - 3, parts[3].length);
        lead = parts[3].substring(0, parts[3].length - 3);
        local.values.channel1.frequency.set(lead + "." + dec);
         var band = "--" ;
        if(lead >470 && lead< 534){ band = "G51" ;}
        else if(lead >534 && lead< 598){ band = "H51" ;}
        else if(lead >606 && lead< 670){ band = "K51" ;}
        local.values.device.rfBand.set(band);
      }
      if (parts[1] == "ENCRYPTION") {
        local.values.channel1.encryption.set(parts[2]);
      }
       if (parts[2] == "BATT_TYPE") {
        local.values.channel1.batteryType.set(parts[3]);
      }
      if (parts[2] == "BATT_BARS") {
      var charge = parseFloat(parts[3]) ;
      if ( charge <= 5){ charge = charge*20 ;}
      else {charge = 0 ;}
        local.values.channel1.batteryBars.setData(parseInt(parts[3]));
        local.values.channel1.batteryCharge.set(charge);
      }
      if (parts[2] == "BATT_CYCLE") {
      	var cycle = parseInt(parts[3]);
      	 if (cycle == 65535) {
          local.values.channel1.batteryCycles.set("SHOWN ONLY FOR SB900 !");}
          else
          {local.values.channel1.batteryCycles.set(""+cycle+"");}
      }
      if (parts[2] == "BATT_RUN_TIME") {
        mins = parseInt(parts[3]);
        if (mins <= 65532) {
          hrs = Math.floor(mins / 60);
          min = mins - hrs * 60;
          lbl = hrs + " hrs " + min + " min";
        } else if (mins == 65533) {
          lbl = "Battery communication warning";
        } else if (mins == 65534) {
          lbl = "Battery time calculating";
        } else if (mins == 65535) {
          lbl = "SHOWN ONLY FOR SB900 !";
        }  
        local.values.getChild("channel" + parts[1]).batteryRuntime.set(lbl);
      }
    } else if (parts[0] == "SAMPLE") {
      if (parts[2] == "ALL") {
      	//A/B Antenna
      	var ant = parts[3];
      	if (ant== "XX" || ant== "" ){ ant = "RF no antenna" ;}
      	if (ant== "AX"){ ant = "antenna A" ;}
      	if (ant== "XB"){ ant = "antenna B" ;}
        local.values.channel1.antenna.set(ant);
        
         //RF Level
         var rfparse = parseFloat(parts[4]) -115 ;
         if (rfparse >= -10) {rf = rfparse+" dBm - OverLoad!";}
         else if (rfparse < -75) {rf = "RF too low !";}
         else {rf = rfparse+" dBm";}
        local.values.channel1.rf.set(rf);
        local.values.channel1.rfLevel.set(rfparse);
        
        //Audio Level Peak
        var parselvl = parseFloat(parts[5]) ;
		var level = parselvl - 50 ;
		if (level < -47)
        {level = "NO SIGNAL" ;}
        else if (level < -47 && level < -6)
        {level = level+" dbFS -> Limit!" ;}
        else if (level >= -6 )
        {level = level+" dbFS -> Clip !!" ;}
        else {level = level+" dbFS" ;}
        var lvlstring = parselvl - 50 ;
        local.values.channel1.audioLevel.set(level);
        local.values.channel1.audioLevelPeak.set(lvlstring);
      }
    }
  }
}

// =======================================
// 				PARAM CHANGE
// =======================================

function moduleParameterChanged(param) {

  		if (param.name == "isConnected" && param.get() == 1) {
    	getAll();  }
    	if (param.name == "reset") {
    	local.parameters.updateRateCh1.set("no Updates"); }
	  	if (param.name == "updateRateCh1")
	  	var value = local.parameters.updateRateCh1.get() ; 
		{local.send("< SET 1 METER_RATE " +value+ " >");}
	
}


// =======================================
// 				 VALUE CHANGE 
// =======================================

function moduleValueChanged(value) {
	
	if (value.name == "update") {
      local.send("< GET 1 ALL >");
    }
  if (value.getParent().name == "device") {
    if (value.name == "flashing" && value.get() == 1) {
      setFlashing(0);
    }
    if (value.name == "deviceID") {
      setDeviceID(value.get());
    }
  }
  if (value.getParent().name.substring(0, 7) == "channel") {
    channel = value.getParent().name.substring(7, 8);
    if (value.name == "flashing" && value.get() == 1) {
      setFlashing(channel);
    }

  }
}

// =======================================
// 				 REQUESTS 
// =======================================

function requestModel() {
  //< GET MODEL >
  local.send("< GET MODEL >");
}

function requestDeviceID() {
  //< GET DEVICE_ID >
  local.send("< GET DEVICE_ID >");
}

function requestRfBand() {
  //< GET RF_BAND >
  local.send("< GET RF_BAND >");
}

function requestFwVersion() {
  local.send("< GET FW_VER >");
}

function requestChName(ch) {
  local.send("< GET " + ch + " CHAN_NAME >");
}

function requestChAGain(ch) {
  local.send("< GET " + ch + " AUDIO_GAIN >");
}

function requestChGroup(ch) {
  local.send("< GET " + ch + " GROUP_CHAN >");
}

function requestChFreq() {
  local.send("< GET " + ch + " FREQUENCY >");
}

function getAll() {
  local.send("< GET 0 ALL >");
}

function requests(string) {
  local.send(string);
}

// =======================================
//  			 COMMANDS 
// =======================================

function setDeviceID(newid) {
  local.send("< SET DEVICE_ID {" + newid + "} >");
}

function sendLine(line) {
    local.send(line );
}

function setChannelName(newName) {
    local.send(
      "< SET " + ch + " CHAN_NAME {" +newName+ "} >" );
}

function setAudioGain(gain) {
    local.send("< SET " + ch + " AUDIO_GAIN " + (gain + 18) + " >");
}

function incAudioGain(addgain) {
    local.send("< SET " + ch + " AUDIO_GAIN INC " + addgain + " >");
}

function decAudioGain(addgain) {
	local.send("< SET " + ch + " AUDIO_GAIN DEC " + addgain + " >");
}

function setMeterRate(rate) {
    local.send("< SET " + ch + " METER_RATE " + rate + " >");

}
