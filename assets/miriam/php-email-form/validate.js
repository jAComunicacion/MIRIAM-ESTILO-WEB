!(function($) {
"use strict";

$('form.php-email-form').submit(function(e) {
e.preventDefault();

var f = (this).find('.form-group'), ferror = false, emailExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}/i;

// Validación de inputs
f.children('input').each(function() {
var i = $(this);
var rule = i.attr('data-rule');
if (rule !== undefined) {
var ierror = false;
var pos = rule.indexOf(':', 0);
var exp = '';
if (pos >= 0) {
exp = rule.substr(pos + 1, rule.length);
rule = rule.substr(0, pos);
} else {
exp = '';
}

switch (rule) {
case 'required':
if (i.val() === '') ierror = true;
break;
case 'minlen':
if (i.val().length < parseInt(exp)) ierror = true;
break;
case 'email':
if (!emailExp.test(i.val())) ierror = true;
break;
case 'checked':
if (!i.is(':checked')) ierror = true;
break;
case 'regexp':
var re = new RegExp(exp);
if (!re.test(i.val())) ierror = true;
break;
}
i.next('.validate').html((ierror ? (i.attr('data-msg') !== undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
if (ierror) ferror = true;
}
});

// Validación de textareas
f.children('textarea').each(function() {
var i = $(this);
var rule = i.attr('data-rule');
if (rule !== undefined) {
var ierror = false;
var pos = rule.indexOf(':', 0);
var exp = '';
if (pos >= 0) {
exp = rule.substr(pos + 1, rule.length);
rule = rule.substr(0, pos);
} else {
exp = '';
}

switch (rule) {
case 'required':
if (i.val() === '') ierror = true;
break;
case 'minlen':
if (i.val().length < parseInt(exp)) ierror = true;
break;
}
i.next('.validate').html((ierror ? (i.attr('data-msg') != undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
if (ierror) ferror = true;
}
});

if (ferror) return false;

var this_form = 
(this);
var action=(this);varaction=(this).attr('action');
if (!action) {
this_form.find('.loading').hide();
this_form.find('.error-message').show().html('The form action property is not set!');
return false;
}

this_form.find('.sent-message').hide();
this_form.find('.error-message').hide();
this_form.find('.loading').show();

// En este ejemplo no usamos reCAPTCHA
php_email_form_submit(this_form, action, this_form.serialize());

return true;

});

function php_email_form_submit(this_form, action, data) {
$.ajax({
type: "POST",
url: action,
data: data,
timeout: 40000
}).done(function(msg){
if (msg.trim() == 'OK') {
this_form.find('.loading').hide();
this_form.find('.sent-message').show();
this_form.find("input:not([type=submit]), textarea").val('');
} else {
this_form.find('.loading').hide();
var error_msg = msg ? msg : 'Form submission failed and no error message returned from: ' + action;
this_form.find('.error-message').show().html(error_msg);
}
}).fail(function(data){
console.log(data);
var error_msg = "Form submission failed!<br>";
if (data.statusText || data.status) {
error_msg += 'Status:';
if (data.statusText) error_msg += ' ' + data.statusText;
if (data.status) error_msg += ' ' + data.status;
error_msg += '<br>';
}
if (data.responseText) error_msg += data.responseText;
this_form.find('.loading').hide();
this_form.find('.error-message').show().html(error_msg);
});
}

})(jQuery);
