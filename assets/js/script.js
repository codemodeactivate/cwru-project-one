//const { bulmaCarousel } = require("bulma-carousel");

const apiKey = "AIzaSyDgkEGYXtMspRSkU0XU4Q4OmgOU0URxhno";
const form = document.querySelector("form");
const resultsTable = document.querySelector("#results tbody");
var resultsParam = 10; //default # of results returned. Setting to 10. Using var so it can be reassigned by user maybe?
let booksArr = JSON.parse(localStorage.getItem('booksArr')) || [];//defines array
//listen to the search box and search titles of books
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchBookName = document.querySelector("#bookName").value;
    //const searchGenre = document.querySelector("#genre").value; Future Release?
    //startIndex allows for pagination.
    fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchBookName}&key=${apiKey}&startIndex=0&maxResults=${resultsParam}`
    )
        .then((response) => {
            console.log(response);
            return response.json();
        })
        .then((data) => {
            //take the data that is returned
            const books = data.items; //change the name so now books = the items(books) inside the data that were returned, stored as an array
            resultsTable.innerHTML = ""; //clear out any previous search results if that is relevant
            books.forEach((book) => {
                //iterate through the books array and invoke the function below that displays the each book to table
                displayResults(book);
            });
            //make each row a link
            const resultsRow = document.querySelectorAll("tr.book-row");
            resultsRow.forEach(function(row) {
                row.addEventListener("click", function() {
                const targetModal = document.getElementById(row.dataset.target);
                targetModal.classList.add('is-active');
                });
            });
        })
        .catch((error) => console.error(error)); //if nothing is found do something
});

//display results to the table from when a user searches for them
function displayResults(book) {
    const title = book.volumeInfo.title;
    const author = book.volumeInfo.authors
        ? book.volumeInfo.authors.join(", ")
        : "Unknown";
    const publishedDate = book.volumeInfo.publishedDate;
    const previewLink = book.volumeInfo.previewLink;
    const tableOfBooks = document.getElementById("results");
    tableOfBooks.classList.remove("is-hidden");
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    titleCell.textContent = title;
    const authorCell = document.createElement("td");
    authorCell.textContent = author;
    const publishedDateCell = document.createElement("td");
    publishedDateCell.textContent = publishedDate;
    const previewLinkCell = document.createElement("td");
    const previewLinkButton = document.createElement("a");
    previewLinkButton.textContent = "Preview";
    previewLinkButton.href = previewLink;
    //previewLinkCell.appendChild(previewLinkButton);
    row.appendChild(titleCell);
    row.appendChild(authorCell);
    row.appendChild(publishedDateCell);
    row.classList.add('book-row', 'js-modal-trigger');
    //row.dataset.href = "previewLink"; This would attach a link to the google books link to each row from the fetched results. Instead we're opting to make the rows clickable and populate modal
    row.dataset.target = "book-display";


    //row.appendChild(previewLinkCell);
    resultsTable.appendChild(row);
    //get then display cover art
    if (book.volumeInfo.industryIdentifiers) {
        const isbn10 = book.volumeInfo.industryIdentifiers.find(identifier => identifier.type === "ISBN_10");
        const isbn13 = book.volumeInfo.industryIdentifiers.find(identifier => identifier.type === "ISBN_13");
    if (isbn13) {
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn13.identifier}-S.jpg`;
        const coverImageCell = document.createElement("td");
        const coverImage = document.createElement("img");
        coverImage.src = coverUrl;
        coverImageCell.appendChild(coverImage);
        row.appendChild(coverImageCell);
    } else if (isbn10) {
        const isbn10WithHyphens = `${isbn10.identifier.slice(0, 1)}-${isbn10.identifier.slice(1, 4)}-${isbn10.identifier.slice(4)}`;
        const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn10WithHyphens}-S.jpg`;
        const coverImageCell = document.createElement("td");
        const coverImage = document.createElement("img");
        coverImage.src = coverUrl;
        coverImageCell.appendChild(coverImage);
        row.appendChild(coverImageCell);
    } else {
        const coverImageCell = document.createElement("td");
        const noImageAvailable = document.createTextNode("No image available");
        coverImageCell.appendChild(noImageAvailable);
        row.appendChild(coverImageCell);
    }}
    else {
        const coverImageCell = document.createElement("td");
        const noImageAvailable = document.createTextNode("No image available");
        coverImageCell.appendChild(noImageAvailable);
        row.appendChild(coverImageCell);
    }
        row.addEventListener('click', function() {
        populateModal(book);
    })
}





//when user clicks on results in table, modal opens and info is passed to it
const populateModal = (book) => {
    const title = book.volumeInfo.title;
    const author = book.volumeInfo.authors;
    const genre = book.volumeInfo.categories;
    const synopsis = book.volumeInfo.description;
    const image = book.volumeInfo.imageLinks.smallThumbnail;
    const modalTitle = document.getElementById("search-book-title");
    const modalAuthor = document.getElementById("search-book-authors");
    const modalTitleInner = document.getElementById("search-book-title-inner");
    const modalGenre = document.getElementById("search-book-genre");
    const modalSynopsis = document.getElementById("search-book-synopsis");
    const modalImage = document.getElementById("search-book-image");
    modalTitle.textContent = title;
    modalTitleInner.textContent = title;
    modalAuthor.textContent = author;
    modalImage.src = image;
    modalGenre.textContent = genre;
    modalSynopsis.textContent = synopsis;
    //button stuff
    const addToListButton = document.querySelector('.addBtn');
    addToListButton.addEventListener('click', () => {//listener for add to list button
        const booksObj = {title: title, author: author, genre: genre, synopsis: synopsis, cover:image};//obj that goes in array
        booksObj['sort'] = 'wantToRead';
        booksArr.push(booksObj);//add it too arrray
        localStorage.setItem('booksArr', JSON.stringify(booksArr));//store
        //populateShelves();
        window.location.reload();
    });
    const currentButton = document.querySelector('.currentBtn');
    currentButton.addEventListener('click', () => {
        const booksObj = {title: title, author: author, genre: genre, synopsis: synopsis, cover:image};//obj that goes in array
        booksObj['sort'] = 'currentlyReading';
        booksArr.push(booksObj);//add it too arrray
        localStorage.setItem('booksArr', JSON.stringify(booksArr));//store
        //populateShelves();
        window.location.reload();
    });
    const readBtn = document.querySelector('.readBtn');
    readBtn.addEventListener('click', () => {
        const booksObj = {title: title, author: author, genre: genre, synopsis: synopsis, cover:image};//obj that goes in array
        booksObj['sort'] = 'haveRead';
        booksArr.push(booksObj);//add it too arrray
        localStorage.setItem('booksArr', JSON.stringify(booksArr));//store
        //populateShelves();
        window.location.reload();
    });
    const removeListButton = document.querySelector('.removeBtn');
    removeListButton.addEventListener('click', () => {
        const removeWant = booksArr.findIndex(booksObj => booksObj.title === title);// search for the object
        if (removeWant !== -1) {
            booksArr.splice(removeWant, 1);
        }
        localStorage.setItem('booksArr', JSON.stringify(booksArr));
        //populateShelves();
        window.location.reload();
    })
};
const populateShelves = () => {
const booksData = localStorage.getItem('booksArr');
const booksArr = JSON.parse(booksData);

const booksWant = document.getElementById("want-to-read");
const booksCurrent = document.getElementById("currently-reading");
const booksHave = document.getElementById("have-read");

const sortWant = "wantToRead";
const sortHave = 'haveRead';
const sortCurrently = 'currentlyReading';

const booksLocal = JSON.parse(localStorage.getItem('booksArr'));
const haveReadBooks = booksLocal.filter(book => book.sort === 'haveRead');
console.log('have read: ', haveReadBooks);

// loop through array and create div element for each obj
booksArr.forEach(booksObj => {
    // check the sort element then add title to right place
    if (booksObj.sort === sortWant) {
      let wantElement = document.createElement('div');
      wantElement.classList.add('column', 'is-one-quarter');
      wantElement.innerText = booksObj.title;
      booksWant.appendChild(wantElement);
    }
    if (booksObj.sort === sortHave) {
        let haveElement = document.createElement('div');
        haveElement.classList.add('column', 'is-one-quarter');
        haveElement.innerText = booksObj.title;
        booksHave.appendChild(haveElement);
      }
    if (booksObj.sort === sortCurrently) {
        let currentElement = document.createElement('div');
        currentElement.classList.add('column', 'is-one-quarter');
        currentElement.innerText = booksObj.title;
        booksCurrent.appendChild(currentElement);
    }
  });
  //initialize carousel
  bulmaCarousel.attach('#currently-reading', {
    slidesToScroll: 1,
    slidesToShow: 3,
    infinite: true,
    loop: true,
  });
  bulmaCarousel.attach('#want-to-read', {
    slidesToScroll: 1,
    slidesToShow: 3,
    infinite: true,
    loop: true,
  });
  bulmaCarousel.attach('#have-read', {
    slidesToScroll: 1,
    slidesToShow: 3,
    infinite: true,
    loop: true,
  });
}
populateShelves();
//hover effect for table
const tableRows = document.getElementsByTagName("tr");
resultsTable.addEventListener("mouseover", (event) => {
    for (let i = 0; i < tableRows.length; i++) {
        tableRows[i].addEventListener("mouseover", (event) => {
            tableRows[i].classList.add("is-selected", "is-clickable");
            tableRows[i].addEventListener("mouseout", (event) => {
                tableRows[i].classList.remove("is-selected", "is-clickable");
            });
        });
    }
});


//savenotes
const saveNotes = document.getElementById("save-notes");
saveNotes.addEventListener("click", saveBookNotes);

function saveBookNotes(book) {
    book.preventDefault();
    const myNotes = document.getElementById("my-notes").value;
    const booksObj = {title: title, author: author, genre: genre, synopsis: synopsis, cover:image, notes: myNotes};
    booksObj['sort'] = 'haveRead';
    booksArr.push(booksObj);
    localStorage.setItem('booksArr', JSON.stringify(booksArr));
    console.log(booksArr);
};

//Rating Stuff

//Own Rating Storage
const stars = document.querySelectorAll('#my-rating .fa-star');

function setRating(rating) {
    stars.forEach(function(star, index) {
      if (index < rating) {
        star.classList.add('fa-solid');
      } else {
        star.classList.remove('fa-solid');
      }
    });
    localStorage.setItem('rating', rating);
  }

  stars.forEach(function(star, index) {
    star.addEventListener("mouseover", function() {
      for (let i = 0; i <= index; i++) {
        stars[i].classList.add("fa-solid");
      }
    });

    star.addEventListener("mouseout", function() {
      for (let i = index + 1; i < stars.length; i++) {
        stars[i].classList.remove("fa-solid");
      }
    });

    star.addEventListener("click", function() {
      const rating = index + 1;
      setRating(rating);
      console.log(rating);
    });
  });




//modal stuff
document.addEventListener("DOMContentLoaded", () => {
    // Functions to open and close a modal
    function openModal($el) {
        $el.classList.add("is-active");
    }

    function closeModal($el) {
        $el.classList.remove("is-active");
    }

    function closeAllModals() {
        (document.querySelectorAll(".modal") || []).forEach(($modal) => {
            closeModal($modal);
            populateShelves();
        });
    }

    // Add a click event on buttons to open a specific modal
    (document.querySelectorAll(".js-modal-trigger") || []).forEach(
        ($trigger) => {
            const modal = $trigger.dataset.target;
            const $target = document.getElementById(modal);

            $trigger.addEventListener("click", () => {
                openModal($target);
            });
        }
    );

    // Add a click event on various child elements to close the parent modal
    (
        document.querySelectorAll(
            ".modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button"
        ) || []
    ).forEach(($close) => {
        const $target = $close.closest(".modal");

        $close.addEventListener("click", () => {
            closeModal($target);
        });
    });

    // Add a keyboard event to close all modals
    document.addEventListener("keydown", (event) => {
        const e = event || window.event;

        if (e.keyCode === 27) {
            // Escape key
            closeAllModals();
        }
    });
});
const logArray = JSON.parse(localStorage.getItem('booksArr'));
console.log(booksArr);

bulmaCarousel.attach('#currently-reading', {
    slidesToScroll: 1,
    slidesToShow: 3,
    infinite: true,
    loop: true,
  });
  bulmaCarousel.attach('#want-to-read', {
    slidesToScroll: 1,
    slidesToShow: 3,
    infinite: true,
    loop: true,
  });
  bulmaCarousel.attach('#have-read', {
    slidesToScroll: 1,
    slidesToShow: 3,
    infinite: true,
    loop: true,
  });


  document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Add a click event on each of them
    $navbarBurgers.forEach( el => {
      el.addEventListener('click', () => {

        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');

      });
    });

  });
