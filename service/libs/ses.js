
const SES = require('aws-sdk').SES;

const REGION = process.env.REGION || 'eu-west-1';
const FROM_EMAIL = process.env.FROM_EMAIL || 'example@example.com';

// Simple Email Service client
const ses = new SES({ region: REGION });

const buildHTMLBody = (senderName, receiverName, receiverSurname) => `
<h1>Serverless Secret Santa 🎅🏼</h1>
<p>
Oh oh oh ${senderName} ✨, <br/>

Serverless Santa drew from his Nice List: <strong>${receiverName} ${receiverSurname}</strong>.
<br/>
Your task will be to find the perfect gift for your beloved colleague.
</p>

<p>
<br/>
Have fun and be creative! See you in the office on 21 December for the exchange of gifts 🎁🎁.
<p/>


<br/>
<br/>
<br/>
<p style="font-size: 9pt; color:gray"> Serverless Secret Santa is built completely Serverless and Sustainable by Design, using AWS Services like Lambda Functions, DynamoDB and SES. 🚀</p>

`

exports.sendEmail = async function (senderEmail, senderName, receiverName, receiverSurname) {
  var params = {
    Destination: {
      ToAddresses: [senderEmail],
    },
    Message: {
      Body: {
        Html: {
          Data: buildHTMLBody(senderName, receiverName, receiverSurname)
        },
      },

      Subject: { Data: "Serverless Secret Santa" },
    },
    Source: FROM_EMAIL,
  };

  return ses.sendEmail(params).promise()
}
