const app = Vue.createApp({
  data() {
    return {
      apiBaseUrl:
        window.location.hostname === "localhost" ? "http://localhost:8080" : "",
      currentPage: "login",
      loggedIn: false,
      errorMessage: "",
      loginEmail: "",
      loginPassword: "",
      registerFirstName: "",
      registerLastName: "",
      registerEmail: "",
      registerPassword: "",
      userFirstName: "",
      userId: null,
      newVideogameName: "",
      newVideogamePlatform: "",
      gameCondition: "",
      gameGenre: "",
      gameProgress: "",
      gameWishlist: false,
      gameYear: "",
      gameFavorite: false,
      gamePlaying: false,
      gameRating: "",
      gameScore: "",
      gameDifficulty: "",
      gameNotes: "",
      gameImage: "", //stores uploaded image
      videogames: [],
      gameDetails: {},
      searchQuery: "",
      errors: {},
      editingGameId: null, //Tracks which one is being edited
      filterPlatform: "",
      filterFavorite: false,
      filterWishlist: false,
      filterPlaying: false,
      filterCondition: "",
      showDeleteModal: false,
      gameToDelete: null,
    };
  },

  computed: {
    filteredGames() {
      return this.videogames.filter((game) => {
        return (
          game.name.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          (this.filterPlatform === "" ||
            game.platform === this.filterPlatform) &&
          (!this.filterFavorite || game.favorite) &&
          (!this.filterWishlist || game.wishlist) &&
          (!this.filterPlaying || game.playing) &&
          (this.filterCondition === "" ||
            game.condition === this.filterCondition)
        );
      });
    },
    uniquePlatforms() {
      return [...new Set(this.videogames.map((game) => game.platform))];
    },
  },

  methods: {
    askToDelete(game) {
      this.gameToDelete = game;
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      if (!this.gameToDelete) return;

      try {
        await fetch(`${this.apiBaseUrl}/videogames/${this.gameToDelete._id}`, {
          method: "DELETE",
          credentials: "include",
        });

        this.loadVideogamesfromAPI();
        this.showDeleteModal = false;
      } catch (error) {
        console.error("Error deleting game:", error);
      }
    },

    resetFilters() {
      this.filterPlatform = "";
      this.filterFavorite = false;
      this.filterWishlist = false;
      this.filterPlaying = false;
      this.filterCondition = "";
    },
    setPage(page) {
      this.currentPage = page;

      if (page === "addGame") {
        this.clearGameForm();
      } else if (page === "login") {
        this.clearRegisterForm();
      } else if (page === "register") {
        this.clearLoginForm();
      }
    },
    clearLoginForm() {
      this.loginEmail = "";
      this.loginPassword = "";
      this.errorMessage = "";
    },
    clearRegisterForm() {
      this.registerFirstName = "";
      this.registerLastName = "";
      this.registerEmail = "";
      this.registerPassword = "";
      this.errorMessage = "";
    },
    clearGameForm() {
      this.newVideogameName = "";
      this.newVideogamePlatform = "";
      this.gameCondition = "";
      this.gameGenre = "";
      this.gameProgress = "";
      this.gameWishlist = false;
      this.gameYear = "";
      this.gameFavorite = false;
      this.gamePlaying = false;
      this.gameRating = "";
      this.gameScore = "";
      this.gameDifficulty = "";
      this.gameNotes = "";
      this.gameImage = "";
    },
    loginUser: function () {
      // Reset error message
      this.errorMessage = "";

      fetch(`${this.apiBaseUrl}/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures cookies are sent and received
        body: JSON.stringify({
          email: this.loginEmail,
          plainPassword: this.loginPassword,
        }),
      })
        .then((response) => {
          if (response.status === 201) {
            this.clearLoginForm();

            // Get user information after successful login
            return fetch(`${this.apiBaseUrl}/session`, {
              credentials: "include",
            }).then((resp) => resp.json());
          } else {
            this.errorMessage = "Invalid email or password";
            throw new Error("Login failed");
          }
        })
        .then((userData) => {
          this.loggedIn = true;
          this.userFirstName = userData.firstName;
          this.userId = userData._id;
          this.setPage("home");
          this.loadVideogamesfromAPI();
        })
        .catch((error) => console.error("Error logging in:", error));
    },

    async register() {
      // Reset error message
      this.errorMessage = "";

      try {
        const response = await fetch(`${this.apiBaseUrl}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: this.registerFirstName,
            lastName: this.registerLastName,
            email: this.registerEmail,
            plainPassword: this.registerPassword,
          }),
        });

        if (!response.ok) {
          this.errorMessage = "Registration failed. Please try again.";
          throw new Error("Registration failed");
        }

        this.clearRegisterForm();
        this.setPage("login");
      } catch (error) {
        console.error("Registration error:", error);
        if (!this.errorMessage) {
          this.errorMessage = "Failed to register.";
        }
      }
    },
    loadVideogamesfromAPI: function () {
      fetch(`${this.apiBaseUrl}/videogames`, { credentials: "include" })
        .then((response) => {
          if (!response.ok) {
            if (response.status === 401) {
              // Not authorized, redirect to login
              this.loggedIn = false;
              this.setPage("login");
              throw new Error("Not authorized");
            }
            throw new Error("Failed to load games");
          }
          return response.json();
        })
        .then((videogames) => {
          this.videogames = videogames;
        })
        .catch((error) => console.error("Error loading videogames:", error));
    },

    async addVideogame() {
      if (!this.newVideogameName || !this.newVideogamePlatform) {
        alert("Game Name and Platform are required.");
        return;
      }

      try {
        const response = await fetch(`${this.apiBaseUrl}/videogames`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: this.newVideogameName,
            platform: this.newVideogamePlatform,
            condition: this.gameCondition || null,
            genre: this.gameGenre || null,
            progress: this.gameProgress || null,
            wishlist: this.gameWishlist,
            year: this.gameYear || null,
            favorite: this.gameFavorite,
            playing: this.gamePlaying,
            rating: this.gameRating || null,
            score: this.gameScore || null,
            difficulty: this.gameDifficulty || null,
            notes: this.gameNotes || null,
            image: this.gameImage || null,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error:", errorText);
          alert("Failed to add game: " + (errorText || response.statusText));
          return;
        }

        // Clear form and refresh game list
        this.clearGameForm();
        this.loadVideogamesfromAPI();
        this.setPage("home");
      } catch (error) {
        console.error("Error adding game:", error);
        alert("Error adding game: " + error.message);
      }
    },

    editGame: function (gameId) {
      // Handle both game object or game ID
      //const gameId = typeof game === "object" ? game._id : game;
      this.editingGameId = gameId;

      fetch(`${this.apiBaseUrl}/videogames/${gameId}`, {
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load game details");
          }
          return response.json();
        })
        .then((game) => {
          this.newVideogameName = game.name;
          this.newVideogamePlatform = game.platform;
          this.gameCondition = game.condition;
          this.gameGenre = game.genre;
          this.gameProgress = game.progress;
          this.gameWishlist = game.wishlist;
          this.gameYear = game.year;
          this.gameFavorite = game.favorite;
          this.gamePlaying = game.playing;
          this.gameRating = game.rating;
          this.gameScore = game.score;
          this.gameDifficulty = game.difficulty;
          this.gameNotes = game.notes;
          this.gameImage = game.image;
          this.setPage("edit");
        })
        .catch((error) => console.error("Error loading game for edit:", error));
    },

    updateVideogame: function () {
      console.log("Updating game with ID:", this.editingGameId);

      if (!this.gameCondition) {
        this.gameCondition = "Good"; // Set a default value if not provided
      }

      if (!this.editingGameId) {
        console.error("No game ID found for editing");
        alert("Error: No game ID found for editing");
        return;
      }

      const gameData = {
        name: this.newVideogameName,
        platform: this.newVideogamePlatform,
        condition: this.gameCondition,
        genre: this.gameGenre,
        progress: this.gameProgress,
        wishlist: this.gameWishlist,
        year: this.gameYear,
        favorite: this.gameFavorite,
        playing: this.gamePlaying,
        rating: this.gameRating,
        score: this.gameScore,
        difficulty: this.gameDifficulty,
        notes: this.gameNotes,
        image: this.gameImage,
      };

      console.log("Sending updated game data:", gameData);

      fetch(`${this.apiBaseUrl}/videogames/${this.editingGameId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(gameData),
      })
        .then((response) => {
          if (!response.ok) {
            console.error("Server responded with error:", response.status);
            return response.text().then((text) => {
              throw new Error(`Failed to update game: ${text}`);
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("Game updated successfully:", data);
          this.loadVideogamesfromAPI();
          this.setPage("home");
        })
        .catch((error) => {
          console.error("Error updating game:", error);
          alert("Failed to update game. Please check the console for details.");
        });
    },

    uploadImage: function (event) {
      let file = event.target.files[0];
      if (!file) return;

      let formData = new FormData();
      formData.append("image", file);

      fetch(`${this.apiBaseUrl}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Image upload failed");
          }
          return response.json();
        })
        .then((data) => {
          this.gameImage = data.imageUrl;
        })
        .catch((error) => console.error("Image upload failed:", error));
    },

    async logout() {
      try {
        await fetch(`${this.apiBaseUrl}/session`, {
          method: "DELETE",
          credentials: "include",
        });
        this.loggedIn = false;
        this.userFirstName = "";
        this.userId = null;
        this.videogames = [];
        this.setPage("login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },

  created() {
    // Only try to load games if the user appears to be logged in
    fetch(`${this.apiBaseUrl}/session`, { credentials: "include" })
      .then((response) => {
        if (response.ok) {
          return response.json().then((userData) => {
            this.loggedIn = true;
            this.userFirstName = userData.firstName;
            this.userId = userData._id;
            this.loadVideogamesfromAPI();
            this.setPage("home");
          });
        } else {
          // User is not logged in, show login page
          this.loggedIn = false;
          this.setPage("login");
        }
      })
      .catch((error) => {
        console.error("Error checking session:", error);
        this.loggedIn = false;
        this.setPage("login");
      });
  },
}).mount("#app");
