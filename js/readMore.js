	// Example: Read More
// Take any div with the class "more" and make it hide/show itself dynamically
// Demonstrates event delegation.
$(function() {
	
	// progressive enhancement - uncomment the following line to see everything still working fine despite the JS breaking
	// undefined == fals;

	// if you're going to work with a set of objects more than once, save them in a variable
	$readMores = $('.more');
	
	// hide all the read mores, and add the expander link before them
	$readMores.hide().before('<button type="button" class="read-more btn btn-lg btn-block btn-warning" href="#"><span class="glyphicon glyphicon-collapse-down"></span> Comenzar</button>');
	
	// add the "read less" link instead the read more
	$readMores.append('<button id="btnMinimizar" class="read-less btn btn-xs btn-block btn-warning" href="#"><span class="glyphicon glyphicon-collapse-up"></span> Minimizar Vista</button>');
	
	// start with an ID selector that gets as specific as possible for the best performance,
	// then use find() to get what you really want.
	$('#primary').click(function(event) {
	
		// extract the target of the click for examination below
		var $t = $(event.target);
		
		// our JS-created links have read-more and read-less classes
		if ($t.is('.read-more')) {
			// we now know that the clicked thing was our read-more link
		
			// hide the read-more trigger
			$t.hide();
			
			// show the .more div using a slide down animation
			$t.siblings('.more').slideDown();

			// the two lines above could also be chained together like this:
			// $t.hide().siblings('.more').slideDown();
			
			// stop the click from doing anything else, like resetting the window's scroll position
			event.preventDefault();
			
		} else if ($t.is('.read-less')) {
			// we now know that the clicked thing was a read-less link
		
			// hide the read more content using a slide up animation
			$t.parents('.more').slideUp();
			
			// show the read more target link
			$t.parents('.more').siblings('.read-more').show();
			
			// the two lines above could be chained
			// $t.parents('.more').slideUp().siblings('.read-more').show();
			// also,
			// using $t.parents() twice like this is not ideal, but since it's only twice,
			// we'll let it slide for readability.
			
			// stop the click from doing anything else, like resetting the window's scroll position
			event.preventDefault();
		}
		// if it's neither of these, this code ignores the click
	});
});