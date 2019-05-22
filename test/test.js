// Require Third-party Dependencies
const ava = require("ava");
const is = require("@slimio/is");

// Require Internal Dependencies
const Package = require("../src/Package");
const Version = require("../src/Version");
const Registry = require("../index");

// AVAILABLE PKG RIGHT
const E_RIGHT = new Set(["write", "read"]);

ava("Verify Registry.DEFAULT_URL", (assert) => {
    assert.is(typeof Registry.DEFAULT_URL, "string");
    assert.is(Registry.DEFAULT_URL, "https://registry.npmjs.org");
});

ava("Create a new Registry without URL", (assert) => {
    const reg = new Registry();
    assert.is(reg.url, Registry.DEFAULT_URL);
});

ava("Create a new Registry with a custom URL", (assert) => {
    const customURL = "http://helloworld/";
    const reg = new Registry(customURL);
    assert.is(reg.url, customURL);
});

ava("Registry constructor - url must be a string", (assert) => {
    const { message } = assert.throws(() => {
        new Registry(10);
    }, TypeError);
    assert.is(message, "url must be a string");
});

ava("Retrieve Registry metadata", async(assert) => {
    const reg = new Registry();
    const meta = await reg.metaData();

    assert.true(is.plainObject(meta));
    assert.true(is.string(meta.db_name));
    assert.true(is.number(meta.doc_count));
    assert.true(is.number(meta.doc_del_count));
    assert.true(is.number(meta.update_seq));
    assert.true(is.number(meta.purge_seq));
    assert.true(is.bool(meta.compact_running));
    assert.true(is.number(meta.disk_size));
    assert.true(is.number(meta.data_size));
    assert.true(is.string(meta.instance_start_time));
    assert.true(is.number(meta.disk_format_version));
    assert.true(is.number(meta.committed_update_seq));
});

ava("Find a given Package (without version)", async(assert) => {
    const reg = new Registry();
    const pkg = await reg.package("@slimio/is");

    assert.true(pkg instanceof Package);
    assert.is(pkg.name, "@slimio/is");
});

ava("Package name must be a string", async(assert) => {
    const reg = new Registry();

    await assert.throwsAsync(reg.package(10), {
        instanceOf: TypeError,
        message: "name must be a string"
    });
});

ava("Find a given Package version", async(assert) => {
    const reg = new Registry();
    const ver = await reg.package("eslint", "5.9.0");

    assert.true(ver instanceof Version);
    assert.is(ver.name, "eslint");
});

ava("Search user package(s)", async(assert) => {
    const reg = new Registry();
    const pkgs = await reg.userPackages("zkat");

    assert.true(is.plainObject(pkgs));
    for (const [key, value] of Object.entries(pkgs)) {
        assert.true(is.string(key));
        assert.true(E_RIGHT.has(value));
    }
});

ava("userPackages() => userName should be a string", async(assert) => {
    const reg = new Registry();

    const error = await assert.throwsAsync(reg.userPackages(10), TypeError);
    assert.is(error.message, "userName should be a string");
});

ava("Unknown user package(s)", async(assert) => {
    const reg = new Registry();

    const error = await assert.throwsAsync(reg.userPackages("zbllaaajfouuhh"), Error);
    assert.is(error.message, "Not Found");
});

ava("Unknown Package", async(assert) => {
    const reg = new Registry();

    const error = await assert.throwsAsync(reg.package("zbllaaajfouuhh"), Error);
    assert.is(error.message, "Not Found");
});

ava("membership() - scope must be a string", async(assert) => {
    const reg = new Registry();

    await assert.throwsAsync(reg.membership(10), {
        instanceOf: TypeError,
        message: "scope param must be typeof <string>"
    });
});

ava("membership() of npm and sindresorhus organisation", async(assert) => {
    const reg = new Registry();

    const npmMemberShip = await reg.membership("npm");
    assert.deepEqual(npmMemberShip, { npm: "owner" });

    const sindreMemberShip = await reg.membership("sindresorhus");
    assert.deepEqual(sindreMemberShip, { sindresorhus: "owner" });
});
