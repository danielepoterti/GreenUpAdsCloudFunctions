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

async function setCampaingOnTerminate(campagnaID, docID) {
  console.log(campagnaID + " setCampaingOnTerminate INIZIO");
  var doc = await firestore.collection("listeCampagne").doc(docID).get();

  var listaCampagneDoc = doc.data().listaCampagne;

  for (var i in listaCampagneDoc) {
    if (listaCampagneDoc[i].id === campagnaID) {
      listaCampagneDoc[i].stato = "terminated";
      break;
    }
  }
  //listaCampagneDoc[campagnaID].stato = "terminated";

  await firestore.collection("listeCampagne").doc(docID).set({
    listaCampagne: listaCampagneDoc,
  });
  console.log(campagnaID + " setCampaingOnTerminate FINE");
}

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

async function isActive(campagna, docID) {
  console.log(campagna.nome + "___INIZIO ESECUZIONE___");
  if (campagna.data_fine.toMillis() < Timestamp.now().toMillis()) {
    console.log(campagna.nome + ": Questa campagna deve passare su TERMINATED");

    await setCampaingOnTerminate(campagna.id, docID);

    console.log(
      campagna.nome + ": Questa campagna deve essere rimossa dalla buybox"
    );

    await deleteCampaignToBuyBox(campagna, docID);
  } else if (campagna.prezzoMaxPPV > campagna.budgetRimanente) {
    console.log(campagna.nome + ": Questa campagna deve passare su TERMINATED");

    await setCampaingOnTerminate(campagna.id, docID);

    console.log(
      campagna.nome +
        ": Questa campagna deve essere rimossa dalla buybox" +
        campagna.id_colonnina
    );

    await deleteCampaignToBuyBox(campagna, docID);
  }
  console.log(campagna.nome + "___FINE ESECUZIONE___");
}

async function deleteCampaignToBuyBox(campagna, activityID) {
  const buyBoxRef = firestore
    .collection("listaBuyBox")
    .doc(campagna.id_colonnina);

  await buyBoxRef.get().then(async (docSnapshot) => {
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

    await buyBoxRef.set({ campagneBuyBox }).then(() => {
      console.log(campagna.nome + ": campagna eliminata dalla BUYBOX");
    });
  });
}

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
    if (
      buyBoxData.campagneBuyBox === [] ||
      buyBoxData.campagneBuyBox.length === 0
    ) {
      res.send(null);
    } else {
      let campagnaScelta = fetchRandomCampaignsArray(buyBoxData.campagneBuyBox);
      let campagne = await fetchCampagne(campagnaScelta);
      let URL = await fetchLinkImageCampaign(campagnaScelta, campagne);
      res.send(URL);
      await payCampaign(campagnaScelta, buyBoxData.campagneBuyBox, campagne);
    }
  } else {
    res.send(null);
  }
});

function fetchBuyBox(idColonnina) {
  const buyBoxRef = firestore.collection("listaBuyBox").doc(idColonnina);
  return buyBoxRef.get();
}

function fetchRandomCampaignsArray(referenceArray) {
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

async function fetchCampagne(campaign) {
  const campaignRef = firestore
    .collection("listeCampagne")
    .doc(campaign.id_attivita);

  let campagne = await campaignRef.get();
  campagne = campagne.data().listaCampagne;

  return campagne;
}

async function fetchLinkImageCampaign(campaignSelected, campagne) {
  // const campaignRef = firestore
  //   .collection("listeCampagne")
  //   .doc(campaign.id_attivita);

  // let campagne = await campaignRef.get();
  // campagne = campagne.data().listaCampagne;
  //console.log(campagne);

  let campagna = campagne.find(
    (element) => element.id === campaignSelected.id_campagna
  );

  const options = {
    action: "read",
    expires: Date.now() + 2 * 60 * 1000, // scadenza di 2 minuti
  };

  console.log(await storage.file(campagna.image).getSignedUrl(options));

  return storage.file(campagna.image).getSignedUrl(options);
}

async function payCampaign(campagnaScelta, campagneBuyBox, campagne) {
  let auctionBeating = campagnaScelta.prezzoMaxPPV;
  let maxPPV = selectMAXPPV(campagneBuyBox);
  console.log(campagnaScelta);
  console.log("auctionBeating: " + auctionBeating);
  console.log("maxPPV: " + maxPPV);
  let toBePayed = null;
  if (auctionBeating == maxPPV) {
    console.log("PAGARE IL SECONDO MASSIMO + 0.01");
    //IF NON ESISTE SECONDO?
    if (campagneBuyBox.length === 1) {
      toBePayed = auctionBeating;
    } else {
      toBePayed = selectSecondMAXPPV(campagneBuyBox, maxPPV) + 0.01;
    }

    await updateCampaigns(campagne, campagnaScelta, toBePayed);
    console.log(toBePayed + " pagato");
  } else {
    //pagare l'equivalente del auctionBeating
    console.log("PAGARE IL AUCTIONBEATING");
    toBePayed = auctionBeating;
    await updateCampaigns(campagne, campagnaScelta, toBePayed);
    console.log(toBePayed + " pagato");
  }
}

function selectSecondMAXPPV(campagneBuyBox, maxPPV) {
  //let maxPPV = selectMAXPPV(campagneBuyBox);
  return Math.max.apply(
    Math,
    campagneBuyBox.map(function (o) {
      if (o.prezzoMaxPPV === maxPPV) {
        return -1;
      } else {
        return o.prezzoMaxPPV;
      }
    })
  );
}

function selectMAXPPV(campagneBuyBox) {
  return Math.max.apply(
    Math,
    campagneBuyBox.map(function (o) {
      return o.prezzoMaxPPV;
    })
  );
}

async function updateCampaigns(campagne, campagnaScelta, toBePayed) {
  let campagna = campagne.find(
    (element) => element.id === campagnaScelta.id_campagna
  );

  campagna.budgetRimanente -= toBePayed;

  for (var i in campagne) {
    if (campagne[i].id === campagnaScelta.id_campagna) {
      campagne[i] = campagna;
      break;
    }
  }

  await firestore
    .collection("listeCampagne")
    .doc(campagnaScelta.id_attivita)
    .set({
      listaCampagne: campagne,
    });

  if (campagna.prezzoMaxPPV > campagna.budgetRimanente) {
    console.log(campagna.nome + ": Questa campagna deve passare su TERMINATED");

    await setCampaingOnTerminate(campagna.id, campagnaScelta.id_attivita);

    console.log(
      campagna.nome +
        ": Questa campagna deve essere rimossa dalla buybox" +
        campagna.id_colonnina
    );

    await deleteCampaignToBuyBox(campagna, campagnaScelta.id_attivita);
  }
}

/**
 *  GESTIONE NOTIFICHE
 */
exports.getNotifications = functions.https.onCall(async (data, context) => {
  //console.log(data.UUID);
  return await fetchCampagneApproved(data.UUID);
});

async function fetchCampagneApproved(UUID) {
  var docCampagne = await firestore.collection("listeCampagne").doc(UUID).get();
  var docNotifiche = await firestore
    .collection("datiNotifiche")
    .doc(UUID)
    .get();

  var listaCampagneDoc = docCampagne.data().listaCampagne;
  var listaNotificheDoc = docNotifiche.data().listaNotifiche;

  //console.log(listaCampagneDoc);
  //console.log(listaNotificheDoc);

  for (const campagna of listaCampagneDoc) {
    if (campagna.stato == "approved") {
      index = listaNotificheDoc.findIndex(
        (element) => element.id === campagna.id + "approved"
      );
      if (index === -1) {
        listaNotificheDoc.push({
          title: "La tua campagna è stata approvata",
          description: "Abbiamo approvato la tua campagna " + campagna.nome,
          id: campagna.id + "approved",
          type: "approved",
          seen: false,
        });
      }
    } else if (campagna.stato == "active") {
      index = listaNotificheDoc.findIndex(
        (element) => element.id === campagna.id + "active"
      );
      if (index === -1) {
        listaNotificheDoc.push({
          title: "La tua campagna è stata attivata",
          description: "Abbiamo attivato la tua campagna " + campagna.nome,
          id: campagna.id + "active",
          type: "active",
          seen: false,
        });
      }
    } else if (campagna.stato == "terminated") {
      index = listaNotificheDoc.findIndex(
        (element) => element.id === campagna.id + "terminated"
      );
      if (index === -1) {
        listaNotificheDoc.push({
          title: "La tua campagna è stata terminata",
          description: "Abbiamo terminato la tua campagna " + campagna.nome,
          id: campagna.id + "terminated",
          type: "terminated",
          seen: false,
        });
      }
    }
  }

  await firestore.collection("datiNotifiche").doc(UUID).set({
    listaNotifiche: listaNotificheDoc,
  });

  return listaNotificheDoc.filter((notifica) => notifica.seen === false);
}

exports.setSeeNotifications = functions.https.onCall(async (data, context) => {
  //console.log(data.UUID);
  return await setNotificationsSee(data.UUID);
});

async function setNotificationsSee(UUID) {
  var docNotifiche = await firestore
    .collection("datiNotifiche")
    .doc(UUID)
    .get();

  var listaNotificheDoc = docNotifiche.data().listaNotifiche;

  //console.log(listaCampagneDoc);
  //console.log(listaNotificheDoc);

  for (let i = 0; i < listaNotificheDoc.length; i++) {
    if (listaNotificheDoc[i].seen === false) {
      listaNotificheDoc[i].seen = true;
    }
  }

  await firestore.collection("datiNotifiche").doc(UUID).set({
    listaNotifiche: listaNotificheDoc,
  });

  return "OK";
}
