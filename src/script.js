const searchForm = document.querySelector("form[data-search-bar]");
const searchInput = document.querySelector(
  "[data-search-bar] input[type='text']"
);
const openSearchFormBtn = document.querySelector("button[data-search-bar]");

openSearchFormBtn.addEventListener("click", () => {
  [searchForm, openSearchFormBtn].forEach((el) => {
    el.dataset.searchBar = "open";
  });

  searchInput.focus();
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();

  [searchForm, openSearchFormBtn].forEach((el) => {
    el.dataset.searchBar = "closed";
  });

  searchInput.value = "";
});
