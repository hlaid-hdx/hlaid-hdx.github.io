const themes = ["night", "sea", "flowers", "music", "food", "war", "dream"];

let currentArtworks = [];
let currentBook = null;

function getTheme() {
  return $("#themeSelect").val();
}

function chooseRandomItem(items) {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

function makeArtImageUrl(imageId) {
  return `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`;
}

function getAuthorNames(book) {
  if (!book.authors || book.authors.length === 0) {
    return "Unknown author";
  }

  return book.authors.map(function(author) {
    return author.name;
  }).join(", ");
}

function updateArtworkOne(artwork) {
  $("#artImageOne").attr("src", makeArtImageUrl(artwork.image_id));
  $("#artImageOne").attr("alt", artwork.title || "Public-domain artwork");

  $("#artTitleOne").text(artwork.title || "Untitled artwork");
  $("#artArtistOne").text(artwork.artist_display || "Unknown artist");
  $("#artDateOne").text(artwork.date_display || "Date unknown");
}

function updateArtworkTwo(artwork) {
  $("#artImageTwo").attr("src", makeArtImageUrl(artwork.image_id));
  $("#artImageTwo").attr("alt", artwork.title || "Public-domain artwork");

  $("#artTitleTwo").text(artwork.title || "Untitled artwork");
  $("#artArtistTwo").text(artwork.artist_display || "Unknown artist");
  $("#artDateTwo").text(artwork.date_display || "Date unknown");
}

function updateBook(book) {
  currentBook = book;

  $("#bookTitle").text(book.title || "Untitled book");
  $("#bookAuthor").text(getAuthorNames(book));

  const downloadCount = book.download_count || 0;
  $("#bookDetails").text(`Project Gutenberg ID: ${book.id} | Downloads: ${downloadCount}`);
}

function writeCuratorNote() {
  if (currentArtworks.length < 2 || currentBook === null) {
    $("#curatorNote").text("Generate both artworks and a book to complete the shelf.");
    return;
  }

  const theme = getTheme();
  const firstArtwork = currentArtworks[0];
  const secondArtwork = currentArtworks[1];
  const bookAuthor = getAuthorNames(currentBook);

  const possibleNotes = [
    `This shelf explores the theme of ${theme} through two artworks and one book. ${firstArtwork.title} and ${secondArtwork.title} give the theme a visual form, while ${currentBook.title} by ${bookAuthor} adds a literary connection.`,

    `The two artworks show different ways of imagining ${theme}. Placing them beside ${currentBook.title} makes the shelf feel like a small conversation between image and text.`,

    `This pairing turns ${theme} into a miniature exhibit. The artworks create the visual mood, and the book gives the same idea a place in language, story, and memory.`
  ];

  $("#curatorNote").text(chooseRandomItem(possibleNotes));
}

function loadArtworks() {
  const theme = getTheme();

  const artUrl = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(theme)}&query[term][is_public_domain]=true&limit=80&fields=id,title,artist_display,date_display,image_id`;

  $("#curatorNote").text(`Searching for public-domain artworks about "${theme}"...`);

  $.getJSON(artUrl, function(response) {
    const artworksWithImages = response.data.filter(function(artwork) {
      return artwork.image_id;
    });

    if (artworksWithImages.length < 2) {
      $("#curatorNote").text("Not enough artwork images were found. Try another theme.");
      return;
    }

    const firstArtwork = chooseRandomItem(artworksWithImages);
    let secondArtwork = chooseRandomItem(artworksWithImages);

    while (secondArtwork.id === firstArtwork.id && artworksWithImages.length > 1) {
      secondArtwork = chooseRandomItem(artworksWithImages);
    }

    currentArtworks = [firstArtwork, secondArtwork];

    updateArtworkOne(firstArtwork);
    updateArtworkTwo(secondArtwork);
    writeCuratorNote();
  }).fail(function() {
    $("#curatorNote").text("The artwork request failed. Try again in a moment.");
  });
}

function loadBook() {
  const theme = getTheme();

  const bookUrl = `https://gutendex.com/books/?search=${encodeURIComponent(theme)}`;

  $("#curatorNote").text(`Searching for a public-domain book about "${theme}"...`);

  $.getJSON(bookUrl, function(response) {
    if (!response.results || response.results.length === 0) {
      $("#bookTitle").text("No book found");
      $("#bookAuthor").text("Try another theme.");
      $("#bookDetails").text("");
      return;
    }

    const randomBook = chooseRandomItem(response.results);

    updateBook(randomBook);
    writeCuratorNote();
  }).fail(function() {
    $("#curatorNote").text("The book request failed. Try again in a moment.");
  });
}

function generateShelf() {
  loadArtworks();
  loadBook();
}

function chooseRandomTheme() {
  const randomTheme = chooseRandomItem(themes);

  $("#themeSelect").val(randomTheme);

  generateShelf();
}

function clearShelf() {
  currentArtworks = [];
  currentBook = null;

  $("#artImageOne").attr("src", "https://placehold.co/700x500?text=Artwork+One");
  $("#artImageOne").attr("alt", "Placeholder for first artwork");
  $("#artTitleOne").text("No artwork selected");
  $("#artArtistOne").text("Generate a shelf to begin.");
  $("#artDateOne").text("");

  $("#artImageTwo").attr("src", "https://placehold.co/700x500?text=Artwork+Two");
  $("#artImageTwo").attr("alt", "Placeholder for second artwork");
  $("#artTitleTwo").text("No artwork selected");
  $("#artArtistTwo").text("Generate a shelf to begin.");
  $("#artDateTwo").text("");

  $("#bookTitle").text("No book selected");
  $("#bookAuthor").text("Generate a shelf to begin.");
  $("#bookDetails").text("");

  $("#curatorNote").text("Your exhibit note will appear here after you generate a shelf.");
}

$("#generateButton").on("click", function() {
  generateShelf();
});

$("#randomThemeButton").on("click", function() {
  chooseRandomTheme();
});

$("#newArtworksButton").on("click", function() {
  loadArtworks();
});

$("#newBookButton").on("click", function() {
  loadBook();
});

$("#clearButton").on("click", function() {
  clearShelf();
});