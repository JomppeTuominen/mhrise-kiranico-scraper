// Load the AWS SDK for Node.js
import AWS from "aws-sdk";
import chunk from "lodash/chunk";

export const batchWrite = async (arr: Array<any>, table: string) => {
  const batches = chunk(arr, 25);
  var docClient = new AWS.DynamoDB.DocumentClient({ region: "eu-west-1" });
  return Promise.all(
    batches.map((batch) => {
      const insert = {
        RequestItems: {
          [table]: batch.map((item) => ({
            PutRequest: { Item: item },
          })),
        },
      };
      return docClient.batchWrite(insert, (err) => {
        if (err) {
          console.error("error in batch write:", err);
        } else {
          console.log("Added " + batch.length + " items to DynamoDB");
        }
      });
    })
  );
};
