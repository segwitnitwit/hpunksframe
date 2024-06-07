import { Button, Frog } from "frog";
import { handle } from "frog/vercel";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";

const contracts = [
  { address: "0x3f6A1B1A0518C74f6E4AC1dF405d53bCa847c336", name: "floor" },
  { address: "0xe2b2BD6f6600c39E596fEFE2d6315F3897956b0d", name: "hoodie" },
  { address: "0x12c90d041035E49b052f0A13b9f655a1cA07dbeA", name: "zombie" },
  { address: "0xEd09AbFD8096B64A1695a12f3737FbB66214e76a", name: "ape" },
  { address: "0xFB0564B26c45fb8aBb768F27ea3724EffE827207", name: "red" }
];

export const app = new Frog({
  basePath: "/api",
  imageAspectRatio: "1:1",
});


app.frame("/sale/:id/:type/:block", async (c) => {
  const block = c.req.param("block");
  const id = c.req.param("id");
  const type = c.req.param("type");

  const contract = contracts.find((contract) => {
    return contract.name === type;
  });

  async function fetchTransferInfo() {
    console.log("TOKEN ID : " + id);
    console.log("BLOCK: " + block);
    try {
      const response = await fetch(
        `https://ham.calderaexplorer.xyz/api/v2/addresses/${contract.address}/transactions`
      );
      const data = await response.json();
      // console.log("DATA: " + JSON.stringify(data));
      const info = data.items.find((tx: any) => {
        return tx.block == block;
      });
      console.log("info: " + JSON.stringify(info));

      const tokenTransferResponse = await fetch(
        `https://ham.calderaexplorer.xyz/api/v2/transactions/${info.hash}/token-transfers`
      );
      const tokenTransferData = await tokenTransferResponse.json();
      return {
        from: tokenTransferData.items[0].from.hash,
        to: tokenTransferData.items[0].to.hash,
      };
    } catch (error) {
      console.error("Error fetching data", error);
      return null;
    }
  }

  const transferInfo = await fetchTransferInfo();
  console.log("TRANSFER INFO: " + JSON.stringify(transferInfo));

  const imgUrl = `https://hampunks.apexdeployer.xyz/metadata/${id}.png`
  const targetUrl = `https://hampunks.apexdeployer.xyz/${type}`;
  // const sellerUrl = `https://dpunks.vercel.app/address/${transferInfo.from}`;
  // const buyerUrl = `https://dpunks.vercel.app/address/${transferInfo.to}`;
  const typeString = type === "eyes" ? type : type + "s";

  return c.res({
    image: imgUrl,
    intents: [
      <Button.Link href={targetUrl}>{typeString}</Button.Link>
    ],
  });
});

if (import.meta.env?.MODE === "development") devtools(app, { serveStatic });
else devtools(app, { assetsPath: "/.frog" });

export const GET = handle(app);
export const POST = handle(app);
