import { connectMongoDB } from "./src/db/db";
import { runIngestionJob } from "./src/worker";

async function main() {
  try {
    await connectMongoDB();
    await runIngestionJob();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
