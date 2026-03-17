/*
 * Basic sample
 */

function addPage(page, book) {
  var id, pages = book.turn('pages');

  // Create a new element for this page
  var element = $('<div />', {});

  // Add the page to the flipbook
  if (book.turn('addPage', element, page)) {

    // Add the initial HTML
    // It will contain a loader indicator and a gradient
    element.html('<div class="gradient"></div><div class="loader"></div>');

    // Load the page
    loadPage(page, element);
  }
}

function loadPage(page, pageElement) {
  // Create an image element
  var img = $('<img />');

  img.mousedown(function(e) {
    e.preventDefault();
  });

  img.load(function() {
    // Set the size
    $(this).css({ width: '100%', height: '100%' });

    // Add the image to the page after loaded
    $(this).appendTo(pageElement);

    // Remove the loader indicator
    pageElement.find('.loader').remove();
  });

  // Load the page
  img.attr('src', 'imgs/imgs/core3web' + page + '.jpg');
}

// Automating the addition of pages based on the number of images
function addPagesAutomated(book) {
  const numberOfPages = 76; // Define the number of pages
  for (let i = 1; i <= numberOfPages; i++) {
    addPage(i, book);
  }
}

// The remaining functions remain unchanged from your provided code

function isChrome() {
  return navigator.userAgent.indexOf('Chrome') != -1;
}
