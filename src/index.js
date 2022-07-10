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
  captionSelector: 'self',
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
  e.currentTarget.reset();
  page = 1;
  fetchImages(query).then(({ hits, totalHits }) => {
    loadMoreBtn.style.display = hits.length < perPage ? 'none' : 'block';
    if (hits.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      galleryRef.innerHTML = '';
      return;
    }
    const markup = getGalleryMarkup(hits);
    galleryRef.innerHTML = markup;
    gallery.refresh();
    if (totalHits.length < perPage) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      return;
    }
  });
}

function loadMore(e) {
  loadMoreBtn.style.opacity = '0.5';
  fetchImages(query).then(({ hits, totalHits }) => {
    const markup = getGalleryMarkup(hits);
    galleryRef.insertAdjacentHTML('beforeend', markup);
    gallery.refresh();
    loadMoreBtn.style.opacity = '1';
  });
}

async function fetchImages(query) {
  const url = URL + '&q=' + encodeURIComponent(query) + '&page=' + page + '&per_page=' + perPage;
  try {
    const response = await axios.get(url);
    const result = response.data;
    if (result.total != 0 && page === 1) Notify.success(`Hooray! We found ${result.total} images.`);
    if (perPage * page > result.totalHits) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      loadMoreBtn.style.display = 'none';
    }
    page += 1;
    return result;
  } catch (error) {
    console.error(error);
    return;
  }
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
