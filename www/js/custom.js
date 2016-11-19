

  client = new Paho.MQTT.Client("m13.cloudmqtt.com",36178, "web_" + parseInt(Math.random() * 100, 10));

  // set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  var options = {
    useSSL: true,
    userName: "syfxbcvk",
    password: "7_VJoMHE29F8",
    onSuccess:onConnect,
    onFailure:doFail
  }

  // connect the client
  client.connect(options);

  // called when the client connects
  function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    console.log("onConnect");
    client.subscribe("PhilMg/TX");
   // message = new Paho.MQTT.Message("Hello CloudMQTT");
   // message.destinationName = "/cloudmqtt";
    pubLish("/cloudmqtt","WEEEEE!!");
   
  }

  function doFail(e){
    console.log(e);
  }

  function pubLish(topics,message)
  {
    message = new Paho.MQTT.Message(message);
    message.destinationName = topics;
     client.send(message); 
    console.log(message);

  }

  // called when the client loses its connection
  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log(responseObject);
    }
    console.log(responseObject);

  }
     var x = [];
     var y = [];
  // called when a message arrives
  function onMessageArrived(message) {

         ss = message.payloadString;
          var obj = JSON.parse(ss);
       
        

          var p = obj.PHILMG.P;
          var t = obj.PHILMG.T;
          var f = obj.PHILMG.F;
          var w = obj.PHILMG.W;
          var m = obj.PHILMG.M;

          var date = new Date();
          currentDate = date.getDate();     // Get current date
          month       = date.getMonth() + 1; // current month
          year        = date.getFullYear();
          hour = date.getHours();
          min  = date.getMinutes();
          sec  = date.getSeconds();
   
          var datetime = hour+":"+min +":"+sec;


          x.push(datetime);
          y.push(t);
      
          var data = [{
              x: x,
              y: y,
              type: 'scatter'
          }];


        Plotly.newPlot(document.getElementById('PhilMg'), data);
          console.log(y)

        
     
  }



 



