const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Timestamp } = require("@google-cloud/firestore");
admin.initializeApp();
const firestore = admin.firestore();
const storage = admin.storage().bucket();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// async function isPending(campagna, docID) {
//   console.log(campagna.nome + "___INIZIO ESECUZIONE___");
//   //console.log(campagna.data_fine.toMillis() < Timestamp.now().toMillis());
//   if (campagna.data_fine.toMillis() < Timestamp.now().toMillis()) {
//     console.log(campagna.nome + " deve passare da pending a TERMINATE");
//     await setCampaingOnTerminate(campagna.id, docID);
//   }
//   console.log(campagna.nome + "___FINE ESECUZIONE___");
// }

// async function setCampaingOnTerminate(campagnaID, docID) {
//   console.log(campagnaID + " setCampaingOnTerminate INIZIO");
//   var doc = await firestore.collection("listeCampagne").doc(docID).get();

//   var listaCampagneDoc = doc.data().listaCampagne;

//   listaCampagneDoc[campagnaID].stato = "terminated";

//   await firestore
//     .collection("listeCampagne")
//     .doc(docID)
//     .set({
//       listaCampagne: listaCampagneDoc,
//     })
//     .then(() => {
//       console.log(
//         "La campagna '" + listaCampagneDoc[campagnaID].nome + "' è terminata"
//       );
//     });
//   console.log(campagnaID + " setCampaingOnTerminate FINE");
// }

// async function addCampaignToBuyBox(campagna, activityID) {
//   console.log(campagna.nome + " addCampaignToBuyBox INIZIO");
//   const doc = await firestore
//     .collection("listaBuyBox")
//     .doc(campagna.id_colonnina)
//     .get();

//   var campagneBuyBox;
//   if (doc.exists) {
//     console.log(campagna.nome + " buyBox esistente aggiunta a esistenti");
//     campagneBuyBox = doc.data().campagneBuyBox;

//     campagneBuyBox.push({
//       id_attivita: activityID,
//       id_campagna: campagna.id,
//       prezzoMaxPPV: campagna.prezzoMaxPPV,
//     });

//     console.log(campagna.nome + " documento creato");
//   } else {
//     console.log(campagna.nome + " buyBox non esistente creazione nuova buyBox");
//     campagneBuyBox = [
//       {
//         id_attivita: activityID,
//         id_campagna: campagna.id,
//         prezzoMaxPPV: campagna.prezzoMaxPPV,
//       },
//     ];
//     console.log(campagna.nome + " documento creato");
//   }

//   await firestore
//     .collection("listaBuyBox")
//     .doc(campagna.id_colonnina)
//     .set({ campagneBuyBox })
//     .then(() => {
//       console.log(campagna.nome + ": campagna aggiunta alla BUYBOX");
//     });

//   // buyBoxRef.get().then(async (docSnapshot) => {
//   //   var campagneBuyBox;
//   //   if (docSnapshot.exists) {
//   //     campagneBuyBox = docSnapshot.data().campagneBuyBox;

//   //     campagneBuyBox.push({
//   //       id_attivita: activityID,
//   //       id_campagna: campagna.id,
//   //     });

//   //     console.log(campagna.nome +" BuyBox esiste");
//   //   } else {
//   //     campagneBuyBox = [{ id_attivita: activityID, id_campagna: campagna.id }];
//   //     console.log(campagna.nome +" BuyBox non esiste");
//   //   }

//   //    buyBoxRef.set({ campagneBuyBox }).then(() => {
//   //     console.log(campagna.nome + ": campagna aggiunta alla BUYBOX");
//   //   });
//   // });
//   console.log(campagna.nome + " addCampaignToBuyBox FINE");
// }

// async function isApproved(campagna, docID) {
//   console.log(campagna.nome + "___INIZIO ESECUZIONE___");
//   if (
//     campagna.data_inizio.toMillis() < Timestamp.now().toMillis() &&
//     Timestamp.now().toMillis() < campagna.data_fine.toMillis()
//   ) {
//     console.log(
//       campagna.nome +
//         ": Questa campagna deve essere messa nella BuyBox " +
//         campagna.id_colonnina
//     );

//     await addCampaignToBuyBox(campagna, docID);

//     console.log(campagna.nome + ": Questa campagna deve passare su ACTIVE");

//     await setCampaingOnActive(campagna.id, docID);
//   } else {
//     if (campagna.data_fine.toMillis() < Timestamp.now().toMillis()) {
//       console.log(
//         campagna.nome + ": Questa campagna deve passare su TERMINATED"
//       );

//       await setCampaingOnTerminate(campagna.id, docID);
//     }
//   }
//   console.log(campagna.nome + "___FINE ESECUZIONE___");
// }

// async function setCampaingOnActive(campagnaID, docID) {
//   console.log(campagnaID + ": setCampaingOnActive INIZIO");
//   var doc = await firestore.collection("listeCampagne").doc(docID).get();

//   var listaCampagneDoc = doc.data().listaCampagne;

//   listaCampagneDoc[campagnaID].stato = "active";

//   await firestore
//     .collection("listeCampagne")
//     .doc(docID)
//     .set({
//       listaCampagne: listaCampagneDoc,
//     })
//     .then(() => {
//       console.log(
//         "La campagna '" +
//           listaCampagneDoc[campagnaID].nome +
//           "' è stata attivata"
//       );
//     });
//   console.log(campagnaID + ": setCampaingOnActive FINE");
// }

// async function isActive(campagna, docID) {
//   console.log(campagna.nome + "___INIZIO ESECUZIONE___");
//   if (campagna.data_fine.toMillis() < Timestamp.now().toMillis()) {
//     console.log(campagna.nome + ": Questa campagna deve passare su TERMINATED");

//     await setCampaingOnTerminate(campagna.id, docID);

//     console.log(
//       campagna.nome + ": Questa campagna deve essere rimossa dalla buybox"
//     );

//     await deleteCampaignToBuyBox(campagna, docID);
//   } else if (campagna.prezzoMaxPPV > campagna.budgetRimanente) {
//     console.log(campagna.nome + ": Questa campagna deve passare su TERMINATED");

//     await setCampaingOnTerminate(campagna.id, docID);

//     console.log(
//       campagna.nome +
//         ": Questa campagna deve essere rimossa dalla buybox" +
//         campagna.id_colonnina
//     );

//     await deleteCampaignToBuyBox(campagna, docID);
//   }
//   console.log(campagna.nome + "___FINE ESECUZIONE___");
// }

// async function deleteCampaignToBuyBox(campagna, activityID) {
//   const buyBoxRef = firestore
//     .collection("listaBuyBox")
//     .doc(campagna.id_colonnina);

//   await buyBoxRef.get().then(async (docSnapshot) => {
//     var campagneBuyBox = docSnapshot.data().campagneBuyBox;

//     // campagneBuyBox.push({
//     //   id_attivita: activityID,
//     //   id_campagna: campagna.id,
//     // });

//     var deleteIndex = campagneBuyBox.findIndex(
//       (element) =>
//         element.id_attivita === activityID &&
//         element.id_campagna === campagna.id
//     );

//     campagneBuyBox.splice(deleteIndex, 1);

//     // console.log("Campagna esiste");

//     await buyBoxRef.set({ campagneBuyBox }).then(() => {
//       console.log(campagna.nome + ": campagna eliminata dalla BUYBOX");
//     });
//   });
// }

// exports.scheduledFunction = functions.pubsub
//   .schedule("*/1 * * * *")
//   .onRun(async (context) => {
//     const snapshot = await firestore.collection("listeCampagne").get();
//     snapshot.docs.map(async (doc) => {
//       let listaCampagne = doc.data().listaCampagne;

//       // listaCampagne.forEach(async (campagna) => {
//       //   switch (campagna.stato) {
//       //     case "pending":
//       //       isPending(campagna, doc.id);
//       //       break;
//       //     case "approved":
//       //       await isApproved(campagna, doc.id);
//       //       break;
//       //     case "active":
//       //       isActive(campagna, doc.id);
//       //       break;
//       //     case "terminated":
//       //       break;
//       //     default:
//       //       break;
//       //   }
//       // });

//       for (const campagna of listaCampagne) {
//         switch (campagna.stato) {
//           case "pending":
//             await isPending(campagna, doc.id);
//             break;
//           case "approved":
//             await isApproved(campagna, doc.id);
//             break;
//           case "active":
//             await isActive(campagna, doc.id);
//             break;
//           case "terminated":
//             break;
//           default:
//             break;
//         }
//       }
//     });
//   });

/**
 * ALGORITMO AD OGNI RICHIESTA
 */

exports.getCampaign = functions.https.onRequest(async (req, res) => {
  var buyBox = await fetchBuyBox(req.query.id_colonnina);

  if (buyBox.exists) {
    var buyBoxData = buyBox.data();
    if (buyBoxData.campagneBuyBox === []) {
      res.send(null);
    } else {
      let campagnaScelta = fetchCampaignsArray(buyBoxData.campagneBuyBox);

      //res.send(campagnaScelta);

      let URL = fetchLinkImageCampaign(campagnaScelta);
      res.send(URL);
    }
  } else {
    res.send(null);
  }
});

function fetchBuyBox(idColonnina) {
  const buyBoxRef = firestore.collection("listaBuyBox").doc(idColonnina);
  return buyBoxRef.get();
}

function fetchCampaignsArray(referenceArray) {
  let total = 0;
  for (const campagna of referenceArray) {
    total += campagna.prezzoMaxPPV;
  }
  const threshold = Math.random() * total;

  total = 0;
  for (const campagna of referenceArray) {
    total += campagna.prezzoMaxPPV;
    if (total >= threshold) {
      return campagna;
    }
  }
}

async function fetchLinkImageCampaign(campaign) {
  const campaignRef = firestore
    .collection("listeCampagne")
    .doc(campaign.id_attivita);

  let campagne = await campaignRef.get();
  campagne = campagne.data().listaCampagne;
  //console.log(campagne);

  let campagna = campagne.find(
    (element) => element.id === campaign.id_campagna
  );

  console.log("A0")

  const options = {
    action: 'read',
    expires: '03-17-2025'
  };

  console.log(await storage.file(campagna.image).getMetadata());

  return storage.file(campagna.image);
}
