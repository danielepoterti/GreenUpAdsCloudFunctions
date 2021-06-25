const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Timestamp } = require("@google-cloud/firestore");
admin.initializeApp();
const firestore = admin.firestore();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

function isPending(campagna, docID) {
  //console.log(campagna.data_fine.toMillis() < Timestamp.now().toMillis());
  if (campagna.data_fine.toMillis() < Timestamp.now().toMillis()) {
    console.log(campagna.nome + " deve passare da pending a TERMINATE");
    setCampaingOnTerminate(campagna.id, docID);
  }
}

async function setCampaingOnTerminate(campagnaID, docID) {
  var doc = await firestore.collection("listeCampagne").doc(docID).get();

  var listaCampagneDoc = doc.data().listaCampagne;

  listaCampagneDoc[campagnaID].stato = "terminated";

  firestore
    .collection("listeCampagne")
    .doc(docID)
    .set({
      listaCampagne: listaCampagneDoc,
    })
    .then(() => {
      console.log(
        "La campagna '" + listaCampagneDoc[campagnaID].nome + "' è terminata"
      );
    });
}

function addCampaignToBuyBox(campagna, activityID) {
  const buyBoxRef = firestore
    .collection("listaBuyBox")
    .doc(campagna.id_colonnina);

  buyBoxRef.get().then((docSnapshot) => {
    var campagneBuyBox;
    if (docSnapshot.exists) {
      campagneBuyBox = docSnapshot.data().campagne;

      campagneBuyBox.push({
        id_attivita: activityID,
        id_campagna: campagna.id,
      });
      console.log("Campagna esiste");
    } else {
      campagneBuyBox = [{ id_attivita: activityID, id_campagna: campagna.id }];
      console.log("Campagna non esiste");
    }

    buyBoxRef.set({ campagneBuyBox }).then(() => {
      console.log(campagna.nome + ": campagna aggiunta alla BUYBOX");
    });
  });
}

function isApproved(campagna, docID) {
  if (
    campagna.data_inizio.toMillis() < Timestamp.now().toMillis() &&
    Timestamp.now().toMillis() < campagna.data_fine.toMillis()
  ) {
    console.log(campagna.nome + ": Questa campagna deve passare su ACTIVE");

    setCampaingOnActive(campagna.id, docID);

    console.log(
      campagna.nome +
        ": Questa campagna deve essere messa nella BuyBox " +
        campagna.id_colonnina
    );

    addCampaignToBuyBox(campagna, docID);
  } else {
    if (campagna.data_fine.toMillis() < Timestamp.now().toMillis()) {
      console.log(
        campagna.nome + ": Questa campagna deve passare su TERMINATED"
      );

      setCampaingOnTerminate(campagna.id, docID);
    }
  }
}

async function setCampaingOnActive(campagnaID, docID) {
  var doc = await firestore.collection("listeCampagne").doc(docID).get();

  var listaCampagneDoc = doc.data().listaCampagne;

  listaCampagneDoc[campagnaID].stato = "active";

  firestore
    .collection("listeCampagne")
    .doc(docID)
    .set({
      listaCampagne: listaCampagneDoc,
    })
    .then(() => {
      console.log(
        "La campagna '" +
          listaCampagneDoc[campagnaID].nome +
          "' è stata attivata"
      );
    });
}

function isActive(campagna, docID) {
  if (campagna.data_fine.toMillis() < Timestamp.now().toMillis()) {
    console.log(campagna.nome + ": Questa campagna deve passare su TERMINATED");

    setCampaingOnTerminate(campagna.id, docID);

    console.log(
      campagna.nome + ": Questa campagna deve essere rimossa dalla buybox"
    );

    deleteCampaignToBuyBox(campagna, docID);
  } else if (campagna.prezzoMaxPPV > campagna.budgetRimanente) {
    console.log(campagna.nome + ": Questa campagna deve passare su TERMINATED");

    setCampaingOnTerminate(campagna.id, docID);

    console.log(
      campagna.nome +
        ": Questa campagna deve essere rimossa dalla buybox" +
        campagna.id_colonnina
    );

    deleteCampaignToBuyBox(campagna, docID);
  }
}

function deleteCampaignToBuyBox(campagna, activityID) {
  const buyBoxRef = firestore
    .collection("listaBuyBox")
    .doc(campagna.id_colonnina);

  buyBoxRef.get().then((docSnapshot) => {
    var campagneBuyBox = docSnapshot.data().campagneBuyBox;

    // campagneBuyBox.push({
    //   id_attivita: activityID,
    //   id_campagna: campagna.id,
    // });

    var deleteIndex = campagneBuyBox.findIndex(
      (element) =>
        element.id_attivita === activityID &&
        element.id_campagna === campagna.id
    );

    campagneBuyBox.splice(deleteIndex, 1);

    // console.log("Campagna esiste");

    buyBoxRef.set({ campagneBuyBox }).then(() => {
      console.log(campagna.nome + ": campagna eliminata dalla BUYBOX");
    });
  });
}

exports.scheduledFunction = functions.pubsub
  .schedule("*/1 * * * *")
  .onRun(async (context) => {
    const snapshot = await firestore.collection("listeCampagne").get();
    snapshot.docs.map((doc) => {
      let listaCampagne = doc.data().listaCampagne;

      listaCampagne.forEach((campagna) => {
        switch (campagna.stato) {
          case "pending":
            isPending(campagna, doc.id);
            break;
          case "approved":
            isApproved(campagna, doc.id);
            break;
          case "active":
            isActive(campagna, doc.id);
            break;
          case "terminated":
            break;
          default:
            break;
        }
      });
    });
  });
