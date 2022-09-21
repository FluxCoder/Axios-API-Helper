# HelperJS - API Connector
A script written in JavaScript to assist with quicker app development on the front end. This is currently used within my own web applications for form submits and connections to a back-end REST API.

It handles responses from the back-end and allows developers to define callback functions based on those responses. For example, set functions for errors, success as well as a default error function to be called.

It's currently using the Axios & jQuery libraries, however, I'm currently working on removing JQuery so that this script can be used within apps that don't require it.

## Requirements
- [Axios](https://axios-http.com/)
- [JQuery](https://jquery.com/) (Looking to remove this dependency in new version)

### Optional additions
- [Toastr](https://github.com/CodeSeven/toastr) (This requies JQuery, looking into [BS5 Toasts](https://getbootstrap.com/docs/5.0/components/toasts/))

