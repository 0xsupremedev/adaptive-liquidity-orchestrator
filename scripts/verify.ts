import { run } from "hardhat";

async function main() {
    const contractAddress = process.argv[2];
    const constructorArgs = process.argv.slice(3);

    if (!contractAddress) {
        console.error("Please provide contract address as argument");
        console.log("Usage: npx hardhat run scripts/verify.ts --network opbnb-testnet <CONTRACT_ADDRESS> [CONSTRUCTOR_ARGS...]");
        process.exit(1);
    }

    console.log("Verifying contract:", contractAddress);
    console.log("Constructor args:", constructorArgs);

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArgs,
        });
        console.log("✅ Contract verified successfully!");
    } catch (error: any) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Contract is already verified!");
        } else {
            console.error("Verification failed:", error);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
