// Initialize your app
var myApp = new Framework7({
    modalTitle:'Faact',
    pushState:true,
    material:true,
    onAjaxStart:function(xhr){
      myApp.showPreloader();
      console.log('showPreloader');
    },
    onAjaxComplete:function(xhr){
       myApp.hidePreloader();
      console.log('hidePreloader');

    }
});



// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    domCache:true,
});


function showloader()
{
   myApp.showPreloader();
    setTimeout(function () {
        myApp.hidePreloader();
    }, 4000);
}


 document.addEventListener("deviceready", onDeviceReady, false);
  function onDeviceReady() {
      console.log("navigator.geolocation works well");
  } 


myApp.onPageInit('index', function() {
  showloader();
  $$('.hideonlogin').hide();
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

// Code to Login Using Fb
  pageContainer.find('.login-fb').on('click', function () {
      var provider = new firebase.auth.FacebookAuthProvider();
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var token = result.credential.accessToken;
        // The signed-in user info.
         var user = result.user;
          if (user) {
             mainView.router.loadPage({url:'home.html', ignoreCache:true, reload:true })
          }
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
  });

// Code To Login Using Google
  pageContainer.find('.login-google').on('click', function () {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log(user);
      if (user) {
         mainView.router.loadPage({url:'home.html', ignoreCache:true, reload:true })
      }
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  });  

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

             console.log(key);
             mainView.router.loadPage({url:'home.html', ignoreCache:true, reload:true })
             return true;

          }
      });
    });
  });
});  

myApp.onPageInit('register-screen', function (page) {
  var pageContainer = $$(page.container);
  $$('.hideonlogin').hide();

  pageContainer.find('.register-button').on('click', function () {
    var fullname = pageContainer.find('input[name="fullname"]').val();
    var username = pageContainer.find('input[name="username"]').val();
    var password = pageContainer.find('input[name="password"]').val();
      var db = firebase.database();
      var ref = db.ref("users");
      var newUser = ref.push();
      newUser.set({
        fullname: fullname,
        username: username,
        password: password
      });
    myApp.alert('Registration Success Username: ' + username + ', Password: ' + password, function () {
      mainView.goBack();
    });
  });
});     





myApp.onPageInit('home', function(page) { 
      $$('.hideonlogin').show();
});




$$(document).on('pageInit',function(e){
    var page = e.detail.page;

    if (page.name === 'location') {
        var map;
      document.addEventListener("deviceready", function() {
        var div = document.getElementById("map");

        // Initialize the map view
        map = plugin.google.maps.Map.getMap(div);

        // Wait until the map is ready status.
        map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
      }, false);

      function onMapReady() {
        var button = document.getElementById("button");
        button.addEventListener("click", onBtnClicked);
      }

      function onBtnClicked() {

        // Move to the position with animation
        map.animateCamera({
          target: {lat: 37.422359, lng: -122.084344},
          zoom: 17,
          tilt: 60,
          bearing: 140,
          duration: 5000
        }, function() {

          // Add a maker
          map.addMarker({
            position: {lat: 37.422359, lng: -122.084344},
            title: "Welecome to \n" +
                   "Cordova GoogleMaps plugin for iOS and Android",
            snippet: "This plugin is awesome!",
            animation: plugin.google.maps.Animation.BOUNCE
          }, function(marker) {

            // Show the info window
            marker.showInfoWindow();

            // Catch the click event
            marker.on(plugin.google.maps.event.INFO_CLICK, function() {

              // To do something...
              alert("Hello world!");

            });
          });
        });
      }
    }

    if (page.name === 'results') {
      var user_id = $$('.statusbar-overlay').data('userid');
      var artistic_total = [];
      var conventional_total = [];
      var enterprising_total = [];
      var investigative_total = [];
      var realistic_total = [];
      var social_total = [];
      var i = 0;
        var query = firebase.database().ref("personality_test").orderByChild('user_id').equalTo(user_id)
                .once('value').then(function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {
                    ++i;


                        var key = childSnapshot.key;
                        var childData = childSnapshot.val();


                        var artistic = [1,2,13,14,25,26,37,38,49,50,61,62,73,74,85,86,97];
                        var conventionalinterest = [3,4,15,16,27,28,39,40,51,52,63,64,75,76,87,88,99,100];
                        var enterprising = [5,6,17,18,29,30,41,42,53,54,65,66,77,78,89,90,101,102];
                        var investigative = [7,8,19,20,31,32,43,44,55,56,67,68,79,80,91,92,103,104];
                        var realistic = [9,10,21,22,33,34,45,46,57,58,69,70,81,82,93,94,105,106];
                        var social = [11,12,23,24,35,36,47,48,59,60,71,72,83,84,95,96,107,108];

                        
                          if (childData.user_id == user_id) {
                            console.log(childData.user_id);
                            console.log(user_id);
                              
                              // Check where to store the data
                              function isInArray(value, array) {
                                return array.indexOf(value) > -1;
                              }

                              if (isInArray(i,artistic) === true){
                                  artistic_total.push(parseInt(childData.answer));
                              }
                              else if(isInArray(i,conventionalinterest) === true){
                                  conventional_total.push(parseInt(childData.answer));
                              }
                               else if(isInArray(i,enterprising) === true){
                                 enterprising_total.push(parseInt(childData.answer));
                              }

                              else if(isInArray(i,investigative) === true){
                                 investigative_total.push(parseInt(childData.answer));
                              }

                               else if(isInArray(i,realistic) === true){
                                 realistic_total.push(parseInt(childData.answer));
                              }

                              else if(isInArray(i,social) === true){
                                 social_total.push(parseInt(childData.answer));
                              }

                              

                              var final_artistic_result = artistic_total.reduce(add, 0);
                              var final_conventionalinterest_result = conventional_total.reduce(add, 0);
                              var final_enterprising_result = enterprising_total.reduce(add, 0);
                              var final_investigative_result = investigative_total.reduce(add, 0);
                              var final_realistic_result = realistic_total.reduce(add, 0);
                              var final_social_result = social_total.reduce(add, 0);
                              function add(a, b) {
                                  return a + b;
                              }

                              console.log(artistic_total);
                              console.log(final_artistic_result);

                              $$('#numeric_artistic').html(final_artistic_result+'%');
                              $$('#numeric_conventional').html(final_conventionalinterest_result+'%');
                              $$('#numeric_enterprising').html(final_enterprising_result+'%');
                              $$('#numeric_investigative').html(final_investigative_result+'%');
                              $$('#numeric_realistic').html(final_realistic_result+'%');
                              $$('#numeric_social').html(final_social_result+'%');

                              myApp.setProgressbar('#artistic',final_artistic_result, 2);
                              myApp.setProgressbar('#conventional',final_conventionalinterest_result, 2);          
                              myApp.setProgressbar('#enterprising',final_enterprising_result, 2);          
                              myApp.setProgressbar('#investigative',final_investigative_result, 2);          
                              myApp.setProgressbar('#realistic',final_realistic_result, 2);          
                              myApp.setProgressbar('#social',final_social_result, 2);          
                        }
                  });      
              });      

    }

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



    if (page.name === 'personalitytest') {    
            var user_id = $$('.statusbar-overlay').data('userid');
            
            var query = firebase.database().ref("personality_test_questions");
            query.once("value")
              .then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                  var key = childSnapshot.key;
                  var childData = childSnapshot.val();
                   // Prepare Data
                    var listHTML = '';
                     listHTML+='<div class="content-block-title">'+childData.qnum+'. '+childData.qname+'</div><div class="list-block"> <ul>';
                     for (var c = 1; c <= 5; c++) {

                        listHTML+='<li><label class="label-radio item-content">';

                        listHTML+=' <input type="radio" name="q'+childData.qnum+'" value="'+c+'"';
                          if (c == 1) {
                             listHTML+= 'checked';
                          }
                        listHTML+='>';
                              
                         listHTML+='<div class="item-media"> <i class="icon icon-form-radio"></i></div><div class="item-inner">';
                         listHTML+= '<div class="item-title">'+c+'</div></div></label></li> ';
                     }    
                    listHTML += '</ul></div>';      

                    listHTML += '';        

                  $$('.questions').append(listHTML);
              });
            });

              // Remove based on ID
            // var ref = firebase.database().ref("personality_test"); 
            // ref.orderByChild('user_id').equalTo(user_id)
            //     .once('value').then(function(snapshot) {
            //         snapshot.forEach(function(childSnapshot) {
            //         ref.child(childSnapshot.key).remove();
            //     });
            // });
           
          $$('.personalitytest-submit').on('click', function(){
                      var formData = myApp.formToJSON('#personality-test-form');
                      var i = 0;
                      var user_exist = [];

                      var ref = firebase.database().ref("personality_test"); //root reference to your data
                      ref.orderByChild('user_id').equalTo(user_id)
                          .once('value').then(function(snapshot) {
                            snapshot.forEach(function(childSnapshot) {
                               ++i;
                                 firebase.database().ref('personality_test/' + childSnapshot.key).set({
                                        answer: formData['q' + i],
                                        user_id:user_id ,
                                        question_number: i
                                    });
                              });
                      });


                      function userExistsCallback(userId, exists) {
                        if (exists) {
                          console.log('user ' + userId + ' exists!');
                        } else {
                          for (var c = 1; c <= 108; c++) {
                                var db = firebase.database();
                                var ref = db.ref("personality_test");
                                var newPersonalitytestAns = ref.push();
                                newPersonalitytestAns.set({
                                  answer: formData['q' + c],
                                  user_id:userId ,
                                  question_number: c
                                });   
                            }
                        }
                      }

                        var ref = firebase.database().ref("personality_test"); 
                        ref.orderByChild('user_id').equalTo(user_id)
                            .once('value').then(function(snapshot) {
                             var exists = (snapshot.val() !== null);
                             userExistsCallback(user_id, exists);
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
                console.log(childData.username);
                $$('.username').html(childData.username);
                $$('.fullname').html(childData.fullname);
                 mainView.router.loadPage({url:'home.html', ignoreCache:true, reload:true })
                 return true;

              }
          });
        });
    }


    if (page.name === 'disclaimer') {
     
    }

     if (page.name === 'register-screen') {
        
        $$('form.ajax-submit-onchange').on('submitted', function (e) {
          var formData = myApp.formToJSON('form.ajax-submit-onchange');
          var fullname = JSON.stringify(formData.fullname);
          var username = JSON.stringify(formData.username);
          var password = JSON.stringify(formData.password);
          var url = 'http://192.168.1.2/androidapi/public/register';  
            $$.get(url + '/'+fullname+ '/'+username+ '/'+password, function (data) {
                 console.log(data + 'success');
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