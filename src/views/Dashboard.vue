<template>
  <div class="container row gap-5 align-items-center justify-content-center">
    <div class="row align-items-center">
      <div class="col-lg-6">
        <h4 class="mt-4 mt-md-4 mt-lg-0">Upload image of stuff you wish to give as a donation.</h4>
        <button type="button" class="btn btn-primary shadow-lg mt-4" data-bs-toggle="modal" data-bs-target="#giveawayModal">Start giving away</button>
        <!-- Modal -->
        <div class="modal fade modal-lg" id="giveawayModal" tabindex="-1" aria-labelledby="giveawayModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="giveawayModalLabel">Upload &#128228;</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="container-fluid">
                  <div class="row">
                    <div class="col-md-3"></div>
                    <div class="col-md">
                      <form @submit.prevent="postNewImage" class="mt-3" id="test">
                        <!-- -->
                        <label for="imageTitle" class="mt-2 mb-2">Title*</label>
                        <input v-model="newImageTitle" type="text" class="form-control mb-3" id="imageTitle" />

                        <croppa :width="350" :height="350" placeholder="Choose the image" v-model="imageReference"></croppa>

                        <label for="imageDescription" class="form-label mt-2">Description</label>
                        <textarea v-model="newImageDescription" class="form-control ml-2" id="imageDescription" rows="3"></textarea>

                        <label for="imagePrice" class="mt-2 mb-2">Price*</label>
                        <input v-model="newImagePrice" type="text" class="form-control" id="imagePrice" />

                        <label for="imageCause" class="mt-2 mb-2">Cause*</label>
                        <input v-model="newImageCause" type="text" class="form-control" placeholder="Donation is going for..." id="imageCause" />

                        <label for="imageLocation" class="mt-2 mb-2">Pickup location</label>
                        <input v-model="newImageLocation" type="text" class="form-control" id="imageLocation" />

                        <label for="contact" class="mt-2 mb-2">Contact*</label>
                        <input v-model="newImageContact" type="text" class="form-control" id="contact" placeholder="Phone number or email" />

                        <button type="submit" class="btn btn-primary mt-3">Upload</button>

                        <!-- -->
                      </form>
                    </div>
                    <div class="col-md-3"></div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <img class="img-fluid hover-shadow" src="@/assets/upload.png" alt="" />
      </div>
      <p>
        Or scroll down and find something for yourself!
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" fill="currentColor" class="bi bi-arrow-down" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
        </svg>
      </p>

      <hr />
      <div class="col-md-4"></div>
      <div class="col">
        <form class="form-inline mt-3">
          <input v-model="store.searchTerm" class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
        </form>
      </div>
      <div class="col-md-4"></div>
    </div>

    <section class="wrapper">
      <div class="container-fostrap">
        <div class="content">
          <div class="container">
            <div class="row">
              <card-comp class="col-sm-12 col-md-6 col-xl-4 mb-3" v-for="card in filteredCards" :key="card.id" :info="card" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import cardComp from "@/components/cardComp.vue";
import { db, getStorage, ref, uploadBytes, getDownloadURL } from "@/firebase.js";
import { doc, collection, addDoc, getDocs, orderBy, query, limit, updateDoc } from "firebase/firestore";
import store from "@/store.js";

export default {
  name: "dashboard",
  data: () => {
    return {
      cards: [],
      store,
      newImageTitle: "",
      newImageDescription: "",
      newImagePrice: "",
      newImageCause: "",
      newImageLocation: "",
      newImageContact: "",
      imageReference: null,
    };
  },

  computed: {
    filteredCards() {
      // filtriranje
      let term = this.store.searchTerm;
      let newCards = [];

      for (let card of this.cards) {
        if (card.title.toLowerCase().includes(term.toLowerCase())) {
          newCards.push(card);
        }
      }
      return newCards;
    },
  },
  components: {
    cardComp,
  },
  mounted() {
    this.getPosts();
  },
  methods: {
    getPosts() {
      console.log("Firebase has loaded");

      // referenciram se na collection
      const docRef = collection(db, "posts");

      getDocs(query(docRef, orderBy("posted_at", "desc"), limit(12))).then((query) => {
        this.cards = []; // isprazni kartice
        query.forEach((doc) => {
          // da ne pozivamo data tri puta jer su ostali podaci u data, ne id
          const data = doc.data();

          this.cards.push({
            title: data.title,
            id: doc.id,
            url: data.url,
            description: data.desc,
            cause: data.cause,
            price: data.price,
            loc: data.location,
            con: data.contact,
            time: data.posted_at,
          });
        });
      });
    },
    // poziva se kada kliknemo upload
    postNewImage() {
      console.log("Upload button clicked");

      if (this.newImageTitle != "" && this.newImagePrice != "" && this.newImageCause != "" && this.newImageContact != "") {
        // pretvaranje bytova u pravu sliku
        this.imageReference.generateBlob((blobData) => {
          // putanja + ime korisnika + "/" + ime slike
          let imageName = "posts/" + store.currentUser.email + "/" + Date.now() + ".png";

          const storage = getStorage();
          const storageRef = ref(storage, imageName);

          // 'file' comes from the Blob
          uploadBytes(storageRef, blobData)
            .then((result) => {
              // uspjesno spremanje i dobijanje URL-a slike
              getDownloadURL(storageRef).then((url) => {
                const imageTitle = this.newImageTitle;
                const imageDescription = this.newImageDescription;
                const imagePrice = this.newImagePrice;
                const imageCause = this.newImageCause;
                const imageLocation = this.newImageLocation;
                const imageContact = this.newImageContact;

                // Add a new document with a generated id.
                const docRef = addDoc(collection(db, "posts"), {
                  title: imageTitle,
                  url: url,
                  desc: imageDescription,
                  email: store.currentUser.email,
                  price: imagePrice,
                  cause: imageCause,
                  location: imageLocation,
                  contact: imageContact,
                  posted_at: Date.now(),
                })
                  .then((docRef) => {
                    this.newImageTitle = "";
                    this.newImageDescription = "";
                    this.newImagePrice = "";
                    this.newImageCause = "";
                    this.newImageLocation = "";
                    this.newImageContact = "";
                    this.imageReference.remove();

                    // dohvacam da se kartica odmah pokaze pri postanju
                    this.getPosts();

                    //get new document id an update it to the file as id field.
                    const fileID = docRef.id;
                    const updateDocId = doc(db, "posts", fileID);
                    updateDoc(updateDocId, {
                      post_id: fileID,
                    });
                  })
                  .catch(() => {
                    console.log("Unsuccessful upload");
                  });
              });
            })
            .catch(() => {
              console.log("Error");
            });
        });
      } else {
        this.$alert("Please fill in the required information");
      }
    },
  },
};
</script>

<style scoped>
html,
body {
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  background: #fff;
  font-family: "Roboto", sans-serif;
  font-weight: 400;
}

.wrapper {
  display: table;
  height: 100%;
  width: 100%;
}

.container-fostrap {
  display: table-cell;
  padding: 1em;
  text-align: center;
  vertical-align: middle;
}
.fostrap-logo {
  width: 100px;
  margin-bottom: 15px;
}
h1.heading {
  color: #fff;
  font-size: 1.15em;
  font-weight: 900;
  margin: 0 0 0.5em;
  color: #505050;
}
@media (min-width: 450px) {
  h1.heading {
    font-size: 3.55em;
  }
}
@media (min-width: 760px) {
  h1.heading {
    font-size: 3.05em;
  }
}
@media (min-width: 900px) {
  h1.heading {
    font-size: 3.25em;
    margin: 0 0 0.3em;
  }
}

hr {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}
</style>
