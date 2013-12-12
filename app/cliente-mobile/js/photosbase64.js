var arrayPhotos = [];
$(document).ready(function(){
	$('#imagefile').on('change', function(e){
		arrayPhotos = [];
		var files = e.originalEvent.target.files;
		if (files.length<=4) {
			$('#nroFotos').text(files.length);
			// Iterate through files
			for (var i = 0; i < files.length; i++) {

				// Ensure it's an image
				if (files[i].type.match(/image.*/)) {

					// Load image
					var reader = new FileReader();
					reader.onload = function (readerEvent) {
						var image = new Image();
						image.onload = function (imageEvent) {

							// Resize image
							var canvas = document.createElement('canvas'),
								max_size = 130,
								width = image.width,
								height = image.height;
							if (width > height) {
								if (width > max_size) {
									height *= max_size / width;
									width = max_size;
								}
							} else {
								if (height > max_size) {
									width *= max_size / height;
									height = max_size;
								}
							}
							canvas.width = width;
							canvas.height = height;
							canvas.getContext('2d').drawImage(image, 0, 0, width, height);
							var finalFile = canvas.toDataURL('image/jpeg');
							arrayPhotos.push(finalFile);
							//socket.emit('nuevaFoto', finalFile);

						}

						image.src = readerEvent.target.result;

					}
					reader.readAsDataURL(files[i]);
				}
			}
			// Clear files
			//event.target.value = '';
		}else{alert("Maximo 4 fotos."); $('#nroFotos').text(0);}
	});
});
