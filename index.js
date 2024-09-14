const autoCompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
      <img src="${imgSrc}" />
      ${movie.Title} - (${movie.Year})
    `;
  },

  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get("http://www.omdbapi.com/", {
      headers: {},
      params: {
        apikey: "c13ed82b",
        s: searchTerm,
      },
    });
    if (response.data.Error) return [];
    //optional chaining to avoid errors if occur to crash app.
    return response?.data?.Search;
  },
};

//1st auto complete
createAutoComplete({
  root: document.querySelector("#left-autocomplete"),
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
});
//2nd auto complete
createAutoComplete({
  root: document.querySelector("#right-autocomplete"),
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
});

let leftSide;
let rightSide;
const onMovieSelect = async (movie, summaryElement, side) => {
  // console.log(movie);
  const response = await axios.get("http://www.omdbapi.com/", {
    headers: {},
    params: {
      apikey: "c13ed82b",
      i: movie.imdbID,
    },
  });

  summaryElement.innerHTML = movieTemplate(response.data);
  //just for the comparison
  if (side === "left") leftSide = response?.data;
  else rightSide = response?.data;

  if (leftSide && rightSide) {
    //run the comparison.
    runComparison(leftSide, rightSide);
  }
};

const runComparison = () => {
  // console.log("Time For Comparison");
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );

  leftSideStats.forEach((leftStat, idx) => {
    const rightStat = rightSideStats[idx];
    //if feel confuse feel free to console the below line.
    //  console.log(leftSide.dataset);
    const leftSideValue = parseFloat(leftStat.dataset.value);
    const rightSideValue = parseFloat(rightStat.dataset.value);

    if (rightSideValue > leftSideValue) {
      leftStat.classList.remove("is-primary");
      leftStat.classList.add("is-warning");
    } else {
      rightStat.classList.remove("is-primary");
      rightStat.classList.add("is-warning");
    }
  });
};

const movieTemplate = (movieDetail) => {
  const { BoxOffice, Metascore, imdbRating, imdbVotes, Awards } = movieDetail;

  const dollars = parseInt(BoxOffice.slice(1).replaceAll(",", ""));
  // console.log(dollars);
  const metaScore = parseInt(Metascore);
  // console.log(metaScore);
  const imdBRating = parseFloat(imdbRating);
  // console.log(imdBRating);
  const imdBVotes = parseInt(imdbVotes.replaceAll(",", ""));
  // console.log(imdBVotes);
  const output = Awards.split(" ");
  const awards = output.reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) return prev;
    else return prev + value;
  }, 0);
  // console.log(awards);
  // best way to do the comparison between data is using data-value property.

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image" >
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>

    <article data-value=${awards} class="notification is-primary">
      <p class="title">${Awards}</p>
      <p class="subtitle">Awards</p>
    </article>

    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metaScore} class="notification is-primary">
      <p class="title">${Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdBRating} class="notification is-primary">
      <p class="title">${imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdBVotes} class="notification is-primary">
      <p class="title">${imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};
