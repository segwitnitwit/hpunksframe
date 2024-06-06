import { Button, Frog } from "frog";
import { handle } from "frog/vercel";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";

const contracts = [
  { address: "0x5d2DE0ff02AAA0cce55Af669DF4b38c7dd437Dce", name: "floor" },
  { address: "0x6FF7D9938E70F61e4B1B9b5D36a9cAc906129C66", name: "hoodie" },
  { address: "0xFc4086744F5c72CeCd8139915ED3e68c54fA3b21", name: "zombie" },
  { address: "0x442036ba5BD6364dE7813bC8480B299FcBeDf452", name: "ape" },
  { address: "0xB11b81143F5D6a7Ebecf664967281cf348636f6e", name: "alien" },
  { address: "0xf88C2F983e1a4C9A01671965d458799bbbe04352", name: "eyes" },
  { address: "0xd61EA851119eb8312f8fA3455a3f41277f7A748C", name: "hat" },
];

export const app = new Frog({
  basePath: "/api",
  imageAspectRatio: "1:1",
});


app.frame("/sale/:id/:type/:block", async (c) => {
  const block = c.req.param("block");
  const id = c.req.param("id");
  const type = c.req.param("type");
  // const imgHash = c.req.param('imgHash');
  // const imgUrl = "https://lh3.googleusercontent.com/"+imgHash;
  // console.log("IMG URL: " + imgUrl)
  const contract = contracts.find((contract) => {
    return contract.name === type;
  });

  async function fetchTransferInfo() {
    console.log("TOKEN ID : " + id);
    console.log("BLOCK: " + block);
    try {
      const response = await fetch(
        `https://explorer.degen.tips/api/v2/addresses/${contract.address}/transactions`
      );
      const data = await response.json();
      // console.log("DATA: " + JSON.stringify(data));
      const info = data.items.find((tx: any) => {
        return tx.block == block;
      });
      console.log("info: " + JSON.stringify(info));

      const tokenTransferResponse = await fetch(
        `https://explorer.degen.tips/api/v2/transactions/${info.hash}/token-transfers`
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
  const targetUrl = `https://dpunks.apexdeployer.xyz/${type}`;
  const sellerUrl = `https://dpunks.vercel.app/address/${transferInfo.from}`;
  const buyerUrl = `https://dpunks.vercel.app/address/${transferInfo.to}`;
  const typeString = type === "eyes" ? type : type + "s";

  return c.res({
    image: imgUrl,
    intents: [
      <Button.Link href={sellerUrl}>seller</Button.Link>,
      <Button.Link href={buyerUrl}>buyer</Button.Link>,
      <Button.Link href={targetUrl}>{typeString}</Button.Link>
    ],
  });
});

if (import.meta.env?.MODE === "development") devtools(app, { serveStatic });
else devtools(app, { assetsPath: "/.frog" });

export const GET = handle(app);
export const POST = handle(app);
