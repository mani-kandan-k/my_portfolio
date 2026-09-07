-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT '',
    "avatarPath" TEXT NOT NULL DEFAULT '',
    "faviconPath" TEXT NOT NULL DEFAULT '',
    "resumePath" TEXT NOT NULL DEFAULT '/assets/resume.pdf',
    "contactEmail" TEXT NOT NULL DEFAULT '',
    "primaryColor" TEXT NOT NULL DEFAULT '#4f46e5',
    "accentColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "seoOgImagePath" TEXT NOT NULL DEFAULT '',
    "seoOverrides" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("accentColor", "avatarPath", "contactEmail", "faviconPath", "id", "name", "primaryColor", "resumePath", "role", "seoDescription", "seoOgImagePath", "seoTitle", "tagline", "updatedAt") SELECT "accentColor", "avatarPath", "contactEmail", "faviconPath", "id", "name", "primaryColor", "resumePath", "role", "seoDescription", "seoOgImagePath", "seoTitle", "tagline", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
