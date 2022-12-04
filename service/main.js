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
  const data = await ddb.scan({ TableName: PEOPLE_TABLE }).promise();

  // Shuffle the Items inside dynamoDB table to randomise the order.
  const partecipants = shuffler.shuffle(data.Items);

  // Array that will hold all the pairs of gift sender and receiver
  const pairs = [];

  // The offset between sender and receiver needs to be 
  // small enough to avoid that sender and receiver are
  // the same person
  const offset = Math.ceil(partecipants.length / 3);

  // Iterate over the partecipants and create the pairs based 
  // on the 2 indexes
  for (let senderIdx = 0; senderIdx < partecipants.length; senderIdx++) {

    // compute the shifted index
    const receiverIdx = (senderIdx + offset) % partecipants.length;

    pairs.push({
      sender: partecipants[senderIdx],
      receiver: partecipants[receiverIdx]
    })

  }

  // Send out emails
  await Promise.all(pairs.map(
    (pair) => sesClient.sendEmail(pair.sender.email, pair.sender.name, pair.receiver.name, pair.receiver.surname)
  ));

  return {
    code: 200,
    message: "Oh oh oh, Email send out to everyone!"
  }
}
