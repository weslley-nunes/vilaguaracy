try {
    const admin = require("firebase-admin");
    console.log("firebase-admin version:", admin.SDK_VERSION || "loaded");
} catch (e) {
    console.error("Require failed:", e.message);
}
