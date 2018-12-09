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

ava("Search user package(s)", async(assert) => {
    const reg = new Registry();
    const pkgs = await reg.userPackages("zkat");

    assert.true(is.plainObject(pkgs));
    for (const [key, value] of Object.entries(pkgs)) {
        assert.true(is.string(key));
        assert.true(E_RIGHT.has(value));
    }
});

ava("Unknown user package(s)", async(assert) => {
    const reg = new Registry();

    const error = await assert.throwsAsync(reg.userPackages("zbllaaajfouuhh"), Error);
    assert.is(error.message, "Scope not found");
});

ava("Unknown Package", async(assert) => {
    const reg = new Registry();

    const error = await assert.throwsAsync(reg.package("zbllaaajfouuhh"), Error);
    assert.is(error.message, "Not found");
});

ava("membership() TypeError", async(assert) => {
    const scope = "npm";
    const username = "test";
    const password = "azerty";
    const reg = new Registry();

    const errors = [];
    const promises = [];

    promises.push(assert.throwsAsync(reg.membership(10), TypeError));
    errors.push("scope param must be typeof <string>");

    promises.push(assert.throwsAsync(reg.membership(scope, 10), TypeError));
    errors.push("login param must be typeof <object>");

    promises.push(assert.throwsAsync(reg.membership(scope, {}), TypeError));
    errors.push("login.username param must be typeof <string>");

    promises.push(assert.throwsAsync(reg.membership(scope, { username }), TypeError));
    errors.push("login.password param must be typeof <string>");

    // Real utility ? Make test longer
    promises.push(assert.throwsAsync(reg.membership(scope, { username, password }), Error));
    errors.push("HTTPError: Response code 500 (Internal Server Error)");

    const responses = await Promise.all(promises);
    for (const res of responses) {
        assert.is(res.message, errors.shift());
    }
});

ava("membership()", async(assert) => {
    const reg = new Registry();

    const npmMembership = await reg.membership("npm");
    assert.deepEqual(npmMembership, { npm: "owner" });
    // test with username/password
});
