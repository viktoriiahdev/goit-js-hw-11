import './css/styles.css';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import axios from 'axios';
import { Notify } from 'notiflix';

const API_KEY = '28464640-192941f4b28d01fa0009f4d64';
const URL =
  'https://pixabay.com/api/?key=' +
  API_KEY +
  '&image_type=photo&orientation=horizontal&safesearch=true';

const form = document.querySelector('#search-form');
form.addEventListener('submit', onFormSubmit);

function onFormSubmit(e) {
  e.preventDefault();
  const query = e.currentTarget.elements.searchQuery.value.trim();
  console.log(query);
  console.log(URL + '&q=' + encodeURIComponent(query));
  fetchImages(query);
}

function fetchImages(query) {
  fetch(URL + '&q=' + encodeURIComponent(query))
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.dir(data);
      if (data.total === 0)
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    });
}

// fetch(URL, function (data) {
//   if (parseInt(data.totalHits) > 0)
//     $.each(data.hits, function (i, hit) {
//       console.log(hit.pageURL);
//     });
//   else console.log('No hits');
// });
