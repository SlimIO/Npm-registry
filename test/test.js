const Registry = require("../index");

async function main() {
    const nReg = new Registry();

    // const meta = await nReg.metaData();
    // console.log(meta);

    const pkg = await nReg.userPackages("fraxken");
    console.log(pkg);

    const res = await nReg.search({
        text: "author:fraxken"
    });
    for (const sResult of res.objects) {
        console.log(sResult.package.name);
    }
}
main().catch(console.error);
