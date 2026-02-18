const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    generateDescription,
    generateDetailsFromImage,
    semanticSearch,
    getInvestmentAnalysis,
} = require("../controllers/propertyController");

router.get("/search/semantic", semanticSearch);
router.get("/:id/investment-analysis", getInvestmentAnalysis);

router.route("/").get(getProperties).post(createProperty);

router
    .route("/:id")
    .get(getPropertyById)
    .put(updateProperty)
    .delete(deleteProperty);

router.post("/generate-description", generateDescription);

// --- Middleware Configuration ---
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router
    .route("/generate-details-from-image")
    .post(upload.single("image"), generateDetailsFromImage);

module.exports = router;
