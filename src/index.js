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

const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.addEventListener('click', loadMore);

const form = document.querySelector('#search-form');
form.addEventListener('submit', onFormSubmit);

const galleryRef = document.querySelector('.gallery');

let gallery = new SimpleLightbox('.gallery img', {
  sourceAttr: 'data-large-img',
  caption: true,
  captionType: 'attr',
  captionsData: 'alt',
  captionDelay: '250',
});

let page = 1;
let perPage = 40;
let query = '';

function onFormSubmit(e) {
  e.preventDefault();
  query = e.currentTarget.elements.searchQuery.value.trim();
  page = 1;
  fetchImages(query).then(result => {
    loadMoreBtn.style.display = result.length < perPage ? 'none' : 'block';
    if (result.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      galleryRef.innerHTML = '';
      return;
    }
    const markup = getGalleryMarkup(result);
    galleryRef.innerHTML = markup;
    gallery.refresh();
  });
}

function loadMore(e) {
  loadMoreBtn.style.opacity = '0.5';
  fetchImages(query).then(result => {
    console.log(result.length);
    const markup = getGalleryMarkup(result);
    galleryRef.insertAdjacentHTML('beforeend', markup);
    gallery.refresh();
    if (result.length < perPage) {
      loadMoreBtn.style.display = 'none';
      return;
    }
    loadMoreBtn.style.opacity = '1';
  });
}

async function fetchImages(query) {
  const url = URL + '&q=' + encodeURIComponent(query) + '&page=' + page + '&per_page=' + perPage;
  const response = await fetch(url);
  const json = await response.json();
  if (json.total != 0) Notify.success(`Hooray! We found ${json.total} images.`);
  const data = await json.hits;
  page += 1;
  return data;
}

function getGalleryMarkup(data) {
  return data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" data-large-img="${largeImageURL}" />
          <div class="info">
            <p class="info-item">
              <b>Likes</b>
              ${likes}
            </p>
            <p class="info-item">
              <b>Views</b>
              ${views}
            </p>
            <p class="info-item">
              <b>Comments</b>
              ${comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>
              ${downloads}
            </p>
          </div>
        </div>`
    )
    .join('');
}