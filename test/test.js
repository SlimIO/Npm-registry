const Registry = require("../index");

async function main() {
    const nReg = new Registry();

    // const meta = await nReg.metaData();
    // console.log(meta);

    const pkg = await nReg.package("@slimio/config");
}
main().catch(console.error);
