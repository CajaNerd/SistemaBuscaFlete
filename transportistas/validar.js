//
//	jQuery Validate example script
//
//	Prepared by David Cochran
//
//	Free for your use -- No warranties, no guarantees!
//

$(document).ready(function(){

	// Validate
	// http://bassistance.de/jquery-plugins/jquery-plugin-validation/
	// http://docs.jquery.com/Plugins/Validation/
	// http://docs.jquery.com/Plugins/Validation/validate#toptions

		$('#contact-form').validate({
	    rules: {
	      name: {
	        minlength: 2,
	        required: true
	      },
	      email: {
	        required: true,
	        email: true
	      },
	      subject: {
	      	minlength: 2,
	        required: true
	      },
	      message: {
	        minlength: 2,
	        required: true
	      }
	    },
			highlight: function(element) {
				$(element).closest('.control-group').removeClass('has-success').addClass('has-error');
			},
			success: function(element) {
				element
				.text('OK!').addClass('valid')
				.closest('.control-group').removeClass('has-error').addClass('has-success');
			}
	  });

		$('#registroChofer').validate({
	    rules: {
	      nombre: {
	        minlength: 3,
	        required: true
	      },
	      correo: {
	        required: true,
	        email: true
	      },
	      password: {
	      	minlength: 3,
	        required: true
	      },
	      telefono: {
	        minlength: 8,
	        required: true
	      }
	    },
			highlight: function(element) {
				$(element).closest('.control-group').removeClass('has-success').addClass('has-error');
			},
			success: function(element) {
				element
				.text('OK!').addClass('valid')
				.closest('.control-group').removeClass('has-error').addClass('has-success');
			}
	  });

}); // end document.ready