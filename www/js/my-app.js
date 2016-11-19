// Initialize your app
var myApp = new Framework7({
    modalTitle:'waZer',
    pushState:true,
    material:true,
    onAjaxStart:function(xhr){
      myApp.showPreloader();
      
    },
    onAjaxComplete:function(xhr){
       myApp.hidePreloader();

    }
});



// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    domCache:false,
});

function showloader()
{
   myApp.showPreloader();
    setTimeout(function () {
        myApp.hidePreloader();
    }, 1000);
}


 function initialize() {

    var onSuccess = function(position) {
        var gm = google.maps;
        var map = new gm.Map(document.getElementById('map_canvas'), {
          mapTypeId: gm.MapTypeId.ROADMAP,
          center: new gm.LatLng(position.coords.latitude,position.coords.longitude), 
          zoom: 15,  // whatevs: fitBounds will override
          scrollwheel: false
        });
        var iw = new gm.InfoWindow();
        var oms = new OverlappingMarkerSpiderfier(map,
          {markersWontMove: true, markersWontHide: true});


        var shadow = new gm.MarkerImage(
          'https://www.google.com/intl/en_ALL/mapfiles/shadow50.png',
          new gm.Size(37, 34),  // size   - for sprite clipping
          new gm.Point(0, 0),   // origin - ditto
          new gm.Point(10, 34)  // anchor - where to meet map location
        );

          var iconBase = 'img/';

        
        oms.addListener('click', function(marker) {
          iw.setContent(marker.desc);
          iw.open(map, marker);
        });
        oms.addListener('spiderfy', function(markers) {
          for(var i = 0; i < markers.length; i ++) {
            markers[i].setIcon(iconBase + 'marker.png');
            markers[i].setShadow(null);
          } 
          iw.close();
        });
        oms.addListener('unspiderfy', function(markers) {
          for(var i = 0; i < markers.length; i ++) {
            markers[i].setIcon(iconBase + 'marker.png');
            markers[i].setShadow(shadow);
          }
        });


         var user_marker = new google.maps.Marker({
        position: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
        icon: iconBase + 'marker.png',
        map: map
      });

      user_infowindow = new google.maps.InfoWindow({
        content: '<h3>Your Here!</h3>',
      });  

     user_infowindow.open(map, user_marker);
        
        var bounds = new gm.LatLngBounds();

        function runOnComplete(){
          for (var i = 0; i < global_arr.length; i ++) {
              var datum = global_arr[i];
              var loc = new gm.LatLng(datum.lat, datum.lon);
              bounds.extend(loc);
              var marker = new gm.Marker({
                position: loc,
                title: '',
                map: map,
                icon: iconBase + 'marker.png',
                shadow: shadow
              });
              marker.desc = '<center><img src="'+datum.image+'" style="width:100px;height:100px;"><h3>Full Name : '+datum.fullname+'</h3><p>Inquiries : '+datum.inquiries+'</p><p>Address'+datum.address+'</p><p>Contact : '+datum.contact+'</p></center>';
              oms.addMarker(marker);
            }

            // Uncomment This if you want to  load map on fit bound
            //map.fitBounds(bounds);

            // for debugging/exploratory use in console
            window.map = map;
            window.oms = oms;
        }
        
        var global_arr = [];

         var query = firebase.database().ref("inquiries");
              query.once("value")
                .then(function(snapshot) {
                  snapshot.forEach(function(childSnapshot) {
                    var key = childSnapshot.key;
                    var childData = childSnapshot.val();
                    global_arr.push({
                               fullname: childData.fullname,
                               address: childData.address,
                               image: childData.image,
                               inquiries: childData.inquiries,
                               contact: childData.contact,
                               lat: childData.latitude,
                               lon: childData.longitude
                             });
                  });
                  runOnComplete();
              });    
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

      
} // End initialize maps
  


myApp.onPageInit('index', function() {
  showloader();
  $$('.hideonlogin').hide();
  $$('.navbar').hide();

}).trigger();


$$('.signout').on('click', function () {
    showloader();
    
      firebase.auth().signOut().then(function() {
         mainView.router.loadPage({url:'login-screen-page.html', ignoreCache:true, reload:true })
      }, function(error) {
          myApp.alert('Sign Out Failed', function () {
            mainView.goBack();
          });
      });
});



myApp.onPageInit('login-screen', function (page) {
  var pageContainer = $$(page.container);
  $$('.hideonlogin').hide();
  $$('.navbar').hide();  

  pageContainer.find('.login-button').on('click', function () {

    myApp.showPreloader();
    setTimeout(function () {
        myApp.hidePreloader();
    }, 4000);

    var username = pageContainer.find('input[name="username"]').val();
    var password = pageContainer.find('input[name="password"]').val();
    
    var query = firebase.database().ref("users").orderByKey();
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var key = childSnapshot.key;
          var childData = childSnapshot.val();
          if (childData.username == username && childData.password == password) {
            $$('.statusbar-overlay').attr('data-userid', key);

             
             mainView.router.loadPage({url:'location.html', ignoreCache:true, reload:true })
             return true;

          }
      });
    });
  });
});  

myApp.onPageInit('register-screen', function (page) {
  var pageContainer = $$(page.container);
  $$('.hideonlogin').hide();
  $$('.navbar').hide();

      pageContainer.find('.register-button').on('click', function () {
        var fullname = pageContainer.find('input[name="fullname"]').val();
        var username = pageContainer.find('input[name="username"]').val();
        var password = pageContainer.find('input[name="password"]').val();
         
         function userExistsCallback(username, exists) {
            if (exists) {
                   myApp.alert('Error Registration Username Already Exist!', function () {
                    mainView.goBack();
                  }); 
            } else {
              
                    var db = firebase.database();
                    var ref = db.ref("users");
                    var newUser = ref.push();
                    newUser.set({
                      fullname: fullname,
                      username: username,
                      password: password
                    });

                  myApp.alert('Registration Success!', function () {
                       mainView.goBack();
                  }); 
            }
          }

          var ref = firebase.database().ref("users"); 
          ref.orderByChild('username').equalTo(username)
              .once('value').then(function(snapshot) {
               var exists = (snapshot.val() !== null);
               userExistsCallback(username, exists);
          });

         
           
      });
});     



myApp.onPageInit('location', function(page) { 
     $$('.hideonlogin').show();
     $$('.navbar').show();
       initialize();               
});




$$(document).on('pageInit',function(e){
    var page = e.detail.page;

   

     if (page.name === 'questions') {
          var pageContainer = $$(page.container);
          pageContainer.find('.addquestion').on('click', function () {
            var qname = pageContainer.find('input[name="question"]').val();
            var qnumber = pageContainer.find('input[name="question_num"]').val();
              var db = firebase.database();
              var ref = db.ref("personality_test_questions");
              var newUser = ref.push();
              newUser.set({
                qname: qname,
                qnum: qnumber
              });
            myApp.alert('Question Added: ' + qname , function () {
              mainView.goBack();
            });
          });
     }



    if (page.name === 'addinquiries') {
          var pageContainer = $$(page.container);
          pageContainer.find('.addinquiries').on('click', function () {
            var fullname = pageContainer.find('input[name="fullname"]').val();
            var latitude = pageContainer.find('input[name="latitude"]').val();
            var longitude = pageContainer.find('input[name="longitude"]').val();
            var address = pageContainer.find('input[name="address"]').val();
            var inquiries = pageContainer.find('input[name="inquiries"]').val();
            var contact = pageContainer.find('input[name="contact"]').val();
            var image = pageContainer.find('input[name="image"]').val();

              var db = firebase.database();
              var ref = db.ref("inquiries");
              var newSchool = ref.push();
              newSchool.set({
                latitude: latitude,
                longitude: longitude,
                fullname: fullname,
                address: address,
                contact: contact,
                image: image,
                inquiries: inquiries
              });

            showloader();   

            myApp.alert('Inquiry Added: ' + inquiries , function () {
              mainView.goBack();
            });

          });
     }

    if (page.name === 'account') {
      var user_id = $$('.statusbar-overlay').data('userid');
      var query = firebase.database().ref("users").orderByKey();
        query.once("value")
          .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
              var key = childSnapshot.key;
              var childData = childSnapshot.val();
              if (key == user_id) {
                $$('.username').html(childData.username);
                $$('.fullname').html(childData.fullname);
                $$(".fullname").css("background-image", 'url('+childData.image+')');

                 mainView.router.loadPage({url:'account.html', ignoreCache:true, reload:true })
                 return true;

              }
          });
        });
    }


    if (page.name === 'disclaimer') {
     
    }

    if (page.name === 'message') {
         var user_id = $$('.statusbar-overlay').data('userid');
         $$('.popover-inner').hide();
           var popupHTML = '<div class="popup">'+
                          '<div class="content-block">'+
                            '<center><img src="./img/ripple.gif"><h1>Finding Available Tech Support For You.</h1></center>'+ '</div>'+
                        '</div>'
            myApp.popup(popupHTML);
            setTimeout(function () {
              $$('.popup ').hide();
               myApp.alert('We Found Klemfer');
            }, 5000);
         


         var conversationStarted = false;

         var query = firebase.database().ref("users").orderByKey();
          query.once("value")
            .then(function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                var key = childSnapshot.key;
                var childData = childSnapshot.val();
                if (key == user_id) {
                  var current_user_fullname = childData.fullname;
                  var current_user_image = childData.image;
                    $$('.fullname').val(current_user_fullname);
                    $$('.image').val(current_user_image);
                }
            });
          });


            var startListening = function() {
              firebase.database().ref("message").on('child_added', function(snapshot) {
                var msg = snapshot.val();
                var myMessages = myApp.messages('.messages', {
                    autoLayout:true
                 });

                  var messageType = (['sent', 'received'])[Math.round(Math.random())];

                  myMessages.addMessage({
                    // Message text
                    text: msg.message,
                    // Random message type
                    type: messageType,
                    // Avatar and name:
                    avatar: msg.image,
                    name: msg.fullname,
                    // Day
                    day: !conversationStarted ? 'Today' : false,
                    time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
                  })
                 
                  // Update conversation flag
                  conversationStarted = true;       

                  $$('.not-empty-state').val('');  


                  });
            }

            // Begin listening for data
            startListening();




         // var query = firebase.database().ref("message").once('value').then(function(snapshot) {
         //            snapshot.forEach(function(childSnapshot) {

         //                var childData = childSnapshot.val();
         //                var fullname = childData.fullname;
         //                var message = childData.message;
         //                var image = childData.image;

         //                $$('.messages-auto-layout').append('<div class="message message-received message-with-avatar message-last message-with-tail message-first"><div class="message-name">'+fullname+'</div><div class="message-text">'+message+'</div><div style="background-image:url('+image+')" class="message-avatar"></div></div>');
         //          });
         //    });  

        $$('.messagebar .link').on('click', function () {
             var message = $$('.not-empty-state').val();  

            var db = firebase.database();
            var ref = db.ref("message");
            var newMessage = ref.push();
            var fullname =  $$('.fullname').val();
            var image =  $$('.image').val();

            newMessage.set({
              fullname: fullname,
              image: image,
              message: message,
            });    

        });         
    }

})


// Generate dynamic page
var dynamicPageIndex = 0;
function createContentPage() {
	mainView.router.loadContent(
        '<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
        '    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="dynamic-pages" class="page">' +
        '    <!-- Scrollable page content-->' +
        '    <div class="page-content">' +
        '      <div class="content-block">' +
        '        <div class="content-block-inner">' +
        '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
        '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );
	return;
}