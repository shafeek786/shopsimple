// vars
let result = document.querySelector('.result'),
img_result = document.querySelector('.img-result'),
img_w = document.querySelector('.img-w'),
img_h = document.querySelector('.img-h'),
options = document.querySelector('.options'),
save = document.querySelector('.save'),
cropped = document.querySelector('.cropped'),
upload = document.querySelector('#file-input'),
cropper = '';

// on change show image with crop options
upload.addEventListener('change', e => {
  if (e.target.files.length) {
    // start file reader
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target.result) {
        // create new image
        let img = document.createElement('img');
        img.id = 'image';
        img.src = e.target.result;
        // clean result before
        result.innerHTML = '';
        // append new image
        result.appendChild(img);
        // show save btn and options
        save.classList.remove('hide');
        options.classList.remove('hide');
        // init cropper
        cropper = new Cropper(img);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

// save on click
save.addEventListener('click', async (e) => {
  e.preventDefault();

  // Get the cropped image as a Blob
  const imgSrc = cropper.getCroppedCanvas({
    width: img_w.value // input value
  }).toDataURL();
  const blob = await fetch(imgSrc).then((res) => res.blob());

  // Create a FormData object to send the Blob
    cropped.classList.remove('hide');
  img_result.classList.remove('hide');
  cropped.src = imgSrc;
  const croppedImageFile = new File([blob], 'cropped-image.png', { type: 'image/png' });
  const formData = new FormData();
  formData.append('img1', croppedImageFile);

  // Set the inputElement's files property to the FormData object
  const inputElement = document.getElementById('img1'); // Replace 'img1' with the actual ID of your input element
  inputElement.files = new FileList([croppedImageFile]);
  window.alert("hiii")

  // Trigger a "change" event on the input element
  const inputChangeEvent = new Event('change', { bubbles: true });
  inputElement.dispatchEvent(inputChangeEvent);

  // Remove the hide class from the 'cropped' and 'img_result' elements
  cropped.classList.remove('hide');
  img_result.classList.remove('hide');
  
});




