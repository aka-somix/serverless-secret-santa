const DocumentClient = require("aws-sdk").DynamoDB.DocumentClient;
const shuffler = require('./libs/shuffler')
const sesClient = require('./libs/ses');

// Parameters from environment
const REGION = process.env.REGION || 'eu-west-1';
const PEOPLE_TABLE = process.env.PEOPLE_TABLE;

// create DynamoDB Client (will be cached among lambda invocation until the container is shut) 
const ddb = new DocumentClient({ region: REGION });

//
// --- MAIN ---
//
exports.handler = async function (event) {

  // Retrieve data from DDB
  const people = (await ddb.scan({ TableName: PEOPLE_TABLE }).promise()).Items;

  // Shuffle the array to randomise the order.
  // This will be the list of senders
  const partecipants = shuffler.shuffle(people);

  // Create the pairs by shifting of a constant value
  // the array of receivers
  const pairs = [];

  // The offset between sender and receiver needs to be 
  // small enough to avoid that sender and receiver are
  // the same person
  const offset = Math.floor(senders.length / 3);

  // Iterate over senders to populate the pairs
  for (let senderIdx = 0; senderIdx < senders.length; senderIdx++) {
    // calculate shifted index
    const receiverIdx = (senderIdx + offset) % receivers.length;

    // push the new pair
    pairs.push({
      sender: partecipants[senderIdx],
      receiver: partecipants[receiverIdx]
    })

  }

  // Send out emails
  await Promise.all(pairs.map(
    (pair) => sesClient.sendEmail(pair.sender.Email, pair.sender.Name, pair.receiver.Name, pair.receiver.Surname)
  ));

}
