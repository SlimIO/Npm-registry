// Require Third-party Dependencies
const ava = require("ava");
const is = require("@slimio/is");

// Require Internal Dependencies
const Package = require("../src/Package");
const Registry = require("../index");

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

ava("Find a unknown Package", async(assert) => {
    const reg = new Registry();

    const error = await assert.throwsAsync(reg.package("zbllaaajfouuhh"), Error);
    assert.is(error.message, "Not found");
});
