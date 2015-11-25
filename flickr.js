// https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
// 	or
// https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
// 	or
// https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{o-secret}_o.(jpg|gif|png)

'use strict';
// Create elements that will be used to interact with
var container = document.getElementById('container');
var material = document.getElementById('materials');
var type = document.getElementById('types');
var features = document.getElementById('features');
var custom = document.getElementById('custom');
var layover = document.getElementById('layover');
// display counter
//  Showing <span id="range">0</span> of <span id="total">0</span>
var rangeText = document.getElementById('range');
var totalText = document.getElementById('total');
// submit button
var getPics = document.getElementById('getPics');
var removePics = document.getElementById('removePics');
var showPics = document.getElementById('showPics');


// The object that will store the information so we don't have to contiune pinging th api
var photos = {};

// Variables used to keep track of position
var position = 0;
var count = 12;
var total = 0;

getPics.addEventListener('click', getFlickrPhotos);
removePics.addEventListener('click', clearContainer);
showPics.addEventListener('click', showPhotos);
layover.addEventListener('click', minPhoto);


// Pull down the photos object from flickr

function getFlickrPhotos() {
  // Clear
  clearContainer();
  // Get serach parameters
  var materialType = material.value;
  var typeType = type.value;
  var featureType = features.value;
  var customType =custom.value;
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      if (request.status < 400) {
        var search = materialType + typeType + featureType +customType;
        if (!search) {
          search = "All";
        }
        localStorage.setItem(search, this.response);
        photos = JSON.parse(this.response);
        total = photos.photos.photo.length;
        showPhotos();
        toggleStateDisplay();
      }
    }
  };

  request.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + key + '&user_id=78138897%40N07&tags=' + materialType + '%2C+' + typeType + '%2C+' + featureType + '%2C+' + customType + '&tag_mode=all&per_page=500&format=json&nojsoncallback=1');
  request.send();

}

function getFlickrPhotoInfo(photoID) {

  var enlargedTitle = document.createElement('p');
  enlargedTitle.id = 'enlarged-title';
  var enlargedDescription = document.createElement('p')
  enlargedDescription.id = 'enlarged-description';

  console.log(enlargedTitle);
  console.log(enlargedDescription);
  var infoRequest = new XMLHttpRequest();

  infoRequest.onreadystatechange = function() {
    if (infoRequest.readyState === 4) {
      if (infoRequest.status < 400) {
        var info = JSON.parse(this.response);
        var title = info.photo.title._content;
        var description = info.photo.description._content;
        enlargedTitle.innerText = title;
        enlargedDescription.innerText = 'Title: ' + description;
        layover.appendChild(enlargedTitle);
        // layover.appendChild(enlargedDescription);
      }
    }
  };

  infoRequest.open('GET', 'https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=' + key +'&photo_id=' + photoID + '&format=json&nojsoncallback=1');
  infoRequest.send();
}

function showPhotos() {
  var row = document.createElement('div');
  row.className = 'row';
  var counter = position + count;
  if (counter > total) {
    showPics.className = 'hidden';
    counter = total;
  }
  console.log(counter);
  //amountPhotos is the legnth of the returned amount of photos. Should be used to limit the amount of times the show more pictures can bee called
  var amountPhotos = photos.photos.photo.length;

  for (var i = position; i < counter; i++) {
    var photo = photos.photos.photo[i];
    var farm = photo.farm;
    var server = photo.server;
    var id = photo.id;
    var secret = photo.secret;
    var title = photo.title;
    var source = 'https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + '_q.jpg';
    // var large = 'https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret + '_b.jpg';
    var col = document.createElement('div');
    col.className = 'col-xs-4 col-md-2';
    // Link to large
    var anchor = document.createElement('a');
    // anchor.setAttribute('href', large);
    anchor.className = 'thumbnail';

    //Creating the thumbnail image
    var image = document.createElement('img');
    image.className = "img-rounded img-customer";
    image.setAttribute('src', source);
    image.id = id;

    //Putting it all together
    anchor.appendChild(image);
    col.appendChild(anchor);
    row.appendChild(col);
    position++;
  }
  container.appendChild(row);
  container.addEventListener('click', enlargePhoto);
  counterView();
}

function clearContainer() {
  container.innerHTML = '';
  position = 0;
  count = 12;
  total = 0;
  showPics.className = 'btn btn-success btn-lg btn-block';
  counterView();
  toggleStateDisplayOff();
}

function toggleStateDisplay() {
  var counterDisplay = document.getElementById('counter-display');
  var searchDisplay = document.getElementById('search-display');
  counterDisplay.className = 'show';
  searchDisplay.className = 'hide';
}

function toggleStateDisplayOff() {
  var counterDisplay = document.getElementById('counter-display');
  var searchDisplay = document.getElementById('search-display');
  counterDisplay.className = 'hide';
  searchDisplay.className = 'show';
}

function counterView() {
  rangeText.innerText = position;
  totalText.innerText = total;
  if (position >= total) {
    showPics.className = 'hide';
  } else {
    showPics.className = 'btn btn-success btn-lg btn-block';
  }

  if (position > 0) {
    removePics.className = 'btn btn-danger btn-lg btn-block';
  } else {
    removePics.className = 'hide';
  }
}

function mkBootRow() {
  var row = document.createElement('div');
  row.className = 'row';
  return row;
}

function enlargePhoto(event) {
  event.preventDefault();
  var original = event.target.attributes.src.value;
  var originalID = event.target.id;
  var newSource = original.replace(/_q.jpg/, '_b.jpg');
  var enlarged = document.createElement('img');

  getFlickrPhotoInfo(originalID);

  enlarged.setAttribute('src', newSource);
  enlarged.className = 'large-image';
  layover.className = 'layover text-center';
  layover.appendChild(enlarged);
  console.log(originalID);
}

function minPhoto() {
  layover.className = '';
  layover.innerHTML = '';
}
