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

// --- Middleware Configuration ---
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Specific static routes first
router.get("/search/semantic", semanticSearch);
router.post("/generate-description", generateDescription);
router.post("/generate-details-from-image", upload.single("image"), generateDetailsFromImage);

// Collection root routes
router.route("/").get(getProperties).post(createProperty);

// Parameterized item routes
router.get("/:id/investment-analysis", getInvestmentAnalysis);
router
    .route("/:id")
    .get(getPropertyById)
    .put(updateProperty)
    .delete(deleteProperty);

module.exports = router;
