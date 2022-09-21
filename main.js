function childSearch(parent, child, callback = null) {
    var found = true;

    if (typeof parent !== 'object'){
        return false;
    }

    var nest = child.split(".");
    var nests = nest.length;

    if (nests > 1) {
      for (i = 0; i < nests; i++) {
        if ((nest[i] in parent) == false) {
          found = false;
          break;
        }
        parent = parent[nest[i]];
      }
    } else {
      if ((child in parent) == false) {
        found = false;
      }
      parent = parent[child];
    }

    //Check for callback, and ensure it's calleable.
    if (typeof callback === "function" && found) {
      return callback(parent);
    }

    return found;
  }

  App = {
      v2_loaded: false,
      Connect: function(url, data, options = null){

          if(options == null){
              axios.post(url, data);
              return true;
          }

          var btn = function(bool){
              if(childSearch(options, 'button')){
                  if(bool === true){
                      options.button.attr('text', options.button.html());
                      options.button.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
                  } else {
                      options.button.html(options.button.attr('text'));
                  }
                  options.button.prop('disabled', bool);
              }
          };

          btn(true);

            //Check if default error has already been supplied or not, and then add one.
            if(childSearch(options.errors, 'default') == false){
                options.errors = [];
                options.errors.default = function(){
                    App.Form.AddError('danger', 'There was an error');
                }
            }

            method = 'POST';
            if(childSearch(options, 'method')){
                method = options.method;
            }

            axios({method: method, url: url, data: data}).then(function (response) {

              //Check for success
              if(childSearch(response.data, "success") && response.data.success == true){

                //Check if the API wants us to display a ToastrJS
                if(childSearch(response.data.extra, "toastr")){
                    if(typeof toastr.info === 'function'){
                        toastr.info(response.data.extra.toastr);
                    }
                }

                //Check if we should be using default success here?
                if(typeof options.success === 'function'){
                    options.success(response);
                } else {

                    //Default actions to take, firstly check if the response has a URL
                    if(childSearch(response.data, 'extra.url')){
                        window.location.replace(response.data.extra.url);
                    } else {

                        if(childSearch(response.data, 'extra.message')){
                            App.Form.AddError('success', response.data.extra.message);
                        } else {
                            App.Form.AddError('success', 'Action complete');
                        }
                    }

                }
                btn(false);
                return true;
              }

              //Add captcha error, saves having to write it out loads of times.
              options.errors['captcha'] = function(){
                window.grecaptcha.ready(() => {

                    //Only load v2 captcha in once
                    if(App.v2_loaded == false){
                        App.Form.AddError('warning', 'Please complete CAPTCHA to login');
                        $('#CapBox').fadeIn();
                        window.grecaptcha.render('captchabox', {'sitekey' : '6Lcu0jEcAAAAAG9fWdH6dWuO6v7g_spv5rasQ5AI'});

                    } else {
                        App.Form.AddError('warning', 'Please re-complete CAPTCHA to login');
                        window.grecaptcha.reset();
                    }

                    App.v2_loaded = true;
                });
            }

              //Check for errors
              childSearch(response.data, "error.error", function(element) {
                  // options.errors[element]();
                  if(typeof options.errors[element] === 'function'){
                      options.errors[element](response.data.error);
                  } else {
                      options.errors.default();
                  }
              });

              btn(false);

          }).catch(error => {
              options.errors.default();
              btn(false);
          });

      },

      Form: {
          errorBox: '.error-box',
          AddError: function(type, text){
              var errorHTML = '<div class="alert alert-'+type+'">'+text+'</div>'
              $(App.Form.errorBox).append(errorHTML);
              $(App.Form.errorBox).fadeIn();
          },
          RemoveErrors: function(){
              var OldErrors = $(App.Form.errorBox + '> *');
              OldErrors.fadeOut(200, function(){
                  //Remove errors rather than leave empty HTML elements...
                  OldErrors.remove();
              });
          },
          Use: function(form, action){
            form.on('submit', function(e){
                e.preventDefault()

                App.Form.RemoveErrors();

                var data = new FormData($(this).get(0));

                App.Connect(action, data, {
                    'button': $('button[type=submit]', $(this)),
                });

            });
          }
      },

      Connection: function(api, action, data, options){

        if(App.v2_loaded == true && grecaptcha && grecaptcha.getResponse().length == 0){
            return false;
        }


        grecaptcha.ready(function() {
            grecaptcha.execute('6LeGpjEcAAAAAI9FgVURKZOqfJXqKJ1CkuYhH8TU', {action: action}).then(function(token) {

                if(data == null){
                    data = 'v3_token='+token;
                    if(App.v2_loaded){
                        v2_token = grecaptcha.getResponse();
                        data = data+'&g-recaptcha-response='+v2_token;
                    }
                } else {
                    data.append('v3_token', token)
                }

                App.Connect('/api/v1'+api, data, options);
            });
        });
    }
  }
