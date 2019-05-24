require("dotenv").config();

// Require Third-party Dependencies
const ava = require("ava");
const is = require("@slimio/is");

// Require Internal Dependencies
const Package = require("../src/Package");
const Version = require("../src/Version");
const Registry = require("../index");

const invalidePacakgeName = "zbllaaajfouuhh";

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

    const error = await assert.throwsAsync(reg.userPackages(invalidePacakgeName), Error);
    assert.is(error.message, "Not Found");
});

ava("Unknown Package", async(assert) => {
    const reg = new Registry();

    const error = await assert.throwsAsync(reg.package(invalidePacakgeName), Error);
    assert.is(error.message, "Not Found");
});

ava("membership() - TypeError - Error", async(assert) => {
    const reg = new Registry();

    await assert.throwsAsync(reg.membership(10), {
        instanceOf: TypeError,
        message: "scope param must be typeof <string>"
    });

    await assert.throwsAsync(reg.membership(invalidePacakgeName), {
        instanceOf: Error,
        message: "Not Found"
    });
});

ava("membership() of npm and sindresorhus organisation", async(assert) => {
    const reg = new Registry();

    const npmMemberShip = await reg.membership("npm");
    assert.deepEqual(npmMemberShip, { npm: "owner" });

    const sindreMemberShip = await reg.membership("sindresorhus");
    assert.deepEqual(sindreMemberShip, { sindresorhus: "owner" });
});

ava("membership() of npm  organisation with Auhentication", async(assert) => {
    const reg = new Registry();

    const npmMemberShip = await reg.membership("npm", process.env.NPM_AUTH);
    assert.deepEqual(npmMemberShip, { npm: "owner" });
});

ava("search() TypeError", async(assert) => {
    const reg = new Registry();

    await assert.throwsAsync(reg.search(10), {
        instanceOf: TypeError,
        message: "searchOption should be a plainObject"
    });
});

ava("search() with empty searchOption", async(assert) => {
    const reg = new Registry();

    const search = await reg.search({});
    assert.is(search.objects.length, 0);
    assert.deepEqual(search.objects, []);
    assert.is(search.total, 0);
});

ava("search() search text", async(assert) => {
    const reg = new Registry();

    const search = await reg.search({ text: "sindresorhus" });
    assert.not(search.objects.length, 0);
    assert.not(search.total, 0);
});

ava("search() search full options", async(assert) => {
    const reg = new Registry();

    const search = await reg.search({
        text: "sindresorhus",
        size: 5,
        from: 1,
        quality: 1,
        popularity: 1,
        maintenance: 1
    });
    assert.not(search.objects.length, 0);
    assert.not(search.total, 0);
});

ava("downloads() TypeError", async(assert) => {
    const reg = new Registry();

    await assert.throwsAsync(reg.downloads(10), {
        instanceOf: TypeError,
        message: "packageName must be a string!"
    });

    await assert.throwsAsync(reg.downloads("@slimio/is", 10), {
        instanceOf: TypeError,
        message: "options must be a plain object!"
    });
});

ava("downloads() Error", async(assert) => {
    const reg = new Registry();

    await assert.throwsAsync(reg.downloads("@slimio/is", { period: "test" }), {
        instanceOf: Error,
        message: "Unknown period test"
    });

    await assert.throwsAsync(reg.downloads("@slimio/is", { type: "test" }), {
        instanceOf: Error,
        message: "options.type must be equal to <point> or <range>"
    });

    await assert.throwsAsync(reg.downloads(invalidePacakgeName), {
        instanceOf: Error,
        message: "Not Found"
    });
});

ava("downloads()", async(assert) => {
    const reg = new Registry();
    const data = await reg.downloads("@slimio/is");

    const keys = Object.keys(data);
    assert.deepEqual(keys, ["downloads", "start", "end", "package"]);
});

// ava.after("Registry DEBUG true", async(assert) => {
//     Registry.DEBUG = true;
//     const reg = new Registry();
//     const FUNC_DEBUG = ["downloads", "membership", "userPackages", "package"];

//     /* eslint-disable-next-line */
//     await Promise.all(FUNC_DEBUG.map((func) => {
//         return assert.throwsAsync(reg[func](invalidePacakgeName), {
//             instanceOf: Error,
//             message: "Not Found"
//         });
//     }));
// });

